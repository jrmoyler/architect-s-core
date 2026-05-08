import { activeAssetManifest, type GameAssetManifestEntry } from "@/data/assetManifest";

const hasUsage = (asset: GameAssetManifestEntry, usage: string) =>
  asset.likelyUsage.some(item => item.toLowerCase() === usage.toLowerCase());

const hasTag = (asset: GameAssetManifestEntry, tag: string) =>
  asset.visualTags.some(item => item.toLowerCase() === tag.toLowerCase());

export const findActiveAsset = (
  predicate: (asset: GameAssetManifestEntry) => boolean,
) => activeAssetManifest.find(predicate);

export const findActiveAssets = (
  predicate: (asset: GameAssetManifestEntry) => boolean,
) => activeAssetManifest.filter(predicate);

export const titleArtAsset = () =>
  findActiveAsset(asset =>
    asset.category === "PROMOTIONAL_OR_TITLE_ART" ||
    hasUsage(asset, "title") ||
    hasUsage(asset, "main-menu")
  );

export const hubEnvironmentAsset = () =>
  findActiveAsset(asset =>
    asset.category === "HUB_MAP_OR_TILEMAP" ||
    asset.subcategory === "hubs" ||
    hasUsage(asset, "hub") ||
    hasTag(asset, "nexus")
  );

export const battleBackgroundAsset = (divisionId?: string) =>
  findActiveAsset(asset =>
    asset.category === "ENVIRONMENT_BACKGROUND" &&
    (
      hasUsage(asset, "battle") ||
      asset.subcategory === "battle-backgrounds" ||
      (divisionId ? hasTag(asset, divisionId) : false)
    )
  ) ?? findActiveAsset(asset =>
    asset.category === "ENVIRONMENT_BACKGROUND" ||
    asset.category === "HUB_MAP_OR_TILEMAP"
  );

export const itemIconAssets = () =>
  findActiveAssets(asset =>
    asset.category === "ITEM_SPRITE_SHEET" ||
    asset.category === "CYBERPUNK_ITEM_SPRITE_SHEET" ||
    asset.subcategory === "icons" ||
    hasUsage(asset, "inventory")
  );

export const generatedCharacterSprites = () =>
  findActiveAssets(asset =>
    asset.category === "PLAYABLE_CHARACTER_SHEET" ||
    asset.subcategory === "playable" ||
    hasUsage(asset, "party") ||
    hasUsage(asset, "battle")
  );
