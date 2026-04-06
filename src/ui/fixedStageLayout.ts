/** 固定设计稿尺寸，等比缩放（与 viewport + scaler + stage 一致）。 */
export const DESIGN_W = 640;
export const DESIGN_H = 360;

function applyScaleAndLandscape(): void {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const s = Math.min(vw / DESIGN_W, vh / DESIGN_H);
  document.documentElement.style.setProperty('--scale', String(s));

  const lock = document.getElementById('landscape-lock');
  if (lock) {
    lock.hidden = vw >= vh;
  }
}

/** 在入口尽早调用；监听 resize / orientationchange。 */
export function initFixedStageLayout(): void {
  applyScaleAndLandscape();
  window.addEventListener('resize', applyScaleAndLandscape);
  window.addEventListener('orientationchange', applyScaleAndLandscape);
}
