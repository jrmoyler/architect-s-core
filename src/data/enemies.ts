import type { Enemy } from "@/types/game";

const enemyAttack = {
  id: "enemyAttack", name: "Strike", description: "A hostile blow.",
  mpCost: 0, kind: "attack" as const, power: 10, targets: "single-enemy" as const,
};

export const ENEMIES: Record<string, Enemy> = {
  "entropy-specter": {
    id: "entropy-specter", name: "Entropy Specter",
    hp: 60, maxHp: 60, attack: 8, defense: 3, agility: 9,
    abilities: [enemyAttack], weaknesses: ["architectsVision"],
    xp: 80, goldDrop: [40, 80],
    lootTable: [{ itemId: "recovery-serum", chance: 0.6 }],
    spriteKey: "sprite-entropy-specter",
  },
  "market-crash-goblin": {
    id: "market-crash-goblin", name: "Market Crash Goblin",
    hp: 90, maxHp: 90, attack: 12, defense: 5, agility: 11,
    abilities: [enemyAttack], weaknesses: ["riskAssessment"],
    xp: 120, goldDrop: [60, 120],
    lootTable: [{ itemId: "market-liquidity-flask", chance: 0.5 }],
    spriteKey: "sprite-market-goblin",
  },
  "tournament-champion": {
    id: "tournament-champion", name: "Tournament Champion",
    hp: 180, maxHp: 180, attack: 16, defense: 8, agility: 16,
    abilities: [enemyAttack], weaknesses: ["riskAssessment"],
    xp: 320, goldDrop: [150, 250],
    lootTable: [
      { itemId: "kinetic-fang", chance: 0.7 },
      { itemId: "runners-greaves", chance: 0.5 },
      { itemId: "momentum-booster", chance: 0.6 },
    ],
    spriteKey: "sprite-tournament-champion", isBoss: true,
  },
  "debt-dragon": {
    id: "debt-dragon", name: "Debt Dragon",
    hp: 220, maxHp: 220, attack: 18, defense: 14, agility: 8,
    abilities: [enemyAttack], weaknesses: ["riskAssessment"],
    xp: 400, goldDrop: [180, 280],
    lootTable: [
      { itemId: "ledger-buckler", chance: 0.7 },
      { itemId: "polymarket-gem", chance: 0.4 },
      { itemId: "protocol-key", chance: 0.5 },
    ],
    spriteKey: "sprite-debt-dragon", isBoss: true,
  },
};
