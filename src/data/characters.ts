import type { Ability, Character } from "@/types/game";

export const ABILITIES: Record<string, Ability> = {
  basicStrike: {
    id: "basicStrike", name: "Basic Strike",
    description: "A measured blow.", mpCost: 0, kind: "attack", power: 10,
    targets: "single-enemy", synergyGain: 3,
  },
  architectsVision: {
    id: "architectsVision", name: "Architect's Vision",
    description: "Reveals enemy weakness and grants +10 synergy.",
    mpCost: 8, kind: "debuff", power: 0,
    applies: [{ name: "Weakness", duration: 3, magnitude: 25 }],
    targets: "single-enemy", synergyGain: 10,
  },
  swiftStrike: {
    id: "swiftStrike", name: "Swift Strike",
    description: "Three rapid hits with elevated crit chance.",
    mpCost: 6, kind: "attack", power: 7, hits: 3, critBonus: 0.25,
    targets: "single-enemy", synergyGain: 5,
  },
  riskAssessment: {
    id: "riskAssessment", name: "Risk Assessment",
    description: "Buffs party damage and reveals enemy intent.",
    mpCost: 10, kind: "buff", power: 0,
    applies: [{ name: "Strength Buff", duration: 3, magnitude: 20 }],
    targets: "all-allies", synergyGain: 8,
  },
  adaptiveHealing: {
    id: "adaptiveHealing", name: "Adaptive Healing",
    description: "Heals the lowest-HP ally.",
    mpCost: 8, kind: "heal", power: 45,
    targets: "lowest-hp-ally", synergyGain: 6,
  },
  defend: {
    id: "defend", name: "Defend",
    description: "Brace for impact (+50% defense this round).",
    mpCost: 0, kind: "buff", power: 0,
    applies: [{ name: "Defense Buff", duration: 1, magnitude: 50 }],
    targets: "self", synergyGain: 1,
  },
};

const baseChar = (over: Partial<Character>): Character => ({
  level: 1, xp: 0, hp: 100, maxHp: 100, mp: 30, maxMp: 30,
  equipped: {}, affinity: 50, unlocked: false,
  portraitKey: "portrait-default", spriteKey: "sprite-default",
  abilities: [ABILITIES.basicStrike, ABILITIES.defend],
  bio: "",
  stats: { strength: 10, agility: 10, wisdom: 10, intelligence: 10, endurance: 10, charisma: 10 },
  ...over,
} as Character);

export const HATAALII: Character = baseChar({
  id: "hataalii", name: "Hataalii", title: "The Architect",
  role: "leader", unlocked: true,
  hp: 120, maxHp: 120, mp: 40, maxMp: 40,
  stats: { strength: 14, agility: 12, wisdom: 18, intelligence: 14, endurance: 13, charisma: 16 },
  abilities: [ABILITIES.basicStrike, ABILITIES.architectsVision, ABILITIES.defend],
  portraitKey: "portrait-hataalii", spriteKey: "sprite-hataalii",
  bio: "Inheritor of the Architect's burden. Believes unity does not require uniformity.",
});

export const DEVON: Character = baseChar({
  id: "devon", name: "Devon Scout", title: "Kinetic Edge Champion",
  role: "dps", unlocked: true,
  hp: 95, maxHp: 95, mp: 24, maxMp: 24,
  stats: { strength: 15, agility: 18, wisdom: 11, intelligence: 12, endurance: 12, charisma: 13 },
  abilities: [ABILITIES.basicStrike, ABILITIES.swiftStrike, ABILITIES.defend],
  portraitKey: "portrait-devon", spriteKey: "sprite-devon",
  bio: "Stadium-born athlete who reads opponents like spreadsheets.",
});

export const AHMED: Character = baseChar({
  id: "ahmed", name: "Ahmed the Strategist", title: "Quantum Ledger Liaison",
  role: "support", unlocked: true,
  hp: 90, maxHp: 90, mp: 38, maxMp: 38,
  stats: { strength: 10, agility: 11, wisdom: 17, intelligence: 16, endurance: 10, charisma: 14 },
  abilities: [ABILITIES.basicStrike, ABILITIES.riskAssessment, ABILITIES.defend],
  portraitKey: "portrait-ahmed", spriteKey: "sprite-ahmed",
  bio: "Reads the market like the Nexus reads itself.",
});

export const DR_JOSEPH: Character = baseChar({
  id: "joseph", name: "Dr. Joseph", title: "Vital Helix Medic",
  role: "healer", unlocked: true,
  hp: 85, maxHp: 85, mp: 42, maxMp: 42,
  stats: { strength: 9, agility: 12, wisdom: 18, intelligence: 15, endurance: 11, charisma: 13 },
  abilities: [ABILITIES.basicStrike, ABILITIES.adaptiveHealing, ABILITIES.defend],
  portraitKey: "portrait-joseph", spriteKey: "sprite-joseph",
  bio: "Believes every wound carries information about the system that caused it.",
});

export const RESERVE: Character[] = [
  baseChar({ id: "kenza", name: "Kenza the Orchestrator", title: "Aether Link Pilot", role: "dps", spriteKey: "sprite-kenza", portraitKey: "portrait-kenza", bio: "Locked — meet at Aether Link." }),
  baseChar({ id: "denzel", name: "Denzel the Agent", title: "Civic Core Speaker", role: "support", spriteKey: "sprite-denzel", portraitKey: "portrait-denzel", bio: "Locked — meet at Civic Core." }),
  baseChar({ id: "arthur", name: "Arthur the Advisor", title: "Obsidian Arc Sentinel", role: "tank", spriteKey: "sprite-arthur", portraitKey: "portrait-arthur", bio: "Locked — meet at Obsidian Arc." }),
  baseChar({ id: "stanley", name: "Stanley the Guardian", title: "Nexus Labs Tinkerer", role: "support", spriteKey: "sprite-stanley", portraitKey: "portrait-stanley", bio: "Locked — meet at Nexus Labs." }),
];

export const STARTING_PARTY: Character[] = [HATAALII, DEVON, AHMED, DR_JOSEPH];
