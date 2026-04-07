import semver from 'semver';
import { CONFIGURATOR } from '../config/configurator';
import { FC } from '../domain/flightController';
import { syncFcConfigFromMsp } from '../domain/fcMspSync';
import { applyVirtualFcOverlay, type FcOverlayTarget } from '../domain/virtualFcOverlay';
import { en, formatMsg, stripTags } from '../i18n/en';
import { fcConfig, getHardwareName, resetFcConfig } from './fcState';
import { MSPCodes } from './mspCodes';
import type { MspProtocol } from './mspProtocol';
import { mspPromise } from './mspRequest';

export type ConnectionFailureKind = 'disconnect' | 'cli';

export class ConnectionValidationError extends Error {
  constructor(
    message: string,
    readonly kind: ConnectionFailureKind,
  ) {
    super(message);
    this.name = 'ConnectionValidationError';
  }
}

/**
 * 对齐 conference/rotorflight-configurator-release-2.2.1/src/js/serial_backend.js 中 onOpen 的 try 块（至 MSP_BOARD_INFO + processBoardInfo 日志）。
 */
export async function runConnectionValidation(
  msp: MspProtocol,
  send: (buf: ArrayBuffer) => Promise<void>,
): Promise<void> {
  resetFcConfig();

  await mspPromise(msp, send, MSPCodes.MSP_API_VERSION, null);
  const { API_VERSION_MIN_SUPPORTED, API_VERSION_MAX_SUPPORTED } = CONFIGURATOR;
  const { apiVersion } = fcConfig;
  console.log(formatMsg(en.apiVersionReceived, apiVersion));

  if (!semver.valid(apiVersion)) {
    throw new ConnectionValidationError(stripTags(formatMsg(en.apiVersionInvalid, apiVersion)), 'disconnect');
  }
  if (!semver.gte(apiVersion, API_VERSION_MIN_SUPPORTED) || !semver.lte(apiVersion, API_VERSION_MAX_SUPPORTED)) {
    throw new ConnectionValidationError(stripTags(en.firmwareVersionNotSupported), 'cli');
  }

  await mspPromise(msp, send, MSPCodes.MSP_FC_VARIANT, null);
  if (fcConfig.flightControllerIdentifier !== 'RTFL') {
    throw new ConnectionValidationError(stripTags(en.firmwareTypeNotSupported), 'cli');
  }

  await mspPromise(msp, send, MSPCodes.MSP_FC_VERSION, null);
  await mspPromise(msp, send, MSPCodes.MSP_BUILD_INFO, null);

  const { FW_VERSION_MIN_SUPPORTED, FW_VERSION_MAX_SUPPORTED } = CONFIGURATOR;
  const { buildVersion, buildRevision, buildInfo } = fcConfig;
  console.log(
    formatMsg(en.firmwareInfoReceived, fcConfig.flightControllerIdentifier, buildVersion),
  );
  console.log(formatMsg(en.buildInfoReceived, buildRevision, buildInfo));

  if (!semver.valid(buildVersion)) {
    throw new ConnectionValidationError(stripTags(formatMsg(en.firmwareVersionInvalid, buildVersion)), 'disconnect');
  }
  if (!semver.gte(buildVersion, FW_VERSION_MIN_SUPPORTED) || !semver.lte(buildVersion, FW_VERSION_MAX_SUPPORTED)) {
    throw new ConnectionValidationError(stripTags(en.firmwareVersionNotSupported), 'cli');
  }

  await mspPromise(msp, send, MSPCodes.MSP_BOARD_INFO, null);
  console.log(formatMsg(en.boardInfoReceived, getHardwareName(), String(fcConfig.boardVersion)));

  FC.resetState();
  syncFcConfigFromMsp(FC);
  if (CONFIGURATOR.virtualMode) {
    applyVirtualFcOverlay(FC as FcOverlayTarget, {
      virtualApiVersion: CONFIGURATOR.virtualApiVersion || fcConfig.apiVersion,
      fwVersion: CONFIGURATOR.virtualFwVersion || fcConfig.flightControllerVersion,
    });
  }
}
