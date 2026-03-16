import { Component, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AppHeaderComponent } from './layout/header/header.component';
import { AppFooterComponent } from './layout/footer/footer.component';
import { AppLoadingComponent } from './shared/components/loading/loading.component';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { ErrorService } from './core/services/error.service';
import { AuthService } from './core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AppHeaderComponent, AppFooterComponent, AppLoadingComponent, NgxSonnerToaster],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly errorService = inject(ErrorService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signal que rastrea la URL actual
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url),
      startWith(this.router.url)
    )
  );

  // Computed que determina si se debe mostrar el header
  readonly shouldShowHeader = computed(() => {
    const url = this.currentUrl();
    const isAuthenticated = this.authService.isLoggedIn();
    const isAuthRoute = url === '/login' || url === '/register';
    
    return isAuthenticated && !isAuthRoute;
  });

  ngOnInit(): void {
    this.errorService.registerToast((type, msg) => {
      if (type === 'error') toast.error(msg);
      else if (type === 'success') toast.success(msg);
      else toast(msg);
    });
  }
}
