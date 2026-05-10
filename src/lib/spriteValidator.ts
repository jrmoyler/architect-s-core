// Sprite sheet validator — runs in the browser.
// Verifies that:
//   1. Every character/enemy sprite URL loads.
//   2. Total image dimensions match expected values (manifest frameWidth/Height
//      or sheet cellW × cols / cellH × rows).
//   3. For sheets, each individual cell rect is grid-aligned and contains
//      non-empty, non-cropped content (no opaque pixels straddling cell edges).
//
// Usage (dev console):
//   __validateSprites()              // checks loads + total dims + per-cell grid
//   __validateSprites({ deepCells: false })  // skips per-cell pixel scan

import { ASSET_MANIFEST, normalizeAssetPath } from "@/lib/assets";
import { CHARACTER_ASSETS, type AnimState } from "@/data/characterAssets";
import { SPRITE_SHEET_REGISTRY, type SpriteSheetEntry } from "@/data/spriteSheetRegistry";
import type { AssetManifestEntry } from "@/types/game";

export interface CellIssue {
  row: number;
  col: number;
  reason: "empty" | "edge-bleed" | "out-of-bounds";
  detail?: string;
}

export interface ValidationResult {
  id: string;
  category: string;
  url: string;
  ok: boolean;
  loaded?: { w: number; h: number };
  expected?: { w: number; h: number };
  cells?: { checked: number; bad: number; issues: CellIssue[] };
  reason?: string;
}

export interface ValidatorOptions {
  /** Run per-cell pixel inspection on sheets (slower). Default true. */
  deepCells?: boolean;
  /** Alpha threshold (0-255) above which a pixel is considered opaque. */
  alphaThreshold?: number;
  /** Max bad cells listed in result.cells.issues (full count still reported). */
  maxIssuesReported?: number;
}

const ANIM_STATES: AnimState[] = [
  "idle", "walk", "slash", "slash_heavy", "cast",
  "hurt", "knockback", "victory", "defeat", "critical_hit",
];

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load: ${url}`));
    img.src = url;
  });

const expectedFromEntry = (entry: AssetManifestEntry): { w: number; h: number } | undefined => {
  if (entry.sourceSheet && entry.frameWidth) {
    return { w: entry.frameWidth, h: entry.frameHeight ?? entry.frameWidth };
  }
  return undefined;
};

const sheetEntryFor = (sourceSheet: string): SpriteSheetEntry | undefined => {
  const id = "asset-" + sourceSheet.replace(/.*\//, "").replace(/\.png$/i, "");
  return SPRITE_SHEET_REGISTRY[id];
};

/** Inspect each cell of a sheet for grid alignment + content. */
const inspectSheetCells = (
  img: HTMLImageElement,
  sheet: SpriteSheetEntry,
  alphaThreshold: number,
  maxIssues: number,
): { checked: number; bad: number; issues: CellIssue[] } => {
  const { cols, rows, cellW, cellH } = sheet;
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { checked: 0, bad: 0, issues: [{ row: 0, col: 0, reason: "out-of-bounds", detail: "no 2d ctx" }] };
  ctx.drawImage(img, 0, 0);

  const issues: CellIssue[] = [];
  let checked = 0;
  let bad = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      checked++;
      const x = c * cellW, y = r * cellH;
      if (x + cellW > canvas.width || y + cellH > canvas.height) {
        bad++;
        if (issues.length < maxIssues) {
          issues.push({ row: r, col: c, reason: "out-of-bounds",
            detail: `cell rect ${x},${y},${cellW},${cellH} exceeds image ${canvas.width}×${canvas.height}` });
        }
        continue;
      }
      const data = ctx.getImageData(x, y, cellW, cellH).data;

      // Pass 1: any opaque pixel?
      let opaqueCount = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > alphaThreshold) { opaqueCount++; if (opaqueCount > 4) break; }
      }
      if (opaqueCount === 0) {
        bad++;
        if (issues.length < maxIssues) issues.push({ row: r, col: c, reason: "empty" });
        continue;
      }

      // Pass 2: edge-bleed — opaque pixels on every side suggest the sprite
      // is not contained within the cell (misaligned grid or cropped frames).
      // We sample only the 1px border ring.
      const isOpaque = (px: number, py: number) =>
        data[(py * cellW + px) * 4 + 3] > alphaThreshold;
      let top = 0, bottom = 0, left = 0, right = 0;
      for (let i = 0; i < cellW; i++) {
        if (isOpaque(i, 0)) top++;
        if (isOpaque(i, cellH - 1)) bottom++;
      }
      for (let i = 0; i < cellH; i++) {
        if (isOpaque(0, i)) left++;
        if (isOpaque(cellW - 1, i)) right++;
      }
      // Heuristic: if all four borders have substantial opaque coverage
      // (>20% of edge length), the sprite likely overflows the cell.
      const tEdge = Math.max(2, Math.floor(cellW * 0.2));
      const tEdgeV = Math.max(2, Math.floor(cellH * 0.2));
      if (top > tEdge && bottom > tEdge && left > tEdgeV && right > tEdgeV) {
        bad++;
        if (issues.length < maxIssues) {
          issues.push({ row: r, col: c, reason: "edge-bleed",
            detail: `borders T${top} B${bottom} L${left} R${right}` });
        }
      }
    }
  }
  return { checked, bad, issues };
};

const checkOne = async (
  id: string,
  category: string,
  rawUrl: string | null,
  opts: Required<ValidatorOptions>,
  expected?: { w: number; h: number },
  sheet?: SpriteSheetEntry,
): Promise<ValidationResult> => {
  const url = normalizeAssetPath(rawUrl);
  if (!url) return { id, category, url: "", ok: false, reason: "no path" };
  try {
    const img = await loadImage(url);
    const loaded = { w: img.naturalWidth, h: img.naturalHeight };
    const result: ValidationResult = { id, category, url, ok: true, loaded, expected };

    if (expected) {
      if (loaded.w !== expected.w || loaded.h !== expected.h) {
        result.ok = false;
        result.reason = `dim mismatch ${loaded.w}×${loaded.h} ≠ ${expected.w}×${expected.h}`;
      }
    }

    if (sheet) {
      // Grid-divisibility check
      if (loaded.w % sheet.cellW !== 0 || loaded.h % sheet.cellH !== 0) {
        result.ok = false;
        result.reason = (result.reason ? result.reason + "; " : "") +
          `image ${loaded.w}×${loaded.h} not divisible by cell ${sheet.cellW}×${sheet.cellH}`;
      }
      if (opts.deepCells) {
        const cells = inspectSheetCells(img, sheet, opts.alphaThreshold, opts.maxIssuesReported);
        result.cells = cells;
        if (cells.bad > 0) {
          result.ok = false;
          result.reason = (result.reason ? result.reason + "; " : "") +
            `${cells.bad}/${cells.checked} cells failed grid inspection`;
        }
      }
    }

    return result;
  } catch (e) {
    return { id, category, url, ok: false, reason: (e as Error).message };
  }
};

/** Validate every character anim frame + every manifest entry + per-cell grid. */
export const validateAllSprites = async (
  options: ValidatorOptions = {},
): Promise<ValidationResult[]> => {
  const opts: Required<ValidatorOptions> = {
    deepCells: options.deepCells ?? true,
    alphaThreshold: options.alphaThreshold ?? 16,
    maxIssuesReported: options.maxIssuesReported ?? 12,
  };

  const tasks: Promise<ValidationResult>[] = [];

  // 1. Character animation frames (standalone PNGs — no grid)
  for (const [slug, c] of Object.entries(CHARACTER_ASSETS)) {
    if (!c.frames) continue;
    for (const state of ANIM_STATES) {
      const paths = c.frames[state];
      if (!paths || paths.length === 0) continue;
      paths.forEach((p, i) =>
        tasks.push(checkOne(`${slug}/${state}#${i + 1}`, "character-frame", p, opts)),
      );
    }
  }

  // 2. Manifest entries — including sheet-grid inspection where applicable
  for (const entry of ASSET_MANIFEST) {
    if (!["character", "enemy", "portrait", "environment"].includes(entry.category)) continue;
    const sheet = entry.sourceSheet ? sheetEntryFor(entry.sourceSheet) : undefined;
    const expected =
      expectedFromEntry(entry) ??
      (sheet ? { w: sheet.cellW * sheet.cols, h: sheet.cellH * sheet.rows } : undefined);
    const url = entry.publicPath ?? (entry.sourceSheet ?? null);
    if (!url) continue;
    tasks.push(checkOne(entry.id, entry.category, url, opts, expected, sheet));
  }

  // 3. Standalone sheet validation — every sheet in the registry, even if no
  //    manifest entry references it directly.
  const seenSheets = new Set<string>();
  for (const [sheetId, sheet] of Object.entries(SPRITE_SHEET_REGISTRY)) {
    if (seenSheets.has(sheetId)) continue;
    seenSheets.add(sheetId);
    const url = `/assets/game/sheets-original/${sheet.sourceFile}`;
    tasks.push(checkOne(
      sheetId, "sheet", url, opts,
      { w: sheet.cellW * sheet.cols, h: sheet.cellH * sheet.rows },
      sheet,
    ));
  }

  return Promise.all(tasks);
};

