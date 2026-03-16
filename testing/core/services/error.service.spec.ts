import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '@core/services/error.service';

function makeError(status: number): HttpErrorResponse {
  return new HttpErrorResponse({ url: '/test', status, statusText: 'Error', error: {} });
}

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorService);
    // Suppress console.error noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register and invoke the toast callback on error', () => {
    const cb = vi.fn();
    service.registerToast(cb);
    service.handle(makeError(500));
    expect(cb).toHaveBeenCalledWith('error', expect.any(String));
  });

  it('should NOT throw when no toast callback is registered', () => {
    expect(() => service.handle(makeError(500))).not.toThrow();
  });

  it.each([
    [400, 'Algo salió mal'],
    [401, 'Sesión expirada, vuelve a ingresar'],
    [403, 'No tienes permiso para esta acción'],
    [404, 'No encontrado'],
    [409, 'El recurso ya existe'],
    [500, 'Error del servidor, intenta más tarde'],
    [503, 'Error inesperado'],
  ])('should return the correct message for status %d', (status, expected) => {
    service.registerToast(vi.fn());
    const msg = service.handle(makeError(status));
    expect(msg).toBe(expected);
  });

  it('should return the mapped message from handle()', () => {
    service.registerToast(vi.fn());
    const msg = service.handle(makeError(404));
    expect(msg).toBe('No encontrado');
  });
});
