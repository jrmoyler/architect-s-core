import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const workspace = process.cwd();
const importedDir = path.join(workspace, "tmp", "imported-assets");
const processingDir = path.join(workspace, "tmp", "asset-processing");
const publicRoot = path.join(workspace, "public", "assets", "game");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const excludedDirs = new Set([".git", "node_modules", "dist"]);

const targetDirs = [
  "items/sheets",
  "items/icons",
  "items/reference-cells",
  "items/branded",
  "items/cyberpunk",
  "characters/playable",
  "characters/companions",
  "characters/sprites",
  "characters/turnarounds",
  "characters/portraits",
  "enemies/sprites",
  "enemies/regular",
  "enemies/bosses",
  "environments/hubs",
  "environments/battle-backgrounds",
  "environments/division-realms",
  "environments/maps",
  "ui/hud",
  "ui/menus",
  "ui/icons",
  "ui/effects",
  "objects",
  "tiles",
  "title",
  "promotional",
  "sheets-original",
  "_review/duplicates",
  "_review/unknown",
  "_review/rejected",
  "_review/bad-slices",
];

await main();

async function main() {
  await ensureWorkspace();

  const input = process.argv[2];
  const sourceRoot = await resolveSource(input);
  const imageFiles = sourceRoot ? await scanImages(sourceRoot) : [];

  if (imageFiles.length === 0) {
    await writeEmptyOutputs();
    console.log("No source images found. Wrote empty manifests with blocker notes.");
    return;
  }

  const rawInventory = [];
  for (const filePath of imageFiles) {
    rawInventory.push(await inspectImage(filePath));
  }
  await writeJson(path.join(processingDir, "raw-inventory.json"), rawInventory);

  const classified = rawInventory.map(classifyImage);
  const clusters = buildDuplicateClusters(classified);
  const selectedPaths = selectBestAssets(clusters);
  const activeAssets = [];
  const review = { duplicates: [], unknown: [], rejected: [], badSlices: [] };
  const spriteSheets = [];

  for (const image of classified) {
    if (image.category === "UNKNOWN_REVIEW") {
      const copied = await copyReview(image, "_review/unknown", review.unknown.length + 1);
      review.unknown.push({ ...reviewEntry(image), filePath: copied });
      continue;
    }

    if (image.qualityScore < 45) {
      const copied = await copyReview(image, "_review/rejected", review.rejected.length + 1);
      review.rejected.push({ ...reviewEntry(image), filePath: copied, reason: "Quality score below active threshold." });
      continue;
    }

    if (!selectedPaths.has(image.path)) {
      const copied = await copyReview(image, `_review/duplicates/${image.duplicateClusterId ?? "cluster"}`, review.duplicates.length + 1);
      review.duplicates.push({ ...reviewEntry(image), filePath: copied, reason: "Duplicate or near-duplicate not selected as best." });
      continue;
    }

    if (isSheetCategory(image.category)) {
      const sheetResult = await processSheet(image, activeAssets, review.badSlices);
      spriteSheets.push(sheetResult);
      continue;
    }

    const copied = await copyActive(image);
    activeAssets.push(toManifestEntry(image, copied));
  }

  await writeManifests(activeAssets, review, spriteSheets, rawInventory.length, classified.length);
  await writeDuplicateLog(clusters, selectedPaths);

  console.log(`Processed ${rawInventory.length} images.`);
  console.log(`Active assets: ${activeAssets.length}`);
  console.log(`Sprite sheets: ${spriteSheets.length}`);
}

async function ensureWorkspace() {
  await fs.mkdir(importedDir, { recursive: true });
  await fs.mkdir(processingDir, { recursive: true });
  await Promise.all(targetDirs.map((dir) => fs.mkdir(path.join(publicRoot, dir), { recursive: true })));
}

async function resolveSource(input) {
  if (input) {
    const absoluteInput = path.resolve(workspace, input);
    if (!existsSync(absoluteInput)) {
      throw new Error(`Input path does not exist: ${absoluteInput}`);
    }
    if (path.extname(absoluteInput).toLowerCase() === ".zip") {
      await extractZip(absoluteInput, importedDir);
      return importedDir;
    }
    return absoluteInput;
  }

  const zips = await scanFiles(workspace, (filePath) => path.extname(filePath).toLowerCase() === ".zip");
  if (zips.length > 0) {
    await extractZip(zips[0], importedDir);
    return importedDir;
  }

  if (existsSync(importedDir)) return importedDir;
  return null;
}

