import { activeAssetById, activeAssetManifest } from "@/data/assetManifest";
import type { Item } from "@/types/game";

export const itemAssetOverrides: Record<string, string> = {};

export function resolveItemAssetId(item: Item): string | null {
  const override = itemAssetOverrides[item.id];
  if (override) return override;
  if (activeAssetById[item.iconKey]) return item.iconKey;

  const normalizedItemName = normalize(item.name);
  const directNameMatch = activeAssetManifest.find((asset) =>
    asset.category.toLowerCase().includes("item") && normalize(asset.canonicalName).includes(normalizedItemName),
  );
  if (directNameMatch) return directNameMatch.id;

  const categoryMatch = activeAssetManifest.find((asset) =>
    asset.category.toLowerCase().includes("item") &&
    (asset.visualTags.includes(item.category) || asset.likelyUsage.includes(item.category)),
  );
  return categoryMatch?.id ?? null;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
