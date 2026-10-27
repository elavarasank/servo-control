import { Component, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ServoService } from './servo.service';

interface LogEntry { time: string; text: string; ok: boolean; }

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private servo = inject(ServoService);

  spins = signal(1);
  angle = signal(90);
  sentAngle = signal<number | null>(null);
  busy = signal(false);
  apiKey = this.servo.apiKey;
saveKey(e: Event) { this.servo.setKey((e.target as HTMLInputElement).value.trim()); }
  online = signal<'checking' | 'online' | 'offline'>('checking');
  log = signal<LogEntry[]>([]);

  spinValid = computed(() => Number.isInteger(this.spins()) && this.spins() >= 1);
  angleValid = computed(() => Number.isInteger(this.angle()) && this.angle() >= 1 && this.angle() <= 180);

  constructor() { this.checkStatus(); }

  checkStatus() {
    this.online.set('checking');
    this.servo.status().subscribe({
      next: () => this.online.set('online'),
      error: () => this.online.set('offline'),
    });
  }

  readNum(e: Event): number {
    return (e.target as HTMLInputElement).valueAsNumber;
  }

  spin() {
    if (!this.spinValid()) return;
    this.run(`Spin ${this.spins()}×`, this.servo.spin(this.spins()));
  }

  moveToAngle() {
    if (!this.angleValid()) return;
    const a = this.angle();
    this.run(`Move to ${a}°`, this.servo.setAngle(a), () => this.sentAngle.set(a));
  }

  stop() {
    this.run('Stop', this.servo.stop());
  }

  private run(label: string, req: Observable<unknown>, onOk?: () => void) {
    this.busy.set(true);
    req.subscribe({
      next: () => { onOk?.(); this.add(`${label} — done`, true); this.busy.set(false); },
      error: (err) => {
        const why = err?.name === 'TimeoutError' ? 'timed out (server may be waking up)'
          : err?.status === 0 ? 'cannot reach API (check URL / CORS)'
          : `error ${err?.status ?? ''}`;
        this.add(`${label} — ${why}`, false);
        this.busy.set(false);
      },
    });
  }

  private add(text: string, ok: boolean) {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    this.log.update((l) => [{ time, text, ok }, ...l].slice(0, 6));
  }
}
