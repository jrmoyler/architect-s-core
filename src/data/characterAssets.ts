import { withAssetVersion } from "@/lib/assetVersion";

// Character asset registry — paths are relative to Vite's public/ root.
// Vite serves public/ at /, so paths start with /assets/ (NOT /public/assets/).
// Multi-frame animations use the /sprites/ sub-directories; each state has
// {state}.png (frame 1) plus {state}-f02.png … {state}-f10.png (frames 2–10).

export type AnimState =
  | "idle"
  | "walk"
  | "slash"
  | "slash_heavy"
  | "cast"
  | "hurt"
  | "knockback"
  | "victory"
  | "defeat"
  | "critical_hit";

// Each animation state maps to an ordered array of frame paths (f01 … f10).
export interface CharacterFrames extends Partial<Record<AnimState, string[]>> {
  idle: string[]; // idle is always required when frames map is present
}

export interface CharacterAssetEntry {
  name: string;
  slug: string;
  sprite: string | null;          // idle frame (used as battle sprite)
  portrait: string | null;        // portrait / turnaround art
  turnaround: string | null;      // turnaround sheet
  battleSprite: string | null;    // alias for sprite (backwards compat)
  frames: CharacterFrames | null; // per-animation multi-frame paths
  confidence: number;
  notes: string;
}

// ── Frame-array helpers ────────────────────────────────────────────────────

/** Build a 10-frame array for one animation state from the /sprites/ dir. */
const spriteFrames = (slug: string, state: AnimState): string[] => [
  `/assets/game/characters/sprites/${slug}/${state}.png`,
  ...Array.from({ length: 9 }, (_, i) =>
    `/assets/game/characters/sprites/${slug}/${state}-f${String(i + 2).padStart(2, "0")}.png`
  ),
];

/** Build the full 10-state × 10-frame map for a character slug. */
const allFrames = (slug: string): CharacterFrames => ({
  idle:         spriteFrames(slug, "idle"),
  walk:         spriteFrames(slug, "walk"),
  slash:        spriteFrames(slug, "slash"),
  slash_heavy:  spriteFrames(slug, "slash_heavy"),
  cast:         spriteFrames(slug, "cast"),
  hurt:         spriteFrames(slug, "hurt"),
  knockback:    spriteFrames(slug, "knockback"),
  victory:      spriteFrames(slug, "victory"),
  defeat:       spriteFrames(slug, "defeat"),
  critical_hit: spriteFrames(slug, "critical_hit"),
});

// ── Character registry ─────────────────────────────────────────────────────

export const CHARACTER_ASSETS: Record<string, CharacterAssetEntry> = {
  hataalii: {
    name: "Hataalii the Architect",
    slug: "hataalii",
    sprite:       "/assets/game/characters/sprites/hataalii/idle.png",
    portrait:     "/assets/game/characters/turnarounds/1776824582721.png",
    turnaround:   "/assets/game/characters/turnarounds/1776824582721.png",
    battleSprite: "/assets/game/characters/sprites/hataalii/idle.png",
    frames: allFrames("hataalii"),
    confidence: 95,
    notes: "Mage in gold/black robes with staff. 10 states × 10 frames confirmed.",
  },
  devon: {
    name: "Devon Scout",
    slug: "devon",
    sprite:       "/assets/game/characters/sprites/devon/idle.png",
    portrait:     null,
    turnaround:   null,
    battleSprite: "/assets/game/characters/sprites/devon/idle.png",
    frames: allFrames("devon"),
    confidence: 95,
    notes: "Tactical athlete in cyan gear. 10 states × 10 frames confirmed.",
  },
  ahmed: {
    name: "Ahmed the Strategist",
    slug: "ahmed",
    sprite:       "/assets/game/characters/sprites/ahmed/idle.png",
    portrait:     null,
    turnaround:   null,
    battleSprite: "/assets/game/characters/sprites/ahmed/idle.png",
    frames: allFrames("ahmed"),
    confidence: 90,
    notes: "Blue suit strategist. 10 states × 10 frames confirmed.",
  },
  kenza: {
    name: "Kenza the Orchestrator",
    slug: "kenza",
    sprite:       "/assets/game/characters/sprites/kenza/idle.png",
    portrait:     null,
    turnaround:   null,
    battleSprite: "/assets/game/characters/sprites/kenza/idle.png",
    frames: allFrames("kenza"),
    confidence: 80,
    notes: "Female in yellow blazer. 10 states × 10 frames confirmed.",
  },
  denzel: {
    name: "Denzel the Agent",
    slug: "denzel",
    sprite:       "/assets/game/characters/placeholders/denzel.svg",
    portrait:     "/assets/game/characters/placeholders/denzel.svg",
    turnaround:   null,
    battleSprite: "/assets/game/characters/placeholders/denzel.svg",
    frames:       null,
    confidence: 55,
    notes: "SVG placeholder. Civic Core Speaker — support role.",
  },
  arthur: {
    name: "Arthur the Advisor",
    slug: "arthur",
    sprite:       "/assets/game/characters/placeholders/arthur.svg",
    portrait:     "/assets/game/characters/placeholders/arthur.svg",
    turnaround:   null,
    battleSprite: "/assets/game/characters/placeholders/arthur.svg",
    frames:       null,
    confidence: 55,
    notes: "SVG placeholder. Obsidian Arc Sentinel — tank role.",
  },
  stanley: {
    name: "Stanley the Guardian",
    slug: "stanley",
    sprite:       "/assets/game/characters/placeholders/stanley.svg",
    portrait:     "/assets/game/characters/placeholders/stanley.svg",
    turnaround:   null,
    battleSprite: "/assets/game/characters/placeholders/stanley.svg",
    frames:       null,
    confidence: 85,
    notes: "SVG placeholder. Nexus Labs Tinkerer — support role.",
  },
  joseph: {
    name: "Dr. Joseph the Healer",
    slug: "joseph",
    sprite:       "/assets/game/characters/placeholders/joseph.svg",
    portrait:     "/assets/game/characters/placeholders/joseph.svg",
    turnaround:   null,
    battleSprite: "/assets/game/characters/placeholders/joseph.svg",
    frames:       null,
    confidence: 55,
    notes: "SVG placeholder. Vital Helix Medic — healer role.",
  },
  champion: {
    name: "Collective Champion",
    slug: "champion",
    sprite:       "/assets/game/characters/placeholders/champion.svg",
    portrait:     "/assets/game/characters/placeholders/champion.svg",
    turnaround:   null,
    battleSprite: "/assets/game/characters/placeholders/champion.svg",
    frames:       null,
    confidence: 55,
    notes: "SVG placeholder. Collective Champion — elite role.",
  },
  ascended: {
    name: "The Architect Ascended",
    slug: "ascended",
    sprite:       "/assets/game/characters/placeholders/ascended.svg",
    portrait:     "/assets/game/characters/placeholders/ascended.svg",
    turnaround:   null,
    battleSprite: "/assets/game/characters/placeholders/ascended.svg",
    frames:       null,
    confidence: 55,
    notes: "SVG placeholder. The Architect Ascended / Council Sage form.",
  },
};

