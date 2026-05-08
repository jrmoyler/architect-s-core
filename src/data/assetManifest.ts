export interface SourceCell {
  row: number;
  column: number;
}

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameAssetEntry {
  id: string;
  canonicalName: string;
  category: string;
  subcategory: string;
  filePath: string;
  width: number;
  height: number;
  aspectRatio: number;
  sourceFileOriginalName: string;
  sourceSheetId?: string | null;
  sourceCell?: SourceCell | null;
  cropBox?: CropBox | null;
  hasLabelVersion?: boolean;
  labelVersionPath?: string | null;
  confidence: number;
  qualityScore: number;
  visualTags: string[];
  likelyUsage: string[];
  duplicateClusterId: string | null;
  selectedAsBest: boolean;
  notes: string;
}

export const activeAssetManifest: GameAssetEntry[] = [];

export const activeAssetById: Record<string, GameAssetEntry> = Object.fromEntries(
  activeAssetManifest.map((asset) => [asset.id, asset]),
);

export const activeAssetsByCategory = activeAssetManifest.reduce<Record<string, GameAssetEntry[]>>(
  (groups, asset) => {
    groups[asset.category] = [...(groups[asset.category] ?? []), asset];
    return groups;
  },
  {},
);

export const assetImportStatus = {
  importedImageCount: 0,
  activeAssetCount: activeAssetManifest.length,
  blocker: "No attached asset ZIP or source images were available in this workspace during integration.",
};
