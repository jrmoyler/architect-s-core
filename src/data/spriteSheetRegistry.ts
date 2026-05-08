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

export const spriteSheetImportStatus = {
  detectedSheetCount: 0,
  slicedSheetCount: 0,
  generatedSpriteCount: 0,
  blocker: "No source sprite sheets were present in the workspace to classify or slice.",
};
