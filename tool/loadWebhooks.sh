#!/usr/bin/env bash
set -euo pipefail
source .env

APP_NAME="${1:-webhook-shuriken}"
JSONL_FILE="${2:-restore.jsonl}"

VIEWER_USERNAME="${VIEWER_USERNAME:?Missing VIEWER_USERNAME}"
VIEWER_PASSWORD="${VIEWER_PASSWORD:?Missing VIEWER_PASSWORD}"

curl -sS \
  -u "$VIEWER_USERNAME:$VIEWER_PASSWORD" \
  -X POST "https://${APP_NAME}.herokuapp.com/api/webhooks/load" \
  -H "Content-Type: text/plain" \
  --data-binary @"$JSONL_FILE"
