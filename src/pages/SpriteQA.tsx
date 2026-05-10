import { PixelSprite } from "@/components/game/PixelSprite";
import type { AnimState } from "@/data/characterAssets";

// Dev-only QA page for verifying battle sprite rendering at the exact sizes
// used in BattleScreen (party=64, enemy=72, boss=96) plus 32/48 for icon use.
// Visit /dev/sprites in dev to scan every character × every animation state ×
// every battle size. Each tile displays the size & state so visual regressions
// (e.g. "too zoomed in") are obvious at a glance.

const SIZES = [32, 48, 64, 72, 96];
const STATES: AnimState[] = [
  "idle", "walk", "slash", "slash_heavy", "cast",
  "hurt", "knockback", "victory", "defeat", "critical_hit",
];
const CHARS = [
  { key: "sprite-hataalii", name: "Hataalii" },
  { key: "sprite-devon",    name: "Devon" },
  { key: "sprite-ahmed",    name: "Ahmed" },
  { key: "sprite-kenza",    name: "Kenza" },
];
const ENEMIES = [
  { key: "asset-1776824629863", name: "Enemy A" },
  { key: "asset-1776824635731", name: "Enemy B" },
  { key: "asset-1776824638793", name: "Enemy C" },
  { key: "asset-000c9fa0-159c-49e1-b996-bf36766ef46c", name: "Boss" },
];

export default function SpriteQA() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-8">
      <header>
        <h1 className="font-display text-2xl glow-cyan">Battle Sprite QA</h1>
        <p className="text-sm text-muted-foreground">
          Verify in-cell padding holds across 32/48/64/72/96 px at every breakpoint.
          Sprites should never fill their bounding box edge-to-edge.
        </p>
      </header>

      {CHARS.map(c => (
        <section key={c.key} className="panel p-4">
          <h2 className="font-display text-lg text-gold mb-3">{c.name}</h2>
          {STATES.map(s => (
            <div key={s} className="mb-3">
              <p className="text-[11px] text-cyan tracking-widest uppercase mb-1">{s}</p>
              <div className="flex flex-wrap gap-3 items-end">
                {SIZES.map(sz => (
                  <div key={sz} className="flex flex-col items-center gap-1">
                    <div
                      className="border border-border/50 rounded flex items-center justify-center"
                      style={{ width: sz, height: sz }}
                    >
                      <PixelSprite spriteKey={c.key} size={sz} animState={s} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{sz}px</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <section className="panel p-4">
        <h2 className="font-display text-lg text-gold mb-3">Enemies / Boss</h2>
        <div className="flex flex-wrap gap-6">
          {ENEMIES.map(e => (
            <div key={e.key} className="space-y-1">
              <p className="text-[11px] text-cyan">{e.name}</p>
              <div className="flex gap-3 items-end">
                {SIZES.map(sz => (
                  <div key={sz} className="flex flex-col items-center gap-1">
                    <div
                      className="border border-border/50 rounded flex items-center justify-center"
                      style={{ width: sz, height: sz }}
                    >
                      <PixelSprite spriteKey={e.key} size={sz} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{sz}px</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
