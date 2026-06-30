const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const dist = path.join(root, 'apps/bot/dist');

const server = spawn('node', [path.join(dist, 'api/server.js')], {
  stdio: 'inherit',
  env: { ...process.env },
});

const bot = spawn('node', [path.join(dist, 'bot.js')], {
  stdio: 'inherit',
  env: { ...process.env },
});

function shutdown() {
  server.kill('SIGTERM');
  bot.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.on('exit', (code) => {
  console.error(`API server exited with code ${code}`);
  shutdown();
});
