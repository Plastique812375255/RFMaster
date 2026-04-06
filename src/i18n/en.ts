/**
 * 文案与 conference/rotorflight-configurator-release-2.2.1/locales/en/messages.json 对齐（本页用到的键）。
 */
export const en = {
  versionLabelConfigurator: 'Configurator',
  versionLabelFirmware: 'Firmware',
  versionLabelTarget: 'Target',
  connect: 'Connect',
  connecting: 'Connecting',
  disconnect: 'Disconnect',
  portsSelectManual: 'Manual Selection',
  serialPortLoading: 'Loading ...',
  virtualMSPVersion: 'Virtual Firmware Version',
  portOverrideText: 'Port:',
  autoConnect: 'Auto-Connect',
  showAllPorts: 'Show All Ports',
  autoConnectEnabled:
    'Auto-Connect: Enabled - Configurator automatically tries to connect when new port is detected',
  autoConnectDisabled:
    'Auto-Connect: Disabled - User needs to select the correct serial port and click "Connect" button on its own',
  showAllPortsEnabled: 'Show All Ports: Enabled - Configurator lists all possible ports',
  showAllPortsDisabled:
    'Show All Ports: Disabled - Configurator will only list recognized ports',
  serialPortOpened: 'Serial port successfully opened with ID: $1',
  serialPortOpenFail: 'Failed to open serial port',
  apiVersionReceived: 'MSP API version: $1',
  firmwareInfoReceived: 'Firmware Version: $1, version: $2',
  buildInfoReceived: 'Revision: $1 released on: $2',
  boardInfoReceived: 'Board: $1, version: $2',
  apiVersionInvalid:
    'MSP API version: [$1] is invalid. Please use a firmware version that is supported by this version of the Configurator.',
  firmwareVersionNotSupported:
    'This firmware version is not supported. Please use a firmware version that is supported by this version of the Configurator. Use CLI for backup before flashing. CLI backup/restore procedure is in the documentation.',
  firmwareTypeNotSupported:
    'Non - Rotorflight firmware is not supported, except for CLI mode.',
  firmwareVersionInvalid:
    'Firmware version: [$1] is invalid. Please use a firmware version that is supported by this version of the Configurator.',
  noConfigurationReceived:
    'No configuration received within 10 seconds, communication failed',
  landscapeRotateHint: 'Please rotate your device to landscape.',
  tabSetup: 'Setup',
  tabReceiver: 'Receiver',
  tabMixer: 'Mixer',
  tabMotors: 'Motors',
  tabGyro: 'Gyro',
  appTabPlaceholder: 'This section will be implemented in a later phase.',
  connectScreenSubtitle: 'Select port and connect to your flight controller.',
  menuOpen: 'Open menu',
  menuTitle: 'Menu',
  drawerClose: 'Close',
  drawerFcSummaryTitle: 'Flight controller',
  drawerExampleLink1: 'Example: Preferences',
  drawerExampleLink2: 'Example: Backup / restore',
  drawerExampleLink3: 'Example: About',
} as const;

export function formatMsg(template: string, ...params: string[]): string {
  let s = template;
  params.forEach((p, i) => {
    s = s.replace(`$${i + 1}`, p);
  });
  return s;
}

export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
