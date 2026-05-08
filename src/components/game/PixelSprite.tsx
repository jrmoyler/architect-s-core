import { ASSET_BY_ID, computeSpriteStyle, resolveSpritePath } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface Props {
  spriteKey: string;
  size?: number;
  className?: string;
  label?: string;
}

export function PixelSprite({ spriteKey, size = 64, className, label }: Props) {
  const entry = ASSET_BY_ID[spriteKey];

  // Priority 1: sprite-sheet clip
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

  // Priority 2: direct PNG (publicPath from manifest or character registry)
  const imgPath = resolveSpritePath(spriteKey);
  if (imgPath) {
    return (
      <img
        src={imgPath}
        alt={label || entry?.name || spriteKey}
        className={cn("pixel object-contain", className)}
        style={{ width: size, height: size, imageRendering: "pixelated" }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }

  // Priority 3: glyph fallback
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
