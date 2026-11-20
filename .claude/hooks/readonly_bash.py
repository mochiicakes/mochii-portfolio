"""Reviewer-only PreToolUse hook: shell commands must be read-only.

Registered in the reviewer agent's frontmatter. Only allowlisted read commands run;
anything else (or any redirect / chaining) exits 2.
"""
import json
import re
import sys

ALLOWED = [
    r"git\s+(diff|log|show|status|blame|rev-parse|merge-base|ls-files)\b",
    r"git\s+branch(\s+(-a|-r|-v|-vv|--list|--show-current))*\s*$",
    r"git\s+symbolic-ref(\s+(--short|-q))*\s+\S+\s*$",  # one argument reads; two would write
    r"git\s+remote(\s+(-v|show\s+\S+))?\s*$",
    r"gh\s+(pr|issue|run)\s+(view|diff|list|checks)\b",
    r"gh\s+repo\s+view\b",
    r"(npm|npx)\s+(test|run\s+(test|lint|typecheck))\b",
    r"npx\s+(tsc\s+--noEmit|eslint|vitest\s+run)\b",
]
# Redirects, chaining and substitution could hide a write behind an allowed prefix.
# A single pipe into a read-only filter is fine.
UNSAFE = re.compile(r"[;&`]|\$\(|>|--output\b|\|(?!\s*(head|tail|grep|wc|sort|uniq|cat)\b)")


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("Blocked: hook got unreadable input.", file=sys.stderr)
        return 2
    command = str((data.get("tool_input") or {}).get("command", "")).strip()
    if not UNSAFE.search(command) and any(re.match(p, command) for p in ALLOWED):
        return 0
    print(
        f"Blocked: the reviewer is read-only. `{command}` isn't on the read-only list "
        "(git diff/log/show/status, gh pr/issue view, running tests or lint).",
        file=sys.stderr,
    )
    return 2


if __name__ == "__main__":
    sys.exit(main())
