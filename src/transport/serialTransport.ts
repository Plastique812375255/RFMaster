/**
 * USB 串口传输抽象，行为对齐 conference/rotorflight-configurator-release-2.2.1/src/js/serial.js
 * （连接、发送、onReceive、断开）。
 * NW.js 使用 ChromeSerialTransport（chrome.serial）；浏览器可选 WebSerialTransport。
 */
export interface SerialTransport {
  setOnReceive(handler: (data: ArrayBuffer) => void): void;
  send(data: ArrayBuffer): Promise<void>;
  close(): Promise<void>;
}
