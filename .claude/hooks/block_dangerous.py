"""PreToolUse hook: block destructive commands and secret reads.

Covers the Bash and PowerShell tools (both exist on Windows) plus Read and Grep.
Exit 2 blocks the tool call and sends stderr to Claude. Exit 0 allows it.
(Exit 1 does NOT block reliably - that's a common mistake.)
"""
import json
import re
import sys

# A .env file name that isn't .env.example / .env.sample / .env.template.
ENV_FILE = r"(?<!\w)\.env(?!\.(example|sample|template)\b)(\.[\w-]+)?\b"

BLOCKED_COMMANDS = [
    (r"\brm\s+-[a-zA-Z]*r[a-zA-Z]*f|\brm\s+-[a-zA-Z]*f[a-zA-Z]*r|\brm\s+(-\S+\s+)*--recursive\b.*--force\b", "recursive force delete"),
    (r"\b(Remove-Item|ri|rm|del|rd|rmdir)\b[^|;&]*-Recurse\b", "recursive delete (PowerShell)"),
    (r"\b(rmdir|rd|del)\s+/[sq]\b", "recursive delete (cmd)"),
    (r"\bgit\s+push\b[^|;&]*(\s--force\b|\s--force-with-lease\b|\s-f\b|\s\+\S)", "force push"),
    (r"\bgit\s+reset\s+--hard\b", "hard reset"),
    (r"\bgit\s+clean\s+-[a-zA-Z]*f", "git clean"),
    (r"\b(drop|truncate)\s+(table|schema|database)\b", "destructive SQL"),
    (r"--no-verify\b", "skipping git hooks"),
    # Reading secrets files, however it's done.
    (r"\b(cat|type|more|less|head|tail|bat|gc|Get-Content|grep|rg|sed|awk|findstr|Select-String|strings|xxd|od|cp|copy|Copy-Item|base64)\b[^|;&]*" + ENV_FILE, "reading a .env file"),
    (r"\b(open|read_text|readFileSync|readFile|ReadAllText|load_dotenv|dotenv_values)\b[^|;&]*" + ENV_FILE, "reading a .env file"),
    (r"<\s*\S*" + ENV_FILE, "reading a .env file"),
    # Dumping the environment.
    (r"(^|[|;&]\s*)(printenv|env|set|export\s+-p|declare\s+-x)\s*($|[|;&>])", "printing environment variables"),
    (r"\b(Get-ChildItem|gci|ls|dir)\s+env:", "printing environment variables (PowerShell)"),
    (r"\[(System\.)?Environment\]::GetEnvironmentVariables", "printing environment variables (PowerShell)"),
    # Printing one secret.
    (r"\b(echo|printf|print|Write-Output|Write-Host|cat)\b[^|;&]*\$(\{|env:)?\w*(KEY|TOKEN|SECRET|PASSWORD|PAT)\w*", "printing a secret"),
    (r"\$env:\w*(KEY|TOKEN|SECRET|PASSWORD|PAT)\w*\s*($|[|;&])", "printing a secret"),
    (r"\bprintenv\s+\w*(KEY|TOKEN|SECRET|PASSWORD|PAT)\w*", "printing a secret"),
    (r"\bgh\s+auth\s+(token|status\s+[^|;&]*--show-token|status\s+[^|;&]*-t\b)", "printing the GitHub token"),
]
SECRET_PATH = re.compile(r"(^|[\\/])" + ENV_FILE + r"$", re.IGNORECASE)


def check(tool: str, tool_input: dict) -> str | None:
    """Return the reason to block, or None to allow."""
    if tool == "Read":
        path = str(tool_input.get("file_path", ""))
        if SECRET_PATH.search(path):
            return f"reading {path}. Secrets stay out of the conversation; use .env.example for key names"
        return None

    if tool == "Grep":
        for key in ("path", "glob"):
            value = str(tool_input.get(key, "") or "")
            if SECRET_PATH.search(value) or re.search(r"\.env\*?$", value):
                return f"searching {value}. Secrets stay out of the conversation"
        return None

    if tool in ("Bash", "PowerShell"):
        command = str(tool_input.get("command", ""))
        for pattern, why in BLOCKED_COMMANDS:
            if re.search(pattern, command, re.IGNORECASE | re.MULTILINE):
                return f"{why}: {command}"
    return None


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("Blocked: hook got unreadable input.", file=sys.stderr)
        return 2
    reason = check(data.get("tool_name", ""), data.get("tool_input") or {})
    if reason:
        print(f"Blocked ({reason})\nAsk me to run this myself if it's really needed.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
