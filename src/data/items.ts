import type { Item, Rarity, EquipSlot, ItemCategory } from "@/types/game";

// Helper to define items concisely
const mk = (
  id: string, name: string, category: ItemCategory, rarity: Rarity, value: number,
  description: string, opts: Partial<Item> = {}
): Item => ({ id, name, category, rarity, value, description, iconKey: opts.iconKey ?? id, ...opts });

// Featured / canon items (full stats + lore)
export const ITEMS: Item[] = [
  // Weapons
  mk("initiate-blade", "Initiate Blade", "weapon", "common", 50,
    "A standard blade given to new Architects.", {
    slot: "mainHand", stats: { attack: 8, strength: 1 },
    lore: "Forged in the Nexus academies. Every Architect remembers their first."
  }),
  mk("neural-rapier", "Neural Rapier", "weapon", "uncommon", 220,
    "A thin blade laced with synaptic conduits. Strikes faster than thought.", {
    slot: "mainHand", stats: { attack: 14, agility: 3 },
    lore: "Each parry is a calculation; each thrust, a hypothesis confirmed."
  }),
  mk("architects-greatsword", "Architect's Greatsword", "weapon", "epic", 1200,
    "A massive blade crackling with cosmic resonance.", {
    slot: "mainHand", stats: { attack: 28, strength: 6, wisdom: 2 },
    lore: "Hataalii's family heirloom — said to cleave fragmentation itself."
  }),
  mk("market-saber", "Market Saber", "weapon", "rare", 540,
    "Edges sharpened by every closing bell.", {
    slot: "mainHand", stats: { attack: 19, intelligence: 3 } }),
  mk("kinetic-fang", "Kinetic Fang", "weapon", "rare", 560,
    "A curved blade that gains weight with each step you take.", {
    slot: "mainHand", stats: { attack: 17, agility: 5 } }),
  mk("aegis-of-consensus", "Aegis of Consensus", "weapon", "legendary", 2400,
    "A polearm that strikes harder when the party is in sync.", {
    slot: "mainHand", stats: { attack: 32, charisma: 4, wisdom: 3 } }),
  mk("void-cleaver", "Void Cleaver", "weapon", "mythic", 6400,
    "Cuts the line between order and entropy.", {
    slot: "mainHand", stats: { attack: 48, strength: 8, intelligence: 4 },
    lore: "Whispers in a language no division speaks." }),

  // Off-hand
  mk("novice-shield", "Novice Shield", "armor", "common", 40,
    "A round shield bearing the Collective sigil.", {
    slot: "offHand", stats: { defense: 6 } }),
  mk("truthlens-barrier", "Truth-Lens Barrier", "armor", "rare", 600,
    "A translucent ward that reveals attack vectors.", {
    slot: "offHand", stats: { defense: 12, wisdom: 3 } }),
  mk("ledger-buckler", "Ledger Buckler", "armor", "uncommon", 200,
    "Inscribed with every transaction it has survived.", {
    slot: "offHand", stats: { defense: 9 } }),

  // Helm / chest / legs / feet
  mk("aegis-helm", "Aegis Helm", "armor", "rare", 480,
    "A reinforced helm humming with stabilizers.", {
    slot: "helm", stats: { defense: 8, endurance: 2 } }),
  mk("scout-cap", "Scout Cap", "armor", "common", 60,
    "Light headgear favored by Kinetic Edge runners.", {
    slot: "helm", stats: { defense: 3, agility: 2 } }),
  mk("neural-breastplate", "Neural Breastplate", "armor", "epic", 1100,
    "Plates that adapt to incoming damage patterns.", {
    slot: "chest", stats: { defense: 18, intelligence: 3, endurance: 4 } }),
  mk("initiate-tunic", "Initiate Tunic", "armor", "common", 70,
    "Standard issue traveler's garb.", {
    slot: "chest", stats: { defense: 5 } }),
  mk("market-vest", "Market Vest", "armor", "uncommon", 240,
    "Tailored, weighted with confidence.", {
    slot: "chest", stats: { defense: 10, charisma: 2 } }),
  mk("runners-greaves", "Runner's Greaves", "armor", "uncommon", 180,
    "Featherlight legwear.", { slot: "legs", stats: { defense: 7, agility: 3 } }),
  mk("architect-leggings", "Architect Leggings", "armor", "rare", 520,
    "Reinforced where it matters most.", {
    slot: "legs", stats: { defense: 12, endurance: 2 } }),
  mk("swift-boots", "Swift Boots", "armor", "common", 60,
    "Comfortable boots that never slip.", {
    slot: "feet", stats: { defense: 3, agility: 2 } }),
  mk("zenflow-sandals", "ZenFlow Sandals", "armor", "uncommon", 220,
    "Walking in them feels like meditation.", {
    slot: "feet", stats: { defense: 5, wisdom: 3 } }),

  // Accessories
  mk("founder-ring", "Founder Ring", "accessory", "legendary", 1800,
    "Worn only by those who shape divisions.", {
    slot: "ring", stats: { charisma: 5, wisdom: 3, intelligence: 3 } }),
  mk("nexus-amulet", "Nexus Amulet", "accessory", "epic", 1400,
    "A pendant that resonates with the Nexus core.", {
    slot: "amulet", stats: { wisdom: 4, intelligence: 4 } }),
  mk("synergy-band", "Synergy Band", "accessory", "rare", 600,
    "Increases party coordination.", {
    slot: "ring", stats: { charisma: 3, agility: 2 } }),
  mk("entropy-charm", "Entropy Charm", "accessory", "rare", 580,
    "Protects against fragmentation.", {
    slot: "amulet", stats: { wisdom: 3, endurance: 2 } }),

  // Consumables
  mk("recovery-serum", "Recovery Serum", "consumable", "common", 30,
    "Restores 50 HP to one ally.", {
    consumableEffect: { kind: "heal", magnitude: 50 } }),
  mk("market-liquidity-flask", "Market Liquidity Flask", "consumable", "uncommon", 90,
    "Restores 40 MP to one ally.", {
    consumableEffect: { kind: "mana", magnitude: 40 } }),
  mk("momentum-booster", "Momentum Booster", "consumable", "rare", 140,
    "Grants Haste for 3 turns.", {
    consumableEffect: { kind: "buff", magnitude: 25, duration: 3 } }),
  mk("revive-protocol", "Revive Protocol", "consumable", "epic", 380,
    "Revives a downed ally with 50% HP.", {
    consumableEffect: { kind: "revive", magnitude: 50 } }),
  mk("greater-recovery-serum", "Greater Recovery Serum", "consumable", "uncommon", 90,
    "Restores 120 HP to one ally.", {
    consumableEffect: { kind: "heal", magnitude: 120 } }),

  // Keys / materials
  mk("agent-runestone", "Agent Runestone", "key", "rare", 0,
    "A keystone glyph used by autonomous Nexus agents.", { lore: "Hums when alignment is near." }),
  mk("protocol-key", "Protocol Key", "key", "epic", 0,
    "Unlocks restricted Quantum Ledger vaults.", {}),
  mk("polymarket-gem", "Polymarket Gem", "material", "legendary", 1500,
    "A crystallized prediction market outcome.", {}),
  mk("master-grimoire", "Master Grimoire", "key", "mythic", 0,
    "Contains the foundational texts of every division.", {}),
];

