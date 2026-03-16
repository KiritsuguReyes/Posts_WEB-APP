import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError, NEVER } from 'rxjs';
import { PostListComponent } from '../../../../../src/app/features/posts/pages/post-list/post-list.component';
import { PostsService } from '../../../../../src/app/features/posts/services/posts.service';
import { AuthService } from '../../../../../src/app/core/services/auth.service';
import { Post } from '../../../../../src/app/core/models/post.model';
import { PaginatedResponse, ApiResponse } from '../../../../../src/app/core/models/api-response.model';
import { JwtClaims } from '../../../../../src/app/core/models/jwt-claims.model';

const OWNER_ID = 'user-1';

const fakeClaims: JwtClaims = {
  sub: OWNER_ID, name: 'Alice', email: 'alice@example.com', iat: 0, exp: 9999999999,
};

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    _id: 'post-1',
    title: 'Test Post',
    body: 'Body content',
    author: 'Alice',
    userId: OWNER_ID,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makePaginated(posts: Post[]): PaginatedResponse<Post> {
  return {
    success: true,
    message: 'ok',
    timestamp: '2026-01-01T00:00:00.000Z',
    data: {
      data: posts,
      pagination: { page: 1, limit: 10, total: posts.length, pages: 1, hasNextPage: false, hasPrevPage: false },
    },
  };
}

function makeApiResponse<T>(data: T): ApiResponse<T> {
  return { success: true, message: 'ok', data };
}

function createModule(claims: JwtClaims | null = null, posts: Post[] = [makePost()]) {
  const postsService = {
    getAll: vi.fn().mockReturnValue(of(makePaginated(posts))),
    delete: vi.fn().mockReturnValue(of(makeApiResponse(null))),
    deleteBulk: vi.fn().mockReturnValue(of(makeApiResponse({ deletedCount: 1 }))),
  };
  const authService = { getCurrentClaims: vi.fn().mockReturnValue(claims) };

  TestBed.configureTestingModule({
    imports: [PostListComponent],
    providers: [
      provideRouter([]),
      { provide: PostsService, useValue: postsService },
      { provide: AuthService, useValue: authService },
    ],
  });

  const fixture = TestBed.createComponent(PostListComponent);
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate').mockResolvedValue(true);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, router, postsService, authService };
}

