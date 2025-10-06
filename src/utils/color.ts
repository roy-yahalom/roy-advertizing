// src/utils/color.ts

// Basic color utils + WCAG contrast helpers

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  const v = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const num = parseInt(v, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

const srgbToLin = (c: number) => {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
};

export const luminance = (hex: string) => {
  const {r, g, b} = hexToRgb(hex);
  const R = srgbToLin(r), G = srgbToLin(g), B = srgbToLin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

export const contrastRatio = (fg: string, bg: string) => {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Pick between given color and a fallback to ensure contrast
export const ensureReadable = (wanted: string, bg: string, min: number) => {
  if (contrastRatio(wanted, bg) >= min) return wanted;
  // fallback: choose black/white based on bg luminance
  return luminance(bg) > 0.5 ? '#000000' : '#FFFFFF';
};

// For text against a solid background color
export const readableTextOn = (bg: string) => {
  return luminance(bg) > 0.5 ? '#000000' : '#FFFFFF';
};
