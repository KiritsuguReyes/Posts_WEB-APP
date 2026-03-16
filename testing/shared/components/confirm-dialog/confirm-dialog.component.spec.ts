import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppConfirmDialogComponent } from '../../../../src/app/shared/components/confirm-dialog/confirm-dialog.component';

describe('AppConfirmDialogComponent', () => {
  let fixture: ComponentFixture<AppConfirmDialogComponent>;
  let component: AppConfirmDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render the dialog when visible is false', () => {
    expect(fixture.nativeElement.querySelector('.fixed')).toBeNull();
  });

  it('should render the dialog when visible is true', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.fixed')).toBeTruthy();
  });

  it('should display the default title', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h3').textContent).toContain('¿Estás seguro?');
  });

  it('should display a custom title', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('title', 'Custom Title');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h3').textContent).toContain('Custom Title');
  });

  it('should display the default message', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p').textContent).toContain(
      'Esta acción no se puede deshacer.'
    );
  });

  it('should display the default confirm label', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const confirmBtn = [...buttons].find(b => b.textContent?.trim() === 'Eliminar');
    expect(confirmBtn).toBeTruthy();
  });

  it('should emit confirmed when the confirm button is clicked', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.confirmed.subscribe(spy);

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const confirmBtn = [...buttons].find(b => b.textContent?.trim() === 'Eliminar')!;
    confirmBtn.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit cancelled when the cancel button is clicked', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.cancelled.subscribe(spy);

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const cancelBtn = [...buttons].find(b => b.textContent?.trim() === 'Cancelar')!;
    cancelBtn.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit cancelled when the backdrop is clicked', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.cancelled.subscribe(spy);

    const backdrop = fixture.nativeElement.querySelector('.fixed') as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
