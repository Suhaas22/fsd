import { spawn } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const backendPort = process.env.PORT || '3000';
const prefix = (process.env.API_PREFIX || 'api').replace(/^\/+|\/+$/g, '');
const backendUrl = `http://127.0.0.1:${backendPort}/${prefix}/public/landing`;
const frontendUrl = 'http://127.0.0.1:5173';
const children = new Set();
let stopping = false;

function reachable(url) {
  return new Promise(resolve => {
    const request = http.get(url, response => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.setTimeout(1500, () => request.destroy());
    request.on('error', () => resolve(false));
  });
}

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (process.platform === 'win32') child.kill('SIGTERM');
    else {
      try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Already stopped. */ }
    }
  }
  process.exitCode = code;
}

function start(label, directory, command) {
  const child = spawn(npm, ['run', command], {
    cwd: fileURLToPath(new URL(directory, new URL('../', import.meta.url))),
    stdio: 'inherit',
    detached: process.platform !== 'win32',
    env: { ...process.env, API_PROXY_TARGET: `http://127.0.0.1:${backendPort}` },
  });
  children.add(child);
  child.on('error', error => {
    console.error(`[dev] ${label} could not start: ${error.message}`);
    stop(1);
  });
  child.on('exit', code => {
    children.delete(child);
    if (!stopping) {
      console.error(`[dev] ${label} stopped. Shutting down this launch.`);
      stop(code || 1);
    }
  });
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

if (await reachable(backendUrl)) console.log('[dev] Using the running backend.');
else {
  console.log('[dev] Starting backend; waiting for its API…');
  start('Backend', 'back-end/', 'start:dev');
  const deadline = Date.now() + 60000;
  while (!stopping && !(await reachable(backendUrl))) {
    if (Date.now() >= deadline) {
      console.error(`[dev] Backend did not become ready at ${backendUrl}. Check its startup errors.`);
      stop(1);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

if (!stopping) {
  if (await reachable(frontendUrl)) console.log('[dev] Using the running frontend at http://localhost:5173.');
  else {
    console.log('[dev] Backend ready. Starting frontend at http://localhost:5173.');
    start('Frontend', 'front-end/', 'dev');
  }
}
