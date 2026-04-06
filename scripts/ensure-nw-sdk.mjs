/**
 * pnpm 安装依赖时，nw 的 postinstall 未必能读到项目 .npmrc 里的 nwjs_build_type=sdk，
 * 会落普通版目录；而运行 `nw` 时又会按 .npmrc 找 SDK 路径 → ENOENT。
 * 若 SDK 可执行文件不存在，则强制以 SDK flavor 重建 nw。
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const nwPkgRoot = dirname(require.resolve('nw/package.json'));
const { version } = JSON.parse(readFileSync(join(nwPkgRoot, 'package.json'), 'utf8'));
const ver = version.split('-')[0];

const PLATFORM = { darwin: 'osx', linux: 'linux', win32: 'win' }[process.platform];
const ARCH = { x64: 'x64', arm64: 'arm64', ia32: 'ia32' }[process.arch];
if (!PLATFORM || !ARCH) process.exit(0);

const sdkDir = join(nwPkgRoot, `nwjs-sdk-v${ver}-${PLATFORM}-${ARCH}`);
const exe =
  PLATFORM === 'osx'
    ? join(sdkDir, 'nwjs.app/Contents/MacOS/nwjs')
    : PLATFORM === 'win'
      ? join(sdkDir, 'nw.exe')
      : join(sdkDir, 'nw');

if (existsSync(exe)) process.exit(0);

execSync('pnpm rebuild nw', {
  stdio: 'inherit',
  env: { ...process.env, NWJS_BUILD_TYPE: 'sdk' },
});
