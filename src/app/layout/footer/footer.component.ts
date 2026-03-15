import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-carbon-black-800 py-4">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-carbon-black-300 text-sm">
          Albatros — Prueba Técnica · por <span class="text-carbon-black-200 font-medium">Alvaro Javier Reyes Maradiaga</span>
        </p>
      </div>
    </footer>
  `,
})
export class AppFooterComponent {}
