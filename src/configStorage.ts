/**
 * 对齐 conference 中 ConfigStorage（chrome.storage.local）的键；浏览器/NW 下用 localStorage。
 */
const PREFIX = 'rfmaster_';

function key(k: string): string {
  return `${PREFIX}${k}`;
}

export function configStorageGet(keys: string[]): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const out: Record<string, unknown> = {};
    for (const k of keys) {
      const raw = localStorage.getItem(key(k));
      if (raw !== null) {
        try {
          out[k] = JSON.parse(raw) as unknown;
        } catch {
          out[k] = raw;
        }
      }
    }
    resolve(out);
  });
}

export function configStorageSet(obj: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    for (const [k, v] of Object.entries(obj)) {
      localStorage.setItem(key(k), JSON.stringify(v));
    }
    resolve();
  });
}
