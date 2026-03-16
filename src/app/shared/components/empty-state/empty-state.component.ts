import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-16 h-16 bg-carbon-black-100 rounded-full flex items-center justify-center mb-4 text-3xl">
        {{ icon() }}
      </div>
      <h3 class="text-lg font-semibold text-carbon-black-700 mb-1">{{ title() }}</h3>
      @if (description()) {
        <p class="text-sm text-carbon-black-400 max-w-xs">{{ description() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class AppEmptyStateComponent {
  icon = input('📭');
  title = input('Sin resultados');
  description = input('');
}
