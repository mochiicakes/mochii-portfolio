"""Notification hook: send Claude Code's notification to my phone through the n8n webhook.

Uses N8N_PHONE_ALERT_WEBHOOK if set, else the local phone-alert workflow from Phase 0.
Never blocks. Also usable directly, e.g. from /ticket when a PR opens:
    python .claude/hooks/notify_phone.py "PR ready: <url>"
"""
import json
import os
import sys
import urllib.request

DEFAULT_WEBHOOK = "http://localhost:5678/webhook/phone-alert"


def main() -> int:
    if len(sys.argv) > 1:
        data = {"message": " ".join(sys.argv[1:])}
    else:
        try:
            data = json.load(sys.stdin)
        except json.JSONDecodeError:
            data = {}
    url = os.environ.get("N8N_PHONE_ALERT_WEBHOOK") or DEFAULT_WEBHOOK
    project = os.path.basename(os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or os.getcwd())
    message = f"[{project}] {data.get('message') or 'Claude needs you'}"
    body = json.dumps({"message": message, "source": "claude-code", "project": project}).encode()
    try:
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass  # a missed phone ping must never break the session
    return 0


if __name__ == "__main__":
    sys.exit(main())
