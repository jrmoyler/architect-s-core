// Sprite sheet validator — runs in the browser.
// Verifies that every character/enemy sprite URL loads and that detected
// image dimensions match expected values (manifest frameWidth/frameHeight,
// or sheet cellW × cols / cellH × rows).
//
// Usage (dev console):
//   import("/src/lib/spriteValidator.ts").then(m => m.validateAllSprites().then(console.table));
// Or just `validateAllSprites()` after importing the module.

import { ASSET_MANIFEST, normalizeAssetPath } from "@/lib/assets";
import { CHARACTER_ASSETS, type AnimState } from "@/data/characterAssets";
import { SPRITE_SHEET_REGISTRY } from "@/data/spriteSheetRegistry";
import type { AssetManifestEntry } from "@/types/game";

export interface ValidationResult {
  id: string;
  category: string;
  url: string;
  ok: boolean;
  loaded?: { w: number; h: number };
  expected?: { w: number; h: number };
  reason?: string;
}

const ANIM_STATES: AnimState[] = [
  "idle", "walk", "slash", "slash_heavy", "cast",
  "hurt", "knockback", "victory", "defeat", "critical_hit",
];

/** Load an image and resolve its natural width/height, or reject on error. */
const probe = (url: string): Promise<{ w: number; h: number }> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error(`failed to load: ${url}`));
    img.src = url;
  });

const expectedFromEntry = (entry: AssetManifestEntry): { w: number; h: number } | undefined => {
  if (entry.sourceSheet && entry.frameWidth) {
    // Sliced sprite — expected size is the cell size
    return { w: entry.frameWidth, h: entry.frameHeight ?? entry.frameWidth };
  }
  return undefined;
};

const expectedFromSheet = (sourceSheet: string): { w: number; h: number } | undefined => {
  const id = "asset-" + sourceSheet.replace(/.*\//, "").replace(/\.png$/i, "");
  const entry = SPRITE_SHEET_REGISTRY[id];
  if (!entry) return undefined;
  return { w: entry.cellW * entry.cols, h: entry.cellH * entry.rows };
};

const checkOne = async (
  id: string,
  category: string,
  rawUrl: string | null,
  expected?: { w: number; h: number },
): Promise<ValidationResult> => {
  const url = normalizeAssetPath(rawUrl);
  if (!url) return { id, category, url: "", ok: false, reason: "no path" };
  try {
    const loaded = await probe(url);
    if (expected) {
      const ok = loaded.w === expected.w && loaded.h === expected.h;
      return {
        id, category, url, ok, loaded, expected,
        reason: ok ? undefined : `dim mismatch ${loaded.w}×${loaded.h} ≠ ${expected.w}×${expected.h}`,
      };
    }
    return { id, category, url, ok: true, loaded };
  } catch (e) {
    return { id, category, url, ok: false, reason: (e as Error).message };
  }
};

/** Validate every character (all anim frames) + every manifest character/enemy entry. */
export const validateAllSprites = async (): Promise<ValidationResult[]> => {
  const tasks: Promise<ValidationResult>[] = [];

  // 1. Character animation frames
  for (const [slug, c] of Object.entries(CHARACTER_ASSETS)) {
    if (!c.frames) continue;
    for (const state of ANIM_STATES) {
      const path = c.frames[state];
      if (!path) continue;
      tasks.push(checkOne(`${slug}/${state}`, "character-frame", path));
    }
  }

  // 2. Manifest entries (characters, enemies, portraits, environments)
  for (const entry of ASSET_MANIFEST) {
    if (!["character", "enemy", "portrait", "environment"].includes(entry.category)) continue;
    const expected =
      expectedFromEntry(entry) ??
      (entry.sourceSheet ? expectedFromSheet(entry.sourceSheet) : undefined);
    const url = entry.publicPath ?? (entry.sourceSheet ?? null);
    if (!url) continue;
    tasks.push(checkOne(entry.id, entry.category, url, expected));
  }

  return Promise.all(tasks);
};

/** Convenience: pretty-print summary to the console. */
export const runSpriteValidation = async (): Promise<void> => {
  const results = await validateAllSprites();
  const failed = results.filter(r => !r.ok);
  // eslint-disable-next-line no-console
  console.group(`%cSprite Validator — ${results.length} checked, ${failed.length} failed`,
    `color:${failed.length ? "#f87171" : "#34d399"};font-weight:bold`);
  if (failed.length) {
    // eslint-disable-next-line no-console
    console.table(failed.map(({ id, category, url, reason, loaded, expected }) => ({
      id, category, reason,
      loaded: loaded ? `${loaded.w}×${loaded.h}` : "—",
      expected: expected ? `${expected.w}×${expected.h}` : "—",
      url,
    })));
  } else {
    // eslint-disable-next-line no-console
    console.log("All sprites loaded with correct dimensions ✓");
  }
  // eslint-disable-next-line no-console
  console.groupEnd();
};

// Expose on window in dev for ad-hoc invocation
if (typeof window !== "undefined" && import.meta.env.DEV) {
  (window as any).__validateSprites = runSpriteValidation;
}
