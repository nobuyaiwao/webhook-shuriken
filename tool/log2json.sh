#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:-webhook-shuriken}"
NUM_LINES="${2:-1500}"

PREFIX="WEBHOOK_RESTORE "

heroku logs \
  --app "$APP_NAME" \
  --num "$NUM_LINES" \
  2>/dev/null \
| grep "$PREFIX" \
| sed "s/^.*$PREFIX//" > restore.jsonl
