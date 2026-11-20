"""Stop hook: don't let Claude finish while the test suite fails.

- Code changed (uncommitted, or committed on this branch) and tests fail: exit 2, so
  Claude keeps working (stderr goes to Claude).
- stop_hook_active is true: Claude is already continuing because of this hook, so allow
  the stop. This prevents an endless loop; Claude reports the failure to you instead.
- No test command, or only docs changed: allow the stop.
"""
import json
import os
import shutil
import subprocess
import sys

DOC_EXT = {".md", ".mdx", ".txt", ".rst"}


def test_command(root):
    pkg = os.path.join(root, "package.json")
    if os.path.exists(pkg):
        with open(pkg, encoding="utf-8") as f:
            scripts = json.load(f).get("scripts", {})
        if "test" in scripts and "no test specified" not in scripts["test"]:
            return ["npm", "test", "--silent"]
    if os.path.exists(os.path.join(root, "pyproject.toml")) or os.path.isdir(os.path.join(root, "tests")):
        if shutil.which("pytest"):
            return ["pytest", "-q"]
        return [sys.executable, "-m", "unittest", "discover", "-s", "tests"]
    return None


def git(root, *args):
    exe = shutil.which("git")
    if not exe:
        return None
    out = subprocess.run([exe, *args], cwd=root, capture_output=True, text=True)
    return out.stdout if out.returncode == 0 else None


def default_branch(root):
    ref = git(root, "symbolic-ref", "--short", "refs/remotes/origin/HEAD")
    if ref:
        return ref.strip()
    for name in ("origin/main", "origin/master", "main", "master"):
        if git(root, "rev-parse", "--verify", "--quiet", name) is not None:
            return name
    return None


def changed_files(root):
    """Files changed in the working tree plus files changed on this branch."""
    status = git(root, "status", "--porcelain")
    if status is None:
        return None  # not a git repo: assume changes
    files = {line[3:].strip().strip('"') for line in status.splitlines() if line.strip()}
    base = default_branch(root)
    if base:
        diff = git(root, "diff", "--name-only", f"{base}...HEAD")
        if diff:
            files.update(line.strip() for line in diff.splitlines() if line.strip())
    return files


def only_docs(files):
    return all(os.path.splitext(f)[1].lower() in DOC_EXT for f in files)


def main():
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0
    if data.get("stop_hook_active"):
        return 0
    root = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or os.getcwd()
    cmd = test_command(root)
    if not cmd:
        return 0
    files = changed_files(root)
    if files is not None and (not files or only_docs(files)):
        return 0
    exe = shutil.which(cmd[0]) or cmd[0]
    env = {**os.environ, "CI": "1"}  # no watch mode, plain output
    try:
        result = subprocess.run([exe, *cmd[1:]], cwd=root, capture_output=True, text=True, timeout=580, env=env)
    except (OSError, subprocess.TimeoutExpired) as exc:
        print(f"Couldn't run the tests ({exc}). Tell me instead of saying it's done.", file=sys.stderr)
        return 2
    if result.returncode != 0:
        tail = (result.stdout + result.stderr)[-4000:]
        print("Tests are failing, so the work isn't done. Fix them (never by weakening tests):\n" + tail, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
