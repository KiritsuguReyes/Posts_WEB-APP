import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AppTextareaComponent } from '../../../../src/app/shared/components/textarea/textarea.component';

describe('AppTextareaComponent', () => {
  let fixture: ComponentFixture<AppTextareaComponent>;
  let component: AppTextareaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTextareaComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AppTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a <textarea> element', () => {
    expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();
  });

  it('should default to 4 rows', () => {
    const ta = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta.rows).toBe(4);
  });

  it('should set custom rows', () => {
    fixture.componentRef.setInput('rows', 6);
    fixture.detectChanges();
    const ta = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta.rows).toBe(6);
  });

  it('should render a label when label is provided', () => {
    fixture.componentRef.setInput('label', 'Content');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    expect(label.textContent).toContain('Content');
  });

  it('should not render a label when label is empty', () => {
    expect(fixture.nativeElement.querySelector('label')).toBeNull();
  });

  it('should render a required asterisk when required is true', () => {
    fixture.componentRef.setInput('label', 'Content');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const star = fixture.nativeElement.querySelector('span.text-error') as HTMLSpanElement;
    expect(star.textContent).toContain('*');
  });

  it('should display an error message when error is provided', () => {
    fixture.componentRef.setInput('error', 'Field is required');
    fixture.detectChanges();
    const errorEl = fixture.nativeElement.querySelector('span.text-xs.text-error');
    expect(errorEl.textContent).toContain('Field is required');
  });

  it('should show character counter when maxLength > 0', () => {
    fixture.componentRef.setInput('maxLength', 200);
    fixture.detectChanges();
    const counter = fixture.nativeElement.querySelector('span.text-xs.text-muted') as HTMLSpanElement;
    expect(counter).toBeTruthy();
    expect(counter.textContent).toContain('0/200');
  });

  it('should not show character counter when maxLength is 0', () => {
    expect(fixture.nativeElement.querySelector('span.text-xs.text-muted')).toBeNull();
  });

  it('should update value signal on user input', () => {
    const ta = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    ta.value = 'Hello world';
    ta.dispatchEvent(new Event('input'));
    expect(component.value()).toBe('Hello world');
  });

  it('should call onChange callback on user input', () => {
    const spy = vi.fn();
    component.registerOnChange(spy);
    const ta = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    ta.value = 'typed text';
    ta.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith('typed text');
  });

  it('should set value via writeValue (ControlValueAccessor)', () => {
    component.writeValue('preset');
    expect(component.value()).toBe('preset');
  });

  it('should disable the textarea via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    const ta = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta.disabled).toBe(true);
  });

  it('should update counter as user types', () => {
    fixture.componentRef.setInput('maxLength', 100);
    fixture.detectChanges();
    const ta = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    ta.value = 'Hi';
    ta.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const counter = fixture.nativeElement.querySelector('span.text-xs.text-muted') as HTMLSpanElement;
    expect(counter.textContent).toContain('2/100');
  });
});
