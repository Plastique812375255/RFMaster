import { defineConfig } from 'vite';

/** 相对路径资源，供 NW.js 以 file:// 打开 dist/index.html 时使用，避免 http 远程页白屏/闪退 */
export default defineConfig({
  root: '.',
  base: './',
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
});
