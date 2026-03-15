import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses()"
      (click)="clicked.emit()">
      @if (loading()) {
        <span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block"></span>
      }
      <ng-content />
    </button>
  `,
})
export class AppButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  loading = input(false);
  disabled = input(false);
  fullWidth = input(false);

  clicked = output<void>();

  buttonClasses(): string {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-btn)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-hunter-green-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-hunter-green-600 text-white hover:bg-hunter-green-700 active:bg-hunter-green-800',
      secondary: 'bg-carbon-black-100 text-carbon-black-800 hover:bg-carbon-black-200 active:bg-carbon-black-300 border border-carbon-black-200',
      danger: 'bg-error text-white hover:opacity-90 active:opacity-80',
      ghost: 'bg-transparent text-hunter-green-600 hover:bg-hunter-green-50 active:bg-hunter-green-100 border border-transparent hover:border-hunter-green-200',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 h-8',
      md: 'text-sm px-4 py-2 h-10',
      lg: 'text-base px-6 py-3 h-12',
    };

    const width = this.fullWidth() ? 'w-full' : '';

    return [base, variants[this.variant()], sizes[this.size()], width].filter(Boolean).join(' ');
  }
}
