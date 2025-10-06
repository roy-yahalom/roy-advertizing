// src/utils/spec.ts
import type {AdSpec} from '../schema';
import {ensureReadable} from './color';
import {pickMusic} from './assets';

export type ValidateIssue = {path: string; message: string};

export const validateSpec = (spec: AdSpec): ValidateIssue[] => {
  const issues: ValidateIssue[] = [];
  if (!spec.brand) issues.push({path: 'brand', message: 'brand missing'});
  if (!spec.scenes?.length) issues.push({path: 'scenes', message: 'no scenes'});
  spec.scenes?.forEach((s, i) => {
    if (!s.durationMs || s.durationMs <= 0) issues.push({path: `scenes[${i}].durationMs`, message: 'must be > 0'});
  });
  return issues;
};

export const enrichSpec = (spec: AdSpec): AdSpec => {
  const bg = spec.brand.background || '#000000';
  const primary = ensureReadable(spec.brand.primary || '#ffffff', bg, 4.5);
  const secondary = ensureReadable(spec.brand.secondary || '#00E0FF', bg, 3.0);

  const audio = spec.audio?.music
    ? spec.audio
    : {music: pickMusic('calm').src, volume: 0.55};

  return {
    ...spec,
    brand: {...spec.brand, primary, secondary, background: bg},
    audio,
  };
};
