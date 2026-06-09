const express = require('express');
const bodyParser = require('body-parser');
const { listenerAuth, viewerAuth } = require('./auth');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;

const app = express();

const DATA_DIR = path.join(__dirname, 'data');
const WEBHOOK_LOG_FILE = path.join(DATA_DIR, 'webhooks.jsonl');

const WEBHOOK_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_WEBHOOKS = 5000;
const webhookStore = [];

app.use(bodyParser.json());

// Webhook Restore Data in logs
const WEBHOOK_RESTORE_LOG_PREFIX = 'WEBHOOK_RESTORE';
function logWebhookRecord(webhook) {
    try {
        console.log(
            `${WEBHOOK_RESTORE_LOG_PREFIX} ${JSON.stringify(webhook)}`
        );
    } catch (err) {
        console.error('Failed to write webhook restore log:', err);
    }
}

// Extract Webhooks Summary
function extractWebhookSummary(body) {
    const item = body?.notificationItems?.[0]?.NotificationRequestItem || {};

    return {
        environment: body?.live === true || body?.live === 'true' ? 'LIVE' : 'TEST',
        merchantAccount: item.merchantAccountCode || '',
        eventCode: item.eventCode || '',
        eventDate: item.eventDate || '',
        pspReference: item.pspReference || '',
        originalReference: item.originalReference || '',
        merchantReference: item.merchantReference || '',
        paymentMethod: item.paymentMethod || '',
        success: item.success || '',
        amountCurrency: item.amount?.currency || '',
        amountValue: item.amount?.value ?? ''
    };
}

// Clean up WebhookStore
function cleanupWebhookStore() {
    const cutoff = Date.now() - WEBHOOK_TTL_MS;

    for (let i = webhookStore.length - 1; i >= 0; i--) {
        const receivedAt = new Date(webhookStore[i].receivedAt).getTime();

        if (receivedAt < cutoff) {
            webhookStore.splice(i, 1);
        }
    }

    if (webhookStore.length > MAX_WEBHOOKS) {
        webhookStore.splice(MAX_WEBHOOKS);
    }
}

// Add Webhooks
//function addWebhook({ body, headers, ip }) {
function addWebhook({ body, ip }) {
    const summary = extractWebhookSummary(body);

    const webhook = {
        id: crypto.randomUUID(),
        receivedAt: new Date().toISOString(),
        ip,
        ...summary,
        //headers,
        body
    };

    webhookStore.unshift(webhook);
    logWebhookRecord(webhook);
    cleanupWebhookStore();

    return webhook;
}

setInterval(cleanupWebhookStore, 60 * 60 * 1000);

app.post('/listener', listenerAuth, function(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    addWebhook({
        body: req.body,
        //headers: req.headers,
        ip
    });

//   console.log(`Request IP: ${ip}`);
//   console.log(JSON.stringify(req.body, null, '   '));
//    console.log(`WEBHOOK_RESTORE ${JSON.stringify(record)}`);

    res.send('[accepted]');
});

//app.get('/api/webhooks', viewerAuth, function(req, res) {
//    const summaries = webhookStore.map(({ body, headers, ...summary }) => summary);
//
//    res.json(summaries);
//});
app.get('/api/webhooks', viewerAuth, function(req, res) {

    const {
        environment,
        merchantAccount,
        eventCode
    } = req.query;

    const summaries = webhookStore
        .filter(webhook =>
            !environment ||
            webhook.environment === environment
        )
        .filter(webhook =>
            !merchantAccount ||
            webhook.merchantAccount === merchantAccount
        )
        .filter(webhook =>
            !eventCode ||
            webhook.eventCode === eventCode
        )
        .map(({ body, headers, ...summary }) => summary);

    res.json(summaries);
});

app.get('/api/filter-options', viewerAuth, function(req, res) {

    res.json({
        environments: [...new Set(
            webhookStore.map(item => item.environment)
        )].sort(),

        merchantAccounts: [...new Set(
            webhookStore.map(item => item.merchantAccount)
        )].sort(),

        eventCodes: [...new Set(
            webhookStore.map(item => item.eventCode)
        )].sort()
    });
});

app.get('/api/webhooks/:id', viewerAuth, function(req, res) {
    const webhook = webhookStore.find(item => item.id === req.params.id);

    if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json(webhook);
});

app.post('/api/webhooks/load', viewerAuth, express.text({ type: '*/*', limit: '10mb' }), (req, res) => {
    const lines = req.body
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    let loaded = 0;
    let skipped = 0;

    for (const line of lines) {
        try {
            const webhook = JSON.parse(line);

            if (!webhook.id) {
                skipped++;
                continue;
            }

            const exists = webhookStore.some(item => item.id === webhook.id);

            if (exists) {
                skipped++;
                continue;
            }

            webhookStore.push(webhook);
            loaded++;
        } catch (err) {
            skipped++;
        }
    }

    webhookStore.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
    cleanupWebhookStore();

    res.json({
        result: 'ok',
        loaded,
        skipped,
        total: webhookStore.length
    });
});

app.use(viewerAuth);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Listening over ${PORT}`));
