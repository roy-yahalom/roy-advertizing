// src/utils/assets.ts
import lib from '../assets/library.json';

export type AssetItem = {
  id: string;
  src: string;
  tags?: string[];
  tone?: ('calm'|'bold'|'playful')[];
  ar?: ('1x1'|'9x16'|'16x9')[];
  bpm?: number;
  weight?: number;
};

export type AssetLibrary = {
  icons: AssetItem[];
  backgrounds: AssetItem[];
  music: AssetItem[];
  sfx: AssetItem[];
  transitions: {id: string; type: 'crossfade'; ms: number}[];
};

export const library: AssetLibrary = lib as unknown as AssetLibrary;

const pickWeighted = (arr: AssetItem[]) => {
  const expanded = arr.flatMap(a => Array(Math.max(1, a.weight ?? 1)).fill(a));
  return expanded[Math.floor(Math.random() * expanded.length)] ?? arr[0];
};

export const pickIcon = (tags: string[] = [], tone: 'calm'|'bold'|'playful' = 'calm') => {
  const c = library.icons.filter(i =>
    (!i.tone || i.tone.includes(tone)) &&
    (tags.length === 0 || (i.tags || []).some(t => tags.includes(t)))
  );
  return pickWeighted(c.length ? c : library.icons);
};

export const pickBackground = (ar: '1x1'|'9x16'|'16x9', tone: 'calm'|'bold'|'playful' = 'calm') => {
  const c = library.backgrounds.filter(b =>
    (!b.tone || b.tone.includes(tone)) &&
    (!b.ar   || b.ar.includes(ar))
  );
  return pickWeighted(c.length ? c : library.backgrounds);
};

export const pickMusic = (tone: 'calm'|'bold'|'playful' = 'calm') => {
  const c = library.music.filter(m => !m.tone || m.tone.includes(tone));
  return pickWeighted(c.length ? c : library.music);
};
