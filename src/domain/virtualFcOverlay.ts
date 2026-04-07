/**
 * 对齐 conference/VirtualFC.js#setVirtualConfig：在 resetState 之后叠虚拟硬件与解锁用数据。
 */
import { Beepers } from './beepers';
import type { FlightController } from './flightController';

export type VirtualFcOverlayOptions = {
  virtualApiVersion: string;
  fwVersion: string;
};

/** 与 resetState 填充后的 FC 实例一致；与 Record 相交以便调用处把 FC 传入 overlay。 */
export type FcOverlayTarget = FlightController & Record<string, unknown>;

/** applyVirtualFcOverlay 内使用的可变形状（由 applyFcResetState 保证存在）。 */
type OverlayFc = {
  CONFIG: Record<string, unknown>;
  BEEPER_CONFIG: { beepers: unknown; dshotBeaconConditions: unknown };
  MIXER_CONFIG: Record<string, unknown> & { mixer?: number };
  MOTOR_DATA: unknown[];
  MOTOR_3D_CONFIG: Record<string, number>;
  MOTOR_CONFIG: Record<string, unknown>;
  SERVO_CONFIG: Array<Record<string, number>>;
  ADJUSTMENT_RANGES: object[];
  SERIAL_CONFIG: { ports: object[] };
  LED_STRIP: object[];
  ANALOG: Record<string, number>;
  ADVANCED_CONFIG: Record<string, unknown>;
  BLACKBOX: Record<string, unknown>;
  BATTERY_CONFIG: Record<string, unknown>;
  BATTERY_STATE: Record<string, unknown>;
  DATAFLASH: Record<string, unknown>;
  SDCARD: Record<string, unknown>;
  SENSOR_CONFIG: Record<string, unknown>;
  RC: { channels: number[]; active_channels: number };
  AUX_CONFIG: string[];
  AUX_CONFIG_IDS: number[];
  RXFAIL_CONFIG: { mode: number; value: number }[];
};

