export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
export type EquipSlot = "mainHand" | "offHand" | "helm" | "chest" | "legs" | "feet" | "ring" | "amulet";
export type ItemCategory = "weapon" | "armor" | "accessory" | "consumable" | "key" | "material";

export interface CharacterStats {
  strength: number;
  agility: number;
  wisdom: number;
  intelligence: number;
  endurance: number;
  charisma: number;
}

export interface StatusEffect {
  id: string;
  name: "Strength Buff" | "Defense Buff" | "Haste" | "Weakness" | "Stun" | "Poison";
  duration: number; // turns remaining
  magnitude: number; // % or flat depending on effect
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  kind: "attack" | "heal" | "buff" | "debuff" | "utility";
  power: number;
  hits?: number;
  critBonus?: number;
  applies?: Omit<StatusEffect, "id">[];
  targets: "single-enemy" | "all-enemies" | "single-ally" | "all-allies" | "self" | "lowest-hp-ally";
  synergyGain?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  lore?: string;
  category: ItemCategory;
  rarity: Rarity;
  slot?: EquipSlot;
  stats?: Partial<CharacterStats> & { attack?: number; defense?: number; magic?: number };
  value: number;
  iconKey: string;
  cosmeticVariant?: "branded" | "cyberpunk";
  consumableEffect?: { kind: "heal" | "mana" | "buff" | "revive"; magnitude: number; duration?: number };
}

export interface EquippedItems {
  mainHand?: string;
  offHand?: string;
  helm?: string;
  chest?: string;
  legs?: string;
  feet?: string;
  ring?: string;
  amulet?: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  role: "leader" | "dps" | "support" | "healer" | "tank";
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: CharacterStats;
  abilities: Ability[];
  equipped: EquippedItems;
  affinity: number;
  unlocked: boolean;
  portraitKey: string;
  spriteKey: string;
  bio: string;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  agility: number;
  abilities: Ability[];
  weaknesses: string[]; // ability ids or tags
  xp: number;
  goldDrop: [number, number];
  lootTable?: { itemId: string; chance: number }[];
  spriteKey: string;
  isBoss?: boolean;
}

export interface Division {
  id: string;
  name: string;
  specialty: string;
  leader?: string;
  power: number; // 0-100
  corruption: number; // 0-100
  unlocked: boolean;
  playable: boolean;
  description: string;
  questId?: string;
  bossId?: string;
  envSpriteKey: string;
  progress: number;
}

export interface Quest {
  id: string;
  divisionId: string;
  title: string;
  objective: string;
  bossId: string;
  rewards: { xp: number; gold: number; itemIds?: string[] };
  status: "locked" | "available" | "active" | "complete";
}

export type BattleSide = "party" | "enemy";
export interface BattleCombatant {
  side: BattleSide;
  refId: string; // character id or enemy instance id
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  agility: number;
  statuses: StatusEffect[];
  isDown: boolean;
}

export interface BattleLogEntry {
  id: string;
  text: string;
  kind: "info" | "damage" | "heal" | "crit" | "status" | "synergy" | "victory" | "defeat";
}

export interface BattleState {
  id: string;
  encounterId: string;
  party: BattleCombatant[];
  enemies: BattleCombatant[];
  turnOrder: string[]; // refIds
  turnIndex: number;
  round: number;
  synergy: number; // 0-100
  log: BattleLogEntry[];
  status: "active" | "victory" | "defeat";
  rewards?: { xp: number; gold: number; itemIds: string[]; divisionProgress: number };
}

export interface AudioAsset {
  id: string;
  path: string;
  kind: "music" | "sfx";
  loop?: boolean;
}

export interface AssetManifestEntry {
  id: string;
  name: string;
  category: "inventory" | "character" | "enemy" | "environment" | "effect" | "ui" | "portrait";
  sourceSheet?: string;
  row?: number;
  col?: number;
  frameWidth?: number;
  frameHeight?: number;
  publicPath?: string | null;
  fallbackIcon: string;
  tags: string[];
}

export type Screen =
  | "title"
  | "intro"
  | "hub"
  | "division"
  | "battle"
  | "inventory"
  | "party"
  | "settings"
  | "codex"
  | "victory"
  | "defeat";

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  cosmeticVariant: "branded" | "cyberpunk";
  textSpeed: "slow" | "normal" | "fast";
}

export interface GameState {
  version: number;
  screen: Screen;
  previousScreen: Screen;
  selectedDivisionId?: string;
  chapter: number;
  storyFlags: Record<string, boolean>;
  party: Character[];
  reserveParty: Character[];
  inventory: { itemId: string; quantity: number }[];
  gold: number;
  divisions: Division[];
  quests: Quest[];
  battle?: BattleState;
  settings: GameSettings;
  saveTimestamp?: number;
}
