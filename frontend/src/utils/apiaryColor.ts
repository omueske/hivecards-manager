const palette = [
  '#EF5350', // red
  '#AB47BC', // purple
  '#5C6BC0', // indigo
  '#29B6F6', // light blue
  '#26A69A', // teal
  '#66BB6A', // green
  '#FFCA28', // amber
  '#FFA726', // orange
];

/**
 * Returns the display color for an apiary.
 * Uses stored color if present, otherwise derives a stable fallback from the ID.
 */
export function apiaryColor(id: string | undefined, storedColor?: string): string {
  if (storedColor) return storedColor;
  if (!id) return '#B0BEC5';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return palette[Math.abs(hash) % palette.length];
}
