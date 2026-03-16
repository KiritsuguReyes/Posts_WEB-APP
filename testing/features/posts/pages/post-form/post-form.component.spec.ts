import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PostFormComponent } from '@features/posts/pages/post-form/post-form.component';
import { PostsService } from '@features/posts/services/posts.service';
import { AuthService } from '@core/services/auth.service';
import { Post } from '@core/models/post.model';
import { ApiResponse } from '@core/models/api-response.model';
import { JwtClaims } from '@core/models/jwt-claims.model';

const fakeClaims: JwtClaims = {
  sub: 'user-1', name: 'Alice', email: 'alice@example.com', iat: 0, exp: 9999999999,
};

const mockPost: Post = {
  _id: 'post-1',
  title: 'Existing Post',
  body: 'Existing body content here',
  author: 'Alice',
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function makeApiResponse<T>(data: T): ApiResponse<T> {
  return { success: true, message: 'ok', data };
}

interface CreateModuleOptions {
  id?: string;
  claims?: JwtClaims | null;
  post?: Post;
  postError?: boolean;
  createError?: boolean;
  updateError?: boolean;
}

function createModule(opts: CreateModuleOptions = {}) {
  const { id, claims = fakeClaims, post = mockPost, postError = false, createError = false, updateError = false } = opts;

  const postsService = {
    getById: vi.fn().mockReturnValue(
      postError ? throwError(() => new Error('fail')) : of(makeApiResponse(post))
    ),
    create: vi.fn().mockReturnValue(
      createError ? throwError(() => new Error('fail')) : of(makeApiResponse(post))
    ),
    update: vi.fn().mockReturnValue(
      updateError ? throwError(() => new Error('fail')) : of(makeApiResponse(post))
    ),
  };

  const authService = { getCurrentClaims: vi.fn().mockReturnValue(claims) };

  TestBed.configureTestingModule({
    imports: [PostFormComponent],
    providers: [
      provideRouter([]),
      { provide: PostsService, useValue: postsService },
      { provide: AuthService, useValue: authService },
    ],
  });

  const fixture = TestBed.createComponent(PostFormComponent);
  if (id !== undefined) {
    fixture.componentRef.setInput('id', id);
  }
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate').mockResolvedValue(true);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, router, postsService, authService };
}

describe('PostFormComponent', () => {
  // --- create mode ---
  describe('create mode (no id)', () => {
    it('should create', () => {
      const { component } = createModule();
      expect(component).toBeTruthy();
    });

    it('should have isEditMode = false', () => {
      const { component } = createModule();
      expect(component.isEditMode()).toBe(false);
    });

    it('should display "Nuevo post" heading', () => {
      const { fixture } = createModule();
      expect(fixture.nativeElement.textContent).toContain('Nuevo post');
    });

    it('should NOT call postsService.getById() in create mode', () => {
      const { postsService } = createModule();
      expect(postsService.getById).not.toHaveBeenCalled();
    });

    it('should pre-fill the author field from JWT claims', () => {
      const { component } = createModule({ claims: fakeClaims });
      expect(component.form.value.author).toBe('Alice');
    });

    it('should have empty title and body fields', () => {
      const { component } = createModule();
      expect(component.form.value.title).toBe('');
      expect(component.form.value.body).toBe('');
    });

    it('should show the author name from claims', () => {
      const { fixture } = createModule({ claims: fakeClaims });
      expect(fixture.nativeElement.textContent).toContain('Alice');
    });

    it('should have invalid form when title and body are empty', () => {
      const { component } = createModule();
      expect(component.form.invalid).toBe(true);
    });

    it('should have valid form when title (≥3) and body (≥10) are filled', () => {
      const { component } = createModule();
      component.form.patchValue({ title: 'Valid Title', body: 'Valid body content here' });
      expect(component.form.valid).toBe(true);
    });

    it('should show the submit button as "Publicar post"', () => {
      const { fixture } = createModule();
      expect(fixture.nativeElement.textContent).toContain('Publicar post');
    });
  });

  // --- edit mode ---
  describe('edit mode (with id)', () => {
    it('should have isEditMode = true', () => {
      const { component } = createModule({ id: 'post-1' });
      expect(component.isEditMode()).toBe(true);
    });

    it('should display "Editar post" heading', () => {
      const { fixture } = createModule({ id: 'post-1' });
      expect(fixture.nativeElement.textContent).toContain('Editar post');
    });

    it('should call postsService.getById() with the id', () => {
      const { postsService } = createModule({ id: 'post-1' });
      expect(postsService.getById).toHaveBeenCalledWith('post-1');
    });

    it('should pre-fill the form with post data', () => {
      const { component } = createModule({ id: 'post-1' });
      expect(component.form.value.title).toBe('Existing Post');
      expect(component.form.value.body).toBe('Existing body content here');
      expect(component.form.value.author).toBe('Alice');
    });

    it('should navigate to /posts on getById error', () => {
      const postsService = {
        getById: vi.fn().mockReturnValue(throwError(() => new Error('fail'))),
        create: vi.fn(),
        update: vi.fn(),
      };
      const authService = { getCurrentClaims: vi.fn().mockReturnValue(fakeClaims) };
      TestBed.configureTestingModule({
        imports: [PostFormComponent],
        providers: [
          provideRouter([]),
          { provide: PostsService, useValue: postsService },
          { provide: AuthService, useValue: authService },
        ],
      });
      const fixture = TestBed.createComponent(PostFormComponent);
      fixture.componentRef.setInput('id', 'bad-id');
      const router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith(['/posts']);
    });

    it('should set loadingPost to false after post is loaded', () => {
      const { component } = createModule({ id: 'post-1' });
      expect(component.loadingPost()).toBe(false);
    });

    it('should show the submit button as "Guardar cambios"', () => {
      const { fixture } = createModule({ id: 'post-1' });
      expect(fixture.nativeElement.textContent).toContain('Guardar cambios');
    });
  });

  // --- authorName ---
  describe('authorName()', () => {
    it('should return the name from claims', () => {
      const { component } = createModule({ claims: fakeClaims });
      expect(component.authorName()).toBe('Alice');
    });

    it('should return empty string when claims are null', () => {
      const { component } = createModule({ claims: null });
      expect(component.authorName()).toBe('');
    });
  });

  // --- getError ---
  describe('getError()', () => {
    it('should return empty string when field is valid', () => {
      const { component } = createModule();
      component.form.patchValue({ title: 'Valid Title' });
      component.form.get('title')!.markAsTouched();
      expect(component.getError('title')).toBe('');
    });

    it('should return required message when field is touched and empty', () => {
      const { component } = createModule();
      component.form.get('title')!.setValue('');
      component.form.get('title')!.markAsTouched();
      expect(component.getError('title')).toBe('Este campo es requerido');
    });

    it('should return minlength message when title is too short', () => {
      const { component } = createModule();
      component.form.get('title')!.setValue('ab');
      component.form.get('title')!.markAsTouched();
      expect(component.getError('title')).toBe('Mínimo 3 caracteres');
    });

    it('should return minlength message when body is too short', () => {
      const { component } = createModule();
      component.form.get('body')!.setValue('short');
      component.form.get('body')!.markAsTouched();
      expect(component.getError('body')).toBe('Mínimo 10 caracteres');
    });

    it('should return empty string when field is invalid but not yet touched', () => {
      const { component } = createModule();
      // title is empty (invalid) but NOT touched
      expect(component.getError('title')).toBe('');
    });
  });

  // --- onSubmit create ---
  describe('onSubmit() — create mode', () => {
    it('should mark all fields as touched when form is invalid', () => {
      const { component } = createModule();
      // Form starts invalid (empty title/body)
      component.form.patchValue({ author: 'Alice', title: '', body: '' });
      component.onSubmit();
      expect(component.form.get('title')!.touched).toBe(true);
      expect(component.form.get('body')!.touched).toBe(true);
    });

    it('should call postsService.create() with form data', () => {
      const { component, postsService } = createModule();
      component.form.patchValue({ title: 'New Title', body: 'Body content long enough', author: 'Alice' });
      component.onSubmit();
      expect(postsService.create).toHaveBeenCalledWith({
        title: 'New Title',
        body: 'Body content long enough',
        author: 'Alice',
      });
    });

    it('should navigate to the new post after creation', () => {
      const { component, router } = createModule();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.patchValue({ title: 'New Title', body: 'Body content long enough', author: 'Alice' });
      component.onSubmit();
      expect(spy).toHaveBeenCalledWith(['/posts', 'post-1']);
    });

    it('should reset saving to false after error', () => {
      const { component } = createModule({ createError: true });
      component.form.patchValue({ title: 'New Title', body: 'Body content long enough', author: 'Alice' });
      component.onSubmit();
      expect(component.saving()).toBe(false);
    });
  });

  // --- onSubmit edit ---
  describe('onSubmit() — edit mode', () => {
    it('should call postsService.update() with the id and form data', () => {
      const { component, postsService } = createModule({ id: 'post-1' });
      component.form.patchValue({ title: 'Updated Title', body: 'Updated body content enough', author: 'Alice' });
      component.onSubmit();
      expect(postsService.update).toHaveBeenCalledWith('post-1', {
        title: 'Updated Title',
        body: 'Updated body content enough',
        author: 'Alice',
      });
    });

    it('should navigate to post detail after update', () => {
      const { component, router } = createModule({ id: 'post-1' });
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.patchValue({ title: 'Updated Title', body: 'Updated body content enough', author: 'Alice' });
      component.onSubmit();
      expect(spy).toHaveBeenCalledWith(['/posts', 'post-1']);
    });

    it('should reset saving to false after update error', () => {
      const { component } = createModule({ id: 'post-1', updateError: true });
      component.form.patchValue({ title: 'Updated Title', body: 'Updated body content enough', author: 'Alice' });
      component.onSubmit();
      expect(component.saving()).toBe(false);
    });
  });

  // --- goBack ---
  describe('goBack()', () => {
    it('should navigate to /posts in create mode', () => {
      const { component, router } = createModule();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.goBack();
      expect(spy).toHaveBeenCalledWith(['/posts']);
    });

    it('should navigate to /posts/:id in edit mode', () => {
      const { component, router } = createModule({ id: 'post-1' });
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.goBack();
      expect(spy).toHaveBeenCalledWith(['/posts', 'post-1']);
    });
  });
});
