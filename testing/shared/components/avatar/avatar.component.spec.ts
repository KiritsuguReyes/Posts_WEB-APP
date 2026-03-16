import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppAvatarComponent, AvatarSize } from '@shared/components/avatar/avatar.component';

describe('AppAvatarComponent', () => {
  let fixture: ComponentFixture<AppAvatarComponent>;
  let component: AppAvatarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppAvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppAvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'John Doe');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the initials in the template', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('JD');
  });

  it('should set aria-label to the name', () => {
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(div.getAttribute('aria-label')).toBe('John Doe');
  });

  it('should apply md size classes by default', () => {
    expect(component.avatarClasses()).toContain('w-9 h-9');
  });

  it('should apply sm size classes when size is sm', () => {
    fixture.componentRef.setInput('size', 'sm' as AvatarSize);
    fixture.detectChanges();
    expect(component.avatarClasses()).toContain('w-7 h-7');
  });

  it('should apply lg size classes when size is lg', () => {
    fixture.componentRef.setInput('size', 'lg' as AvatarSize);
    fixture.detectChanges();
    expect(component.avatarClasses()).toContain('w-12 h-12');
  });

  it('should return the same color class for the same name', () => {
    const color1 = component.colorClass();
    fixture.componentRef.setInput('name', 'John Doe');
    fixture.detectChanges();
    expect(component.colorClass()).toBe(color1);
  });

  it('should return a color from the predefined palette', () => {
    const colors = [
      'bg-hunter-green-600',
      'bg-black-forest-600',
      'bg-fern-600',
      'bg-aquamarine-700',
      'bg-carbon-black-600',
    ];
    expect(colors).toContain(component.colorClass());
  });
});
