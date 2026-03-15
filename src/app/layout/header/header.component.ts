import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AppAvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppAvatarComponent],
  template: `
    <header class="sticky top-0 z-50 bg-hunter-green-800 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <!-- Logo / Title -->
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xl font-bold text-white tracking-tight truncate">Posts System</span>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3 shrink-0">
          @if (claims()) {
            <div class="hidden sm:flex items-center gap-2">
              <app-avatar [name]="claims()!.name" size="sm" />
              <span class="text-sm text-hunter-green-200 truncate max-w-[120px]">{{ claims()!.name }}</span>
            </div>
            <button
              (click)="logout()"
              class="text-xs sm:text-sm font-medium text-hunter-green-200 border border-hunter-green-600 hover:bg-hunter-green-700 hover:text-white active:bg-hunter-green-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-[var(--radius-btn)] transition-all duration-200 cursor-pointer">
              Cerrar sesión
            </button>
          }
        </div>
      </div>
    </header>
  `,
})
export class AppHeaderComponent {
  private readonly authService = inject(AuthService);
  readonly claims = computed(() => this.authService.getCurrentClaims());

  logout(): void { this.authService.logout(); }
}
