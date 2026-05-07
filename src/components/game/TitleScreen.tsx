import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { audio } from "@/lib/audioManager";
import { useEffect, useState } from "react";

export function TitleScreen() {
  const { setScreen, newGame, loadGame } = useGame();
  const [hasSave, setHasSave] = useState(false);
  useEffect(() => {
    import("@/lib/saveSystem").then(m => m.saveSystem.exists().then(setHasSave));
  }, []);

  const handleContinue = async () => {
    const ok = await loadGame();
    if (!ok) newGame();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 stars-bg opacity-80" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <p className="font-display text-xs tracking-[0.5em] text-cyan glow-cyan mb-4">COLLECTIVE AI · CHAPTER I</p>
        <h1 className="font-display text-4xl md:text-7xl font-black text-gold glow-gold leading-none">
          THE ARCHITECT'S<br />ASCENDANCE
        </h1>
        <p className="mt-6 text-lg md:text-2xl text-foreground/90 font-display tracking-wide">
          Architecting a Humane Future
        </p>
        <p className="mt-3 text-sm text-muted-foreground italic">
          A turn-based strategic JRPG · Lead Hataalii through the 15 divisions of the Nexus.
        </p>

        <div className="mt-12 flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
          <Button variant="default" size="lg" className="w-full font-display tracking-widest bg-gold text-void hover:bg-gold/90" onClick={() => newGame()}>
            ▸ NEW GAME
          </Button>
          <Button variant="outline" size="lg" className="w-full font-display tracking-widest border-cyan/60 text-cyan hover:bg-cyan/10" onClick={handleContinue} disabled={!hasSave}>
            ▸ CONTINUE
          </Button>
          <div className="flex gap-2 w-full">
            <Button variant="ghost" className="flex-1 text-muted-foreground hover:text-gold" onClick={() => setScreen("settings")}>Settings</Button>
            <Button variant="ghost" className="flex-1 text-muted-foreground hover:text-cyan" onClick={() => setScreen("codex")}>Asset Codex</Button>
          </div>
        </div>

        <p className="mt-12 text-xs text-muted-foreground/70">
          {audio.isPlaceholderMode() ? "🎵 Audio placeholder mode — drop .wav files into /public/audio/ to enable" : "🎵 Audio enabled"}
        </p>
      </div>
    </div>
  );
}
