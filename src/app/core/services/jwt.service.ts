import { Injectable } from '@angular/core';
import { JwtClaims } from '../models/jwt-claims.model';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class JwtService {
  decodeClaims(token: string): JwtClaims | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtClaims;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getCurrentClaims(): JwtClaims | null {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeClaims(token);
  }

  isTokenValid(): boolean {
    const claims = this.getCurrentClaims();
    if (!claims) return false;
    return claims.exp * 1000 > Date.now();
  }
}
