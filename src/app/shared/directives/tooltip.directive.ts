import { Directive, input, HostListener, signal, inject, ElementRef, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  host: { 'class': 'relative inline-block' }
})
export class AppTooltipDirective implements OnDestroy {
  appTooltip = input.required<string>();

  private tooltipEl: HTMLElement | null = null;
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private hideTimeout?: ReturnType<typeof setTimeout>;

  @HostListener('mouseenter') onMouseEnter(): void { this.show(); }
  @HostListener('mouseleave') onMouseLeave(): void { this.hide(); }
  @HostListener('touchstart', ['$event']) onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (this.tooltipEl) { this.hide(); } else { this.show(); this.hideTimeout = setTimeout(() => this.hide(), 3000); }
  }

  private show(): void {
    if (this.tooltipEl || !this.appTooltip()) return;
    const tip = this.renderer.createElement('div') as HTMLElement;
    tip.textContent = this.appTooltip();
    tip.className = 'absolute z-50 px-2 py-1 text-xs text-white bg-carbon-black-800 rounded shadow-lg whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none animate-[fade-in_0.15s_ease-out]';
    this.renderer.appendChild(this.el.nativeElement, tip);
    this.tooltipEl = tip;
  }

  private hide(): void {
    if (this.tooltipEl) {
      this.renderer.removeChild(this.el.nativeElement, this.tooltipEl);
      this.tooltipEl = null;
    }
    clearTimeout(this.hideTimeout);
  }

  ngOnDestroy(): void { this.hide(); }
}
