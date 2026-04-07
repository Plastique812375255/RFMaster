import { fcConfig } from '../msp/fcState';
import type { FlightController } from './flightController';

/**
 * 将握手阶段 `fcState.fcConfig` 合并进全局 `FC.CONFIG`，与 MSP 摘要一致。
 */
export function syncFcConfigFromMsp(fc: FlightController): void {
  const c = fc.CONFIG as Record<string, unknown>;
  c.apiVersion = fcConfig.apiVersion;
  c.flightControllerIdentifier = fcConfig.flightControllerIdentifier;
  c.flightControllerVersion = fcConfig.flightControllerVersion;
  c.buildInfo = fcConfig.buildInfo;
  c.msp_version = fcConfig.mspProtocolVersion;
  c.version =
    (fcConfig.flightControllerVersionMajor << 16) |
    (fcConfig.flightControllerVersionMinor << 8) |
    fcConfig.flightControllerVersionPatch;
  c.boardIdentifier = fcConfig.boardIdentifier;
  c.boardVersion = fcConfig.boardVersion;
  c.boardType = fcConfig.boardType;
  c.targetCapabilities = fcConfig.targetCapabilities;
  c.targetName = fcConfig.targetName;
  c.boardName = fcConfig.boardName;
  c.manufacturerId = fcConfig.manufacturerId;
  c.signature = [...fcConfig.signature];
  c.mcuTypeId = fcConfig.mcuTypeId;
  c.configurationState = fcConfig.configurationState;
  c.sampleRateHz = fcConfig.sampleRateHz;
  c.configurationProblems = fcConfig.configurationProblems;
}
