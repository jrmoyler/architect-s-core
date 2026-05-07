import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { ITEM_BY_ID } from "@/data/items";

export function VictoryScreen() {
  const { state, setScreen } = useGame();
  const r = state.battle?.rewards;
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="panel-glow p-8 max-w-lg w-full text-center">
        <p className="font-display text-xs tracking-[0.5em] text-cyan glow-cyan">ALIGNMENT RESTORED</p>
        <h2 className="font-display text-5xl text-gold glow-gold my-4">VICTORY</h2>
        <p className="text-muted-foreground italic mb-6">"Unity without uniformity."</p>
        {r && (
          <div className="space-y-2 text-sm">
            <div>+ <span className="text-gold font-bold">{r.xp}</span> XP</div>
            <div>+ <span className="text-gold font-bold">{r.gold}</span> Gold</div>
            <div>+ <span className="text-cyan font-bold">{r.divisionProgress}%</span> Division Progress</div>
            {r.itemIds.length > 0 && (
              <div className="pt-3">
                <p className="text-muted-foreground text-xs mb-1">LOOT</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {r.itemIds.map((id, i) => {
                    const it = ITEM_BY_ID[id]; if (!it) return null;
                    return <span key={i} className="px-2 py-1 rounded border border-gold/30 text-xs">{it.name}</span>;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        <Button className="mt-6 w-full bg-gold text-void hover:bg-gold/90 font-display tracking-widest" onClick={() => setScreen("hub")}>
          Return to Nexus
        </Button>
      </div>
    </div>
  );
}

export function DefeatScreen() {
  const { setScreen, state, startBattle } = useGame();
  const lastEncounter = state.battle?.encounterId;
  const div = state.divisions.find(d => d.id === lastEncounter);
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="panel p-8 max-w-lg w-full text-center border-destructive/40">
        <p className="font-display text-xs tracking-[0.5em] text-destructive">FRAGMENTATION</p>
        <h2 className="font-display text-5xl text-destructive my-4">DEFEAT</h2>
        <p className="text-muted-foreground italic mb-6">"The Nexus does not lose. It learns."</p>
        <div className="flex flex-col gap-2">
          {div && (
            <Button className="bg-destructive hover:bg-destructive/90" onClick={() => startBattle(div.id, [div.bossId!])}>Retry Encounter</Button>
          )}
          <Button variant="outline" onClick={() => setScreen("hub")}>Return to Nexus</Button>
        </div>
      </div>
    </div>
  );
}
