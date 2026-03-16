import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg';

const COLORS = [
  'bg-hunter-green-600',
  'bg-black-forest-600',
  'bg-fern-600',
  'bg-aquamarine-700',
  'bg-carbon-black-600',
];

@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="avatarClasses()"
      [attr.aria-label]="name()"
      role="img">
      {{ initials() }}
    </div>
  `,
})
export class AppAvatarComponent {
  name = input.required<string>();
  size = input<AvatarSize>('md');

  initials = computed((): string => {
    const name = this.name();
    if (!name || typeof name !== 'string') return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  colorClass = computed((): string => {
    const name = this.name();
    if (!name || typeof name !== 'string') return COLORS[0];
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
    return COLORS[Math.abs(hash) % COLORS.length];
  });

  avatarClasses = computed((): string => {
    const sizes: Record<AvatarSize, string> = {
      sm: 'w-7 h-7 text-xs',
      md: 'w-9 h-9 text-sm',
      lg: 'w-12 h-12 text-base',
    };
    return `${sizes[this.size()]} ${this.colorClass()} rounded-full flex items-center justify-center text-white font-semibold select-none shrink-0`;
  });
}
