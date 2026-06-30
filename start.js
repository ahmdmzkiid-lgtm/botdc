const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;

const tsx = path.join(root, 'node_modules/.bin/tsx');

function start(name, script) {
  return spawn(tsx, [script], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });
}

const server = start('API', 'apps/bot/src/api/server.ts');
const bot = start('Bot', 'apps/bot/src/bot.ts');

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
