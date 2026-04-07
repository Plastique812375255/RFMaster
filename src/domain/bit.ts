/** 与 conference 中 bit_check / bit_set / bit_clear 一致 */
export function bit_check(bits: number, bit: number): boolean {
  return ((bits >> bit) & 1) !== 0;
}

export function bit_set(bits: number, bit: number): number {
  return bits | (1 << bit);
}

export function bit_clear(bits: number, bit: number): number {
  return bits & ~(1 << bit);
}
