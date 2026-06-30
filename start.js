const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = __dirname;
const botDir = path.join(root, 'apps/bot');
const env = { ...process.env, NODE_ENV: 'production' };

// Check if node_modules/.bin/tsx exists
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

function start(name, script) {
  const args = tsxBin === 'npx' ? ['tsx', script] : [script];
  return spawn(tsxBin, args, {
    stdio: 'inherit',
    env,
    cwd: botDir,
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
