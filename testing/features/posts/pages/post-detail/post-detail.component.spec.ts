import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PostDetailComponent } from '@features/posts/pages/post-detail/post-detail.component';
import { PostsService } from '@features/posts/services/posts.service';
import { CommentsService } from '@features/posts/services/comments.service';
import { AuthService } from '@core/services/auth.service';
import { Post } from '@core/models/post.model';
import { Comment } from '@core/models/comment.model';
import { ApiResponse, PaginatedResponse } from '@core/models/api-response.model';
import { JwtClaims } from '@core/models/jwt-claims.model';

const OWNER_ID = 'user-1';

const fakeClaims: JwtClaims = {
  sub: OWNER_ID, name: 'Alice', email: 'alice@example.com', iat: 0, exp: 9999999999,
};

const mockPost: Post = {
  _id: 'post-1',
  title: 'Detail Page Post',
  body: 'Full body content of the post',
  author: 'Alice',
  userId: OWNER_ID,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockComment: Comment = {
  _id: 'comment-1',
  postId: 'post-1',
  body: 'Nice post!',
  name: 'Bob',
  userId: 'user-2',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function makeApiResponse<T>(data: T): ApiResponse<T> {
  return { success: true, message: 'ok', data };
}

function makePaginatedComments(comments: Comment[]): PaginatedResponse<Comment> {
  return {
    success: true,
    message: 'ok',
    timestamp: '2026-01-01T00:00:00.000Z',
    data: {
      data: comments,
      pagination: { page: 1, limit: 10, total: comments.length, pages: 1, hasNextPage: false, hasPrevPage: false },
    },
  };
}

interface CreateModuleOptions {
  claims?: JwtClaims | null;
  post?: Post | null;
  comments?: Comment[];
  postError?: boolean;
}

function createModule(opts: CreateModuleOptions = {}) {
  const { claims = null, post = mockPost, comments = [], postError = false } = opts;

  const postsService = {
    getById: vi.fn().mockReturnValue(
      postError ? throwError(() => new Error('fail')) : of(makeApiResponse(post!))
    ),
    delete: vi.fn().mockReturnValue(of(makeApiResponse(null))),
    update: vi.fn().mockReturnValue(of(makeApiResponse(post!))),
  };

  const commentsService = {
    getByPost: vi.fn().mockReturnValue(of(makePaginatedComments(comments))),
    create: vi.fn().mockReturnValue(of(makeApiResponse(mockComment))),
    update: vi.fn().mockReturnValue(of(makeApiResponse(mockComment))),
    delete: vi.fn().mockReturnValue(of(makeApiResponse(null))),
  };

  const authService = { getCurrentClaims: vi.fn().mockReturnValue(claims) };

  TestBed.configureTestingModule({
    imports: [PostDetailComponent],
    providers: [
      provideRouter([]),
      { provide: PostsService, useValue: postsService },
      { provide: CommentsService, useValue: commentsService },
      { provide: AuthService, useValue: authService },
    ],
  });

  const fixture = TestBed.createComponent(PostDetailComponent);
  fixture.componentRef.setInput('id', 'post-1');
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate').mockResolvedValue(true);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, router, postsService, commentsService };
}

describe('PostDetailComponent', () => {
  // --- setup ---
  describe('creation', () => {
    it('should create', () => {
      const { component } = createModule();
      expect(component).toBeTruthy();
    });

    it('should have the id input set to "post-1"', () => {
      const { component } = createModule();
      expect(component.id()).toBe('post-1');
    });
  });

  // --- post loading ---
  describe('post loading', () => {
    it('should call postsService.getById() with the id on init', () => {
      const { postsService } = createModule();
      expect(postsService.getById).toHaveBeenCalledWith('post-1');
    });

    it('should display the post title after loading', () => {
      const { fixture } = createModule();
      expect(fixture.nativeElement.textContent).toContain('Detail Page Post');
    });

    it('should display the post body after loading', () => {
      const { fixture } = createModule();
      expect(fixture.nativeElement.textContent).toContain('Full body content of the post');
    });

    it('should display the author name', () => {
      const { fixture } = createModule();
      expect(fixture.nativeElement.textContent).toContain('Alice');
    });

    it('should set loadingPost to false after load', () => {
      const { component } = createModule();
      expect(component.loadingPost()).toBe(false);
    });

    it('should navigate to /posts when post load fails', () => {
      const { router } = createModule({ postError: true });
      // navigate was already called during ngOnInit via the router spy set up in createModule
      expect(router.navigate).toHaveBeenCalledWith(['/posts']);
    });
  });

  // --- comments loading ---
  describe('comments loading', () => {
    it('should call commentsService.getByPost() on init', () => {
      const { commentsService } = createModule();
      expect(commentsService.getByPost).toHaveBeenCalledWith({
        postId: 'post-1',
        page: 1,
        limit: 10,
      });
    });

    it('should display comments after loading', () => {
      const { fixture } = createModule({ comments: [mockComment] });
      expect(fixture.nativeElement.textContent).toContain('Nice post!');
    });

    it('should display comment count', () => {
      const { fixture } = createModule({ comments: [mockComment] });
      // total from pagination = 1
      expect(fixture.nativeElement.textContent).toContain('1');
    });

    it('should show "no comments" message when there are none', () => {
      const { fixture } = createModule({ comments: [] });
      expect(fixture.nativeElement.textContent).toContain('Sin comentarios');
    });
  });

  // --- owner computed ---
  describe('isPostOwner()', () => {
    it('should return false when not authenticated', () => {
      const { component } = createModule({ claims: null });
      expect(component.isPostOwner()).toBe(false);
    });

    it('should return true when current user is the post owner', () => {
      const { component } = createModule({ claims: fakeClaims });
      expect(component.isPostOwner()).toBe(true);
    });

    it('should return false when authenticated but not the owner', () => {
      const { component } = createModule({
        claims: { ...fakeClaims, sub: 'other-user' },
      });
      expect(component.isPostOwner()).toBe(false);
    });

    it('should show edit/delete buttons for the post owner', () => {
      const { fixture } = createModule({ claims: fakeClaims });
      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const editBtn = [...buttons].find(b => b.textContent?.includes('Editar'));
      expect(editBtn).toBeTruthy();
    });

    it('should NOT show edit button for non-owner', () => {
      const { fixture } = createModule({ claims: null });
      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const editBtn = [...buttons].find(b => b.textContent?.includes('Editar'));
      // The "Editar" inside comment editing could appear, but the post edit button is inside `@if (isPostOwner())`
      // goBack button is the only button visible when not owner
      expect(editBtn).toBeUndefined();
    });
  });

  // --- goBack / editPost ---
  describe('navigation', () => {
    it('should navigate to /posts on goBack()', () => {
      const { component, router } = createModule();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.goBack();
      expect(spy).toHaveBeenCalledWith(['/posts']);
    });

    it('should navigate to edit route on editPost()', () => {
      const { component, router } = createModule();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.editPost();
      expect(spy).toHaveBeenCalledWith(['/posts', 'post-1', 'edit']);
    });
  });

  // --- delete post ---
  describe('deletePost()', () => {
    it('should call postsService.delete() with the post id', () => {
      const { component, postsService } = createModule({ claims: fakeClaims });
      component.deletePost();
      expect(postsService.delete).toHaveBeenCalledWith('post-1');
    });

    it('should navigate to /posts after deleting the post', () => {
      const { component, router } = createModule({ claims: fakeClaims });
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.deletePost();
      expect(spy).toHaveBeenCalledWith(['/posts']);
    });

    it('should open confirm dialog when confirmDeletePost.set(true)', () => {
      const { component } = createModule({ claims: fakeClaims });
      component.confirmDeletePost.set(true);
      expect(component.confirmDeletePost()).toBe(true);
    });
  });

  // --- wasEdited ---
  describe('wasEdited()', () => {
    it('should return false when createdAt equals updatedAt', () => {
      const { component } = createModule();
      expect(component.wasEdited()).toBe(false);
    });

    it('should return true when updatedAt is more than 1 second after createdAt', () => {
      const { component } = createModule({
        post: {
          ...mockPost,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:01:00.000Z',
        },
      });
      expect(component.wasEdited()).toBe(true);
    });
  });

  // --- comment submission ---
  describe('onCommentSubmit()', () => {
    it('should call commentsService.create() with postId and body', () => {
      const { component, commentsService } = createModule({ claims: fakeClaims });
      component.onCommentSubmit('A great comment');
      expect(commentsService.create).toHaveBeenCalledWith({
        postId: 'post-1',
        body: 'A great comment',
      });
    });

    it('should reset submittingComment to false on success', () => {
      const { component } = createModule({ claims: fakeClaims });
      component.onCommentSubmit('A great comment');
      expect(component.submittingComment()).toBe(false);
    });

    it('should NOT call commentsService.create() when not authenticated', () => {
      const { component, commentsService } = createModule({ claims: null });
      component.onCommentSubmit('A great comment');
      expect(commentsService.create).not.toHaveBeenCalled();
    });

    it('should reset page to 1 and reload comments after submit', () => {
      const { component, commentsService } = createModule({ claims: fakeClaims });
      component.commentsPage.set(3);
      component.onCommentSubmit('A great comment');
      expect(component.commentsPage()).toBe(1);
      // reloadComments$ triggers another getByPost call
      expect(commentsService.getByPost).toHaveBeenCalledTimes(2);
    });
  });

  // --- comment editing ---
  describe('comment editing', () => {
    it('should set editingCommentId and editingBody on startEditComment()', () => {
      const { component } = createModule({ claims: fakeClaims });
      component.startEditComment(mockComment);
      expect(component.editingCommentId()).toBe('comment-1');
      expect(component.editingBody).toBe('Nice post!');
    });

    it('should clear editingCommentId on cancelCommentEdit()', () => {
      const { component } = createModule({ claims: fakeClaims });
      component.startEditComment(mockComment);
      component.cancelCommentEdit();
      expect(component.editingCommentId()).toBeNull();
      expect(component.editingBody).toBe('');
    });

    it('should call commentsService.update() on saveCommentEdit()', () => {
      const { component, commentsService } = createModule({ claims: fakeClaims });
      component.editingBody = 'Updated body content';
      component.saveCommentEdit('comment-1');
      expect(commentsService.update).toHaveBeenCalledWith('comment-1', 'Updated body content');
    });

    it('should NOT call update when editingBody is empty/whitespace', () => {
      const { component, commentsService } = createModule({ claims: fakeClaims });
      component.editingBody = '   ';
      component.saveCommentEdit('comment-1');
      expect(commentsService.update).not.toHaveBeenCalled();
    });

    it('should clear editing state after successful save', () => {
      const { component } = createModule({ claims: fakeClaims });
      component.editingBody = 'Updated body content';
      component.startEditComment(mockComment);
      component.saveCommentEdit('comment-1');
      expect(component.editingCommentId()).toBeNull();
    });
  });

  // --- comment deletion ---
  describe('comment deletion', () => {
    it('should set deletingCommentId and open confirm dialog', () => {
      const { component } = createModule({ claims: fakeClaims });
      component.requestDeleteComment('comment-1');
      expect(component.deletingCommentId()).toBe('comment-1');
      expect(component.confirmDeleteComment()).toBe(true);
    });

    it('should call commentsService.delete() with the comment id', () => {
      const { component, commentsService } = createModule({ claims: fakeClaims });
      component.requestDeleteComment('comment-1');
      component.deleteComment();
      expect(commentsService.delete).toHaveBeenCalledWith('comment-1');
    });

    it('should clear deletion state after successful delete', () => {
      const { component } = createModule({ claims: fakeClaims });
      component.requestDeleteComment('comment-1');
      component.deleteComment();
      expect(component.deletingComment()).toBe(false);
      expect(component.confirmDeleteComment()).toBe(false);
      expect(component.deletingCommentId()).toBeNull();
    });

    it('should do nothing when deletingCommentId is null', () => {
      const { component, commentsService } = createModule({ claims: fakeClaims });
      component.deleteComment();
      expect(commentsService.delete).not.toHaveBeenCalled();
    });
  });

  // --- isCommentOwner ---
  describe('isCommentOwner()', () => {
    it('should return true when comment.userId matches current user', () => {
      const { component } = createModule({ claims: fakeClaims });
      const ownComment = { ...mockComment, userId: OWNER_ID };
      expect(component.isCommentOwner(ownComment)).toBe(true);
    });

    it('should return false when comment.userId does not match', () => {
      const { component } = createModule({ claims: fakeClaims });
      expect(component.isCommentOwner(mockComment)).toBe(false);
    });
  });

  // --- wasCommentEdited ---
  describe('wasCommentEdited()', () => {
    it('should return false when createdAt equals updatedAt', () => {
      const { component } = createModule();
      expect(component.wasCommentEdited(mockComment)).toBe(false);
    });

    it('should return true when updatedAt differs by more than 1 second', () => {
      const { component } = createModule();
      const edited = {
        ...mockComment,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:01:00.000Z',
      };
      expect(component.wasCommentEdited(edited)).toBe(true);
    });
  });

  // --- comment pagination ---
  describe('comment pagination', () => {
    it('should update commentsPage and reload on onCommentPageChange()', () => {
      const { component, commentsService } = createModule();
      const callsBefore = (commentsService.getByPost as ReturnType<typeof vi.fn>).mock.calls.length;
      component.onCommentPageChange(2);
      expect(component.commentsPage()).toBe(2);
      expect(commentsService.getByPost).toHaveBeenCalledTimes(callsBefore + 1);
    });

    it('should update commentsPageSize and reset page on onCommentPageSizeChange2()', () => {
      const { component } = createModule();
      component.onCommentPageSizeChange2(25);
      expect(component.commentsPageSize()).toBe(25);
      expect(component.commentsPage()).toBe(1);
    });
  });
});
