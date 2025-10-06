// src/utils/patterns.ts

/**
 * Lightweight CSS patterns. No images needed.
 * Use with an absolutely-positioned overlay.
 */

type Pat = {
  type: 'dots' | 'grid' | 'none';
  color?: string;
  opacity?: number; // 0..1
  size?: number;    // px spacing
};

export const patternStyle = (
  bg: string,
  accent: string,
  p?: Pat
): React.CSSProperties | undefined => {
  if (!p || p.type === 'none') return undefined;

  const color = p.color ?? accent;
  const alpha = typeof p.opacity === 'number' ? p.opacity : 0.12;
  const size = p.size ?? 24;

  // rgba for the pattern color
  const rgba = hexToRgba(color, alpha);

  if (p.type === 'dots') {
    return {
      backgroundImage: `radial-gradient(${rgba} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
      backgroundPosition: '0 0',
      mixBlendMode: 'normal',
      opacity: 1,
    };
  }

  // grid
  if (p.type === 'grid') {
    return {
      backgroundImage:
        `linear-gradient(${rgba} 1px, transparent 1px),` +
        `linear-gradient(90deg, ${rgba} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px, ${size}px ${size}px`,
      backgroundPosition: '0 0, 0 0',
      mixBlendMode: 'normal',
      opacity: 1,
    };
  }

  return undefined;
};

// ===== helpers =====
const hexToRgba = (hex: string, a: number) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`;
};
