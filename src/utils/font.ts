// src/utils/font.ts

// Tiny clamp utility (handy for sizes if you need it elsewhere)
export const clamp = (min: number, val: number, max: number) =>
  Math.max(min, Math.min(val, max));

/**
 * pickFont
 * Returns a robust CSS font-family stack. If a custom brand family is passed,
 * it’ll be put first and quoted when needed.
 */
export const pickFont = (brandFamily?: string) => {
  // Add quotes if the name contains spaces and is not already quoted
  const maybeQuote = (name: string) =>
    /['",]/.test(name) ? name : /\s/.test(name) ? `"${name}"` : name;

  const baseStack =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  if (!brandFamily || !brandFamily.trim()) {
    return baseStack;
  }

  return `${maybeQuote(brandFamily)}, ${baseStack}`;
};
