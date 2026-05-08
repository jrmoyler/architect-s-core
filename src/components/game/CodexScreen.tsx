import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { ASSET_MANIFEST } from "@/lib/assets";
import { AUDIO_REGISTRY } from "@/lib/audioManager";
import { activeAssetManifest, activeAssetsByCategory, assetImportStatus } from "@/data/assetManifest";
import { spriteSheetRegistry, spriteSheetImportStatus } from "@/data/spriteSheetRegistry";

const FOLDERS = [
  "/public/assets/game/items/icons/",
  "/public/assets/game/items/reference-cells/",
  "/public/assets/game/items/branded/",
  "/public/assets/game/items/cyberpunk/",
  "/public/assets/game/characters/sprites/",
  "/public/assets/game/characters/turnarounds/",
  "/public/assets/game/characters/portraits/",
  "/public/assets/game/enemies/regular/",
  "/public/assets/game/enemies/bosses/",
  "/public/assets/game/environments/hubs/",
  "/public/assets/game/environments/battle-backgrounds/",
  "/public/assets/game/environments/division-realms/",
  "/public/assets/game/ui/icons/",
  "/public/assets/game/sheets-original/",
  "/public/assets/game/_review/duplicates/",
  "/public/assets/game/_review/unknown/",
  "/public/assets/game/_review/rejected/",
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
            <li>Generate sprite sheets (Nano Banana 2) — 10×10 grids, 32×32 frames.</li>
            <li>Slice and drop into the matching <code className="text-gold">/public/sprites/</code> folder.</li>
            <li>Update <code className="text-gold">src/lib/assets.ts</code> manifest entries with <code>publicPath</code> or <code>sourceSheet+row+col</code>.</li>
            <li>Audio (Lyria 3): drop .wav files into <code className="text-gold">/public/audio/</code> — engine auto-detects.</li>
          </ol>
          <div className="mt-4 p-3 border border-dashed border-cyan/40 rounded text-xs text-muted-foreground">
            Uploader UI placeholder — for v1, drop files directly into <code>/public/</code>.
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
          <h3 className="font-display text-cyan mb-2">Imported Game Assets ({assetImportStatus.activeAssetCount})</h3>
          {activeAssetManifest.length === 0 ? (
            <div className="rounded border border-dashed border-gold/40 p-4 text-xs text-muted-foreground">
              {assetImportStatus.blocker}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(activeAssetsByCategory).map(([category, assets]) => (
                <div key={category}>
                  <p className="font-display text-xs uppercase tracking-widest text-gold mb-2">{category}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {assets.map((asset) => (
                      <div key={asset.id} className="rounded border border-border p-2 text-xs">
                        <img
                          src={asset.filePath}
                          alt={asset.canonicalName}
                          className="pixel mb-2 h-24 w-full object-contain bg-background/60"
                          style={{ imageRendering: "pixelated" }}
                          loading="lazy"
                          draggable={false}
                        />
                        <p className="font-display text-[11px] text-cyan line-clamp-1">{asset.id}</p>
                        <p className="text-[10px] text-muted-foreground">Q{asset.qualityScore} · C{asset.confidence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel p-5 md:col-span-2">
          <h3 className="font-display text-cyan mb-2">Sprite Sheet Registry ({spriteSheetRegistry.length})</h3>
          {spriteSheetRegistry.length === 0 ? (
            <p className="text-xs text-muted-foreground">{spriteSheetImportStatus.blocker}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {spriteSheetRegistry.map((sheet) => (
                <div key={sheet.id} className="rounded border border-border p-2">
                  <p className="font-display text-gold">{sheet.id}</p>
                  <p>{sheet.sheetType} · {sheet.rows}×{sheet.columns}</p>
                  <p className="text-muted-foreground">{sheet.slicedAssetIds.length} slices · confidence {sheet.confidence}</p>
                </div>
              ))}
            </div>
          )}
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
