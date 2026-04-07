import { bit_check, bit_clear, bit_set } from './bit';

/**
 * 与 conference/features.svelte.js 一致（无 Svelte $state，仅 bitfield）。
 */
export class Features {
  static FLAGS = {
    RX_PPM: 0,
    RX_SERIAL: 3,
    SOFTSERIAL: 6,
    GPS: 7,
    SONAR: 9,
    TELEMETRY: 10,
    RX_PARALLEL_PWM: 13,
    RX_MSP: 14,
    RSSI_ADC: 15,
    LED_STRIP: 16,
    DISPLAY: 17,
    OSD: 18,
    CMS: 19,
    RX_SPI: 25,
    GOVERNOR: 26,
    ESC_SENSOR: 27,
    FREQ_SENSOR: 28,
    DYN_NOTCH: 29,
    RPM_FILTER: 30,
  } as const;

  bitfield = 0;

  isEnabled(featureName: keyof typeof Features.FLAGS): boolean {
    return bit_check(this.bitfield, Features.FLAGS[featureName]);
  }

  setFeature(featureName: keyof typeof Features.FLAGS, enabled: boolean): void {
    const b = Features.FLAGS[featureName];
    this.bitfield = enabled ? bit_set(this.bitfield, b) : bit_clear(this.bitfield, b);
  }
}
