/**
 * macOS 上若用 `nw .` 传入相对路径 `.`，NW 会相对 nwjs.app 解析，误找 Resources/app.nw。
 * 传入项目根目录的绝对路径可避免该 zip / FILE_ERROR_NOT_FOUND 报错。
 */
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const cliJs = resolve(require.resolve('nw/package.json'), '..', 'src', 'cli.js');
const appRoot = resolve(process.cwd());

const child = spawn(process.execPath, [cliJs, appRoot], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd(),
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
