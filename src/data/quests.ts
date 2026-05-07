import type { Quest } from "@/types/game";

export const QUESTS: Quest[] = [
  {
    id: "kinetic-tournament", divisionId: "kinetic-edge",
    title: "Win the Championship Tournament",
    objective: "Defeat the rival factions and the Tournament Champion in the Stadium of Motion.",
    bossId: "tournament-champion",
    rewards: { xp: 320, gold: 200, itemIds: ["kinetic-fang", "momentum-booster"] },
    status: "available",
  },
  {
    id: "quantum-strategy", divisionId: "quantum-ledger",
    title: "Execute a 1000-Point Trading Strategy",
    objective: "Outlast the Debt Dragon on the Trading Floor of Infinite Possibility.",
    bossId: "debt-dragon",
    rewards: { xp: 400, gold: 250, itemIds: ["polymarket-gem", "protocol-key"] },
    status: "available",
  },
];
