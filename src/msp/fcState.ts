import { MspReader } from './mspReader';
import { MSPCodes } from './mspCodes';

const SIGNATURE_LENGTH = 32;

/** 连接阶段解析所需 FC 状态（与 MSPHelper 对应字段对齐）。 */
export const fcConfig = {
  mspProtocolVersion: 0,
  apiVersion: '',
  flightControllerIdentifier: '',
  flightControllerVersion: '',
  flightControllerVersionMajor: 0,
  flightControllerVersionMinor: 0,
  flightControllerVersionPatch: 0,
  buildInfo: '',
  buildRevision: '',
  buildVersion: '',
  boardName: '',
  boardDesign: '',
  boardIdentifier: '',
  targetName: '',
  manufacturerId: '',
  boardVersion: 0,
  boardType: 0,
  targetCapabilities: 0,
  signature: [] as number[],
  mcuTypeId: 0,
  configurationState: 0,
  sampleRateHz: 0,
  configurationProblems: 0,
};

export function resetFcConfig(): void {
  fcConfig.mspProtocolVersion = 0;
  fcConfig.apiVersion = '';
  fcConfig.flightControllerIdentifier = '';
  fcConfig.flightControllerVersion = '';
  fcConfig.flightControllerVersionMajor = 0;
  fcConfig.flightControllerVersionMinor = 0;
  fcConfig.flightControllerVersionPatch = 0;
  fcConfig.buildInfo = '';
  fcConfig.buildRevision = '';
  fcConfig.buildVersion = '';
  fcConfig.boardName = '';
  fcConfig.boardDesign = '';
  fcConfig.boardIdentifier = '';
  fcConfig.targetName = '';
  fcConfig.manufacturerId = '';
  fcConfig.boardVersion = 0;
  fcConfig.boardType = 0;
  fcConfig.targetCapabilities = 0;
  fcConfig.signature = [];
  fcConfig.mcuTypeId = 0;
  fcConfig.configurationState = 0;
  fcConfig.sampleRateHz = 0;
  fcConfig.configurationProblems = 0;
}

export function getHardwareName(): string {
  let name: string;
  if (fcConfig.targetName) {
    name = fcConfig.targetName;
  } else {
    name = fcConfig.boardIdentifier;
  }
  if (fcConfig.boardName && fcConfig.boardName !== name) {
    name = `${fcConfig.boardName}(${name})`;
  }
  if (fcConfig.manufacturerId) {
    name = `${fcConfig.manufacturerId}/${name}`;
  }
  return name;
}

/** 在 MSP 收到对应 code 的回复后调用，解析 dataView 写入 fcConfig */
export function applyMspPayloadToFc(code: number, data: DataView | null): void {
  if (!data || data.byteLength === 0) return;
  const r = new MspReader(data);

  switch (code) {
    case MSPCodes.MSP_API_VERSION: {
      fcConfig.mspProtocolVersion = r.readU8();
      fcConfig.apiVersion = `${r.readU8()}.${r.readU8()}.0`;
      break;
    }
    case MSPCodes.MSP_FC_VARIANT: {
      let id = '';
      for (let i = 0; i < 4; i++) {
        id += String.fromCharCode(r.readU8());
      }
      fcConfig.flightControllerIdentifier = id;
      break;
    }
    case MSPCodes.MSP_FC_VERSION: {
      fcConfig.flightControllerVersionMajor = r.readU8();
      fcConfig.flightControllerVersionMinor = r.readU8();
      fcConfig.flightControllerVersionPatch = r.readU8();
      fcConfig.flightControllerVersion = `${fcConfig.flightControllerVersionMajor}.${fcConfig.flightControllerVersionMinor}.${fcConfig.flightControllerVersionPatch}`;
      break;
    }
    case MSPCodes.MSP_BUILD_INFO: {
      let info = '';
      const dateLength = 11;
      for (let i = 0; i < dateLength; i++) {
        info += String.fromCharCode(r.readU8());
      }
      info += ' ';
      const timeLength = 8;
      for (let i = 0; i < timeLength; i++) {
        info += String.fromCharCode(r.readU8());
      }
      fcConfig.buildInfo = info;
      let revString = '';
      const revLength = 7;
      for (let i = 0; i < revLength; i++) {
        revString += String.fromCharCode(r.readU8());
      }
      fcConfig.buildRevision = revString;
      let verString = '';
      const verLength = r.readU8();
      for (let i = 0; i < verLength; i++) {
        verString += String.fromCharCode(r.readU8());
      }
      fcConfig.buildVersion = verString;
      break;
    }
    case MSPCodes.MSP_BOARD_INFO: {
      fcConfig.boardName = '';
      fcConfig.boardDesign = '';
      fcConfig.boardIdentifier = '';
      fcConfig.targetName = '';
      fcConfig.manufacturerId = '';
      for (let i = 0; i < 4; i++) {
        fcConfig.boardIdentifier += String.fromCharCode(r.readU8());
      }
      fcConfig.boardVersion = r.readU16();
      fcConfig.boardType = r.readU8();
      fcConfig.targetCapabilities = r.readU8();
      let length = r.readU8();
      for (let i = 0; i < length; i++) {
        fcConfig.targetName += String.fromCharCode(r.readU8());
      }
      length = r.readU8();
      for (let i = 0; i < length; i++) {
        fcConfig.boardName += String.fromCharCode(r.readU8());
      }
      length = r.readU8();
      for (let i = 0; i < length; i++) {
        fcConfig.boardDesign += String.fromCharCode(r.readU8());
      }
      length = r.readU8();
      for (let i = 0; i < length; i++) {
        fcConfig.manufacturerId += String.fromCharCode(r.readU8());
      }
      fcConfig.signature = [];
      for (let i = 0; i < SIGNATURE_LENGTH; i++) {
        fcConfig.signature.push(r.readU8());
      }
      fcConfig.mcuTypeId = r.readU8();
      fcConfig.configurationState = r.readU8();
      fcConfig.sampleRateHz = r.readU16();
      fcConfig.configurationProblems = r.readU32();
      break;
    }
    default:
      break;
  }
}
