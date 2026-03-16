import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PostsService, PostsQuery, CreatePostDto } from '../../../../src/app/features/posts/services/posts.service';
import { Post } from '../../../../src/app/core/models/post.model';
import { ApiResponse, PaginatedResponse } from '../../../../src/app/core/models/api-response.model';
import { environment } from '../../../../src/environments/environment';

const API_URL = `${environment.apiUrl}/posts`;

const mockPost: Post = {
  _id: 'post-1',
  title: 'Test Post',
  body: 'Test body content',
  author: 'Alice',
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function makePaginatedResponse(posts: Post[]): PaginatedResponse<Post> {
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

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PostsService],
    });
    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // --- getAll ---
  describe('getAll()', () => {
    it('should GET the paginated endpoint with no query params', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne(r => r.url === `${API_URL}/paginated`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toHaveLength(0);
      req.flush(makePaginatedResponse([]));
    });

    it('should include page and limit as query params', () => {
      service.getAll({ page: 2, limit: 5 }).subscribe();
      const req = httpMock.expectOne(r => r.url === `${API_URL}/paginated`);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('5');
      req.flush(makePaginatedResponse([]));
    });

    it('should include a trimmed search param', () => {
      service.getAll({ search: '  angular  ' }).subscribe();
      const req = httpMock.expectOne(r => r.url === `${API_URL}/paginated`);
      expect(req.request.params.get('search')).toBe('angular');
      req.flush(makePaginatedResponse([]));
    });

    it('should include userId param', () => {
      service.getAll({ userId: 'user-1' }).subscribe();
      const req = httpMock.expectOne(r => r.url === `${API_URL}/paginated`);
      expect(req.request.params.get('userId')).toBe('user-1');
      req.flush(makePaginatedResponse([]));
    });

    it('should NOT include search param when value is blank', () => {
      service.getAll({ search: '   ' }).subscribe();
      const req = httpMock.expectOne(r => r.url === `${API_URL}/paginated`);
      expect(req.request.params.has('search')).toBe(false);
      req.flush(makePaginatedResponse([]));
    });

    it('should return paginated posts data', () => {
      let result: PaginatedResponse<Post> | undefined;
      service.getAll().subscribe(r => (result = r));
      httpMock.expectOne(r => r.url === `${API_URL}/paginated`).flush(makePaginatedResponse([mockPost]));
      expect(result?.data.data).toHaveLength(1);
      expect(result?.data.data[0]._id).toBe('post-1');
    });

    it('should propagate errors after all retries', async () => {
      vi.useFakeTimers();
      let error: unknown;
      service.getAll().subscribe({ error: e => (error = e) });
      // initial attempt
      httpMock
        .expectOne(r => r.url === `${API_URL}/paginated`)
        .flush('Not Found', { status: 404, statusText: 'Not Found' });
      // retry #1 after 1 s
      await vi.advanceTimersByTimeAsync(1000);
      httpMock
        .expectOne(r => r.url === `${API_URL}/paginated`)
        .flush('Not Found', { status: 404, statusText: 'Not Found' });
      // retry #2 after 2 s
      await vi.advanceTimersByTimeAsync(2000);
      httpMock
        .expectOne(r => r.url === `${API_URL}/paginated`)
        .flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(error).toBeTruthy();
      vi.useRealTimers();
    });
  });

  // --- getById ---
  describe('getById()', () => {
    it('should GET the correct URL', () => {
      service.getById('post-1').subscribe();
      const req = httpMock.expectOne(`${API_URL}/post-1`);
      expect(req.request.method).toBe('GET');
      req.flush(makeApiResponse(mockPost));
    });

    it('should return the post', () => {
      let result: ApiResponse<Post> | undefined;
      service.getById('post-1').subscribe(r => (result = r));
      httpMock.expectOne(`${API_URL}/post-1`).flush(makeApiResponse(mockPost));
      expect(result?.data._id).toBe('post-1');
    });

    it('should propagate errors', () => {
      let error: unknown;
      service.getById('x').subscribe({ error: e => (error = e) });
      httpMock.expectOne(`${API_URL}/x`).flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(error).toBeTruthy();
    });
  });

  // --- create ---
  describe('create()', () => {
    const dto: CreatePostDto = { title: 'New Post', body: 'Body text', author: 'Bob' };

    it('should POST to the posts endpoint', () => {
      service.create(dto).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(makeApiResponse(mockPost));
    });

    it('should return the created post', () => {
      let result: ApiResponse<Post> | undefined;
      service.create(dto).subscribe(r => (result = r));
      httpMock.expectOne(API_URL).flush(makeApiResponse(mockPost));
      expect(result?.data.title).toBe('Test Post');
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
    it('should PUT to the correct URL', () => {
      service.update('post-1', { title: 'Updated' }).subscribe();
      const req = httpMock.expectOne(`${API_URL}/post-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ title: 'Updated' });
      req.flush(makeApiResponse(mockPost));
    });

    it('should return the updated post', () => {
      let result: ApiResponse<Post> | undefined;
      service.update('post-1', { title: 'Updated' }).subscribe(r => (result = r));
      httpMock.expectOne(`${API_URL}/post-1`).flush(makeApiResponse({ ...mockPost, title: 'Updated' }));
      expect(result?.data.title).toBe('Updated');
    });

    it('should propagate errors after retries', async () => {
      vi.useFakeTimers();
      let error: unknown;
      service.update('x', { title: 'X' }).subscribe({ error: e => (error = e) });
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
      service.delete('post-1').subscribe();
      const req = httpMock.expectOne(`${API_URL}/post-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(makeApiResponse(null));
    });

    it('should return the api response', () => {
      let result: ApiResponse<null> | undefined;
      service.delete('post-1').subscribe(r => (result = r));
      httpMock.expectOne(`${API_URL}/post-1`).flush(makeApiResponse(null));
      expect(result?.success).toBe(true);
    });

    it('should propagate errors', () => {
      let error: unknown;
      service.delete('x').subscribe({ error: e => (error = e) });
      httpMock.expectOne(`${API_URL}/x`).flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(error).toBeTruthy();
    });
  });

  // --- deleteBulk ---
  describe('deleteBulk()', () => {
    it('should DELETE with the ids in the request body', () => {
      service.deleteBulk(['post-1', 'post-2']).subscribe();
      const req = httpMock.expectOne(`${API_URL}/bulk`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({ ids: ['post-1', 'post-2'] });
      req.flush(makeApiResponse({ deletedCount: 2 }));
    });

    it('should return the deletedCount', () => {
      let result: ApiResponse<{ deletedCount: number }> | undefined;
      service.deleteBulk(['post-1']).subscribe(r => (result = r));
      httpMock.expectOne(`${API_URL}/bulk`).flush(makeApiResponse({ deletedCount: 1 }));
      expect(result?.data.deletedCount).toBe(1);
    });

    it('should propagate errors', () => {
      let error: unknown;
      service.deleteBulk(['x']).subscribe({ error: e => (error = e) });
      httpMock
        .expectOne(`${API_URL}/bulk`)
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      expect(error).toBeTruthy();
    });
  });
});
