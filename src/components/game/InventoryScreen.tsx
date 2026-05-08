import { useMemo, useState } from "react";
import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PixelSprite } from "@/components/game/PixelSprite";
import { ALL_ITEMS, ITEM_BY_ID, RARITY_COLOR, RARITY_GLOW } from "@/data/items";
import { ASSET_BY_ID, resolveItemSpriteKey } from "@/lib/assets";
import type { EquipSlot, Item, Rarity } from "@/types/game";
import { cn } from "@/lib/utils";

const RARITIES: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];

export function InventoryScreen() {
  const { state, setScreen, equip, unequip, useConsumable } = useGame();
  const [filter, setFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState<Rarity | "all">("all");
  const [selectedCharId, setSelectedCharId] = useState(state.party[0].id);
  const [page, setPage] = useState(0);
  const PAGE = 24;

  const owned = useMemo(() => {
    return state.inventory.map(i => ({ ...i, item: ITEM_BY_ID[i.itemId] })).filter(x => x.item);
  }, [state.inventory]);

  const filtered = useMemo(() => {
    return owned.filter(({ item }) => {
      if (rarityFilter !== "all" && item.rarity !== rarityFilter) return false;
      if (filter && !item.name.toLowerCase().includes(filter.toLowerCase())) return false;
      return true;
    });
  }, [owned, filter, rarityFilter]);

  const paged = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const selectedChar = state.party.find(c => c.id === selectedCharId)!;

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-gold glow-gold">Inventory</h2>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setScreen("hub")}>◂ Back</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Item grid */}
        <div className="lg:col-span-2 panel p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <Input placeholder="Search items…" value={filter} onChange={e => { setFilter(e.target.value); setPage(0); }} className="max-w-xs" />
            <select value={rarityFilter} onChange={e => { setRarityFilter(e.target.value as any); setPage(0); }}
              className="bg-input border border-border rounded px-2 text-sm">
              <option value="all">All rarities</option>
              {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <span className="text-xs text-muted-foreground self-center ml-auto">{filtered.length} items · {state.gold}g · catalog supports 400+</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {paged.map(({ itemId, quantity, item }) => (
              <ItemCell key={itemId} item={item} quantity={quantity}
                onEquip={() => item.slot && equip(selectedChar.id, itemId)}
                onUse={() => item.consumableEffect && useConsumable(itemId, selectedChar.id)}
              />
            ))}
            {paged.length === 0 && <p className="col-span-full text-center text-muted-foreground text-sm py-8">No items match.</p>}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>◂</Button>
              <span className="text-xs">{page + 1} / {pages}</span>
              <Button size="sm" variant="ghost" disabled={page + 1 >= pages} onClick={() => setPage(p => p + 1)}>▸</Button>
            </div>
          )}
        </div>

        {/* Equipment panel */}
        <div className="panel p-4">
          <p className="font-display text-xs tracking-widest text-cyan mb-2">EQUIP TO</p>
          <div className="flex flex-wrap gap-1 mb-4">
            {state.party.map(c => (
              <Button key={c.id} variant={c.id === selectedCharId ? "default" : "outline"} size="sm"
                className={c.id === selectedCharId ? "bg-gold text-void" : ""}
                onClick={() => setSelectedCharId(c.id)}>{c.name.split(" ")[0]}</Button>
            ))}
          </div>

          <div className="space-y-2">
            {(["mainHand", "offHand", "helm", "chest", "legs", "feet", "ring", "amulet"] as EquipSlot[]).map(slot => {
              const id = selectedChar.equipped[slot];
              const item = id ? ITEM_BY_ID[id] : undefined;
              return (
                <div key={slot} className="flex items-center justify-between text-sm border-b border-border/50 py-1">
                  <div>
                    <span className="text-[10px] tracking-widest text-muted-foreground uppercase block">{slot}</span>
                    <span className={item ? RARITY_COLOR[item.rarity].split(" ")[0] : "text-muted-foreground italic"}>
                      {item?.name ?? "— empty —"}
                    </span>
                  </div>
                  {item && <Button size="sm" variant="ghost" onClick={() => unequip(selectedChar.id, slot)}>×</Button>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemCell({ item, quantity, onEquip, onUse }: { item: Item; quantity: number; onEquip: () => void; onUse: () => void }) {
  const [open, setOpen] = useState(false);
  const spriteKey = resolveItemSpriteKey(item);
  const hasImageAsset = Boolean(ASSET_BY_ID[spriteKey]?.publicPath || ASSET_BY_ID[spriteKey]?.sourceSheet);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full aspect-square rounded border-2 bg-card/60 hover:bg-card transition-all flex flex-col items-center justify-center p-1 relative",
          RARITY_COLOR[item.rarity], RARITY_GLOW[item.rarity]
        )}
      >
        {hasImageAsset ? (
          <PixelSprite spriteKey={spriteKey} size={36} className="w-9 h-9" label={item.name} />
        ) : (
          <span className="text-xl">{glyphFor(item)}</span>
        )}
        <span className="text-[9px] mt-0.5 line-clamp-1 w-full text-center">{item.name}</span>
        {quantity > 1 && <span className="absolute bottom-0 right-1 text-[10px] font-bold">×{quantity}</span>}
      </button>
      {open && (
        <div className="absolute z-30 left-1/2 -translate-x-1/2 mt-2 w-60 panel p-3 text-left text-xs" onClick={() => setOpen(false)}>
          <p className={cn("font-display text-sm", RARITY_COLOR[item.rarity].split(" ")[0])}>{item.name}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.rarity} · {item.category}{item.slot ? ` · ${item.slot}` : ""}</p>
          <p className="my-2">{item.description}</p>
          {item.lore && <p className="italic text-muted-foreground">"{item.lore}"</p>}
          {item.stats && (
            <div className="mt-2 grid grid-cols-2 gap-x-2">
              {Object.entries(item.stats).map(([k, v]) => v ? <span key={k}><span className="text-cyan">+{v}</span> {k}</span> : null)}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {item.slot && <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onEquip(); setOpen(false); }}>Equip</Button>}
            {item.consumableEffect && <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onUse(); setOpen(false); }}>Use</Button>}
          </div>
        </div>
      )}
    </div>
  );
}

const glyphFor = (i: Item) => {
  if (i.category === "weapon") return "⚔";
  if (i.category === "armor") return i.slot === "offHand" ? "🛡" : i.slot === "helm" ? "⛑" : i.slot === "feet" ? "👢" : "🎽";
  if (i.category === "accessory") return i.slot === "ring" ? "◯" : "✦";
  if (i.category === "consumable") return "⚗";
  if (i.category === "key") return "🗝";
  return "◆";
};
