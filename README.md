# Webhook Shuriken

A lightweight webhook listener and viewer for Adyen notifications.

Webhook Shuriken is a simple Node.js application that receives Adyen webhooks and provides a browser-based interface for viewing and searching notification events.

## Features

- Receive Adyen standard webhooks
- View webhook events in a web browser
- Search and filter notifications
- In-memory event storage
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
/webhooks
  |
  +--> In-memory event store
  |
  +--> Viewer UI (/)
```

## Important Notes

Webhook events are stored in memory only.

- No database required
- No file storage required
- Events are lost when the application restarts
- Intended for development, testing, demos, and troubleshooting

## Use Cases

- Adyen integration testing
- Webhook troubleshooting
- Demo environments
- Merchant support investigations
- Training and workshops
```
