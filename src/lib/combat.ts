import type { Ability, BattleCombatant, Character, Enemy, StatusEffect } from "@/types/game";
import { synergyDamageMultiplier } from "./synergy";

export const rollCrit = (bonus = 0): boolean => Math.random() < 0.1 + bonus;

const statusMag = (statuses: StatusEffect[], name: StatusEffect["name"]) => {
  const e = statuses.find(s => s.name === name);
  return e?.magnitude ?? 0;
};

export const computeAttackDamage = (params: {
  attackerStrength: number;
  weaponBase: number;
  enemyDefense: number;
  attackerStatuses: StatusEffect[];
  defenderStatuses: StatusEffect[];
  isCrit?: boolean;
  synergy: number;
}): number => {
  const { attackerStrength, weaponBase, enemyDefense, attackerStatuses, defenderStatuses, isCrit, synergy } = params;
  const strBuff = 1 + statusMag(attackerStatuses, "Strength Buff") / 100;
  const weakness = 1 + statusMag(defenderStatuses, "Weakness") / 100;
  const defBuff = 1 + statusMag(defenderStatuses, "Defense Buff") / 100;
  const critMult = isCrit ? 1.75 : 1.0;
  const synMult = synergyDamageMultiplier(synergy);
  const raw = (weaponBase + Math.floor(attackerStrength * 0.6)) * critMult * strBuff * weakness * synMult;
  const dmg = Math.floor(raw - enemyDefense * defBuff);
  return Math.max(1, dmg);
};

export const computeHealing = (spellBase: number, wisdom: number): number =>
  spellBase + Math.floor(wisdom * 0.8);

export const buildPartyCombatant = (c: Character, equippedAttack: number, equippedDefense: number): BattleCombatant => ({
  side: "party", refId: c.id, hp: c.hp, maxHp: c.maxHp, mp: c.mp, maxMp: c.maxMp,
  agility: c.stats.agility, statuses: [], isDown: c.hp <= 0,
});

export const buildEnemyCombatant = (e: Enemy, instanceId: string): BattleCombatant => ({
  side: "enemy", refId: instanceId, hp: e.hp, maxHp: e.maxHp, mp: 0, maxMp: 0,
  agility: e.agility, statuses: [], isDown: false,
});

export const turnOrder = (combatants: BattleCombatant[]): string[] => {
  return combatants
    .filter(c => !c.isDown)
    .map(c => ({ id: c.refId, score: c.agility + Math.random() * 4 }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.id);
};

export const tickStatuses = (statuses: StatusEffect[]): StatusEffect[] =>
  statuses.map(s => ({ ...s, duration: s.duration - 1 })).filter(s => s.duration > 0);

export const isStunned = (statuses: StatusEffect[]) => statuses.some(s => s.name === "Stun");

export const applyAbilityToTarget = (
  ability: Ability,
  baseDamageOrHeal: number,
  target: BattleCombatant
): BattleCombatant => {
  const next = { ...target };
  if (ability.kind === "attack") {
    next.hp = Math.max(0, next.hp - baseDamageOrHeal);
    if (next.hp === 0) next.isDown = true;
  } else if (ability.kind === "heal") {
    if (!next.isDown) next.hp = Math.min(next.maxHp, next.hp + baseDamageOrHeal);
  }
  if (ability.applies) {
    const newStatuses = ability.applies.map((s, i) => ({ ...s, id: `${ability.id}-${Date.now()}-${i}` }));
    next.statuses = [...next.statuses, ...newStatuses];
  }
  return next;
};
