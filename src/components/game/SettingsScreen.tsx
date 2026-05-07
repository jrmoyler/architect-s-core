import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { audio } from "@/lib/audioManager";

export function SettingsScreen() {
  const { state, setSettings, setScreen, saveGame, loadGame } = useGame();
  const s = state.settings;
  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-gold glow-gold">Settings</h2>
        <Button variant="ghost" onClick={() => setScreen(state.previousScreen === "settings" ? "title" : state.previousScreen)}>◂ Back</Button>
      </div>

      <div className="panel p-5 space-y-5">
        <section>
          <p className="font-display text-sm text-cyan mb-3">AUDIO {audio.isPlaceholderMode() && <span className="text-[10px] text-muted-foreground ml-2">(placeholder mode — drop .wav into /public/audio/)</span>}</p>
          <Vol label="Master" value={s.masterVolume} onChange={v => setSettings({ masterVolume: v })} />
          <Vol label="Music" value={s.musicVolume} onChange={v => setSettings({ musicVolume: v })} />
          <Vol label="SFX" value={s.sfxVolume} onChange={v => setSettings({ sfxVolume: v })} />
        </section>

        <section>
          <p className="font-display text-sm text-cyan mb-3">COSMETICS</p>
          <div className="flex gap-2">
            {(["branded", "cyberpunk"] as const).map(v => (
              <Button key={v} variant={s.cosmeticVariant === v ? "default" : "outline"}
                className={s.cosmeticVariant === v ? "bg-gold text-void" : ""}
                onClick={() => setSettings({ cosmeticVariant: v })}>{v}</Button>
            ))}
          </div>
        </section>

        <section>
          <p className="font-display text-sm text-cyan mb-3">SAVE / LOAD</p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => saveGame()}>Save Game</Button>
            <Button variant="outline" onClick={() => loadGame()}>Load Game</Button>
            <Button variant="ghost" onClick={() => setScreen("title")}>Return to Title</Button>
          </div>
          {state.saveTimestamp && <p className="text-xs text-muted-foreground mt-2">Last save: {new Date(state.saveTimestamp).toLocaleString()}</p>}
        </section>
      </div>
    </div>
  );
}

function Vol({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1"><span>{label}</span><span>{Math.round(value * 100)}</span></div>
      <Slider value={[value * 100]} max={100} step={1} onValueChange={(v) => onChange(v[0] / 100)} />
    </div>
  );
}
