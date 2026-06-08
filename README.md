# Webhook Shuriken

A lightweight webhook listener and viewer for Adyen notifications.

Webhook Shuriken receives Adyen webhooks, stores them locally, and provides a simple web interface for browsing and troubleshooting webhook events.

## Features

- Receive Adyen standard webhooks
- Store webhook events locally in JSONL format
- Fast in-memory cache for recent events
- Web-based viewer UI
- Search and filter webhook events
- Automatic cleanup of old records
- Separate authentication for:
  - Webhook listener endpoint
  - Viewer interface
- Lightweight Node.js implementation
- Easy deployment to Heroku

---

## Architecture

```text
Adyen
  |
  v
/webhooks
  |
  +--> In-memory cache
  |
  +--> data/webhooks.jsonl
  |
  +--> Viewer UI (/)
```

---

## Requirements

- Node.js 18+
- npm

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd webhook-shuriken
```

Install dependencies:

```bash
npm install
```

---

## Configuration

Create a `.env` file:

```env
PORT=3000

LISTENER_USERNAME=listener
LISTENER_PASSWORD=listener-password

VIEWER_USERNAME=viewer
VIEWER_PASSWORD=viewer-password
```

---

## Running Locally

```bash
npm start
```

Open:

```text
http://localhost:3000
```

---

## Configuring Adyen

Configure the following URL in the Adyen Customer Area:

```text
https://your-domain.com/webhooks
```

Use the Listener credentials configured in your `.env` file.

Webhook Shuriken supports standard Adyen Notification webhooks.

Example payload:

```json
{
  "live": "false",
  "notificationItems": [
    {
      "NotificationRequestItem": {
        "eventCode": "AUTHORISATION",
        "success": "true",
        "pspReference": "ABC123"
      }
    }
  ]
}
```

Successful processing returns:

```text
[accepted]
```

---

## Data Storage

Webhook events are stored in:

```text
data/webhooks.jsonl
```

Each line contains a single JSON object.

Example:

```json
{
  "receivedAt": "2026-06-08T03:15:00.000Z",
  "eventCode": "AUTHORISATION",
  "success": "true",
  "pspReference": "ABC123"
}
```

---

## Retention Policy

Default settings:

- Retention period: 14 days
- Maximum in-memory records: 5,000

These values can be modified in `index.js`.

---

## Authentication

### Listener Endpoint

Protects incoming webhook requests.

```text
POST /webhooks
```

Uses HTTP Basic Authentication.

### Viewer Interface

Protects access to the viewer UI.

```text
GET /
```

Uses HTTP Basic Authentication.

---

## Deployment to Heroku

Create an application:

```bash
heroku create webhook-shuriken
```

Configure environment variables:

```bash
heroku config:set LISTENER_USERNAME=listener
heroku config:set LISTENER_PASSWORD=*****
heroku config:set VIEWER_USERNAME=viewer
heroku config:set VIEWER_PASSWORD=*****
```

Deploy:

```bash
git push heroku main
```

---

## Directory Structure

```text
.
├── auth.js
├── index.js
├── package.json
├── public
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── asset
│       └── favicon.ico
└── data
    └── webhooks.jsonl
```

---

## Use Cases

Webhook Shuriken is useful for:

- Adyen integration testing
- Webhook troubleshooting
- Monitoring webhook delivery
- Investigating payment lifecycle events
- Demonstrations and workshops
- Merchant support activities

---

## Disclaimer

Webhook Shuriken is intended for development, testing, and troubleshooting purposes.

For production-grade logging and long-term retention, consider forwarding webhook events to a database, SIEM, or centralized logging platform.
