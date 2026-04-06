/**
 * 与 conference/RFTuner/src/js/utils/common.js 中 virtualFirmwareVersions 同源（option.value = msp，label 展示）。
 * 不含 2.3.x（MSP 12.9.0）：与 conference/rotorflight-configurator-release-2.2.1/src/js/data_storage.js
 * 中 API_VERSION_RTFL_MAX / FW_VERSION_RTFL_MAX 一致，连接校验不放宽。
 */
export const ROTORFLIGHT_VERSION_LINES = [
  { fw: '4.3.0', msp: '12.6.0', label: 'Rotorflight 2.0.x' },
  { fw: '4.4.0', msp: '12.7.0', label: 'Rotorflight 2.1.x' },
  { fw: '4.5.0', msp: '12.8.0', label: 'Rotorflight 2.2.x' },
] as const;

export function fillRotorflightVersionSelect(sel: HTMLSelectElement): void {
  sel.innerHTML = '';
  for (const entry of [...ROTORFLIGHT_VERSION_LINES].reverse()) {
    const opt = document.createElement('option');
    opt.value = entry.msp;
    opt.textContent = entry.label;
    opt.dataset.fw = entry.fw;
    sel.appendChild(opt);
  }
}