async function extractZip(zipPath, destination) {
  await fs.rm(destination, { recursive: true, force: true });
  await fs.mkdir(destination, { recursive: true });
  await execFileAsync("unzip", ["-q", zipPath, "-d", destination]);
}

async function scanImages(root) {
  return scanFiles(root, (filePath) => imageExtensions.has(path.extname(filePath).toLowerCase()));
}

async function scanFiles(root, predicate) {
  const out = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (excludedDirs.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (fullPath.startsWith(publicRoot)) continue;
        await walk(fullPath);
      } else if (entry.isFile() && predicate(fullPath)) {
        out.push(fullPath);
      }
    }
  }
  await walk(root);
  return out.sort();
}

async function inspectImage(filePath) {
  const data = await fs.readFile(filePath);
  const metadata = await sharp(data, { animated: false }).metadata();
  const stats = await fs.stat(filePath);
  const perceptualHash = await computePerceptualHash(data);
  return {
    path: filePath,
    originalName: path.basename(filePath),
    relativePath: path.relative(workspace, filePath),
    sizeBytes: stats.size,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    format: metadata.format ?? path.extname(filePath).slice(1),
    hasAlpha: Boolean(metadata.hasAlpha),
    exactHash: createHash("sha256").update(data).digest("hex"),
    perceptualHash,
  };
}

async function computePerceptualHash(data) {
  const raw = await sharp(data, { animated: false })
    .resize(16, 16, { fit: "fill", kernel: "nearest" })
    .greyscale()
    .raw()
    .toBuffer();
  const avg = raw.reduce((sum, value) => sum + value, 0) / raw.length;
  return Array.from(raw, (value) => (value >= avg ? "1" : "0")).join("");
}

function classifyImage(image) {
  const aspectRatio = image.height ? image.width / image.height : 1;
  const { rows, columns } = estimateGrid(image.width, image.height);
  const isGrid = rows > 1 && columns > 1;
  const megapixels = (image.width * image.height) / 1_000_000;

  let category = "UNKNOWN_REVIEW";
  let subcategory = "unknown";
  const visualTags = [];
  const likelyUsage = [];

  if (isGrid && rows >= 8 && columns >= 8) {
    category = "ITEM_SPRITE_SHEET";
    subcategory = "regular-grid";
    visualTags.push("sprite-sheet", "grid");
    likelyUsage.push("inventory", "reference");
  } else if (isGrid && rows >= 2 && columns >= 2) {
    category = "CHARACTER_ENEMY_UI_SPRITE_SHEET";
    subcategory = "regular-grid";
    visualTags.push("sprite-sheet", "grid");
    likelyUsage.push("battle", "ui", "reference");
  } else if (aspectRatio > 1.45 && image.width >= 640) {
    category = "ENVIRONMENT_BACKGROUND";
    subcategory = "wide-background";
    visualTags.push("environment", "background");
    likelyUsage.push("title-screen", "battle-background", "hub");
  } else if (aspectRatio >= 0.75 && aspectRatio <= 1.35 && image.width >= 512 && image.height >= 512) {
    category = "HUB_MAP_OR_TILEMAP";
    subcategory = "map-or-square-art";
    visualTags.push("map", "environment");
    likelyUsage.push("hub", "division");
  } else if (image.width <= 256 && image.height <= 256) {
    category = "UI_ASSET";
    subcategory = "small-icon";
    visualTags.push("icon");
    likelyUsage.push("ui", "inventory");
  }

  const qualityScore = scoreImage(image, category, isGrid, megapixels);
  return {
    ...image,
    category,
    subcategory,
    rows,
    columns,
    cellWidth: columns ? Math.floor(image.width / columns) : 0,
    cellHeight: rows ? Math.floor(image.height / rows) : 0,
    confidence: category === "UNKNOWN_REVIEW" ? 0.2 : isGrid ? 0.72 : 0.58,
    qualityScore,
    visualTags,
    likelyUsage,
    duplicateClusterId: null,
  };
}

