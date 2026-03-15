import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AppToastService } from './toast.service';

@Component({
  selector: 'app-toast-notification',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [class]="toastClasses(toast.type)"
          class="pointer-events-auto animate-[slide-up_0.25s_ease-out]">
          <div class="flex items-start gap-3">
            <span class="text-lg shrink-0">
              @if (toast.type === 'success') { ✅ }
              @else if (toast.type === 'error') { ❌ }
              @else { ℹ️ }
            </span>
            <p class="text-sm flex-1">{{ toast.message }}</p>
            <button
              (click)="toastService.remove(toast.id)"
              class="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none cursor-pointer">
              ×
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class AppToastNotificationComponent {
  readonly toastService = inject(AppToastService);

  toastClasses(type: string): string {
    const base = 'w-full px-4 py-3 rounded-[var(--radius-card)] shadow-lg border text-sm font-medium';
    const types: Record<string, string> = {
      success: `${base} bg-aquamarine-50 border-aquamarine-200 text-aquamarine-800`,
      error:   `${base} bg-red-50 border-red-200 text-red-800`,
      info:    `${base} bg-hunter-green-50 border-hunter-green-200 text-hunter-green-800`,
    };
    return types[type] ?? base;
  }
}
