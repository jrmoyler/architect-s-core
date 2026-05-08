import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { PixelSprite } from "./PixelSprite";
import { Progress } from "@/components/ui/progress";
import { ENEMIES } from "@/data/enemies";
import { synergyTier, tierColor, canCombo } from "@/lib/synergy";
import { ITEM_BY_ID } from "@/data/items";
import { resolveItemAssetId } from "@/data/itemAssets";
import { divisionAssetByDivisionId } from "@/data/divisionAssets";
import { cn } from "@/lib/utils";

export function BattleScreen() {
  const { state, performAbility, setScreen } = useGame();
  const battle = state.battle;
  const [targetingFor, setTargetingFor] = useState<string | null>(null);
  const [showItems, setShowItems] = useState(false);

  if (!battle) return null;

  const currentRefId = battle.turnOrder[battle.turnIndex];
  const isPartyTurn = battle.party.some(p => p.refId === currentRefId);
  const activeChar = state.party.find(c => c.id === currentRefId);
  const activeCombatant = battle.party.find(p => p.refId === currentRefId);
  const battleBackground = divisionAssetByDivisionId[battle.encounterId]?.battleBackground
    ?? divisionAssetByDivisionId[battle.encounterId]?.background;

  const consumables = state.inventory
    .map(i => ({ ...i, item: ITEM_BY_ID[i.itemId] }))
    .filter(x => x.item?.consumableEffect);

  const handleAbility = (abilityId: string) => {
    const ab = activeChar?.abilities.find(a => a.id === abilityId);
    if (!ab) return;
    if (ab.kind === "attack" || ab.kind === "debuff") {
      setTargetingFor(abilityId);
    } else {
      performAbility(abilityId);
    }
  };

  const onTargetEnemy = (refId: string) => {
    if (!targetingFor) return;
    performAbility(targetingFor, refId);
    setTargetingFor(null);
  };

  const onUseItem = (itemId: string) => {
    performAbility("use-item", undefined, itemId);
    setShowItems(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top: synergy + round */}
      <div className="p-3 md:p-4 panel m-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-xs tracking-widest text-muted-foreground">ROUND {battle.round}</span>
          <span className={cn("font-display text-sm tracking-widest", tierColor(battle.synergy))}>
            SYNERGY · {synergyTier(battle.synergy).toUpperCase()} · {battle.synergy}
          </span>
        </div>
        <div className="h-2 rounded bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-destructive via-gold to-cyan" style={{ width: `${battle.synergy}%` }} />
        </div>
      </div>

      {/* Battlefield */}
      <div className="flex-1 grid grid-rows-2 gap-3 px-3">
        {/* Enemies */}
        <div className="panel p-4 relative overflow-hidden">
          {battleBackground ? (
            <img
              src={battleBackground}
              alt=""
              className="pixel absolute inset-0 h-full w-full object-cover opacity-25 pointer-events-none"
              style={{ imageRendering: "pixelated" }}
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none" />
          )}
          <p className="font-display text-xs text-destructive mb-3 tracking-widest">ENEMIES</p>
          <div className="relative flex flex-wrap items-end gap-4 justify-center min-h-[140px]">
            {battle.enemies.map(en => {
              const data = ENEMIES[en.refId.split("#")[0]];
              const isCurrent = en.refId === currentRefId;
              const targetable = !!targetingFor && !en.isDown;
              return (
                <button
                  key={en.refId}
                  disabled={!targetable}
                  onClick={() => onTargetEnemy(en.refId)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-2 rounded transition-all relative",
                    en.isDown && "opacity-30 grayscale",
                    isCurrent && "ring-2 ring-destructive",
                    targetable && "ring-2 ring-cyan ring-offset-2 ring-offset-background animate-pulse cursor-crosshair",
                  )}
                >
                  <PixelSprite spriteKey={data.spriteKey} size={data.isBoss ? 96 : 72} className={cn(data.isBoss ? "w-24 h-24" : "w-18 h-18", "float-slow")} />
                  <div className="w-32">
                    <div className="flex justify-between text-[10px]"><span>{data.name}</span><span>{en.hp}/{en.maxHp}</span></div>
                    <div className="h-1.5 rounded bg-muted overflow-hidden"><div className="h-full bg-destructive" style={{ width: `${(en.hp / en.maxHp) * 100}%` }} /></div>
                    {en.statuses.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">{en.statuses.map(s => <span key={s.id} className="text-[9px] px-1 rounded bg-cyan/20 text-cyan">{s.name}</span>)}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Party */}
        <div className="panel p-4 relative">
          <p className="font-display text-xs text-cyan mb-3 tracking-widest">PARTY</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {battle.party.map(pc => {
              const ch = state.party.find(c => c.id === pc.refId)!;
              const isCurrent = pc.refId === currentRefId;
              return (
                <div key={pc.refId} className={cn(
                  "flex flex-col items-center gap-2 p-2 rounded",
                  pc.isDown && "opacity-30 grayscale",
                  isCurrent && "ring-2 ring-gold panel-glow",
                )}>
                  <PixelSprite spriteKey={ch.spriteKey} size={64} className="w-16 h-16" />
                  <div className="w-36">
                    <div className="flex justify-between text-[11px]"><span className="font-display">{ch.name}</span><span>Lv {ch.level}</span></div>
                    <div className="text-[10px] flex justify-between"><span>HP</span><span>{pc.hp}/{pc.maxHp}</span></div>
                    <div className="h-1.5 rounded bg-muted overflow-hidden"><div className="h-full bg-gold" style={{ width: `${(pc.hp / pc.maxHp) * 100}%` }} /></div>
                    <div className="text-[10px] flex justify-between mt-0.5"><span>MP</span><span>{pc.mp}/{pc.maxMp}</span></div>
                    <div className="h-1 rounded bg-muted overflow-hidden"><div className="h-full bg-cyan" style={{ width: `${(pc.mp / pc.maxMp) * 100}%` }} /></div>
                    {pc.statuses.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">{pc.statuses.map(s => <span key={s.id} className="text-[9px] px-1 rounded bg-gold/20 text-gold">{s.name}</span>)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action / log */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
        <div className="md:col-span-2 panel p-4">
          {isPartyTurn && activeChar && !targetingFor && !showItems && (
            <>
              <p className="font-display text-sm text-gold mb-2">{activeChar.name}'s Turn</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeChar.abilities.map(ab => (
                  <Button key={ab.id}
                    onClick={() => handleAbility(ab.id)}
                    disabled={(activeCombatant?.mp ?? 0) < ab.mpCost}
                    variant="outline"
                    className="flex flex-col h-auto py-2 items-start text-left border-gold/30 hover:border-gold hover:bg-gold/10"
                    title={ab.description}
                  >
                    <span className="font-display text-sm">{ab.name}</span>
                    <span className="text-[10px] text-muted-foreground">{ab.mpCost > 0 ? `${ab.mpCost} MP` : "—"}</span>
                  </Button>
                ))}
                <Button variant="outline" className="border-cyan/40 hover:bg-cyan/10" onClick={() => setShowItems(true)}>Item</Button>
              </div>
              {canCombo(battle.synergy) && (
                <p className="mt-2 text-xs text-cyan">In Sync: combo damage active.</p>
              )}
            </>
          )}
          {targetingFor && (
            <div>
              <p className="font-display text-sm text-cyan mb-2">Choose a target ▾</p>
              <Button variant="ghost" size="sm" onClick={() => setTargetingFor(null)}>Cancel</Button>
            </div>
          )}
          {showItems && (
            <div>
              <p className="font-display text-sm text-gold mb-2">Use Item</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-auto">
                {consumables.length === 0 && <p className="text-xs text-muted-foreground">No consumables.</p>}
                {consumables.map(c => {
                  const itemAssetId = resolveItemAssetId(c.item);
                  return (
                  <Button key={c.itemId} variant="outline" size="sm" onClick={() => onUseItem(c.itemId)}>
                    {itemAssetId && <PixelSprite spriteKey={itemAssetId} size={20} className="mr-1 h-5 w-5" label={c.item.name} />}
                    {c.item.name} <span className="ml-2 text-muted-foreground">×{c.quantity}</span>
                  </Button>
                  );
                })}
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowItems(false)}>Cancel</Button>
            </div>
          )}
          {!isPartyTurn && (
            <p className="text-sm text-muted-foreground italic">Enemy is acting…</p>
          )}
        </div>

        <div className="panel p-3">
          <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-2">BATTLE LOG</p>
          <div className="text-xs space-y-1 max-h-40 overflow-auto">
            {battle.log.slice(-12).map(l => (
              <div key={l.id} className={cn(
                l.kind === "damage" && "text-destructive",
                l.kind === "crit" && "text-gold glow-gold",
                l.kind === "heal" && "text-rarity-uncommon",
                l.kind === "synergy" && "text-cyan",
                l.kind === "status" && "text-rarity-epic",
              )}>
                {l.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating numbers */}
      <FloatingLayer />
    </div>
  );
}

function FloatingLayer() {
  const { floating } = useGame();
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {floating.map(f => (
        <div key={f.id} className={cn(
          "absolute font-display text-3xl font-black dmg-pop",
          f.kind === "damage" && "text-destructive",
          f.kind === "crit" && "text-gold glow-gold text-4xl",
          f.kind === "heal" && "text-rarity-uncommon",
        )} style={{ left: `${40 + Math.random() * 20}%`, top: `${30 + Math.random() * 20}%` }}>
          {f.text}
        </div>
      ))}
    </div>
  );
}
