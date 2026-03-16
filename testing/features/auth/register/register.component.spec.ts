import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from '../../../../src/app/features/auth/register/register.component';
import { AuthService } from '../../../../src/app/core/services/auth.service';

const mockAuthService = {
  register: vi.fn(),
  isLoggedIn: vi.fn().mockReturnValue(false),
};

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let router: Router;

  beforeEach(async () => {
    mockAuthService.register.mockClear();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router as any, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the "Crear cuenta" heading', () => {
    const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('Crear cuenta');
  });

  it('should contain a link to /login', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a[routerLink="/login"]');
    expect(link).toBeTruthy();
  });

  // --- Form validation ---
  describe('form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when name is fewer than 2 characters', () => {
      component.form.setValue({ name: 'A', email: 'a@b.com', password: 'password123' });
      expect(component.form.get('name')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be invalid with an invalid email format', () => {
      component.form.setValue({ name: 'Alice', email: 'bad', password: 'password123' });
      expect(component.form.get('email')?.errors?.['email']).toBeTruthy();
    });

    it('should be invalid when password has fewer than 6 characters', () => {
      component.form.setValue({ name: 'Alice', email: 'a@b.com', password: '123' });
      expect(component.form.get('password')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be valid with all correct fields', () => {
      component.form.setValue({ name: 'Alice', email: 'a@b.com', password: 'password123' });
      expect(component.form.valid).toBe(true);
    });
  });

  // --- getError() ---
  describe('getError()', () => {
    it('should return "" when the field is not touched', () => {
      expect(component.getError('name')).toBe('');
    });

    it('should return "Este campo es requerido" for an empty required field', () => {
      component.form.get('name')!.markAsTouched();
      expect(component.getError('name')).toBe('Este campo es requerido');
    });

    it('should return "Correo inválido" for an invalid email', () => {
      const ctrl = component.form.get('email')!;
      ctrl.setValue('bad');
      ctrl.markAsTouched();
      expect(component.getError('email')).toBe('Correo inválido');
    });

    it('should return "Mínimo X caracteres" for a password that is too short', () => {
      const ctrl = component.form.get('password')!;
      ctrl.setValue('abc');
      ctrl.markAsTouched();
      expect(component.getError('password')).toContain('Mínimo');
      expect(component.getError('password')).toContain('6');
    });

    it('should return "Mínimo X caracteres" for a name that is too short', () => {
      const ctrl = component.form.get('name')!;
      ctrl.setValue('A');
      ctrl.markAsTouched();
      expect(component.getError('name')).toContain('Mínimo');
      expect(component.getError('name')).toContain('2');
    });
  });

  // --- onSubmit() with invalid form ---
  describe('onSubmit() with invalid form', () => {
    it('should mark all fields as touched', () => {
      component.onSubmit();
      expect(component.form.get('name')?.touched).toBe(true);
      expect(component.form.get('email')?.touched).toBe(true);
      expect(component.form.get('password')?.touched).toBe(true);
    });

    it('should NOT call authService.register', () => {
      component.onSubmit();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });
  });

  // --- onSubmit() success ---
  describe('onSubmit() — success', () => {
    beforeEach(() => {
      component.form.setValue({ name: 'Alice', email: 'a@b.com', password: 'password123' });
      mockAuthService.register.mockReturnValue(of({}));
    });

    it('should call authService.register with the form values', () => {
      component.onSubmit();
      expect(mockAuthService.register).toHaveBeenCalledWith('Alice', 'a@b.com', 'password123');
    });

    it('should navigate to /posts on success', () => {
      component.onSubmit();
      expect(vi.mocked(router.navigate as any)).toHaveBeenCalledWith(['/posts']);
    });

    it('should set loading to false after success', () => {
      component.onSubmit();
      expect(component.loading()).toBe(false);
    });

    it('should not display an error message', () => {
      component.onSubmit();
      fixture.detectChanges();
      const errorParagraph = fixture.nativeElement.querySelector('p.text-sm.text-error');
      expect(errorParagraph).toBeNull();
    });
  });

  // --- onSubmit() error ---
  describe('onSubmit() — error', () => {
    beforeEach(() => {
      component.form.setValue({ name: 'Alice', email: 'a@b.com', password: 'password123' });
      mockAuthService.register.mockReturnValue(throwError(() => new Error('Conflict')));
    });

    it('should set errorMsg to the registration failure message', () => {
      component.onSubmit();
      expect(component.errorMsg()).toBe('No se pudo crear la cuenta. Verifica tus datos.');
    });

    it('should set loading to false on error', () => {
      component.onSubmit();
      expect(component.loading()).toBe(false);
    });

    it('should display the error message in the template', () => {
      component.onSubmit();
      fixture.detectChanges();
      const errorParagraph: HTMLElement = fixture.nativeElement.querySelector('p.text-sm.text-error');
      expect(errorParagraph?.textContent?.trim()).toBe('No se pudo crear la cuenta. Verifica tus datos.');
    });
  });
});
