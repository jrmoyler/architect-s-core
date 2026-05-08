import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { ASSET_MANIFEST } from "@/lib/assets";
import { AUDIO_REGISTRY } from "@/lib/audioManager";

const FOLDERS = [
  "/public/assets/game/items/icons/",
  "/public/assets/game/items/reference-cells/",
  "/public/assets/game/characters/playable/",
  "/public/assets/game/characters/portraits/",
  "/public/assets/game/enemies/sprites/",
  "/public/assets/game/environments/hubs/",
  "/public/assets/game/environments/battle-backgrounds/",
  "/public/assets/game/ui/icons/",
  "/public/assets/game/sheets-original/",
  "/public/assets/game/_review/",
  "/public/audio/themes/",
  "/public/audio/sfx/combat/",
  "/public/audio/sfx/ui/",
];

const TABLES = [
  "items", "characters", "enemies", "divisions", "quests",
  "game_saves", "sprites", "audio_assets",
];

export function CodexScreen() {
  const { setScreen } = useGame();
  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-gold glow-gold">Asset Codex & Pipeline</h2>
        <Button variant="ghost" onClick={() => setScreen("title")}>◂ Back</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="panel p-5">
          <h3 className="font-display text-cyan mb-2">Folder Architecture</h3>
          <ul className="text-xs font-mono space-y-1">{FOLDERS.map(f => <li key={f}>📁 {f}</li>)}</ul>
        </section>

        <section className="panel p-5">
          <h3 className="font-display text-cyan mb-2">Asset Pipeline</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside text-foreground/80">
            <li>Extract the asset ZIP into <code className="text-gold">tmp/imported-assets/</code>.</li>
            <li>Run <code className="text-gold">npm run assets:process</code> to classify, dedupe, preserve sheets, and slice regular grids.</li>
            <li>Review <code className="text-gold">public/assets/game/asset-manifest.json</code> and <code className="text-gold">ASSET_INTEGRATION_REPORT.md</code>.</li>
            <li>Audio (Lyria 3): drop .wav files into <code className="text-gold">/public/audio/</code> — engine auto-detects.</li>
          </ol>
          <div className="mt-4 p-3 border border-dashed border-cyan/40 rounded text-xs text-muted-foreground">
            Asset browser available at <code className="text-cyan">/dev/assets</code>.
          </div>
        </section>

        <section className="panel p-5 md:col-span-2">
          <h3 className="font-display text-cyan mb-2">Manifest Status ({ASSET_MANIFEST.length} entries)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
            {ASSET_MANIFEST.map(a => (
              <div key={a.id} className="border border-border rounded p-2">
                <div className="font-display text-sm">{a.fallbackIcon} {a.name}</div>
                <div className="text-[10px] text-muted-foreground">{a.category}</div>
                <div className="text-[10px]">{a.sourceSheet || a.publicPath ? "✓ asset" : "○ placeholder"}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5 md:col-span-2">
          <h3 className="font-display text-cyan mb-2">Audio Registry ({AUDIO_REGISTRY.length} assets)</h3>
          <div className="grid sm:grid-cols-2 gap-1 text-xs font-mono">
            {AUDIO_REGISTRY.map(a => <div key={a.id}>🎵 {a.path} <span className="text-muted-foreground">({a.kind})</span></div>)}
          </div>
        </section>

        <section className="panel p-5 md:col-span-2">
          <h3 className="font-display text-cyan mb-2">Supabase-Ready Schema (v2)</h3>
          <p className="text-xs text-muted-foreground mb-2">Local-mode works without credentials. To migrate, swap <code>localAdapter</code> in <code>src/lib/saveSystem.ts</code>.</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {TABLES.map(t => <span key={t} className="px-2 py-1 rounded border border-gold/40">{t}</span>)}
          </div>
        </section>

        <section className="panel p-5 md:col-span-2">
          <h3 className="font-display text-cyan mb-2">Roadmap Targets</h3>
          <ul className="text-xs space-y-1 text-foreground/80">
            <li>• 15 division campaign · v1 has 2 playable + 1 tutorial</li>
            <li>• 8-character roster · v1 has 4 active + 4 reserve</li>
            <li>• 21 bosses · v1 has 2 + 1 tutorial enemy</li>
            <li>• 400+ inventory items · v1 ships {"~80"} seeded items, schema ready for full canon</li>
            <li>• 62 audio assets · v1 references all 10 v1 audio paths</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
