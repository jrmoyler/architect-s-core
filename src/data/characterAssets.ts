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

// Each animation state maps to an ordered array of frame paths (empty source
// cells are dropped — see USED_FRAMES below).
export interface CharacterFrames extends Partial<Record<AnimState, string[]>> {
  idle: string[]; // idle is always required when frames map is present
}

export interface CharacterAssetEntry {
  name: string;
  slug: string;
  sprite: string | null;
  portrait: string | null;
  turnaround: string | null;
  battleSprite: string | null;
  frames: CharacterFrames | null;
  confidence: number;
  notes: string;
}

// The original "sprite sheets" for the 4 sliced characters are actually
// labeled illustration boards with 3-6 distinct full-character poses, not
// uniform animation grids. Slicing them as 10×10 produced fragments. We now
// use a single hand-cropped idle pose per character as the canonical battle
// sprite, applied to every animation state. CSS effects in BattleScreen
// (animate-bounce, animate-pulse, etc.) provide motion without per-frame art.
const BATTLE_SPRITE: Record<string, string> = {
  hataalii: "/assets/game/characters/battle/hataalii.png",
  devon:    "/assets/game/characters/battle/devon.png",
  ahmed:    "/assets/game/characters/battle/ahmed.png",
  kenza:    "/assets/game/characters/battle/kenza.png",
};

const SINGLE_STATES: AnimState[] = [
  "idle","walk","slash","slash_heavy","cast",
  "hurt","knockback","victory","defeat","critical_hit",
];

/** Build a single-frame map (same image for every state) for a given slug. */
const allFrames = (slug: string): CharacterFrames => {
  const path = BATTLE_SPRITE[slug] ?? "";
  return {
    idle: [path], walk: [path], slash: [path], slash_heavy: [path], cast: [path],
    hurt: [path], knockback: [path], victory: [path], defeat: [path], critical_hit: [path],
  };
};

// ── Character registry ─────────────────────────────────────────────────────

const idleSprite = (slug: string): string => BATTLE_SPRITE[slug] ?? "";

export const CHARACTER_ASSETS: Record<string, CharacterAssetEntry> = {
  hataalii: {
    name: "Hataalii the Architect",
    slug: "hataalii",
    sprite:       idleSprite("hataalii"),
    portrait:     "/assets/game/characters/turnarounds/1776824582721.png",
    turnaround:   "/assets/game/characters/turnarounds/1776824582721.png",
    battleSprite: idleSprite("hataalii"),
    frames: allFrames("hataalii"),
    confidence: 95,
    notes: "Mage in gold/black robes with staff. Frames map to populated source cells only.",
  },
  devon: {
    name: "Devon Scout",
    slug: "devon",
    sprite:       idleSprite("devon"),
    portrait:     null,
    turnaround:   null,
    battleSprite: idleSprite("devon"),
    frames: allFrames("devon"),
    confidence: 95,
    notes: "Tactical athlete in cyan gear. Frames map to populated source cells only.",
  },
  ahmed: {
    name: "Ahmed the Strategist",
    slug: "ahmed",
    sprite:       idleSprite("ahmed"),
    portrait:     null,
    turnaround:   null,
    battleSprite: idleSprite("ahmed"),
    frames: allFrames("ahmed"),
    confidence: 90,
    notes: "Blue suit strategist. Frames map to populated source cells only.",
  },
  kenza: {
    name: "Kenza the Orchestrator",
    slug: "kenza",
    sprite:       idleSprite("kenza"),
    portrait:     null,
    turnaround:   null,
    battleSprite: idleSprite("kenza"),
    frames: allFrames("kenza"),
    confidence: 80,
    notes: "Female in yellow blazer. Frames map to populated source cells only.",
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
