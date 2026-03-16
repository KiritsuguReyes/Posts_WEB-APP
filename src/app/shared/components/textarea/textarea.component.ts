import { Component, ChangeDetectionStrategy, input, signal, forwardRef, computed } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppTextareaComponent), multi: true }],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <label [for]="inputId()" class="text-sm font-medium text-carbon-black-700">
          {{ label() }}
          @if (required()) { <span class="text-error">*</span> }
        </label>
      }
      <textarea
        [id]="inputId()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [rows]="rows()"
        [attr.maxlength]="maxLength() > 0 ? maxLength() : null"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [class]="textareaClasses()"
      >{{ value() }}</textarea>
      <div class="flex justify-between items-center">
        @if (error()) {
          <span class="text-xs text-error">{{ error() }}</span>
        } @else {
          <span></span>
        }
        @if (maxLength() > 0) {
          <span class="text-xs text-muted">{{ value().length }}/{{ maxLength() }}</span>
        }
      </div>
    </div>
  `,
})
export class AppTextareaComponent implements ControlValueAccessor {
  label = input('');
  placeholder = input('');
  error = input('');
  rows = input(4);
  maxLength = input(0);
  required = input(false);
  inputId = input(`textarea-${Math.random().toString(36).slice(2)}`);

  value = signal('');
  isDisabled = signal(false);

  private onChange = (_: string) => {};
  onTouched = () => {};

  writeValue(val: string): void { this.value.set(val ?? ''); }
  registerOnChange(fn: (_: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.isDisabled.set(disabled); }

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  textareaClasses(): string {
    const base = 'w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border transition-colors focus:outline-none focus:ring-2 focus:ring-hunter-green-500 focus:border-transparent bg-surface resize-y disabled:opacity-50 disabled:cursor-not-allowed';
    return this.error()
      ? `${base} border-error text-error placeholder:text-error/50`
      : `${base} border-carbon-black-200 text-carbon-black-900 placeholder:text-carbon-black-400 hover:border-carbon-black-400`;
  }
}
