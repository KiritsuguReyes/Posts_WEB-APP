import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AppInputComponent } from '../../../../src/app/shared/components/input/input.component';

describe('AppInputComponent', () => {
  let fixture: ComponentFixture<AppInputComponent>;
  let component: AppInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppInputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AppInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an <input> element', () => {
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
  });

  it('should default to type="text"', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('text');
  });

  it('should render a label when label input is provided', () => {
    fixture.componentRef.setInput('label', 'Email address');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    expect(label.textContent).toContain('Email address');
  });

  it('should not render a label when label is empty', () => {
    expect(fixture.nativeElement.querySelector('label')).toBeNull();
  });

  it('should render a required asterisk when required is true', () => {
    fixture.componentRef.setInput('label', 'Name');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const star = fixture.nativeElement.querySelector('span.text-error') as HTMLSpanElement;
    expect(star.textContent).toContain('*');
  });

  it('should display an error message when error is provided', () => {
    fixture.componentRef.setInput('error', 'This field is required');
    fixture.detectChanges();
    const errorEl = fixture.nativeElement.querySelector('span.text-xs.text-error');
    expect(errorEl.textContent).toContain('This field is required');
  });

  it('should render a prefix span when prefix is provided', () => {
    fixture.componentRef.setInput('prefix', '@');
    fixture.detectChanges();
    const prefix = fixture.nativeElement.querySelector('span.absolute') as HTMLSpanElement;
    expect(prefix.textContent?.trim()).toBe('@');
  });

  it('should update value signal on user input', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    expect(component.value()).toBe('hello');
  });

  it('should call onChange callback on user input', () => {
    const spy = vi.fn();
    component.registerOnChange(spy);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'test value';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith('test value');
  });

  it('should set value via writeValue (ControlValueAccessor)', () => {
    component.writeValue('preset value');
    expect(component.value()).toBe('preset value');
  });

  it('should disable the input via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should respect maxlength attribute when maxLength > 0', () => {
    fixture.componentRef.setInput('maxLength', 10);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.maxLength).toBe(10);
  });
});
