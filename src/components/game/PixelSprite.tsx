import { useState } from "react";
import { ASSET_BY_ID, computeSpriteStyle } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface Props {
  spriteKey: string;
  size?: number;
  className?: string;
  label?: string;
}

export function PixelSprite({ spriteKey, size = 64, className, label }: Props) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const entry = ASSET_BY_ID[spriteKey];
  const sliced = entry?.sourceSheet && entry.row != null && entry.col != null;
  const publicPath = entry?.publicPath && failedPath !== entry.publicPath ? entry.publicPath : null;
  const style = sliced ? computeSpriteStyle(entry) : undefined;

  if (publicPath) {
    return (
      <img
        src={publicPath}
        alt={label || entry?.name || spriteKey}
        className={cn("pixel inline-block object-contain", className)}
        style={{ width: size, height: size, imageRendering: "pixelated" }}
        loading="lazy"
        draggable={false}
        onError={() => setFailedPath(publicPath)}
      />
    );
  }

  if (sliced) {
    return <div className={cn("pixel inline-block", className)} style={style} aria-label={label || entry?.name} />;
  }
  // Fallback: glyph in a pixel-art frame
  return (
    <div
      className={cn(
        "pixel inline-flex items-center justify-center rounded-md border border-border/60",
        "bg-gradient-to-br from-muted to-card relative overflow-hidden",
        className
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
