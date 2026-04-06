/** MSP 载荷读取，与 MSPHelper 中 data.readU8/readU16 一致（小端）。 */
export class MspReader {
  constructor(
    private dv: DataView,
    private offset = 0,
  ) {}

  readU8(): number {
    const v = this.dv.getUint8(this.offset);
    this.offset += 1;
    return v;
  }

  readU16(): number {
    const v = this.dv.getUint16(this.offset, true);
    this.offset += 2;
    return v;
  }

  readU32(): number {
    const v = this.dv.getUint32(this.offset, true);
    this.offset += 4;
    return v;
  }
}