// ── Path helpers ───────────────────────────────────────────────────────────

export const getCharacterAsset = (slug: string): CharacterAssetEntry | null =>
  CHARACTER_ASSETS[slug] ?? null;

const stripPublic = (p: string | null): string | null =>
  !p ? null : p.startsWith("/public/") ? p.slice(7) : p;

const versionPath = (p: string | null): string | null =>
  withAssetVersion(stripPublic(p));

const SPRITE_SLUG: Record<string, string> = {
  "sprite-hataalii": "hataalii",
  "sprite-devon":    "devon",
  "sprite-ahmed":    "ahmed",
  "sprite-joseph":   "joseph",
  "sprite-kenza":    "kenza",
  "sprite-denzel":   "denzel",
  "sprite-arthur":   "arthur",
  "sprite-stanley":  "stanley",
  "sprite-champion": "champion",
  "sprite-ascended": "ascended",
};

export const getCharacterSpritePath = (spriteKey: string): string | null => {
  const slug = SPRITE_SLUG[spriteKey];
  if (!slug) return null;
  const entry = CHARACTER_ASSETS[slug];
  return versionPath(entry?.sprite ?? entry?.battleSprite ?? entry?.turnaround ?? null);
};

export const getCharacterPortraitPath = (spriteKey: string): string | null => {
  const slugMap: Record<string, string> = {
    "portrait-hataalii": "hataalii",
    "portrait-devon":    "devon",
    "portrait-ahmed":    "ahmed",
    "portrait-joseph":   "joseph",
    "portrait-kenza":    "kenza",
    "portrait-denzel":   "denzel",
    "portrait-arthur":   "arthur",
    "portrait-stanley":  "stanley",
  };
  const slug = slugMap[spriteKey] ?? spriteKey.replace(/^portrait-/, "");
  const entry = CHARACTER_ASSETS[slug];
  return versionPath(entry?.portrait ?? entry?.turnaround ?? entry?.sprite ?? null);
};

/**
 * Return all ordered frame paths for an animation state.
 * Falls back to [battleSprite] for characters without a frames map.
 * Returns [] if nothing is found.
 */
export const getCharacterFrames = (
  spriteKey: string,
  animState: AnimState = "idle",
): string[] => {
  const slug = SPRITE_SLUG[spriteKey];
  if (!slug) return [];
  const entry = CHARACTER_ASSETS[slug];
  if (!entry) return [];
  if (!entry.frames) {
    const fallback = versionPath(entry.battleSprite ?? entry.sprite ?? null);
    return fallback ? [fallback] : [];
  }
  const stateFrames = entry.frames[animState] ?? entry.frames.idle ?? [];
  return stateFrames.map(f => versionPath(f) ?? f);
};

/** Return the first frame path for an animation state (single-frame callers). */
export const getCharacterFrame = (
  spriteKey: string,
  animState: AnimState = "idle",
): string | null => {
  const frames = getCharacterFrames(spriteKey, animState);
  return frames[0] ?? null;
};
