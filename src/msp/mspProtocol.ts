/**
 * MSP 编解码状态机，行为对齐 conference/rotorflight-configurator-release-2.2.1/src/js/msp.svelte.js 中的 MSP 对象。
 */
export const MspSymbols = {
  BEGIN: '$'.charCodeAt(0),
  PROTO_V1: 'M'.charCodeAt(0),
  PROTO_V2: 'X'.charCodeAt(0),
  FROM_MWC: '>'.charCodeAt(0),
  TO_MWC: '<'.charCodeAt(0),
  UNSUPPORTED: '!'.charCodeAt(0),
} as const;

const DecoderStates = {
  IDLE: 0,
  PROTO_IDENTIFIER: 1,
  DIRECTION_V1: 2,
  DIRECTION_V2: 3,
  FLAG_V2: 4,
  PAYLOAD_LENGTH_V1: 5,
  PAYLOAD_LENGTH_JUMBO_LOW: 6,
  PAYLOAD_LENGTH_JUMBO_HIGH: 7,
  PAYLOAD_LENGTH_V2_LOW: 8,
  PAYLOAD_LENGTH_V2_HIGH: 9,
  CODE_V1: 10,
  CODE_JUMBO_V1: 11,
  CODE_V2_LOW: 12,
  CODE_V2_HIGH: 13,
  PAYLOAD_V1: 14,
  PAYLOAD_V2: 15,
  CHECKSUM_V1: 16,
  CHECKSUM_V2: 17,
} as const;

const Constants = {
  JUMBO_FRAME_MIN_SIZE: 255,
} as const;

export type MspListener = (msp: MspProtocol) => void;

export class MspProtocol {
  state = DecoderStates.IDLE;
  message_direction = 1;
  code = 0;
  dataView: DataView | null = null;
  message_length_expected = 0;
  message_length_received = 0;
  message_buffer: ArrayBuffer | null = null;
  message_buffer_uint8_view: Uint8Array | null = null;
  message_checksum = 0;
  messageIsJumboFrame = false;
  crcError = false;
  unsupported = 0;
  packet_error = 0;
  last_received_timestamp: number | null = null;

  private listeners: MspListener[] = [];

  feed(readInfo: { data: ArrayBuffer }): void {
    const data = new Uint8Array(readInfo.data);
    for (const chunk of data) {
      this.processByte(chunk);
    }
    this.last_received_timestamp = Date.now();
  }

