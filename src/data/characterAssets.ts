import { withAssetVersion } from "@/lib/assetVersion";

// Character asset registry — paths are relative to Vite's public/ root.
// Vite serves public/ at /, so paths start with /assets/ (NOT /public/assets/).
// Battle sprites use curated standalone crops instead of raw sheet cells.

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

export interface CharacterFrames extends Partial<Record<AnimState, string>> {
  idle: string; // idle is always required when frames map is present
}

export interface CharacterAssetEntry {
  name: string;
  slug: string;
  sprite: string | null;          // idle frame (used as battle sprite)
  portrait: string | null;        // portrait / turnaround art
  turnaround: string | null;      // turnaround sheet
  battleSprite: string | null;    // alias for sprite (backwards compat)
  frames: CharacterFrames | null; // per-animation frame paths
  confidence: number;
  notes: string;
}

export const CHARACTER_ASSETS: Record<string, CharacterAssetEntry> = {
  hataalii: {
    name: "Hataalii the Architect",
    slug: "hataalii",
    sprite:       "/assets/game/characters/standalone/hataalii/idle.png",
    portrait:     "/assets/game/characters/turnarounds/1776824582721.png",
    turnaround:   "/assets/game/characters/turnarounds/1776824582721.png",
    battleSprite: "/assets/game/characters/standalone/hataalii/idle.png",
    frames: {
      idle:         "/assets/game/characters/standalone/hataalii/idle.png",
      walk:         "/assets/game/characters/standalone/hataalii/walk.png",
      slash:        "/assets/game/characters/standalone/hataalii/slash.png",
      slash_heavy:  "/assets/game/characters/standalone/hataalii/slash_heavy.png",
      cast:         "/assets/game/characters/standalone/hataalii/cast.png",
      hurt:         "/assets/game/characters/standalone/hataalii/hurt.png",
      knockback:    "/assets/game/characters/standalone/hataalii/knockback.png",
      victory:      "/assets/game/characters/standalone/hataalii/victory.png",
      defeat:       "/assets/game/characters/standalone/hataalii/defeat.png",
      critical_hit: "/assets/game/characters/standalone/hataalii/critical_hit.png",
    },
    confidence: 95,
    notes: "Mage in gold/black robes with staff. 10×10 sheet sliced — all 10 animation rows confirmed.",
  },
  devon: {
    name: "Devon Scout",
    slug: "devon",
    sprite:       "/assets/game/characters/standalone/devon/idle.png",
    portrait:     null,
    turnaround:   null,
    battleSprite: "/assets/game/characters/standalone/devon/idle.png",
    frames: {
      idle:         "/assets/game/characters/standalone/devon/idle.png",
      walk:         "/assets/game/characters/standalone/devon/walk.png",
      slash:        "/assets/game/characters/standalone/devon/slash.png",
      slash_heavy:  "/assets/game/characters/standalone/devon/slash_heavy.png",
      cast:         "/assets/game/characters/standalone/devon/cast.png",
      hurt:         "/assets/game/characters/standalone/devon/hurt.png",
      knockback:    "/assets/game/characters/standalone/devon/knockback.png",
      victory:      "/assets/game/characters/standalone/devon/victory.png",
      defeat:       "/assets/game/characters/standalone/devon/defeat.png",
      critical_hit: "/assets/game/characters/standalone/devon/critical_hit.png",
    },
    confidence: 95,
    notes: "Tactical athlete in cyan gear. IDLE STANCE, SLASH, DODGE ROLL confirmed. 10×10 sheet sliced.",
  },
  ahmed: {
    name: "Ahmed the Strategist",
    slug: "ahmed",
    sprite:       "/assets/game/characters/standalone/ahmed/idle.png",
    portrait:     null,
    turnaround:   null,
    battleSprite: "/assets/game/characters/standalone/ahmed/idle.png",
    frames: {
      idle:         "/assets/game/characters/standalone/ahmed/idle.png",
      walk:         "/assets/game/characters/standalone/ahmed/walk.png",
      slash:        "/assets/game/characters/standalone/ahmed/slash.png",
      slash_heavy:  "/assets/game/characters/standalone/ahmed/slash_heavy.png",
      cast:         "/assets/game/characters/standalone/ahmed/cast.png",
      hurt:         "/assets/game/characters/standalone/ahmed/hurt.png",
      knockback:    "/assets/game/characters/standalone/ahmed/knockback.png",
      victory:      "/assets/game/characters/standalone/ahmed/victory.png",
      defeat:       "/assets/game/characters/standalone/ahmed/defeat.png",
      critical_hit: "/assets/game/characters/standalone/ahmed/critical_hit.png",
    },
    confidence: 90,
    notes: "Blue suit character. 1024×1024 sheet (102×102 cells). OPEN LEDGER SPELL CAST, COIN SHOWER confirmed.",
  },
  kenza: {
    name: "Kenza the Orchestrator",
    slug: "kenza",
    sprite:       "/assets/game/characters/sprites/kenza/idle.png",
    portrait:     null,
    turnaround:   null,
    battleSprite: "/assets/game/characters/sprites/kenza/idle.png",
    frames: {
      idle:         "/assets/game/characters/sprites/kenza/idle.png",
      walk:         "/assets/game/characters/sprites/kenza/walk.png",
      slash:        "/assets/game/characters/sprites/kenza/slash.png",
      slash_heavy:  "/assets/game/characters/sprites/kenza/slash_heavy.png",
      cast:         "/assets/game/characters/sprites/kenza/cast.png",
      hurt:         "/assets/game/characters/sprites/kenza/hurt.png",
      knockback:    "/assets/game/characters/sprites/kenza/knockback.png",
      victory:      "/assets/game/characters/sprites/kenza/victory.png",
      defeat:       "/assets/game/characters/sprites/kenza/defeat.png",
      critical_hit: "/assets/game/characters/sprites/kenza/critical_hit.png",
    },
    confidence: 80,
    notes: "Female in yellow blazer. BUFF SUMMON, COMMAND POINT, CELEBRATE VICTORY confirmed. 10×10 sheet sliced.",
  },
  denzel: {
    name: "Denzel the Agent",
    slug: "denzel",
    sprite:       null,
    portrait:     null,
    turnaround:   null,
    battleSprite: null,
    frames:       null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. No dedicated battle sprite found. TODO.",
  },
  arthur: {
    name: "Arthur the Advisor",
    slug: "arthur",
    sprite:       null,
    portrait:     null,
    turnaround:   null,
    battleSprite: null,
    frames:       null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. TODO: extract individual sprite.",
  },
  stanley: {
    name: "Stanley the Guardian",
    slug: "stanley",
    sprite:       null,
    portrait:     null,
    turnaround:   null,
    battleSprite: null,
    frames:       null,
    confidence: 85,
    notes: "Blue/gold armored knight turnaround noted. Individual turnaround file not confirmed on disk. TODO.",
  },
  joseph: {
    name: "Dr. Joseph the Healer",
    slug: "joseph",
    sprite:       null,
    portrait:     null,
    turnaround:   null,
    battleSprite: null,
    frames:       null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. TODO.",
  },
  champion: {
    name: "Collective Champion",
    slug: "champion",
    sprite:       null,
    portrait:     null,
    turnaround:   null,
    battleSprite: null,
    frames:       null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. TODO.",
  },
  ascended: {
    name: "The Architect Ascended",
    slug: "ascended",
    sprite:       null,
    portrait:     null,
    turnaround:   null,
    battleSprite: null,
    frames:       null,
    confidence: 55,
    notes: "Council Sage form visible in multi-character sheet. TODO.",
  },
};

