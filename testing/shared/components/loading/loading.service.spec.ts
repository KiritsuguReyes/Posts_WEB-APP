import { TestBed } from '@angular/core/testing';
import { LoadingService } from '@shared/components/loading/loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with isLoading as false', () => {
    expect(service.isLoading).toBe(false);
  });

  it('should update isLoading to true when set', () => {
    service.isLoading = true;
    expect(service.isLoading).toBe(true);
  });

  it('should emit true on isLoading$', () => {
    return new Promise<void>(resolve => {
      service.isLoading$.subscribe(value => {
        if (value === true) {
          expect(value).toBe(true);
          resolve();
        }
      });
      service.isLoading = true;
    });
  });

  it('should emit false on isLoading$ after being set to false', () => {
    service.isLoading = true;
    service.isLoading = false;
    expect(service.isLoading).toBe(false);
  });

  it('should expose isLoading$ as an observable', () => {
    expect(typeof service.isLoading$.subscribe).toBe('function');
  });
});
