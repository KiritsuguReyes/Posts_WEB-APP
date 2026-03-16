import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { JwtService } from '@core/services/jwt.service';
import { AuthService } from '@core/services/auth.service';
import { ErrorService } from '@core/services/error.service';
import { LoadingService } from '@shared/components/loading/loading.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const authService = inject(AuthService);
  const errorService = inject(ErrorService);
  const loadingService = inject(LoadingService);

  const token = jwtService.getToken();
  const headers: Record<string, string> = { 'ngrok-skip-browser-warning': 'true' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const authReq = req.clone({ setHeaders: headers });

  loadingService.isLoading = true;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        authService.logout();
      } else {
        errorService.handle(err);
      }
      return throwError(() => err);
    }),
    finalize(() => {
      loadingService.isLoading = false;
    })
  );
};
