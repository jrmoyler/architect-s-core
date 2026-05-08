// AUTO-GENERATED — do not edit manually
export interface CharacterAssetEntry {
  name: string;
  slug: string;
  sprite: string | null;          // battle sprite sheet path
  portrait: string | null;
  turnaround: string | null;
  battleSprite: string | null;    // same as sprite for now
  confidence: number;
  notes: string;
}

export const CHARACTER_ASSETS: Record<string, CharacterAssetEntry> = {
  hataalii: {
    name: "Hataalii the Architect",
    slug: "hataalii",
    sprite:      "/public/assets/game/items/icons/asset-1776824652831-r10-c10.png",
    portrait:    null,
    turnaround:  "/public/assets/game/characters/turnarounds/1776824582721.png",
    battleSprite: "/public/assets/game/items/icons/asset-1776824652831-r10-c10.png",
    confidence: 95,
    notes: "Mage in gold/black robes with staff. Sprite sheet has labeled animation frames.",
  },
  devon: {
    name: "Devon Scout",
    slug: "devon",
    sprite:      "/public/assets/game/items/icons/asset-1776824649078-r10-c10.png",
    portrait:    null,
    turnaround:  "/public/assets/game/environments/battle-backgrounds/1776825290175.png",
    battleSprite: "/public/assets/game/items/icons/asset-1776824649078-r10-c10.png",
    confidence: 95,
    notes: "Tactical athlete in cyan gear. IDLE STANCE, SLASH attacks, DODGE ROLL confirmed.",
  },
  ahmed: {
    name: "Ahmed the Strategist",
    slug: "ahmed",
    sprite:      "/public/assets/game/characters/sprites/asset-1776825262236-r10-c10.png",
    portrait:    null,
    turnaround:  null,
    battleSprite: "/public/assets/game/characters/sprites/asset-1776825262236-r10-c10.png",
    confidence: 90,
    notes: "Blue suit character. OPEN LEDGER SPELL CAST, COIN SHOWER ATTACK confirmed.",
  },
  kenza: {
    name: "Kenza the Orchestrator",
    slug: "kenza",
    sprite:      "/public/assets/game/items/icons/asset-1776824643708-r10-c10.png",
    portrait:    null,
    turnaround:  null,
    battleSprite: "/public/assets/game/items/icons/asset-1776824643708-r10-c10.png",
    confidence: 80,
    notes: "Female in yellow blazer. BUFF SUMMON, COMMAND POINT, CELEBRATE VICTORY confirmed.",
  },
  denzel: {
    name: "Denzel the Agent",
    slug: "denzel",
    sprite:      null,
    portrait:    null,
    turnaround:  "/public/assets/game/characters/sprites/1778216161817.png",
    battleSprite: null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. No dedicated battle sprite found. TODO.",
  },
  arthur: {
    name: "Arthur the Advisor",
    slug: "arthur",
    sprite:      null,
    portrait:    null,
    turnaround:  "/public/assets/game/characters/sprites/1778216155291.png",
    battleSprite: null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. TODO: extract individual sprite.",
  },
  stanley: {
    name: "Stanley the Guardian",
    slug: "stanley",
    sprite:      null,
    portrait:    null,
    turnaround:  "/public/assets/game/characters/turnarounds/0f2d33b6-88b0-4a46-8828-7f8a3801750a.png",
    battleSprite: null,
    confidence: 85,
    notes: "Blue/gold armored knight turnaround confirmed. Battle sprite TODO.",
  },
  joseph: {
    name: "Dr. Joseph the Healer",
    slug: "joseph",
    sprite:      null,
    portrait:    null,
    turnaround:  "/public/assets/game/characters/sprites/1778216155291.png",
    battleSprite: null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. TODO.",
  },
  champion: {
    name: "Collective Champion",
    slug: "champion",
    sprite:      null,
    portrait:    null,
    turnaround:  "/public/assets/game/characters/sprites/1778216155291.png",
    battleSprite: null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. TODO.",
  },
  ascended: {
    name: "The Architect Ascended",
    slug: "ascended",
    sprite:      null,
    portrait:    null,
    turnaround:  "/public/assets/game/characters/sprites/1778216155291.png",
    battleSprite: null,
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
