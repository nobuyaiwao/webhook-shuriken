#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

APP_NAME="${1:-webhook-shuriken}"
NUM_LINES="${2:-1500}"

PREFIX="WEBHOOK_RESTORE "
OUTPUT_FILE="$SCRIPT_DIR/restore.jsonl"

heroku logs \
  --app "$APP_NAME" \
  --num "$NUM_LINES" \
  2>/dev/null \
| grep "$PREFIX" \
| sed "s/^.*$PREFIX//" \
> "$OUTPUT_FILE"

echo "Exported webhook logs to: $OUTPUT_FILE"
