export interface SpriteSheetRegistryEntry {
  id: string;
  originalPath: string;
  sheetType: string;
  rows: number;
  columns: number;
  estimatedCellWidth: number;
  estimatedCellHeight: number;
  hasLabels: boolean;
  labelCropStrategy: string;
  slicedAssetIds: string[];
  confidence: number;
  notes: string;
}

export const spriteSheetRegistry: SpriteSheetRegistryEntry[] = [];
