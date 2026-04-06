import { describe, expect, it } from 'vitest';
import { MspProtocol } from './mspProtocol';
import { MSPCodes } from './mspCodes';

describe('MspProtocol.encodeMessageV1', () => {
  it('encodes MSP_API_VERSION request (no payload) like upstream', () => {
    const msp = new MspProtocol();
    const buf = msp.encodeMessageV1(MSPCodes.MSP_API_VERSION, null);
    expect(new Uint8Array(buf)).toEqual(new Uint8Array([0x24, 0x4d, 0x3c, 0x00, 0x01, 0x01]));
  });
});
