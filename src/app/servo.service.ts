import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { timeout } from 'rxjs';
import { API } from './api.config';
import { environment } from '../environments/environment';
@Injectable({ providedIn: 'root' })
export class ServoService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  apiKey = signal(this.load());

  
  getStatus() {
  return this.http.get(`${this.base}/iot/status`);
}

  private load() {
    try { return localStorage.getItem('servo_api_key') ?? ''; } catch { return ''; }
  }

  setKey(k: string) {
    this.apiKey.set(k);
    try { localStorage.setItem('servo_api_key', k); } catch {}
  }

  private options() {
    return { headers: new HttpHeaders({ 'x-api-key': this.apiKey() }) };
  }

  private url(path: string) { return `${API.baseUrl}${path}`; }

  status() {
    return this.http.get<{ status: string }>(this.url('/status')).pipe(timeout(API.timeoutMs));
  }
  spin(count: number) {
    return this.http.post<{ queued: number }>(this.url(`/send/${count}`), {}, this.options()).pipe(timeout(API.timeoutMs));
  }
  setAngle(angle: number) {
    return this.http.post<{ servoAngle: number }>(this.url(`/servo/${angle}`), {}, this.options()).pipe(timeout(API.timeoutMs));
  }
  stop() {
    return this.http.post<{ command: string }>(this.url('/stop'), {}, this.options()).pipe(timeout(API.timeoutMs));
  }
}