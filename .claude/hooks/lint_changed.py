"""PostToolUse hook: format and lint the file Claude just wrote or edited.

Uses the repo's own tools from node_modules/.bin (prettier, eslint) or ruff for Python,
and skips any that aren't installed. Formatting is silent. Lint errors exit 2 so Claude
sees them and fixes them; the edit itself already happened.
"""
import json
import os
import shutil
import subprocess
import sys

FORMAT_EXT = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".json", ".css", ".scss", ".md", ".html"}
LINT_EXT = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"}


def local_bin(root: str, name: str) -> str | None:
    """Find a tool in the repo's node_modules/.bin (.cmd shim on Windows)."""
    bin_dir = os.path.join(root, "node_modules", ".bin")
    for candidate in (name + ".cmd", name) if os.name == "nt" else (name,):
        path = os.path.join(bin_dir, candidate)
        if os.path.exists(path):
            return path
    return None


def run(exe: str, args: list[str], cwd: str) -> subprocess.CompletedProcess:
    return subprocess.run([exe, *args], cwd=cwd, capture_output=True, text=True, timeout=50)


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0
    path = (data.get("tool_input") or {}).get("file_path")
    if not path or not os.path.isfile(path):
        return 0
    root = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or os.getcwd()
    ext = os.path.splitext(path)[1].lower()
    problems = ""

    try:
        if ext in FORMAT_EXT:
            prettier = local_bin(root, "prettier")
            if prettier:
                run(prettier, ["--write", "--ignore-unknown", path], root)
        if ext in LINT_EXT:
            eslint = local_bin(root, "eslint")
            if eslint:
                result = run(eslint, ["--fix", "--no-warn-ignored", path], root)
                if result.returncode != 0:
                    problems = f"eslint found problems in {path}:\n{(result.stdout or result.stderr)[-3000:]}"
        elif ext == ".py" and shutil.which("ruff"):
            run(shutil.which("ruff"), ["format", path], root)
            result = run(shutil.which("ruff"), ["check", "--fix", path], root)
            if result.returncode != 0:
                problems = f"ruff found problems in {path}:\n{result.stdout[-3000:]}"
    except (OSError, subprocess.TimeoutExpired):
        return 0  # a broken linter must never break the session

    if problems.strip():
        print(problems, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
