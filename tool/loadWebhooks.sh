#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$PROJECT_ROOT/.env"

TARGET="${1:-webhook-shuriken}"
JSONL_FILE="${2:-$PROJECT_ROOT/tool/restore.jsonl}"

VIEWER_USERNAME="${VIEWER_USERNAME:?Missing VIEWER_USERNAME}"
VIEWER_PASSWORD="${VIEWER_PASSWORD:?Missing VIEWER_PASSWORD}"

if [ "$TARGET" = "local" ]; then
    WEBHOOK_URL="${LOCAL_WEBHOOK_URL:-http://localhost:3000}"
else
    WEBHOOK_URL="https://${TARGET}.herokuapp.com"
fi

if [ ! -f "$JSONL_FILE" ]; then
    echo "File not found: $JSONL_FILE" >&2
    exit 1
fi

echo "Loading webhook records to: $WEBHOOK_URL"

curl -sS \
  -u "$VIEWER_USERNAME:$VIEWER_PASSWORD" \
  -X POST "$WEBHOOK_URL/api/webhooks/load" \
  -H "Content-Type: text/plain" \
  --data-binary @"$JSONL_FILE"

echo
