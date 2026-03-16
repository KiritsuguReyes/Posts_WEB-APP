import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommentFormComponent } from '../../../../../src/app/features/posts/components/comment-form/comment-form.component';

describe('CommentFormComponent', () => {
  let fixture: ComponentFixture<CommentFormComponent>;
  let component: CommentFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- initial state ---
  describe('initial state', () => {
    it('should have an empty body by default', () => {
      expect(component.body).toBe('');
    });

    it('should not be expanded by default', () => {
      expect(component.expanded()).toBe(false);
    });

    it('should render the textarea', () => {
      expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();
    });

    it('should not show action buttons when not expanded', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      expect(buttons.length).toBe(0);
    });
  });

  // --- avatar ---
  describe('avatar', () => {
    it('should not render avatar when authorName is empty', () => {
      expect(fixture.nativeElement.querySelector('app-avatar')).toBeNull();
    });

    it('should render avatar when authorName is provided', () => {
      fixture.componentRef.setInput('authorName', 'Alice');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-avatar')).toBeTruthy();
    });
  });

  // --- expand on focus ---
  describe('expansion on focus', () => {
    it('should expand when the textarea receives focus', () => {
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      textarea.dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      expect(component.expanded()).toBe(true);
    });

    it('should show cancel and submit buttons when expanded', () => {
      component.expanded.set(true);
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const cancelBtn = [...buttons].find(b => b.textContent?.trim() === 'Cancelar');
      const submitBtn = [...buttons].find(b => b.textContent?.includes('Enviar'));
      expect(cancelBtn).toBeTruthy();
      expect(submitBtn).toBeTruthy();
    });
  });

  // --- isValidComment ---
  describe('isValidComment()', () => {
    it('should return false for empty body', () => {
      component.body = '';
      expect(component.isValidComment()).toBe(false);
    });

    it('should return false for body shorter than 5 chars', () => {
      component.body = 'ab';
      expect(component.isValidComment()).toBe(false);
    });

    it('should return false for body that is only whitespace', () => {
      component.body = '     ';
      expect(component.isValidComment()).toBe(false);
    });

    it('should return true for body with 5+ chars', () => {
      component.body = 'Valid comment text';
      expect(component.isValidComment()).toBe(true);
    });
  });

  // --- validation message ---
  describe('validation message', () => {
    it('should show warning when body is non-empty but shorter than 5 chars', () => {
      component.body = 'hi';
      component.expanded.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('al menos 5 caracteres');
    });

    it('should NOT show warning when body is empty', () => {
      component.body = '';
      component.expanded.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('al menos 5 caracteres');
    });

    it('should NOT show warning when body is valid', () => {
      component.body = 'Valid comment here';
      component.expanded.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('al menos 5 caracteres');
    });
  });

  // --- submit ---
  describe('submit()', () => {
    it('should emit the trimmed body via submitted output', () => {
      component.body = '  Hello world  ';
      const spy = vi.fn();
      component.submitted.subscribe(spy);

      component.submit();

      expect(spy).toHaveBeenCalledWith('Hello world');
    });

    it('should NOT emit when body is empty', () => {
      component.body = '';
      const spy = vi.fn();
      component.submitted.subscribe(spy);

      component.submit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should NOT emit when body is shorter than 5 chars', () => {
      component.body = 'hi';
      const spy = vi.fn();
      component.submitted.subscribe(spy);

      component.submit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should NOT emit when submitting is true', () => {
      component.body = 'Valid comment text';
      fixture.componentRef.setInput('submitting', true);
      fixture.detectChanges();

      // submit button should be disabled
      component.expanded.set(true);
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const submitBtn = [...buttons].find(b => b.textContent?.includes('Enviar')) as HTMLButtonElement;
      expect(submitBtn.disabled).toBe(true);
    });
  });

  // --- cancel ---
  describe('cancel()', () => {
    it('should clear the body and collapse the form', () => {
      component.body = 'Some text';
      component.expanded.set(true);

      component.cancel();

      expect(component.body).toBe('');
      expect(component.expanded()).toBe(false);
    });

    it('should collapse when cancel button is clicked', () => {
      component.expanded.set(true);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const cancelBtn = [...buttons].find(b => b.textContent?.trim() === 'Cancelar')!;
      cancelBtn.click();

      expect(component.expanded()).toBe(false);
    });
  });

  // --- reset ---
  describe('reset()', () => {
    it('should clear the body and collapse the form', () => {
      component.body = 'Some comment';
      component.expanded.set(true);

      component.reset();

      expect(component.body).toBe('');
      expect(component.expanded()).toBe(false);
    });
  });

  // --- handleEnter ---
  describe('handleEnter()', () => {
    it('should submit on Enter when body is valid and not submitting', () => {
      component.body = 'Valid comment text';
      component.expanded.set(true);
      fixture.detectChanges();

      const spy = vi.fn();
      component.submitted.subscribe(spy);

      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(spy).toHaveBeenCalledWith('Valid comment text');
    });

    it('should NOT submit on Shift+Enter', () => {
      component.body = 'Valid comment text';
      const spy = vi.fn();
      component.submitted.subscribe(spy);

      const shiftEnter = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      component.handleEnter(shiftEnter);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should NOT submit when body is invalid', () => {
      component.body = 'hi';
      const spy = vi.fn();
      component.submitted.subscribe(spy);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      component.handleEnter(enterEvent);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should NOT submit when already submitting', () => {
      component.body = 'Valid comment text';
      fixture.componentRef.setInput('submitting', true);
      fixture.detectChanges();

      const spy = vi.fn();
      component.submitted.subscribe(spy);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      component.handleEnter(enterEvent);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
