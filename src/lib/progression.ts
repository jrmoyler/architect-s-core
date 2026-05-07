import type { Character } from "@/types/game";

export const xpForLevel = (level: number) => Math.floor(100 * Math.pow(level, 1.5));

export const grantXp = (c: Character, gained: number): { character: Character; leveled: number } => {
  let leveled = 0;
  let xp = c.xp + gained;
  let level = c.level;
  let stats = { ...c.stats };
  let maxHp = c.maxHp;
  let maxMp = c.maxMp;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
    leveled++;
    stats = {
      strength: stats.strength + 1,
      agility: stats.agility + 1,
      wisdom: stats.wisdom + 1,
      intelligence: stats.intelligence + 1,
      endurance: stats.endurance + 1,
      charisma: stats.charisma + 1,
    };
    maxHp += 10;
    maxMp += 4;
  }
  return {
    character: { ...c, level, xp, stats, maxHp, maxMp, hp: Math.min(c.hp + leveled * 10, maxHp), mp: Math.min(c.mp + leveled * 4, maxMp) },
    leveled,
  };
};
