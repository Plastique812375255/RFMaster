/**
 * 虚拟连接：对齐 conference 中 CONFIGURATOR.virtualMode + serial.connect('virtual')，
 * 对连接校验用到的 MSP 请求返回合成响应帧（MSP v1，方向 `>`）。
 */
import { MSPCodes } from './mspCodes';

const BEGIN = '$'.charCodeAt(0);
const PROTO_V1 = 'M'.charCodeAt(0);
const TO_FC = '<'.charCodeAt(0);

export type VirtualMspContext = {
  /** 下拉 value，如 12.8.0 */
  apiVersion: string;
  /** dataset.fw，如 4.5.0 */
  fwVersion: string;
};

function parseMspV1RequestCode(buf: ArrayBuffer): number | null {
  const v = new Uint8Array(buf);
  if (v.length < 6 || v[0] !== BEGIN || v[1] !== PROTO_V1 || v[2] !== TO_FC) {
    return null;
  }
  return v[4] ?? null;
}

/** MSP v1 响应：$ M > len code payload checksum */
export function encodeMspV1Response(code: number, payload: Uint8Array): ArrayBuffer {
  const size = payload.length + 6;
  const bufferOut = new ArrayBuffer(size);
  const bufView = new Uint8Array(bufferOut);
  bufView[0] = 36;
  bufView[1] = 77;
  bufView[2] = 62; // FROM_MWC
  bufView[3] = payload.length;
  bufView[4] = code;
  let checksum = bufView[3]! ^ bufView[4]!;
  for (let i = 0; i < payload.length; i++) {
    bufView[5 + i] = payload[i]!;
    checksum ^= payload[i]!;
  }
  bufView[5 + payload.length] = checksum;
  return bufferOut;
}

function parseSemverParts(s: string): { major: number; minor: number; patch: number } {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(s.trim());
  if (!m) return { major: 4, minor: 5, patch: 0 };
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

function buildApiVersionPayload(ctx: VirtualMspContext): Uint8Array {
  const { major, minor } = parseSemverParts(ctx.apiVersion);
  return new Uint8Array([1, major, minor]);
}

function buildFcVariantPayload(): Uint8Array {
  return new Uint8Array([82, 84, 70, 76]); // RTFL
}

function buildFcVersionPayload(ctx: VirtualMspContext): Uint8Array {
  const { major, minor, patch } = parseSemverParts(ctx.fwVersion);
  return new Uint8Array([major, minor, patch]);
}

function buildBuildInfoPayload(ctx: VirtualMspContext): Uint8Array {
  const buildVersion = `${ctx.fwVersion}-0`;
  const dateStr = 'Jan 01 2024';
  const timeStr = '12:00:00';
  const rev = 'abcdefg';
  const parts: number[] = [];
  for (let i = 0; i < 11; i++) parts.push(dateStr.charCodeAt(i)!);
  for (let i = 0; i < 8; i++) parts.push(timeStr.charCodeAt(i)!);
  for (let i = 0; i < 7; i++) parts.push(rev.charCodeAt(i)!);
  parts.push(buildVersion.length);
  for (let i = 0; i < buildVersion.length; i++) parts.push(buildVersion.charCodeAt(i)!);
  return new Uint8Array(parts);
}

function buildBoardInfoPayload(): Uint8Array {
  const targetName = 'VIRT';
  const boardName = 'RFM';
  const boardDesign = '';
  const mfg = 'RF';
  const parts: number[] = [];
  const ident = 'VIRT';
  for (let i = 0; i < 4; i++) parts.push(ident.charCodeAt(i)!);
  parts.push(1, 0);
  parts.push(0, 0);
  parts.push(targetName.length);
  for (let i = 0; i < targetName.length; i++) parts.push(targetName.charCodeAt(i)!);
  parts.push(boardName.length);
  for (let i = 0; i < boardName.length; i++) parts.push(boardName.charCodeAt(i)!);
  parts.push(boardDesign.length);
  parts.push(mfg.length);
  for (let i = 0; i < mfg.length; i++) parts.push(mfg.charCodeAt(i)!);
  for (let i = 0; i < 32; i++) parts.push(0);
  parts.push(0);
  parts.push(0);
  parts.push(0x40, 0x1f);
  parts.push(0, 0, 0, 0);
  return new Uint8Array(parts);
}

/** 根据连接阶段发出的请求生成一条 FC→Configurator 的响应帧。 */
export function buildVirtualMspResponse(request: ArrayBuffer, ctx: VirtualMspContext): ArrayBuffer | null {
  const code = parseMspV1RequestCode(request);
  if (code === null) return null;

  let payload: Uint8Array;
  switch (code) {
    case MSPCodes.MSP_API_VERSION:
      payload = buildApiVersionPayload(ctx);
      break;
    case MSPCodes.MSP_FC_VARIANT:
      payload = buildFcVariantPayload();
      break;
    case MSPCodes.MSP_FC_VERSION:
      payload = buildFcVersionPayload(ctx);
      break;
    case MSPCodes.MSP_BUILD_INFO:
      payload = buildBuildInfoPayload(ctx);
      break;
    case MSPCodes.MSP_BOARD_INFO:
      payload = buildBoardInfoPayload();
      break;
    default:
      payload = new Uint8Array(0);
  }
  return encodeMspV1Response(code, payload);
}
