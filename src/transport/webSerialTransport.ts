import type { SerialTransport } from './serialTransport';

/**
 * 浏览器 Web Serial API 实现（Chrome/Edge 等），与 chrome.serial 共用 SerialTransport 契约。
 */
export class WebSerialTransport implements SerialTransport {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private receiveHandler: ((data: ArrayBuffer) => void) | null = null;
  private readLoopRunning = false;

  setOnReceive(handler: (data: ArrayBuffer) => void): void {
    this.receiveHandler = handler;
  }

  async connect(port: SerialPort, baudRate: number): Promise<void> {
    await port.open({ baudRate });
    this.port = port;
    this.reader = port.readable?.getReader() ?? null;
    this.writer = port.writable?.getWriter() ?? null;
    if (!this.reader || !this.writer) {
      await port.close().catch(() => {});
      this.port = null;
      throw new Error('无法打开串口读写流');
    }
    void this.runReadLoop();
  }

  private async runReadLoop(): Promise<void> {
    if (!this.reader || this.readLoopRunning) return;
    this.readLoopRunning = true;
    try {
      for (;;) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value?.length && this.receiveHandler) {
          const copy = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
          this.receiveHandler(copy);
        }
      }
    } catch {
      // 断开或 cancel 时常见
    } finally {
      this.readLoopRunning = false;
    }
  }

  async send(data: ArrayBuffer): Promise<void> {
    if (!this.writer) throw new Error('串口未连接');
    await this.writer.write(new Uint8Array(data));
  }

  async close(): Promise<void> {
    if (this.reader) {
      await this.reader.cancel().catch(() => {});
      try {
        this.reader.releaseLock();
      } catch {
        /* ignore */
      }
      this.reader = null;
    }
    if (this.writer) {
      await this.writer.close().catch(() => {});
      this.writer = null;
    }
    if (this.port) {
      await this.port.close().catch(() => {});
      this.port = null;
    }
  }
}
