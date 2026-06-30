const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const botBin = path.join(root, 'apps/bot/node_modules/.bin');
const env = { ...process.env, NODE_ENV: 'production', PATH: `${botBin}:${process.env.PATH || ''}` };

function start(name, script) {
  return spawn('tsx', [path.join(root, script)], {
    stdio: 'inherit',
    env,
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
