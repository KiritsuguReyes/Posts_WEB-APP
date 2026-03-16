import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostsService } from '@features/posts/services/posts.service';
import { AuthService } from '@core/services/auth.service';
import { toast } from 'ngx-sonner';
import { AppButtonComponent } from '@shared/components/button/button.component';
import { AppInputComponent } from '@shared/components/input/input.component';
import { AppTextareaComponent } from '@shared/components/textarea/textarea.component';
import { AppAvatarComponent } from '@shared/components/avatar/avatar.component';

@Component({
  selector: 'app-post-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; overflow-y: auto; flex: 1; min-height: 0; }`],
  imports: [ReactiveFormsModule, AppButtonComponent, AppInputComponent, AppTextareaComponent, AppAvatarComponent],
  template: `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-6">

      <!-- Back -->
      <button
        (click)="goBack()"
        class="flex items-center gap-1.5 text-sm text-carbon-black-500 hover:text-hunter-green-600 transition-colors mb-6 cursor-pointer">
        ← Volver
      </button>

      <div class="bg-surface rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-carbon-black-100 p-6 md:p-8 animate-[slide-up_0.25s_ease-out]">

        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-carbon-black-900">
            {{ isEditMode() ? 'Editar post' : 'Nuevo post' }}
          </h1>
          <p class="text-sm text-carbon-black-500 mt-1">
            {{ isEditMode() ? 'Modifica el título y el contenido' : 'Comparte algo con la comunidad' }}
          </p>
        </div>

        @if (loadingPost()) {
          <div class="space-y-4 animate-pulse">
            <div class="h-10 bg-carbon-black-100 rounded"></div>
            <div class="h-32 bg-carbon-black-100 rounded"></div>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
            <!-- Author preview (read-only, auto-filled from account) -->
            @if (!isEditMode()) {
              <div class="flex items-center gap-2 p-3 bg-carbon-black-50 rounded-lg border border-carbon-black-100">
                <app-avatar [name]="authorName()" size="sm" />
                <div class="min-w-0">
                  <p class="text-xs text-carbon-black-400">Publicando como</p>
                  <p class="text-sm font-medium text-carbon-black-800 truncate">{{ authorName() }}</p>
                </div>
              </div>
            }

            <app-input
              formControlName="title"
              label="Título"
              type="text"
              placeholder="Escribe un título atractivo..."
              [required]="true"
              [maxLength]="300"
              [error]="getError('title')" />

            <app-textarea
              formControlName="body"
              label="Contenido"
              placeholder="Comparte tus ideas, pensamientos o información..."
              [rows]="8"
              [maxLength]="5000"
              [required]="true"
              [error]="getError('body')" />

            <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <app-button
                variant="secondary"
                [fullWidth]="true"
                (clicked)="goBack()">
                Cancelar
              </app-button>
              <app-button
                type="submit"
                variant="primary"
                [fullWidth]="true"
                [loading]="saving()"
                [disabled]="form.invalid">
                {{ isEditMode() ? '💾 Guardar cambios' : '✚ Publicar post' }}
              </app-button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class PostFormComponent implements OnInit {
  id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly postsService = inject(PostsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  saving = signal(false);
  loadingPost = signal(false);

  isEditMode = computed(() => !!this.id());
  authorName = computed(() => this.authService.getCurrentClaims()?.name ?? '');

  form = this.fb.group({
    title:  ['', [Validators.required, Validators.minLength(3)]],
    body:   ['', [Validators.required, Validators.minLength(10)]],
    author: ['', [Validators.required]],
  });

  ngOnInit(): void {
    // Pre-fill author from JWT claims
    this.form.patchValue({ author: this.authorName() });

    if (this.isEditMode()) {
      this.loadingPost.set(true);
      this.postsService.getById(this.id()!).subscribe({
        next: res => {
          this.form.patchValue({ title: res.data.title, body: res.data.body, author: res.data.author });
          this.loadingPost.set(false);
        },
        error: () => { this.loadingPost.set(false); this.router.navigate(['/posts']); }
      });
    }
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.invalid || !ctrl?.touched) return '';
    if (ctrl.errors?.['required']) return 'Este campo es requerido';
    if (ctrl.errors?.['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres`;
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { title, body, author } = this.form.value;

    const dto = {
      title: title!,
      body: body!,
      author: author!,
    };

    this.saving.set(true);

    const req$ = this.isEditMode()
      ? this.postsService.update(this.id()!, dto)
      : this.postsService.create(dto);

    req$.subscribe({
      next: res => {
        this.saving.set(false);
        toast.success(this.isEditMode() ? 'Post actualizado' : 'Post creado');
        const postId = res.data?._id ?? this.id()!;
        this.router.navigate(['/posts', postId]);
      },
      error: () => { this.saving.set(false); }
    });
  }

  goBack(): void {
    if (this.isEditMode()) {
      this.router.navigate(['/posts', this.id()]);
    } else {
      this.router.navigate(['/posts']);
    }
  }
}
