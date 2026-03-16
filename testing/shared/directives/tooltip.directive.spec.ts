import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { AppTooltipDirective } from '@shared/directives/tooltip.directive';

@Component({
  template: `<button [appTooltip]="text()">Hover me</button>`,
  imports: [AppTooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  text = signal('Test tooltip text');
}

describe('AppTooltipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let directive: AppTooltipDirective;
  let doc: Document;

  function findTooltip(text: string): HTMLElement | undefined {
    return [...doc.body.querySelectorAll('div')].find(
      el => el.textContent === text
    ) as HTMLElement | undefined;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    directive = fixture.debugElement
      .query(By.directive(AppTooltipDirective))
      .injector.get(AppTooltipDirective);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    doc.body.querySelectorAll('div').forEach(el => el.remove());
  });

  it('should create the host component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should append a tooltip element to the body on mouseenter', () => {
    directive.onMouseEnter();
    expect(findTooltip('Test tooltip text')).toBeTruthy();
  });

  it('should remove the tooltip from the body on mouseleave', () => {
    directive.onMouseEnter();
    directive.onMouseLeave();
    expect(findTooltip('Test tooltip text')).toBeUndefined();
  });

  it('should not create duplicate tooltips on repeated mouseenter', () => {
    directive.onMouseEnter();
    directive.onMouseEnter();
    const tooltips = [...doc.body.querySelectorAll('div')].filter(
      el => el.textContent === 'Test tooltip text'
    );
    expect(tooltips.length).toBe(1);
  });

  it('should truncate tooltip text to 300 characters', () => {
    fixture.componentInstance.text.set('A'.repeat(400));
    fixture.detectChanges();
    directive.onMouseEnter();
    const tooltip = [...doc.body.querySelectorAll('div')].find(
      el => el.textContent && el.textContent.length > 0
    ) as HTMLElement | undefined;
    expect(tooltip).toBeTruthy();
    expect(tooltip!.textContent!.length).toBeLessThanOrEqual(300);
  });
});