function estimateGrid(width, height) {
  const candidates = [12, 10, 8, 6, 5, 4, 3, 2];
  for (const count of candidates) {
    if (width % count === 0 && height % count === 0 && Math.abs(width / height - 1) < 0.2) {
      return { rows: count, columns: count };
    }
  }
  return { rows: 0, columns: 0 };
}

function scoreImage(image, category, isGrid, megapixels) {
  const styleFit = image.format === "png" ? 20 : 14;
  const canonFit = category === "UNKNOWN_REVIEW" ? 5 : 14;
  const technical = image.width >= 32 && image.height >= 32 && megapixels <= 12 ? 18 : 9;
  const utility = category === "UNKNOWN_REVIEW" ? 4 : isGrid ? 14 : 10;
  const uniqueness = 7;
  const labelText = 3;
  return Math.min(100, styleFit + canonFit + technical + utility + uniqueness + labelText);
}

function buildDuplicateClusters(images) {
  const clusters = [];
  const seen = new Set();
  for (const image of images) {
    if (seen.has(image.path)) continue;
    const cluster = [image];
    seen.add(image.path);
    for (const other of images) {
      if (seen.has(other.path)) continue;
      if (image.exactHash === other.exactHash || hammingDistance(image.perceptualHash, other.perceptualHash) <= 12) {
        cluster.push(other);
        seen.add(other.path);
      }
    }
    const clusterId = cluster.length > 1 ? `dup-${String(clusters.length + 1).padStart(3, "0")}` : null;
    cluster.forEach((entry) => {
      entry.duplicateClusterId = clusterId;
    });
    clusters.push(cluster);
  }
  return clusters;
}

function hammingDistance(a, b) {
  if (a.length !== b.length) return Number.MAX_SAFE_INTEGER;
  let distance = 0;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) distance += 1;
  }
  return distance;
}

function selectBestAssets(clusters) {
  const selected = new Set();
  for (const cluster of clusters) {
    const best = [...cluster].sort((a, b) => {
      if (b.qualityScore !== a.qualityScore) return b.qualityScore - a.qualityScore;
      return b.width * b.height - a.width * a.height;
    })[0];
    selected.add(best.path);
  }
  return selected;
}

function isSheetCategory(category) {
  return category.includes("SHEET");
}

async function processSheet(image, activeAssets, badSlices) {
  const sheetId = slug(`${categoryPrefix(image.category)}-${path.basename(image.originalName, path.extname(image.originalName))}`);
  const originalPath = await copyToPublic(image.path, `sheets-original/${sheetId}.png`);
  const slicedAssetIds = [];
  const canSlice = image.rows > 1 && image.columns > 1 && image.cellWidth >= 8 && image.cellHeight >= 8;

  if (!canSlice) {
    const badPath = await copyReview(image, "_review/bad-slices", badSlices.length + 1);
    badSlices.push({ ...reviewEntry(image), filePath: badPath, reason: "Irregular or too-small grid; preserved for manual slicing." });
  } else {
    for (let row = 0; row < image.rows; row += 1) {
      for (let column = 0; column < image.columns; column += 1) {
        const assetId = `${sheetId}-row${String(row + 1).padStart(2, "0")}-col${String(column + 1).padStart(2, "0")}`;
        const cropBox = {
          x: column * image.cellWidth,
          y: row * image.cellHeight,
          width: image.cellWidth,
          height: image.cellHeight,
        };
        const outputDir = sliceOutputDir(image.category);
        const outputPublicPath = `${outputDir}/${assetId}.png`;
        await sharp(image.path).extract(cropBox).png({ compressionLevel: 9, palette: false }).toFile(path.join(publicRoot, outputPublicPath));
        slicedAssetIds.push(assetId);
        activeAssets.push(toManifestEntry(image, `/assets/game/${outputPublicPath}`, {
          id: assetId,
          canonicalName: assetId,
          sourceSheetId: sheetId,
          sourceCell: { row: row + 1, column: column + 1 },
          cropBox,
          width: cropBox.width,
          height: cropBox.height,
          subcategory: "sliced-cell",
          likelyUsage: image.category === "ITEM_SPRITE_SHEET" ? ["inventory"] : image.likelyUsage,
        }));
      }
    }
  }

  return {
    id: sheetId,
    originalPath,
    sheetType: image.category,
    rows: image.rows,
    columns: image.columns,
    estimatedCellWidth: image.cellWidth,
    estimatedCellHeight: image.cellHeight,
    hasLabels: false,
    labelCropStrategy: "No label strip was detected automatically; full cells were preserved.",
    slicedAssetIds,
    confidence: image.confidence,
    notes: canSlice ? "Regular grid sliced into individual gameplay cells." : "Preserved for manual review.",
  };
}

