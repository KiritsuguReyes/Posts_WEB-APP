import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { toast } from 'ngx-sonner';
import { AppButtonComponent } from '../../../shared/components/button/button.component';
import { AppInputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: flex; align-items: center; justify-content: center; overflow-y: auto; flex: 1; min-height: 0; }`],
  imports: [ReactiveFormsModule, RouterLink, AppButtonComponent, AppInputComponent],
  template: `
    <div class="w-full px-4 py-10 flex items-center justify-center">
      <div class="w-full max-w-md">
        <div class="bg-surface rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-8 animate-[slide-up_0.25s_ease-out]">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-14 h-14 bg-hunter-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <img src="assets/Icono.webp" alt="Logo" class="w-8 h-8" />
            </div>
            <h1 class="text-2xl font-bold text-carbon-black-900">Crear cuenta</h1>
            <p class="text-sm text-carbon-black-500 mt-1">Únete al sistema de posts</p>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
            <app-input
              formControlName="name"
              label="Nombre completo"
              type="text"
              placeholder="Tu nombre"
              [required]="true"
              [error]="getError('name')" />

            <app-input
              formControlName="email"
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              [required]="true"
              [error]="getError('email')" />

            <app-input
              formControlName="password"
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              [required]="true"
              [error]="getError('password')" />

            @if (errorMsg()) {
              <p class="text-sm text-error bg-red-50 border border-red-200 rounded-[var(--radius-input)] px-3 py-2">
                {{ errorMsg() }}
              </p>
            }

            <app-button
              type="submit"
              [loading]="loading()"
              [disabled]="form.invalid"
              [fullWidth]="true"
              size="lg">
              Registrarme
            </app-button>
          </form>

          <!-- Footer -->
          <p class="text-center text-sm text-carbon-black-500 mt-6">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="text-hunter-green-600 font-medium hover:underline ml-1">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.invalid || !ctrl?.touched) return '';
    if (ctrl.errors?.['required']) return 'Este campo es requerido';
    if (ctrl.errors?.['email']) return 'Correo inválido';
    if (ctrl.errors?.['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres`;
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { name, email, password } = this.form.value;
    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.register(name!, email!, password!).subscribe({
      next: () => {
        toast.success('¡Cuenta creada! Bienvenido');
        this.router.navigate(['/posts']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('No se pudo crear la cuenta. Verifica tus datos.');
      },
      complete: () => this.loading.set(false),
    });
  }
}
