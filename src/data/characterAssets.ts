// Character asset registry — paths are relative to Next.js public/ root
// Next.js serves public/ at /, so paths start with /assets/ (NOT /public/assets/)

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
    sprite:       "/assets/game/characters/sprites/hataalii/idle.png",
    portrait:     "/assets/game/characters/turnarounds/1776824582721.png",
    turnaround:   "/assets/game/characters/turnarounds/1776824582721.png",
    battleSprite: "/assets/game/characters/sprites/hataalii/idle.png",
    frames: {
      idle:         "/assets/game/characters/sprites/hataalii/idle.png",
      walk:         "/assets/game/characters/sprites/hataalii/walk.png",
      slash:        "/assets/game/characters/sprites/hataalii/slash.png",
      slash_heavy:  "/assets/game/characters/sprites/hataalii/slash_heavy.png",
      cast:         "/assets/game/characters/sprites/hataalii/cast.png",
      hurt:         "/assets/game/characters/sprites/hataalii/hurt.png",
      knockback:    "/assets/game/characters/sprites/hataalii/knockback.png",
      victory:      "/assets/game/characters/sprites/hataalii/victory.png",
      defeat:       "/assets/game/characters/sprites/hataalii/defeat.png",
      critical_hit: "/assets/game/characters/sprites/hataalii/critical_hit.png",
    },
    confidence: 95,
    notes: "Mage in gold/black robes with staff. 10×10 sheet sliced — all 10 animation rows confirmed.",
  },
  devon: {
    name: "Devon Scout",
    slug: "devon",
    sprite:       "/assets/game/characters/sprites/devon/idle.png",
    portrait:     null,
    turnaround:   null,
    battleSprite: "/assets/game/characters/sprites/devon/idle.png",
    frames: {
      idle:         "/assets/game/characters/sprites/devon/idle.png",
      walk:         "/assets/game/characters/sprites/devon/walk.png",
      slash:        "/assets/game/characters/sprites/devon/slash.png",
      slash_heavy:  "/assets/game/characters/sprites/devon/slash_heavy.png",
      cast:         "/assets/game/characters/sprites/devon/cast.png",
      hurt:         "/assets/game/characters/sprites/devon/hurt.png",
      knockback:    "/assets/game/characters/sprites/devon/knockback.png",
      victory:      "/assets/game/characters/sprites/devon/victory.png",
      defeat:       "/assets/game/characters/sprites/devon/defeat.png",
      critical_hit: "/assets/game/characters/sprites/devon/critical_hit.png",
    },
    confidence: 95,
    notes: "Tactical athlete in cyan gear. IDLE STANCE, SLASH, DODGE ROLL confirmed. 10×10 sheet sliced.",
  },
  ahmed: {
    name: "Ahmed the Strategist",
    slug: "ahmed",
    sprite:       "/assets/game/characters/sprites/ahmed/idle.png",
    portrait:     null,
    turnaround:   null,
    battleSprite: "/assets/game/characters/sprites/ahmed/idle.png",
    frames: {
      idle:         "/assets/game/characters/sprites/ahmed/idle.png",
      walk:         "/assets/game/characters/sprites/ahmed/walk.png",
      slash:        "/assets/game/characters/sprites/ahmed/slash.png",
      slash_heavy:  "/assets/game/characters/sprites/ahmed/slash_heavy.png",
      cast:         "/assets/game/characters/sprites/ahmed/cast.png",
      hurt:         "/assets/game/characters/sprites/ahmed/hurt.png",
      knockback:    "/assets/game/characters/sprites/ahmed/knockback.png",
      victory:      "/assets/game/characters/sprites/ahmed/victory.png",
      defeat:       "/assets/game/characters/sprites/ahmed/defeat.png",
      critical_hit: "/assets/game/characters/sprites/ahmed/critical_hit.png",
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
  return slug ? (CHARACTER_ASSETS[slug]?.sprite ?? null) : null;
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
