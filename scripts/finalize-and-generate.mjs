/**
 * finalize-and-generate.mjs
 * 1. Moves files to correct folders based on corrected categories
 * 2. Updates manifest filePaths
 * 3. Generates TypeScript registries
 */
import fs from "fs";
import path from "path";

const REPO = path.resolve(".");
const PUBLIC_GAME = path.join(REPO, "public", "assets", "game");
const MANIFEST_PATH = path.join(PUBLIC_GAME, "asset-manifest.json");

// Category → canonical folder
const CAT_FOLDER = {
  "CHARACTER_SPRITE_SHEET":         path.join(PUBLIC_GAME, "characters", "sprites"),
  "PLAYABLE_CHARACTER_SHEET":       path.join(PUBLIC_GAME, "characters", "turnarounds"),
  "PORTRAIT_OR_DIALOGUE_ASSET":     path.join(PUBLIC_GAME, "characters", "portraits"),
  "ENEMY_OR_BOSS_ART":              path.join(PUBLIC_GAME, "enemies", "sprites"),
  "ENVIRONMENT_BACKGROUND":         path.join(PUBLIC_GAME, "environments", "battle-backgrounds"),
  "HUB_MAP_OR_TILEMAP":             path.join(PUBLIC_GAME, "environments", "hubs"),
  "UI_ASSET":                       path.join(PUBLIC_GAME, "ui", "hud"),
  "PROMOTIONAL_OR_TITLE_ART":       path.join(PUBLIC_GAME, "title"),
  "UNKNOWN_REVIEW":                 path.join(PUBLIC_GAME, "_review", "unknown"),
  "ITEM_SPRITE_SHEET":              path.join(PUBLIC_GAME, "items", "sheets"),
  "CYBERPUNK_ITEM_SPRITE_SHEET":    path.join(PUBLIC_GAME, "items", "cyberpunk"),
  "CHARACTER_ENEMY_UI_SPRITE_SHEET": path.join(PUBLIC_GAME, "characters", "sprites"),
};

for (const d of Object.values(CAT_FOLDER)) fs.mkdirSync(d, { recursive: true });

const entries = JSON.parse(fs.readFileSync(MANIFEST_PATH));

