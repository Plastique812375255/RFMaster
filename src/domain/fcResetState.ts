/**
 * 由 conference/fc.svelte.js 的 resetState 机械转换（this → fc）。
 */
import { Features } from "./features";

export function applyFcResetState(fc: {
  FILTER_TYPE_FLAGS: { PT1: number; BIQUAD: number };
  [k: string]: unknown;
}): void {
  fc.CONFIG = {
        apiVersion:                 "0.0.0",
        flightControllerIdentifier: '',
        flightControllerVersion:    '',
        version:                    0,
        buildInfo:                  '',
        multiType:                  0,
        msp_version:                0,
        capability:                 0,
        pidCycleTime:               0,
        gyroCycleTime:              0,
        cpuLoad:                    0,
        rtLoad:                     0,
        activeSensors:              0,
        mode:                       0,
        motorCount:                 0,
        servoCount:                 0,
        numProfiles:                6,
        profile:                    0,
        numRateProfile:             6,
        rateProfile:                0,
        uid:                        [0, 0, 0],
        accelerometerTrims:         [0, 0],
        name:                       '',
        displayName:                'JOE PILOT',
        boardType:                  0,
        extraFlags:                 0,
        armingDisableCount:         0,
        armingDisableFlags:         0,
        armingDisabled:             false,
        enableArmingFlag:           false,
        motorOverrideEnabled:       false,
        servoOverrideEnabled:       false,
        mixerOverrideEnabled:       false,
        boardIdentifier:            "",
        boardVersion:               0,
        targetCapabilities:         0,
        targetName:                 "",
        boardName:                  "",
        manufacturerId:             "",
        signature:                  [],
        mcuTypeId:                  255,
        configurationState:         0,
        sampleRateHz:               0,
        configurationProblems:      0,
      };
  
      fc.BATTERY_CONFIG = {
        capacity:                   0,
        cellCount:                  0,
        voltageMeterSource:         0,
        currentMeterSource:         0,
        vbatmincellvoltage:         0,
        vbatmaxcellvoltage:         0,
        vbatfullcellvoltage:        0,
        vbatwarningcellvoltage:     0,
        lvcPercentage:              0,
        mahWarningPercentage:       0,
      };
  
      fc.BATTERY_STATE = {
        batteryState:               0,
        cellCount:                  0,
        capacity:                   0,
        mAhDrawn:                   0,
        voltage:                    0,
        amperage:                   0,
        chargeLevel:                0,
      };
  
      fc.ANALOG = {
        voltage:                    0,
        mAhdrawn:                   0,
        rssi:                       0,
        amperage:                   0,
      };
  
      fc.COPY_PROFILE = {
        type:                       0,
        dstProfile:                 0,
        srcProfile:                 0,
      };
  
      fc.FEATURE_CONFIG = {
        features:                   new Features(),
      };
  
      fc.BEEPER_CONFIG = {
        beepers:                    0,
        dshotBeaconTone:            0,
        dshotBeaconConditions:      0,
      };
  
      fc.MIXER_CONFIG = {
        main_rotor_dir:             0,
        tail_rotor_mode:            0,
        tail_motor_idle:            0,
        tail_center_trim:           0,
        swash_type:                 0,
        swash_ring:                 0,
        swash_phase:                0,
        swash_trim:                 [ 0, 0, 0 ],
        blade_pitch_limit:          0,
        coll_rpm_correction:        0,
        coll_geo_correction:        0,
        coll_tilt_correction_pos:   0,
        coll_tilt_correction_neg:   0,
      };
  
      fc.MIXER_INPUTS =             [];
      fc.MIXER_RULES =              [];
      fc.MIXER_OVERRIDE =           Array.from({length: 29});
  
      fc.BOARD_ALIGNMENT_CONFIG = {
        roll:                       0,
        pitch:                      0,
        yaw:                        0,
      };
  
      fc.LED_STRIP =                [];
      fc.LED_COLORS =               [];
      fc.LED_MODE_COLORS =          [];
  
      fc.LED_STRIP_CONFIG = {
        ledstrip_beacon_armed_only:     0,
        ledstrip_beacon_color:          0,
        ledstrip_beacon_percent:        0,
        ledstrip_beacon_period_ms:      0,
        ledstrip_blink_period_ms:       0,
        ledstrip_brightness:            0,
        ledstrip_fade_rate:             0,
        ledstrip_flicker_rate:          0,
        ledstrip_grb_rgb:               0,
        ledstrip_profile:               0,
        ledstrip_race_color:            0,
        ledstrip_visual_beeper:         0,
        ledstrip_visual_beeper_color:   0
      };
  
      fc.PID = {
        controller:                 0,
      };
  
      fc.PID_NAMES =                [];
      fc.PIDS_ACTIVE = Array.from({length: 3});
      fc.PIDS = Array.from({length: 3});
      for (let i = 0; i < 3; i++) {
        fc.PIDS_ACTIVE[i] = Array.from({length: 8});
        fc.PIDS[i] = Array.from({length: 8});
      }
  
      fc.RC_MAP = [];
  
      fc.RC = {
        active_channels:            0,
        channels:                   Array.from({length: 32}),
      };
  
      fc.RX_CHANNELS = Array.from({length: 32});
      fc.RC_COMMAND = Array.from({length: 32});
  
      fc.RC_TUNING = {
        RC_RATE:                    0,
        RC_EXPO:                    0,
        roll_pitch_rate:            0,
        roll_rate:                  0,
        pitch_rate:                 0,
        yaw_rate:                   0,
        collective_rate:            0,
        dynamic_THR_PID:            0,
        throttle_MID:               0,
        throttle_EXPO:              0,
        dynamic_THR_breakpoint:     0,
        RC_YAW_EXPO:                0,
        rcYawRate:                  0,
        rcPitchRate:                0,
        RC_PITCH_EXPO:              0,
        rcCollectiveRate:           0,
        RC_COLLECTIVE_EXPO:         0,
        roll_rate_limit:            2000,
        pitch_rate_limit:           2000,
        yaw_rate_limit:             2000,
        collective_rate_limit:      2000,
        roll_response_time:         0,
        pitch_response_time:        0,
        yaw_response_time:          0,
        collective_response_time:   0,
        roll_accel_limit:           0,
        pitch_accel_limit:          0,
        yaw_accel_limit:            0,
        collective_accel_limit:     0,
  
        roll_setpoint_boost_gain:   0,
        roll_setpoint_boost_cutoff: 0,
        pitch_setpoint_boost_gain:  0,
        pitch_setpoint_boost_cutoff:0,
        yaw_setpoint_boost_gain:    0,
        yaw_setpoint_boost_cutoff:  0,
        collective_setpoint_boost_gain:   0,
        collective_setpoint_boost_cutoff: 0,
  
        yaw_dynamic_ceiling_gain:   0,
        yaw_dynamic_deadband_gain:  0,
        yaw_dynamic_deadband_filter:0,
      };
  
      fc.AUX_CONFIG =               [];
      fc.AUX_CONFIG_IDS =           [];
  
      fc.MODE_RANGES =              [];
      fc.MODE_RANGES_EXTRA =        [];
      fc.ADJUSTMENT_RANGES =        [];
  
      fc.SERVO_CONFIG =             [];
      fc.SERVO_RULES =              [];
  
      fc.SERIAL_CONFIG = {
        ports:                      [],
      };
  
      fc.ESC_SENSOR_CONFIG = {
        protocol:                   0,
        half_duplex:                0,
        update_hz:                  0,
        current_offset:             0,
        hw4_current_offset:         0,
        hw4_current_gain:           0,
        hw4_voltage_gain:           0,
        pinswap:                    0,
        voltage_correction:         0,
        current_correction:         0,
        consumption_correction:     0,
      };
  
      fc.SENSOR_DATA = {
        gyroscope:                  [0, 0, 0],
        accelerometer:              [0, 0, 0],
        magnetometer:               [0, 0, 0],
        altitude:                   0,
        sonar:                      0,
        kinematics:                 [0.0, 0.0, 0.0],
        debug:                      [0, 0, 0, 0],
      };
  
      fc.MOTOR_DATA =               [0, 0, 0, 0];
      fc.MOTOR_OVERRIDE =           [0, 0, 0, 0];
      fc.SERVO_DATA =               [0, 0, 0, 0, 0, 0, 0, 0];
      fc.SERVO_OVERRIDE =           [0, 0, 0, 0, 0, 0, 0, 0];
  
      fc.MOTOR_TELEMETRY_DATA = {
        rpm:                        [0, 0, 0, 0, 0, 0, 0, 0],
        invalidPercent:             [0, 0, 0, 0, 0, 0, 0, 0],
        voltage:                    [0, 0, 0, 0, 0, 0, 0, 0],
        current:                    [0, 0, 0, 0, 0, 0, 0, 0],
        consumption:                [0, 0, 0, 0, 0, 0, 0, 0],
        temperature:                [0, 0, 0, 0, 0, 0, 0, 0],
        temperature2:               [0, 0, 0, 0, 0, 0, 0, 0],
      };
  
      fc.GPS_DATA = {
        fix:                        0,
        numSat:                     0,
        lat:                        0,
        lon:                        0,
        alt:                        0,
        speed:                      0,
        ground_course:              0,
        distanceToHome:             0,
        ditectionToHome:            0,
        update:                     0,
  
        chn:                        [],
        svid:                       [],
        quality:                    [],
        cno:                        [],
      };
  
      fc.VOLTAGE_METERS =           [];
      fc.VOLTAGE_METER_CONFIGS =    [];
      fc.CURRENT_METERS =           [];
      fc.CURRENT_METER_CONFIGS =    [];
  
      fc.DEBUG_CONFIG = {
        debugMode:                  0,
        debugAxis:                  0,
        debugModeCount:             0,
        debugValueCount:            0,
      };
  
      fc.ARMING_CONFIG = {
        auto_disarm_delay:          0,
        disarm_kill_switch:         0,
      };
  
      fc.MOTOR_CONFIG = {
        mincommand:                 0,
        minthrottle:                0,
        maxthrottle:                0,
        motor_pwm_protocol:         0,
        motor_pwm_rate:             0,
        motor_poles:                [ 0, 0, 0, 0 ],
        motor_rpm_lpf:              [ 0, 0, 0, 0 ],
        use_dshot_telemetry:        false,
        use_unsynced_pwm:           false,
        main_rotor_gear_ratio:      [ 1, 1 ],
        tail_rotor_gear_ratio:      [ 1, 1 ],
      };
  
      fc.GPS_CONFIG = {
        provider:                   0,
        ublox_sbas:                 0,
        auto_config:                0,
        auto_baud:                  0,
        home_point_once:            0,
        ublox_use_galileo:          0,
      };
  
      fc.RSSI_CONFIG = {
        channel:                    0,
        scale:                      0,
        invert:                     0,
        offset:                     0,
      };
  
      fc.DATAFLASH = {
        ready:                      false,
        supported:                  false,
        sectors:                    0,
        totalSize:                  0,
        usedSize:                   0,
      };
  
      fc.SDCARD = {
        supported:                  false,
        state:                      0,
        filesystemLastError:        0,
        freeSizeKB:                 0,
        totalSizeKB:                0,
      };
  
      fc.BLACKBOX = {
        supported:                  false,
        blackboxDevice:             0,
        blackboxMode:               0,
        blackboxDenom:              0,
        blackboxFields:             0,
        blackboxInitialEraseKiB:    0,
        blackboxRollingErase:       0,
        blackboxGracePeriod:        0,
      };
  
      fc.TRANSPONDER = {
        supported:                  false,
        data:                       [],
        provider:                   0,
        providers:                  [],
      };
  
      fc.SENSOR_ALIGNMENT = {
        gyro_1_align:               0,
        gyro_2_align:               0,
        align_mag:                  0,
      };
  
      fc.ADVANCED_CONFIG = {
        gyro_sync_denom:            1,
        pid_process_denom:          1,
      };
  
      fc.FILTER_CONFIG = {
        gyro_hardware_lpf:          0,
        gyro_lowpass_type:          0,
        gyro_lowpass_hz:            0,
        gyro_lowpass2_type:         0,
        gyro_lowpass2_hz:           0,
        gyro_notch_hz:              0,
        gyro_notch_cutoff:          0,
        gyro_notch2_hz:             0,
        gyro_notch2_cutoff:         0,
        dterm_lowpass_type:         0,
        dterm_lowpass_hz:           0,
        dterm_lowpass2_type:        0,
        dterm_lowpass2_hz:          0,
        dterm_notch_hz:             0,
        dterm_notch_cutoff:         0,
        gyro_lowpass_dyn_min_hz:    0,
        gyro_lowpass_dyn_max_hz:    0,
        dterm_lowpass_dyn_min_hz:   0,
        dterm_lowpass_dyn_max_hz:   0,
        dyn_notch_count:            0,
        dyn_notch_q:                0,
        dyn_notch_min_hz:           0,
        dyn_notch_max_hz:           0,
        rpm_preset:                 0,
        rpm_min_hz:                 0,
      };
  
      fc.RPM_FILTER_CONFIG = [];
      fc.RPM_FILTER_CONFIG_V2 = [];
  
      fc.PID_PROFILE = {
        rollPitchItermIgnoreRate:   0,
        yawItermIgnoreRate:         0,
        yaw_p_limit:                0,
        deltaMethod:                0,
        vbatPidCompensation:        0,
        dtermSetpointTransition:    0,
        dtermSetpointWeight:        0,
        toleranceBand:              0,
        toleranceBandReduction:     0,
        itermThrottleGain:          0,
        pidMaxVelocity:             0,
        pidMaxVelocityYaw:          0,
        levelAngleLimit:            0,
        levelSensitivity:           0,
        itermThrottleThreshold:     0,
        itermAcceleratorGain:       0,
        error_rotation:             0,
        error_decay_time_ground:    0,
        error_decay_time_cyclic:    0,
        error_decay_time_yaw:       0,
        error_decay_limit_cyclic:   0,
        error_decay_limit_yaw:      0,
        errorLimitRoll:             0,
        errorLimitPitch:            0,
        errorLimitYaw:              0,
        offsetLimitRoll:            0,
        offsetLimitPitch:           0,
        gyroCutoffRoll:             0,
        gyroCutoffPitch:            0,
        gyroCutoffYaw:              0,
        dtermCutoffRoll:            0,
        dtermCutoffPitch:           0,
        dtermCutoffYaw:             0,
        btermCutoffRoll:            0,
        btermCutoffPitch:           0,
        btermCutoffYaw:             0,
        smartFeedforward:           0,
        itermRelax:                 0,
        itermRelaxType:             0,
        itermRelaxCutoff:           0,
        itermRelaxCutoffRoll:       0,
        itermRelaxCutoffPitch:      0,
        itermRelaxCutoffYaw:        0,
        itermRelaxLevelRoll:        0,
        itermRelaxLevelPitch:       0,
        itermRelaxLevelYaw:         0,
        absoluteControlGain:        0,
        throttleBoost:              0,
        levelAngleStrength:         0,
        horizonLevelStrength:       0,
        acroTrainerAngleLimit:      0,
        acroTrainerLimit:           0,
        acroTrainerGain:            0,
        feedforwardRoll:            0,
        feedforwardPitch:           0,
        feedforwardYaw:             0,
        feedforwardTransition:      0,
        antiGravityMode:            0,
        dMinRoll:                   0,
        dMinPitch:                  0,
        dMinYaw:                    0,
        dMinGain:                   0,
        dMinAdvance:                0,
        useIntegratedYaw:           0,
        integratedYawRelax:         0,
        motorOutputLimit:           0,
        autoProfileCellCount:       0,
        idleMinRpm:                 0,
        ff_interpolate_sp:          0,
        ff_smooth_factor:           0,
        ff_boost:                   0,
        vbat_sag_compensation:      0,
        thrustLinearization:        0,
        yawCenterOffset:            0,
        yawStopGainCW:              0,
        yawStopGainCCW:             0,
        yawPrecompCutoff:           0,
        yawFFCyclicGain:            0,
        yawFFCollectiveGain:        0,
        yawFFImpulseGain:           0,
        yawFFImpulseDecay:          0,
        pitchFFCollectiveGain:      0,
        cyclicCrossCouplingGain:    0,
        cyclicCrossCouplingRatio:   0,
        cyclicCrossCouplingCutoff:  0,
        pid_mode:                   0,
        rescueMode:                 0,
        rescueFlipMode:             0,
        rescueFlipGain:             0,
        rescuePullupTime:           0,
        rescueClimbTime:            0,
        rescueFlipTime:             0,
        rescueExitTime:             0,
        rescuePullupCollective:     0,
        rescueClimbCollective:      0,
        rescueHoverCollective:      0,
        rescueHoverAltitude:        0,
        rescueAltitudePGain:        0,
        rescueAltitudeIGain:        0,
        rescueAltitudeDGain:        0,
        rescueMaxCollective:        0,
        rescueMaxRate:              0,
        rescueMaxAccel:             0,
        yaw_inertia_precomp_gain:   0,
        yaw_inertia_precomp_cutoff: 0,
      };
  
      fc.GOVERNOR = {
        gov_mode:                       0,
        gov_startup_time:               0,
        gov_spoolup_time:               0,
        gov_spoolup_min_throttle:       0,
        gov_tracking_time:              0,
        gov_recovery_time:              0,
        gov_zero_throttle_timeout:      0,
        gov_lost_headspeed_timeout:     0,
        gov_autorotation_timeout:       0,
        gov_autorotation_bailout_time:  0,
        gov_autorotation_min_entry_time: 0,
        gov_handover_throttle:          0,
        gov_headspeed:                  0,
        gov_gain:                       0,
        gov_p_gain:                     0,
        gov_i_gain:                     0,
        gov_d_gain:                     0,
        gov_f_gain:                     0,
        gov_tta_gain:                   0,
        gov_tta_limit:                  0,
        gov_yaw_ff_weight:              0,
        gov_cyclic_ff_weight:           0,
        gov_collective_ff_weight:       0,
        gov_max_throttle:               0,
        gov_min_throttle:               0,
        gov_pwr_filter:                 0,
        gov_rpm_filter:                 0,
        gov_tta_filter:                 0,
        gov_ff_filter:                  0,
      };
  
      fc.SENSOR_CONFIG = {
        acc_hardware:               0,
        baro_hardware:              0,
        mag_hardware:               0,
        gyro_to_use:                0,
        gyroHighFsr:                0,
        gyroMovementCalibThreshold: 0,
        gyroCalibDuration:          0,
        gyroOffsetYaw:              0,
        gyroCheckOverflow:          0,
      };
  
      fc.RX_CONFIG = {
        serialrx_provider:            0,
        serialrx_inverted:            0,
        serialrx_halfduplex:          0,
        rx_pulse_min:                 0,
        rx_pulse_max:                 0,
        rxSpiProtocol:                0,
        rxSpiId:                      0,
        rxSpiRfChannelCount:          0,
        serialrx_pinswap:             0,
      };
  
      fc.RC_CONFIG = {
        rc_center:                    0,
        rc_deflection:                0,
        rc_arm_throttle:              0,
        rc_min_throttle:              0,
        rc_max_throttle:              0,
        rc_deadband:                  0,
        rc_yaw_deadband:              0,
      };
  
      fc.FAILSAFE_CONFIG = {
        failsafe_delay:                 0,
        failsafe_off_delay:             0,
        failsafe_throttle:              0,
        failsafe_switch_mode:           0,
        failsafe_throttle_low_delay:    0,
        failsafe_procedure:             0,
      };
  
      fc.TELEMETRY_CONFIG = {
        telemetry_inverted:             0,
        telemetry_halfduplex:           0,
        telemetry_sensors:              0,
        telemetry_pinswap:              0,
        crsf_telemetry_mode:            0,
        crsf_telemetry_rate:            0,
        crsf_telemetry_ratio:           0,
        telemetry_sensors_list:         [],
      };
  
      fc.GPS_RESCUE = {
        angle:                          0,
        initialAltitudeM:               0,
        descentDistanceM:               0,
        rescueGroundspeed:              0,
        throttleMin:                    0,
        throttleMax:                    0,
        throttleHover:                  0,
        sanityChecks:                   0,
        minSats:                        0,
        ascendRate:                     0,
        descendRate:                    0,
        allowArmingWithoutFix:          0,
        altitudeMode:                   0,
      };
  
      fc.RXFAIL_CONFIG = [];
  
      fc.MOTOR_OUTPUT_ORDER =           [];
  
      fc.MULTIPLE_MSP = {
        msp_commands:                   [],
      };
  
      fc.DEFAULT = {
        gyro_lowpass_hz:                100,
        gyro_lowpass_dyn_min_hz:        150,
        gyro_lowpass_dyn_max_hz:        450,
        gyro_lowpass_type:              fc.FILTER_TYPE_FLAGS.PT1,
        gyro_lowpass2_hz:               300,
        gyro_lowpass2_type:             fc.FILTER_TYPE_FLAGS.PT1,
        gyro_notch_cutoff:              300,
        gyro_notch_hz:                  400,
        gyro_notch2_cutoff:             100,
        gyro_notch2_hz:                 200,
        gyro_rpm_notch_harmonics:         3,
        gyro_rpm_notch_min_hz:          100,
        dterm_lowpass_hz:               100,
        dterm_lowpass_dyn_min_hz:       150,
        dterm_lowpass_dyn_max_hz:       250,
        dyn_lpf_curve_expo:             5,
        dterm_lowpass_type:             fc.FILTER_TYPE_FLAGS.PT1,
        dterm_lowpass2_hz:              150,
        dterm_lowpass2_type:            fc.FILTER_TYPE_FLAGS.BIQUAD,
        dterm_notch_cutoff:             160,
        dterm_notch_hz:                 260,
        yaw_lowpass_hz:                 100,
        dyn_notch_q:                     20,
        dyn_notch_count:                  0,
        dyn_notch_q_rpm:                250, // default with rpm filtering
        dyn_notch_count_rpm:              0,
        dyn_notch_min_hz:                25,
        dyn_notch_max_hz:               245,
      };
  
      fc.TUNING_SLIDERS = {
        slider_pids_mode:                   0,
        slider_master_multiplier:           0,
        slider_roll_pitch_ratio:            0,
        slider_i_gain:                      0,
        slider_pd_ratio:                    0,
        slider_pd_gain:                     0,
        slider_dmin_ratio:                  0,
        slider_ff_gain:                     0,
        slider_dterm_filter:                0,
        slider_dterm_filter_multiplier:     0,
        slider_gyro_filter:                 0,
        slider_gyro_filter_multiplier:      0,
      };
}