function sliceOutputDir(category) {
  if (category === "ITEM_SPRITE_SHEET") return "items/icons";
  if (category === "CYBERPUNK_ITEM_SPRITE_SHEET") return "items/cyberpunk";
  if (category === "CHARACTER_ENEMY_UI_SPRITE_SHEET") return "characters/sprites";
  return "objects";
}

async function copyActive(image) {
  const target = `${activeOutputDir(image.category)}/${slug(`${categoryPrefix(image.category)}-${path.basename(image.originalName, path.extname(image.originalName))}`)}.png`;
  return copyToPublic(image.path, target);
}

function activeOutputDir(category) {
  if (category === "ENVIRONMENT_BACKGROUND") return "environments/battle-backgrounds";
  if (category === "HUB_MAP_OR_TILEMAP") return "environments/maps";
  if (category === "UI_ASSET") return "ui/icons";
  if (category === "PORTRAIT_OR_DIALOGUE_ASSET") return "characters/portraits";
  if (category === "PROMOTIONAL_OR_TITLE_ART") return "title";
  if (category === "ENEMY_OR_BOSS_ART") return "enemies/sprites";
  return "objects";
}

function categoryPrefix(category) {
  return category.toLowerCase().replace(/_/g, "-");
}

async function copyReview(image, dir, index) {
  const name = `${String(index).padStart(3, "0")}-${slug(path.basename(image.originalName, path.extname(image.originalName)))}.png`;
  return copyToPublic(image.path, `${dir}/${name}`);
}

