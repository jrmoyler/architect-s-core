import { ASSET_BY_ID, computeSpriteStyle, resolveSpritePath } from "@/lib/assets";
import { getCharacterFrame, type AnimState } from "@/data/characterAssets";
import { cn } from "@/lib/utils";

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
  const sliced = entry?.sourceSheet && entry.row != null && entry.col != null;
  if (sliced) {
    return (
      <div
        className={cn("pixel inline-block", className)}
        style={computeSpriteStyle(entry)}
        aria-label={label || entry?.name}
      />
    );
  }

  // ── Priority 2: character animation frame ──────────────────────────────────
  // Only attempted for character sprite keys (those that have a frame map)
  if (animState !== "idle" || spriteKey.startsWith("sprite-")) {
    const framePath = getCharacterFrame(spriteKey, animState);
    if (framePath) {
      return (
        <img
          src={framePath}
          alt={label || entry?.name || spriteKey}
          className={cn("pixel object-contain", className)}
          style={{ width: size, height: size, imageRendering: "pixelated" }}
          onError={e => {
            // Frame missing → fall through to idle, then manifest
            const idle = getCharacterFrame(spriteKey, "idle");
            if (idle && e.currentTarget.src !== idle) {
              e.currentTarget.src = idle;
            } else {
              e.currentTarget.style.display = "none";
            }
          }}
        />
      );
    }
  }

  // ── Priority 3: direct PNG from manifest ───────────────────────────────────
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

  // ── Priority 4: glyph placeholder ─────────────────────────────────────────
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
