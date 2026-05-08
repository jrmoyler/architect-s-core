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
  const [failed, setFailed] = useState(false);
  const entry = ASSET_BY_ID[spriteKey];
  const sliced = entry?.sourceSheet && entry.row != null && entry.col != null;
  const style = sliced ? computeSpriteStyle(entry) : undefined;

  if (entry?.publicPath && !failed) {
    return (
      <img
        src={entry.publicPath}
        alt={label || entry.name}
        className={cn("pixel inline-block object-contain", className)}
        style={{ width: size, height: size }}
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
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
