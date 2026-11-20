"""Tester-only PreToolUse hook: the tester may create or edit test files and nothing else.

Registered in the tester agent's frontmatter, so it only runs while the tester runs.
Exit 2 blocks the write and tells the tester why.
"""
import json
import re
import sys

TEST_PATH = re.compile(
    r"(\.(test|spec)\.[cm]?[jt]sx?$)"  # foo.test.ts, foo.spec.tsx
    r"|(^|[\\/])(__tests__|tests?)[\\/]"  # __tests__/, tests/, test/
    r"|(^|[\\/])test_[^\\/]+\.py$|_test\.py$"  # pytest
    r"|(^|[\\/])(vitest|jest)\.setup\.[cm]?[jt]s$",  # test setup files
    re.IGNORECASE,
)


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("Blocked: hook got unreadable input.", file=sys.stderr)
        return 2
    tool_input = data.get("tool_input") or {}
    path = str(tool_input.get("file_path") or tool_input.get("notebook_path") or "")
    if TEST_PATH.search(path):
        return 0
    print(
        f"Blocked: the tester only edits test files, and {path or 'this file'} isn't one. "
        "Report the source problem so the builder can fix it.",
        file=sys.stderr,
    )
    return 2


if __name__ == "__main__":
    sys.exit(main())
