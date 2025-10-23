const HSLA_REGEX = /(hsla?)\(\s*([^)]+)\s*\)/i;
const RGBA_REGEX = /(rgba?)\(\s*([^)]+)\s*\)/i;

/**
 * Returns the provided color string with the supplied alpha value.
 * Works for hsl(a) and rgb(a) inputs; other color formats are returned unchanged.
 */
export function withAlpha(color: string, alpha: number): string {
  const normalizedAlpha = Math.min(1, Math.max(0, alpha));

  if (HSLA_REGEX.test(color)) {
    return color.replace(HSLA_REGEX, (_, fn: string, values: string) => {
      const parts = values.split(',').map((value) => value.trim());
      if (fn.toLowerCase() === 'hsl') {
        return `hsla(${parts.join(', ')}, ${normalizedAlpha})`;
      }
      parts[parts.length - 1] = `${normalizedAlpha}`;
      return `${fn.toLowerCase()}(${parts.join(', ')})`;
    });
  }

  if (RGBA_REGEX.test(color)) {
    return color.replace(RGBA_REGEX, (_, fn: string, values: string) => {
      const parts = values.split(',').map((value) => value.trim());
      if (fn.toLowerCase() === 'rgb') {
        return `rgba(${parts.join(', ')}, ${normalizedAlpha})`;
      }
      parts[parts.length - 1] = `${normalizedAlpha}`;
      return `${fn.toLowerCase()}(${parts.join(', ')})`;
    });
  }

  return color;
}

