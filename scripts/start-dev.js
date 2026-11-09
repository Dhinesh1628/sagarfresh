import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Starting GoMeat Full-Stack Development Environment...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Start Backend Express Server
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true
});

// 2. Start Frontend Vite Dev Server
const frontend = spawn(npmCmd, ['run', 'dev', '--', '--host'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n🛑 Shutting down GoMeat servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
