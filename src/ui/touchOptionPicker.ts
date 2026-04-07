import './touchOptionPicker.css';

/** 设计稿行高（与 touchOptionPicker.css --top-item-h-design 一致）；滚动距离 = 设计值 × html --scale */
const ITEM_H_DESIGN = 44;
const VIEWPORT_H = 160;
const VIEW_MARGIN = 8;

function getLayoutScale(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--scale').trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export type TouchOptionPickerOptions = {
  /** 关联的隐藏 select，作为唯一数据源（option.value / text / dataset） */
  select: HTMLSelectElement;
  /** 挂载触发行的容器（通常为 select 的兄弟节点） */
  mount: HTMLElement;
};

/**
 * test/touch-numeric-picker 的「点击 + 滚动」交互，用于字符串选项列表（串口 / 波特率 / 版本等）。
 */
export class TouchOptionPicker {
  private readonly select: HTMLSelectElement;
  private readonly root: HTMLElement;
  private expanded = false;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;
  private openScrollTop = 0;
  private userScrolled = false;
  private ignoreUserScrollUntil = 0;
  private readonly scrollEl: HTMLDivElement;
  private readonly trigger: HTMLButtonElement;
  private readonly panel: HTMLDivElement;
  private readonly valueDisplay: HTMLSpanElement;
  private itemEls: HTMLDivElement[] = [];

  private readonly onViewportChange = () => {
    if (!this.expanded) return;
    this.positionPanel();
    this.scrollToIndex(this.selectedIndex(), false);
  };

  private readonly onOutsidePointerDown = (e: PointerEvent) => {
    if (!this.expanded) return;
    const t = e.target;
    if (!(t instanceof Node)) return;
    if (this.root.contains(t) || this.panel.contains(t)) return;
    this.collapse();
  };

