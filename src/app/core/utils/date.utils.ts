/**
 * Formats a date string as a readable absolute date with time.
 * e.g. "5 mar. 2026, 14:30"
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-HN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns a human-readable relative time string from a date string.
 * e.g. "hace 3 min", "hace 2 h", "hace 4 días", "5 mar. 2026, 14:30"
 */
export function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days} día${days > 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  return formatDate(dateStr);
}
