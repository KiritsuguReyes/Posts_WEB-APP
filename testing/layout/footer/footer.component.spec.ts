import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppFooterComponent } from '../../../src/app/layout/footer/footer.component';

describe('AppFooterComponent', () => {
  let fixture: ComponentFixture<AppFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFooterComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a <footer> element', () => {
    expect(fixture.nativeElement.querySelector('footer')).toBeTruthy();
  });

  it('should display the author name', () => {
    expect(fixture.nativeElement.textContent).toContain('Alvaro Javier Reyes Maradiaga');
  });

  it('should display the brand name', () => {
    expect(fixture.nativeElement.textContent).toContain('Albatros');
  });
});
