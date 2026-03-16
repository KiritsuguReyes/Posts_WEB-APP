import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppLoadingComponent } from '../../../../src/app/shared/components/loading/loading.component';
import { LoadingService } from '../../../../src/app/shared/components/loading/loading.service';

describe('AppLoadingComponent', () => {
  let fixture: ComponentFixture<AppLoadingComponent>;
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLoadingComponent);
    loadingService = TestBed.inject(LoadingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render the overlay when not loading', () => {
    expect(fixture.nativeElement.querySelector('.fixed')).toBeNull();
  });

  it('should render the overlay when loading starts', async () => {
    loadingService.isLoading = true;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.fixed')).toBeTruthy();
  });

  it('should display the loading text when loading', async () => {
    loadingService.isLoading = true;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cargando...');
  });

  it('should hide the overlay when loading stops', async () => {
    loadingService.isLoading = true;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    loadingService.isLoading = false;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.fixed')).toBeNull();
  });
});
