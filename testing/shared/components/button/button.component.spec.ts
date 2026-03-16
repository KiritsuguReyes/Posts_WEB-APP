import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppButtonComponent, ButtonVariant, ButtonSize } from '@shared/components/button/button.component';

describe('AppButtonComponent', () => {
  let fixture: ComponentFixture<AppButtonComponent>;
  let component: AppButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a <button> element', () => {
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('should default to type="button"', () => {
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.type).toBe('button');
  });

  it('should be enabled by default', () => {
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('should be disabled when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('should be disabled when loading input is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('should show spinner element when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('span.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should not show spinner when not loading', () => {
    expect(fixture.nativeElement.querySelector('span.animate-spin')).toBeNull();
  });

  it('should emit clicked event when button is clicked', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit clicked event when disabled', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(spy).not.toHaveBeenCalled();
  });

  it.each([
    ['primary', 'bg-hunter-green-600'],
    ['secondary', 'bg-carbon-black-100'],
    ['danger', 'bg-error'],
    ['ghost', 'bg-transparent'],
  ] as [ButtonVariant, string][])(
    'should apply %s variant classes',
    (variant, expectedClass) => {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();
      expect(component.buttonClasses()).toContain(expectedClass);
    }
  );

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as [ButtonSize, string][])(
    'should apply %s size classes',
    (size, expectedClass) => {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(component.buttonClasses()).toContain(expectedClass);
    }
  );

  it('should apply w-full class when fullWidth is true', () => {
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    expect(component.buttonClasses()).toContain('w-full');
  });
});
