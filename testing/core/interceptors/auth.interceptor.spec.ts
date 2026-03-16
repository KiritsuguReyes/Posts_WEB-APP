import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { JwtService } from '@core/services/jwt.service';
import { AuthService } from '@core/services/auth.service';
import { ErrorService } from '@core/services/error.service';
import { LoadingService } from '@shared/components/loading/loading.service';

const TEST_URL = 'https://api.test/data';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;
  const mockLogout = vi.fn();
  const mockHandle = vi.fn();

  beforeEach(() => {
    mockLogout.mockClear();
    mockHandle.mockClear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: JwtService, useValue: { getToken: () => null } },
        { provide: AuthService, useValue: { logout: mockLogout } },
        { provide: ErrorService, useValue: { handle: mockHandle } },
        LoadingService,
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => httpMock.verify());

  it('should add the ngrok-skip-browser-warning header to every request', () => {
    http.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('ngrok-skip-browser-warning')).toBe('true');
    req.flush({});
  });

  it('should NOT add an Authorization header when no token is present', () => {
    http.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should set isLoading to true while the request is in flight', () => {
    http.get(TEST_URL).subscribe();
    httpMock.expectOne(TEST_URL); // request pending – do not flush yet
    expect(loadingService.isLoading).toBe(true);
  });

  it('should set isLoading to false after a successful response', () => {
    http.get(TEST_URL).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    req.flush({});
    expect(loadingService.isLoading).toBe(false);
  });

  it('should call authService.logout on a 401 error', () => {
    http.get(TEST_URL).subscribe({ error: () => {} });
    const req = httpMock.expectOne(TEST_URL);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should call errorService.handle on non-401 errors', () => {
    http.get(TEST_URL).subscribe({ error: () => {} });
    const req = httpMock.expectOne(TEST_URL);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    expect(mockHandle).toHaveBeenCalledTimes(1);
  });

  it('should set isLoading to false even after an error', () => {
    http.get(TEST_URL).subscribe({ error: () => {} });
    const req = httpMock.expectOne(TEST_URL);
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    expect(loadingService.isLoading).toBe(false);
  });
});

describe('authInterceptor (with token)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: JwtService, useValue: { getToken: () => 'my-token' } },
        { provide: AuthService, useValue: { logout: vi.fn() } },
        { provide: ErrorService, useValue: { handle: vi.fn() } },
        LoadingService,
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should add an Authorization Bearer header when a token is present', () => {
    http.get(TEST_URL).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });
});
