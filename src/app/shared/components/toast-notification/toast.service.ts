import { Injectable, signal, computed } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AppToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = computed(() => this._toasts());
  private nextId = 0;

  success(message: string, duration = 4000): void {
    this.add('success', message, duration);
  }

  error(message: string, duration = 5000): void {
    this.add('error', message, duration);
  }

  info(message: string, duration = 4000): void {
    this.add('info', message, duration);
  }

  remove(id: number): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private add(type: Toast['type'], message: string, duration: number): void {
    const id = ++this.nextId;
    this._toasts.update(toasts => [...toasts, { id, type, message }]);
    setTimeout(() => this.remove(id), duration);
  }
}
