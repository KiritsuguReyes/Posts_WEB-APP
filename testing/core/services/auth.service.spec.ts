import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
} from '@angular/common/http';
import { Router } from '@angular/router';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../src/app/core/services/auth.service';
import { JwtService } from '../../../src/app/core/services/jwt.service';
import { JwtClaims } from '../../../src/app/core/models/jwt-claims.model';

function makeAuthResponse(token = 'header.payload.sig') {
  return { success: true, message: 'ok', data: { access_token: token } };
}

function buildFakeToken(exp: number): string {
  const claims: JwtClaims = { sub: '1', name: 'Alice', email: 'a@b.com', iat: 0, exp };
  const payload = btoa(JSON.stringify(claims));
  return `header.${payload}.sig`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let jwtService: JwtService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        JwtService,
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    jwtService = TestBed.inject(JwtService);
    router = TestBed.inject(Router);
    vi.spyOn(router as any, 'navigate').mockResolvedValue(true);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // --- login ---
  describe('login()', () => {
    it('should POST to the login endpoint', () => {
      service.login('a@b.com', 'pass').subscribe();
      const req = httpMock.expectOne(r => r.url.endsWith('/auth/login'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'a@b.com', password: 'pass' });
      req.flush(makeAuthResponse());
    });

    it('should store the token in localStorage on successful login', () => {
      const token = buildFakeToken(9999999999);
      service.login('a@b.com', 'pass').subscribe();
      httpMock.expectOne(r => r.url.endsWith('/auth/login')).flush(makeAuthResponse(token));
      expect(jwtService.getToken()).toBe(token);
    });

    it('should NOT store a token when the response has no access_token', () => {
      service.login('a@b.com', 'pass').subscribe();
      httpMock.expectOne(r => r.url.endsWith('/auth/login')).flush({ success: true, message: 'ok', data: {} });
      expect(jwtService.getToken()).toBeNull();
    });
  });

  // --- register ---
  describe('register()', () => {
    it('should POST to the users endpoint', () => {
      service.register('Alice', 'a@b.com', 'pass').subscribe();
      const req = httpMock.expectOne(r => r.url.endsWith('/users'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Alice', email: 'a@b.com', password: 'pass' });
      req.flush(makeAuthResponse());
    });

    it('should store the token on successful registration', () => {
      const token = buildFakeToken(9999999999);
      service.register('Alice', 'a@b.com', 'pass').subscribe();
      httpMock.expectOne(r => r.url.endsWith('/users')).flush(makeAuthResponse(token));
      expect(jwtService.getToken()).toBe(token);
    });
  });

  // --- logout ---
  describe('logout()', () => {
    it('should remove the token from localStorage', () => {
      jwtService.setToken('some-token');
      service.logout();
      expect(jwtService.getToken()).toBeNull();
    });

    it('should navigate to /login', () => {
      service.logout();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(vi.mocked(router.navigate as any)).toHaveBeenCalledWith(['/login']);
    });
  });

  // --- isLoggedIn ---
  describe('isLoggedIn()', () => {
    it('should return false when no token is stored', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true for a valid (non-expired) token', () => {
      const token = buildFakeToken(Math.floor(Date.now() / 1000) + 3600);
      jwtService.setToken(token);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false for an expired token', () => {
      const token = buildFakeToken(Math.floor(Date.now() / 1000) - 3600);
      jwtService.setToken(token);
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  // --- getCurrentClaims ---
  describe('getCurrentClaims()', () => {
    it('should return null when no token is stored', () => {
      expect(service.getCurrentClaims()).toBeNull();
    });

    it('should return the decoded claims for a stored token', () => {
      const token = buildFakeToken(9999999999);
      jwtService.setToken(token);
      const claims = service.getCurrentClaims();
      expect(claims).not.toBeNull();
      expect(claims!.name).toBe('Alice');
    });
  });
});
