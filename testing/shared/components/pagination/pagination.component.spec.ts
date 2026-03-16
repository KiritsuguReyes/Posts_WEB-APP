import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppPaginationComponent } from '../../../../src/app/shared/components/pagination/pagination.component';

describe('AppPaginationComponent', () => {
  let fixture: ComponentFixture<AppPaginationComponent>;
  let component: AppPaginationComponent;

  function setup(page: number, pageSize: number, total: number) {
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('pageSize', pageSize);
    fixture.componentRef.setInput('total', total);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppPaginationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    setup(1, 10, 0);
    expect(component).toBeTruthy();
  });

  it('should not render anything when total is 0', () => {
    setup(1, 10, 0);
    const el = fixture.nativeElement as HTMLElement;
    // The wrapping @if(total() > 0) should render nothing
    expect(el.querySelector('.flex')).toBeNull();
  });

  it('should render pagination controls when total > 0', () => {
    setup(1, 10, 50);
    expect(fixture.nativeElement.querySelector('.flex')).toBeTruthy();
  });

  it('should compute totalPages correctly', () => {
    setup(1, 10, 55);
    expect(component.totalPages()).toBe(6);
  });

  it('should compute from correctly on first page', () => {
    setup(1, 10, 55);
    expect(component.from()).toBe(1);
  });

  it('should compute to correctly on first page', () => {
    setup(1, 10, 55);
    expect(component.to()).toBe(10);
  });

  it('should compute from correctly on last page', () => {
    setup(6, 10, 55);
    expect(component.from()).toBe(51);
  });

  it('should compute to correctly on last page', () => {
    setup(6, 10, 55);
    expect(component.to()).toBe(55);
  });

  it('should show all page numbers when total pages <= 7', () => {
    setup(1, 10, 50);
    expect(component.pages()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should include ellipsis when there are more than 7 pages', () => {
    setup(1, 10, 100);
    expect(component.pages()).toContain(-1);
  });

  it('should emit pageChange with decremented page when previous is clicked', () => {
    setup(3, 10, 50);
    const spy = vi.fn();
    component.pageChange.subscribe(spy);

    const prevBtn = fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement;
    prevBtn.click();

    expect(spy).toHaveBeenCalledWith(2);
  });

  it('should emit pageChange with incremented page when next is clicked', () => {
    setup(1, 10, 50);
    const spy = vi.fn();
    component.pageChange.subscribe(spy);

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const nextBtn = buttons[buttons.length - 1];
    nextBtn.click();

    expect(spy).toHaveBeenCalledWith(2);
  });

  it('should disable the previous button on the first page', () => {
    setup(1, 10, 50);
    const prevBtn = fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
  });

  it('should disable the next button on the last page', () => {
    setup(5, 10, 50);
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const nextBtn = buttons[buttons.length - 1];
    expect(nextBtn.disabled).toBe(true);
  });

  it('should emit pageSizeChange when the page size select changes', () => {
    setup(1, 10, 100);
    const spy = vi.fn();
    component.pageSizeChange.subscribe(spy);

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '25';
    select.dispatchEvent(new Event('change'));

    expect(spy).toHaveBeenCalledWith(25);
  });

  it('should display page size options', () => {
    setup(1, 10, 100);
    const options = fixture.nativeElement.querySelectorAll('select option') as NodeListOf<HTMLOptionElement>;
    expect(options.length).toBe(4);
    expect(options[0].value).toBe('10');
    expect(options[1].value).toBe('25');
  });
});
