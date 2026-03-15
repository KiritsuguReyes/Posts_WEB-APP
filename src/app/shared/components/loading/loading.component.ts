import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe],
  template: `
    @if (loadingService.isLoading$ | async) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-[fade-in_0.2s_ease-out]">
        <div class="flex flex-col items-center gap-4">
          <div class="w-14 h-14 border-4 border-hunter-green-200 border-t-hunter-green-500 rounded-full animate-spin"></div>
          <span class="text-white text-sm font-medium">Cargando...</span>
        </div>
      </div>
    }
  `,
})
export class AppLoadingComponent {
  readonly loadingService = inject(LoadingService);
}
