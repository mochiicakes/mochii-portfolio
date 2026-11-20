---
name: release
description: Prepare a release - changelog, version bump, tag. Use when I say /release.
disable-model-invocation: true
---

# /release

1. List merged PRs since the last tag (`git describe --tags --abbrev=0`, then `gh pr list --state merged --search "merged:>=<tag date>"`).
2. Pick the version bump (patch: fixes only; minor: new features; major: breaking). Tell me which and why.
3. Update CHANGELOG.md with grouped entries (Added, Changed, Fixed).
4. Bump the version in package.json (and app.json for Expo apps).
5. Run the tests. Stop if anything fails.
6. Commit `release: vX.Y.Z` and show me the tag command. Don't push the tag until I say so.
