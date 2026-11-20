---
name: ticket
description: Take a GitHub issue from spec to an open PR using the planner, builder, tester and reviewer subagents. Use when I say /ticket <issue> or "work on issue N".
argument-hint: <issue-number>
disable-model-invocation: true
---

# /ticket $ARGUMENTS

1. Fetch issue #$ARGUMENTS with the GitHub MCP server (fallback: `gh issue view $ARGUMENTS`).
2. Find the default branch (`git symbolic-ref --short refs/remotes/origin/HEAD`, else `origin/main`/`origin/master`).
   `git fetch origin`. Stop if the working tree isn't clean.
3. Run the **planner** subagent with the issue text. Save its spec to `docs/specs/$ARGUMENTS.md`.
4. **Stop and show me the spec.** Wait for "approved" or my edits.
5. Create branch `t$ARGUMENTS-<short-slug>` from the up-to-date default branch. Commit the spec on it.
   Run the **builder** subagent with the spec.
6. Run the **tester** subagent. If tests fail, send the failures back to the builder. At most 3 rounds, then stop and tell me.
7. Run the **reviewer** subagent. Send real problems back to the builder (1 round), then re-run the tester.
8. Run `npm test` yourself (with `CI=1`) and confirm it's green. Never open a PR on red.
9. `git push -u origin <branch>` and open a PR with the GitHub MCP server (fallback: `gh pr create`).
   PR body: `Closes #$ARGUMENTS`, the spec's Goal, what changed, test results, reviewer notes left open.
   No co-author or "Generated with" lines in commits or the PR.
10. Ping my phone: `python "$CLAUDE_PROJECT_DIR/.claude/hooks/notify_phone.py" "PR ready: <url>"`.
11. Tell me the PR link in one line.
