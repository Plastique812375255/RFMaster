import './style.css';
import { CONFIGURATOR } from './config/configurator';
import { configStorageGet, configStorageSet } from './configStorage';
import { en, formatMsg, stripTags } from './i18n/en';
import { ConnectionValidationError, runConnectionValidation } from './msp/connectionValidation';
import { fcConfig, getHardwareName, resetFcConfig } from './msp/fcState';
import { MspProtocol } from './msp/mspProtocol';
import { MANUAL_VALUE, buildSerialPortData, type SerialPortEntry } from './port/buildSerialPortList';
import { isAndroidOs, portRecognized } from './port/portRecognized';
import { ChromeSerialTransport, isChromeSerialAvailable } from './transport/chromeSerialTransport';
import type { SerialTransport } from './transport/serialTransport';
import { WebSerialTransport } from './transport/webSerialTransport';
import { initFixedStageLayout } from './ui/fixedStageLayout';
import { fillRotorflightVersionSelect } from './ui/rotorflightVersionLines';

/** conference/rotorflight-configurator-release-2.2.1/src/js/port_handler.js 首行 TIMEOUT_CHECK */
const TIMEOUT_CHECK = 500;

const BAUD_RATES = [
  '1000000',
  '500000',
  '250000',
  '115200',
  '57600',
  '38400',
  '28800',
  '19200',
  '14400',
  '9600',
  '4800',
  '2400',
  '1200',
];

const SERIAL_FILTERS: SerialPortFilter[] = [
  { usbVendorId: 1155, usbProductId: 57105 },
  { usbVendorId: 10473, usbProductId: 393 },
];

const REQUEST_NEW_WEB = '__web_request__';

function portLabelWeb(port: SerialPort): string {
  const info = port.getInfo();
  if (info.usbVendorId !== undefined && info.usbProductId !== undefined) {
    return `USB ${info.usbVendorId.toString(16)}:${info.usbProductId.toString(16)}`;
  }
  return 'Serial';
}

/**
 * 原版 gulp `run_nwjs_dev_client` 使用 nw-builder `flavor: "sdk"`；SDK 才内置 Chromium DevTools。
 * normal 构建无 F12，需在 `.npmrc` 设 `nwjs_build_type=sdk` 后重装 `nw` 依赖。
 */
function bindNwDevToolsHotkeys(): void {
  const tryOpen = (): void => {
    try {
      const nwGui = (globalThis as unknown as { nw?: { Window?: { get?: () => { showDevTools?: () => void } } } }).nw;
      nwGui?.Window?.get?.()?.showDevTools?.();
    } catch {
      /* 非 NW 或非 SDK */
    }
  };
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault();
        tryOpen();
      }
    },
    true,
  );
}

function updateManualPortVisibility(): void {
  const sel = document.querySelector<HTMLSelectElement>('#port');
  const opt = sel?.selectedOptions[0];
  const isManual = opt?.dataset.isManual === 'true';
  const isVirtual = opt?.dataset.isVirtual === 'true';
  const isDFU = opt?.dataset.isDFU === 'true';

  const portOverride = document.querySelector<HTMLDivElement>('#port-override-option');
  const baudSelect = document.querySelector<HTMLSelectElement>('#baud');

  if (portOverride) portOverride.hidden = !isManual;
  if (baudSelect) baudSelect.style.display = isDFU || isVirtual ? 'none' : '';
}

