import type { AssetManifestEntry } from "@/types/game";

/**
 * Asset manifest. Source sheets are 10x10 grids of sprites.
 * row/col are zero-indexed; computeSpriteStyle maps to background-position.
 *
 * To swap in real PNGs later:
 *  - Drop sliced files into /public/sprites/<category>/<id>.png
 *  - Set publicPath to "/sprites/<category>/<id>.png"
 *  - Or set sourceSheet + row + col + frameWidth/frameHeight
 */
export const ASSET_MANIFEST: AssetManifestEntry[] = [
  // Characters
  { id: "sprite-hataalii", name: "Hataalii", category: "character", fallbackIcon: "🜂", tags: ["leader", "architect"] },
  { id: "sprite-devon", name: "Devon Scout", category: "character", fallbackIcon: "⚡", tags: ["dps"] },
  { id: "sprite-ahmed", name: "Ahmed", category: "character", fallbackIcon: "♛", tags: ["support"] },
  { id: "sprite-joseph", name: "Dr. Joseph", category: "character", fallbackIcon: "✚", tags: ["healer"] },
  // Portraits
  { id: "portrait-hataalii", name: "Hataalii Portrait", category: "portrait", fallbackIcon: "🜂", tags: [] },
  { id: "portrait-devon", name: "Devon Portrait", category: "portrait", fallbackIcon: "⚡", tags: [] },
  { id: "portrait-ahmed", name: "Ahmed Portrait", category: "portrait", fallbackIcon: "♛", tags: [] },
  { id: "portrait-joseph", name: "Joseph Portrait", category: "portrait", fallbackIcon: "✚", tags: [] },
  // Enemies
  { id: "sprite-entropy-specter", name: "Entropy Specter", category: "enemy", fallbackIcon: "👻", tags: ["tutorial"] },
  { id: "sprite-market-goblin", name: "Market Crash Goblin", category: "enemy", fallbackIcon: "👺", tags: [] },
  { id: "sprite-tournament-champion", name: "Tournament Champion", category: "enemy", fallbackIcon: "🏆", tags: ["boss"] },
  { id: "sprite-debt-dragon", name: "Debt Dragon", category: "enemy", fallbackIcon: "🐉", tags: ["boss"] },
  // Environments
  { id: "env-kinetic", name: "Stadium of Motion", category: "environment", fallbackIcon: "🏟", tags: [] },
  { id: "env-quantum", name: "Trading Floor", category: "environment", fallbackIcon: "📈", tags: [] },
];

export const ASSET_BY_ID: Record<string, AssetManifestEntry> =
  Object.fromEntries(ASSET_MANIFEST.map(a => [a.id, a]));

export const computeSpriteStyle = (entry?: AssetManifestEntry): React.CSSProperties => {
  if (!entry?.sourceSheet || entry.row == null || entry.col == null || !entry.frameWidth) return {};
  const fw = entry.frameWidth, fh = entry.frameHeight ?? fw;
  return {
    backgroundImage: `url(${entry.sourceSheet})`,
    backgroundPosition: `-${entry.col * fw}px -${entry.row * fh}px`,
    width: fw, height: fh,
    imageRendering: "pixelated",
  };
};

export const resolveSprite = (id: string): { entry?: AssetManifestEntry; fallback: string } => {
  const entry = ASSET_BY_ID[id];
  return { entry, fallback: entry?.fallbackIcon ?? "✦" };
};

// Helper: rowCol -> sprite coords on a 10x10 sheet (each frame 32x32 by default)
export const sheetCoords = (row: number, col: number, frame = 32) => ({
  x: col * frame, y: row * frame, frame,
});
