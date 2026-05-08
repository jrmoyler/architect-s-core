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
    notes: "Awaiting visual asset ZIP; using existing pixel-frame fallback until Architect artwork is imported.",
  },
  devon: {
    name: "Devon Scout",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-devon",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; current gameplay uses the existing Devon fallback sprite key.",
  },
  ahmed: {
    name: "Ahmed the Strategist",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-ahmed",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; current gameplay uses the existing Ahmed fallback sprite key.",
  },
  kenza: {
    name: "Kenza the Orchestrator",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-kenza",
    confidence: 0,
    notes: "No matching artwork available for review in this workspace.",
  },
  denzel: {
    name: "Denzel the Agent",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-denzel",
    confidence: 0,
    notes: "No matching artwork available for review in this workspace.",
  },
  arthur: {
    name: "Arthur the Advisor",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-arthur",
    confidence: 0,
    notes: "No matching artwork available for review in this workspace.",
  },
  stanley: {
    name: "Stanley the Guardian",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-stanley",
    confidence: 0,
    notes: "No matching artwork available for review in this workspace.",
  },
  joseph: {
    name: "Dr. Joseph the Healer",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-joseph",
    confidence: 0,
    notes: "Awaiting visual asset ZIP; current gameplay uses the existing Joseph fallback sprite key.",
  },
  collectiveChampion: {
    name: "Collective Champion",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-collective-champion",
    confidence: 0,
    notes: "Canon roster entry prepared; no artwork was available for classification.",
  },
  architectAscended: {
    name: "The Architect Ascended",
    sprite: null,
    portrait: null,
    turnaround: null,
    fallbackSpriteKey: "sprite-architect-ascended",
    confidence: 0,
    notes: "Canon roster entry prepared; no ascended-form artwork was available for classification.",
  },
} satisfies Record<string, CharacterAssetMapping>;

export type CharacterAssetId = keyof typeof characterAssets;
