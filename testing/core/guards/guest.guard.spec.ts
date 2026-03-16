import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, provideRouter } from '@angular/router';
import { guestGuard } from '@core/guards/guest.guard';
import { AuthService } from '@core/services/auth.service';

function runGuard(loggedIn: boolean, url = '/login') {
  const mockAuthService = { isLoggedIn: () => loggedIn };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: mockAuthService },
    ],
  });

  // Prevent real router navigation (NG04002) by stubbing navigate before guard runs
  const router = TestBed.inject(Router);
  vi.spyOn(router as any, 'navigate').mockResolvedValue(true);

  return TestBed.runInInjectionContext(() =>
    guestGuard(
      {} as ActivatedRouteSnapshot,
      { url } as RouterStateSnapshot
    )
  );
}

describe('guestGuard', () => {
  it('should return true when the user is NOT logged in', () => {
    const result = runGuard(false);
    expect(result).toBe(true);
  });

  it('should return false when the user IS logged in', () => {
    const result = runGuard(true);
    expect(result).toBe(false);
  });

  it('should navigate to /posts when the user is already logged in', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: () => true } },
      ],
    });

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router as any, 'navigate').mockResolvedValue(true);

    TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, { url: '/login' } as RouterStateSnapshot)
    );

    expect(navigateSpy).toHaveBeenCalledWith(['/posts']);
  });
});
