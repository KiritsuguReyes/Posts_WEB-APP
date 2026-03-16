import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * Guard que protege rutas que solo deben ser accesibles por usuarios NO logueados
 * (como login y register). Si el usuario está logueado, lo redirige a /posts
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Usuario ya está logueado, redirigir a posts
    console.log('🚫 Usuario logueado intentando acceder a ruta de guest:', state.url);
    router.navigate(['/posts']);
    return false;
  }

  // Usuario no está logueado, puede acceder
  return true;
};
