import { Route } from '@angular/router';
import { routes } from '../src/app/app.routes';

describe('app.routes', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should redirect the root path to /posts', () => {
    const root = routes.find((r: Route) => r.path === '');
    expect(root).toBeDefined();
    expect(root?.redirectTo).toBe('posts');
  });

  it('should have a /login route', () => {
    expect(routes.some((r: Route) => r.path === 'login')).toBe(true);
  });

  it('should have a /register route', () => {
    expect(routes.some((r: Route) => r.path === 'register')).toBe(true);
  });

  it('should have a /posts route', () => {
    expect(routes.some((r: Route) => r.path === 'posts')).toBe(true);
  });

  it('should have a /posts/new route', () => {
    expect(routes.some((r: Route) => r.path === 'posts/new')).toBe(true);
  });

  it('should have a /posts/:id/edit route', () => {
    expect(routes.some((r: Route) => r.path === 'posts/:id/edit')).toBe(true);
  });

  it('should have a /posts/:id route', () => {
    expect(routes.some((r: Route) => r.path === 'posts/:id')).toBe(true);
  });

  it('should have a wildcard route that redirects to /posts', () => {
    const wildcard = routes.find((r: Route) => r.path === '**');
    expect(wildcard).toBeDefined();
    expect(wildcard?.redirectTo).toBe('posts');
  });

  it('/login and /register routes should have a canActivate guard', () => {
    const login = routes.find((r: Route) => r.path === 'login');
    const register = routes.find((r: Route) => r.path === 'register');
    expect(login?.canActivate?.length).toBeGreaterThan(0);
    expect(register?.canActivate?.length).toBeGreaterThan(0);
  });

  it('protected routes should have a canActivate guard', () => {
    const protectedPaths = ['posts', 'posts/new', 'posts/:id/edit', 'posts/:id'];
    for (const path of protectedPaths) {
      const route = routes.find((r: Route) => r.path === path);
      expect(route?.canActivate?.length, `${path} should have canActivate`).toBeGreaterThan(0);
    }
  });
});
