import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtService } from './jwt.service';
import { JwtClaims } from '../models/jwt-claims.model';
import { AuthResponse } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly jwtService = inject(JwtService);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        if (res.data?.access_token) {
          this.jwtService.setToken(res.data.access_token);
        }
      })
    );
  }

  register(name: string, email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/users`, { name, email, password }).pipe(
      tap(res => {
        if (res.data?.access_token) {
          this.jwtService.setToken(res.data.access_token);
        }
      })
    );
  }

  logout(): void {
    this.jwtService.removeToken();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.jwtService.isTokenValid();
  }

  getCurrentClaims(): JwtClaims | null {
    return this.jwtService.getCurrentClaims();
  }
}
