import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type {
  BattleCombatant, BattleLogEntry, BattleState, Character, Enemy, GameSettings, GameState, Screen,
} from "@/types/game";
import { STARTING_PARTY, RESERVE, ABILITIES } from "@/data/characters";
import { DIVISIONS } from "@/data/divisions";
import { QUESTS } from "@/data/quests";
import { ALL_ITEMS, ITEM_BY_ID } from "@/data/items";
import { ENEMIES } from "@/data/enemies";
import {
  applyAbilityToTarget, buildEnemyCombatant, buildPartyCombatant,
  computeAttackDamage, computeHealing, isStunned, rollCrit, tickStatuses, turnOrder,
} from "@/lib/combat";
import { synergyTier } from "@/lib/synergy";
import { saveSystem } from "@/lib/saveSystem";
import { audio } from "@/lib/audioManager";
import { grantXp } from "@/lib/progression";

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.7, musicVolume: 0.6, sfxVolume: 0.8,
  cosmeticVariant: "branded", textSpeed: "normal",
};

const initialState = (): GameState => ({
  version: 1, screen: "title", previousScreen: "title",
  chapter: 1, storyFlags: {},
  party: STARTING_PARTY.map(c => ({ ...c, equipped: { ...c.equipped } })),
  reserveParty: RESERVE,
  inventory: [
    { itemId: "initiate-blade", quantity: 1 },
    { itemId: "novice-shield", quantity: 1 },
    { itemId: "recovery-serum", quantity: 5 },
    { itemId: "momentum-booster", quantity: 1 },
    { itemId: "initiate-tunic", quantity: 1 },
    { itemId: "scout-cap", quantity: 1 },
  ],
  gold: 100,
  divisions: DIVISIONS.map(d => ({ ...d })),
  quests: QUESTS.map(q => ({ ...q })),
  settings: DEFAULT_SETTINGS,
});

type Action =
  | { type: "SET_SCREEN"; screen: Screen }
  | { type: "REPLACE_STATE"; state: GameState }
  | { type: "SELECT_DIVISION"; id: string }
  | { type: "SET_SETTINGS"; settings: Partial<GameSettings> }
  | { type: "EQUIP"; charId: string; itemId: string }
  | { type: "UNEQUIP"; charId: string; slot: keyof Character["equipped"] }
  | { type: "ADD_ITEM"; itemId: string; quantity?: number }
  | { type: "REMOVE_ITEM"; itemId: string; quantity?: number }
  | { type: "ADD_GOLD"; amount: number }
  | { type: "SET_BATTLE"; battle?: BattleState }
  | { type: "UPDATE_PARTY"; party: Character[] }
  | { type: "UPDATE_DIVISION"; id: string; patch: Partial<typeof DIVISIONS[number]> }
  | { type: "SET_FLAG"; key: string; value: boolean };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, previousScreen: state.screen, screen: action.screen };
    case "REPLACE_STATE":
      return action.state;
    case "SELECT_DIVISION":
      return { ...state, selectedDivisionId: action.id };
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "ADD_ITEM": {
      const q = action.quantity ?? 1;
      const found = state.inventory.find(i => i.itemId === action.itemId);
      const inv = found
        ? state.inventory.map(i => i.itemId === action.itemId ? { ...i, quantity: i.quantity + q } : i)
        : [...state.inventory, { itemId: action.itemId, quantity: q }];
      return { ...state, inventory: inv };
    }
    case "REMOVE_ITEM": {
      const q = action.quantity ?? 1;
      const inv = state.inventory
        .map(i => i.itemId === action.itemId ? { ...i, quantity: i.quantity - q } : i)
        .filter(i => i.quantity > 0);
      return { ...state, inventory: inv };
    }
    case "ADD_GOLD":
      return { ...state, gold: Math.max(0, state.gold + action.amount) };
    case "EQUIP": {
      const item = ITEM_BY_ID[action.itemId];
      if (!item?.slot) return state;
      const party = state.party.map(c => {
        if (c.id !== action.charId) return c;
        return { ...c, equipped: { ...c.equipped, [item.slot!]: action.itemId } };
      });
      // Move previously equipped item back to inventory; remove the new one
      const prev = state.party.find(c => c.id === action.charId)?.equipped[item.slot!];
      let inv = state.inventory;
      const existing = inv.find(i => i.itemId === action.itemId);
      if (existing && existing.quantity > 1) {
        inv = inv.map(i => i.itemId === action.itemId ? { ...i, quantity: i.quantity - 1 } : i);
      } else {
        inv = inv.filter(i => i.itemId !== action.itemId);
      }
      if (prev) {
        const prevExisting = inv.find(i => i.itemId === prev);
        inv = prevExisting
          ? inv.map(i => i.itemId === prev ? { ...i, quantity: i.quantity + 1 } : i)
          : [...inv, { itemId: prev, quantity: 1 }];
      }
      return { ...state, party, inventory: inv };
    }
    case "UNEQUIP": {
      const char = state.party.find(c => c.id === action.charId);
      const itemId = char?.equipped[action.slot];
      if (!itemId) return state;
      const party = state.party.map(c => {
        if (c.id !== action.charId) return c;
        const eq = { ...c.equipped }; delete eq[action.slot];
        return { ...c, equipped: eq };
      });
      const existing = state.inventory.find(i => i.itemId === itemId);
      const inv = existing
        ? state.inventory.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...state.inventory, { itemId, quantity: 1 }];
      return { ...state, party, inventory: inv };
    }
    case "SET_BATTLE":
      return { ...state, battle: action.battle };
    case "UPDATE_PARTY":
      return { ...state, party: action.party };
    case "UPDATE_DIVISION":
      return { ...state, divisions: state.divisions.map(d => d.id === action.id ? { ...d, ...action.patch } : d) };
    case "SET_FLAG":
      return { ...state, storyFlags: { ...state.storyFlags, [action.key]: action.value } };
    default: return state;
  }
}

