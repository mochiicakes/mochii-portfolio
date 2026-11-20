---
name: fix-ci
description: Diagnose and fix a failing CI run on the current branch. Use when I say /fix-ci or "CI is red".
---

# /fix-ci

1. Get the latest failed run for this branch: `gh run list --branch <branch> --status failure --limit 1`, then
   `gh run view <id> --log-failed` (fallback: the GitHub MCP actions tools).
2. Find the first real error, not the cascade after it. Quote it.
3. Reproduce it locally with the same command.
4. State the cause in one sentence before changing anything.
5. Fix it with the smallest change. Never skip, delete or weaken a test.
6. Re-run locally, push (never force), and report the new run's status (`gh run watch`).
