// src/AdRenderer.tsx
// Week 4 — crossfades, intro/outro fades, responsive type (no external utils)

import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
  Audio,
} from 'remotion';

import type {AdSpec, Scene} from './schema';
import {msToFrames} from './schema';
import {ensureReadable, readableTextOn} from './utils/color';

/* ---------- tiny local helpers (no extra imports) ---------- */

const src = (p?: string) => {
  if (!p) return undefined;
  if (/^https?:\/\//i.test(p)) return p;
  return staticFile(p.replace(/^\//, ''));
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** responsive font size helper: scales with width, caps to [min,max] px */
const rfs = (width: number, factor: number, minPx: number, maxPx: number) =>
  clamp(Math.round(width * factor), minPx, maxPx);

/* ======================================================================= */
/*                                  ROOT                                   */
/* ======================================================================= */

type Props = {spec: AdSpec};

export const AdRenderer: React.FC<Props> = ({spec}) => {
  const {fps, width, height} = useVideoConfig();

  const bg = spec.brand.background || '#000';
  const primaryText = ensureReadable(spec.brand.primary || '#fff', bg, 4.5);
  const accent = ensureReadable(spec.brand.secondary || '#00E0FF', bg, 3.0);
  const fontFamily = spec.brand.fontFamily || 'Inter, Arial, sans-serif';

  // Crossfade & global intro/outro fade
  const XFADE = Math.round(0.25 * fps); // 250ms per scene overlap
  const INTRO = Math.round(0.20 * fps);
  const OUTRO = Math.round(0.22 * fps);

  let timeline = 0;

  return (
    <AbsoluteFill style={{background: bg, color: primaryText, fontFamily}}>
      {/* Optional background music with gentle fade in/out */}
      {spec.audio?.music ? (
        <Audio
          src={src(spec.audio.music)!}
          volume={(f) => {
            // fade in over INTRO, fade out over OUTRO
            const fadeIn = interpolate(f, [0, INTRO], [0, spec.audio?.volume ?? 0.6], {
              extrapolateRight: 'clamp',
            });
            const fullDur =
              spec.scenes.reduce((sum, sc) => sum + msToFrames(sc.durationMs, fps), 0) + XFADE;
            const localOut = Math.max(0, f - (fullDur - OUTRO));
            const fadeOut = interpolate(localOut, [0, OUTRO], [1, 0], {
              extrapolateRight: 'clamp',
            });
            return Math.min(fadeIn, fadeOut);
          }}
        />
      ) : null}

      {/* Brand logo (safe, responsive) */}
      {spec.brand.logo ? (
        <div
          style={{
            position: 'absolute',
            top: clamp(height * 0.03, 18, 42),
            left: clamp(width * 0.04, 18, 42),
          }}
        >
          <Img
            src={src(spec.brand.logo)!}
            style={{width: Math.min(width * 0.15, 140), height: 'auto'}}
          />
        </div>
      ) : null}

      {/* Scenes with crossfades */}
      {spec.scenes.map((scene, i) => {
        const base = msToFrames(scene.durationMs, fps);
        const from = i === 0 ? 0 : timeline - XFADE; // overlap with previous
        const duration = i === spec.scenes.length - 1 ? base : base + XFADE;
        const startSafe = Math.max(0, from);

        const seq = (
          <Sequence key={i} from={startSafe} durationInFrames={duration}>
            <SceneSwitch
              scene={scene}
              colors={{primaryText, accent, bg}}
              durationInFrames={duration}
              transitionFrames={XFADE}
              brandLogo={spec.brand.logo}
            />
          </Sequence>
        );

        timeline = startSafe + duration;
        return seq;
      })}
    </AbsoluteFill>
  );
};

/* ======================================================================= */
/*                              SCENE SWITCH                               */
/* ======================================================================= */

const SceneSwitch: React.FC<{
  scene: Scene;
  colors: {primaryText: string; accent: string; bg: string};
  durationInFrames: number;
  transitionFrames: number;
  brandLogo?: string;
}> = ({scene, colors, durationInFrames, transitionFrames, brandLogo}) => {
  const f = useCurrentFrame();
  const fadeIn = interpolate(f, [0, transitionFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    f,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const opacity = Math.min(fadeIn, fadeOut);

  let node: React.ReactNode = null;

  switch (scene.type) {
    case 'title':
      node = <TitleScene text={scene.text} subtext={scene.subtext} />;
      break;

    case 'hero_text':
      node = <HeroTextScene headline={scene.headline} subheadline={scene.subheadline} />;
      break;

    case 'icon_list':
      node = (
        <IconListScene
          title={scene.title}
          items={scene.items}
          columns={scene.columns}
          bg={colors.bg}
          defaultText={colors.primaryText}
        />
      );
      break;

    case 'stat_counter':
      node = (
        <StatCounterScene
          title={scene.title}
          items={scene.items}
          bg={colors.bg}
          defaultText={colors.primaryText}
        />
      );
      break;

    case 'split_feature':
      node = (
        <SplitFeatureScene
          title={scene.title}
          body={scene.body}
          media={scene.media}
          bg={colors.bg}
          text={colors.primaryText}
          accent={colors.accent}
        />
      );
      break;

    case 'testimonial':
      node = (
        <TestimonialScene
          quote={scene.quote}
          name={scene.name}
          role={scene.role}
          avatar={scene.avatar}
          bg={colors.bg}
          text={colors.primaryText}
        />
      );
      break;

    case 'carousel':
      node = (
        <CarouselScene
          title={scene.title}
          images={scene.images}
          bg={colors.bg}
          text={colors.primaryText}
        />
      );
      break;

    case 'cta':
      node = <CTAScene headline={scene.headline} button={scene.button} accent={colors.accent} />;
      break;

    case 'cta_outro':
      node = (
        <CTAOutroScene url={scene.url} bg={colors.bg} text={colors.primaryText} logo={brandLogo} />
      );
      break;

    default:
      node = null;
  }

  return <div style={{opacity}}>{node}</div>;
};

/* ======================================================================= */
/*                                  SCENES                                 */
/* ======================================================================= */

// ----- Title -----
const TitleScene: React.FC<{text: string; subtext?: string}> = ({text, subtext}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const opacity = interpolate(frame, [0, Math.round(0.3 * fps)], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });
  const scale = interpolate(frame, [0, Math.round(0.6 * fps)], [0.92, 1.06], {
    extrapolateRight: 'clamp',
    easing: Easing.elastic(1),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        padding: '0 6%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: rfs(width, 0.09, 28, 84),
          fontWeight: 900,
          opacity,
          transform: `scale(${scale})`,
          textAlign: 'center',
          lineHeight: 1.08,
        }}
      >
        {text}
      </div>
      {subtext ? (
        <div
          style={{
            fontSize: rfs(width, 0.04, 16, 34),
            fontWeight: 600,
            opacity: Math.min(1, opacity + 0.2),
            textAlign: 'center',
            lineHeight: 1.25,
          }}
        >
          {subtext}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ----- Hero Text -----
const HeroTextScene: React.FC<{headline: string; subheadline?: string}> = ({
  headline,
  subheadline,
}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const headlineOpacity = interpolate(frame, [0, Math.round(0.35 * fps)], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const headlineY = interpolate(frame, [0, Math.round(0.35 * fps)], [24, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const subDelay = Math.round(0.18 * fps);
  const subLocal = Math.max(0, frame - subDelay);
  const subOpacity = interpolate(subLocal, [0, Math.round(0.3 * fps)], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const subY = interpolate(subLocal, [0, Math.round(0.3 * fps)], [18, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 18,
        padding: '0 6%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: rfs(width, 0.10, 30, 96),
          fontWeight: 900,
          lineHeight: 1.04,
          textAlign: 'center',
          transform: `translateY(${headlineY}px)`,
          opacity: headlineOpacity,
        }}
      >
        {headline}
      </div>

      {subheadline ? (
        <div
          style={{
            fontSize: rfs(width, 0.045, 16, 40),
            fontWeight: 650,
            lineHeight: 1.25,
            textAlign: 'center',
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
          }}
        >
          {subheadline}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ----- Icon List -----
const IconListScene: React.FC<{
  title?: string;
  items: {icon: string; label: string; color?: string}[];
  columns?: 2 | 3 | 4;
  bg: string;
  defaultText: string;
}> = ({title, items, columns = 3, bg, defaultText}) => {
  const {fps, width} = useVideoConfig();
  const col = Math.max(2, Math.min(4, columns));
  const cellSize = Math.min(width / col - 40, 260);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 28,
        padding: '0 6%',
        boxSizing: 'border-box',
      }}
    >
      {title ? (
        <div
          style={{
            fontSize: rfs(width, 0.06, 24, 56),
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${col}, 1fr)`,
          gap: 22,
          maxWidth: 1200,
          width: '100%',
          justifyItems: 'center',
        }}
      >
        {items.map((it, i) => (
          <IconCell
            key={i}
            icon={it.icon}
            label={it.label}
            labelColor={it.color}
            fallbackText={defaultText}
            bg={bg}
            size={cellSize}
            delay={i * Math.round(0.06 * fps)}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const IconCell: React.FC<{
  icon: string;
  label: string;
  labelColor?: string;
  fallbackText: string;
  bg: string;
  size: number;
  delay: number;
}> = ({icon, label, labelColor, fallbackText, bg, size, delay}) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - delay);

  const opacity = interpolate(local, [0, 10, 20], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(local, [0, 20], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const s = /^https?:\/\//i.test(icon) ? icon : staticFile(icon.replace(/^\//, ''));
  const color = ensureReadable(labelColor ?? fallbackText, bg, 4.5);

  return (
    <div style={{width: size, minHeight: size, textAlign: 'center', opacity, transform: `translateY(${y}px)`}}>
      <Img src={s} style={{width: size * 0.45, height: size * 0.45, objectFit: 'contain'}} />
      <div style={{marginTop: 10, fontWeight: 700, lineHeight: 1.2, color, fontSize: clamp(size * 0.09, 14, 22)}}>
        {label}
      </div>
    </div>
  );
};

// ----- Stat Counter -----
const StatCounterScene: React.FC<{
  title?: string;
  items: {label: string; value: number; suffix?: string; color?: string}[];
  bg: string;
  defaultText: string;
}> = ({title, items, bg, defaultText}) => {
  const {fps, width} = useVideoConfig();
  const isNarrow = width < 1200;
  const cols = isNarrow ? Math.min(2, items.length) : Math.min(4, Math.max(1, items.length));
  const cellW = Math.min(420, width / cols - 40);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 28,
        padding: '0 6%',
        boxSizing: 'border-box',
      }}
    >
      {title ? (
        <div style={{fontSize: rfs(width, 0.06, 24, 56), fontWeight: 900, textAlign: 'center', lineHeight: 1.1}}>
          {title}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: isNarrow ? 28 : 22,
          maxWidth: 1400,
          width: '100%',
          justifyItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {items.map((it, i) => (
          <StatCell
            key={i}
            label={it.label}
            value={it.value}
            suffix={it.suffix}
            color={it.color}
            bg={bg}
            fallbackText={defaultText}
            width={cellW}
            delay={i * Math.round(0.08 * fps)}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const StatCell: React.FC<{
  label: string;
  value: number;
  suffix?: string;
  color?: string;
  bg: string;
  fallbackText: string;
  width: number;
  delay: number;
}> = ({label, value, suffix, color, bg, fallbackText, width, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // slower count-up
  const countDur = Math.round(1.8 * fps);
  const progress = Math.min(1, local / countDur);
  const eased = Easing.out(Easing.cubic)(progress);
  const current = Math.round(value * eased);

  const appear = interpolate(local, [0, Math.round(0.3 * fps)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(local, [0, Math.round(0.3 * fps)], [16, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const safeColor = ensureReadable(color ?? fallbackText, bg, 4.5);

  return (
    <div style={{width, textAlign: 'center', opacity: appear, transform: `translateY(${y}px)`}}>
      <div style={{fontSize: clamp(width * 0.15, 28, 64), fontWeight: 900, lineHeight: 1, color: safeColor}}>
        <span style={{display: 'inline-block', whiteSpace: 'nowrap'}}>
          {current.toLocaleString()}
          {suffix ? <span style={{fontWeight: 800, paddingLeft: 8, display: 'inline-block'}}>{suffix}</span> : null}
        </span>
      </div>
      <div style={{marginTop: 10, fontSize: clamp(width * 0.08, 12, 22), fontWeight: 700, lineHeight: 1.2}}>
        {label}
      </div>
    </div>
  );
};

// ----- Split Feature -----
const SplitFeatureScene: React.FC<{
  title: string;
  body?: string;
  media?: {type: 'image'; src: string};
  bg: string;
  text: string;
  accent: string;
}> = ({title, body, media, bg, text}) => {
  const {width, fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const isNarrow = width < 900;

  const appear = interpolate(frame, [0, Math.round(0.35 * fps)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const safeText = ensureReadable(text, bg, 4.5);

  return (
    <AbsoluteFill
      style={{
        padding: isNarrow ? '7% 6%' : '8% 7%',
        display: 'grid',
        gridTemplateColumns: isNarrow ? '1fr' : '1.1fr 1fr',
        gap: isNarrow ? 24 : 40,
        alignItems: 'center',
        boxSizing: 'border-box',
        opacity: appear,
      }}
    >
      {/* Left: text */}
      <div>
        <div
          style={{
            fontSize: rfs(width, 0.06, 22, 56),
            fontWeight: 900,
            lineHeight: 1.1,
            color: safeText,
            marginBottom: 14,
          }}
        >
          {title}
        </div>
        {body ? (
          <div
            style={{
              fontSize: rfs(width, 0.028, 14, 26),
              lineHeight: 1.4,
              fontWeight: 600,
              color: safeText,
              opacity: 0.9,
            }}
          >
            {body}
          </div>
        ) : null}
      </div>

      {/* Right: media */}
      <div style={{display: 'flex', justifyContent: 'center'}}>
        {media?.type === 'image' ? (
          <img
            src={staticFile(media.src)}
            alt=""
            style={{
              width: '100%',
              maxWidth: isNarrow ? 520 : 600,
              borderRadius: 16,
              objectFit: 'cover',
            }}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ----- Testimonial -----
const TestimonialScene: React.FC<{
  quote: string;
  name: string;
  role?: string;
  avatar?: string;
  bg: string;
  text: string;
}> = ({quote, name, role, avatar, bg, text}) => {
  const {width, fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const isNarrow = width < 900;

  const appear = interpolate(frame, [0, Math.round(0.35 * fps)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const safeText = ensureReadable(text, bg, 4.5);

  return (
    <AbsoluteFill
      style={{
        padding: isNarrow ? '8% 7%' : '8% 10%',
        display: 'grid',
        gridTemplateColumns: isNarrow ? '1fr' : '0.9fr 1.1fr',
        gap: isNarrow ? 24 : 40,
        alignItems: 'center',
        boxSizing: 'border-box',
        opacity: appear,
      }}
    >
      {/* Left: avatar */}
      <div style={{display: 'flex', justifyContent: isNarrow ? 'center' : 'flex-end'}}>
        <div
          style={{
            width: isNarrow ? 140 : 180,
            height: isNarrow ? 140 : 180,
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#222',
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
          }}
        >
          {avatar ? (
            <img src={staticFile(avatar)} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: safeText,
                fontWeight: 800,
                fontSize: isNarrow ? 40 : 52,
                opacity: 0.85,
              }}
            >
              {name?.[0]?.toUpperCase() ?? 'A'}
            </div>
          )}
        </div>
      </div>

      {/* Right: quote + name */}
      <div>
        <div
          style={{
            color: safeText,
            fontSize: rfs(width, 0.05, 20, 44),
            lineHeight: 1.25,
            fontWeight: 800,
          }}
        >
          “{quote}”
        </div>
        <div
          style={{
            marginTop: 14,
            color: safeText,
            fontSize: rfs(width, 0.028, 14, 24),
            fontWeight: 700,
            opacity: 0.9,
          }}
        >
          {name}
          {role ? <span style={{fontWeight: 600, opacity: 0.8}}> · {role}</span> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ----- Carousel -----
const CarouselScene: React.FC<{
  title?: string;
  images: string[];
  bg: string;
  text: string;
}> = ({title, images, bg, text}) => {
  const {width, height, fps} = useVideoConfig();
  const frame = useCurrentFrame();

  const safeText = ensureReadable(text, bg, 4.5);

  // layout
  const isLandscape = width / height >= 1.4;
  const topPad = isLandscape ? '9%' : '18%'; // lower on mobile/square
  const innerPadL = Math.round(width * 0.08);
  const innerPadR = innerPadL + 40; // extra room on right so last card fully shows
  const visibleW = Math.max(0, width - innerPadL - innerPadR);

  // card sizing
  const gap = isLandscape ? 22 : 18;
  const maxCardW = isLandscape ? 560 : 440;

  let cardW = Math.floor(visibleW * (isLandscape ? 0.38 : 0.42));
  cardW = Math.min(maxCardW, Math.max(240, cardW));

  // ensure the track is WIDER than viewport on 16:9 so it actually moves,
  // and still show the full last card at the end
  let trackW = images.length * cardW + (images.length - 1) * gap;
  if (trackW <= visibleW) {
    const target = visibleW * 1.18; // at least 18% overflow
    const candidate = Math.floor((target - (images.length - 1) * gap) / images.length);
    cardW = Math.min(maxCardW, Math.max(cardW, candidate));
    trackW = images.length * cardW + (images.length - 1) * gap;
  }

  // timing: a bit faster on mobile/square
  const secs = isLandscape ? 3 : 2;
  const total = Math.max(1, Math.round(secs * fps));
  const t = Math.min(1, frame / total);
  const eased = Easing.inOut(Easing.cubic)(t);

  // slide from x=0 to x=-(trackW - visibleW) so the last card is fully visible at end
  const endShift = Math.ceil(trackW - visibleW) + 40; // guarantee full last card
  const maxShift = Math.max(0, endShift);
  const x = -Math.round(eased * maxShift);

  return (
    <AbsoluteFill
      style={{
        padding: `${topPad} 7% 7%`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        overflow: 'hidden',
      }}
    >
        {title ? (
        <div
          style={{
            color: safeText,
            fontWeight: 900,
            fontSize: rfs(width, 0.055, 22, 52),
            lineHeight: 1.1,
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          {title}
        </div>
      ) : null}      <div style={{position: 'relative', width: '100%', overflow: 'hidden'}}>
        <div
          style={{
            display: 'flex',
            gap,
            transform: `translateX(${x}px)`,
            transition: 'transform 0.001s linear',
            padding: `0 ${innerPadR}px 0 ${innerPadL}px`,
            boxSizing: 'border-box',
            width: '100%',
            justifyContent: 'flex-start',
          }}
        >
          {images.map((s, i) => (
            <img
              key={i}
              src={staticFile(s)}
              alt=""
              style={{
                width: cardW,
                height: Math.round(cardW * 0.62),
                objectFit: 'cover',
                borderRadius: 16,
                boxShadow: '0 6px 28px rgba(0,0,0,0.35)',
                background: '#222',
                flex: '0 0 auto',
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ----- CTA -----
const CTAScene: React.FC<{headline: string; button: string; accent: string}> = ({
  headline,
  button,
  accent,
}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();

  const opacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const pulse = 1 + 0.02 * Math.sin(frame / 6);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
        padding: '0 6%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: rfs(width, 0.065, 24, 64),
          fontWeight: 900,
          opacity,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          padding: '16px 28px',
          borderRadius: 12,
          background: accent,
          color: readableTextOn(accent),
          fontWeight: 800,
          transform: `scale(${pulse})`,
          opacity,
        }}
      >
        {button}
      </div>
    </AbsoluteFill>
  );
};

// ----- CTA Outro -----
const CTAOutroScene: React.FC<{url?: string; bg: string; text: string; logo?: string}> = ({
  url,
  bg,
  text,
  logo,
}) => {
  const {width, fps} = useVideoConfig();
  const frame = useCurrentFrame();

  const appear = interpolate(frame, [0, Math.round(0.25 * fps)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const safeText = ensureReadable(text, bg, 4.5);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        opacity: appear,
        padding: '6%',
        boxSizing: 'border-box',
      }}
    >
      {logo ? (
        <img src={staticFile(logo)} alt="" style={{width: Math.min(260, width * 0.28), height: 'auto'}} />
      ) : null}
      {url ? (
        <div
          style={{
            marginTop: 8,
            color: safeText,
            fontWeight: 800,
            fontSize: rfs(width, 0.04, 18, 40),
            letterSpacing: 0.5,
          }}
        >
          {url}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
