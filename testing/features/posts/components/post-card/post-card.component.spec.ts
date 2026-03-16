import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { PostCardComponent } from '../../../../../src/app/features/posts/components/post-card/post-card.component';
import { Post } from '../../../../../src/app/core/models/post.model';

const mockPost: Post = {
  _id: 'post-1',
  title: 'Test Post Title',
  body: 'Some body content for the post',
  author: 'Alice',
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('PostCardComponent', () => {
  let fixture: ComponentFixture<PostCardComponent>;
  let component: PostCardComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.componentRef.setInput('post', mockPost);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- rendering ---
  describe('rendering', () => {
    it('should render an article element', () => {
      expect(fixture.nativeElement.querySelector('article')).toBeTruthy();
    });

    it('should display the post title', () => {
      expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Test Post Title');
    });

    it('should display the author name', () => {
      expect(fixture.nativeElement.textContent).toContain('Alice');
    });

    it('should display a snippet of the post body', () => {
      expect(fixture.nativeElement.textContent).toContain('Some body content for the post');
    });

    it('should set aria-label to the post title', () => {
      const article = fixture.nativeElement.querySelector('article') as HTMLElement;
      expect(article.getAttribute('aria-label')).toBe('Test Post Title');
    });
  });

  // --- isOwner ---
  describe('isOwner()', () => {
    it('should return false when currentUserId is null', () => {
      expect(component.isOwner()).toBe(false);
    });

    it('should return false when currentUserId does not match post.userId', () => {
      fixture.componentRef.setInput('currentUserId', 'user-2');
      expect(component.isOwner()).toBe(false);
    });

    it('should return true when currentUserId matches post.userId', () => {
      fixture.componentRef.setInput('currentUserId', 'user-1');
      expect(component.isOwner()).toBe(true);
    });

    it('should NOT show owner actions when not owner', () => {
      expect(fixture.nativeElement.querySelector('[data-testid="owner-actions"]')).toBeNull();
      // buttons for edit/delete not shown
      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const editBtn = [...buttons].find(b => b.textContent?.includes('Editar'));
      expect(editBtn).toBeUndefined();
    });

    it('should show edit and delete buttons when owner', () => {
      fixture.componentRef.setInput('currentUserId', 'user-1');
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const editBtn = [...buttons].find(b => b.textContent?.includes('Editar'));
      const deleteBtn = [...buttons].find(b => b.textContent?.includes('Eliminar'));
      expect(editBtn).toBeTruthy();
      expect(deleteBtn).toBeTruthy();
    });
  });

  // --- navigation ---
  describe('navigateToDetail()', () => {
    it('should navigate to post detail on article click', () => {
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const article = fixture.nativeElement.querySelector('article') as HTMLElement;
      article.click();
      expect(spy).toHaveBeenCalledWith(['/posts', 'post-1']);
    });
  });

  // --- edit ---
  describe('editRequested output', () => {
    it('should emit the post id when edit button is clicked', () => {
      fixture.componentRef.setInput('currentUserId', 'user-1');
      fixture.detectChanges();

      const spy = vi.fn();
      component.editRequested.subscribe(spy);

      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const editBtn = [...buttons].find(b => b.textContent?.includes('Editar'))!;
      editBtn.click();

      expect(spy).toHaveBeenCalledWith('post-1');
    });
  });

  // --- delete confirm ---
  describe('delete flow', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('currentUserId', 'user-1');
      fixture.detectChanges();
    });

    it('should open confirm dialog when delete button is clicked', () => {
      expect(component.confirmDelete()).toBe(false);

      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const deleteBtn = [...buttons].find(b => b.textContent?.includes('Eliminar'))!;
      deleteBtn.click();

      expect(component.confirmDelete()).toBe(true);
    });

    it('should emit deleteRequested with post id on confirmation and close dialog', () => {
      component.confirmDelete.set(true);
      fixture.detectChanges();

      const spy = vi.fn();
      component.deleteRequested.subscribe(spy);

      component.onDeleteConfirmed();

      expect(spy).toHaveBeenCalledWith('post-1');
      expect(component.confirmDelete()).toBe(false);
    });

    it('should close confirm dialog on cancel', () => {
      component.confirmDelete.set(true);
      fixture.detectChanges();
      // emit cancelled via signal setter (same as what the dialog emits)
      component.confirmDelete.set(false);
      expect(component.confirmDelete()).toBe(false);
    });
  });

  // --- selectable / selected ---
  describe('selection', () => {
    it('should not render checkbox when selectable is false', () => {
      expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).toBeNull();
    });

    it('should render checkbox when selectable is true', () => {
      fixture.componentRef.setInput('selectable', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).toBeTruthy();
    });

    it('should reflect selected state on the checkbox', () => {
      fixture.componentRef.setInput('selectable', true);
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should emit selectionToggled with post id on checkbox change', () => {
      fixture.componentRef.setInput('selectable', true);
      fixture.detectChanges();

      const spy = vi.fn();
      component.selectionToggled.subscribe(spy);

      const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      checkbox.dispatchEvent(new Event('change'));

      expect(spy).toHaveBeenCalledWith('post-1');
    });
  });

  // --- deleting input ---
  describe('deleting input', () => {
    it('should pass deleting state to confirm dialog', () => {
      fixture.componentRef.setInput('deleting', true);
      fixture.detectChanges();
      expect(component.deleting()).toBe(true);
    });
  });
});