async function main(): Promise<void> {
  initFixedStageLayout();
  const elLandscape = document.querySelector<HTMLParagraphElement>('#landscape-lock-text');
  if (elLandscape) elLandscape.textContent = en.landscapeRotateHint;

  bindNwDevToolsHotkeys();

  /** NW 下 chrome.serial 常存在但 getDevices 可能长期为空；navigator.serial 作补充（原版仅用 chrome，此处为能列出设备）。 */
  const chromeSerialAvailable = isChromeSerialAvailable();
  const webSerialAvailable = typeof navigator !== 'undefined' && !!navigator.serial;

  const elPort = document.querySelector<HTMLSelectElement>('#port');
  const elBaud = document.querySelector<HTMLSelectElement>('#baud');
  const elAuto = document.querySelector<HTMLInputElement>('#auto-connect');
  const elShowAll = document.querySelector<HTMLInputElement>('#show-all-ports');
  const elPortOverride = document.querySelector<HTMLInputElement>('#port-override');
  const elRotorflightVersion = document.querySelector<HTMLSelectElement>('#rotorflight-version');
  const elBtnConnect = document.querySelector<HTMLAnchorElement>('#btn-connect');
  const elConnectState = document.querySelector<HTMLDivElement>('#connect-state');
  const elPortLoading = document.querySelector<HTMLOptionElement>('#port-loading-opt');

  if (!elPort || !elBaud || !elAuto || !elShowAll || !elPortOverride || !elRotorflightVersion || !elBtnConnect || !elConnectState) {
    return;
  }

  const elConnectSubtitle = document.querySelector<HTMLParagraphElement>('#connect-screen__subtitle');
  if (elConnectSubtitle) elConnectSubtitle.textContent = en.connectScreenSubtitle;
  const elBtnMenu = document.querySelector<HTMLButtonElement>('#btn-menu');
  if (elBtnMenu) {
    elBtnMenu.setAttribute('aria-label', en.menuOpen);
  }
  const elDrawerTitle = document.querySelector<HTMLHeadingElement>('#side-drawer-title');
  if (elDrawerTitle) elDrawerTitle.textContent = en.menuTitle;
  const elBtnDrawerClose = document.querySelector<HTMLButtonElement>('#btn-drawer-close');
  if (elBtnDrawerClose) elBtnDrawerClose.setAttribute('aria-label', en.drawerClose);
  const elDrawerSectionFc = document.querySelector<HTMLHeadingElement>('#drawer-section-fc-label');
  if (elDrawerSectionFc) elDrawerSectionFc.textContent = en.drawerFcSummaryTitle;
  const elSideDrawer = document.querySelector<HTMLElement>('#side-drawer');
  if (elSideDrawer) elSideDrawer.setAttribute('aria-label', en.menuTitle);
  const elDrawerEx1 = document.querySelector<HTMLAnchorElement>('#drawer-link-ex1');
  const elDrawerEx2 = document.querySelector<HTMLAnchorElement>('#drawer-link-ex2');
  const elDrawerEx3 = document.querySelector<HTMLAnchorElement>('#drawer-link-ex3');
  if (elDrawerEx1) elDrawerEx1.textContent = en.drawerExampleLink1;
  if (elDrawerEx2) elDrawerEx2.textContent = en.drawerExampleLink2;
  if (elDrawerEx3) elDrawerEx3.textContent = en.drawerExampleLink3;
  const elBtnDisc = document.querySelector<HTMLButtonElement>('#btn-disconnect-drawer');
  if (elBtnDisc) elBtnDisc.textContent = en.disconnect;

  document.querySelector<HTMLSpanElement>('#port-override-label')!.textContent = en.portOverrideText;
  document.querySelector<HTMLSpanElement>('#auto-connect-label')!.textContent = en.autoConnect;
  document.querySelector<HTMLSpanElement>('#show-all-ports-label')!.textContent = en.showAllPorts;
  elRotorflightVersion.title = en.virtualMSPVersion;

  for (const b of BAUD_RATES) {
    const o = document.createElement('option');
    o.value = b;
    o.textContent = b;
    if (b === '115200') o.selected = true;
    elBaud.appendChild(o);
  }

  fillRotorflightVersionSelect(elRotorflightVersion);

  /** 对齐 serial_backend.js：Android 强制显示全部端口并隐藏开关；否则与 ConfigStorage.show_all_ports 一致（未定义或为假则 false）。 */
  let showAllPorts = false;
  let autoConnect = true;
  const stored = await configStorageGet([
    'auto_connect',
    'show_all_ports',
    'portOverride',
    'connectionTimeout',
    'rotorflight_msp',
  ]);
  if (typeof stored.rotorflight_msp === 'string') {
    const match = [...elRotorflightVersion.options].some((o) => o.value === stored.rotorflight_msp);
    if (match) elRotorflightVersion.value = stored.rotorflight_msp;
  }
  if (stored.auto_connect === false) {
    autoConnect = false;
    elAuto.checked = false;
  } else {
    elAuto.checked = true;
  }
  if (isAndroidOs()) {
    showAllPorts = true;
    elShowAll.checked = true;
    document.querySelector<HTMLDivElement>('#show-all-ports-switch')!.style.display = 'none';
  } else if (stored.show_all_ports === undefined || !stored.show_all_ports) {
    showAllPorts = false;
    elShowAll.checked = false;
  } else {
    showAllPorts = true;
    elShowAll.checked = true;
  }
  if (typeof stored.portOverride === 'string') {
    elPortOverride.value = stored.portOverride;
  }

  elAuto.title = autoConnect ? en.autoConnectEnabled : en.autoConnectDisabled;
  elShowAll.title = showAllPorts ? en.showAllPortsEnabled : en.showAllPortsDisabled;

  const grantedWebPorts: SerialPort[] = [];
  let transport: SerialTransport | null = null;
  let msp: MspProtocol | null = null;
  /** 对齐 port_handler.js：递归 setTimeout(TIMEOUT_CHECK)，非 setInterval */
  let portCheckTimer: ReturnType<typeof setTimeout> | null = null;
  let connected = false;
  let connecting = false;
  let connectToggle = false;

  function tabLabel(tab: string): string {
    switch (tab) {
      case 'setup':
        return en.tabSetup;
      case 'receiver':
        return en.tabReceiver;
      case 'mixer':
        return en.tabMixer;
      case 'motors':
        return en.tabMotors;
      case 'gyro':
        return en.tabGyro;
      default:
        return tab;
    }
  }

  let activeTabId = 'setup';

  function updateFcSummary(): void {
    const el = document.querySelector<HTMLSpanElement>('#fc-summary-text');
    if (!el) return;
    if (!connected) {
      el.textContent = '';
      return;
    }
    const id = fcConfig.flightControllerIdentifier || '—';
    const fw = fcConfig.buildVersion || fcConfig.flightControllerVersion || '—';
    const board = getHardwareName() || '—';
    el.textContent = `${id} ${fw} · ${board}`;
  }

  function renderAppTab(): void {
    const body = document.querySelector<HTMLDivElement>('#app-main-body');
    if (!body) return;
    body.innerHTML = `<h2 style="margin:0 0 6px;font-size:15px;color:#f1f5f9">${tabLabel(activeTabId)}</h2><p>${en.appTabPlaceholder}</p>`;
  }

  function bindBottomNav(): void {
    const nav = document.querySelector<HTMLElement>('#bottom-nav');
    if (!nav) return;
    nav.querySelectorAll<HTMLButtonElement>('.bottom-nav__btn').forEach((btn) => {
      const tab = btn.dataset.tab;
      if (tab) btn.textContent = tabLabel(tab);
      btn.addEventListener('click', () => {
        const t = btn.dataset.tab;
        if (!t) return;
        activeTabId = t;
        nav.querySelectorAll('.bottom-nav__btn').forEach((b) => b.classList.toggle('is-active', b === btn));
        renderAppTab();
      });
    });
  }

  function setDrawerOpen(open: boolean): void {
    const backdrop = document.getElementById('drawer-backdrop');
    const drawer = document.getElementById('side-drawer');
    const btnMenu = document.getElementById('btn-menu');
    if (!backdrop || !drawer || !btnMenu) return;
    if (open) {
      backdrop.hidden = false;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      backdrop.setAttribute('aria-hidden', 'false');
      btnMenu.setAttribute('aria-expanded', 'true');
    } else {
      backdrop.hidden = true;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      backdrop.setAttribute('aria-hidden', 'true');
      btnMenu.setAttribute('aria-expanded', 'false');
    }
  }

  function applyShellVisibility(show: boolean): void {
    const layerConnect = document.querySelector<HTMLElement>('#layer-connect');
    const layerApp = document.querySelector<HTMLElement>('#layer-app');
    const summary = document.querySelector<HTMLSpanElement>('#fc-summary-text');
    if (layerConnect) layerConnect.hidden = show;
    if (layerApp) layerApp.hidden = !show;
    if (!show && summary) summary.textContent = '';
    if (show) {
      setDrawerOpen(false);
      updateFcSummary();
      renderAppTab();
    }
  }

  bindBottomNav();

  /** 列表未变则不重绘，避免 port_handler 式轮询导致下拉框闪烁 */
  let lastPortFingerprint = '';
  /** chrome.serial 路径快照，用于 detectPort 与 initialPorts 对齐 */
  let serialPathsSnapshot = new Set<string>();
  let portPickerSeeded = false;

  function applyAutoConnectBaudLock(): void {
    if (autoConnect) {
      elBaud.value = '115200';
      elBaud.disabled = true;
    } else if (!connected) {
      elBaud.disabled = false;
    }
  }
  applyAutoConnectBaudLock();

  elAuto.addEventListener('change', () => {
    autoConnect = elAuto.checked;
    elAuto.title = autoConnect ? en.autoConnectEnabled : en.autoConnectDisabled;
    void configStorageSet({ auto_connect: autoConnect });
    applyAutoConnectBaudLock();
  });

  elShowAll.addEventListener('change', () => {
    showAllPorts = elShowAll.checked;
    elShowAll.title = showAllPorts ? en.showAllPortsEnabled : en.showAllPortsDisabled;
    void configStorageSet({ show_all_ports: showAllPorts });
    lastPortFingerprint = '';
    serialPathsSnapshot = new Set();
    portPickerSeeded = false;
    void refreshPorts();
  });

  elPortOverride.addEventListener('change', () => {
    void configStorageSet({ portOverride: elPortOverride.value });
  });

  elRotorflightVersion.addEventListener('change', () => {
    void configStorageSet({ rotorflight_msp: elRotorflightVersion.value });
  });

  elPort.addEventListener('change', () => {
    updateManualPortVisibility();
  });

  function setConnectButtonDisconnected(): void {
    connectToggle = false;
    elBtnConnect.classList.remove('active');
    elConnectState.textContent = en.connect;
    elConnectState.classList.remove('active');
  }

  function setConnectButtonConnecting(): void {
    elConnectState.textContent = en.connecting;
  }

  function setConnectButtonConnected(): void {
    connectToggle = true;
    elBtnConnect.classList.add('active');
    elConnectState.textContent = en.disconnect;
    elConnectState.classList.add('active');
  }

  function setDisconnectedUi(): void {
    connected = false;
    CONFIGURATOR.connectionValid = false;
    resetFcConfig();
    elPort.disabled = false;
    elBaud.disabled = autoConnect ? true : false;
    elAuto.disabled = false;
    elShowAll.disabled = false;
    elRotorflightVersion.disabled = false;
    elPortOverride.disabled = false;
    setConnectButtonDisconnected();
    applyAutoConnectBaudLock();
    updateManualPortVisibility();
    applyShellVisibility(false);
  }

  function setConnectingUi(): void {
    connecting = true;
    elPort.disabled = true;
    elBaud.disabled = true;
    elAuto.disabled = true;
    elShowAll.disabled = true;
    elRotorflightVersion.disabled = true;
    elPortOverride.disabled = true;
    setConnectButtonConnecting();
  }

  function setConnectedUi(): void {
    connecting = false;
    connected = true;
    CONFIGURATOR.connectionValid = true;
    elPort.disabled = true;
    elBaud.disabled = true;
    elAuto.disabled = true;
    elShowAll.disabled = true;
    elRotorflightVersion.disabled = true;
    elPortOverride.disabled = true;
    setConnectButtonConnected();
    updateManualPortVisibility();
    activeTabId = 'setup';
    document.querySelectorAll('#bottom-nav .bottom-nav__btn').forEach((b) => {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === 'setup');
    });
    applyShellVisibility(true);
  }

  async function webPortsSignature(): Promise<string> {
    if (!webSerialAvailable) return '';
    const ports = await navigator.serial.getPorts();
    const parts: string[] = [];
    for (const p of ports) {
      const i = p.getInfo();
      parts.push(`${i.usbVendorId ?? ''}:${i.usbProductId ?? ''}`);
    }
    return parts.sort().join('|');
  }

  /** conference port_handler.js PortHandler.selectPort */
  function selectFirstRecognizedPort(entries: SerialPortEntry[]): void {
    for (const p of entries) {
      if (portRecognized(p.displayName || undefined, p.path)) {
        elPort.value = p.path;
        return;
      }
    }
  }

  /** conference port_handler.js detectPort 中与 last_used_port / 新端口相关的选中逻辑 */
  async function applyDetectPortSelection(newPaths: string[], allSerialEntries: SerialPortEntry[]): Promise<void> {
    if (newPaths.length === 0) return;
    const stored = await configStorageGet(['last_used_port']);
    const lastUsed = typeof stored.last_used_port === 'string' ? stored.last_used_port : '';

    if (newPaths.length === 1) {
      elPort.value = newPaths[0];
      return;
    }
    if (lastUsed && lastUsed.includes('tcp')) {
      elPort.value = MANUAL_VALUE;
      return;
    }
    selectFirstRecognizedPort(allSerialEntries);
  }

  async function refreshPorts(): Promise<void> {
    if (elPortLoading) elPortLoading.remove();

    const webSig = await webPortsSignature();

    let data: Awaited<ReturnType<typeof buildSerialPortData>> | null = null;
    if (chromeSerialAvailable) {
      data = await buildSerialPortData(showAllPorts);
    }

    const chromePaths = data ? data.serialEntries.map((e) => e.path) : [];
    const fingerprint = JSON.stringify({
      serial: [...chromePaths].sort(),
      dfu: data?.hasDfu ?? false,
      web: webSig,
      showAll: showAllPorts,
    });

    if (fingerprint === lastPortFingerprint) {
      return;
    }
    lastPortFingerprint = fingerprint;

    const keep = elPort.value;

    if (chromeSerialAvailable && data) {
      elPort.innerHTML = '';
      for (const o of data.options) {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        if (o.isManual) opt.dataset.isManual = 'true';
        if (o.isDFU) opt.dataset.isDFU = 'true';
        opt.dataset.serialSource = 'chrome';
        elPort.appendChild(opt);
      }
    } else {
      elPort.innerHTML = '';
    }

    if (webSerialAvailable) {
      if (chromeSerialAvailable) {
        const og = document.createElement('optgroup');
        og.label = 'Web Serial';
        const oNew = document.createElement('option');
        oNew.value = REQUEST_NEW_WEB;
        oNew.textContent = 'Request new port…';
        oNew.dataset.serialSource = 'web';
        og.appendChild(oNew);
        grantedWebPorts.length = 0;
        const ports = await navigator.serial.getPorts();
        for (const p of ports) {
          grantedWebPorts.push(p);
          const opt = document.createElement('option');
          opt.value = `__web__${grantedWebPorts.length - 1}`;
          opt.textContent = portLabelWeb(p);
          opt.dataset.serialSource = 'web';
          og.appendChild(opt);
        }
        elPort.appendChild(og);
      } else {
        const oNew = document.createElement('option');
        oNew.value = REQUEST_NEW_WEB;
        oNew.textContent = 'Request new port…';
        oNew.dataset.serialSource = 'web';
        elPort.appendChild(oNew);
        grantedWebPorts.length = 0;
        const ports = await navigator.serial.getPorts();
        for (const p of ports) {
          grantedWebPorts.push(p);
          const opt = document.createElement('option');
          opt.value = `__web__${grantedWebPorts.length - 1}`;
          opt.textContent = portLabelWeb(p);
          opt.dataset.serialSource = 'web';
          elPort.appendChild(opt);
        }
      }
    }

    if (!chromeSerialAvailable && !webSerialAvailable) {
      return;
    }

    const currentSet = new Set(chromePaths);

    if (chromeSerialAvailable && data) {
      if (!portPickerSeeded) {
        portPickerSeeded = true;
        selectFirstRecognizedPort(data.serialEntries);
        const hasSel = [...elPort.options].some((o) => o.value === elPort.value && !o.disabled);
        if (!hasSel && data.serialEntries.length > 0) {
          elPort.value = data.serialEntries[0].path;
        }
        serialPathsSnapshot = currentSet;
        updateManualPortVisibility();
        return;
      }

      const newPaths = chromePaths.filter((p) => !serialPathsSnapshot.has(p));
      if (newPaths.length > 0) {
        await applyDetectPortSelection(newPaths, data.serialEntries);
      } else {
        const still = [...elPort.options].some((o) => o.value === keep && !o.disabled);
        if (still) elPort.value = keep;
      }
      serialPathsSnapshot = currentSet;
    } else {
      const still = [...elPort.options].some((o) => o.value === keep && !o.disabled);
      if (still) elPort.value = keep;
    }

    updateManualPortVisibility();
  }

  function stopPortCheckChain(): void {
    if (portCheckTimer !== null) {
      window.clearTimeout(portCheckTimer);
      portCheckTimer = null;
    }
  }

  function startPortCheckChain(): void {
    if ((!chromeSerialAvailable && !webSerialAvailable) || portCheckTimer !== null) return;
    const tick = (): void => {
      portCheckTimer = null;
      if (!chromeSerialAvailable && !webSerialAvailable) return;
      const scheduleNext = (): void => {
        portCheckTimer = window.setTimeout(tick, TIMEOUT_CHECK);
      };
      if (connected || connecting) {
        scheduleNext();
        return;
      }
      void refreshPorts().finally(scheduleNext);
    };
    portCheckTimer = window.setTimeout(tick, TIMEOUT_CHECK);
  }

  async function teardownTransport(): Promise<void> {
    if (msp) {
      msp.disconnectCleanup();
      msp = null;
    }
    if (transport) {
      await transport.close().catch(() => {});
      transport = null;
    }
  }

  async function performDisconnect(): Promise<void> {
    stopPortCheckChain();
    await teardownTransport();
    await refreshPorts();
    setDisconnectedUi();
    startPortCheckChain();
  }

  function bindDrawer(): void {
    document.getElementById('btn-menu')?.addEventListener('click', () => setDrawerOpen(true));
    document.getElementById('btn-drawer-close')?.addEventListener('click', () => setDrawerOpen(false));
    document.getElementById('drawer-backdrop')?.addEventListener('click', () => setDrawerOpen(false));
    document.getElementById('btn-disconnect-drawer')?.addEventListener('click', () => {
      void performDisconnect();
      setDrawerOpen(false);
    });
    for (const id of ['drawer-link-ex1', 'drawer-link-ex2', 'drawer-link-ex3'] as const) {
      document.getElementById(id)?.addEventListener('click', (e) => e.preventDefault());
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    });
  }

  bindDrawer();

  async function runAfterOpen(portLabelForLog: string): Promise<void> {
    if (!msp || !transport) return;
    console.log(formatMsg(en.serialPortOpened, portLabelForLog));
    await runConnectionValidation(msp, (buf) => transport!.send(buf));
  }

  async function connectChromeSerial(): Promise<void> {
    const opt = elPort.selectedOptions[0];
    if (opt?.dataset.isDFU === 'true') return;

    let portName: string;
    if (opt?.dataset.isManual === 'true') {
      portName = elPortOverride.value.trim();
    } else {
      portName = elPort.value;
    }
    if (!portName || portName === MANUAL_VALUE) {
      window.alert(en.serialPortOpenFail);
      return;
    }

    setConnectingUi();
    const c = new ChromeSerialTransport();
    transport = c;
    msp = new MspProtocol();
    transport.setOnReceive((data) => msp?.feed({ data }));

    try {
      await c.connect(portName, parseInt(elBaud.value, 10));
      await runAfterOpen(portName);
      await configStorageSet({ last_used_port: portName });
      setConnectedUi();
    } catch (e) {
      if (e instanceof ConnectionValidationError) {
        window.alert(stripTags(e.message));
      } else {
        window.alert(e instanceof Error ? e.message : String(e));
      }
      await teardownTransport();
      setDisconnectedUi();
    } finally {
      connecting = false;
    }
  }

  async function connectWebSerial(): Promise<void> {
    setConnectingUi();
    const web = new WebSerialTransport();
    transport = web;
    msp = new MspProtocol();
    transport.setOnReceive((data) => msp?.feed({ data }));

    let port: SerialPort;
    let logId = 'web';
    try {
      if (elPort.value === REQUEST_NEW_WEB) {
        port = await navigator.serial.requestPort({ filters: SERIAL_FILTERS });
      } else if (elPort.value.startsWith('__web__')) {
        const idx = Number.parseInt(elPort.value.slice('__web__'.length), 10);
        const picked = grantedWebPorts[idx];
        if (!picked) {
          window.alert(en.serialPortOpenFail);
          setDisconnectedUi();
          return;
        }
        port = picked;
        logId = String(idx);
      } else {
        const idx = Number.parseInt(elPort.value, 10);
        const picked = grantedWebPorts[idx];
        if (!picked) {
          window.alert(en.serialPortOpenFail);
          setDisconnectedUi();
          return;
        }
        port = picked;
        logId = String(idx);
      }
    } catch {
      setDisconnectedUi();
      return;
    }

    try {
      await web.connect(port, parseInt(elBaud.value, 10));
      await runAfterOpen(logId);
      await configStorageSet({ last_used_port: 'webserial' });
      setConnectedUi();
    } catch (e) {
      if (e instanceof ConnectionValidationError) {
        window.alert(stripTags(e.message));
      } else {
        window.alert(e instanceof Error ? e.message : String(e));
      }
      await teardownTransport();
      setDisconnectedUi();
    } finally {
      connecting = false;
    }
  }

  elBtnConnect.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (connecting) return;

    if (connectToggle) {
      void performDisconnect();
      return;
    }

    stopPortCheckChain();
    const sel = elPort.selectedOptions[0];
    const useWebTransport =
      elPort.value === REQUEST_NEW_WEB ||
      elPort.value.startsWith('__web__') ||
      sel?.dataset.serialSource === 'web';
    const go = useWebTransport ? connectWebSerial() : connectChromeSerial();
    void go.finally(() => {
      if (!connected) startPortCheckChain();
    });
  });

  if (!chromeSerialAvailable && !webSerialAvailable) {
    elPort.disabled = true;
    elBtnConnect.style.pointerEvents = 'none';
    elConnectState.textContent = 'No serial API';
    return;
  }

  await refreshPorts();
  updateManualPortVisibility();
  startPortCheckChain();

  if (autoConnect && chromeSerialAvailable) {
    const timeoutMs =
      typeof stored.connectionTimeout === 'number' && stored.connectionTimeout > 0
        ? stored.connectionTimeout
        : 100;
    window.setTimeout(() => {
      if (!connected && !connecting) void elBtnConnect.click();
    }, timeoutMs);
  }
}

void main();
