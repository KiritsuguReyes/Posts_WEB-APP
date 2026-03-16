import { TestBed } from '@angular/core/testing';
import { JwtService } from '@core/services/jwt.service';
import { JwtClaims } from '@core/models/jwt-claims.model';

/** Encodes a payload to a valid JWT structure (no real signature) */
function buildFakeToken(claims: Partial<JwtClaims> & { exp: number }): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(claims));
  return `${header}.${payload}.signature`;
}

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  // --- decodeClaims ---
  describe('decodeClaims()', () => {
    it('should decode a valid JWT and return claims', () => {
      const token = buildFakeToken({ sub: '1', name: 'Alice', email: 'a@b.com', iat: 0, exp: 9999999999 });
      const claims = service.decodeClaims(token);
      expect(claims).not.toBeNull();
      expect(claims!.name).toBe('Alice');
    });

    it('should return null for a malformed token', () => {
      expect(service.decodeClaims('not.a.token')).toBeNull();
    });

    it('should return null for an empty string', () => {
      expect(service.decodeClaims('')).toBeNull();
    });
  });

  // --- setToken / getToken / removeToken ---
  describe('localStorage helpers', () => {
    it('should store a token in localStorage', () => {
      service.setToken('abc.def.ghi');
      expect(localStorage.getItem('auth_token')).toBe('abc.def.ghi');
    });

    it('should retrieve the stored token', () => {
      service.setToken('abc.def.ghi');
      expect(service.getToken()).toBe('abc.def.ghi');
    });

    it('should return null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should remove the token from localStorage', () => {
      service.setToken('abc.def.ghi');
      service.removeToken();
      expect(service.getToken()).toBeNull();
    });
  });

  // --- getCurrentClaims ---
  describe('getCurrentClaims()', () => {
    it('should return null when no token is stored', () => {
      expect(service.getCurrentClaims()).toBeNull();
    });

    it('should return decoded claims for a stored valid token', () => {
      const token = buildFakeToken({ sub: '42', name: 'Bob', email: 'b@c.com', iat: 0, exp: 9999999999 });
      service.setToken(token);
      const claims = service.getCurrentClaims();
      expect(claims!.sub).toBe('42');
      expect(claims!.name).toBe('Bob');
    });
  });

  // --- isTokenValid ---
  describe('isTokenValid()', () => {
    it('should return false when no token is stored', () => {
      expect(service.isTokenValid()).toBe(false);
    });

    it('should return true for a non-expired token', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = buildFakeToken({ sub: '1', name: 'Test', email: 't@t.com', iat: 0, exp: futureExp });
      service.setToken(token);
      expect(service.isTokenValid()).toBe(true);
    });

    it('should return false for an expired token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = buildFakeToken({ sub: '1', name: 'Test', email: 't@t.com', iat: 0, exp: pastExp });
      service.setToken(token);
      expect(service.isTokenValid()).toBe(false);
    });
  });
});