/** Pretty-print summary to the console. */
export const runSpriteValidation = async (options: ValidatorOptions = {}): Promise<void> => {
  const results = await validateAllSprites(options);
  const failed = results.filter(r => !r.ok);
  const cellsBad = results.reduce((n, r) => n + (r.cells?.bad ?? 0), 0);
  const cellsChecked = results.reduce((n, r) => n + (r.cells?.checked ?? 0), 0);
  // eslint-disable-next-line no-console
  console.group(
    `%cSprite Validator — ${results.length} assets, ${failed.length} failed · cells ${cellsChecked - cellsBad}/${cellsChecked} ok`,
    `color:${failed.length ? "#f87171" : "#34d399"};font-weight:bold`,
  );
  if (failed.length) {
    // eslint-disable-next-line no-console
    console.table(failed.map(({ id, category, url, reason, loaded, expected, cells }) => ({
      id, category, reason,
      loaded: loaded ? `${loaded.w}×${loaded.h}` : "—",
      expected: expected ? `${expected.w}×${expected.h}` : "—",
      cells: cells ? `${cells.bad}/${cells.checked} bad` : "—",
      url,
    })));
    for (const r of failed) {
      if (r.cells?.issues?.length) {
        // eslint-disable-next-line no-console
        console.groupCollapsed(`↳ ${r.id} cell issues (${r.cells.bad}/${r.cells.checked})`);
        // eslint-disable-next-line no-console
        console.table(r.cells.issues);
        // eslint-disable-next-line no-console
        console.groupEnd();
      }
    }
  } else {
    // eslint-disable-next-line no-console
    console.log("All sprites loaded, dimensions match, and cells pass grid inspection ✓");
  }
  // eslint-disable-next-line no-console
  console.groupEnd();
};

if (typeof window !== "undefined" && import.meta.env.DEV) {
  (window as any).__validateSprites = runSpriteValidation;
}
