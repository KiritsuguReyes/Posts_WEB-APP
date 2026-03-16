import { Component, ChangeDetectionStrategy, input, model, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppInputComponent), multi: true }],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <label [for]="inputId()" class="text-sm font-medium text-carbon-black-700">
          {{ label() }}
          @if (required()) { <span class="text-error">*</span> }
        </label>
      }
      <div class="relative">
        @if (prefix()) {
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-carbon-black-400 pointer-events-none select-none">{{ prefix() }}</span>
        }
        <input
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [class]="inputClasses()"
        />
      </div>
      @if (error()) {
        <span class="text-xs text-error">{{ error() }}</span>
      }
    </div>
  `,
})
export class AppInputComponent implements ControlValueAccessor {
  label = input('');
  type = input<'text' | 'email' | 'password' | 'number' | 'search'>('text');
  placeholder = input('');
  prefix = input('');
  error = input('');
  required = input(false);
  inputId = input(`input-${Math.random().toString(36).slice(2)}`);;

  value = signal('');
  isDisabled = signal(false);

  private onChange = (_: string) => {};
  onTouched = () => {};

  writeValue(val: string): void { this.value.set(val ?? ''); }
  registerOnChange(fn: (_: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.isDisabled.set(disabled); }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  inputClasses(): string {
    const base = 'w-full py-2 text-sm rounded-[var(--radius-input)] border transition-colors focus:outline-none focus:ring-2 focus:ring-hunter-green-500 focus:border-transparent bg-surface disabled:opacity-50 disabled:cursor-not-allowed';
    const pad = this.prefix() ? 'pl-9 pr-4' : 'px-3';
    const state = this.error()
      ? 'border-error text-error placeholder:text-error/50'
      : 'border-carbon-black-200 text-carbon-black-900 placeholder:text-carbon-black-400 hover:border-carbon-black-400';
    return `${base} ${pad} ${state}`;
  }
}
