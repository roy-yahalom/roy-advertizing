// src/schema.ts

// ========= Brand / Audio =========
export type Brand = {
  primary: string;
  secondary: string;
  background: string;
  fontFamily?: string;
  logo?: string;

  pattern?: {
    type: 'dots' | 'grid' | 'none';
    color?: string;
    opacity?: number;
    size?: number;
  };
};

export type AudioSpec = {
  music: string;
  volume?: number;
};

export type AdSpec = {
  brand: Brand;
  audio?: AudioSpec;
  scenes: Scene[];
};

// ========= Scenes =========
export type BaseScene = {
  durationMs: number;
  pattern?: {
    type: 'dots' | 'grid' | 'none';
    color?: string;
    opacity?: number;
    size?: number;
  };
};

export type TitleSceneT = BaseScene & {
  type: 'title';
  text: string;
  subtext?: string;
};

export type HeroTextSceneT = BaseScene & {
  type: 'hero_text';
  headline: string;
  subheadline?: string;
};

export type IconListSceneT = BaseScene & {
  type: 'icon_list';
  title?: string;
  items: {icon: string; label: string; color?: string}[];
  columns?: 2 | 3 | 4;
};

export type StatCounterSceneT = BaseScene & {
  type: 'stat_counter';
  title?: string;
  items: {label: string; value: number; suffix?: string; color?: string}[];
};

export type SplitFeatureSceneT = BaseScene & {
  type: 'split_feature';
  title: string;
  body?: string;
  media?: {type: 'image'; src: string};
};

export type TestimonialSceneT = BaseScene & {
  type: 'testimonial';
  quote: string;
  name: string;
  role?: string;
  avatar?: string;
};

export type CarouselSceneT = BaseScene & {
  type: 'carousel';
  title?: string;
  images: string[];
};

export type FeatureSceneT = BaseScene & {
  type: 'feature';
  headline: string;
  body?: string;
  accent: string;
};

export type CTASceneT = BaseScene & {
  type: 'cta';
  headline: string;
  button: string;
};

export type CTAOutroSceneT = BaseScene & {
  type: 'cta_outro';
  url?: string;
};

export type Scene =
  | TitleSceneT
  | HeroTextSceneT
  | IconListSceneT
  | StatCounterSceneT
  | SplitFeatureSceneT
  | TestimonialSceneT
  | CarouselSceneT
  | FeatureSceneT
  | CTASceneT
  | CTAOutroSceneT;

// ========= Helpers =========
export const msToFrames = (ms: number, fps: number) =>
  Math.max(1, Math.round((ms / 1000) * fps));

/**
 * Total timeline length in frames.
 * Note: Our renderer uses crossfades without extending the total,
 * so this is just the sum of each scene’s base frames.
 */
export const totalFrames = (spec: AdSpec, fps: number) =>
  spec.scenes.reduce((sum, s) => sum + msToFrames(s.durationMs, fps), 0);
