import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppEmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

describe('AppEmptyStateComponent', () => {
  let fixture: ComponentFixture<AppEmptyStateComponent>;
  let component: AppEmptyStateComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppEmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the default icon', () => {
    expect(fixture.nativeElement.textContent).toContain('📭');
  });

  it('should display the default title', () => {
    expect(fixture.nativeElement.textContent).toContain('Sin resultados');
  });

  it('should not render a description paragraph when description is empty', () => {
    const paragraphs = fixture.nativeElement.querySelectorAll('p') as NodeListOf<HTMLParagraphElement>;
    expect(paragraphs.length).toBe(0);
  });

  it('should render a description paragraph when description is provided', () => {
    fixture.componentRef.setInput('description', 'Nothing to show here.');
    fixture.detectChanges();
    const para = fixture.nativeElement.querySelector('p') as HTMLParagraphElement;
    expect(para.textContent).toContain('Nothing to show here.');
  });

  it('should display a custom icon', () => {
    fixture.componentRef.setInput('icon', '🔍');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('🔍');
  });

  it('should display a custom title', () => {
    fixture.componentRef.setInput('title', 'No posts found');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h3').textContent).toContain('No posts found');
  });
});
