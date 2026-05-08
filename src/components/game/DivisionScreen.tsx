import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { PixelSprite } from "./PixelSprite";
import { ENEMIES } from "@/data/enemies";
import { battleBackgroundAsset } from "@/lib/gameAssetSelectors";

export function DivisionScreen() {
  const { state, setScreen, startBattle } = useGame();
  const div = state.divisions.find(d => d.id === state.selectedDivisionId);
  if (!div) return null;
  const quest = state.quests.find(q => q.id === div.questId);
  const boss = div.bossId ? ENEMIES[div.bossId] : undefined;
  const divisionBackground = battleBackgroundAsset(div.id);
  const panelStyle = divisionBackground
    ? { backgroundImage: `linear-gradient(hsl(230 50% 11% / 0.78), hsl(230 50% 11% / 0.9)), url(${divisionBackground.filePath})` }
    : undefined;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => setScreen("hub")} className="mb-4">◂ Back to Nexus</Button>

      <div className="panel-glow bg-cover bg-center p-6 md:p-8" style={panelStyle}>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <PixelSprite spriteKey={div.envSpriteKey} size={140} className="w-32 h-32 md:w-36 md:h-36 shrink-0" />
          <div className="flex-1">
            <p className="font-display text-xs tracking-[0.4em] text-cyan">DIVISION</p>
            <h2 className="font-display text-3xl md:text-4xl text-gold glow-gold">{div.name}</h2>
            <p className="text-muted-foreground mt-1">{div.specialty}</p>
            <p className="mt-3 text-foreground/90">{div.description}</p>
            {div.leader && <p className="mt-2 text-sm">Leader: <span className="text-cyan">{div.leader}</span></p>}
          </div>
        </div>

        {quest && (
          <div className="mt-8 panel p-5">
            <p className="font-display text-xs tracking-widest text-cyan mb-1">ACTIVE QUEST</p>
            <h3 className="font-display text-xl text-gold">{quest.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{quest.objective}</p>
            <div className="mt-3 text-xs flex flex-wrap gap-3">
              <span>Reward: <span className="text-gold">{quest.rewards.xp} XP</span></span>
              <span><span className="text-gold">{quest.rewards.gold} gold</span></span>
              <span><span className="text-cyan">+ {quest.rewards.itemIds?.length ?? 0} items</span></span>
            </div>
          </div>
        )}

        {boss && (
          <div className="mt-4 panel p-5">
            <p className="font-display text-xs tracking-widest text-destructive mb-1">ENCOUNTER</p>
            <div className="flex items-center gap-3">
              <PixelSprite spriteKey={boss.spriteKey} size={56} className="w-14 h-14" />
              <div>
                <h4 className="font-display text-lg">{boss.name}</h4>
                <p className="text-xs text-muted-foreground">HP {boss.maxHp} · ATK {boss.attack} · DEF {boss.defense} · AGI {boss.agility}</p>
              </div>
            </div>
            <Button
              size="lg"
              className="mt-4 w-full bg-destructive hover:bg-destructive/90 font-display tracking-widest"
              onClick={() => startBattle(div.id, [div.bossId!])}
            >
              ▸ BEGIN ENCOUNTER
            </Button>
            {div.id === "kinetic-edge" && state.divisions.find(d => d.id === "kinetic-edge")!.progress < 5 && (
              <Button
                variant="outline" className="mt-2 w-full border-cyan/40"
                onClick={() => startBattle("tutorial", ["entropy-specter"])}
              >
                ▸ Tutorial Skirmish (Entropy Specter)
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
