import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppHeaderComponent } from '@layout/header/header.component';
import { AuthService } from '@core/services/auth.service';
import { JwtClaims } from '@core/models/jwt-claims.model';

const fakeClaims: JwtClaims = {
  sub: '1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  iat: 0,
  exp: 9999999999,
};

describe('AppHeaderComponent — unauthenticated', () => {
  let fixture: ComponentFixture<AppHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { getCurrentClaims: () => null, logout: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a <header> element', () => {
    expect(fixture.nativeElement.querySelector('header')).toBeTruthy();
  });

  it('should display the brand name', () => {
    expect(fixture.nativeElement.textContent).toContain('Posts System');
  });

  it('should not render user info when there are no claims', () => {
    expect(fixture.nativeElement.querySelector('app-avatar')).toBeNull();
  });

  it('should not render a logout button when unauthenticated', () => {
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});

describe('AppHeaderComponent — authenticated', () => {
  let fixture: ComponentFixture<AppHeaderComponent>;
  const mockLogout = vi.fn();

  beforeEach(async () => {
    mockLogout.mockClear();

    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { getCurrentClaims: () => fakeClaims, logout: mockLogout },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    fixture.detectChanges();
  });

  it('should display the user name', () => {
    expect(fixture.nativeElement.textContent).toContain('Jane Doe');
  });

  it('should render a logout button', () => {
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('should call authService.logout when the logout button is clicked', () => {
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
