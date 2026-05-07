import { useEffect, useRef, useState } from "react";
import { useGame } from "@/store/GameStore";
import { Button } from "@/components/ui/button";
import { PixelSprite } from "./PixelSprite";

interface Line {
  speaker: string;
  portraitKey: string;
  text: string;
}

const LINES: Line[] = [
  { speaker: "The Nexus", portraitKey: "sprite-hataalii",
    text: "Across fifteen divisions, the Collective hums in fragile balance. But something tears at the seams." },
  { speaker: "Hataalii", portraitKey: "portrait-hataalii",
    text: "Entropy. The Void Titan stirs — a manifestation of fragmentation, of misalignment between minds and missions." },
  { speaker: "The Nexus", portraitKey: "sprite-hataalii",
    text: "You are the Architect now. Not to dominate the divisions, but to orchestrate them. Unity without uniformity." },
  { speaker: "Devon Scout", portraitKey: "portrait-devon",
    text: "Kinetic Edge stands ready. Come to the Stadium of Motion when you're prepared." },
  { speaker: "Ahmed", portraitKey: "portrait-ahmed",
    text: "The Trading Floor of Infinite Possibility recognizes only one currency now — alignment. I'll be there." },
  { speaker: "Hataalii", portraitKey: "portrait-hataalii",
    text: "Then we begin. The Nexus calls for alignment — and I will answer." },
];

export function IntroScreen() {
  const { setScreen } = useGame();
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState("");
  const ref = useRef<number | null>(null);

  useEffect(() => {
    setShown("");
    const line = LINES[idx].text;
    let i = 0;
    ref.current = window.setInterval(() => {
      i++;
      setShown(line.slice(0, i));
      if (i >= line.length) { if (ref.current) window.clearInterval(ref.current); }
    }, 22);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [idx]);

  const advance = () => {
    if (shown.length < LINES[idx].text.length) {
      setShown(LINES[idx].text);
      if (ref.current) window.clearInterval(ref.current);
      return;
    }
    if (idx + 1 >= LINES.length) setScreen("hub");
    else setIdx(i => i + 1);
  };

  const line = LINES[idx];
  return (
    <div className="min-h-screen flex flex-col" onClick={advance}>
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 stars-bg opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="float-slow">
            <PixelSprite spriteKey={line.portraitKey} size={160} className="w-40 h-40" />
          </div>
        </div>
      </div>

      <div className="panel-glow m-4 p-6 max-w-3xl w-full mx-auto cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-gold tracking-widest text-sm">{line.speaker.toUpperCase()}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setScreen("hub"); }}>Skip ▸▸</Button>
          </div>
        </div>
        <p className="text-lg leading-relaxed min-h-[5rem]">{shown}<span className="opacity-50 animate-pulse">▌</span></p>
        <div className="mt-3 text-xs text-muted-foreground text-right">
          {idx + 1} / {LINES.length} · click or press Enter to continue
        </div>
      </div>
    </div>
  );
}
