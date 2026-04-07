import { bit_check } from './bit';
import { applyFcResetState } from './fcResetState';

/**
 * 对齐 conference/fc.svelte.js 的 FlightController + FC 单例（无 Svelte）。
 */
export class FlightController {
  /** 由 applyFcResetState 填充 */
  declare CONFIG: Record<string, unknown>;
  declare DEFAULT: Record<string, number>;

  readonly FILTER_TYPE_FLAGS = {
    PT1: 0,
    BIQUAD: 1,
  } as const;

  readonly CONFIGURATION_STATES = {
    DEFAULTS_BARE: 0,
    DEFAULTS_CUSTOM: 1,
    CONFIGURED: 2,
  } as const;

  readonly TARGET_CAPABILITIES_FLAGS = {
    HAS_VCP: 0,
    HAS_SOFTSERIAL: 1,
    IS_UNIFIED: 2,
    HAS_FLASH_BOOTLOADER: 3,
    SUPPORTS_CUSTOM_DEFAULTS: 4,
    HAS_CUSTOM_DEFAULTS: 5,
    SUPPORTS_RX_BIND: 6,
  } as const;

  readonly CONFIGURATION_PROBLEM_FLAGS = {
    ACC_NEEDS_CALIBRATION: 0,
    MOTOR_PROTOCOL_DISABLED: 1,
  } as const;

  constructor() {
    this.resetState();
  }

  resetState(): void {
    applyFcResetState(this as unknown as Parameters<typeof applyFcResetState>[0]);
  }

  getHardwareName(): string {
    const cfg = this.CONFIG as {
      targetName: string;
      boardIdentifier: string;
      boardName: string;
      manufacturerId: string;
    };
    let name: string;
    if (cfg.targetName) {
      name = cfg.targetName;
    } else {
      name = cfg.boardIdentifier;
    }
    if (cfg.boardName && cfg.boardName !== name) {
      name = `${cfg.boardName}(${name})`;
    }
    if (cfg.manufacturerId) {
      name = `${cfg.manufacturerId}/${name}`;
    }
    return name;
  }

  boardHasVcp(): boolean {
    const cfg = this.CONFIG as { targetCapabilities: number };
    return bit_check(cfg.targetCapabilities, this.TARGET_CAPABILITIES_FLAGS.HAS_VCP);
  }

  getFilterDefaults(): Record<string, number> {
    const base = this.DEFAULT as Record<string, number>;
    const versionFilterDefaults = { ...base };
    versionFilterDefaults.gyro_lowpass_hz = 125;
    versionFilterDefaults.gyro_lowpass_dyn_min_hz = 50;
    versionFilterDefaults.gyro_lowpass_dyn_max_hz = 150;
    versionFilterDefaults.gyro_lowpass_type = this.FILTER_TYPE_FLAGS.BIQUAD;
    versionFilterDefaults.gyro_lowpass2_hz = 500;
    versionFilterDefaults.gyro_lowpass2_type = this.FILTER_TYPE_FLAGS.BIQUAD;
    versionFilterDefaults.dterm_lowpass_hz = 50;
    versionFilterDefaults.dterm_lowpass_dyn_min_hz = 25;
    versionFilterDefaults.dterm_lowpass_dyn_max_hz = 60;
    versionFilterDefaults.dterm_lowpass_type = this.FILTER_TYPE_FLAGS.PT1;
    versionFilterDefaults.dterm_lowpass2_hz = 0;
    versionFilterDefaults.dterm_lowpass2_type = this.FILTER_TYPE_FLAGS.PT1;
    return versionFilterDefaults;
  }
}

export const FC = new FlightController();