export function applyVirtualFcOverlay(fc: FcOverlayTarget, opts: VirtualFcOverlayOptions): void {
  const v = fc as unknown as OverlayFc;
  const { virtualApiVersion, fwVersion } = opts;

  v.CONFIG.flightControllerVersion = fwVersion;
  v.CONFIG.apiVersion = virtualApiVersion;

  v.BEEPER_CONFIG.beepers = new Beepers(v.CONFIG);
  v.BEEPER_CONFIG.dshotBeaconConditions = new Beepers(v.CONFIG, ['RX_LOST', 'RX_SET']);

  v.MIXER_CONFIG.mixer = 3;

  v.MOTOR_DATA = Array.from({ length: 8 });
  v.MOTOR_3D_CONFIG = {
    deadband3d_low: 1406,
    deadband3d_high: 1514,
    neutral: 1460,
  };

  v.MOTOR_CONFIG = {
    ...v.MOTOR_CONFIG,
    minthrottle: 1070,
    maxthrottle: 2000,
    mincommand: 1000,
    motor_poles: [8, 8, 8, 8],
    use_dshot_telemetry: true,
    use_esc_sensor: false,
  };

  v.SERVO_CONFIG = Array.from({ length: 8 });
  for (let i = 0; i < v.SERVO_CONFIG.length; i++) {
    v.SERVO_CONFIG[i] = {
      mid: 1500,
      min: -500,
      max: 500,
      rate: 500,
      trim: 0,
      speed: 0,
    };
  }

  v.ADJUSTMENT_RANGES = Array.from({ length: 16 });
  for (let i = 0; i < v.ADJUSTMENT_RANGES.length; i++) {
    v.ADJUSTMENT_RANGES[i] = {
      slotIndex: 0,
      auxChannelIndex: 0,
      range: { start: 900, end: 900 },
      adjustmentFunction: 0,
      auxSwitchChannelIndex: 0,
    };
  }

  v.SERIAL_CONFIG.ports = Array.from({ length: 6 });
  v.SERIAL_CONFIG.ports[0] = {
    identifier: 20,
    auxChannelIndex: 0,
    functions: ['MSP'],
    msp_baudrate: 115200,
    gps_baudrate: 57600,
    telemetry_baudrate: 'AUTO',
    blackbox_baudrate: 115200,
  };
  for (let i = 1; i < v.SERIAL_CONFIG.ports.length; i++) {
    v.SERIAL_CONFIG.ports[i] = {
      identifier: i - 1,
      auxChannelIndex: 0,
      functions: [],
      msp_baudrate: 115200,
      gps_baudrate: 57600,
      telemetry_baudrate: 'AUTO',
      blackbox_baudrate: 115200,
    };
  }

  v.LED_STRIP = Array.from({ length: 256 });
  for (let i = 0; i < v.LED_STRIP.length; i++) {
    v.LED_STRIP[i] = {
      x: 0,
      y: 0,
      functions: ['c'],
      color: 0,
      directions: [],
      parameters: 0,
    };
  }

  v.ANALOG = {
    voltage: 12,
    mAhdrawn: 1200,
    rssi: 100,
    amperage: 3,
  };

  v.CONFIG.sampleRateHz = 12000;
  v.ADVANCED_CONFIG.pid_process_denom = 2;

  v.BLACKBOX.supported = true;

  v.BATTERY_CONFIG = {
    ...v.BATTERY_CONFIG,
    vbatmincellvoltage: 1,
    vbatmaxcellvoltage: 4,
    vbatwarningcellvoltage: 3,
    capacity: 10000,
    voltageMeterSource: 1,
    currentMeterSource: 1,
  };

  v.BATTERY_STATE = {
    ...v.BATTERY_STATE,
    cellCount: 10,
    voltage: 20,
    mAhDrawn: 1000,
    amperage: 3,
  };

  v.DATAFLASH = {
    ready: true,
    supported: true,
    sectors: 1024,
    totalSize: 40000,
    usedSize: 10000,
  };

  v.SDCARD = {
    supported: true,
    state: 1,
    filesystemLastError: 0,
    freeSizeKB: 1024,
    totalSizeKB: 2048,
  };

  v.SENSOR_CONFIG = {
    ...v.SENSOR_CONFIG,
    acc_hardware: 1,
    baro_hardware: 1,
    mag_hardware: 1,
  };

  v.RC = {
    channels: Array.from({ length: 16 }),
    active_channels: 16,
  };
  for (let i = 0; i < v.RC.channels.length; i++) {
    v.RC.channels[i] = 1500;
  }

  v.AUX_CONFIG = [
    'ARM',
    'ANGLE',
    'HORIZON',
    'ANTI GRAVITY',
    'MAG',
    'HEADFREE',
    'HEADADJ',
    'CAMSTAB',
    'PASSTHRU',
    'BEEPERON',
    'LEDLOW',
    'CALIB',
    'TELEMETRY',
    'SERVO1',
    'SERVO2',
    'SERVO3',
    'BLACKBOX',
    'FAILSAFE',
    'AIRMODE',
    '3D',
    'FPV ANGLE MIX',
    'BLACKBOX ERASE',
    'CAMERA CONTROL 1',
    'CAMERA CONTROL 2',
    'CAMERA CONTROL 3',
    'FLIP OVER AFTER CRASH',
    'BOXPREARM',
    'BEEP GPS SATELLITE COUNT',
    'VTX PIT MODE',
    'USER1',
    'USER2',
    'USER3',
    'USER4',
    'PID AUDIO',
    'PARALYZE',
    'GPS RESCUE',
    'ACRO TRAINER',
    'DISABLE VTX CONTROL',
    'LAUNCH CONTROL',
  ];
  v.AUX_CONFIG_IDS = [
    0, 1, 2, 4, 5, 6, 7, 8, 12, 13, 15, 17, 19, 20, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
  ];

  v.RXFAIL_CONFIG = Array.from({ length: 16 });
  for (let i = 0; i < 16; i++) {
    v.RXFAIL_CONFIG[i] = { mode: 1, value: 1500 };
  }

  v.CONFIG.activeSensors = 63;
}
