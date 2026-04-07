import type { VirtualMspContext } from '../msp/virtualMsp';
import { buildVirtualMspResponse } from '../msp/virtualMsp';
import type { SerialTransport } from './serialTransport';

/**
 * 对齐 conference serial.connect('virtual')：无真实串口，发送请求后异步回灌合成 MSP 响应。
 */
export class VirtualSerialTransport implements SerialTransport {
  private handler: ((data: ArrayBuffer) => void) | null = null;

  constructor(private readonly getContext: () => VirtualMspContext) {}

  setOnReceive(handler: (data: ArrayBuffer) => void): void {
    this.handler = handler;
  }

  async send(data: ArrayBuffer): Promise<void> {
    const response = buildVirtualMspResponse(data, this.getContext());
    if (response && this.handler) {
      this.handler(response);
    }
  }

  async close(): Promise<void> {
    this.handler = null;
  }
}