  private processByte(chunk: number): void {
    switch (this.state) {
      case DecoderStates.IDLE:
        if (chunk === MspSymbols.BEGIN) {
          this.state = DecoderStates.PROTO_IDENTIFIER;
        }
        break;
      case DecoderStates.PROTO_IDENTIFIER:
        switch (chunk) {
          case MspSymbols.PROTO_V1:
            this.state = DecoderStates.DIRECTION_V1;
            break;
          case MspSymbols.PROTO_V2:
            this.state = DecoderStates.DIRECTION_V2;
            break;
          default:
            this.state = DecoderStates.IDLE;
        }
        break;
      case DecoderStates.DIRECTION_V1:
      case DecoderStates.DIRECTION_V2:
        this.unsupported = 0;
        switch (chunk) {
          case MspSymbols.FROM_MWC:
            this.message_direction = 1;
            break;
          case MspSymbols.TO_MWC:
            this.message_direction = 0;
            break;
          case MspSymbols.UNSUPPORTED:
            this.unsupported = 1;
            break;
        }
        this.state =
          this.state === DecoderStates.DIRECTION_V1
            ? DecoderStates.PAYLOAD_LENGTH_V1
            : DecoderStates.FLAG_V2;
        break;
      case DecoderStates.FLAG_V2:
        this.state = DecoderStates.CODE_V2_LOW;
        break;
      case DecoderStates.PAYLOAD_LENGTH_V1:
        this.message_length_expected = chunk;
        if (this.message_length_expected === Constants.JUMBO_FRAME_MIN_SIZE) {
          this.state = DecoderStates.CODE_JUMBO_V1;
        } else {
          this.initializeReadBuffer();
          this.state = DecoderStates.CODE_V1;
        }
        break;
      case DecoderStates.PAYLOAD_LENGTH_V2_LOW:
        this.message_length_expected = chunk;
        this.state = DecoderStates.PAYLOAD_LENGTH_V2_HIGH;
        break;
      case DecoderStates.PAYLOAD_LENGTH_V2_HIGH:
        this.message_length_expected |= chunk << 8;
        this.initializeReadBuffer();
        this.state =
          this.message_length_expected > 0 ? DecoderStates.PAYLOAD_V2 : DecoderStates.CHECKSUM_V2;
        break;
      case DecoderStates.CODE_V1:
      case DecoderStates.CODE_JUMBO_V1:
        this.code = chunk;
        if (this.message_length_expected > 0) {
          if (this.state === DecoderStates.CODE_JUMBO_V1) {
            this.state = DecoderStates.PAYLOAD_LENGTH_JUMBO_LOW;
          } else {
            this.state = DecoderStates.PAYLOAD_V1;
          }
        } else {
          this.state = DecoderStates.CHECKSUM_V1;
        }
        break;
      case DecoderStates.CODE_V2_LOW:
        this.code = chunk;
        this.state = DecoderStates.CODE_V2_HIGH;
        break;
      case DecoderStates.CODE_V2_HIGH:
        this.code |= chunk << 8;
        this.state = DecoderStates.PAYLOAD_LENGTH_V2_LOW;
        break;
      case DecoderStates.PAYLOAD_LENGTH_JUMBO_LOW:
        this.message_length_expected = chunk;
        this.state = DecoderStates.PAYLOAD_LENGTH_JUMBO_HIGH;
        break;
      case DecoderStates.PAYLOAD_LENGTH_JUMBO_HIGH:
        this.message_length_expected |= chunk << 8;
        this.initializeReadBuffer();
        this.state = DecoderStates.PAYLOAD_V1;
        break;
      case DecoderStates.PAYLOAD_V1:
      case DecoderStates.PAYLOAD_V2: {
        if (!this.message_buffer_uint8_view) break;
        this.message_buffer_uint8_view[this.message_length_received] = chunk;
        this.message_length_received++;
        if (this.message_length_received >= this.message_length_expected) {
          this.state =
            this.state === DecoderStates.PAYLOAD_V1 ? DecoderStates.CHECKSUM_V1 : DecoderStates.CHECKSUM_V2;
        }
        break;
      }
      case DecoderStates.CHECKSUM_V1: {
        if (this.message_length_expected >= Constants.JUMBO_FRAME_MIN_SIZE) {
          this.message_checksum = Constants.JUMBO_FRAME_MIN_SIZE;
        } else {
          this.message_checksum = this.message_length_expected;
        }
        this.message_checksum ^= this.code;
        if (this.message_length_expected >= Constants.JUMBO_FRAME_MIN_SIZE) {
          this.message_checksum ^= this.message_length_expected & 0xff;
          this.message_checksum ^= (this.message_length_expected & 0xff00) >> 8;
        }
        if (this.message_buffer_uint8_view) {
          for (let ii = 0; ii < this.message_length_received; ii++) {
            this.message_checksum ^= this.message_buffer_uint8_view[ii];
          }
        }
        this.dispatchMessage(chunk);
        break;
      }
      case DecoderStates.CHECKSUM_V2: {
        this.message_checksum = 0;
        this.message_checksum = this.crc8DvbS2(this.message_checksum, 0);
        this.message_checksum = this.crc8DvbS2(this.message_checksum, this.code & 0xff);
        this.message_checksum = this.crc8DvbS2(this.message_checksum, (this.code & 0xff00) >> 8);
        this.message_checksum = this.crc8DvbS2(this.message_checksum, this.message_length_expected & 0xff);
        this.message_checksum = this.crc8DvbS2(this.message_checksum, (this.message_length_expected & 0xff00) >> 8);
        if (this.message_buffer_uint8_view) {
          for (let ii = 0; ii < this.message_length_received; ii++) {
            this.message_checksum = this.crc8DvbS2(this.message_checksum, this.message_buffer_uint8_view[ii]);
          }
        }
        this.dispatchMessage(chunk);
        break;
      }
      default:
        break;
    }
  }

