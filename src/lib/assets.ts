import type { CSSProperties } from "react";
import type { AssetManifestEntry, Item } from "@/types/game";
import { assetManifest } from "@/data/assetManifest";
import { characterAssets } from "@/data/characterAssets";
import { divisionAssets } from "@/data/divisionAssets";
import { itemIconAssets } from "@/lib/gameAssetSelectors";

/**
 * Asset manifest. Source sheets are 10x10 grids of sprites.
 * row/col are zero-indexed; computeSpriteStyle maps to background-position.
 *
 * To swap in real PNGs later:
 *  - Drop sliced files into /public/sprites/<category>/<id>.png
 *  - Set publicPath to "/sprites/<category>/<id>.png"
 *  - Or set sourceSheet + row + col + frameWidth/frameHeight
 */
const BASE_ASSET_MANIFEST: AssetManifestEntry[] = [
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
  { id: "sprite-kenza", name: "Kenza", category: "character", fallbackIcon: "✧", tags: ["reserve", "orchestrator"] },
  { id: "sprite-denzel", name: "Denzel", category: "character", fallbackIcon: "◈", tags: ["reserve", "agent"] },
  { id: "sprite-arthur", name: "Arthur", category: "character", fallbackIcon: "⬟", tags: ["reserve", "advisor"] },
  { id: "sprite-stanley", name: "Stanley", category: "character", fallbackIcon: "⬢", tags: ["reserve", "guardian"] },
  { id: "sprite-collective-champion", name: "Collective Champion", category: "character", fallbackIcon: "✹", tags: ["champion"] },
  { id: "sprite-architect-ascended", name: "The Architect Ascended", category: "character", fallbackIcon: "✺", tags: ["ascended"] },
  { id: "portrait-default", name: "Default Portrait", category: "portrait", fallbackIcon: "✦", tags: [] },
  { id: "sprite-default", name: "Default Sprite", category: "character", fallbackIcon: "✦", tags: [] },
  { id: "env-zen", name: "ZenFlow", category: "environment", fallbackIcon: "◎", tags: ["zenflow"] },
  { id: "env-civic", name: "Civic Core", category: "environment", fallbackIcon: "▣", tags: ["civic-core"] },
  { id: "env-hybrid", name: "Hybrid Living", category: "environment", fallbackIcon: "⌂", tags: ["hybrid-living"] },
  { id: "env-helix", name: "Vital Helix", category: "environment", fallbackIcon: "✚", tags: ["vital-helix"] },
  { id: "env-loom", name: "Binary Loom", category: "environment", fallbackIcon: "⌘", tags: ["binary-loom"] },
  { id: "env-gaia", name: "Gaia Synthesis", category: "environment", fallbackIcon: "♧", tags: ["gaia-synthesis"] },
  { id: "env-vector", name: "Vector Shift", category: "environment", fallbackIcon: "⇄", tags: ["vector-shift"] },
  { id: "env-animus", name: "Animus Prime", category: "environment", fallbackIcon: "◉", tags: ["animus-prime"] },
  { id: "env-aether", name: "Aether Link", category: "environment", fallbackIcon: "≋", tags: ["aether-link"] },
  { id: "env-obsidian", name: "Obsidian Arc", category: "environment", fallbackIcon: "◆", tags: ["obsidian-arc"] },
  { id: "env-terra", name: "Terra Axis", category: "environment", fallbackIcon: "▰", tags: ["terra-axis"] },
  { id: "env-labs", name: "Nexus Labs", category: "environment", fallbackIcon: "⚙", tags: ["nexus-labs"] },
  { id: "env-collective", name: "The Collective", category: "environment", fallbackIcon: "✦", tags: ["the-collective"] },
];

const fallbackForCategory = (category: string) => {
  if (category.includes("ITEM")) return "◆";
  if (category.includes("CHARACTER")) return "✦";
  if (category.includes("ENEMY")) return "◆";
  if (category.includes("ENVIRONMENT") || category.includes("HUB")) return "▣";
  if (category.includes("UI")) return "◈";
  if (category.includes("PORTRAIT")) return "◉";
  return "✦";
};

const toAssetCategory = (category: string): AssetManifestEntry["category"] => {
  if (category.includes("ITEM")) return "inventory";
  if (category.includes("CHARACTER")) return "character";
  if (category.includes("ENEMY")) return "enemy";
  if (category.includes("ENVIRONMENT") || category.includes("HUB")) return "environment";
  if (category.includes("UI")) return "ui";
  if (category.includes("PORTRAIT")) return "portrait";
  if (category.includes("TITLE") || category.includes("PROMOTIONAL")) return "environment";
  return "effect";
};

const GENERATED_ASSET_MANIFEST: AssetManifestEntry[] = assetManifest
  .filter(asset => asset.selectedAsBest)
  .map(asset => ({
    id: asset.id,
    name: asset.canonicalName,
    category: toAssetCategory(asset.category),
    publicPath: asset.filePath,
    fallbackIcon: fallbackForCategory(asset.category),
    tags: asset.visualTags,
  }));

const CHARACTER_ASSET_MANIFEST: AssetManifestEntry[] = Object.entries(characterAssets).flatMap(([id, asset]) => {
  const entries: AssetManifestEntry[] = [];
  if (asset.sprite) {
    entries.push({
      id: `sprite-${id.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`,
      name: asset.name,
      category: "character",
      publicPath: asset.sprite,
      fallbackIcon: "✦",
      tags: ["character", id],
    });
  }
  if (asset.portrait) {
    entries.push({
      id: `portrait-${id.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`,
      name: `${asset.name} Portrait`,
      category: "portrait",
      publicPath: asset.portrait,
      fallbackIcon: "◉",
      tags: ["portrait", id],
    });
  }
  return entries;
});

const DIVISION_ASSET_MANIFEST: AssetManifestEntry[] = Object.entries(divisionAssets).flatMap(([id, asset]) => {
  const kebabId = id.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  if (!asset.environment && !asset.battleBackground && !asset.hubMap) return [];
  return [{
    id: asset.fallbackSpriteKey || `env-${kebabId}`,
    name: asset.name,
    category: "environment",
    publicPath: asset.environment ?? asset.battleBackground ?? asset.hubMap ?? undefined,
    fallbackIcon: "▣",
    tags: ["division", kebabId],
  }];
});

export const ASSET_MANIFEST: AssetManifestEntry[] = [
  ...BASE_ASSET_MANIFEST,
  ...GENERATED_ASSET_MANIFEST,
  ...CHARACTER_ASSET_MANIFEST,
  ...DIVISION_ASSET_MANIFEST,
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

const stableIndex = (value: string, length: number) => {
  if (length === 0) return -1;
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % length;
};

export const resolveItemSpriteKey = (item: Item): string => {
  if (ASSET_BY_ID[item.iconKey]) return item.iconKey;
  if (ASSET_BY_ID[item.id]) return item.id;
  const generatedIcons = itemIconAssets();
  const categoryIcons = generatedIcons.filter(asset =>
    asset.visualTags.includes(item.category) ||
    (item.slot ? asset.visualTags.includes(item.slot) : false) ||
    (item.cosmeticVariant ? asset.subcategory === item.cosmeticVariant : false)
  );
  const pool = categoryIcons.length > 0 ? categoryIcons : generatedIcons;
  const index = stableIndex(item.id, pool.length);
  return index >= 0 ? pool[index].id : item.iconKey;
};

// Helper: rowCol -> sprite coords on a 10x10 sheet (each frame 32x32 by default)
export const sheetCoords = (row: number, col: number, frame = 32) => ({
  x: col * frame, y: row * frame, frame,
});
