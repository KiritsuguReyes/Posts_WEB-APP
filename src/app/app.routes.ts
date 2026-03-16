import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'posts', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'posts',
    canActivate: [authGuard],
    loadComponent: () => import('./features/posts/pages/post-list/post-list.component').then(m => m.PostListComponent)
  },
  {
    path: 'posts/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/posts/pages/post-form/post-form.component').then(m => m.PostFormComponent)
  },
  {
    path: 'posts/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/posts/pages/post-form/post-form.component').then(m => m.PostFormComponent)
  },
  {
    path: 'posts/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/posts/pages/post-detail/post-detail.component').then(m => m.PostDetailComponent)
  },
  { path: '**', redirectTo: 'posts' }
];

