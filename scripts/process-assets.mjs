import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const WORKSPACE_ROOT = process.cwd();
const DEFAULT_SOURCE_ROOT = path.join(WORKSPACE_ROOT, "tmp", "imported-assets");
const PUBLIC_ROOT = path.join(WORKSPACE_ROOT, "public", "assets", "game");
const REVIEW_ROOT = path.join(PUBLIC_ROOT, "_review");
const MANIFEST_PATH = path.join(PUBLIC_ROOT, "asset-manifest.json");
const REVIEW_MANIFEST_PATH = path.join(REVIEW_ROOT, "review-manifest.json");
const RAW_INVENTORY_PATH = path.join(REVIEW_ROOT, "raw-image-inventory.json");
const DUPLICATE_LOG_PATH = path.join(REVIEW_ROOT, "duplicate-decisions.md");
const ASSET_TS_PATH = path.join(WORKSPACE_ROOT, "src", "data", "assetManifest.ts");
const SHEET_TS_PATH = path.join(WORKSPACE_ROOT, "src", "data", "spriteSheetRegistry.ts");
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const GAME_DIRS = [
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
  "characters/reference-cells",
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
  "ui/reference-cells",
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

const toPosix = value => value.split(path.sep).join("/");

const publicPath = absolutePath => `/${toPosix(path.relative(path.join(WORKSPACE_ROOT, "public"), absolutePath))}`;

const kebab = value =>
  value
    .replace(/\.[^.]+$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const ensureDirs = async () => {
  await Promise.all(GAME_DIRS.map(dir => fs.mkdir(path.join(PUBLIC_ROOT, dir), { recursive: true })));
  await fs.mkdir(DEFAULT_SOURCE_ROOT, { recursive: true });
};

const maybeExtractZip = async inputPath => {
  if (path.extname(inputPath).toLowerCase() !== ".zip") return inputPath;
  await fs.rm(DEFAULT_SOURCE_ROOT, { recursive: true, force: true });
  await fs.mkdir(DEFAULT_SOURCE_ROOT, { recursive: true });
  execFileSync("unzip", ["-o", inputPath, "-d", DEFAULT_SOURCE_ROOT], { stdio: "inherit" });
  return DEFAULT_SOURCE_ROOT;
};

const scanImages = async root => {
  const entries = [];

  const walk = async dir => {
    let children = [];
    try {
      children = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const child of children) {
      const childPath = path.join(dir, child.name);
      if (child.isDirectory()) {
        await walk(childPath);
      } else if (IMAGE_EXTENSIONS.has(path.extname(child.name).toLowerCase())) {
        entries.push(childPath);
      }
    }
  };

  await walk(root);
  return entries;
};

const sha256File = async filePath => {
  const data = await fs.readFile(filePath);
  return createHash("sha256").update(data).digest("hex");
};

const dHash = async filePath => {
  const { data } = await sharp(filePath)
    .resize(9, 8, { fit: "fill", kernel: "nearest" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let bits = "";
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      bits += data[y * 9 + x] > data[y * 9 + x + 1] ? "1" : "0";
    }
  }
  return bits;
};

const hamming = (a, b) => {
  let distance = 0;
  for (let index = 0; index < Math.min(a.length, b.length); index++) {
    if (a[index] !== b[index]) distance++;
  }
  return distance + Math.abs(a.length - b.length);
};

const detectGrid = ({ width = 0, height = 0 }) => {
  const candidates = [
    [10, 10],
    [8, 8],
    [6, 6],
    [5, 5],
    [4, 4],
    [12, 8],
    [8, 12],
    [4, 3],
    [3, 4],
    [4, 2],
    [2, 4],
  ];

  const valid = candidates
    .map(([columns, rows]) => ({
      rows,
      columns,
      cellWidth: width / columns,
      cellHeight: height / rows,
      exact: width % columns === 0 && height % rows === 0,
    }))
    .filter(candidate =>
      candidate.cellWidth >= 16 &&
      candidate.cellHeight >= 16 &&
      candidate.cellWidth <= 256 &&
      candidate.cellHeight <= 256 &&
      Math.abs(candidate.cellWidth - Math.round(candidate.cellWidth)) < 0.01 &&
      Math.abs(candidate.cellHeight - Math.round(candidate.cellHeight)) < 0.01
    )
    .sort((a, b) => {
      const aScore = (a.exact ? 2 : 0) + (a.rows === 10 && a.columns === 10 ? 2 : 0);
      const bScore = (b.exact ? 2 : 0) + (b.rows === 10 && b.columns === 10 ? 2 : 0);
      return bScore - aScore;
    });

  if (valid.length === 0) return null;
  const best = valid[0];
  return {
    rows: best.rows,
    columns: best.columns,
    cellWidth: Math.round(best.cellWidth),
    cellHeight: Math.round(best.cellHeight),
    confidence: best.exact ? 0.78 : 0.62,
  };
};

const classifyImage = ({ metadata, grid }) => {
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const aspectRatio = width && height ? width / height : 1;
  const hasAlpha = metadata.hasAlpha ?? metadata.channels === 4;

  if (grid && grid.rows >= 8 && grid.columns >= 8) {
    const sheetType = grid.rows === 10 && grid.columns === 10 && grid.cellWidth <= 96
      ? "ITEM_SPRITE_SHEET"
      : "CHARACTER_ENEMY_UI_SPRITE_SHEET";
    return {
      category: sheetType,
      subcategory: sheetType === "ITEM_SPRITE_SHEET" ? "sheets" : "sprites",
      confidence: grid.confidence,
      likelyUsage: sheetType === "ITEM_SPRITE_SHEET" ? ["inventory", "reference"] : ["battle", "party", "ui", "reference"],
      visualTags: sheetType === "ITEM_SPRITE_SHEET" ? ["item", "sheet", "grid"] : ["sprite", "sheet", "grid"],
    };
  }

  if (width >= 640 && height >= 320 && aspectRatio >= 1.25) {
    return {
      category: "ENVIRONMENT_BACKGROUND",
      subcategory: aspectRatio > 1.7 ? "battle-backgrounds" : "division-realms",
      confidence: 0.64,
      likelyUsage: ["hub", "battle", "division"],
      visualTags: ["environment", "nexus"],
    };
  }

  if (width >= 384 && height >= 384 && aspectRatio > 0.75 && aspectRatio < 1.35) {
    return {
      category: "HUB_MAP_OR_TILEMAP",
      subcategory: "maps",
      confidence: 0.58,
      likelyUsage: ["hub", "exploration"],
      visualTags: ["map", "hub"],
    };
  }

  if (height >= width * 1.15 && width >= 160) {
    return {
      category: "PORTRAIT_OR_DIALOGUE_ASSET",
      subcategory: "portraits",
      confidence: 0.54,
      likelyUsage: ["party", "dialogue"],
      visualTags: ["portrait", "character"],
    };
  }

  if (hasAlpha || width <= 256 || height <= 256) {
    return {
      category: "UI_ASSET",
      subcategory: "icons",
      confidence: 0.5,
      likelyUsage: ["hud", "inventory", "ui"],
      visualTags: ["ui", "icon"],
    };
  }

  return {
    category: "UNKNOWN_REVIEW",
    subcategory: "unknown",
    confidence: 0.25,
    likelyUsage: ["review"],
    visualTags: ["unknown"],
  };
};

const scoreImage = ({ metadata, classification, grid }) => {
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const technical = width >= 32 && height >= 32 ? 16 : 8;
  const style = metadata.format === "png" ? 18 : 13;
  const canon = classification.visualTags.includes("nexus") || classification.visualTags.includes("item") ? 16 : 12;
  const gameplay = classification.category === "UNKNOWN_REVIEW" ? 4 : 11;
  const uniqueness = 8;
  const label = grid ? 3 : 5;
  return Math.min(100, style + canon + technical + gameplay + uniqueness + label);
};

const targetDirFor = classification => {
  if (classification.category === "ITEM_SPRITE_SHEET") return "items/sheets";
  if (classification.category === "CYBERPUNK_ITEM_SPRITE_SHEET") return "items/cyberpunk";
  if (classification.category === "CHARACTER_ENEMY_UI_SPRITE_SHEET") return "characters/sprites";
  if (classification.category === "PLAYABLE_CHARACTER_SHEET") return "characters/playable";
  if (classification.category === "ENEMY_OR_BOSS_ART") return "enemies/sprites";
  if (classification.category === "ENVIRONMENT_BACKGROUND") return `environments/${classification.subcategory}`;
  if (classification.category === "HUB_MAP_OR_TILEMAP") return "environments/maps";
  if (classification.category === "UI_ASSET") return "ui/icons";
  if (classification.category === "PORTRAIT_OR_DIALOGUE_ASSET") return "characters/portraits";
  if (classification.category === "PROMOTIONAL_OR_TITLE_ART") return "title";
  return "_review/unknown";
};

const canonicalPrefixFor = classification => {
  if (classification.category === "ITEM_SPRITE_SHEET") return "item-sheet-collective-branded";
  if (classification.category === "CYBERPUNK_ITEM_SPRITE_SHEET") return "item-sheet-cyberpunk-tech";
  if (classification.category === "CHARACTER_ENEMY_UI_SPRITE_SHEET") return "character-enemy-ui-sheet";
  if (classification.category === "PLAYABLE_CHARACTER_SHEET") return "character-playable-sheet";
  if (classification.category === "ENEMY_OR_BOSS_ART") return "enemy-boss-art";
  if (classification.category === "ENVIRONMENT_BACKGROUND") return "environment-nexus-background";
  if (classification.category === "HUB_MAP_OR_TILEMAP") return "map-nexus-hub";
  if (classification.category === "UI_ASSET") return "ui-asset";
  if (classification.category === "PORTRAIT_OR_DIALOGUE_ASSET") return "portrait-dialogue";
  if (classification.category === "PROMOTIONAL_OR_TITLE_ART") return "title-promotional";
  return "unknown-review";
};

const writeJson = async (filePath, value) => {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const copyFileAsPng = async (sourcePath, targetPath) => {
  if (path.extname(targetPath).toLowerCase() === ".png") {
    await sharp(sourcePath).png({ compressionLevel: 9 }).toFile(targetPath);
  } else {
    await fs.copyFile(sourcePath, targetPath);
  }
};

const buildRawRecord = async (filePath, sourceRoot) => {
  const [metadata, stats, exactHash, perceptualHash, fileStats] = await Promise.all([
    sharp(filePath).metadata(),
    sharp(filePath).stats().catch(() => null),
    sha256File(filePath),
    dHash(filePath).catch(() => ""),
    fs.stat(filePath),
  ]);
  const grid = detectGrid(metadata);
  const classification = classifyImage({ metadata, stats, grid });
  const qualityScore = scoreImage({ metadata, classification, grid });

  return {
    sourcePath: filePath,
    sourceRelativePath: toPosix(path.relative(sourceRoot, filePath)),
    sourceFileOriginalName: path.basename(filePath),
    extension: path.extname(filePath).toLowerCase(),
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    aspectRatio: metadata.width && metadata.height ? Number((metadata.width / metadata.height).toFixed(4)) : 0,
    format: metadata.format ?? "unknown",
    sizeBytes: fileStats.size,
    sha256: exactHash,
    perceptualHash,
    grid,
    classification,
    qualityScore,
  };
};

const buildDuplicateClusters = records => {
  const clusters = [];
  const exactGroups = new Map();
  records.forEach(record => {
    const list = exactGroups.get(record.sha256) ?? [];
    list.push(record);
    exactGroups.set(record.sha256, list);
  });

  for (const group of exactGroups.values()) {
    if (group.length > 1) {
      clusters.push({ id: `dup-exact-${clusters.length + 1}`, kind: "exact duplicate", records: group });
    }
  }

  const clustered = new Set(clusters.flatMap(cluster => cluster.records.map(record => record.sourcePath)));
  for (const record of records) {
    if (clustered.has(record.sourcePath) || !record.perceptualHash) continue;
    const similar = records.filter(candidate =>
      candidate.sourcePath !== record.sourcePath &&
      !clustered.has(candidate.sourcePath) &&
      candidate.perceptualHash &&
      candidate.classification.category === record.classification.category &&
      Math.abs(candidate.aspectRatio - record.aspectRatio) < 0.08 &&
      hamming(candidate.perceptualHash, record.perceptualHash) <= 8
    );
    if (similar.length > 0) {
      const clusterRecords = [record, ...similar];
      clusterRecords.forEach(item => clustered.add(item.sourcePath));
      clusters.push({ id: `dup-near-${clusters.length + 1}`, kind: "near duplicate", records: clusterRecords });
    }
  }

  return clusters;
};

const bestRecord = records =>
  [...records].sort((a, b) =>
    b.qualityScore - a.qualityScore ||
    (b.width * b.height) - (a.width * a.height) ||
    a.sourceRelativePath.localeCompare(b.sourceRelativePath)
  )[0];

const sliceSheet = async ({ record, outputBaseName, sheetId }) => {
  if (!record.grid || record.grid.confidence < 0.6) {
    return {
      registry: null,
      assets: [],
      badSlices: [{ source: record.sourceRelativePath, reason: "No regular grid detected with sufficient confidence." }],
    };
  }

  const assets = [];
  const badSlices = [];
  const slicedIds = [];
  const { rows, columns, cellWidth, cellHeight } = record.grid;
  const iconDir = record.classification.category === "ITEM_SPRITE_SHEET"
    ? path.join(PUBLIC_ROOT, "items", "icons")
    : path.join(PUBLIC_ROOT, "characters", "sprites");
  const referenceDir = record.classification.category === "ITEM_SPRITE_SHEET"
    ? path.join(PUBLIC_ROOT, "items", "reference-cells")
    : path.join(PUBLIC_ROOT, "characters", "reference-cells");

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const rowLabel = String(row + 1).padStart(2, "0");
      const columnLabel = String(column + 1).padStart(2, "0");
      const idPrefix = record.classification.category === "ITEM_SPRITE_SHEET"
        ? "item-collective-branded"
        : "character-sheet";
      const id = `${idPrefix}-row${rowLabel}-col${columnLabel}`;
      const cropBox = {
        x: column * cellWidth,
        y: row * cellHeight,
        width: cellWidth,
        height: cellHeight,
      };
      const iconPath = path.join(iconDir, `${id}.png`);
      const referencePath = path.join(referenceDir, `${id}-reference.png`);

      try {
        const cell = sharp(record.sourcePath).extract({
          left: cropBox.x,
          top: cropBox.y,
          width: cropBox.width,
          height: cropBox.height,
        });
        await cell.clone().png({ compressionLevel: 9 }).toFile(referencePath);
        await cell
          .clone()
          .trim({ background: "#ffffff", threshold: 10 })
          .png({ compressionLevel: 9 })
          .toFile(iconPath);

        slicedIds.push(id);
        assets.push({
          id,
          canonicalName: id,
          category: record.classification.category,
          subcategory: "icons",
          filePath: publicPath(iconPath),
          width: cellWidth,
          height: cellHeight,
          aspectRatio: Number((cellWidth / cellHeight).toFixed(4)),
          sourceFileOriginalName: record.sourceFileOriginalName,
          confidence: Number(Math.min(0.9, record.classification.confidence + 0.08).toFixed(2)),
          qualityScore: record.qualityScore,
          visualTags: [...new Set([...record.classification.visualTags, "sliced", rowLabel, columnLabel])],
          likelyUsage: record.classification.category === "ITEM_SPRITE_SHEET" ? ["inventory"] : ["battle", "party"],
          duplicateClusterId: null,
          selectedAsBest: true,
          notes: "Automatically sliced from a regular grid sheet. Inspect reference crop if labels were present.",
          sourceSheetId: sheetId,
          sourceCell: { row: row + 1, column: column + 1 },
          cropBox,
          hasLabelVersion: true,
          labelVersionPath: publicPath(referencePath),
        });
      } catch (error) {
        badSlices.push({
          source: record.sourceRelativePath,
          cell: { row: row + 1, column: column + 1 },
          reason: error instanceof Error ? error.message : "Unknown slicing error",
        });
      }
    }
  }

  return {
    registry: {
      id: sheetId,
      originalPath: `/assets/game/sheets-original/${outputBaseName}.png`,
      sheetType: record.classification.category,
      rows,
      columns,
      estimatedCellWidth: cellWidth,
      estimatedCellHeight: cellHeight,
      hasLabels: false,
      labelCropStrategy: "Full reference crop saved next to trimmed gameplay crop; labels are not auto-detected yet.",
      slicedAssetIds: slicedIds,
      confidence: record.grid.confidence,
      notes: badSlices.length > 0 ? `${badSlices.length} cells failed during automatic slicing.` : "Regular grid sliced successfully.",
    },
    assets,
    badSlices,
  };
};

const writeAssetManifestTs = async entries => {
  const source = `export type GameAssetCategory =
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

export const assetManifest: GameAssetManifestEntry[] = ${JSON.stringify(entries, null, 2)};

export const activeAssetManifest = assetManifest.filter(asset => asset.selectedAsBest);

export const assetById: Record<string, GameAssetManifestEntry> =
  Object.fromEntries(assetManifest.map(asset => [asset.id, asset]));
`;
  await fs.writeFile(ASSET_TS_PATH, source);
};

const writeSpriteSheetRegistryTs = async entries => {
  const source = `export interface SpriteSheetRegistryEntry {
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

export const spriteSheetRegistry: SpriteSheetRegistryEntry[] = ${JSON.stringify(entries, null, 2)};
`;
  await fs.writeFile(SHEET_TS_PATH, source);
};

const writeDuplicateLog = async clusters => {
  const lines = ["# Duplicate Decision Log", ""];
  if (clusters.length === 0) {
    lines.push("No exact or near-duplicate clusters were detected.");
  }
  for (const cluster of clusters) {
    const selected = bestRecord(cluster.records);
    lines.push(`## ${cluster.id}`);
    lines.push(`- Type: ${cluster.kind}`);
    lines.push(`- Selected: ${selected.sourceRelativePath}`);
    lines.push("- Non-selected:");
    cluster.records
      .filter(record => record.sourcePath !== selected.sourcePath)
      .forEach(record => lines.push(`  - ${record.sourceRelativePath}`));
    lines.push(`- Reason: highest structural quality score (${selected.qualityScore}) with best usable resolution.`);
    lines.push("");
  }
  await fs.writeFile(DUPLICATE_LOG_PATH, `${lines.join("\n")}\n`);
};

const main = async () => {
  await ensureDirs();
  const rawInput = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SOURCE_ROOT;
  const sourceRoot = await maybeExtractZip(rawInput);
  const imagePaths = await scanImages(sourceRoot);

  if (imagePaths.length === 0) {
    const emptyReview = {
      generatedAt: new Date().toISOString(),
      sourceRoot: path.relative(WORKSPACE_ROOT, sourceRoot),
      status: "blocked-no-source-assets",
      summary: {
        imagesFound: 0,
        classified: 0,
        selectedActive: 0,
        duplicates: 0,
        unknown: 0,
        rejected: 0,
        spriteSheetsDetected: 0,
        spriteSheetsSliced: 0,
        individualSpritesGenerated: 0,
      },
      duplicates: [],
      unknown: [],
      rejected: [],
      badSlices: [],
      notes: ["No image files were found. Extract the asset ZIP into tmp/imported-assets or pass a ZIP/path to this script."],
    };
    await writeJson(MANIFEST_PATH, []);
    await writeJson(REVIEW_MANIFEST_PATH, emptyReview);
    await writeJson(RAW_INVENTORY_PATH, []);
    await writeDuplicateLog([]);
    await writeAssetManifestTs([]);
    await writeSpriteSheetRegistryTs([]);
    console.log("No image assets found; empty manifests written.");
    return;
  }

  const records = await Promise.all(imagePaths.map(filePath => buildRawRecord(filePath, sourceRoot)));
  const duplicateClusters = buildDuplicateClusters(records);
  const selectedPaths = new Set(records.map(record => record.sourcePath));
  const duplicateReview = [];

  for (const cluster of duplicateClusters) {
    const selected = bestRecord(cluster.records);
    cluster.records.forEach(record => {
      if (record.sourcePath !== selected.sourcePath) {
        selectedPaths.delete(record.sourcePath);
        duplicateReview.push({
          clusterId: cluster.id,
          kind: cluster.kind,
          selected: selected.sourceRelativePath,
          rejected: record.sourceRelativePath,
          reason: "Lower structural quality score or less usable resolution than selected cluster member.",
        });
      }
    });
  }

  const selectedRecords = records.filter(record => selectedPaths.has(record.sourcePath));
  const manifestEntries = [];
  const sheetRegistryEntries = [];
  const unknown = [];
  const rejected = [];
  const badSlices = [];
  let sequence = 0;

  for (const record of selectedRecords) {
    if (record.classification.category === "UNKNOWN_REVIEW") {
      const targetPath = path.join(REVIEW_ROOT, "unknown", record.sourceFileOriginalName);
      await fs.copyFile(record.sourcePath, targetPath);
      unknown.push({ source: record.sourceRelativePath, target: publicPath(targetPath), reason: "Low confidence visual classification." });
      continue;
    }

    sequence++;
    const outputBaseName = `${canonicalPrefixFor(record.classification)}-${String(sequence).padStart(3, "0")}`;
    const targetDir = path.join(PUBLIC_ROOT, targetDirFor(record.classification));
    const targetPath = path.join(targetDir, `${outputBaseName}.png`);
    await copyFileAsPng(record.sourcePath, targetPath);

    const duplicateCluster = duplicateClusters.find(cluster =>
      cluster.records.some(item => item.sourcePath === record.sourcePath)
    );

    const entry = {
      id: outputBaseName,
      canonicalName: outputBaseName,
      category: record.classification.category,
      subcategory: record.classification.subcategory,
      filePath: publicPath(targetPath),
      width: record.width,
      height: record.height,
      aspectRatio: record.aspectRatio,
      sourceFileOriginalName: record.sourceFileOriginalName,
      confidence: record.classification.confidence,
      qualityScore: record.qualityScore,
      visualTags: record.classification.visualTags,
      likelyUsage: record.classification.likelyUsage,
      duplicateClusterId: duplicateCluster?.id ?? null,
      selectedAsBest: true,
      notes: "Selected automatically from structural audit; manual visual QA recommended for final canon naming.",
    };
    manifestEntries.push(entry);

    if (record.grid) {
      const sheetOriginalPath = path.join(PUBLIC_ROOT, "sheets-original", `${outputBaseName}.png`);
      await copyFileAsPng(record.sourcePath, sheetOriginalPath);
      const sheetId = `sheet-${outputBaseName}`;
      const result = await sliceSheet({ record, outputBaseName, sheetId });
      if (result.registry) sheetRegistryEntries.push(result.registry);
      manifestEntries.push(...result.assets);
      badSlices.push(...result.badSlices);
    }
  }

  for (const item of duplicateReview) {
    const record = records.find(candidate => candidate.sourceRelativePath === item.rejected);
    if (!record) continue;
    const targetPath = path.join(REVIEW_ROOT, "duplicates", `${item.clusterId}-${record.sourceFileOriginalName}`);
    await fs.copyFile(record.sourcePath, targetPath);
  }

  records
    .filter(record => !selectedPaths.has(record.sourcePath))
    .forEach(record => rejected.push({ source: record.sourceRelativePath, reason: "Duplicate or near-duplicate non-selected candidate." }));

  const reviewManifest = {
    generatedAt: new Date().toISOString(),
    sourceRoot: path.relative(WORKSPACE_ROOT, sourceRoot),
    status: "processed",
    summary: {
      imagesFound: records.length,
      classified: records.length,
      selectedActive: manifestEntries.filter(entry => !entry.sourceSheetId).length,
      duplicates: duplicateReview.length,
      unknown: unknown.length,
      rejected: rejected.length,
      spriteSheetsDetected: records.filter(record => record.grid).length,
      spriteSheetsSliced: sheetRegistryEntries.length,
      individualSpritesGenerated: manifestEntries.filter(entry => entry.sourceSheetId).length,
    },
    duplicates: duplicateReview,
    unknown,
    rejected,
    badSlices,
    notes: [
      "Classification is structural and hash-assisted. Manual visual QA remains required before final content locking.",
      "Original source assets are preserved in tmp/imported-assets; source sheets are copied to public/assets/game/sheets-original.",
    ],
  };

  await writeJson(MANIFEST_PATH, manifestEntries);
  await writeJson(REVIEW_MANIFEST_PATH, reviewManifest);
  await writeJson(RAW_INVENTORY_PATH, records);
  await writeDuplicateLog(duplicateClusters);
  await writeAssetManifestTs(manifestEntries);
  await writeSpriteSheetRegistryTs(sheetRegistryEntries);
  console.log(`Processed ${records.length} image asset(s). Wrote ${manifestEntries.length} manifest entries.`);
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
