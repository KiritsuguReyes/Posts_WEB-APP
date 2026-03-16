import { Pipe, PipeTransform } from '@angular/core';

/**
 * Derives 1–2 letter initials from a name string.
 * Single word → first 2 chars. Multiple words → first + last initial.
 * Example: "María García" → "MG", "Ana" → "AN"
 */
@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(name: string): string {
    if (!name || typeof name !== 'string') return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
