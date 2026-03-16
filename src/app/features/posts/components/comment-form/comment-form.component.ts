import { Component, ChangeDetectionStrategy, ChangeDetectorRef, input, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppAvatarComponent } from '@shared/components/avatar/avatar.component';
import { AppButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-comment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AppAvatarComponent, AppButtonComponent],
  template: `
    <div class="flex gap-3 items-start">
      @if (authorName()) {
        <app-avatar [name]="authorName()" size="sm" />
      }
      <div class="flex-1 relative">
        <textarea
          [(ngModel)]="body"
          [rows]="expanded() ? 3 : 1"
          placeholder="Escribe un comentario..."
          (focus)="expanded.set(true)"
          class="w-full px-4 py-2 text-sm border border-carbon-black-200 rounded-2xl bg-carbon-black-50 focus:outline-none focus:ring-2 focus:ring-hunter-green-500 focus:bg-surface resize-none transition-all placeholder:text-carbon-black-400"
          (keydown.enter)="handleEnter($any($event))">
        </textarea>
        @if (expanded()) {
          <div class="flex justify-end mt-2 gap-2">
            <app-button variant="secondary" size="sm" (clicked)="cancel()">Cancelar</app-button>
            <app-button
              variant="primary"
              size="sm"
              [loading]="submitting()"
              [disabled]="!isValidComment()"
              (clicked)="submit()">
              Enviar →
            </app-button>
          </div>
          @if (body.trim() && body.trim().length < 5) {
            <p class="text-xs text-error mt-1">El comentario debe tener al menos 5 caracteres</p>
          }
        }
      </div>
    </div>
  `,
})
export class CommentFormComponent {
  authorName = input('');
  submitting = input(false);

  submitted = output<string>();

  body = '';
  expanded = signal(false);

  private readonly cdr = inject(ChangeDetectorRef);

  // Validación del lado cliente
  isValidComment(): boolean {
    return this.body.trim().length >= 5;
  }

  handleEnter(event: KeyboardEvent): void {
    if (event.shiftKey) return;
    event.preventDefault();
    if (this.isValidComment() && !this.submitting()) {
      (event.target as HTMLTextAreaElement).blur();
      this.submit();
    }
  }

  submit(): void {
    const trimmedBody = this.body.trim();
    if (!trimmedBody || trimmedBody.length < 5) return;
    
    // Emitir el comentario pero NO resetear inmediatamente
    this.submitted.emit(trimmedBody);
  }

  // Método público para resetear desde el componente padre cuando hay éxito
  reset(): void {
    this.body = '';
    this.expanded.set(false);
    this.cdr.markForCheck();
  }

  cancel(): void {
    this.body = '';
    this.expanded.set(false);
    this.cdr.markForCheck();
  }
}
