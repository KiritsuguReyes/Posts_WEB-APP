import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { JwtService } from '../services/jwt.service';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { LoadingService } from '../../shared/components/loading/loading.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const authService = inject(AuthService);
  const errorService = inject(ErrorService);
  const loadingService = inject(LoadingService);

  const token = jwtService.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

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