  constructor(opts: TouchOptionPickerOptions) {
    this.select = opts.select;
    this.root = opts.mount;
    this.root.classList.add('top');
    this.root.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'top-row';

    this.trigger = document.createElement('button');
    this.trigger.type = 'button';
    this.trigger.className = 'top-trigger';
    this.valueDisplay = document.createElement('span');
    this.valueDisplay.className = 'top-trigger-text';
    this.trigger.appendChild(this.valueDisplay);
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.trigger.disabled) return;
      this.toggle();
    });
    row.appendChild(this.trigger);

    this.panel = document.createElement('div');
    this.panel.className = 'top-panel';
    this.panel.hidden = true;

    const viewport = document.createElement('div');
    viewport.className = 'top-viewport';

    this.scrollEl = document.createElement('div');
    this.scrollEl.className = 'top-scroll';
    this.scrollEl.setAttribute('role', 'listbox');

    viewport.appendChild(this.scrollEl);
    this.panel.appendChild(viewport);

    this.root.appendChild(row);
    document.body.appendChild(this.panel);

    this.bindScroll();
    this.refreshFromSelect();

    this.select.addEventListener('change', () => {
      this.syncTriggerText();
      this.syncActiveClass();
      if (this.expanded) this.scrollToIndex(this.selectedIndex(), false);
    });
  }

  /** 仅 value/disabled 变化、options 未替换时（如自动连接锁定波特率） */
  syncDisplayFromSelect(): void {
    this.syncTriggerText();
    this.syncActiveClass();
    if (this.expanded) this.scrollToIndex(this.selectedIndex(), false);
  }

  /** select 的 options 被整体替换后调用（如 refreshPorts、fillRotorflightVersionSelect） */
  refreshFromSelect(): void {
    this.scrollEl.replaceChildren();
    this.itemEls = [];

    const opts = this.select.options;
    for (let i = 0; i < opts.length; i++) {
      const o = opts[i]!;
      const item = document.createElement('div');
      item.className = 'top-item';
      const span = document.createElement('span');
      span.className = 'top-item-text';
      span.textContent = o.textContent ?? o.value;
      item.appendChild(span);
      item.dataset.index = String(i);
      this.scrollEl.appendChild(item);
      this.itemEls.push(item);
    }

    const idx = this.selectedIndex();
    this.syncTriggerText();
    this.syncActiveClass();
    if (this.expanded) {
      this.scrollToIndex(idx, false);
      requestAnimationFrame(() => {
        this.openScrollTop = this.scrollEl.scrollTop;
      });
    }
  }

  syncDisabledFromSelect(): void {
    const d = this.select.disabled;
    this.trigger.disabled = d;
    this.trigger.classList.toggle('top-disabled', d);
    if (d && this.expanded) this.collapse();
  }

  private selectedIndex(): number {
    const opts = this.select.options;
    for (let i = 0; i < opts.length; i++) {
      if (opts[i]!.value === this.select.value) return i;
    }
    return opts.length > 0 ? 0 : 0;
  }

  private syncTriggerText(): void {
    const opt = this.select.selectedOptions[0];
    this.valueDisplay.textContent = opt?.textContent?.trim() || this.select.value || '—';
  }

  private toggle(): void {
    if (this.expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  private expand(): void {
    if (this.itemEls.length === 0) return;
    this.expanded = true;
    this.userScrolled = false;
    this.ignoreUserScrollUntil = performance.now() + 120;
    this.panel.hidden = false;
    this.trigger.classList.add('top-expanded');
    window.addEventListener('scroll', this.onViewportChange, true);
    window.addEventListener('resize', this.onViewportChange);
    requestAnimationFrame(() => {
      this.positionPanel();
      this.scrollToIndex(this.selectedIndex(), false);
      requestAnimationFrame(() => {
        this.openScrollTop = this.scrollEl.scrollTop;
      });
    });
    setTimeout(() => {
      document.addEventListener('pointerdown', this.onOutsidePointerDown, true);
    }, 0);
  }

  private collapse(): void {
    this.expanded = false;
    this.panel.hidden = true;
    this.trigger.classList.remove('top-expanded');
    document.removeEventListener('pointerdown', this.onOutsidePointerDown, true);
    window.removeEventListener('scroll', this.onViewportChange, true);
    window.removeEventListener('resize', this.onViewportChange);
  }

  private positionPanel(): void {
    const r = this.trigger.getBoundingClientRect();
    const w = Math.max(r.width, 1);
    const panelH = this.panel.offsetHeight || VIEWPORT_H * getLayoutScale() + 4;
    const centerY = r.top + r.height / 2;
    let top = centerY - panelH / 2;
    let left = r.left;

    if (left + w > window.innerWidth - VIEW_MARGIN) {
      left = window.innerWidth - w - VIEW_MARGIN;
    }
    if (left < VIEW_MARGIN) left = VIEW_MARGIN;

    if (top + panelH > window.innerHeight - VIEW_MARGIN) {
      top = window.innerHeight - VIEW_MARGIN - panelH;
    }
    if (top < VIEW_MARGIN) top = VIEW_MARGIN;

    this.panel.style.left = `${left}px`;
    this.panel.style.top = `${top}px`;
    this.panel.style.width = `${w}px`;
  }

  private scrollToIndex(i: number, smooth: boolean): void {
    if (this.itemEls.length === 0) return;
    let idx = i;
    if (idx < 0) idx = 0;
    if (idx >= this.itemEls.length) idx = this.itemEls.length - 1;
    const step = ITEM_H_DESIGN * getLayoutScale();
    const top = idx * step;
    this.scrollEl.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  }

  private indexFromScrollTop(): number {
    const step = ITEM_H_DESIGN * getLayoutScale();
    const t = this.scrollEl.scrollTop;
    let i = Math.round(t / step);
    if (i < 0) i = 0;
    if (i >= this.itemEls.length) i = this.itemEls.length - 1;
    return i;
  }

  private markUserScroll(): void {
    if (performance.now() < this.ignoreUserScrollUntil) return;
    if (Math.abs(this.scrollEl.scrollTop - this.openScrollTop) > 0.5 || this.userScrolled) {
      this.userScrolled = true;
    }
  }

  private applyIndexToSelect(i: number): void {
    const opts = this.select.options;
    if (i < 0 || i >= opts.length) return;
    const next = opts[i]!.value;
    if (this.select.value !== next) {
      this.select.value = next;
      this.select.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      this.syncTriggerText();
      this.syncActiveClass();
    }
  }

  private bindScroll(): void {
    const settle = () => {
      if (!this.expanded) return;
      if (!this.userScrolled) return;
      const i = this.indexFromScrollTop();
      this.applyIndexToSelect(i);
      this.syncTriggerText();
      this.syncActiveClass();
    };

    this.scrollEl.addEventListener('pointerdown', () => {
      if (this.expanded) this.userScrolled = true;
    });

    this.scrollEl.addEventListener('wheel', () => {
      if (this.expanded) this.userScrolled = true;
    });

    this.scrollEl.addEventListener('scroll', () => {
      if (!this.expanded) return;
      this.markUserScroll();
      if (this.settleTimer != null) clearTimeout(this.settleTimer);
      this.settleTimer = setTimeout(() => {
        this.settleTimer = null;
        settle();
      }, 150);
    });

    this.scrollEl.addEventListener('scrollend', () => {
      if (!this.expanded) return;
      if (this.settleTimer != null) {
        clearTimeout(this.settleTimer);
        this.settleTimer = null;
      }
      settle();
    });
  }

  private syncActiveClass(): void {
    const idx = this.selectedIndex();
    for (let i = 0; i < this.itemEls.length; i++) {
      this.itemEls[i]!.classList.toggle('top-active', i === idx);
    }
  }
}
