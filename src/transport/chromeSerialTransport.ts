import type { SerialTransport } from './serialTransport';

/**
 * NW / Chromium 中 `chrome` 在 globalThis 上；打包后勿依赖未声明的全局标识符。
 * 对齐 conference/rotorflight-configurator-release-2.2.1 对 chrome.serial 的用法。
 */
export function getChrome(): typeof chrome | undefined {
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as unknown as { chrome?: typeof chrome };
    if (g.chrome) return g.chrome;
  }
  if (typeof window !== 'undefined') {
    const w = window as unknown as { chrome?: typeof chrome };
    if (w.chrome) return w.chrome;
  }
  return undefined;
}

/**
 * NW.js / Chromium 扩展环境：chrome.serial，行为对齐
 * conference/rotorflight-configurator-release-2.2.1/src/js/serial.js 的串口路径。
 */
export class ChromeSerialTransport implements SerialTransport {
  private connectionId: number | null = null;
  private receiveHandler: ((data: ArrayBuffer) => void) | null = null;
  private onReceiveCb: ((info: chrome.serial.ReceiveInfo) => void) | null = null;
  private onReceiveErrorCb: ((info: chrome.serial.OnReceiveErrorInfo) => void) | null = null;

  setOnReceive(handler: (data: ArrayBuffer) => void): void {
    this.receiveHandler = handler;
  }

  connect(path: string, baudRate: number): Promise<void> {
    const c = getChrome();
    if (!c?.serial) {
      return Promise.reject(new Error('chrome.serial 不可用'));
    }
    return new Promise((resolve, reject) => {
      c.serial.connect(path, { bitrate: baudRate }, (connectionInfo) => {
        if (c.runtime.lastError) {
          reject(new Error(c.runtime.lastError.message));
          return;
        }
        if (!connectionInfo) {
          reject(new Error('串口打开失败'));
          return;
        }
        this.connectionId = connectionInfo.connectionId;

        this.onReceiveCb = (info: chrome.serial.ReceiveInfo) => {
          if (info.connectionId !== this.connectionId) return;
          if (this.receiveHandler && info.data) {
            this.receiveHandler(info.data);
          }
        };
        c.serial.onReceive.addListener(this.onReceiveCb);

        this.onReceiveErrorCb = (info: chrome.serial.OnReceiveErrorInfo) => {
          if (info.connectionId !== this.connectionId) return;
          if (info.error === 'timeout') return;
          void this.close();
        };
        c.serial.onReceiveError.addListener(this.onReceiveErrorCb);

        resolve();
      });
    });
  }

  send(data: ArrayBuffer): Promise<void> {
    const c = getChrome();
    if (!c?.serial) {
      return Promise.reject(new Error('chrome.serial 不可用'));
    }
    if (this.connectionId === null) {
      return Promise.reject(new Error('串口未连接'));
    }
    const id = this.connectionId;
    return new Promise((resolve, reject) => {
      c.serial.send(id, data, (sendInfo) => {
        if (c.runtime.lastError) {
          reject(new Error(c.runtime.lastError.message));
          return;
        }
        if (!sendInfo) {
          reject(new Error('发送失败'));
          return;
        }
        resolve();
      });
    });
  }

  close(): Promise<void> {
    const c = getChrome();
    if (this.onReceiveCb && c?.serial) {
      c.serial.onReceive.removeListener(this.onReceiveCb);
      this.onReceiveCb = null;
    }
    if (this.onReceiveErrorCb && c?.serial) {
      c.serial.onReceiveError.removeListener(this.onReceiveErrorCb);
      this.onReceiveErrorCb = null;
    }
    if (this.connectionId === null) {
      return Promise.resolve();
    }
    const id = this.connectionId;
    this.connectionId = null;
    if (!c?.serial) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      c.serial.disconnect(id, () => {
        resolve();
      });
    });
  }
}

export function listChromeSerialDevices(): Promise<{ path: string; displayName: string }[]> {
  const c = getChrome();
  if (!c?.serial?.getDevices) {
    return Promise.resolve([]);
  }
  return new Promise((resolve, reject) => {
    c.serial.getDevices((devices) => {
      if (c.runtime.lastError) {
        reject(new Error(c.runtime.lastError.message));
        return;
      }
      /** 与原版 port_handler 一致：用 chrome 返回的 displayName 参与 portRecognized，不能用 path 冒充（否则会改变过滤结果）。 */
      const out = (devices ?? []).map((d) => ({
        path: d.path,
        displayName: d.displayName?.trim() ?? '',
      }));
      resolve(out);
    });
  });
}

export function isChromeSerialAvailable(): boolean {
  const c = getChrome();
  return typeof c?.serial?.getDevices === 'function';
}
