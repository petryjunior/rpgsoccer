import { Injectable } from '@angular/core';

const LS_TOTAL_MS = 'elifoot2026_playtime_total_ms';

/**
 * Tracks time spent on the game screen using synchronous localStorage
 * checkpoints (tab hidden, interval, unload) so progress is not lost.
 */
@Injectable({
  providedIn: 'root',
})
export class PlaySessionService {
  private lastTick = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private active = false;
  private boundBeforeUnload = () => this.checkpoint();
  private boundVisibility = () => {
    if (document.visibilityState === 'hidden') {
      this.checkpoint();
    }
  };

  start(): void {
    if (this.active) {
      return;
    }
    this.active = true;
    this.lastTick = Date.now();
    this.intervalId = setInterval(() => this.checkpoint(), 30000);
    window.addEventListener('beforeunload', this.boundBeforeUnload);
    document.addEventListener('visibilitychange', this.boundVisibility);
  }

  stop(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    window.removeEventListener('beforeunload', this.boundBeforeUnload);
    document.removeEventListener('visibilitychange', this.boundVisibility);
    this.checkpoint();
  }

  /** Persist elapsed time since last checkpoint; safe to call repeatedly. */
  checkpoint(): void {
    if (this.lastTick === 0) {
      return;
    }
    const now = Date.now();
    const delta = now - this.lastTick;
    this.lastTick = now;
    if (delta <= 0) {
      return;
    }
    const prev = Number(localStorage.getItem(LS_TOTAL_MS) || '0');
    localStorage.setItem(LS_TOTAL_MS, String(prev + delta));
  }

  /** Total including time since last checkpoint (live). */
  getTotalMs(): number {
    const stored = Number(localStorage.getItem(LS_TOTAL_MS) || '0');
    if (!this.active) {
      return stored;
    }
    return stored + (Date.now() - this.lastTick);
  }

  reset(): void {
    this.stop();
    localStorage.removeItem(LS_TOTAL_MS);
    this.lastTick = 0;
  }

  static formatDuration(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  }
}
