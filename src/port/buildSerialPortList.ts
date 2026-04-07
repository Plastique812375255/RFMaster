import { en } from '../i18n/en';
import { getChrome, listChromeSerialDevices } from '../transport/chromeSerialTransport';
import { usbDevices } from './usbDevices';
import { portRecognized } from './portRecognized';

export type SerialPortEntry = { path: string; displayName: string };

const DFU_VALUE = 'DFU';
const MANUAL_VALUE = 'manual';
/** 对齐 conference serial.connect('virtual') */
const VIRTUAL_PORT_VALUE = 'virtual';

export { DFU_VALUE, MANUAL_VALUE, VIRTUAL_PORT_VALUE };

function sortPorts(ports: SerialPortEntry[]): SerialPortEntry[] {
  return [...ports].sort((a, b) =>
    a.path.localeCompare(b.path, window.navigator.language, {
      numeric: true,
      sensitivity: 'base',
    }),
  );
}

/** conference port_handler updatePortSelect 的 portText 规则 */
function formatPortLabel(p: SerialPortEntry): string {
  if (p.displayName) {
    return `${p.path} - ${p.displayName}`;
  }
  return p.path;
}

export type SerialPortOption = {
  value: string;
  label: string;
  isManual?: boolean;
  isDFU?: boolean;
  isVirtual?: boolean;
};

/**
 * 合并 chrome.usb（DFU）与 chrome.serial 列表，行为与 PortHandler + updatePortSelect 一致。
 * 同时返回 serialEntries 供 port_handler 式 detectPort / selectPort 使用。
 */
export async function buildSerialPortData(showAllPorts: boolean): Promise<{
  options: SerialPortOption[];
  serialEntries: SerialPortEntry[];
  hasDfu: boolean;
}> {
  const options: SerialPortOption[] = [];

  let dfuLabel: string | null = null;
  const c = getChrome();
  if (c?.usb?.getDevices) {
    await new Promise<void>((resolve) => {
      c.usb.getDevices(usbDevices, (result) => {
        if (c.runtime.lastError) {
          resolve();
          return;
        }
        if (result?.length) {
          const d = result[0];
          dfuLabel = d.productName ? `DFU - ${d.productName}` : 'DFU';
        }
        resolve();
      });
    });
  }

  if (dfuLabel) {
    options.push({ value: DFU_VALUE, label: dfuLabel, isDFU: true });
  }

  options.push({ value: VIRTUAL_PORT_VALUE, label: en.portVirtual, isVirtual: true });

  let serialPorts: SerialPortEntry[] = [];
  try {
    serialPorts = await listChromeSerialDevices();
  } catch (e) {
    console.warn('[rfmaster] chrome.serial.getDevices failed', e);
    serialPorts = [];
  }

  if (!showAllPorts) {
    serialPorts = serialPorts.filter((p) => portRecognized(p.displayName || undefined, p.path));
  }

  serialPorts = sortPorts(serialPorts);
  for (const p of serialPorts) {
    options.push({ value: p.path, label: formatPortLabel(p) });
  }

  options.push({ value: MANUAL_VALUE, label: en.portsSelectManual, isManual: true });
  return { options, serialEntries: serialPorts, hasDfu: !!dfuLabel };
}

/** @deprecated 优先用 buildSerialPortData，以便增量更新与自动选口 */
export async function buildSerialPortOptions(showAllPorts: boolean): Promise<SerialPortOption[]> {
  const { options } = await buildSerialPortData(showAllPorts);
  return options;
}
