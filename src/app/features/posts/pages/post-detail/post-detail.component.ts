import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, input, viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { Subject } from 'rxjs';
import { relativeDate, formatDate } from '@core/utils/date.utils';
import { PostsService } from '@features/posts/services/posts.service';
import { CommentsService } from '@features/posts/services/comments.service';
import { AuthService } from '@core/services/auth.service';
import { toast } from 'ngx-sonner';
import { Post } from '@core/models/post.model';
import { Comment } from '@core/models/comment.model';
import { AppAvatarComponent } from '@shared/components/avatar/avatar.component';
import { AppButtonComponent } from '@shared/components/button/button.component';
import { AppPaginationComponent } from '@shared/components/pagination/pagination.component';
import { AppConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { AppTooltipDirective } from '@shared/directives/tooltip.directive';
import { CommentFormComponent } from '@features/posts/components/comment-form/comment-form.component';
import { AppTextareaComponent } from '@shared/components/textarea/textarea.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; overflow-y: auto; flex: 1; min-height: 0; }`],
  imports: [
    AppAvatarComponent, AppButtonComponent, AppPaginationComponent,
    AppConfirmDialogComponent, AppTooltipDirective, CommentFormComponent,
    AppTextareaComponent, FormsModule
  ],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6">

      <!-- Back -->
      <button
        (click)="goBack()"
        class="flex items-center gap-1.5 text-sm text-carbon-black-500 hover:text-hunter-green-600 transition-colors mb-6 cursor-pointer">
        ← Volver
      </button>

      @if (loadingPost()) {
        <!-- Post skeleton -->
        <div class="bg-surface rounded-[var(--radius-card)] border border-carbon-black-100 p-6 animate-pulse mb-6">
          <div class="h-8 bg-carbon-black-200 rounded mb-4 w-3/4"></div>
          <div class="flex gap-2 mb-4">
            <div class="w-9 h-9 bg-carbon-black-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-3 bg-carbon-black-200 rounded mb-2 w-32"></div>
              <div class="h-3 bg-carbon-black-100 rounded w-24"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-4 bg-carbon-black-100 rounded"></div>
            <div class="h-4 bg-carbon-black-100 rounded"></div>
            <div class="h-4 bg-carbon-black-100 rounded w-3/4"></div>
          </div>
        </div>
      } @else if (post()) {
        <!-- Post card -->
        <div class="bg-surface rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-carbon-black-100 p-6 md:p-8 mb-6 animate-[slide-up_0.25s_ease-out]">

          <!-- Title -->
          <h1 class="text-2xl sm:text-3xl font-bold text-carbon-black-900 mb-4 leading-tight">{{ post()!.title }}</h1>

          <!-- Author + dates -->
          <div class="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-carbon-black-100">
            <app-avatar [name]="post()!.author" size="md" />
            <div>
              <p class="text-sm font-medium text-carbon-black-800">{{ post()!.author }}</p>
              <div class="flex flex-col sm:flex-row sm:gap-3 text-xs text-carbon-black-400">
                <span>Creado: {{ formatDate(post()!.createdAt) }}</span>
                @if (wasEdited()) {
                  <span class="text-carbon-black-500">Editado: {{ formatDate(post()!.updatedAt) }}</span>
                }
              </div>
            </div>

            <!-- Actions (owner only) -->
            @if (isPostOwner()) {
              <div class="ml-auto flex gap-2">
                <app-button variant="secondary" size="sm" (clicked)="editPost()">✏️ Editar</app-button>
                <app-button variant="danger" size="sm" (clicked)="confirmDeletePost.set(true)">🗑️ Eliminar</app-button>
              </div>
            }
          </div>

          <!-- Body -->
          <div class="text-base text-carbon-black-700 leading-relaxed whitespace-pre-wrap break-words min-h-8">{{ post()!.body }}</div>
        </div>
      }

      <!-- Comments section -->
      @if (post()) {
        <div class="bg-surface rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-carbon-black-100 p-6">

          <!-- Comments header -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 class="text-lg font-semibold text-carbon-black-900">
              💬 Comentarios <span class="text-carbon-black-400 font-normal">({{ total() }})</span>
            </h2>
            <div class="flex items-center gap-2">
              <label class="text-xs text-carbon-black-500">Por página:</label>
              <select
                [value]="commentsPageSize()"
                (change)="onCommentPageSizeChange($event)"
                class="text-xs border border-carbon-black-200 rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-hunter-green-500 cursor-pointer">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <!-- New comment form -->
          <app-comment-form
            #commentForm
            [authorName]="currentClaims()?.name ?? ''"
            [submitting]="submittingComment()"
            (submitted)="onCommentSubmit($any($event))" />

          <hr class="my-4 border-carbon-black-100">

          <!-- Comments list -->
          @if (loadingComments()) {
            <div class="space-y-4">
              @for (s of [1,2,3]; track s) {
                <div class="flex gap-3 animate-pulse">
                  <div class="w-9 h-9 bg-carbon-black-200 rounded-full shrink-0"></div>
                  <div class="flex-1">
                    <div class="h-3 bg-carbon-black-200 rounded mb-2 w-24"></div>
                    <div class="h-3 bg-carbon-black-100 rounded mb-1"></div>
                    <div class="h-3 bg-carbon-black-100 rounded w-1/2"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (comments().length === 0) {
            <p class="text-sm text-carbon-black-400 text-center py-6">Sin comentarios aún. ¡Sé el primero!</p>
          } @else {
            <div class="space-y-4">
              @for (comment of comments(); track comment._id) {
                <div class="flex gap-3 group">
                  <app-avatar [name]="comment.name" size="sm" />
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span class="text-sm font-semibold text-carbon-black-800">{{ comment.name }}</span>
                      <span class="text-xs text-carbon-black-400">{{ relativeDate(comment.createdAt) }}</span>
                      @if (wasCommentEdited(comment)) {
                        <span
                          class="text-xs text-carbon-black-400 cursor-help relative"
                          [appTooltip]="editedTooltip(comment)">
                          ✏️
                        </span>
                      }
                    </div>

                    <!-- Comment body or edit form -->
                    @if (editingCommentId() === comment._id) {
                      <div class="mt-1">
                        <app-textarea
                          [(ngModel)]="editingBody"
                          [rows]="2"
                          placeholder="Edita tu comentario..."
                          [maxLength]="2000" />
                        <div class="flex gap-2 mt-1">
                          <app-button variant="primary" size="sm" [loading]="updatingComment()" (clicked)="saveCommentEdit(comment._id)">Guardar</app-button>
                          <app-button variant="secondary" size="sm" (clicked)="cancelCommentEdit()">Cancelar</app-button>
                        </div>
                      </div>
                    } @else {
                      <p class="text-sm text-carbon-black-700 break-words">{{ comment.body }}</p>
                    }

                    <!-- Comment actions (owner) -->
                    @if (isCommentOwner(comment) && editingCommentId() !== comment._id) {
                      <div class="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          (click)="startEditComment(comment)"
                          class="text-xs text-hunter-green-600 hover:underline cursor-pointer">Editar</button>
                        <button
                          (click)="requestDeleteComment(comment._id)"
                          class="text-xs text-error hover:underline cursor-pointer">Eliminar</button>
                      </div>
                    }
                  </div>
                </div>

                @if (!$last) {
                  <hr class="border-carbon-black-100 ml-12">
                }
              }
            </div>
          }

          <!-- Comments pagination -->
          <div class="mt-4">
            <app-pagination
              [page]="commentsPage()"
              [pageSize]="commentsPageSize()"
              [total]="total()"
              itemLabel="comentarios"
              (pageChange)="onCommentPageChange($event)"
              (pageSizeChange)="onCommentPageSizeChange2($event)" />
          </div>
        </div>
      }
    </div>

    <!-- Delete post confirm -->
    <app-confirm-dialog
      title="¿Eliminar post?"
      message="Esta acción eliminará el post y todos sus comentarios permanentemente."
      [visible]="confirmDeletePost()"
      [loading]="deletingPost()"
      (confirmed)="deletePost()"
      (cancelled)="confirmDeletePost.set(false)" />

    <!-- Delete comment confirm -->
    <app-confirm-dialog
      title="¿Eliminar comentario?"
      message="Esta acción no se puede deshacer."
      [visible]="confirmDeleteComment()"
      [loading]="deletingComment()"
      (confirmed)="deleteComment()"
      (cancelled)="confirmDeleteComment.set(false)" />
  `,
})
export class PostDetailComponent implements OnInit {
  id = input.required<string>();

  private readonly postsService = inject(PostsService);
  private readonly commentsService = inject(CommentsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Template reference al formulario de comentarios
  commentForm = viewChild<CommentFormComponent>('commentForm');

  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  commentsPage = signal(1);
  commentsPageSize = signal(10);
  total = signal(0);

  loadingPost = signal(true);
  loadingComments = signal(false);
  submittingComment = signal(false);
  deletingPost = signal(false);
  deletingComment = signal(false);
  updatingComment = signal(false);
  confirmDeletePost = signal(false);
  confirmDeleteComment = signal(false);
  deletingCommentId = signal<string | null>(null);
  editingCommentId = signal<string | null>(null);
  editingBody = '';

  currentClaims = computed(() => this.authService.getCurrentClaims());
  wasEdited = computed(() => {
    const p = this.post();
    return p ? new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime() > 1000 : false;
  });
  isPostOwner = computed(() => {
    const p = this.post();
    const uid = this.currentClaims()?.sub;
    return !!(p && uid && p.userId && uid === p.userId);
  });

  private readonly reloadComments$ = new Subject<void>();

  ngOnInit(): void {
    this.reloadComments$.pipe(
      switchMap(() => {
        this.loadingComments.set(true);
        return this.commentsService.getByPost({
          postId: this.id(),
          page: this.commentsPage(),
          limit: this.commentsPageSize(),
        }).pipe(
          tap({
            next: res => {
              this.comments.set(res.data.data);
              this.total.set(res.data.pagination.total);
              this.loadingComments.set(false);
            },
            error: () => { this.loadingComments.set(false); }
          })
        );
      })
    ).subscribe();

    this.loadPost();
    this.reloadComments$.next();
  }

  private loadPost(): void {
    this.loadingPost.set(true);
    this.postsService.getById(this.id()).subscribe({
      next: res => { this.post.set(res.data); this.loadingPost.set(false); },
      error: () => { this.loadingPost.set(false); this.router.navigate(['/posts']); }
    });
  }

  isCommentOwner(comment: Comment): boolean {
    const uid = this.currentClaims()?.sub;
    return !!(uid && comment.userId && uid === comment.userId);
  }

  wasCommentEdited(comment: Comment): boolean {
    return Math.abs(new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime()) > 1000;
  }

  editedTooltip(comment: Comment): string {
    return `Editado el ${this.formatDate(comment.updatedAt)}`;
  }

  formatDate(dateStr: string): string {
    return formatDate(dateStr);
  }

  relativeDate(dateStr: string): string {
    return relativeDate(dateStr);
  }

  onCommentSubmit(body: string): void {
    const claims = this.currentClaims();
    if (!claims) return;
    this.submittingComment.set(true);
    this.commentsService.create({
      postId: this.id(),
      body,
    }).subscribe({
      next: () => {
        this.submittingComment.set(false);
        this.commentsPage.set(1);
        this.reloadComments$.next();
        toast.success('Comentario enviado');
        // Solo resetear el formulario cuando hay éxito
        this.commentForm()?.reset();
      },
      error: () => { 
        this.submittingComment.set(false);
        // NO resetear el formulario cuando hay error
      }
    });
  }

  onCommentPageChange(p: number): void {
    this.commentsPage.set(p);
    this.reloadComments$.next();
  }

  onCommentPageSizeChange(event: Event): void {
    this.commentsPageSize.set(Number((event.target as HTMLSelectElement).value));
    this.commentsPage.set(1);
    this.reloadComments$.next();
  }

  onCommentPageSizeChange2(size: number): void {
    this.commentsPageSize.set(size);
    this.commentsPage.set(1);
    this.reloadComments$.next();
  }

  startEditComment(comment: Comment): void {
    this.editingCommentId.set(comment._id);
    this.editingBody = comment.body;
  }

  cancelCommentEdit(): void {
    this.editingCommentId.set(null);
    this.editingBody = '';
  }

  saveCommentEdit(id: string): void {
    if (!this.editingBody.trim()) return;
    this.updatingComment.set(true);
    this.commentsService.update(id, this.editingBody).subscribe({
      next: () => {
        this.updatingComment.set(false);
        this.cancelCommentEdit();
        this.reloadComments$.next();
        toast.success('Comentario actualizado');
      },
      error: () => { this.updatingComment.set(false); }
    });
  }

  requestDeleteComment(id: string): void {
    this.deletingCommentId.set(id);
    this.confirmDeleteComment.set(true);
  }

  deleteComment(): void {
    const id = this.deletingCommentId();
    if (!id) return;
    this.deletingComment.set(true);
    this.commentsService.delete(id).subscribe({
      next: () => {
        this.deletingComment.set(false);
        this.confirmDeleteComment.set(false);
        this.deletingCommentId.set(null);
        this.reloadComments$.next();
        toast.success('Comentario eliminado');
      },
      error: () => { this.deletingComment.set(false); }
    });
  }

  editPost(): void { this.router.navigate(['/posts', this.id(), 'edit']); }

  deletePost(): void {
    this.deletingPost.set(true);
    this.postsService.delete(this.id()).subscribe({
      next: () => {
        toast.success('Post eliminado');
        this.router.navigate(['/posts']);
      },
      error: () => { this.deletingPost.set(false); }
    });
  }

  goBack(): void { this.router.navigate(['/posts']); }
}