// Procedurally seed the rest of the canon (up to 80 total) so inventory has variety
const seedExtras = (): Item[] => {
  const adjectives = ["Refined", "Resonant", "Quantum", "Civic", "Vital", "Binary", "Gaian", "Vector", "Animus", "Aether", "Obsidian", "Terra"];
  const nouns: Record<EquipSlot, string[]> = {
    mainHand: ["Edge", "Lance", "Cutter", "Sigil-Blade"],
    offHand: ["Buckler", "Tome", "Ward", "Focus"],
    helm: ["Crown", "Visor", "Circlet", "Hood"],
    chest: ["Mantle", "Cuirass", "Robes", "Plate"],
    legs: ["Greaves", "Trousers", "Cuisses", "Wraps"],
    feet: ["Treads", "Boots", "Sandals", "Stompers"],
    ring: ["Loop", "Signet", "Band", "Coil"],
    amulet: ["Pendant", "Talisman", "Locket", "Sigil"],
  };
  const slots: EquipSlot[] = ["mainHand", "offHand", "helm", "chest", "legs", "feet", "ring", "amulet"];
  const rarities: Rarity[] = ["common", "uncommon", "rare", "epic"];
  const items: Item[] = [];
  let idx = 0;
  for (const adj of adjectives) {
    const slot = slots[idx % slots.length];
    const noun = nouns[slot][idx % nouns[slot].length];
    const rarity = rarities[idx % rarities.length];
    const baseValue = { common: 40, uncommon: 180, rare: 540, epic: 1100 }[rarity] ?? 40;
    const baseStat = { common: 5, uncommon: 9, rare: 14, epic: 20 }[rarity] ?? 5;
    const isWeapon = slot === "mainHand";
    items.push({
      id: `seed-${adj.toLowerCase()}-${slot}`,
      name: `${adj} ${noun}`,
      category: isWeapon ? "weapon" : (slot === "ring" || slot === "amulet" ? "accessory" : "armor"),
      rarity,
      value: baseValue,
      description: `A ${rarity} ${noun.toLowerCase()} infused with ${adj.toLowerCase()} energy.`,
      slot,
      stats: isWeapon ? { attack: baseStat } : { defense: baseStat },
      iconKey: `seed-${slot}`,
    });
    idx++;
  }
  // Pad consumables / materials
  for (let i = 0; i < 16; i++) {
    items.push({
      id: `archive-fragment-${i+1}`,
      name: `Archive Fragment ${i+1}`,
      category: "material",
      rarity: i % 5 === 4 ? "epic" : "common",
      value: 20 + i * 5,
      description: "A shard of recovered Nexus history.",
      iconKey: "fragment",
    });
  }
  return items;
};

export const ALL_ITEMS: Item[] = [...ITEMS, ...seedExtras()];
export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ALL_ITEMS.map(i => [i.id, i]));

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "text-rarity-common border-rarity-common/40",
  uncommon: "text-rarity-uncommon border-rarity-uncommon/50",
  rare: "text-rarity-rare border-rarity-rare/50",
  epic: "text-rarity-epic border-rarity-epic/60",
  legendary: "text-rarity-legendary border-rarity-legendary/70",
  mythic: "text-rarity-mythic border-rarity-mythic/70",
};

export const RARITY_GLOW: Record<Rarity, string> = {
  common: "",
  uncommon: "shadow-[0_0_12px_hsl(var(--rarity-uncommon)/0.4)]",
  rare: "shadow-[0_0_12px_hsl(var(--rarity-rare)/0.5)]",
  epic: "shadow-[0_0_16px_hsl(var(--rarity-epic)/0.6)]",
  legendary: "shadow-[0_0_18px_hsl(var(--rarity-legendary)/0.7)]",
  mythic: "shadow-[0_0_24px_hsl(var(--rarity-mythic)/0.8)]",
};
