#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$PROJECT_ROOT/.env"

APP_NAME="${1:-webhook-shuriken}"
JSONL_FILE="${2:-$PROJECT_ROOT/tool/restore.jsonl}"

VIEWER_USERNAME="${VIEWER_USERNAME:?Missing VIEWER_USERNAME}"
VIEWER_PASSWORD="${VIEWER_PASSWORD:?Missing VIEWER_PASSWORD}"

if [ ! -f "$JSONL_FILE" ]; then
    echo "File not found: $JSONL_FILE" >&2
    exit 1
fi

curl -sS \
  -u "$VIEWER_USERNAME:$VIEWER_PASSWORD" \
  -X POST "https://${APP_NAME}.herokuapp.com/api/webhooks/load" \
  -H "Content-Type: text/plain" \
  --data-binary @"$JSONL_FILE"

echo
