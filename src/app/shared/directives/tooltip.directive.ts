import { Directive, input, HostListener, inject, ElementRef, OnDestroy, Renderer2, DOCUMENT } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
})
export class AppTooltipDirective implements OnDestroy {
  appTooltip = input.required<string>();

  private tooltipEl: HTMLElement | null = null;
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private hideTimeout?: ReturnType<typeof setTimeout>;

  @HostListener('mouseenter') onMouseEnter(): void { this.show(); }
  @HostListener('mouseleave') onMouseLeave(): void { this.hide(); }
  @HostListener('touchstart', ['$event']) onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (this.tooltipEl) { this.hide(); } else { this.show(); this.hideTimeout = setTimeout(() => this.hide(), 3000); }
  }

  private show(): void {
    if (this.tooltipEl || !this.appTooltip()) return;
    const rect: DOMRect = this.el.nativeElement.getBoundingClientRect();
    const text = this.appTooltip().slice(0, 300);
    const tip = this.renderer.createElement('div') as HTMLElement;
    tip.textContent = text;
    tip.style.cssText = `
      position: fixed;
      z-index: 999999;
      top: ${rect.top - 8}px;
      left: ${rect.left + rect.width / 2}px;
      transform: translate(-50%, -100%);
      padding: 4px 10px;
      font-size: 0.75rem;
      line-height: 1.4;
      color: white;
      background: #1c1c1e;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      white-space: normal;
      word-break: break-word;
      pointer-events: none;
      max-width: 280px;
    `;
    this.renderer.appendChild(this.document.body, tip);
    this.tooltipEl = tip;
  }

  private hide(): void {
    if (this.tooltipEl) {
      this.renderer.removeChild(this.document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
    clearTimeout(this.hideTimeout);
  }

  ngOnDestroy(): void { this.hide(); }
}

