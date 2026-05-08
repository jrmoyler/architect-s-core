import type { CSSProperties } from "react";
import type { AssetManifestEntry } from "@/types/game";
import { activeAssetManifest } from "@/data/assetManifest";

/**
 * Asset manifest. Source sheets are 10x10 grids of sprites.
 * row/col are zero-indexed; computeSpriteStyle maps to background-position.
 *
 * To swap in real PNGs:
 *  - Run scripts/process-assets.mjs against the imported ZIP.
 *  - Selected assets are written under /public/assets/game/.
 *  - Set publicPath to "/sprites/<category>/<id>.png"
 *  - Or set sourceSheet + row + col + frameWidth/frameHeight
 */
const importedAssetEntries: AssetManifestEntry[] = activeAssetManifest.map((asset) => ({
  id: asset.id,
  name: asset.canonicalName,
  category: normalizeCategory(asset.category),
  publicPath: asset.filePath,
  fallbackIcon: fallbackForCategory(asset.category),
  tags: asset.visualTags,
}));

const shellFallbackAssets: AssetManifestEntry[] = [
  // Characters
  { id: "sprite-hataalii", name: "Hataalii", category: "character", fallbackIcon: "🜂", tags: ["leader", "architect"] },
  { id: "sprite-devon", name: "Devon Scout", category: "character", fallbackIcon: "⚡", tags: ["dps"] },
  { id: "sprite-ahmed", name: "Ahmed", category: "character", fallbackIcon: "♛", tags: ["support"] },
  { id: "sprite-joseph", name: "Dr. Joseph", category: "character", fallbackIcon: "✚", tags: ["healer"] },
  { id: "sprite-kenza", name: "Kenza", category: "character", fallbackIcon: "✧", tags: ["reserve"] },
  { id: "sprite-denzel", name: "Denzel", category: "character", fallbackIcon: "◇", tags: ["reserve"] },
  { id: "sprite-arthur", name: "Arthur", category: "character", fallbackIcon: "▣", tags: ["reserve"] },
  { id: "sprite-stanley", name: "Stanley", category: "character", fallbackIcon: "⚙", tags: ["reserve"] },
  { id: "sprite-collective-champion", name: "Collective Champion", category: "character", fallbackIcon: "◆", tags: ["canon"] },
  { id: "sprite-architect-ascended", name: "The Architect Ascended", category: "character", fallbackIcon: "✦", tags: ["canon"] },
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
  { id: "env-zen", name: "ZenFlow", category: "environment", fallbackIcon: "◌", tags: [] },
  { id: "env-civic", name: "Civic Core", category: "environment", fallbackIcon: "⌂", tags: [] },
  { id: "env-hybrid", name: "Hybrid Living", category: "environment", fallbackIcon: "⬡", tags: [] },
  { id: "env-helix", name: "Vital Helix", category: "environment", fallbackIcon: "✚", tags: [] },
  { id: "env-loom", name: "Binary Loom", category: "environment", fallbackIcon: "⌁", tags: [] },
  { id: "env-gaia", name: "Gaia Synthesis", category: "environment", fallbackIcon: "♧", tags: [] },
  { id: "env-vector", name: "Vector Shift", category: "environment", fallbackIcon: "➤", tags: [] },
  { id: "env-animus", name: "Animus Prime", category: "environment", fallbackIcon: "◉", tags: [] },
  { id: "env-aether", name: "Aether Link", category: "environment", fallbackIcon: "☍", tags: [] },
  { id: "env-obsidian", name: "Obsidian Arc", category: "environment", fallbackIcon: "▰", tags: [] },
  { id: "env-terra", name: "Terra Axis", category: "environment", fallbackIcon: "▲", tags: [] },
  { id: "env-labs", name: "Nexus Labs", category: "environment", fallbackIcon: "⚙", tags: [] },
  { id: "env-collective", name: "The Collective", category: "environment", fallbackIcon: "✦", tags: [] },
];

export const ASSET_MANIFEST: AssetManifestEntry[] = [
  ...importedAssetEntries,
  ...shellFallbackAssets.filter((asset) => !importedAssetEntries.some((imported) => imported.id === asset.id)),
];

export const ASSET_BY_ID: Record<string, AssetManifestEntry> =
  Object.fromEntries(ASSET_MANIFEST.map(a => [a.id, a]));

export const computeSpriteStyle = (entry?: AssetManifestEntry): CSSProperties => {
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

function normalizeCategory(category: string): AssetManifestEntry["category"] {
  const normalized = category.toLowerCase();
  if (normalized.includes("item") || normalized.includes("inventory")) return "inventory";
  if (normalized.includes("character")) return "character";
  if (normalized.includes("enemy") || normalized.includes("boss")) return "enemy";
  if (normalized.includes("environment") || normalized.includes("map") || normalized.includes("background")) return "environment";
  if (normalized.includes("effect")) return "effect";
  if (normalized.includes("portrait") || normalized.includes("dialogue")) return "portrait";
  return "ui";
}

function fallbackForCategory(category: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes("item") || normalized.includes("inventory")) return "◆";
  if (normalized.includes("character")) return "✦";
  if (normalized.includes("enemy") || normalized.includes("boss")) return "!";
  if (normalized.includes("environment") || normalized.includes("map") || normalized.includes("background")) return "▣";
  if (normalized.includes("effect")) return "*";
  if (normalized.includes("portrait") || normalized.includes("dialogue")) return "◇";
  return "•";
}
