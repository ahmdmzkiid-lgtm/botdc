const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = __dirname;
const botDir = path.join(root, 'apps/bot');
const env = { ...process.env, NODE_ENV: 'production' };

const tsxPaths = [
  path.join(botDir, 'node_modules/.bin/tsx'),
  path.join(root, 'node_modules/.bin/tsx'),
];

let tsxBin = null;
for (const p of tsxPaths) {
  try { fs.accessSync(p); tsxBin = p; console.log('tsx at:', p); break; }
  catch {}
}

if (!tsxBin) { tsxBin = 'npx'; }

function start(name, script, extraEnv) {
  const args = tsxBin === 'npx' ? ['tsx', script] : [script];
  return spawn(tsxBin, args, {
    stdio: 'inherit',
    env: extraEnv ? { ...env, ...extraEnv } : env,
    cwd: botDir,
  });
}

const server = start('API', 'src/api/server.ts');
const bot = start('Bot', 'src/bot.ts');
const keepalive = spawn('node', [path.join(root, 'keepalive.js')], {
  stdio: 'inherit',
  env: { ...env, RENDER_URL: 'https://botdc-4cl7.onrender.com' },
});

function shutdown() {
  server.kill('SIGTERM');
  bot.kill('SIGTERM');
  keepalive.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.on('exit', (code) => {
  console.error(`API server exited with code ${code}`);
  shutdown();
});
