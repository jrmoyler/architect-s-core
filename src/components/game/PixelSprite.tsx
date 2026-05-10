import { useEffect, useMemo, useRef, useState } from "react";
import { ASSET_BY_ID, computeSpriteStyle, resolveSpritePath } from "@/lib/assets";
import { getCharacterFrames, type AnimState } from "@/data/characterAssets";
import { cn } from "@/lib/utils";

/** ms per frame when cycling a multi-frame animation strip */
const FRAME_MS = 150;

/** These states loop indefinitely; all others play once then hold the last frame. */
const LOOP_STATES = new Set<AnimState>(["idle", "walk"]);

interface Props {
  spriteKey: string;
  size?: number;
  className?: string;
  label?: string;
  /** Battle animation state. Defaults to "idle". Falls back gracefully when frames are missing. */
  animState?: AnimState;
}

export function PixelSprite({
  spriteKey,
  size = 64,
  className,
  label,
  animState = "idle",
}: Props) {
  const entry = ASSET_BY_ID[spriteKey];

  // ── Priority 1: sprite-sheet CSS clip (legacy items / icon grid) ───────────
  const sliced = !!(entry?.sourceSheet && entry.row != null && entry.col != null);

  // ── Multi-frame cycling ────────────────────────────────────────────────────
  // getCharacterFrames returns [] for non-character keys (e.g. items, enemies).
  const frames = useMemo(
    () => (sliced ? [] : getCharacterFrames(spriteKey, animState)),
    [sliced, spriteKey, animState],
  );

  const [frameIdx, setFrameIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Reset to first frame whenever the clip or animation changes.
    setFrameIdx(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (frames.length <= 1) return; // nothing to cycle

    const loop = LOOP_STATES.has(animState);
    let idx = 0;

    intervalRef.current = setInterval(() => {
      idx += 1;
      if (idx >= frames.length) {
        if (loop) {
          idx = 0; // wrap around
        } else {
          // Play-once: hold last frame and stop the interval.
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return;
        }
      }
      setFrameIdx(idx);
    }, FRAME_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [frames, animState]); // frames identity changes only when spriteKey/animState change

  // ── Render ─────────────────────────────────────────────────────────────────

  if (sliced) {
    return (
      <div
        className={cn("pixel inline-block", className)}
        style={computeSpriteStyle(entry)}
        aria-label={label || entry?.name}
      />
    );
  }

  // Priority 2: character animation frame (multi-frame or single)
  const currentSrc = frames[frameIdx] ?? frames[0];
  if (currentSrc) {
    return (
      <img
        src={currentSrc}
        alt={label || entry?.name || spriteKey}
        className={cn("pixel object-contain", className)}
        style={{ width: size, height: size, imageRendering: "pixelated" }}
        onError={e => {
          // Frame missing → fall back to first frame (idle f01), then hide.
          const first = frames[0];
          if (first && e.currentTarget.src !== first) {
            e.currentTarget.src = first;
          } else {
            e.currentTarget.style.display = "none";
          }
        }}
      />
    );
  }

  // Priority 3: direct PNG / SVG from manifest
  const imgPath = resolveSpritePath(spriteKey);
  if (imgPath) {
    return (
      <img
        src={imgPath}
        alt={label || entry?.name || spriteKey}
        className={cn("pixel object-contain", className)}
        style={{ width: size, height: size, imageRendering: "pixelated" }}
        onError={e => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  // Priority 4: glyph placeholder
  return (
    <div
      className={cn(
        "pixel inline-flex items-center justify-center rounded-md border border-border/60",
        "bg-gradient-to-br from-muted to-card relative overflow-hidden",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={label || entry?.name || spriteKey}
    >
      <div className="absolute inset-0 opacity-30 stars-bg" />
      <span className="relative font-display text-2xl glow-cyan select-none">
        {entry?.fallbackIcon ?? "✦"}
      </span>
    </div>
  );
}
