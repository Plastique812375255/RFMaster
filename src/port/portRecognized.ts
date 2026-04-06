/**
 * conference/rotorflight-configurator-release-2.2.1/src/js/gui.js GUI_checkOperatingSystem +
 * port_handler.js portRecognized
 */
export function GUI_checkOperatingSystem(): string {
  const av = navigator.appVersion;
  if (av.indexOf('Win') !== -1) return 'Windows';
  if (av.indexOf('Mac') !== -1) return 'MacOS';
  if (av.indexOf('Android') !== -1) return 'Android';
  if (av.indexOf('Linux') !== -1) return 'Linux';
  if (av.indexOf('X11') !== -1) return 'UNIX';
  return 'Unknown';
}

/**
 * conference/rotorflight-configurator-release-2.2.1/src/js/port_handler.js function portRecognized
 * 第一个参数为 displayName（可为空），第二个为 path。
 */
export function portRecognized(portName: string | undefined, pathSelect: string): boolean {
  if (portName) {
    const isWindows = GUI_checkOperatingSystem() === 'Windows';
    const isTty = pathSelect.includes('tty');
    const deviceRecognized = portName.includes('STM') || portName.includes('CP210');
    const legacyDeviceRecognized = portName.includes('usb');
    if ((isWindows && deviceRecognized) || (isTty && (deviceRecognized || legacyDeviceRecognized))) {
      return true;
    }
  }
  return false;
}

export function isAndroidOs(): boolean {
  return GUI_checkOperatingSystem() === 'Android';
}
