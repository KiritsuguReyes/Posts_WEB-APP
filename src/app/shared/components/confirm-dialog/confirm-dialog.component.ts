import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { AppButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent],
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 animate-[fade-in_0.2s_ease-out]"
        (click)="onBackdropClick($event)">
        <div
          class="bg-surface rounded-[var(--radius-card)] shadow-xl max-w-sm w-full p-6 animate-[slide-up_0.25s_ease-out]"
          (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-carbon-black-900 mb-2">{{ title() }}</h3>
          <p class="text-sm text-carbon-black-500 mb-6">{{ message() }}</p>
          <div class="flex gap-3 justify-end">
            <app-button variant="secondary" (clicked)="cancel()">Cancelar</app-button>
            <app-button variant="danger" [loading]="loading()" (clicked)="confirm()">{{ confirmLabel() }}</app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AppConfirmDialogComponent {
  title = input('¿Estás seguro?');
  message = input('Esta acción no se puede deshacer.');
  confirmLabel = input('Eliminar');
  loading = input(false);
  visible = input(false);

  confirmed = output<void>();
  cancelled = output<void>();

  confirm(): void { this.confirmed.emit(); }
  cancel(): void { this.cancelled.emit(); }
  onBackdropClick(event: MouseEvent): void { this.cancelled.emit(); }
}
