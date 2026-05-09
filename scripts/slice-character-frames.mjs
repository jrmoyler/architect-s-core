/**
 * scripts/slice-character-frames.mjs
 *
 * Slices the 4 confirmed character sprite sheets (10×10 grids) into individual
 * animation-named PNG frames and saves them under:
 *   public/assets/game/characters/sprites/<slug>/
 *
 * Rules:
 *   - Nearest-neighbor extraction only — no blur, no smoothing, no anti-alias
 *   - Does NOT delete source sheets in characters/sprites/ root
 *   - Skips cells that already exist (idempotent)
 *
 * Usage:  node scripts/slice-character-frames.mjs
 */

import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SPRITES_DIR = path.join(ROOT, "public", "assets", "game", "characters", "sprites");

// ---------------------------------------------------------------------------
// Character sheet definitions
// ---------------------------------------------------------------------------
const CHARACTERS = [
  {
    slug: "hataalii",
    sheet: path.join(SPRITES_DIR, "1776824652831.png"),
    rows: 10,
    cols: 10,
  },
  {
    slug: "devon",
    sheet: path.join(SPRITES_DIR, "1776824649078.png"),
    rows: 10,
    cols: 10,
  },
  {
    slug: "kenza",
    sheet: path.join(SPRITES_DIR, "1776824643708.png"),
    rows: 10,
    cols: 10,
  },
  {
    slug: "ahmed",
    sheet: path.join(SPRITES_DIR, "1776825262236.png"),
    rows: 10,
    cols: 10,
  },
];

// ---------------------------------------------------------------------------
// Standard JRPG row-to-animation mapping (0-indexed rows)
// Each row = one animation; col 0 = primary frame, remaining cols = extra frames
// ---------------------------------------------------------------------------
const ROW_ANIMATIONS = [
  "idle",         // row 0
  "walk",         // row 1
  "slash",        // row 2
  "slash_heavy",  // row 3
  "cast",         // row 4
  "hurt",         // row 5
  "knockback",    // row 6
  "victory",      // row 7
  "defeat",       // row 8
  "critical_hit", // row 9
];

// ---------------------------------------------------------------------------
// Process one character sheet
// ---------------------------------------------------------------------------
async function processCharacter(char) {
  const { slug, sheet, rows, cols } = char;

  // Verify sheet exists
  try {
    await fs.access(sheet);
  } catch {
    console.warn(`  [${slug}] Sheet not found: ${sheet} — skipping`);
    return null;
  }

  // Read sheet metadata to determine cell size
  const meta = await sharp(sheet).metadata();
  const { width, height } = meta;
  if (!width || !height) {
    console.warn(`  [${slug}] Could not read sheet dimensions — skipping`);
    return null;
  }

  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);
  console.log(`\n[${slug}] Sheet ${width}×${height} → cell ${cellW}×${cellH} (${rows} rows × ${cols} cols)`);

  const outDir = path.join(SPRITES_DIR, slug);
  await fs.mkdir(outDir, { recursive: true });

  const primaryFrames = {};    // animName → public URL path

  for (let r = 0; r < rows; r++) {
    const animName = ROW_ANIMATIONS[r] ?? `row${String(r + 1).padStart(2, "0")}`;

    for (let c = 0; c < cols; c++) {
      // Primary frame (col 0) uses just the anim name; extras get -f02, -f03 …
      const fileName =
        c === 0
          ? `${animName}.png`
          : `${animName}-f${String(c + 1).padStart(2, "0")}.png`;

      const outPath = path.join(outDir, fileName);

      // Skip if already sliced (idempotent)
      try {
        await fs.access(outPath);
        if (c === 0) {
          primaryFrames[animName] =
            `/assets/game/characters/sprites/${slug}/${fileName}`;
          process.stdout.write(`  ↩ ${fileName} (cached)\n`);
        }
        continue;
      } catch {
        // File doesn't exist — create it
      }

      // Extract cell — sharp.extract() is pixel-perfect (no resampling)
      await sharp(sheet)
        .extract({
          left: c * cellW,
          top: r * cellH,
          width: cellW,
          height: cellH,
        })
        .png({ compressionLevel: 6 })
        .toFile(outPath);

      if (c === 0) {
        primaryFrames[animName] =
          `/assets/game/characters/sprites/${slug}/${fileName}`;
        process.stdout.write(`  ✓ ${fileName}\n`);
      }
    }
  }

  return { slug, cellW, cellH, frames: primaryFrames };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║  Character Animation Frame Slicer        ║");
  console.log("║  Nearest-neighbor extract — no blur      ║");
  console.log("╚══════════════════════════════════════════╝");

  const results = [];

  for (const char of CHARACTERS) {
    const result = await processCharacter(char);
    if (result) results.push(result);
  }

  // -------------------------------------------------------------------------
  // Print summary
  // -------------------------------------------------------------------------
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║  Summary                                 ║");
  console.log("╚══════════════════════════════════════════╝");

  for (const { slug, cellW, cellH, frames } of results) {
    const frameCount = Object.keys(frames).length;
    console.log(`\n${slug} (${cellW}×${cellH}px cells, ${frameCount} primary frames):`);
    for (const [anim, url] of Object.entries(frames)) {
      console.log(`  ${anim.padEnd(14)} → ${url}`);
    }
  }

  console.log("\n✅ Done — update src/data/characterAssets.ts with the frames maps above.\n");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
