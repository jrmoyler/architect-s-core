/**
 * process-assets.mjs
 * The Architect's Ascendance — Asset Pipeline
 *
 * Run: node scripts/process-assets.mjs
 *
 * What it does:
 *  1. Scans source folder for all PNG/JPG/GIF/WEBP images
 *  2. Reads dimensions via sharp
 *  3. Classifies each image (sprite sheet, background, character, etc.)
 *  4. Detects duplicates via perceptual hash (pHash via pixel sampling)
 *  5. Copies originals to sheets-original/
 *  6. Copies classified non-sheet assets to category folders
 *  7. Slices uniform-grid sprite sheets into individual cells (nearest-neighbor)
 *  8. Writes asset-manifest.json
 *  9. Writes a processing log
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// ── PATHS ──────────────────────────────────────────────────────────────────
const SOURCE_DIR = "C:\\Users\\Student\\Downloads\\The Architects Acendence JRPG-3-001\\The Architects Acendence JRPG";
const REPO_ROOT  = path.resolve(".");
const PUBLIC_GAME = path.join(REPO_ROOT, "public", "assets", "game");
const ORIGINALS  = path.join(PUBLIC_GAME, "sheets-original");
const MANIFEST_PATH = path.join(PUBLIC_GAME, "asset-manifest.json");
const LOG_PATH   = path.join(REPO_ROOT, "ASSET_PROCESS_LOG.md");

const FOLDERS = {
  ITEM_SPRITE_SHEET:           path.join(PUBLIC_GAME, "items", "sheets"),
  CYBERPUNK_ITEM_SPRITE_SHEET: path.join(PUBLIC_GAME, "items", "cyberpunk"),
  CHARACTER_ENEMY_UI_SPRITE_SHEET: path.join(PUBLIC_GAME, "characters", "sprites"),
  PLAYABLE_CHARACTER_SHEET:    path.join(PUBLIC_GAME, "characters", "turnarounds"),
  ENEMY_OR_BOSS_ART:           path.join(PUBLIC_GAME, "enemies", "sprites"),
  ENVIRONMENT_BACKGROUND:      path.join(PUBLIC_GAME, "environments", "battle-backgrounds"),
  HUB_MAP_OR_TILEMAP:          path.join(PUBLIC_GAME, "environments", "hubs"),
  UI_ASSET:                    path.join(PUBLIC_GAME, "ui", "hud"),
  PORTRAIT_OR_DIALOGUE_ASSET:  path.join(PUBLIC_GAME, "characters", "portraits"),
  PROMOTIONAL_OR_TITLE_ART:    path.join(PUBLIC_GAME, "title"),
  UNKNOWN_REVIEW:              path.join(PUBLIC_GAME, "_review", "unknown"),
};

const SLICED_ITEMS   = path.join(PUBLIC_GAME, "items", "icons");
const SLICED_CHARS   = path.join(PUBLIC_GAME, "characters", "sprites");
const SLICED_ENEMIES = path.join(PUBLIC_GAME, "enemies", "regular");
const REF_CELLS      = path.join(PUBLIC_GAME, "items", "reference-cells");
const BAD_SLICES     = path.join(PUBLIC_GAME, "_review", "bad-slices");
const DUPLICATES_DIR = path.join(PUBLIC_GAME, "_review", "duplicates");

// Ensure all dirs exist
for (const d of Object.values(FOLDERS)) fs.mkdirSync(d, { recursive: true });
for (const d of [SLICED_ITEMS, SLICED_CHARS, SLICED_ENEMIES, REF_CELLS, BAD_SLICES, DUPLICATES_DIR, ORIGINALS])
  fs.mkdirSync(d, { recursive: true });

// ── HELPERS ────────────────────────────────────────────────────────────────
function kebab(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function copyFile(src, dest) {
  try { fs.copyFileSync(src, dest); return true; }
  catch (e) { return false; }
}

function pathRelativeToPublic(abs) {
  const idx = abs.indexOf(path.join("public", "assets"));
  if (idx === -1) return abs;
  return "/" + abs.slice(idx).replace(/\\/g, "/");
}

// Simple 8x8 average-hash for dedup
async function computeHash(filePath) {
  try {
    const { data, info } = await sharp(filePath)
      .resize(8, 8, { fit: "fill", kernel: "nearest" })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const avg = data.reduce((s, v) => s + v, 0) / data.length;
    let hash = "";
    for (let i = 0; i < 64; i++) hash += data[i] >= avg ? "1" : "0";
    return hash;
  } catch { return null; }
}

function hammingDistance(a, b) {
  if (!a || !b || a.length !== b.length) return 999;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

// ── CLASSIFICATION HEURISTICS ──────────────────────────────────────────────
// Returns one of the 11 category keys + a confidence 0-100
function classify(filename, w, h, fileSizeKB) {
  const name = filename.toLowerCase();
  const ar = w / h;
  const px = w * h;

  // --- filename keyword signals ---
  const isPortrait = /portrait|face|bust|dialogue|dialog|headshot/.test(name);
  const isTitle = /title|splash|logo|menu|intro|promotional|promo|cover/.test(name);
  const isHub = /hub|map|world|overworld|town|nexus|spire|route/.test(name);
  const isEnv = /bg|background|arena|sky|city|skyline|realm|division|environ|cosmic|stage|battle.?bg|floor/.test(name);
  const isEnemy = /enemy|boss|monster|creature|foe|specter|goblin|dragon|villain|titan/.test(name);
  const isChar = /character|char|hero|player|playable|turnaround|walk/.test(name);
  const isCyber = /cyber|neon|circuit|tech|glitch|pixel.*cyber|cp\d/.test(name);
  const isUI = /ui|icon|hud|button|cursor|frame|bar|meter|menu|interface|gauge/.test(name);

  // UUID-named files (AI-generated) — rely purely on dimensions
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}/.test(filename);
  const isTimestamp = /^\d{10,16}\.png/.test(filename);
  const isFilePrefix = /^file_/.test(filename);

  // --- dimension-based signals ---
  // Large square or near-square with high px → likely background or promotional
  const isLarge = w >= 1024 || h >= 768;
  const isWide = ar > 1.6;
  const isTall = ar < 0.7;
  const isSquareish = ar >= 0.85 && ar <= 1.18;

  // Grid-sheet heuristics: square with moderate resolution
  // SNES-style sheets: often 320x320 (10x10 of 32px), 160x160 (10x10 of 16px)
  // Or larger: 512x512, 480x480, 640x640
  const maybeSheet = isSquareish && w >= 160 && w <= 1024 && (w % 32 === 0 || w % 16 === 0 || w % 48 === 0);

  // Very large (poster/promotional art)
  const isPromo = (w >= 1200 || h >= 900) && !maybeSheet;

  // Scoring: pick best category
  if (isTitle) return { cat: "PROMOTIONAL_OR_TITLE_ART", conf: 82 };
  if (isPortrait) return { cat: "PORTRAIT_OR_DIALOGUE_ASSET", conf: 80 };
  if (isHub) return { cat: "HUB_MAP_OR_TILEMAP", conf: 80 };
  if (isUI) return { cat: "UI_ASSET", conf: 78 };
  if (isChar) return { cat: "PLAYABLE_CHARACTER_SHEET", conf: 75 };
  if (isEnemy) return { cat: "ENEMY_OR_BOSS_ART", conf: 75 };
  if (isEnv) return { cat: "ENVIRONMENT_BACKGROUND", conf: 75 };
  if (isCyber && maybeSheet) return { cat: "CYBERPUNK_ITEM_SPRITE_SHEET", conf: 72 };

  // Dimension-driven for anonymous files
  if (isPromo && isWide) return { cat: "ENVIRONMENT_BACKGROUND", conf: 65 };
  if (isPromo) return { cat: "PROMOTIONAL_OR_TITLE_ART", conf: 60 };

  if (maybeSheet && w <= 512) {
    // Small sheets (≤512) — likely item sheets
    if (isCyber) return { cat: "CYBERPUNK_ITEM_SPRITE_SHEET", conf: 68 };
    return { cat: "ITEM_SPRITE_SHEET", conf: 65 };
  }
  if (maybeSheet && w > 512) {
    // Larger sheets — character/enemy/UI mix
    return { cat: "CHARACTER_ENEMY_UI_SPRITE_SHEET", conf: 62 };
  }

  if (isWide && isLarge) return { cat: "ENVIRONMENT_BACKGROUND", conf: 60 };
  if (isWide) return { cat: "ENVIRONMENT_BACKGROUND", conf: 55 };

  if (isTall && h > 200) return { cat: "PLAYABLE_CHARACTER_SHEET", conf: 55 };

  // Medium images with ambiguous aspect
  if (isSquareish && px < 90000) return { cat: "PORTRAIT_OR_DIALOGUE_ASSET", conf: 50 };
  if (isSquareish && px >= 90000) return { cat: "ENVIRONMENT_BACKGROUND", conf: 50 };

  return { cat: "UNKNOWN_REVIEW", conf: 30 };
}

// Estimate grid dimensions for a sheet
function estimateGrid(w, h, labelHeight = 0) {
  const contentH = h - labelHeight;
  const candidates = [
    [10, 10], [8, 8], [8, 10], [10, 8], [6, 6], [5, 5],
    [4, 4], [4, 8], [8, 4], [6, 8], [8, 6],
    [12, 12], [16, 16], [4, 10], [10, 4],
  ];
  // Pick the grid where cellW and cellH are integers (or close)
  for (const [cols, rows] of candidates) {
    const cw = w / cols;
    const ch = contentH / rows;
    if (
      Math.abs(cw - Math.round(cw)) < 1 &&
      Math.abs(ch - Math.round(ch)) < 1 &&
      cw >= 12 && ch >= 12
    ) {
      return { cols, rows, cellW: Math.round(cw), cellH: Math.round(ch) };
    }
  }
  // Fallback: assume 10x10
  const cw = Math.floor(w / 10);
  const ch = Math.floor(contentH / 10);
  if (cw >= 12 && ch >= 12) return { cols: 10, rows: 10, cellW: cw, cellH: ch };
  return null;
}

// Check if a cell is mostly empty/transparent
async function isCellEmpty(inputPath, left, top, width, height) {
  try {
    const { data } = await sharp(inputPath)
      .extract({ left, top, width, height })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let opaquePixels = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 10) opaquePixels++;
    const ratio = opaquePixels / (width * height);
    return ratio < 0.05; // less than 5% opaque → empty
  } catch { return false; }
}

// ── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Architect's Ascendance — Asset Pipeline ===\n");

  // 1. Gather all source images
  const exts = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);
  const sourceFiles = fs.readdirSync(SOURCE_DIR)
    .filter(f => exts.has(path.extname(f).toLowerCase()))
    .map(f => ({ name: f, src: path.join(SOURCE_DIR, f) }));

  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Found ${sourceFiles.length} image files\n`);

  // 2. Analyze all images
  const analyzed = [];
  for (const { name, src } of sourceFiles) {
    const stat = fs.statSync(src);
    const fileSizeKB = Math.round(stat.size / 1024);
    let meta;
    try { meta = await sharp(src).metadata(); }
    catch (e) { console.warn(`  SKIP (unreadable): ${name}`); continue; }
    const w = meta.width || 0;
    const h = meta.height || 0;
    const hash = await computeHash(src);
    const { cat, conf } = classify(name, w, h, fileSizeKB);
    analyzed.push({ name, src, w, h, fileSizeKB, hash, cat, conf, ar: +(w / h).toFixed(3) });
  }

  // 3. Deduplication
  console.log("Deduplicating...");
  const clusterMap = {}; // hash → [entries]
  const exactMap = {};   // md5 → first entry
  for (const a of analyzed) {
    if (!a.hash) continue;
    const key = a.hash;
    if (!clusterMap[key]) clusterMap[key] = [];
    clusterMap[key].push(a);
  }

  // Near-duplicate pass (hamming ≤ 10)
  const hashes = analyzed.filter(a => a.hash).map(a => a.hash);
  const nearDups = new Map(); // entry.name → clusterId

  const clustered = new Set();
  let clusterId = 0;
  for (let i = 0; i < analyzed.length; i++) {
    const a = analyzed[i];
    if (!a.hash || clustered.has(a.name)) continue;
    const cluster = [a];
    for (let j = i + 1; j < analyzed.length; j++) {
      const b = analyzed[j];
      if (!b.hash || clustered.has(b.name)) continue;
      if (hammingDistance(a.hash, b.hash) <= 10) {
        cluster.push(b);
        clustered.add(b.name);
      }
    }
    if (cluster.length > 1) {
      const cid = `dup-cluster-${++clusterId}`;
      // Pick best: highest conf, largest file
      cluster.sort((x, y) => y.conf - x.conf || y.fileSizeKB - x.fileSizeKB);
      cluster[0].selectedAsBest = true;
      cluster[0].duplicateClusterId = cid;
      for (let k = 1; k < cluster.length; k++) {
        cluster[k].isDuplicate = true;
        cluster[k].duplicateClusterId = cid;
      }
    }
    clustered.add(a.name);
  }

  const dupCount = analyzed.filter(a => a.isDuplicate).length;
  console.log(`  Duplicate clusters: ${clusterId}  |  Rejected duplicates: ${dupCount}\n`);

  // 4. Copy originals + route to category folders
  console.log("Copying files...");
  const isSheetCat = cat =>
    cat === "ITEM_SPRITE_SHEET" ||
    cat === "CYBERPUNK_ITEM_SPRITE_SHEET" ||
    cat === "CHARACTER_ENEMY_UI_SPRITE_SHEET";

  const manifestEntries = [];
  const sheetEntries = []; // to be sliced

  for (const a of analyzed) {
    const destOriginal = path.join(ORIGINALS, a.name);
    copyFile(a.src, destOriginal);

    let destFolder, notes = "";
    if (a.isDuplicate) {
      destFolder = DUPLICATES_DIR;
      notes = `Duplicate of cluster ${a.duplicateClusterId}`;
    } else if (a.cat === "UNKNOWN_REVIEW") {
      destFolder = FOLDERS.UNKNOWN_REVIEW;
      notes = "Low-confidence classification";
    } else {
      destFolder = FOLDERS[a.cat] || FOLDERS.UNKNOWN_REVIEW;
    }

    const destPath = path.join(destFolder, a.name);
    copyFile(a.src, destPath);

    const id = "asset-" + kebab(path.parse(a.name).name).slice(0, 40);
    const entry = {
      id,
      canonicalName: path.parse(a.name).name,
      category: a.cat,
      subcategory: null,
      filePath: pathRelativeToPublic(destPath),
      originalPath: pathRelativeToPublic(destOriginal),
      width: a.w,
      height: a.h,
      aspectRatio: a.ar,
      sourceFileOriginalName: a.name,
      confidence: a.conf,
      qualityScore: Math.round(a.conf * 0.8 + (a.fileSizeKB > 10 ? 10 : 0) + (a.w >= 256 ? 10 : 0)),
      visualTags: [],
      likelyUsage: likelyUsage(a.cat),
      duplicateClusterId: a.duplicateClusterId || null,
      selectedAsBest: !!a.selectedAsBest || !a.isDuplicate,
      notes,
      sourceSheetId: null,
      sourceCell: null,
      cropBox: null,
      hasLabelVersion: false,
      labelVersionPath: null,
    };
    manifestEntries.push(entry);

    if (isSheetCat(a.cat) && !a.isDuplicate) {
      sheetEntries.push({ ...a, manifestId: id, destOriginal });
    }
  }

  // 5. Slice sprite sheets
  console.log(`\nSlicing ${sheetEntries.length} sprite sheets...`);
  const spriteSheetRegistry = {};
  let totalSliced = 0;
  let badSlices = 0;

  for (const sheet of sheetEntries) {
    const grid = estimateGrid(sheet.w, sheet.h);
    if (!grid) {
      console.log(`  [BAD GRID] ${sheet.name} (${sheet.w}x${sheet.h})`);
      copyFile(sheet.src, path.join(BAD_SLICES, sheet.name));
      badSlices++;
      continue;
    }

    const { cols, rows, cellW, cellH } = grid;
    console.log(`  [SLICE] ${sheet.name} ${sheet.w}x${sheet.h} → ${cols}×${rows} cells of ${cellW}×${cellH}`);

    const isCyber = sheet.cat === "CYBERPUNK_ITEM_SPRITE_SHEET";
    const sliceDir = sheet.cat === "CHARACTER_ENEMY_UI_SPRITE_SHEET" ? SLICED_CHARS : (isCyber ? path.join(PUBLIC_GAME, "items", "cyberpunk") : SLICED_ITEMS);
    fs.mkdirSync(sliceDir, { recursive: true });

    const sheetId = sheet.manifestId;
    spriteSheetRegistry[sheetId] = {
      sourceFile: sheet.name,
      originalPath: pathRelativeToPublic(sheet.destOriginal),
      cols,
      rows,
      cellW,
      cellH,
      children: [],
    };

    let slicedCount = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const left = c * cellW;
        const top = r * cellH;
        if (left + cellW > sheet.w || top + cellH > sheet.h) continue;

        const empty = await isCellEmpty(sheet.src, left, top, cellW, cellH);
        if (empty) continue;

        const cellName = `${sheetId}-r${String(r + 1).padStart(2, "0")}-c${String(c + 1).padStart(2, "0")}.png`;
        const cellPath = path.join(sliceDir, cellName);
        const refName = `ref-${cellName}`;
        const refPath = path.join(REF_CELLS, refName);

        try {
          // Clean crop — nearest neighbor, no smoothing
          await sharp(sheet.src)
            .extract({ left, top, width: cellW, height: cellH })
            .png()
            .toFile(cellPath);

          slicedCount++;

          const childId = `${sheetId}-r${r + 1}-c${c + 1}`;
          const childEntry = {
            id: childId,
            canonicalName: `Cell r${r + 1} c${c + 1} from ${sheet.name}`,
            category: sheet.cat === "CHARACTER_ENEMY_UI_SPRITE_SHEET" ? "CHARACTER_ENEMY_UI_SPRITE_SHEET" : (isCyber ? "CYBERPUNK_ITEM_SPRITE_SHEET" : "ITEM_SPRITE_SHEET"),
            subcategory: "sliced-cell",
            filePath: pathRelativeToPublic(cellPath),
            originalPath: null,
            width: cellW,
            height: cellH,
            aspectRatio: +(cellW / cellH).toFixed(3),
            sourceFileOriginalName: sheet.name,
            confidence: Math.round(sheet.conf * 0.9),
            qualityScore: Math.round(sheet.conf * 0.7),
            visualTags: [],
            likelyUsage: likelyUsage(sheet.cat),
            duplicateClusterId: null,
            selectedAsBest: true,
            notes: `Sliced from ${sheet.name} row ${r + 1} col ${c + 1}`,
            sourceSheetId: sheetId,
            sourceCell: { row: r + 1, col: c + 1 },
            cropBox: { left, top, width: cellW, height: cellH },
            hasLabelVersion: false,
            labelVersionPath: null,
          };
          manifestEntries.push(childEntry);
          spriteSheetRegistry[sheetId].children.push(childId);

        } catch (err) {
          console.warn(`    Slice failed r${r + 1}c${c + 1}: ${err.message}`);
          badSlices++;
        }
      }
    }

    totalSliced += slicedCount;
    console.log(`    → ${slicedCount} non-empty cells sliced`);
  }

  // 6. Write manifest
  console.log("\nWriting asset-manifest.json...");
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifestEntries, null, 2));

  // 7. Write sprite sheet registry (JSON sidecar for TS import)
  const registryPath = path.join(PUBLIC_GAME, "sprite-sheet-registry.json");
  fs.writeFileSync(registryPath, JSON.stringify(spriteSheetRegistry, null, 2));

  // 8. Write processing log
  const catCounts = {};
  for (const e of analyzed) catCounts[e.cat] = (catCounts[e.cat] || 0) + 1;

  const logLines = [
    "# Asset Processing Log",
    `\nRun: ${new Date().toISOString()}`,
    `Source: \`${SOURCE_DIR}\``,
    `Total source images: ${sourceFiles.length}`,
    `Analyzed: ${analyzed.length}`,
    `\n## Classification Counts`,
    ...Object.entries(catCounts).map(([k, v]) => `- ${k}: ${v}`),
    `\n## Deduplication`,
    `- Duplicate clusters: ${clusterId}`,
    `- Duplicates moved to _review/duplicates: ${dupCount}`,
    `\n## Sprite Sheet Slicing`,
    `- Sheets processed: ${sheetEntries.length}`,
    `- Total cells sliced: ${totalSliced}`,
    `- Bad slices: ${badSlices}`,
    `\n## Manifest`,
    `- Total entries: ${manifestEntries.length}`,
    `- Written to: \`public/assets/game/asset-manifest.json\``,
  ];
  fs.writeFileSync(LOG_PATH, logLines.join("\n"));

  console.log("\n=== DONE ===");
  console.log(`Analyzed: ${analyzed.length} | Duplicates: ${dupCount} | Sheets: ${sheetEntries.length} | Sliced: ${totalSliced}`);
  console.log(`Manifest: ${manifestEntries.length} entries → ${MANIFEST_PATH}`);

  return { analyzed, manifestEntries, spriteSheetRegistry, dupCount, totalSliced, badSlices, catCounts };
}

function likelyUsage(cat) {
  const map = {
    ITEM_SPRITE_SHEET: ["inventory"],
    CYBERPUNK_ITEM_SPRITE_SHEET: ["inventory", "shop"],
    CHARACTER_ENEMY_UI_SPRITE_SHEET: ["battle", "party"],
    PLAYABLE_CHARACTER_SHEET: ["party", "codex"],
    ENEMY_OR_BOSS_ART: ["battle"],
    ENVIRONMENT_BACKGROUND: ["battle", "hub", "exploration"],
    HUB_MAP_OR_TILEMAP: ["hub", "exploration"],
    UI_ASSET: ["hud", "menus"],
    PORTRAIT_OR_DIALOGUE_ASSET: ["dialogue", "party"],
    PROMOTIONAL_OR_TITLE_ART: ["title", "intro"],
    UNKNOWN_REVIEW: [],
  };
  return map[cat] || [];
}

main().catch(console.error);
