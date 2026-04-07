import { bit_check, bit_clear, bit_set } from './bit';

type BeeperDef = { bit: number; name: string; visible: boolean };

/**
 * 与 conference/beepers.js 一致（无 DOM / jQuery）。
 */
export class Beepers {
  private _beepers: BeeperDef[];
  private _beeperDisabledMask = 0;

  constructor(
    _config: unknown,
    supportedConditions?: string[],
  ) {
    const beepers: BeeperDef[] = [
      { bit: 0, name: 'GYRO_CALIBRATED', visible: true },
      { bit: 1, name: 'RX_LOST', visible: true },
      { bit: 2, name: 'RX_LOST_LANDING', visible: true },
      { bit: 3, name: 'DISARMING', visible: true },
      { bit: 4, name: 'ARMING', visible: true },
      { bit: 5, name: 'ARMING_GPS_FIX', visible: true },
      { bit: 6, name: 'BAT_CRIT_LOW', visible: true },
      { bit: 7, name: 'BAT_LOW', visible: true },
      { bit: 8, name: 'GPS_STATUS', visible: true },
      { bit: 9, name: 'RX_SET', visible: true },
      { bit: 10, name: 'ACC_CALIBRATION', visible: true },
      { bit: 11, name: 'ACC_CALIBRATION_FAIL', visible: true },
      { bit: 12, name: 'READY_BEEP', visible: true },
      { bit: 13, name: 'MULTI_BEEPS', visible: false },
      { bit: 14, name: 'DISARM_REPEAT', visible: true },
      { bit: 15, name: 'ARMED', visible: true },
      { bit: 16, name: 'SYSTEM_INIT', visible: true },
      { bit: 17, name: 'USB', visible: true },
      { bit: 18, name: 'BLACKBOX_ERASE', visible: true },
      { bit: 21, name: 'ARMING_GPS_NO_FIX', visible: true },
    ];

    if (supportedConditions) {
      this._beepers = [];
      for (const b of beepers) {
        if (supportedConditions.some((s) => s === b.name)) {
          this._beepers.push(b);
        }
      }
    } else {
      this._beepers = beepers.slice();
    }
  }

  getDisabledMask(): number {
    return this._beeperDisabledMask;
  }

  setDisabledMask(mask: number): void {
    this._beeperDisabledMask = mask;
  }

  isEnabled(beeperName: string): boolean {
    for (let i = 0; i < this._beepers.length; i++) {
      const b = this._beepers[i]!;
      if (b.name === beeperName && !bit_check(this._beeperDisabledMask, b.bit)) {
        return true;
      }
    }
    return false;
  }
}
