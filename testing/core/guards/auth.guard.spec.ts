import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard } from '../../../src/app/core/guards/auth.guard';
import { AuthService } from '../../../src/app/core/services/auth.service';

function runGuard(loggedIn: boolean, url = '/posts') {
  const mockAuthService = { isLoggedIn: () => loggedIn };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: mockAuthService },
    ],
  });

  return TestBed.runInInjectionContext(() =>
    authGuard(
      {} as ActivatedRouteSnapshot,
      { url } as RouterStateSnapshot
    )
  );
}

describe('authGuard', () => {
  it('should return true when the user is logged in', () => {
    const result = runGuard(true);
    expect(result).toBe(true);
  });

  it('should return a UrlTree redirecting to /login when not logged in', () => {
    const result = runGuard(false, '/posts');
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toContain('/login');
  });

  it('should include the returnUrl query param in the redirect', () => {
    const result = runGuard(false, '/posts/123');
    const urlTree = result as UrlTree;
    expect(urlTree.queryParams['returnUrl']).toBe('/posts/123');
  });
});
