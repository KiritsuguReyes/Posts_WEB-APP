import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from '../../../../src/app/features/auth/login/login.component';
import { AuthService } from '../../../../src/app/core/services/auth.service';

const mockAuthService = {
  login: vi.fn(),
  isLoggedIn: vi.fn().mockReturnValue(false),
};

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let router: Router;

  beforeEach(async () => {
    mockAuthService.login.mockClear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router as any, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the "Iniciar sesión" heading', () => {
    const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('Iniciar sesión');
  });

  it('should contain a link to /register', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a[routerLink="/register"]');
    expect(link).toBeTruthy();
  });

  // --- Form validation ---
  describe('form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('should be invalid with an invalid email format', () => {
      component.form.setValue({ email: 'not-an-email', password: 'validpassword' });
      expect(component.form.get('email')?.errors?.['email']).toBeTruthy();
    });

    it('should be invalid when password has fewer than 6 characters', () => {
      component.form.setValue({ email: 'a@b.com', password: '123' });
      expect(component.form.get('password')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be valid with correct email and password', () => {
      component.form.setValue({ email: 'a@b.com', password: 'password123' });
      expect(component.form.valid).toBe(true);
    });
  });

  // --- getError() ---
  describe('getError()', () => {
    it('should return "" when the field is not touched', () => {
      expect(component.getError('email')).toBe('');
    });

    it('should return "Este campo es requerido" for an empty required field', () => {
      component.form.get('email')!.markAsTouched();
      expect(component.getError('email')).toBe('Este campo es requerido');
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
  });

  // --- onSubmit() with invalid form ---
  describe('onSubmit() with invalid form', () => {
    it('should mark all fields as touched', () => {
      component.onSubmit();
      expect(component.form.get('email')?.touched).toBe(true);
      expect(component.form.get('password')?.touched).toBe(true);
    });

    it('should NOT call authService.login', () => {
      component.onSubmit();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });

  // --- onSubmit() success ---
  describe('onSubmit() — success', () => {
    beforeEach(() => {
      component.form.setValue({ email: 'a@b.com', password: 'password123' });
      mockAuthService.login.mockReturnValue(of({}));
    });

    it('should call authService.login with the form values', () => {
      component.onSubmit();
      expect(mockAuthService.login).toHaveBeenCalledWith('a@b.com', 'password123');
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
      component.form.setValue({ email: 'a@b.com', password: 'password123' });
      mockAuthService.login.mockReturnValue(throwError(() => new Error('Unauthorized')));
    });

    it('should set errorMsg to the login failure message', () => {
      component.onSubmit();
      expect(component.errorMsg()).toBe('Correo o contraseña incorrectos');
    });

    it('should set loading to false on error', () => {
      component.onSubmit();
      expect(component.loading()).toBe(false);
    });

    it('should display the error message in the template', () => {
      component.onSubmit();
      fixture.detectChanges();
      const errorParagraph: HTMLElement = fixture.nativeElement.querySelector('p.text-sm.text-error');
      expect(errorParagraph?.textContent?.trim()).toBe('Correo o contraseña incorrectos');
    });
  });
});
