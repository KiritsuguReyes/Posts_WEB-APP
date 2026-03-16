import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from '../src/app/app';
import { AuthService } from '../src/app/core/services/auth.service';
import { ErrorService } from '../src/app/core/services/error.service';

// NgxSonnerToaster uses window.matchMedia which is unavailable in jsdom
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function buildMockAuthService(loggedIn = false) {
  return {
    isLoggedIn: () => loggedIn,
    getCurrentClaims: () => null,
    logout: vi.fn(),
  };
}

describe('App', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: buildMockAuthService() },
        { provide: ErrorService, useValue: { registerToast: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shouldShowHeader should be false when user is not authenticated', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: buildMockAuthService(false) },
        { provide: ErrorService, useValue: { registerToast: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance.shouldShowHeader()).toBe(false);
  });

  it('shouldShowHeader should be true when user is authenticated and not on an auth route', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
            getCurrentClaims: () => ({ sub: '1', name: 'Test', email: 't@t.com', iat: 0, exp: 9999 }),
            logout: vi.fn(),
          },
        },
        { provide: ErrorService, useValue: { registerToast: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.shouldShowHeader()).toBe(true);
  });

  it('should register error toast on init', async () => {
    const registerToast = vi.fn();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: buildMockAuthService() },
        { provide: ErrorService, useValue: { registerToast } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(registerToast).toHaveBeenCalledTimes(1);
    expect(typeof registerToast.mock.calls[0][0]).toBe('function');
  });
});