// ── STEP 1: Move files to correct category folders + update filePath ──────
let moved = 0;
for (const e of entries) {
  if (e.sourceSheetId) continue; // sliced cells live by reference only
  const correctFolder = CAT_FOLDER[e.category];
  if (!correctFolder) continue;

  const currentAbs = path.join(REPO, e.filePath.replace(/^\//, "").replace(/\//g, path.sep));
  const correctAbs = path.join(correctFolder, e.sourceFileOriginalName);
  const correctRel = "/" + path.relative(REPO, correctAbs).replace(/\\/g, "/");

  if (currentAbs !== correctAbs && fs.existsSync(currentAbs)) {
    try {
      fs.mkdirSync(path.dirname(correctAbs), { recursive: true });
      fs.copyFileSync(currentAbs, correctAbs);
      moved++;
    } catch {}
  }
  e.filePath = correctRel;
}

// Also fix sliced cell paths (they live in items/icons or characters/sprites already)
for (const e of entries) {
  if (!e.sourceSheetId) continue;
  // Verify the file exists; if not, try to find it
  const abs = path.join(REPO, e.filePath.replace(/^\//, "").replace(/\//g, path.sep));
  if (!fs.existsSync(abs)) {
    e.notes = (e.notes || "") + " [MISSING SLICE]";
  }
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2));
console.log(`Moved/updated ${moved} file paths.`);

// ── STEP 2: Build lookup maps ─────────────────────────────────────────────
const byFile = {};
for (const e of entries) if (e.sourceFileOriginalName) byFile[e.sourceFileOriginalName] = e;

function fp(filename) {
  return byFile[filename]?.filePath ?? null;
}

// ── Named file mappings (from visual inspection) ───────────────────────────

// Characters
const CHAR_SPRITES = {
  hataalii:  fp("1776824652831.png"),   // Hataalii mage — battle sprites
  devon:     fp("1776824649078.png"),   // Devon scout — slash/dash sprites
  ahmed:     fp("1776825262236.png"),   // Ahmed strategist — ledger/coin
  kenza:     fp("1776824643708.png"),   // Kenza orchestrator — buff/command
  stanley:   null,                       // TODO: no dedicated battle sprite found
  denzel:    null,
  arthur:    null,
  joseph:    null,
  collective: null,
  ascended:  null,
};

const CHAR_TURNAROUNDS = {
  hataalii:  fp("1776824582721.png"),   // Male Architect Hero reference
  devon:     fp("1776825290175.png"),   // Tactical soldier FRONT/SIDE/BACK
  stanley:   fp("0f2d33b6-88b0-4a46-8828-7f8a3801750a.png"), // Blue armored guardian
  // Multi-char sheets
  multi1:    fp("1778216155291.png"),   // Arthur/Stanley/Joseph/Champion/Ascended
  multi2:    fp("1778216161817.png"),   // Arthur/Stanley/Joseph/Champion/Denzel action
};

// Enemies
const ENEMIES = {
  dataBreach:     fp("000c9fa0-159c-49e1-b996-bf36766ef46c.png"),
  mechEnforcer:   fp("1776824629863.png"),
  voidEntity:     fp("1776824635731.png"),
  voidEntity2:    fp("1776824638793.png"),
};

// Environments
const ENVS = {
  nexusCity:        fp("1776824600678.png"),   // title BG — Nexus skyline
  nexusBattle2:     fp("1776824616404.png"),   // second city bg
  councilChamber:   fp("06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png"), // Collective Strategic Council Chamber
  voidTitanArena:   fp("489b80e3-b76c-4b2e-8172-38864224a5c0.png"), // Void Titan Final Arena
  animusPrimeHub:   fp("0aa92427-06e1-4ac5-9e11-163a19186d39.png"), // Animus Prime Hub map
  animusFoundry:    fp("2d1a0488-130f-4499-8208-9595cc506bc6.png"), // Animus Prime Foundry battle bg
  gaiaFarm:         fp("0a65ba60-00c5-4498-a905-56438dc8c0dd.png"), // Gaia Synthesis eco-dome
  nexusLabsStudio:  fp("1a3ee97c-0ff8-4bc6-99df-09e2605c91fd.png"), // Nexus Labs media studio
  quantumHub:       fp("26c116bb-476c-4d9a-8ef0-b6fc3547ab91.png"), // Quantum Ledger Hub
  hybridHub:        fp("4568cfb0-efe1-4d37-af00-5695cb5f3ac9.png"), // Hybrid Living Hub
  vectorShiftHub:   fp("5c5cc82b-8739-4ee3-b0a6-70e9433c73a4.png"), // Vector Shift Logistics Hub
  binaryLoom:       fp("cf5b8096-6b0f-4bca-bdba-d89d064f7bb7.png"), // Binary Loom Foundry
  civicCore:        fp("b6ca84c5-1ce8-4347-86f7-13adc5879679.png"), // Civic Core Commons
  architectSpire:   fp("1776824619908.png"),   // Architect's Spire overworld hub map
  hubOverview:      fp("030bf3cf-5eed-4edc-aca0-2d662147c7f4.png"), // 5-hub overview
};

// Best available title background
const TITLE_BG = ENVS.nexusCity;
// Best battle background (default)
const DEFAULT_BATTLE_BG = ENVS.councilChamber;

// ── STEP 3: Write src/data/assetManifest.ts ────────────────────────────────
const assetManifestTs = `// AUTO-GENERATED — do not edit manually. Re-run scripts/finalize-and-generate.mjs
import type { AssetManifestEntry } from "@/types/game";
import manifestJson from "../../public/assets/game/asset-manifest.json";

export const GAME_ASSET_MANIFEST: AssetManifestEntry[] = manifestJson as unknown as AssetManifestEntry[];

export const ASSET_BY_SOURCE_FILE: Record<string, (typeof GAME_ASSET_MANIFEST)[0]> =
  Object.fromEntries(GAME_ASSET_MANIFEST.filter(e => e.sourceFileOriginalName).map(e => [e.sourceFileOriginalName, e]));

export const ASSET_BY_MANIFEST_ID: Record<string, (typeof GAME_ASSET_MANIFEST)[0]> =
  Object.fromEntries(GAME_ASSET_MANIFEST.map(e => [e.id, e]));
`;
fs.writeFileSync(path.join(REPO, "src", "data", "assetManifest.ts"), assetManifestTs);

// ── STEP 4: Write src/data/characterAssets.ts ──────────────────────────────
const PH = "/assets/game/_placeholder.png"; // never used — fallback is CSS

const characterAssetsTs = `// AUTO-GENERATED — do not edit manually
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
    sprite:      ${JSON.stringify(CHAR_SPRITES.hataalii)},
    portrait:    null,
    turnaround:  ${JSON.stringify(CHAR_TURNAROUNDS.hataalii)},
    battleSprite: ${JSON.stringify(CHAR_SPRITES.hataalii)},
    confidence: 95,
    notes: "Mage in gold/black robes with staff. Sprite sheet has labeled animation frames.",
  },
  devon: {
    name: "Devon Scout",
    slug: "devon",
    sprite:      ${JSON.stringify(CHAR_SPRITES.devon)},
    portrait:    null,
    turnaround:  ${JSON.stringify(CHAR_TURNAROUNDS.devon)},
    battleSprite: ${JSON.stringify(CHAR_SPRITES.devon)},
    confidence: 95,
    notes: "Tactical athlete in cyan gear. IDLE STANCE, SLASH attacks, DODGE ROLL confirmed.",
  },
  ahmed: {
    name: "Ahmed the Strategist",
    slug: "ahmed",
    sprite:      ${JSON.stringify(CHAR_SPRITES.ahmed)},
    portrait:    null,
    turnaround:  null,
    battleSprite: ${JSON.stringify(CHAR_SPRITES.ahmed)},
    confidence: 90,
    notes: "Blue suit character. OPEN LEDGER SPELL CAST, COIN SHOWER ATTACK confirmed.",
  },
  kenza: {
    name: "Kenza the Orchestrator",
    slug: "kenza",
    sprite:      ${JSON.stringify(CHAR_SPRITES.kenza)},
    portrait:    null,
    turnaround:  null,
    battleSprite: ${JSON.stringify(CHAR_SPRITES.kenza)},
    confidence: 80,
    notes: "Female in yellow blazer. BUFF SUMMON, COMMAND POINT, CELEBRATE VICTORY confirmed.",
  },
  denzel: {
    name: "Denzel the Agent",
    slug: "denzel",
    sprite:      null,
    portrait:    null,
    turnaround:  ${JSON.stringify(CHAR_TURNAROUNDS.multi2)},
    battleSprite: null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. No dedicated battle sprite found. TODO.",
  },
  arthur: {
    name: "Arthur the Advisor",
    slug: "arthur",
    sprite:      null,
    portrait:    null,
    turnaround:  ${JSON.stringify(CHAR_TURNAROUNDS.multi1)},
    battleSprite: null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. TODO: extract individual sprite.",
  },
  stanley: {
    name: "Stanley the Guardian",
    slug: "stanley",
    sprite:      null,
    portrait:    null,
    turnaround:  ${JSON.stringify(CHAR_TURNAROUNDS.stanley)},
    battleSprite: null,
    confidence: 85,
    notes: "Blue/gold armored knight turnaround confirmed. Battle sprite TODO.",
  },
  joseph: {
    name: "Dr. Joseph the Healer",
    slug: "joseph",
    sprite:      null,
    portrait:    null,
    turnaround:  ${JSON.stringify(CHAR_TURNAROUNDS.multi1)},
    battleSprite: null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. TODO.",
  },
  champion: {
    name: "Collective Champion",
    slug: "champion",
    sprite:      null,
    portrait:    null,
    turnaround:  ${JSON.stringify(CHAR_TURNAROUNDS.multi1)},
    battleSprite: null,
    confidence: 55,
    notes: "Visible in multi-character turnaround sheet. TODO.",
  },
  ascended: {
    name: "The Architect Ascended",
    slug: "ascended",
    sprite:      null,
    portrait:    null,
    turnaround:  ${JSON.stringify(CHAR_TURNAROUNDS.multi1)},
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
`;
fs.writeFileSync(path.join(REPO, "src", "data", "characterAssets.ts"), characterAssetsTs);

// ── STEP 5: Write src/data/divisionAssets.ts ──────────────────────────────
const divisionAssetsTs = `// AUTO-GENERATED — do not edit manually
export interface DivisionAssetEntry {
  name: string;
  slug: string;
  background: string | null;
  map: string | null;
  battleBackground: string | null;
  icon: string | null;
  confidence: number;
  notes: string;
}

export const DIVISION_ASSETS: Record<string, DivisionAssetEntry> = {
  zenflow: {
    name: "ZenFlow",
    slug: "zenflow",
    background:       null,
    map:              null,
    battleBackground: ${JSON.stringify(DEFAULT_BATTLE_BG)},
    icon:             null,
    confidence: 40,
    notes: "No dedicated ZenFlow environment found. Using default battle background. TODO.",
  },
  "kinetic-edge": {
    name: "Kinetic Edge",
    slug: "kinetic-edge",
    background:       null,
    map:              ${JSON.stringify(ENVS.hubOverview)},
    battleBackground: null,
    icon:             null,
    confidence: 50,
    notes: "Visible in 5-hub overview sheet. Dedicated hub map TODO.",
  },
  "quantum-ledger": {
    name: "Quantum Ledger",
    slug: "quantum-ledger",
    background:       ${JSON.stringify(ENVS.quantumHub)},
    map:              ${JSON.stringify(ENVS.quantumHub)},
    battleBackground: ${JSON.stringify(ENVS.quantumHub)},
    icon:             null,
    confidence: 95,
    notes: "Full Quantum Ledger Hub map confirmed with labeled areas.",
  },
  "civic-core": {
    name: "Civic Core",
    slug: "civic-core",
    background:       ${JSON.stringify(ENVS.civicCore)},
    map:              ${JSON.stringify(ENVS.civicCore)},
    battleBackground: ${JSON.stringify(ENVS.civicCore)},
    icon:             null,
    confidence: 85,
    notes: "Civic Core Commons environment confirmed (golden civic plaza style).",
  },
  "hybrid-living": {
    name: "Hybrid Living",
    slug: "hybrid-living",
    background:       ${JSON.stringify(ENVS.hybridHub)},
    map:              ${JSON.stringify(ENVS.hybridHub)},
    battleBackground: ${JSON.stringify(ENVS.hybridHub)},
    icon:             null,
    confidence: 95,
    notes: "Full Hybrid Living Hub map confirmed — academy, gardens, meditation hall.",
  },
  "vital-helix": {
    name: "Vital Helix",
    slug: "vital-helix",
    background:       null,
    map:              null,
    battleBackground: ${JSON.stringify(DEFAULT_BATTLE_BG)},
    icon:             null,
    confidence: 40,
    notes: "No dedicated Vital Helix environment found. TODO.",
  },
  "binary-loom": {
    name: "Binary Loom",
    slug: "binary-loom",
    background:       ${JSON.stringify(ENVS.binaryLoom)},
    map:              null,
    battleBackground: ${JSON.stringify(ENVS.binaryLoom)},
    icon:             null,
    confidence: 85,
    notes: "Binary Loom Infrastructure Foundry battle background confirmed.",
  },
  "gaia-synthesis": {
    name: "Gaia Synthesis",
    slug: "gaia-synthesis",
    background:       ${JSON.stringify(ENVS.gaiaFarm)},
    map:              null,
    battleBackground: ${JSON.stringify(ENVS.gaiaFarm)},
    icon:             null,
    confidence: 90,
    notes: "Gaia Synthesis Vertical Farm / Eco-Dome confirmed.",
  },
  "vector-shift": {
    name: "Vector Shift",
    slug: "vector-shift",
    background:       ${JSON.stringify(ENVS.vectorShiftHub)},
    map:              ${JSON.stringify(ENVS.vectorShiftHub)},
    battleBackground: ${JSON.stringify(ENVS.vectorShiftHub)},
    icon:             null,
    confidence: 90,
    notes: "Vector Shift Logistics Hub confirmed — drone docks, transit lift.",
  },
  "animus-prime": {
    name: "Animus Prime",
    slug: "animus-prime",
    background:       ${JSON.stringify(ENVS.animusPrimeHub)},
    map:              ${JSON.stringify(ENVS.animusPrimeHub)},
    battleBackground: ${JSON.stringify(ENVS.animusFoundry)},
    icon:             null,
    confidence: 90,
    notes: "Hub map + Foundry battle background both confirmed.",
  },
  "aether-link": {
    name: "Aether Link",
    slug: "aether-link",
    background:       null,
    map:              null,
    battleBackground: ${JSON.stringify(DEFAULT_BATTLE_BG)},
    icon:             null,
    confidence: 40,
    notes: "No dedicated Aether Link environment found. TODO.",
  },
  "obsidian-arc": {
    name: "Obsidian Arc",
    slug: "obsidian-arc",
    background:       null,
    map:              null,
    battleBackground: ${JSON.stringify(DEFAULT_BATTLE_BG)},
    icon:             null,
    confidence: 40,
    notes: "No dedicated Obsidian Arc environment found. TODO.",
  },
  "terra-axis": {
    name: "Terra Axis",
    slug: "terra-axis",
    background:       null,
    map:              null,
    battleBackground: ${JSON.stringify(DEFAULT_BATTLE_BG)},
    icon:             null,
    confidence: 40,
    notes: "No dedicated Terra Axis environment found. TODO.",
  },
  "nexus-labs": {
    name: "Nexus Labs",
    slug: "nexus-labs",
    background:       ${JSON.stringify(ENVS.nexusLabsStudio)},
    map:              ${JSON.stringify(ENVS.nexusLabsStudio)},
    battleBackground: ${JSON.stringify(ENVS.nexusLabsStudio)},
    icon:             null,
    confidence: 85,
    notes: "Nexus Labs Creative Media Studio Realm confirmed.",
  },
  "the-collective": {
    name: "The Collective",
    slug: "the-collective",
    background:       ${JSON.stringify(ENVS.councilChamber)},
    map:              ${JSON.stringify(ENVS.architectSpire)},
    battleBackground: ${JSON.stringify(ENVS.councilChamber)},
    icon:             null,
    confidence: 90,
    notes: "Collective Strategic Council Chamber confirmed. Architect's Spire hub map available.",
  },
};

export const getDivisionAsset = (slug: string): DivisionAssetEntry | null =>
  DIVISION_ASSETS[slug] ?? null;

export const getDivisionBackground = (divisionId: string): string | null => {
  const entry = DIVISION_ASSETS[divisionId];
  return entry?.battleBackground ?? ${JSON.stringify(DEFAULT_BATTLE_BG)};
};
`;
fs.writeFileSync(path.join(REPO, "src", "data", "divisionAssets.ts"), divisionAssetsTs);

// ── STEP 6: Write src/data/spriteSheetRegistry.ts ────────────────────────
const registryJson = JSON.parse(
  fs.readFileSync(path.join(PUBLIC_GAME, "sprite-sheet-registry.json"))
);

const spriteSheetTs = `// AUTO-GENERATED — do not edit manually
export interface SpriteSheetEntry {
  sourceFile: string;
  originalPath: string;
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  children: string[];
}

export const SPRITE_SHEET_REGISTRY: Record<string, SpriteSheetEntry> = ${JSON.stringify(registryJson, null, 2)} as const;

export const SHEET_CHILDREN: Record<string, string[]> =
  Object.fromEntries(Object.entries(SPRITE_SHEET_REGISTRY).map(([k, v]) => [k, v.children]));

export const getSheetChildren = (sheetId: string): string[] =>
  SPRITE_SHEET_REGISTRY[sheetId]?.children ?? [];
`;
fs.writeFileSync(path.join(REPO, "src", "data", "spriteSheetRegistry.ts"), spriteSheetTs);

// ── STEP 7: Write env constants used by components ────────────────────────
const envConstsTs = `// AUTO-GENERATED — do not edit manually
export const TITLE_BG_PATH   = ${JSON.stringify(TITLE_BG)};
export const DEFAULT_BATTLE_BG_PATH = ${JSON.stringify(DEFAULT_BATTLE_BG)};
export const VOID_TITAN_ARENA_PATH  = ${JSON.stringify(ENVS.voidTitanArena)};
export const ARCHITECTS_SPIRE_PATH  = ${JSON.stringify(ENVS.architectSpire)};
export const NEXUS_CITY_PATH        = ${JSON.stringify(ENVS.nexusCity)};
`;
fs.writeFileSync(path.join(REPO, "src", "data", "envAssets.ts"), envConstsTs);

console.log("✓ src/data/assetManifest.ts");
console.log("✓ src/data/characterAssets.ts");
console.log("✓ src/data/divisionAssets.ts");
console.log("✓ src/data/spriteSheetRegistry.ts");
console.log("✓ src/data/envAssets.ts");
console.log("\nAll TypeScript registries written.");
