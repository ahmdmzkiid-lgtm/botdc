const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const env = { ...process.env, NODE_ENV: 'production' };

function start(name, script) {
  return spawn('node', ['-r', 'tsx', path.join(root, script)], {
    stdio: 'inherit',
    env,
    cwd: path.join(root, 'apps/bot'),
  });
}

const server = start('API', 'src/api/server.ts');
const bot = start('Bot', 'src/bot.ts');

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
