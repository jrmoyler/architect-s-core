// Versioned battle sprite configuration.
//
// Each character has a single canonical battle pose used across all animation
// states (motion comes from CSS effects in BattleScreen — bounce, pulse, etc.).
// Per-state overrides let us drop in additional hand-picked poses later
// (e.g. a dedicated `slash.png`) without re-introducing sprite-sheet slicing
// or fragmentation. Resolution rule (in order):
//
//   1. perState[animState]   — explicit override for that state
//   2. default               — single canonical pose
//
// To add a new pose:
//   1. Drop the cleaned PNG into /public/assets/game/characters/battle/
//   2. Add a `perState` entry below (e.g. slash: ".../hataalii-slash.png")
//   3. Bump BATTLE_SPRITE_VERSION
//
// Bumping the version invalidates browser caches via withAssetVersion().

import type { AnimState } from "./characterAssets";

export const BATTLE_SPRITE_VERSION = "2026-05-10-v1";

export interface BattleSpriteConfig {
  /** Canonical single-frame pose used for every state by default. */
  default: string;
  /** Optional per-state overrides — populate as new poses are produced. */
  perState?: Partial<Record<AnimState, string>>;
}

const BATTLE_DIR = "/assets/game/characters/battle";

export const BATTLE_SPRITES: Record<string, BattleSpriteConfig> = {
  hataalii: { default: `${BATTLE_DIR}/hataalii.png` },
  devon:    { default: `${BATTLE_DIR}/devon.png` },
  ahmed:    { default: `${BATTLE_DIR}/ahmed.png` },
  kenza:    { default: `${BATTLE_DIR}/kenza.png` },
};

/** Resolve the battle sprite path for a given character + animation state. */
export const resolveBattleSprite = (
  slug: string,
  animState: AnimState = "idle",
): string | null => {
  const cfg = BATTLE_SPRITES[slug];
  if (!cfg) return null;
  return cfg.perState?.[animState] ?? cfg.default;
};

/** All distinct battle sprite paths registered for a character. */
export const allBattleSprites = (slug: string): string[] => {
  const cfg = BATTLE_SPRITES[slug];
  if (!cfg) return [];
  const set = new Set<string>([cfg.default, ...Object.values(cfg.perState ?? {})]);
  return Array.from(set);
};
