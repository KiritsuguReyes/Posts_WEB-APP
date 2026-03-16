import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Post } from '../../../../core/models/post.model';
import { relativeDate } from '../../../../core/utils/date.utils';
import { AppAvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { AppConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AppTooltipDirective } from '../../../../shared/directives/tooltip.directive';
import { signal } from '@angular/core';

@Component({
  selector: 'app-post-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppAvatarComponent, AppButtonComponent, AppConfirmDialogComponent, AppTooltipDirective],
  template: `
    <article
      class="relative bg-surface rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-carbon-black-100 hover:shadow-[var(--shadow-hover)] hover:scale-[1.02] transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
      (click)="navigateToDetail($event)"
      role="article"
      [attr.aria-label]="post().title">

      <!-- Selection checkbox (own posts only) -->
      @if (selectable()) {
        <div
          class="absolute top-2 right-2 z-10"
          (click)="$event.stopPropagation()">
          <input
            type="checkbox"
            [checked]="selected()"
            (change)="selectionToggled.emit(post()._id)"
            class="w-4 h-4 cursor-pointer accent-hunter-green-600"
            aria-label="Seleccionar post" />
        </div>
      }

      <!-- Card body -->
      <div class="p-5 flex flex-col gap-3 flex-1">
        <!-- Author row -->
        <div class="flex items-center gap-2">
          <app-avatar [name]="post().author" size="sm" />
          <div class="min-w-0">
            <p class="text-xs font-medium text-carbon-black-700 truncate">{{ post().author }}</p>
            <p class="text-xs text-carbon-black-400">{{ relativeDate() }}</p>
          </div>
        </div>

        <!-- Title -->
        <h2
          class="text-base font-bold text-carbon-black-900 truncate leading-snug"
          [appTooltip]="post().title">{{ post().title }}</h2>

        <!-- Body snippet -->
        <p class="text-sm text-carbon-black-500 line-clamp-2 flex-1">{{ post().body }}</p>
      </div>

      <!-- Footer with actions -->
      @if (isOwner()) {
        <div class="px-5 pb-4 flex items-center gap-2 justify-end border-t border-carbon-black-100 pt-3"
             (click)="$event.stopPropagation()">
          <app-button variant="ghost" size="sm" (clicked)="editPost()">
            ✏️ Editar
          </app-button>
          <app-button variant="danger" size="sm" (clicked)="confirmDelete.set(true)">
            🗑️ Eliminar
          </app-button>
        </div>
      }
    </article>

    <!-- Confirm dialog -->
    <app-confirm-dialog
      title="¿Eliminar post?"
      message="Esta acción no se puede deshacer. El post y sus comentarios serán eliminados."
      [visible]="confirmDelete()"
      [loading]="deleting()"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="confirmDelete.set(false)" />
  `,
})
export class PostCardComponent {
  post = input.required<Post>();
  currentUserId = input<string | null>(null);
  deleting = input(false);
  selectable = input(false);
  selected = input(false);

  deleteRequested = output<string>();
  editRequested = output<string>();
  selectionToggled = output<string>();

  private readonly router = inject(Router);

  confirmDelete = signal(false);

  isOwner = computed(() => {
    const uid = this.currentUserId();
    const userId = this.post().userId;
    return !!(uid && userId && uid === userId);
  });

  relativeDate(): string {
    return relativeDate(this.post().createdAt);
  }

  navigateToDetail(event: MouseEvent): void {
    this.router.navigate(['/posts', this.post()._id]);
  }

  editPost(): void {
    this.editRequested.emit(this.post()._id);
  }

  onDeleteConfirmed(): void {
    this.deleteRequested.emit(this.post()._id);
    this.confirmDelete.set(false);
  }
}
