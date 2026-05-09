// Division asset paths — Next.js serves public/ at root, so paths start at /assets/
export interface DivisionAssetEntry {
  name: string;
  slug: string;
  background: string | null;
  map: string | null;
  battleBackground: string | null;
  icon: string | null;
  confidence: number;
  notes: string;
}

export const DIVISION_ASSETS: Record<string, DivisionAssetEntry> = {
  zenflow: {
    name: "ZenFlow",
    slug: "zenflow",
    background:       null,
    map:              null,
    battleBackground: "/assets/game/environments/battle-backgrounds/06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png",
    icon:             null,
    confidence: 40,
    notes: "No dedicated ZenFlow environment found. Using default battle background. TODO.",
  },
  "kinetic-edge": {
    name: "Kinetic Edge",
    slug: "kinetic-edge",
    background:       null,
    map:              "/assets/game/environments/hubs/030bf3cf-5eed-4edc-aca0-2d662147c7f4.png",
    battleBackground: null,
    icon:             null,
    confidence: 50,
    notes: "Visible in 5-hub overview sheet. Dedicated hub map TODO.",
  },
  "quantum-ledger": {
    name: "Quantum Ledger",
    slug: "quantum-ledger",
    background:       "/assets/game/environments/hubs/26c116bb-476c-4d9a-8ef0-b6fc3547ab91.png",
    map:              "/assets/game/environments/hubs/26c116bb-476c-4d9a-8ef0-b6fc3547ab91.png",
    battleBackground: "/assets/game/environments/hubs/26c116bb-476c-4d9a-8ef0-b6fc3547ab91.png",
    icon:             null,
    confidence: 95,
    notes: "Full Quantum Ledger Hub map confirmed with labeled areas.",
  },
  "civic-core": {
    name: "Civic Core",
    slug: "civic-core",
    background:       "/assets/game/environments/hubs/b6ca84c5-1ce8-4347-86f7-13adc5879679.png",
    map:              "/assets/game/environments/hubs/b6ca84c5-1ce8-4347-86f7-13adc5879679.png",
    battleBackground: "/assets/game/environments/hubs/b6ca84c5-1ce8-4347-86f7-13adc5879679.png",
    icon:             null,
    confidence: 85,
    notes: "Civic Core Commons environment confirmed (golden civic plaza style).",
  },
  "hybrid-living": {
    name: "Hybrid Living",
    slug: "hybrid-living",
    background:       "/assets/game/environments/hubs/4568cfb0-efe1-4d37-af00-5695cb5f3ac9.png",
    map:              "/assets/game/environments/hubs/4568cfb0-efe1-4d37-af00-5695cb5f3ac9.png",
    battleBackground: "/assets/game/environments/hubs/4568cfb0-efe1-4d37-af00-5695cb5f3ac9.png",
    icon:             null,
    confidence: 95,
    notes: "Full Hybrid Living Hub map confirmed — academy, gardens, meditation hall.",
  },
  "vital-helix": {
    name: "Vital Helix",
    slug: "vital-helix",
    background:       null,
    map:              null,
    battleBackground: "/assets/game/environments/battle-backgrounds/06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png",
    icon:             null,
    confidence: 40,
    notes: "No dedicated Vital Helix environment found. TODO.",
  },
  "binary-loom": {
    name: "Binary Loom",
    slug: "binary-loom",
    background:       "/assets/game/environments/hubs/cf5b8096-6b0f-4bca-bdba-d89d064f7bb7.png",
    map:              null,
    battleBackground: "/assets/game/environments/hubs/cf5b8096-6b0f-4bca-bdba-d89d064f7bb7.png",
    icon:             null,
    confidence: 85,
    notes: "Binary Loom Infrastructure Foundry battle background confirmed.",
  },
  "gaia-synthesis": {
    name: "Gaia Synthesis",
    slug: "gaia-synthesis",
    background:       "/assets/game/environments/hubs/0a65ba60-00c5-4498-a905-56438dc8c0dd.png",
    map:              null,
    battleBackground: "/assets/game/environments/hubs/0a65ba60-00c5-4498-a905-56438dc8c0dd.png",
    icon:             null,
    confidence: 90,
    notes: "Gaia Synthesis Vertical Farm / Eco-Dome confirmed.",
  },
  "vector-shift": {
    name: "Vector Shift",
    slug: "vector-shift",
    background:       "/assets/game/environments/hubs/5c5cc82b-8739-4ee3-b0a6-70e9433c73a4.png",
    map:              "/assets/game/environments/hubs/5c5cc82b-8739-4ee3-b0a6-70e9433c73a4.png",
    battleBackground: "/assets/game/environments/hubs/5c5cc82b-8739-4ee3-b0a6-70e9433c73a4.png",
    icon:             null,
    confidence: 90,
    notes: "Vector Shift Logistics Hub confirmed — drone docks, transit lift.",
  },
  "animus-prime": {
    name: "Animus Prime",
    slug: "animus-prime",
    background:       "/assets/game/environments/hubs/0aa92427-06e1-4ac5-9e11-163a19186d39.png",
    map:              "/assets/game/environments/hubs/0aa92427-06e1-4ac5-9e11-163a19186d39.png",
    battleBackground: "/assets/game/environments/hubs/2d1a0488-130f-4499-8208-9595cc506bc6.png",
    icon:             null,
    confidence: 90,
    notes: "Hub map + Foundry battle background both confirmed.",
  },
  "aether-link": {
    name: "Aether Link",
    slug: "aether-link",
    background:       null,
    map:              null,
    battleBackground: "/assets/game/environments/battle-backgrounds/06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png",
    icon:             null,
    confidence: 40,
    notes: "No dedicated Aether Link environment found. TODO.",
  },
  "obsidian-arc": {
    name: "Obsidian Arc",
    slug: "obsidian-arc",
    background:       null,
    map:              null,
    battleBackground: "/assets/game/environments/battle-backgrounds/06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png",
    icon:             null,
    confidence: 40,
    notes: "No dedicated Obsidian Arc environment found. TODO.",
  },
  "terra-axis": {
    name: "Terra Axis",
    slug: "terra-axis",
    background:       null,
    map:              null,
    battleBackground: "/assets/game/environments/battle-backgrounds/06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png",
    icon:             null,
    confidence: 40,
    notes: "No dedicated Terra Axis environment found. TODO.",
  },
  "nexus-labs": {
    name: "Nexus Labs",
    slug: "nexus-labs",
    background:       "/assets/game/environments/hubs/1a3ee97c-0ff8-4bc6-99df-09e2605c91fd.png",
    map:              "/assets/game/environments/hubs/1a3ee97c-0ff8-4bc6-99df-09e2605c91fd.png",
    battleBackground: "/assets/game/environments/hubs/1a3ee97c-0ff8-4bc6-99df-09e2605c91fd.png",
    icon:             null,
    confidence: 85,
    notes: "Nexus Labs Creative Media Studio Realm confirmed.",
  },
  "the-collective": {
    name: "The Collective",
    slug: "the-collective",
    background:       "/assets/game/environments/battle-backgrounds/06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png",
    map:              "/assets/game/environments/hubs/1776824619908.png",
    battleBackground: "/assets/game/environments/battle-backgrounds/06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png",
    icon:             null,
    confidence: 90,
    notes: "Collective Strategic Council Chamber confirmed. Architect's Spire hub map used for map view.",
  },
};

export const getDivisionAsset = (slug: string): DivisionAssetEntry | null =>
  DIVISION_ASSETS[slug] ?? null;

export const getDivisionBackground = (divisionId: string): string | null => {
  const entry = DIVISION_ASSETS[divisionId];
  return entry?.battleBackground ?? "/assets/game/environments/battle-backgrounds/06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png";
};
