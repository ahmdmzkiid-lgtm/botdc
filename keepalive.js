const https = require('https');

const RENDER_URL = process.env.RENDER_URL || 'https://botdc-4cl7.onrender.com';
const INTERVAL = 4 * 60 * 1000; // every 4 minutes

function ping() {
  const start = Date.now();
  https.get(`${RENDER_URL}/health`, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log(`[Keepalive] ${res.statusCode} (${Date.now() - start}ms)`);
    });
  }).on('error', (err) => {
    console.error('[Keepalive] Failed:', err.message);
  });
}

ping();
setInterval(ping, INTERVAL);
console.log(`[Keepalive] Pinging ${RENDER_URL}/health every 4 minutes`);
