import type { AudioAsset } from "@/types/game";

export const AUDIO_REGISTRY: AudioAsset[] = [
  { id: "title", path: "/audio/themes/title-screen.wav", kind: "music", loop: true },
  { id: "hub", path: "/audio/themes/exploration-hub.wav", kind: "music", loop: true },
  { id: "battle", path: "/audio/themes/battle-regular.wav", kind: "music", loop: true },
  { id: "boss", path: "/audio/themes/battle-boss.wav", kind: "music", loop: true },
  { id: "victory", path: "/audio/themes/victory.wav", kind: "music" },
  { id: "gameover", path: "/audio/themes/gameover.wav", kind: "music" },
  { id: "sfx-attack", path: "/audio/sfx/combat/attack-hit.wav", kind: "sfx" },
  { id: "sfx-heal", path: "/audio/sfx/combat/healing.wav", kind: "sfx" },
  { id: "sfx-select", path: "/audio/sfx/ui/menu-select.wav", kind: "sfx" },
  { id: "sfx-levelup", path: "/audio/sfx/ui/levelup-chime.wav", kind: "sfx" },
];

class AudioManager {
  private cache = new Map<string, HTMLAudioElement>();
  private currentMusic: HTMLAudioElement | null = null;
  private placeholderMode = true;
  master = 0.7; music = 0.6; sfx = 0.8;

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability() {
    try {
      const res = await fetch(AUDIO_REGISTRY[0].path, { method: "HEAD" });
      this.placeholderMode = !res.ok;
    } catch {
      this.placeholderMode = true;
    }
  }

  isPlaceholderMode() { return this.placeholderMode; }

  setVolumes(v: { master?: number; music?: number; sfx?: number }) {
    if (v.master != null) this.master = v.master;
    if (v.music != null) this.music = v.music;
    if (v.sfx != null) this.sfx = v.sfx;
    if (this.currentMusic) this.currentMusic.volume = this.master * this.music;
  }

  private getEl(id: string): HTMLAudioElement | null {
    if (this.placeholderMode) return null;
    const asset = AUDIO_REGISTRY.find(a => a.id === id);
    if (!asset) return null;
    let el = this.cache.get(id);
    if (!el) {
      try {
        el = new Audio(asset.path);
        el.loop = !!asset.loop;
        this.cache.set(id, el);
      } catch {
        // Audio construction can fail in placeholder/browser-restricted contexts.
        return null;
      }
    }
    return el;
  }

  playMusic(id: string) {
    if (this.placeholderMode) return;
    const el = this.getEl(id);
    if (!el) return;
    if (this.currentMusic && this.currentMusic !== el) {
      try { this.currentMusic.pause(); this.currentMusic.currentTime = 0; } catch {
        // Ignore browser audio teardown errors; gameplay should continue.
      }
    }
    el.volume = this.master * this.music;
    el.play().catch(() => {
      // Autoplay restrictions are non-fatal.
    });
    this.currentMusic = el;
  }

  stopMusic() {
    if (!this.currentMusic) return;
    try { this.currentMusic.pause(); this.currentMusic.currentTime = 0; } catch {
      // Ignore browser audio teardown errors.
    }
    this.currentMusic = null;
  }

  playSfx(id: string) {
    if (this.placeholderMode) return;
    const el = this.getEl(id);
    if (!el) return;
    try {
      const clone = el.cloneNode(true) as HTMLAudioElement;
      clone.volume = this.master * this.sfx;
      clone.play().catch(() => {
        // Autoplay restrictions are non-fatal.
      });
    } catch {
      // SFX failures should not affect combat flow.
    }
  }
}

export const audio = new AudioManager();
