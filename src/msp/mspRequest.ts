import { applyMspPayloadToFc } from './fcState';
import type { MspProtocol } from './mspProtocol';

export async function mspPromise(
  msp: MspProtocol,
  send: (buf: ArrayBuffer) => Promise<void>,
  code: number,
  data: Uint8Array | null,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      msp.clearListeners();
      reject(new Error('MSP timeout'));
    }, 10_000);

    const listener = (): void => {
      if (msp.code !== code) return;
      if (msp.crcError || msp.unsupported) return;
      if (msp.message_direction !== 1) return;
      if (msp.dataView) {
        applyMspPayloadToFc(msp.code, msp.dataView);
      }
      window.clearTimeout(timer);
      msp.clearListeners();
      resolve();
    };

    msp.listen(listener);
    void send(msp.encodeRequest(code, data)).catch((e: unknown) => {
      window.clearTimeout(timer);
      msp.clearListeners();
      reject(e instanceof Error ? e : new Error(String(e)));
    });
  });
}
