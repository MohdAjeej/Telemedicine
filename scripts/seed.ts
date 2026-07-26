/**
 * Root-level entrypoint for `npm run seed`. The actual seed logic lives in
 * apps/server/src/scripts/seed.ts because it needs the server's Mongoose
 * models, env validation, and DB connection helpers — this just delegates
 * to that workspace so `npm run seed` works from the repo root.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const serverDir = path.resolve(__dirname, '..', 'apps', 'server');

const result = spawnSync('npm', ['run', 'seed'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
