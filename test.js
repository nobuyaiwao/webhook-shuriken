const { spawn } = require('child_process');
const net = require('net');
const got = require('got');
const test = require('tape');

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', reject);
    server.listen(0, () => {
      const { port } = server.address();

      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

test('serves the viewer and summarizes recurring token webhooks', (t) => {
  (async () => {
    const port = await getAvailablePort();
    const baseUrl = `http://127.0.0.1:${port}`;
    const env = Object.assign({}, process.env, {
      PORT: port,
      LISTENER_USERNAME: 'listener',
      LISTENER_PASSWORD: 'listener-password',
      VIEWER_USERNAME: 'viewer',
      VIEWER_PASSWORD: 'viewer-password'
    });
    const child = spawn('node', ['index.js'], { cwd: __dirname, env });

    child.stdout.once('data', async () => {
      try {
        const response = await got(baseUrl, {
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
        const listenerResponse = await got.post(`${baseUrl}/listener`, {
          username: 'listener',
          password: 'listener-password',
          json: webhook
        });
        const webhooksResponse = await got(`${baseUrl}/api/webhooks`, {
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
  })().catch(error => {
    t.error(error);
    t.end();
  });
});
