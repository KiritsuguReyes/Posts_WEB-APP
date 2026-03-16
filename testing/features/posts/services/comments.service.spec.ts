import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CommentsService, CommentsQuery, CreateCommentDto } from '../../../../src/app/features/posts/services/comments.service';
import { Comment } from '../../../../src/app/core/models/comment.model';
import { ApiResponse, PaginatedResponse } from '../../../../src/app/core/models/api-response.model';
import { environment } from '../../../../src/environments/environment';

const API_URL = `${environment.apiUrl}/comments`;

const mockComment: Comment = {
  _id: 'comment-1',
  postId: 'post-1',
  body: 'Great post!',
  name: 'Alice',
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function makePaginatedResponse(comments: Comment[]): PaginatedResponse<Comment> {
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

function makeApiResponse<T>(data: T): ApiResponse<T> {
  return { success: true, message: 'ok', data };
}

describe('CommentsService', () => {
  let service: CommentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CommentsService],
    });
    service = TestBed.inject(CommentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // --- getByPost ---
  describe('getByPost()', () => {
    it('should GET the paginated endpoint with postId', () => {
      service.getByPost({ postId: 'post-1' }).subscribe();
      const req = httpMock.expectOne(r => r.url === `${API_URL}/paginated`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('postId')).toBe('post-1');
      req.flush(makePaginatedResponse([]));
    });

    it('should include page and limit params', () => {
      service.getByPost({ postId: 'post-1', page: 2, limit: 5 }).subscribe();
      const req = httpMock.expectOne(r => r.url === `${API_URL}/paginated`);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('5');
      req.flush(makePaginatedResponse([]));
    });

    it('should NOT include page/limit when not provided', () => {
      service.getByPost({ postId: 'post-1' }).subscribe();
      const req = httpMock.expectOne(r => r.url === `${API_URL}/paginated`);
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('limit')).toBe(false);
      req.flush(makePaginatedResponse([]));
    });

    it('should return comment data', () => {
      let result: PaginatedResponse<Comment> | undefined;
      service.getByPost({ postId: 'post-1' }).subscribe(r => (result = r));
      httpMock
        .expectOne(r => r.url === `${API_URL}/paginated`)
        .flush(makePaginatedResponse([mockComment]));
      expect(result?.data.data).toHaveLength(1);
      expect(result?.data.data[0]._id).toBe('comment-1');
    });

    it('should propagate errors after retries', async () => {
      vi.useFakeTimers();
      let error: unknown;
      service.getByPost({ postId: 'post-1' }).subscribe({ error: e => (error = e) });
      // initial attempt
      httpMock
        .expectOne(r => r.url === `${API_URL}/paginated`)
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      // retry #1 after 1 s
      await vi.advanceTimersByTimeAsync(1000);
      httpMock
        .expectOne(r => r.url === `${API_URL}/paginated`)
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      // retry #2 after 2 s
      await vi.advanceTimersByTimeAsync(2000);
      httpMock
        .expectOne(r => r.url === `${API_URL}/paginated`)
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      expect(error).toBeTruthy();
      vi.useRealTimers();
    });
  });

  // --- create ---
  describe('create()', () => {
    const dto: CreateCommentDto = { postId: 'post-1', body: 'Nice article!' };

    it('should POST to the comments endpoint', () => {
      service.create(dto).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(makeApiResponse(mockComment));
    });

    it('should return the created comment', () => {
      let result: ApiResponse<Comment> | undefined;
      service.create(dto).subscribe(r => (result = r));
      httpMock.expectOne(API_URL).flush(makeApiResponse(mockComment));
      expect(result?.data._id).toBe('comment-1');
    });

    it('should propagate errors', () => {
      let error: unknown;
      service.create(dto).subscribe({ error: e => (error = e) });
      httpMock.expectOne(API_URL).flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(error).toBeTruthy();
    });
  });

  // --- update ---
  describe('update()', () => {
    it('should PUT to the correct URL with body in payload', () => {
      service.update('comment-1', 'Updated body').subscribe();
      const req = httpMock.expectOne(`${API_URL}/comment-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ body: 'Updated body' });
      req.flush(makeApiResponse(mockComment));
    });

    it('should return the updated comment', () => {
      let result: ApiResponse<Comment> | undefined;
      service.update('comment-1', 'Updated').subscribe(r => (result = r));
      httpMock
        .expectOne(`${API_URL}/comment-1`)
        .flush(makeApiResponse({ ...mockComment, body: 'Updated' }));
      expect(result?.data.body).toBe('Updated');
    });

    it('should propagate errors after retries', async () => {
      vi.useFakeTimers();
      let error: unknown;
      service.update('x', 'text').subscribe({ error: e => (error = e) });
      // initial attempt
      httpMock.expectOne(`${API_URL}/x`).flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      // retry #1 after 1 s
      await vi.advanceTimersByTimeAsync(1000);
      httpMock.expectOne(`${API_URL}/x`).flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      // retry #2 after 2 s
      await vi.advanceTimersByTimeAsync(2000);
      httpMock.expectOne(`${API_URL}/x`).flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      expect(error).toBeTruthy();
      vi.useRealTimers();
    });
  });

  // --- delete ---
  describe('delete()', () => {
    it('should DELETE the correct URL', () => {
      service.delete('comment-1').subscribe();
      const req = httpMock.expectOne(`${API_URL}/comment-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(makeApiResponse(null));
    });

    it('should return a successful api response', () => {
      let result: ApiResponse<null> | undefined;
      service.delete('comment-1').subscribe(r => (result = r));
      httpMock.expectOne(`${API_URL}/comment-1`).flush(makeApiResponse(null));
      expect(result?.success).toBe(true);
    });

    it('should propagate errors', () => {
      let error: unknown;
      service.delete('x').subscribe({ error: e => (error = e) });
      httpMock.expectOne(`${API_URL}/x`).flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(error).toBeTruthy();
    });
  });
});