export const getCharacterAsset = (slug: string): CharacterAssetEntry | null =>
  CHARACTER_ASSETS[slug] ?? null;

const stripPublic = (p: string | null): string | null =>
  !p ? null : p.startsWith("/public/") ? p.slice(7) : p;

export const getCharacterSpritePath = (spriteKey: string): string | null => {
  const slugMap: Record<string, string> = {
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
  const slug = slugMap[spriteKey];
  if (!slug) return null;
  const entry = CHARACTER_ASSETS[slug];
  return stripPublic(entry?.sprite ?? entry?.battleSprite ?? entry?.turnaround ?? null);
};

export const getCharacterPortraitPath = (spriteKey: string): string | null => {
  const slugMap: Record<string, string> = {
    "portrait-hataalii": "hataalii",
    "portrait-devon": "devon",
    "portrait-ahmed": "ahmed",
    "portrait-joseph": "joseph",
    "portrait-kenza": "kenza",
    "portrait-denzel": "denzel",
    "portrait-arthur": "arthur",
    "portrait-stanley": "stanley",
  };
  const slug = slugMap[spriteKey] ?? spriteKey.replace(/^portrait-/, "");
  const entry = CHARACTER_ASSETS[slug];
  return stripPublic(entry?.portrait ?? entry?.turnaround ?? entry?.sprite ?? null);
};

/** Resolve a specific animation frame path, falling back to idle then battleSprite */
export const getCharacterFrame = (
  spriteKey: string,
  animState: AnimState = "idle",
): string | null => {
  const slugMap: Record<string, string> = {
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
  const slug = slugMap[spriteKey];
  if (!slug) return null;
  const entry = CHARACTER_ASSETS[slug];
  if (!entry?.frames) return entry?.battleSprite ?? entry?.sprite ?? null;
  return entry.frames[animState] ?? entry.frames.idle ?? null;
};
