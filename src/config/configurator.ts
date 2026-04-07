/**
 * 与 conference/rotorflight-configurator-release-2.2.1/src/js/data_storage.js 中 CONFIGURATOR 对齐（连接校验用字段）。
 */
export const API_VERSION_RTFL_MIN = '12.6.0';
export const API_VERSION_RTFL_MAX = '12.8.0';

export const FW_VERSION_RTFL_MIN = '4.3.0-0';
export const FW_VERSION_RTFL_MAX = '4.5.99';

export const CONFIGURATOR = {
  API_VERSION_MIN_SUPPORTED: API_VERSION_RTFL_MIN,
  API_VERSION_MAX_SUPPORTED: API_VERSION_RTFL_MAX,
  FW_VERSION_MIN_SUPPORTED: FW_VERSION_RTFL_MIN,
  FW_VERSION_MAX_SUPPORTED: FW_VERSION_RTFL_MAX,
  version: '0.0.1',
  connectionValid: false,
  virtualMode: false,
  /** 虚拟连接时下拉选中的 MSP API 版本（如 12.8.0） */
  virtualApiVersion: '',
  /** 虚拟连接时下拉对应的固件版本字符串（如 4.5.0） */
  virtualFwVersion: '',
};
