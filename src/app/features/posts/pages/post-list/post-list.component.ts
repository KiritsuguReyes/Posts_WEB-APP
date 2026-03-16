import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { PostsService } from '../../services/posts.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AppToastService } from '../../../../shared/components/toast-notification/toast.service';
import { Post } from '../../../../core/models/post.model';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { AppPaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { AppEmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { AppInputComponent } from '../../../../shared/components/input/input.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PostCardComponent, AppPaginationComponent, AppEmptyStateComponent,
    AppButtonComponent, AppInputComponent, FormsModule
  ],
  styles: [`:host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }`],
  template: `
    <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <div class="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 flex flex-col flex-1 min-h-0 overflow-hidden">

      <!-- Top bar: Title + New Post -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-carbon-black-900">Posts</h1>
          <p class="text-sm text-carbon-black-500 mt-0.5">Explora y comparte ideas</p>
        </div>
        <app-button variant="primary" size="md" (clicked)="newPost()">
          ✚ Nuevo post
        </app-button>
      </div>

      <!-- Search + Filter row -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <!-- Search input -->
        <div class="flex-1">
          <app-input
            type="search"
            prefix="🔍"
            [(ngModel)]="searchInput"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Buscar posts..." />
        </div>
        <!-- Filter select -->
        <select
          [value]="filterMode()"
          (change)="onFilterChange($event)"
          class="px-3 py-2 text-sm border border-carbon-black-200 rounded-[var(--radius-input)] bg-surface focus:outline-none focus:ring-2 focus:ring-hunter-green-500 cursor-pointer">
          <option value="all">Todos</option>
          <option value="own">Propios</option>
        </select>
      </div>

      <!-- Bulk selection bar -->
      @if (selectedIds().size > 0) {
        <div class="flex items-center gap-3 bg-hunter-green-50 border border-hunter-green-200 rounded-lg px-4 py-2 mb-3">
          <span class="text-sm text-hunter-green-700 font-medium">{{ selectedIds().size }} seleccionado(s)</span>
          <button
            (click)="clearSelection()"
            class="text-xs text-hunter-green-600 underline hover:text-hunter-green-800 cursor-pointer">
            Deseleccionar todo
          </button>
          <div class="ml-auto">
            <app-button variant="danger" size="sm" (clicked)="bulkDeleteVisible.set(true)">
              🗑️ Eliminar seleccionados
            </app-button>
          </div>
        </div>
      }

      <!-- Grid or states: scrollable -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pr-1">
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-6">
          @for (s of skeletons; track s) {
            <div class="bg-surface rounded-[var(--radius-card)] border border-carbon-black-100 p-5 animate-pulse">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 bg-carbon-black-200 rounded-full"></div>
                <div class="flex-1 h-3 bg-carbon-black-200 rounded"></div>
              </div>
              <div class="h-4 bg-carbon-black-200 rounded mb-2"></div>
              <div class="h-3 bg-carbon-black-100 rounded mb-1"></div>
              <div class="h-3 bg-carbon-black-100 rounded w-2/3"></div>
            </div>
          }
        </div>
      } @else if (posts().length === 0) {
        <div class="my-10">
          <app-empty-state
            icon="📝"
            title="Sin posts todavía"
            description="Sé el primero en compartir algo">
            <div class="mt-4">
              <app-button variant="primary" (clicked)="newPost()">Crear primer post</app-button>
            </div>
          </app-empty-state>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-4">
          @for (post of posts(); track post._id) {
            <app-post-card
              [post]="post"
              [currentUserId]="currentUserId()"
              [deleting]="deletingId() === post._id"
              [selectable]="isOwner(post)"
              [selected]="selectedIds().has(post._id)"
              (selectionToggled)="toggleSelection($event)"
              (deleteRequested)="deletePost($event)"
              (editRequested)="editPost($event)" />
          }
        </div>
      }

      </div>

      <!-- Pagination bottom -->
      <app-pagination
        [page]="page()"
        [pageSize]="pageSize()"
        [total]="total()"
        itemLabel="posts"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange2($event)" />
    </div>
    </div>

    <!-- Bulk delete modal -->
    @if (bulkDeleteVisible()) {
      <div
        class="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50"
        (click)="bulkDeleteVisible.set(false)">
        <div
          class="bg-surface rounded-[var(--radius-card)] shadow-xl max-w-md w-full p-6"
          (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-carbon-black-900 mb-1">
            ¿Eliminar {{ selectedIds().size }} {{ selectedIds().size === 1 ? 'post' : 'posts' }}?
          </h3>
          <p class="text-sm text-carbon-black-500 mb-3">Esta acción no se puede deshacer. Se eliminarán:</p>
          <ul class="max-h-48 overflow-y-auto mb-5 space-y-1 border border-carbon-black-100 rounded-lg p-3">
            @for (post of selectedPosts(); track post._id) {
              <li class="text-sm text-carbon-black-700 truncate">• {{ post.title }}</li>
            }
          </ul>
          <div class="flex gap-3 justify-end">
            <app-button variant="secondary" (clicked)="bulkDeleteVisible.set(false)">Cancelar</app-button>
            <app-button variant="danger" [loading]="bulkDeleting()" (clicked)="confirmBulkDelete()">
              Eliminar todos
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PostListComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(AppToastService);

  posts = signal<Post[]>([]);
  search = signal('');
  page = signal(1);
  pageSize = signal(10);
  total = signal(0);
  loading = signal(false);
  deletingId = signal<string | null>(null);
  filterMode = signal<'all' | 'own'>('all');
  selectedIds = signal<Set<string>>(new Set());
  bulkDeleteVisible = signal(false);
  bulkDeleting = signal(false);
  searchInput = '';
  skeletons = Array(8).fill(0).map((_, i) => i);

  currentUserId = computed(() => this.authService.getCurrentClaims()?.sub ?? null);
  selectedPosts = computed(() => this.posts().filter(p => this.selectedIds().has(p._id)));

  private readonly search$ = new Subject<string>();

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => { this.page.set(1); }),
      switchMap(() => this.loadPosts$())
    ).subscribe();

    this.loadPosts();
  }

  private loadPosts$() {
    this.loading.set(true);
    const userId = this.filterMode() === 'own' ? (this.currentUserId() ?? undefined) : undefined;
    return this.postsService.getAll({
      page: this.page(),
      limit: this.pageSize(),
      search: this.search(),
      userId,
    }).pipe(
      tap({
        next: res => {
          this.posts.set(res.data.data ?? []);
          this.total.set(res.data.pagination.total ?? 0);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); }
      })
    );
  }

  private loadPosts(): void {
    this.loadPosts$().subscribe();
  }

  isOwner(post: Post): boolean {
    const uid = this.currentUserId();
    return !!(uid && post.userId && uid === post.userId);
  }

  onSearchChange(val: string): void {
    this.search.set(val);
    this.search$.next(val);
  }

  onFilterChange(event: Event): void {
    const mode = (event.target as HTMLSelectElement).value as 'all' | 'own';
    this.filterMode.set(mode);
    this.page.set(1);
    this.clearSelection();
    this.loadPosts();
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.clearSelection();
    this.loadPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPageSizeChange(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(1);
    this.loadPosts();
  }

  onPageSizeChange2(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.loadPosts();
  }

  toggleSelection(id: string): void {
    this.selectedIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  confirmBulkDelete(): void {
    this.bulkDeleting.set(true);
    const ids = Array.from(this.selectedIds());
    this.postsService.deleteBulk(ids).subscribe({
      next: (res) => {
        const count = res.data?.deletedCount ?? ids.length;
        this.toastService.success(`${count} ${count === 1 ? 'post eliminado' : 'posts eliminados'}`);
        this.bulkDeleting.set(false);
        this.bulkDeleteVisible.set(false);
        this.clearSelection();
        this.loadPosts();
      },
      error: () => { this.bulkDeleting.set(false); }
    });
  }

  newPost(): void { this.router.navigate(['/posts/new']); }
  editPost(id: string): void { this.router.navigate(['/posts', id, 'edit']); }

  deletePost(id: string): void {
    this.deletingId.set(id);
    this.postsService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Post eliminado');
        this.deletingId.set(null);
        this.loadPosts();
      },
      error: () => { this.deletingId.set(null); }
    });
  }
}
