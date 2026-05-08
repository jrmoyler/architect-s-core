export type GameAssetCategory =
  | "ITEM_SPRITE_SHEET"
  | "CYBERPUNK_ITEM_SPRITE_SHEET"
  | "CHARACTER_ENEMY_UI_SPRITE_SHEET"
  | "PLAYABLE_CHARACTER_SHEET"
  | "ENEMY_OR_BOSS_ART"
  | "ENVIRONMENT_BACKGROUND"
  | "HUB_MAP_OR_TILEMAP"
  | "UI_ASSET"
  | "PORTRAIT_OR_DIALOGUE_ASSET"
  | "PROMOTIONAL_OR_TITLE_ART"
  | "UNKNOWN_REVIEW";

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

export interface GameAssetManifestEntry {
  id: string;
  canonicalName: string;
  category: GameAssetCategory | string;
  subcategory: string;
  filePath: string;
  width: number;
  height: number;
  aspectRatio: number;
  sourceFileOriginalName: string;
  confidence: number;
  qualityScore: number;
  visualTags: string[];
  likelyUsage: string[];
  duplicateClusterId: string | null;
  selectedAsBest: boolean;
  notes: string;
  sourceSheetId?: string;
  sourceCell?: SourceCell;
  cropBox?: CropBox;
  hasLabelVersion?: boolean;
  labelVersionPath?: string | null;
}

export const assetManifest: GameAssetManifestEntry[] = [];

export const activeAssetManifest = assetManifest.filter(asset => asset.selectedAsBest);

export const assetById: Record<string, GameAssetManifestEntry> =
  Object.fromEntries(assetManifest.map(asset => [asset.id, asset]));
