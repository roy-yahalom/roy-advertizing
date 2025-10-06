// Week 4 — Layout helpers: safe areas + pads + clamp utilities

export type Edge = 'top' | 'right' | 'bottom' | 'left';

export const safeArea = (px = 24) => ({
  paddingTop: px,
  paddingRight: px,
  paddingBottom: px,
  paddingLeft: px,
});

export const pad = (t: number, r?: number, b?: number, l?: number) => ({
  paddingTop: t,
  paddingRight: r ?? t,
  paddingBottom: b ?? t,
  paddingLeft: l ?? r ?? t,
});

export const vh = (height: number, pct: number) => Math.round((height * pct) / 100);

/**
 * clampPx — numeric clamp for values that depend on width.
 */
export const clampPx = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * centerRow — flex row centered with gap.
 */
export const centerRow = (gap = 16) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap,
});

/**
 * centerCol — flex column centered with gap.
 */
export const centerCol = (gap = 16) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column' as const,
  gap,
});
