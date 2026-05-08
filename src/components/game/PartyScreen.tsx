import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { PixelSprite } from "./PixelSprite";
import { Progress } from "@/components/ui/progress";
import { xpForLevel } from "@/lib/progression";
import { getCharacterAsset } from "@/data/characterAssets";

export function PartyScreen() {
  const { state, setScreen } = useGame();
  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-gold glow-gold">Party</h2>
        <Button variant="ghost" onClick={() => setScreen("hub")}>◂ Back</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {state.party.map(c => (
          <CharCard key={c.id} c={c} />
        ))}
      </div>

      <h3 className="font-display text-lg text-cyan mt-6 mb-2">Reserve · Locked</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {state.reserveParty.map(c => (
          <div key={c.id} className="panel p-3 opacity-60">
            <p className="font-display text-sm">{c.name}</p>
            <p className="text-[10px] text-muted-foreground">{c.title}</p>
            <p className="text-xs mt-2">{c.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CharCard({ c }: { c: ReturnType<typeof useGame>["state"]["party"][number] }) {
  const need = xpForLevel(c.level);
  const charAsset = getCharacterAsset(c.id);
  const turnaround = charAsset?.turnaround ?? null;

  return (
    <div className="panel p-4">
      <div className="flex gap-3 items-start">
        {/* Show turnaround sheet if available, else battle sprite, else glyph */}
        {turnaround ? (
          <img
            src={turnaround}
            alt={c.name}
            className="w-24 h-16 object-contain pixel rounded border border-gold/30"
            style={{ imageRendering: "pixelated" }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <PixelSprite spriteKey={c.spriteKey} size={64} className="w-16 h-16" />
        )}
        <div className="flex-1">
          <p className="font-display text-lg text-gold">{c.name}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.title} · {c.role}</p>
          <p className="text-xs mt-1">{c.bio}</p>
        </div>
        <span className="font-display text-xs px-2 py-1 rounded border border-gold/40">Lv {c.level}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Stat label="HP" cur={c.hp} max={c.maxHp} color="bg-gold" />
        <Stat label="MP" cur={c.mp} max={c.maxMp} color="bg-cyan" />
      </div>
      <div className="mt-1">
        <div className="flex justify-between text-[10px]"><span>XP</span><span>{c.xp}/{need}</span></div>
        <Progress value={(c.xp / need) * 100} className="h-1" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1 text-[11px]">
        {(["strength", "agility", "wisdom", "intelligence", "endurance", "charisma"] as const).map(k => (
          <div key={k} className="flex justify-between border-b border-border/40 py-0.5">
            <span className="text-muted-foreground capitalize">{k.slice(0, 3)}</span><span>{c.stats[k]}</span>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <p className="text-[10px] tracking-widest text-cyan">SKILL TREE (placeholder)</p>
        <div className="flex gap-1 flex-wrap mt-1">
          {["Combat", "Support", "Utility", "Division", "Legendary"].map(s => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-border">{s}</span>
          ))}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-[10px] tracking-widest text-gold">AFFINITY · {c.affinity}/100</p>
        <Progress value={c.affinity} className="h-1" />
      </div>
    </div>
  );
}

function Stat({ label, cur, max, color }: { label: string; cur: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px]"><span>{label}</span><span>{cur}/{max}</span></div>
      <div className="h-1.5 rounded bg-muted overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${(cur / max) * 100}%` }} /></div>
    </div>
  );
}