  private initializeReadBuffer(): void {
    this.message_buffer = new ArrayBuffer(this.message_length_expected);
    this.message_buffer_uint8_view = new Uint8Array(this.message_buffer);
  }

  private dispatchMessage(expectedChecksum: number): void {
    if (this.message_checksum === expectedChecksum) {
      this.dataView = new DataView(this.message_buffer ?? new ArrayBuffer(0), 0, this.message_length_expected);
    } else {
      this.packet_error++;
      this.crcError = true;
      this.dataView = new DataView(new ArrayBuffer(0));
    }
    this.notify();
    this.message_length_received = 0;
    this.state = DecoderStates.IDLE;
    this.messageIsJumboFrame = false;
    this.crcError = false;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this);
    }
  }

  listen(listener: MspListener): void {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }

  clearListeners(): void {
    this.listeners = [];
  }

  disconnectCleanup(): void {
    this.state = DecoderStates.IDLE;
    this.packet_error = 0;
    this.listeners = [];
  }

  private crc8DvbS2(crc: number, ch: number): number {
    crc ^= ch;
    for (let ii = 0; ii < 8; ii++) {
      if (crc & 0x80) {
        crc = ((crc << 1) & 0xff) ^ 0xd5;
      } else {
        crc = (crc << 1) & 0xff;
      }
    }
    return crc;
  }

  crc8DvbS2Data(data: Uint8Array, start: number, end: number): number {
    let crc = 0;
    for (let ii = start; ii < end; ii++) {
      crc = this.crc8DvbS2(crc, data[ii]!);
    }
    return crc;
  }

  encodeMessageV1(code: number, data: Uint8Array | null): ArrayBuffer {
    if (data) {
      const size = data.length + 6;
      const bufferOut = new ArrayBuffer(size);
      const bufView = new Uint8Array(bufferOut);
      bufView[0] = 36;
      bufView[1] = 77;
      bufView[2] = 60;
      bufView[3] = data.length;
      bufView[4] = code;
      let checksum = bufView[3]! ^ bufView[4]!;
      for (let i = 0; i < data.length; i++) {
        bufView[i + 5] = data[i]!;
        checksum ^= bufView[i + 5]!;
      }
      bufView[5 + data.length] = checksum;
      return bufferOut;
    }
    const bufferOut = new ArrayBuffer(6);
    const bufView = new Uint8Array(bufferOut);
    bufView[0] = 36;
    bufView[1] = 77;
    bufView[2] = 60;
    bufView[3] = 0;
    bufView[4] = code;
    bufView[5] = bufView[3]! ^ bufView[4]!;
    return bufferOut;
  }

  encodeMessageV2(code: number, data: Uint8Array | null): ArrayBuffer {
    const dataLength = data ? data.length : 0;
    const bufferSize = dataLength + 9;
    const bufferOut = new ArrayBuffer(bufferSize);
    const bufView = new Uint8Array(bufferOut);
    bufView[0] = 36;
    bufView[1] = 88;
    bufView[2] = 60;
    bufView[3] = 0;
    bufView[4] = code & 0xff;
    bufView[5] = (code >> 8) & 0xff;
    bufView[6] = dataLength & 0xff;
    bufView[7] = (dataLength >> 8) & 0xff;
    for (let ii = 0; ii < dataLength; ii++) {
      bufView[8 + ii] = data![ii]!;
    }
    bufView[bufferSize - 1] = this.crc8DvbS2Data(bufView, 3, bufferSize - 1);
    return bufferOut;
  }

  encodeRequest(code: number, data: Uint8Array | null): ArrayBuffer {
    if (code <= 254) {
      return this.encodeMessageV1(code, data);
    }
    return this.encodeMessageV2(code, data);
  }
}
