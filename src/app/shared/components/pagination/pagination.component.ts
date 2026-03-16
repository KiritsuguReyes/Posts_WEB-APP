import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    @if (total() > 0) {
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 py-2">
        <!-- Info -->
        <span class="text-xs text-carbon-black-500 order-2 sm:order-1">
          Mostrando {{ from() }}-{{ to() }} de {{ total() }} {{ itemLabel() }}
        </span>
        <!-- Paginación -->
        <div class="flex items-center gap-1 order-1 sm:order-2">
          <button
            [disabled]="page() === 1"
            (click)="goTo(page() - 1)"
            class="w-8 h-8 flex items-center justify-center rounded border border-carbon-black-200 text-sm text-carbon-black-600 hover:bg-carbon-black-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
            ‹
          </button>

          @for (p of pages(); track p) {
            @if (p === -1) {
              <span class="w-8 h-8 flex items-center justify-center text-carbon-black-400 text-sm">…</span>
            } @else {
              <button
                [class]="pageClasses(p)"
                (click)="goTo(p)">
                {{ p }}
              </button>
            }
          }

          <button
            [disabled]="page() === totalPages()"
            (click)="goTo(page() + 1)"
            class="w-8 h-8 flex items-center justify-center rounded border border-carbon-black-200 text-sm text-carbon-black-600 hover:bg-carbon-black-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
            ›
          </button>
        </div>
        <!-- PageSize -->
        <div class="flex items-center gap-2 order-3">
          <label class="text-xs text-carbon-black-500">Por página:</label>
          <select
            [value]="pageSize()"
            (change)="onPageSizeChange($event)"
            class="text-xs border border-carbon-black-200 rounded px-2 py-1 bg-surface text-carbon-black-700 focus:outline-none focus:ring-1 focus:ring-hunter-green-500 cursor-pointer">
            @for (s of pageSizeOptions(); track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </div>
      </div>
    }
  `,
})
export class AppPaginationComponent {
  page = input.required<number>();
  pageSize = input.required<number>();
  total = input.required<number>();
  itemLabel = input('elementos');
  pageSizeOptions = input([10, 25, 50, 100]);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  from = computed(() => Math.min((this.page() - 1) * this.pageSize() + 1, this.total()));
  to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  goTo(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.pageChange.emit(p);
  }

  onPageSizeChange(event: Event): void {
    this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }

  pageClasses(p: number): string {
    const base = 'w-8 h-8 flex items-center justify-center rounded border text-xs transition-colors cursor-pointer';
    return p === this.page()
      ? `${base} bg-hunter-green-600 text-white border-hunter-green-600 font-semibold`
      : `${base} border-carbon-black-200 text-carbon-black-600 hover:bg-carbon-black-100`;
  }
}