export interface GameStoreApi {
  state: GameState;
  setScreen: (s: Screen) => void;
  selectDivision: (id: string) => void;
  startBattle: (encounterId: string, enemyIds: string[]) => void;
  performAbility: (abilityId: string, targetRefId?: string, itemId?: string) => void;
  endBattle: (status: "victory" | "defeat") => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
  newGame: () => void;
  hasSave: boolean;
  setSettings: (s: Partial<GameSettings>) => void;
  equip: (charId: string, itemId: string) => void;
  unequip: (charId: string, slot: keyof Character["equipped"]) => void;
  useConsumable: (itemId: string, charId: string) => void;
  pushFloating: (text: string, kind: "damage" | "heal" | "crit" | "info") => void;
  floating: { id: number; text: string; kind: string; targetRefId?: string }[];
}

const Ctx = createContext<GameStoreApi | null>(null);

export const useGame = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGame must be inside GameProvider");
  return c;
};

const aliveEnemies = (b: BattleState) => b.enemies.filter(e => !e.isDown);
const aliveParty = (b: BattleState) => b.party.filter(p => !p.isDown);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const floatingId = useRef(0);
  const [floating, setFloating] = useReducer(
    (s: GameStoreApi["floating"], a: { type: "add"; v: GameStoreApi["floating"][number] } | { type: "remove"; id: number }) =>
      a.type === "add" ? [...s, a.v] : s.filter(f => f.id !== a.id),
    [] as GameStoreApi["floating"]
  );

  const pushFloating: GameStoreApi["pushFloating"] = (text, kind) => {
    const id = ++floatingId.current;
    setFloating({ type: "add", v: { id, text, kind } });
    setTimeout(() => setFloating({ type: "remove", id }), 1100);
  };

  const setScreen = (s: Screen) => {
    dispatch({ type: "SET_SCREEN", screen: s });
    audio.playSfx("sfx-select");
    if (s === "hub") audio.playMusic("hub");
    if (s === "title") audio.playMusic("title");
    if (s === "battle") audio.playMusic("battle");
    if (s === "victory") audio.playMusic("victory");
    if (s === "defeat") audio.playMusic("gameover");
  };

  const selectDivision = (id: string) => {
    dispatch({ type: "SELECT_DIVISION", id });
    setScreen("division");
  };

  const equippedAttack = (c: Character): number => {
    const w = c.equipped.mainHand ? ITEM_BY_ID[c.equipped.mainHand] : undefined;
    return (w?.stats?.attack ?? 5);
  };
  const equippedDefense = (c: Character): number => {
    let total = 0;
    (["offHand", "helm", "chest", "legs", "feet"] as const).forEach(slot => {
      const id = c.equipped[slot]; if (!id) return;
      total += ITEM_BY_ID[id]?.stats?.defense ?? 0;
    });
    return total;
  };

  const startBattle = (encounterId: string, enemyIds: string[]) => {
    const partyCombatants = state.party.map(c =>
      buildPartyCombatant(c, equippedAttack(c), equippedDefense(c))
    );
    const enemyCombatants = enemyIds.map((eid, idx) => {
      const e = ENEMIES[eid];
      return buildEnemyCombatant(e, `${eid}#${idx}`);
    });
    const all = [...partyCombatants, ...enemyCombatants];
    const battle: BattleState = {
      id: `b-${Date.now()}`, encounterId,
      party: partyCombatants, enemies: enemyCombatants,
      turnOrder: turnOrder(all), turnIndex: 0, round: 1,
      synergy: 50,
      log: [{ id: "init", text: "Battle begins. The Nexus watches.", kind: "info" }],
      status: "active",
    };
    dispatch({ type: "SET_BATTLE", battle });
    setScreen("battle");
    if (enemyIds.some(id => ENEMIES[id]?.isBoss)) audio.playMusic("boss");
  };

  // ---- Combat resolution ----
  const findCombatant = (b: BattleState, refId: string): { c?: BattleCombatant; side?: "party" | "enemy" } => {
    const p = b.party.find(c => c.refId === refId);
    if (p) return { c: p, side: "party" };
    const e = b.enemies.find(c => c.refId === refId);
    if (e) return { c: e, side: "enemy" };
    return {};
  };

  const replaceCombatant = (b: BattleState, side: "party" | "enemy", updated: BattleCombatant): BattleState => {
    if (side === "party") return { ...b, party: b.party.map(c => c.refId === updated.refId ? updated : c) };
    return { ...b, enemies: b.enemies.map(c => c.refId === updated.refId ? updated : c) };
  };

  const log = (b: BattleState, text: string, kind: BattleLogEntry["kind"]): BattleState => ({
    ...b, log: [...b.log, { id: `${b.log.length}-${Date.now()}`, text, kind }].slice(-30),
  });

  const advanceTurn = (b: BattleState): BattleState => {
    let next = { ...b };
    let idx = next.turnIndex + 1;
    if (idx >= next.turnOrder.length) {
      // End of round: tick statuses, recompute turn order
      const tickAll = <T extends BattleCombatant>(arr: T[]): T[] =>
        arr.map(c => ({ ...c, statuses: tickStatuses(c.statuses) }));
      next = { ...next, party: tickAll(next.party), enemies: tickAll(next.enemies) };
      next.round += 1;
      next.turnOrder = turnOrder([...next.party, ...next.enemies]);
      idx = 0;
    }
    next.turnIndex = idx;
    // Check victory/defeat
    if (aliveEnemies(next).length === 0) next.status = "victory";
    else if (aliveParty(next).length === 0) next.status = "defeat";
    return next;
  };

  const enemyTakeTurn = (b: BattleState, attackerRefId: string): BattleState => {
    const attacker = b.enemies.find(c => c.refId === attackerRefId);
    if (!attacker || attacker.isDown) return b;
    if (isStunned(attacker.statuses)) {
      return log(b, `${enemyDisplayName(attackerRefId)} is stunned!`, "status");
    }
    const targets = aliveParty(b);
    if (!targets.length) return b;
    const target = targets[Math.floor(Math.random() * targets.length)];
    const enemyDef = (() => {
      const ch = state.party.find(c => c.id === target.refId);
      return ch ? equippedDefense(ch) : 0;
    })();
    const enemyData = ENEMIES[attackerRefId.split("#")[0]];
    const isCrit = rollCrit(0);
    const dmg = computeAttackDamage({
      attackerStrength: enemyData.attack * 2,
      weaponBase: enemyData.attack,
      enemyDefense: enemyDef,
      attackerStatuses: attacker.statuses,
      defenderStatuses: target.statuses,
      isCrit,
      synergy: 50, // enemies don't use synergy
    });
    const updated: BattleCombatant = { ...target, hp: Math.max(0, target.hp - dmg) };
    if (updated.hp === 0) updated.isDown = true;
    const partyChar = state.party.find(c => c.id === target.refId);
    pushFloating(`-${dmg}${isCrit ? "!" : ""}`, isCrit ? "crit" : "damage");
    audio.playSfx("sfx-attack");
    let next = replaceCombatant(b, "party", updated);
    next = log(next, `${enemyData.name} hits ${partyChar?.name ?? "ally"} for ${dmg}${isCrit ? " (CRIT!)" : ""}.`, isCrit ? "crit" : "damage");
    // Enemy turn slightly reduces synergy
    next.synergy = Math.max(0, next.synergy - 4);
    return next;
  };

  const enemyDisplayName = (refId: string) => ENEMIES[refId.split("#")[0]]?.name ?? "Enemy";

  const performAbility: GameStoreApi["performAbility"] = (abilityId, targetRefId, itemId) => {
    const b = stateRef.current.battle;
    if (!b || b.status !== "active") return;
    const currentRefId = b.turnOrder[b.turnIndex];
    const isPartyTurn = b.party.some(p => p.refId === currentRefId);
    if (!isPartyTurn) return;

    const character = state.party.find(c => c.id === currentRefId)!;
    let next = { ...b };

    if (abilityId === "use-item" && itemId) {
      const item = ITEM_BY_ID[itemId];
      const eff = item?.consumableEffect;
      if (!eff) return;
      // target lowest hp ally if heal
      const tgts = aliveParty(next);
      const target = eff.kind === "heal"
        ? [...tgts].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]
        : tgts.find(t => t.refId === (targetRefId ?? currentRefId)) ?? next.party.find(p => p.refId === currentRefId)!;
      if (eff.kind === "heal") {
        const updated = { ...target, hp: Math.min(target.maxHp, target.hp + eff.magnitude) };
        next = replaceCombatant(next, "party", updated);
        pushFloating(`+${eff.magnitude}`, "heal");
        next = log(next, `${character.name} uses ${item.name}: heals ${eff.magnitude} HP.`, "heal");
      } else if (eff.kind === "mana") {
        const updated = { ...target, mp: Math.min(target.maxMp, target.mp + eff.magnitude) };
        next = replaceCombatant(next, "party", updated);
        next = log(next, `${character.name} uses ${item.name}: restores ${eff.magnitude} MP.`, "info");
      } else if (eff.kind === "buff") {
        const updated = { ...target, statuses: [...target.statuses, { id: `haste-${Date.now()}`, name: "Haste" as const, duration: eff.duration ?? 3, magnitude: eff.magnitude }] };
        next = replaceCombatant(next, "party", updated);
        next = log(next, `${character.name} uses ${item.name}: Haste granted.`, "status");
      }
      audio.playSfx("sfx-heal");
      // Consume
      dispatch({ type: "REMOVE_ITEM", itemId, quantity: 1 });
      next.synergy = Math.min(100, next.synergy + 2);
      next = advanceTurn(next);
      dispatch({ type: "SET_BATTLE", battle: next });
      scheduleEnemyTurns(next);
      return;
    }

    const ability = character.abilities.find(a => a.id === abilityId);
    if (!ability) return;
    const partyComb = next.party.find(p => p.refId === character.id)!;
    if (partyComb.mp < ability.mpCost) {
      next = log(next, `${character.name} lacks the focus (MP) for ${ability.name}.`, "info");
      dispatch({ type: "SET_BATTLE", battle: next });
      return;
    }
    // Spend MP
    const spentSelf = { ...partyComb, mp: partyComb.mp - ability.mpCost };
    next = replaceCombatant(next, "party", spentSelf);

    const equippedW = equippedAttack(character);

    if (ability.kind === "attack") {
      const target = next.enemies.find(e => e.refId === targetRefId && !e.isDown) ?? aliveEnemies(next)[0];
      if (!target) return;
      const enemyData = ENEMIES[target.refId.split("#")[0]];
      let dmgTotal = 0;
      let updatedTarget = target;
      const hits = ability.hits ?? 1;
      let crits = 0;
      for (let i = 0; i < hits; i++) {
        const isCrit = rollCrit(ability.critBonus ?? 0);
        if (isCrit) crits++;
        // Weakness bonus if ability is in weakness list
        const tagBoost = enemyData.weaknesses.includes(ability.id) ? 1.4 : 1.0;
        const dmg = Math.floor(computeAttackDamage({
          attackerStrength: character.stats.strength,
          weaponBase: equippedW + ability.power,
          enemyDefense: enemyData.defense,
          attackerStatuses: spentSelf.statuses,
          defenderStatuses: updatedTarget.statuses,
          isCrit,
          synergy: next.synergy,
        }) * tagBoost);
        dmgTotal += dmg;
        updatedTarget = { ...updatedTarget, hp: Math.max(0, updatedTarget.hp - dmg) };
        if (updatedTarget.hp === 0) updatedTarget.isDown = true;
      }
      pushFloating(`-${dmgTotal}${crits ? "!" : ""}`, crits ? "crit" : "damage");
      audio.playSfx("sfx-attack");
      next = replaceCombatant(next, "enemy", updatedTarget);
      next = log(next, `${character.name} → ${ability.name}: ${dmgTotal} dmg${crits ? ` (${crits} crit)` : ""} on ${enemyData.name}.`, crits ? "crit" : "damage");
    } else if (ability.kind === "heal") {
      // lowest hp ally
      const target = [...aliveParty(next)].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      const heal = computeHealing(ability.power, character.stats.wisdom);
      const updated = { ...target, hp: Math.min(target.maxHp, target.hp + heal) };
      next = replaceCombatant(next, "party", updated);
      pushFloating(`+${heal}`, "heal");
      audio.playSfx("sfx-heal");
      const targetChar = state.party.find(c => c.id === target.refId);
      next = log(next, `${character.name} → ${ability.name}: heals ${targetChar?.name ?? "ally"} for ${heal}.`, "heal");
    } else if (ability.kind === "buff") {
      const targets = ability.targets === "self"
        ? [next.party.find(p => p.refId === character.id)!]
        : aliveParty(next);
      let working = next;
      targets.forEach(t => {
        const updated = applyAbilityToTarget(ability, 0, t);
        working = replaceCombatant(working, "party", updated);
      });
      next = working;
      next = log(next, `${character.name} → ${ability.name}: party buffed.`, "status");
    } else if (ability.kind === "debuff") {
      const target = next.enemies.find(e => e.refId === targetRefId && !e.isDown) ?? aliveEnemies(next)[0];
      if (!target) return;
      const updated = applyAbilityToTarget(ability, 0, target);
      next = replaceCombatant(next, "enemy", updated);
      next = log(next, `${character.name} → ${ability.name}: weakness revealed!`, "status");
    }

    if (ability.synergyGain) {
      const before = next.synergy;
      next.synergy = Math.min(100, next.synergy + ability.synergyGain);
      if (synergyTier(before) !== synergyTier(next.synergy)) {
        next = log(next, `Party synergy: ${synergyTier(next.synergy)}!`, "synergy");
      }
    }

    next = advanceTurn(next);
    dispatch({ type: "SET_BATTLE", battle: next });
    scheduleEnemyTurns(next);
  };

  const scheduleEnemyTurns = (b: BattleState) => {
    if (b.status !== "active") {
      // resolve victory/defeat
      setTimeout(() => endBattle(b.status as "victory" | "defeat"), 700);
      return;
    }
    const currentRefId = b.turnOrder[b.turnIndex];
    const isEnemyTurn = b.enemies.some(e => e.refId === currentRefId);
    if (!isEnemyTurn) return;
    setTimeout(() => {
      let next = enemyTakeTurn(stateRef.current.battle!, currentRefId);
      next = advanceTurn(next);
      dispatch({ type: "SET_BATTLE", battle: next });
      scheduleEnemyTurns(next);
    }, 700);
  };

  const endBattle = (status: "victory" | "defeat") => {
    const b = stateRef.current.battle;
    if (!b) return;
    if (status === "victory") {
      // Compute rewards
      const enemyIds = b.enemies.map(e => e.refId.split("#")[0]);
      let xp = 0, gold = 0;
      const loot: string[] = [];
      enemyIds.forEach(eid => {
        const e = ENEMIES[eid];
        xp += e.xp;
        const [lo, hi] = e.goldDrop;
        gold += Math.floor(lo + Math.random() * (hi - lo + 1));
        e.lootTable?.forEach(l => { if (Math.random() < l.chance) loot.push(l.itemId); });
      });
      // Apply XP
      const newParty = state.party.map(c => {
        const updated = grantXp(c, Math.floor(xp / state.party.length));
        if (updated.leveled > 0) audio.playSfx("sfx-levelup");
        return updated.character;
      });
      // Restore from battle HP/MP
      const restored = newParty.map(c => {
        const bc = b.party.find(p => p.refId === c.id);
        return bc ? { ...c, hp: Math.max(1, bc.hp), mp: bc.mp } : c;
      });
      dispatch({ type: "UPDATE_PARTY", party: restored });
      dispatch({ type: "ADD_GOLD", amount: gold });
      loot.forEach(itemId => dispatch({ type: "ADD_ITEM", itemId, quantity: 1 }));
      // Division progress
      const div = state.divisions.find(d => d.bossId && b.enemies.some(e => e.refId.startsWith(d.bossId!)));
      let progressGain = 8;
      if (div) {
        progressGain = Math.min(100 - div.progress, 15);
        dispatch({ type: "UPDATE_DIVISION", id: div.id, patch: { progress: Math.min(100, div.progress + progressGain), corruption: Math.max(0, div.corruption - 10) } });
      }
      const rewards = { xp, gold, itemIds: loot, divisionProgress: progressGain };
      dispatch({ type: "SET_BATTLE", battle: { ...b, status: "victory", rewards } });
      setScreen("victory");
    } else {
      // restore party to 1 HP and return to hub (no loss)
      const restored = state.party.map(c => ({ ...c, hp: Math.max(1, Math.floor(c.maxHp * 0.5)), mp: Math.floor(c.maxMp * 0.5) }));
      dispatch({ type: "UPDATE_PARTY", party: restored });
      dispatch({ type: "SET_BATTLE", battle: { ...b, status: "defeat" } });
      setScreen("defeat");
    }
  };

  const saveGame = async () => {
    await saveSystem.save(stateRef.current);
  };
  const loadGame = async () => {
    const loaded = await saveSystem.load();
    if (!loaded) return false;
    dispatch({ type: "REPLACE_STATE", state: { ...loaded, screen: "hub", battle: undefined } });
    audio.playMusic("hub");
    return true;
  };
  const newGame = () => {
    dispatch({ type: "REPLACE_STATE", state: initialState() });
    setScreen("intro");
  };

  const useConsumable: GameStoreApi["useConsumable"] = (itemId, charId) => {
    const item = ITEM_BY_ID[itemId];
    const eff = item?.consumableEffect;
    if (!eff) return;
    const party = state.party.map(c => {
      if (c.id !== charId) return c;
      if (eff.kind === "heal") return { ...c, hp: Math.min(c.maxHp, c.hp + eff.magnitude) };
      if (eff.kind === "mana") return { ...c, mp: Math.min(c.maxMp, c.mp + eff.magnitude) };
      return c;
    });
    dispatch({ type: "UPDATE_PARTY", party });
    dispatch({ type: "REMOVE_ITEM", itemId, quantity: 1 });
    audio.playSfx("sfx-heal");
  };

  // Bootstrap save existence + audio settings
  const hasSaveRef = useRef(false);
  useEffect(() => { saveSystem.exists().then(v => { hasSaveRef.current = v; }); }, []);
  useEffect(() => {
    audio.setVolumes({ master: state.settings.masterVolume, music: state.settings.musicVolume, sfx: state.settings.sfxVolume });
  }, [state.settings.masterVolume, state.settings.musicVolume, state.settings.sfxVolume]);
  useEffect(() => {
    if (state.screen === "title") audio.playMusic("title");
  }, [state.screen]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        if (state.screen === "inventory" || state.screen === "party" || state.screen === "settings" || state.screen === "codex") setScreen("hub");
        else if (state.screen === "division") setScreen("hub");
      }
      if (e.key === "i" || e.key === "I") if (state.screen !== "battle" && state.screen !== "title") setScreen("inventory");
      if (e.key === "Tab") { if (state.screen !== "battle" && state.screen !== "title") { e.preventDefault(); setScreen("party"); } }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.screen]);

  const api: GameStoreApi = useMemo(() => ({
    state,
    setScreen, selectDivision,
    startBattle, performAbility,
    endBattle,
    saveGame, loadGame, newGame,
    hasSave: hasSaveRef.current,
    setSettings: (s) => dispatch({ type: "SET_SETTINGS", settings: s }),
    equip: (charId, itemId) => dispatch({ type: "EQUIP", charId, itemId }),
    unequip: (charId, slot) => dispatch({ type: "UNEQUIP", charId, slot }),
    useConsumable, pushFloating, floating,
  }), [state, floating]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
