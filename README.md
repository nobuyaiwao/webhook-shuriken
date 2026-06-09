# Webhook Shuriken

A lightweight webhook listener and viewer for Adyen notifications.

Webhook Shuriken is a simple Node.js application that receives Adyen webhooks and provides a browser-based interface for viewing and searching notification events.

## Features

- Receive Adyen standard webhooks
- View webhook events in a web browser
- Search and filter notifications
- In-memory event storage
- Optional recovery from Heroku application logs
- Separate authentication for:
  - Webhook listener endpoint
  - Viewer interface
- Lightweight and easy to deploy
- Heroku compatible

## Architecture

```text
Adyen
  |
  v
/listener
  |
  +--> In-memory event store
  |
  +--> Recovery log (WEBHOOK_RESTORE)
  |
  +--> Viewer UI (/)
```

## Important Notes

Webhook events are primarily stored in memory.

- No database required
- No persistent file storage required
- Events are lost when the application restarts
- Optional recovery is available using Heroku application logs
- Intended for development, testing, demos, and troubleshooting

The recovery mechanism uses specially formatted log entries (`WEBHOOK_RESTORE`) written to the application log stream. Stored events can later be exported and reloaded into memory.

This is not intended to replace a real database and should not be considered permanent storage.

## Recovery Tools

The `tool` directory contains helper scripts for exporting and restoring webhook events.

### Export events from Heroku logs

```bash
./tool/log2json.sh
```

This creates:

```text
restore.jsonl
```

Each line contains a single webhook record in JSON format.

### Restore events into memory

```bash
./tool/loadWebhooks.sh
```

The script uploads `restore.jsonl` to the running application and repopulates the in-memory webhook store.

### Typical workflow

```bash
./tool/log2json.sh
./tool/loadWebhooks.sh
```

## Use Cases

- Adyen integration testing
- Webhook troubleshooting
- Demo environments
- Merchant support investigations
- Training and workshops
- Temporary webhook retention without a database

## Limitations

- Recovery depends on Heroku log retention
- Very large webhook payloads may exceed log size limits
- Log-based recovery is intended for convenience, not long-term storage
- Not suitable for production audit or compliance requirements