async function copyToPublic(sourcePath, publicRelativePath) {
  const targetPath = path.join(publicRoot, publicRelativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await sharp(sourcePath).png({ compressionLevel: 9, palette: false }).toFile(targetPath);
  return `/assets/game/${publicRelativePath}`;
}

function toManifestEntry(image, filePath, overrides = {}) {
  const width = overrides.width ?? image.width;
  const height = overrides.height ?? image.height;
  return {
    id: overrides.id ?? slug(`${categoryPrefix(image.category)}-${path.basename(image.originalName, path.extname(image.originalName))}`),
    canonicalName: overrides.canonicalName ?? titleCase(path.basename(image.originalName, path.extname(image.originalName))),
    category: image.category,
    subcategory: overrides.subcategory ?? image.subcategory,
    filePath,
    width,
    height,
    aspectRatio: height ? Number((width / height).toFixed(4)) : 1,
    sourceFileOriginalName: image.originalName,
    sourceSheetId: overrides.sourceSheetId ?? null,
    sourceCell: overrides.sourceCell ?? null,
    cropBox: overrides.cropBox ?? null,
    hasLabelVersion: false,
    labelVersionPath: null,
    confidence: image.confidence,
    qualityScore: image.qualityScore,
    visualTags: image.visualTags,
    likelyUsage: overrides.likelyUsage ?? image.likelyUsage,
    duplicateClusterId: image.duplicateClusterId,
    selectedAsBest: true,
    notes: isSheetCategory(image.category) ? "Generated from a regular sprite sheet cell." : "Selected active asset.",
  };
}

function reviewEntry(image) {
  return {
    originalName: image.originalName,
    sourcePath: image.relativePath,
    width: image.width,
    height: image.height,
    category: image.category,
    confidence: image.confidence,
    qualityScore: image.qualityScore,
    duplicateClusterId: image.duplicateClusterId,
  };
}

async function writeManifests(activeAssets, review, spriteSheets, rawCount, classifiedCount) {
  const generatedAt = new Date().toISOString();
  await writeJson(path.join(publicRoot, "asset-manifest.json"), {
    schemaVersion: 1,
    generatedAt,
    source: "scripts/process-assets.mjs",
    assets: activeAssets,
    counts: {
      rawImagesFound: rawCount,
      classified: classifiedCount,
      selectedActive: activeAssets.length,
      spriteSheetsDetected: spriteSheets.length,
      spriteSheetsSliced: spriteSheets.filter((sheet) => sheet.slicedAssetIds.length > 0).length,
      slicedAssetsGenerated: spriteSheets.reduce((sum, sheet) => sum + sheet.slicedAssetIds.length, 0),
    },
    blockers: [],
  });
  await writeJson(path.join(publicRoot, "_review", "review-manifest.json"), {
    schemaVersion: 1,
    generatedAt,
    source: "scripts/process-assets.mjs",
    ...review,
  });
  await writeTs("src/data/assetManifest.ts", renderAssetManifestTs(activeAssets, rawCount));
  await writeTs("src/data/spriteSheetRegistry.ts", renderSpriteSheetRegistryTs(spriteSheets));
}

async function writeEmptyOutputs() {
  const generatedAt = new Date().toISOString();
  await writeJson(path.join(publicRoot, "asset-manifest.json"), {
    schemaVersion: 1,
    generatedAt,
    source: "Asset ZIP was not available in the workspace during this pass.",
    assets: [],
    counts: {
      rawImagesFound: 0,
      classified: 0,
      selectedActive: 0,
      spriteSheetsDetected: 0,
      spriteSheetsSliced: 0,
      slicedAssetsGenerated: 0,
    },
    blockers: [
      "No ZIP file or source image files were present in the configured import paths.",
    ],
  });
  await writeJson(path.join(publicRoot, "_review", "review-manifest.json"), {
    schemaVersion: 1,
    generatedAt,
    source: "Asset ZIP was not available in the workspace during this pass.",
    duplicates: [],
    unknown: [],
    rejected: [],
    badSlices: [],
    blockers: [
      "No source image archive was available, so no duplicate, unknown, rejected, or bad-slice files could be populated.",
    ],
  });
  await writeDuplicateLog([], new Set());
}

async function writeDuplicateLog(clusters, selectedPaths) {
  const lines = ["# Duplicate Decision Log", ""];
  if (clusters.filter((cluster) => cluster.length > 1).length === 0) {
    lines.push("No duplicate or near-duplicate clusters were available for decision logging.");
  }
  for (const [index, cluster] of clusters.entries()) {
    if (cluster.length <= 1) continue;
    lines.push(`## dup-${String(index + 1).padStart(3, "0")}`);
    for (const image of cluster) {
      const selected = selectedPaths.has(image.path) ? "selected" : "review/duplicate";
      lines.push(`- ${selected}: ${image.relativePath} (${image.width}x${image.height}, score ${image.qualityScore})`);
    }
    lines.push("");
  }
  await fs.writeFile(path.join(publicRoot, "_review", "duplicate-decision-log.md"), `${lines.join("\n")}\n`);
}

function renderAssetManifestTs(activeAssets, rawCount) {
  return `export interface SourceCell {
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

export const activeAssetManifest: GameAssetEntry[] = ${JSON.stringify(activeAssets, null, 2)};

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
  importedImageCount: ${rawCount},
  activeAssetCount: activeAssetManifest.length,
  blocker: ${activeAssets.length === 0 ? JSON.stringify("No attached asset ZIP or source images were available in this workspace during integration.") : "null"},
};
`;
}

function renderSpriteSheetRegistryTs(spriteSheets) {
  return `export interface SpriteSheetRegistryEntry {
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

export const spriteSheetRegistry: SpriteSheetRegistryEntry[] = ${JSON.stringify(spriteSheets, null, 2)};

export const spriteSheetImportStatus = {
  detectedSheetCount: spriteSheetRegistry.length,
  slicedSheetCount: spriteSheetRegistry.filter((sheet) => sheet.slicedAssetIds.length > 0).length,
  generatedSpriteCount: spriteSheetRegistry.reduce((sum, sheet) => sum + sheet.slicedAssetIds.length, 0),
  blocker: ${spriteSheets.length === 0 ? JSON.stringify("No source sprite sheets were present in the workspace to classify or slice.") : "null"},
};
`;
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeTs(relativePath, content) {
  await fs.writeFile(path.join(workspace, relativePath), content);
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function titleCase(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