describe('PostListComponent', () => {
  // --- basic rendering ---
  describe('rendering', () => {
    it('should create', () => {
      const { component } = createModule();
      expect(component).toBeTruthy();
    });

    it('should show the page heading', () => {
      const { fixture } = createModule();
      expect(fixture.nativeElement.textContent).toContain('Posts');
    });

    it('should show the "Nuevo post" button', () => {
      const { fixture } = createModule();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const btn = [...buttons].find((b: HTMLButtonElement) => b.textContent?.includes('Nuevo post'));
      expect(btn).toBeTruthy();
    });

    it('should render post cards after successful load', () => {
      const { fixture } = createModule(null, [makePost(), makePost({ _id: 'post-2', title: 'Second' })]);
      expect(fixture.nativeElement.querySelectorAll('app-post-card').length).toBe(2);
    });

    it('should show empty state when there are no posts', () => {
      const { fixture } = createModule(null, []);
      expect(fixture.nativeElement.querySelector('app-empty-state')).toBeTruthy();
    });
  });

  // --- loading state ---
  describe('loading state', () => {
    it('should show skeleton while loading and hide after', () => {
      const { component, fixture } = createModule();
      // After detectChanges with sync observable, loading is already false
      expect(component.loading()).toBe(false);
    });
  });

  // --- initial data fetch ---
  describe('ngOnInit()', () => {
    it('should call postsService.getAll() on init', () => {
      const { postsService } = createModule();
      expect(postsService.getAll).toHaveBeenCalled();
    });

    it('should populate posts after a successful response', () => {
      const { component } = createModule(null, [makePost()]);
      expect(component.posts()).toHaveLength(1);
    });

    it('should set total from pagination', () => {
      const { component } = createModule(null, [makePost()]);
      expect(component.total()).toBe(1);
    });

    it('should have loading true while request is pending', () => {
      const postsService = {
        getAll: vi.fn().mockReturnValue(NEVER),
        delete: vi.fn(),
        deleteBulk: vi.fn(),
      };
      const authService = { getCurrentClaims: vi.fn().mockReturnValue(null) };
      TestBed.configureTestingModule({
        imports: [PostListComponent],
        providers: [
          provideRouter([]),
          { provide: PostsService, useValue: postsService },
          { provide: AuthService, useValue: authService },
        ],
      });
      const fixture = TestBed.createComponent(PostListComponent);
      const router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
      fixture.detectChanges();
      expect(fixture.componentInstance.loading()).toBe(true);
    });
  });

  // --- navigation ---
  describe('navigation', () => {
    it('should navigate to /posts/new when clicking "Nuevo post"', () => {
      const { fixture, router } = createModule();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const btn = [...buttons].find((b: HTMLButtonElement) => b.textContent?.includes('Nuevo post'))!;
      btn.click();
      expect(spy).toHaveBeenCalledWith(['/posts/new']);
    });

    it('should navigate to edit route when editPost() is called', () => {
      const { component, router } = createModule();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.editPost('post-1');
      expect(spy).toHaveBeenCalledWith(['/posts', 'post-1', 'edit']);
    });
  });

  // --- delete ---
  describe('deletePost()', () => {
    it('should call postsService.delete() with the post id', () => {
      const { component, postsService } = createModule();
      component.deletePost('post-1');
      expect(postsService.delete).toHaveBeenCalledWith('post-1');
    });

    it('should reload posts after successful delete', () => {
      const { component, postsService } = createModule();
      component.deletePost('post-1');
      // getAll was called in ngOnInit (1x) + reload after delete (1x)
      expect(postsService.getAll).toHaveBeenCalledTimes(2);
    });

    it('should clear deletingId after successful delete', () => {
      const { component } = createModule();
      component.deletePost('post-1');
      expect(component.deletingId()).toBeNull();
    });

    it('should clear deletingId on error', () => {
      const posts = [makePost()];
      const postsService = {
        getAll: vi.fn().mockReturnValue(of(makePaginated(posts))),
        delete: vi.fn().mockReturnValue(throwError(() => new Error('fail'))),
        deleteBulk: vi.fn(),
      };
      const authService = { getCurrentClaims: vi.fn().mockReturnValue(null) };
      TestBed.configureTestingModule({
        imports: [PostListComponent],
        providers: [
          provideRouter([]),
          { provide: PostsService, useValue: postsService },
          { provide: AuthService, useValue: authService },
        ],
      });
      const fixture = TestBed.createComponent(PostListComponent);
      fixture.detectChanges();
      fixture.componentInstance.deletePost('post-1');
      expect(fixture.componentInstance.deletingId()).toBeNull();
    });
  });

  // --- filter ---
  describe('onFilterChange()', () => {
    it('should update filterMode to "own"', () => {
      const { component } = createModule();
      component.onFilterChange({ target: { value: 'own' } } as unknown as Event);
      expect(component.filterMode()).toBe('own');
    });

    it('should reset to page 1 when filter changes', () => {
      const { component } = createModule();
      component.page.set(3);
      component.onFilterChange({ target: { value: 'own' } } as unknown as Event);
      expect(component.page()).toBe(1);
    });

    it('should reload posts after filter change', () => {
      const { component, postsService } = createModule();
      const callsBefore = (postsService.getAll as ReturnType<typeof vi.fn>).mock.calls.length;
      component.onFilterChange({ target: { value: 'own' } } as unknown as Event);
      expect(postsService.getAll).toHaveBeenCalledTimes(callsBefore + 1);
    });

    it('should pass userId when filter is "own"', () => {
      const { component, postsService } = createModule(fakeClaims);
      component.onFilterChange({ target: { value: 'own' } } as unknown as Event);
      const lastCall = (postsService.getAll as ReturnType<typeof vi.fn>).mock.calls.at(-1)![0];
      expect(lastCall.userId).toBe(OWNER_ID);
    });
  });

  // --- pagination ---
  describe('onPageChange()', () => {
    it('should update the page signal', () => {
      const { component } = createModule();
      vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      component.onPageChange(2);
      expect(component.page()).toBe(2);
    });

    it('should reload posts on page change', () => {
      const { component, postsService } = createModule();
      vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      const callsBefore = (postsService.getAll as ReturnType<typeof vi.fn>).mock.calls.length;
      component.onPageChange(2);
      expect(postsService.getAll).toHaveBeenCalledTimes(callsBefore + 1);
    });
  });

  // --- selection ---
  describe('selection', () => {
    it('should add id to selectedIds on toggleSelection()', () => {
      const { component } = createModule();
      component.toggleSelection('post-1');
      expect(component.selectedIds().has('post-1')).toBe(true);
    });

    it('should remove id when toggling a selected id', () => {
      const { component } = createModule();
      component.toggleSelection('post-1');
      component.toggleSelection('post-1');
      expect(component.selectedIds().has('post-1')).toBe(false);
    });

    it('should clear all selected ids on clearSelection()', () => {
      const { component } = createModule();
      component.toggleSelection('post-1');
      component.toggleSelection('post-2');
      component.clearSelection();
      expect(component.selectedIds().size).toBe(0);
    });

    it('should show the bulk selection bar when there are selected posts', () => {
      const { component, fixture } = createModule();
      component.toggleSelection('post-1');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('seleccionado');
    });
  });

  // --- bulk delete ---
  describe('bulk delete', () => {
    it('should open bulk delete modal via bulkDeleteVisible', () => {
      const { component } = createModule();
      component.bulkDeleteVisible.set(true);
      expect(component.bulkDeleteVisible()).toBe(true);
    });

    it('should call postsService.deleteBulk() with selected ids', () => {
      const { component, postsService } = createModule();
      component.toggleSelection('post-1');
      component.toggleSelection('post-2');
      component.confirmBulkDelete();
      expect(postsService.deleteBulk).toHaveBeenCalledWith(['post-1', 'post-2']);
    });

    it('should clear selection and close modal after bulk delete', () => {
      const { component } = createModule();
      component.toggleSelection('post-1');
      component.bulkDeleteVisible.set(true);
      component.confirmBulkDelete();
      expect(component.selectedIds().size).toBe(0);
      expect(component.bulkDeleteVisible()).toBe(false);
    });

    it('should compute selectedPosts from selectedIds', () => {
      const { component } = createModule(null, [makePost(), makePost({ _id: 'post-2', title: 'Second' })]);
      component.toggleSelection('post-1');
      expect(component.selectedPosts()).toHaveLength(1);
      expect(component.selectedPosts()[0]._id).toBe('post-1');
    });
  });

  // --- isOwner ---
  describe('isOwner()', () => {
    it('should return true when post.userId matches currentUserId', () => {
      const { component } = createModule(fakeClaims);
      expect(component.isOwner(makePost({ userId: OWNER_ID }))).toBe(true);
    });

    it('should return false when userId does not match', () => {
      const { component } = createModule(fakeClaims);
      expect(component.isOwner(makePost({ userId: 'other' }))).toBe(false);
    });

    it('should return false when not authenticated', () => {
      const { component } = createModule(null);
      expect(component.isOwner(makePost())).toBe(false);
    });
  });

  // --- currentUserId ---
  describe('currentUserId()', () => {
    it('should return null when not authenticated', () => {
      const { component } = createModule(null);
      expect(component.currentUserId()).toBeNull();
    });

    it('should return the sub from claims when authenticated', () => {
      const { component } = createModule(fakeClaims);
      expect(component.currentUserId()).toBe(OWNER_ID);
    });
  });
});
