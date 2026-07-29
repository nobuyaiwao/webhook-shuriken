const { spawn } = require('child_process');
const got = require('got');
const test = require('tape');

// Start the app
const env = Object.assign({}, process.env, {
  PORT: 5000,
  LISTENER_USERNAME: 'listener',
  LISTENER_PASSWORD: 'listener-password',
  VIEWER_USERNAME: 'viewer',
  VIEWER_PASSWORD: 'viewer-password'
});
const child = spawn('node', ['index.js'], {env});

test('serves the viewer and summarizes recurring token webhooks', (t) => {
  child.stdout.once('data', async () => {
    try {
      const response = await got('http://127.0.0.1:5000', {
        username: 'viewer',
        password: 'viewer-password'
      });

      t.equal(response.statusCode, 200);
      t.notEqual(response.body.indexOf('<title>Adyen Webhook Viewer</title>'), -1);
      t.notEqual(response.body.indexOf('<h1>Adyen Webhook Viewer</h1>'), -1);

      const webhook = {
        createdAt: '2026-07-28T08:03:35+02:00',
        environment: 'test',
        type: 'recurring.token.created',
        data: {
          merchantAccount: 'NobuyaIwaoCOM'
        },
        eventId: 'KHM36NDM6KFJCK75'
      };
      const listenerResponse = await got.post('http://127.0.0.1:5000/listener', {
        username: 'listener',
        password: 'listener-password',
        json: webhook
      });
      const webhooksResponse = await got('http://127.0.0.1:5000/api/webhooks', {
        username: 'viewer',
        password: 'viewer-password',
        responseType: 'json'
      });
      const [summary] = webhooksResponse.body;

      t.equal(listenerResponse.body, '[accepted]');
      t.equal(summary.eventDate, webhook.createdAt);
      t.equal(summary.environment, webhook.environment);
      t.equal(summary.eventCode, webhook.type);
      t.equal(summary.merchantAccount, webhook.data.merchantAccount);
      t.equal(summary.pspReference, webhook.eventId);
    } catch (err) {
      t.error(err);
    } finally {
      child.kill();
      t.end();
    }
  });
});
