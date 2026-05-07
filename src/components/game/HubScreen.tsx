import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { PixelSprite } from "./PixelSprite";
import { Progress } from "@/components/ui/progress";

export function HubScreen() {
  const { state, selectDivision, setScreen, saveGame } = useGame();

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="font-display text-xs tracking-[0.4em] text-cyan glow-cyan">THE NEXUS</p>
          <h2 className="font-display text-3xl md:text-4xl text-gold glow-gold">Hub of Fifteen Realms</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose a division. Restore alignment. Expose the Void Titan.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="panel px-4 py-2 text-sm"><span className="text-muted-foreground">Gold:</span> <span className="text-gold font-bold">{state.gold}</span></div>
          <Button variant="outline" onClick={() => setScreen("party")} className="border-cyan/40">Party</Button>
          <Button variant="outline" onClick={() => setScreen("inventory")} className="border-gold/40">Inventory</Button>
          <Button variant="outline" onClick={() => setScreen("settings")}>Settings</Button>
          <Button variant="default" className="bg-gold text-void hover:bg-gold/90" onClick={() => saveGame()}>Save</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {state.divisions.map(d => (
          <div key={d.id}
            className={`panel p-4 flex flex-col gap-2 transition-all ${
              d.playable ? "hover:panel-glow hover:scale-[1.02] cursor-pointer" : "opacity-70"
            }`}
            onClick={() => d.playable && selectDivision(d.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <PixelSprite spriteKey={d.envSpriteKey} size={40} className="w-10 h-10" />
                <div>
                  <h3 className="font-display text-sm text-gold leading-tight">{d.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{d.specialty}</p>
                </div>
              </div>
              {d.playable ? (
                <span className="text-[10px] font-display text-cyan border border-cyan/40 px-1.5 py-0.5 rounded">PLAY</span>
              ) : !d.unlocked ? (
                <span className="text-[10px] font-display text-destructive border border-destructive/40 px-1.5 py-0.5 rounded">LOCKED</span>
              ) : (
                <span className="text-[10px] font-display text-muted-foreground border border-border px-1.5 py-0.5 rounded">SOON</span>
              )}
            </div>
            <p className="text-xs text-foreground/80 line-clamp-2">{d.description}</p>
            <div className="text-[10px] text-muted-foreground flex justify-between">
              <span>Leader: <span className="text-foreground">{d.leader || "—"}</span></span>
              <span>Power {d.power}%</span>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-cyan">Progress</span><span>{d.progress}%</span>
              </div>
              <Progress value={d.progress} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-destructive">Corruption</span><span>{d.corruption}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded overflow-hidden">
                <div className="h-full bg-destructive/70" style={{ width: `${d.corruption}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
