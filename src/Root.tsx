// src/Root.tsx
import React from 'react';
import {Composition} from 'remotion';
import {AdRenderer} from './AdRenderer';
import {demoSpec} from './adSpec';
import {enrichSpec} from './utils/spec';

const fps = 30;

const framesFor = (ms: number) => Math.max(1, Math.round((ms/1000)*fps));
const totalFrames = (spec: typeof demoSpec) =>
  spec.scenes.reduce((sum, s) => sum + framesFor(s.durationMs), 0);

export const RemotionRoot: React.FC = () => {
  const spec = enrichSpec(demoSpec);

  return (
    <>
      <Composition
        id="Demo-9x16"
        component={AdRenderer}
        durationInFrames={totalFrames(spec)}
        fps={fps}
        width={1080}
        height={1920}
        defaultProps={{spec}}
      />
      <Composition
        id="Demo-1x1"
        component={AdRenderer}
        durationInFrames={totalFrames(spec)}
        fps={fps}
        width={1080}
        height={1080}
        defaultProps={{spec}}
      />
      <Composition
        id="Demo-16x9"
        component={AdRenderer}
        durationInFrames={totalFrames(spec)}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={{spec}}
      />
    </>
  );
};
