export interface CharacterAssetMapping {
  name: string;
  sprite: string | null;
  portrait: string | null;
  turnaround: string | null;
  fallbackSpriteKey: string;
  confidence: number;
  notes: string;
}

export const characterAssets = {
  hataalii: {
    name: "Hataalii the Architect",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-hataalii",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; using existing sprite fallback.",
  },
  devon: {
    name: "Devon Scout",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-devon",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; using existing sprite fallback.",
  },
  ahmed: {
    name: "Ahmed the Strategist",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-ahmed",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; using existing sprite fallback.",
  },
  kenza: {
    name: "Kenza the Orchestrator",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-kenza",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; reserve party still uses fallback.",
  },
  denzel: {
    name: "Denzel the Agent",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-denzel",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; reserve party still uses fallback.",
  },
  arthur: {
    name: "Arthur the Advisor",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-arthur",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; reserve party still uses fallback.",
  },
  stanley: {
    name: "Stanley the Guardian",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-stanley",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; reserve party still uses fallback.",
  },
  joseph: {
    name: "Dr. Joseph the Healer",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-joseph",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; using existing sprite fallback.",
  },
  collectiveChampion: {
    name: "Collective Champion",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-collective-champion",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; not yet represented in active roster data.",
  },
  architectAscended: {
    name: "The Architect Ascended",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-architect-ascended",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; not yet represented in active roster data.",
  },
} satisfies Record<string, CharacterAssetMapping>;
