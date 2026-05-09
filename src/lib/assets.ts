import type { AssetManifestEntry } from "@/types/game";
import { getCharacterSpritePath } from "@/data/characterAssets";

/** Vite serves `public/` at the site root, so any path stored as `/public/...`
 *  must be normalized to `/...` or it 404s. Hard-embeds asset URLs reliably. */
export const normalizeAssetPath = (p?: string | null): string | null => {
  if (!p) return null;
  let out = p.trim();
  if (out.startsWith("/public/")) out = out.slice(7);
  else if (out.startsWith("public/")) out = "/" + out.slice(7);
  if (!out.startsWith("/") && !out.startsWith("http")) out = "/" + out;
  return out;
};

/**
 * Asset manifest. Entries with a publicPath render as <img> or CSS background-image.
 * Entries with sourceSheet+row+col use sprite-sheet clipping.
 * Entries with neither fall back to the fallbackIcon glyph.
 */
export const ASSET_MANIFEST: AssetManifestEntry[] = [
  // ── Characters ────────────────────────────────────────────────────────────
  {
    id: "sprite-hataalii",
    name: "Hataalii",
    category: "character",
    publicPath: "/assets/game/characters/sprites/1776824652831.png",
    fallbackIcon: "🜂",
    tags: ["leader", "architect", "mage"],
  },
  {
    id: "sprite-devon",
    name: "Devon Scout",
    category: "character",
    publicPath: "/assets/game/characters/sprites/1776824649078.png",
    fallbackIcon: "⚡",
    tags: ["dps", "scout"],
  },
  {
    id: "sprite-ahmed",
    name: "Ahmed",
    category: "character",
    publicPath: "/assets/game/characters/sprites/1776825262236.png",
    fallbackIcon: "♛",
    tags: ["support", "strategist"],
  },
  {
    id: "sprite-kenza",
    name: "Kenza",
    category: "character",
    publicPath: "/assets/game/characters/sprites/1776824643708.png",
    fallbackIcon: "✦",
    tags: ["support", "orchestrator"],
  },
  {
    id: "sprite-joseph",
    name: "Dr. Joseph",
    category: "character",
    publicPath: null,
    fallbackIcon: "✚",
    tags: ["healer"],
  },
  {
    id: "sprite-denzel",
    name: "Denzel",
    category: "character",
    publicPath: null,
    fallbackIcon: "◈",
    tags: ["support"],
  },
  {
    id: "sprite-arthur",
    name: "Arthur",
    category: "character",
    publicPath: null,
    fallbackIcon: "◉",
    tags: ["support"],
  },
  {
    id: "sprite-stanley",
    name: "Stanley",
    category: "character",
    publicPath: null,
    fallbackIcon: "⬡",
    tags: ["tank", "guardian"],
  },
  // ── Portraits ─────────────────────────────────────────────────────────────
  {
    id: "portrait-hataalii",
    name: "Hataalii Portrait",
    category: "portrait",
    publicPath: "/assets/game/characters/turnarounds/1776824582721.png",
    fallbackIcon: "🜂",
    tags: [],
  },
  {
    id: "portrait-devon",
    name: "Devon Portrait",
    category: "portrait",
    publicPath: "/assets/game/characters/turnarounds/1776825290175.png",
    fallbackIcon: "⚡",
    tags: [],
  },
  {
    id: "portrait-ahmed",
    name: "Ahmed Portrait",
    category: "portrait",
    publicPath: null,
    fallbackIcon: "♛",
    tags: [],
  },
  {
    id: "portrait-joseph",
    name: "Joseph Portrait",
    category: "portrait",
    publicPath: null,
    fallbackIcon: "✚",
    tags: [],
  },
  // ── Enemies ───────────────────────────────────────────────────────────────
  {
    id: "sprite-entropy-specter",
    name: "Entropy Specter",
    category: "enemy",
    publicPath: "/assets/game/enemies/sprites/1776824635731.png",
    fallbackIcon: "👻",
    tags: ["tutorial"],
  },
  {
    id: "sprite-market-goblin",
    name: "Market Crash Goblin",
    category: "enemy",
    publicPath: "/assets/game/enemies/sprites/1776824629863.png",
    fallbackIcon: "👺",
    tags: [],
  },
  {
    id: "sprite-tournament-champion",
    name: "Tournament Champion",
    category: "enemy",
    publicPath: "/assets/game/enemies/sprites/000c9fa0-159c-49e1-b996-bf36766ef46c.png",
    fallbackIcon: "🏆",
    tags: ["boss"],
  },
  {
    id: "sprite-debt-dragon",
    name: "Debt Dragon",
    category: "enemy",
    publicPath: "/assets/game/enemies/sprites/1776824638793.png",
    fallbackIcon: "🐉",
    tags: ["boss"],
  },
  // ── Environments ──────────────────────────────────────────────────────────
  {
    id: "env-default-battle",
    name: "Collective Strategic Council Chamber",
    category: "environment",
    publicPath: "/assets/game/environments/battle-backgrounds/06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png",
    fallbackIcon: "🏛",
    tags: ["battle", "council"],
  },
  {
    id: "env-kinetic",
    name: "Stadium of Motion",
    category: "environment",
    publicPath: null,
    fallbackIcon: "🏟",
    tags: [],
  },
  {
    id: "env-quantum",
    name: "Quantum Ledger Hub",
    category: "environment",
    publicPath: "/assets/game/environments/hubs/26c116bb-476c-4d9a-8ef0-b6fc3547ab91.png",
    fallbackIcon: "📈",
    tags: ["quantum-ledger"],
  },
  {
    id: "env-animus",
    name: "Animus Prime Foundry",
    category: "environment",
    publicPath: "/assets/game/environments/hubs/2d1a0488-130f-4499-8208-9595cc506bc6.png",
    fallbackIcon: "⚙",
    tags: ["animus-prime"],
  },
  {
    id: "env-hybrid",
    name: "Hybrid Living Hub",
    category: "environment",
    publicPath: "/assets/game/environments/hubs/4568cfb0-efe1-4d37-af00-5695cb5f3ac9.png",
    fallbackIcon: "🌿",
    tags: ["hybrid-living"],
  },
  {
    id: "env-gaia",
    name: "Gaia Synthesis Eco-Dome",
    category: "environment",
    publicPath: "/assets/game/environments/hubs/0a65ba60-00c5-4498-a905-56438dc8c0dd.png",
    fallbackIcon: "🌱",
    tags: ["gaia-synthesis"],
  },
  {
    id: "env-nexus-labs",
    name: "Nexus Labs Studio",
    category: "environment",
    publicPath: "/assets/game/environments/hubs/1a3ee97c-0ff8-4bc6-99df-09e2605c91fd.png",
    fallbackIcon: "🎬",
    tags: ["nexus-labs"],
  },
  {
    id: "env-vector-shift",
    name: "Vector Shift Logistics Hub",
    category: "environment",
    publicPath: "/assets/game/environments/hubs/5c5cc82b-8739-4ee3-b0a6-70e9433c73a4.png",
    fallbackIcon: "📦",
    tags: ["vector-shift"],
  },
  {
    id: "env-binary-loom",
    name: "Binary Loom Foundry",
    category: "environment",
    publicPath: "/assets/game/environments/hubs/cf5b8096-6b0f-4bca-bdba-d89d064f7bb7.png",
    fallbackIcon: "💻",
    tags: ["binary-loom"],
  },
  {
    id: "env-civic-core",
    name: "Civic Core Commons",
    category: "environment",
    publicPath: "/assets/game/environments/hubs/b6ca84c5-1ce8-4347-86f7-13adc5879679.png",
    fallbackIcon: "🏛",
    tags: ["civic-core"],
  },
  {
    id: "env-void-titan",
    name: "Void Titan Final Arena",
    category: "environment",
    publicPath: "/assets/game/environments/hubs/489b80e3-b76c-4b2e-8172-38864224a5c0.png",
    fallbackIcon: "☄",
    tags: ["boss", "final"],
  },
  {
    id: "env-hub-spire",
    name: "Architect's Spire Hub",
    category: "environment",
    publicPath: "/assets/game/environments/hubs/1776824619908.png",
    fallbackIcon: "🗼",
    tags: ["hub", "spire"],
  },
  {
    id: "env-nexus-city",
    name: "Nexus City Skyline",
    category: "environment",
    publicPath: "/assets/game/environments/battle-backgrounds/1776824600678.png",
    fallbackIcon: "🌃",
    tags: ["title", "city"],
  },
];

export const ASSET_BY_ID: Record<string, AssetManifestEntry> =
  Object.fromEntries(ASSET_MANIFEST.map(a => [a.id, a]));

export const computeSpriteStyle = (entry?: AssetManifestEntry): React.CSSProperties => {
  if (!entry?.sourceSheet || entry.row == null || entry.col == null || !entry.frameWidth) return {};
  const fw = entry.frameWidth, fh = entry.frameHeight ?? fw;
  const sheetUrl = normalizeAssetPath(entry.sourceSheet);
  return {
    backgroundImage: `url(${sheetUrl})`,
    backgroundPosition: `-${entry.col * fw}px -${entry.row * fh}px`,
    width: fw, height: fh,
    imageRendering: "pixelated",
  };
};

export const resolveSprite = (id: string): { entry?: AssetManifestEntry; fallback: string } => {
  const entry = ASSET_BY_ID[id];
  return { entry, fallback: entry?.fallbackIcon ?? "✦" };
};

// Map spriteKey → real image path (for direct <img> rendering)
export const resolveSpritePath = (spriteKey: string): string | null => {
  const charPath = getCharacterSpritePath(spriteKey);
  if (charPath) return normalizeAssetPath(charPath);
  const entry = ASSET_BY_ID[spriteKey];
  return normalizeAssetPath(entry?.publicPath ?? null);
};

export const sheetCoords = (row: number, col: number, frame = 32) => ({
  x: col * frame, y: row * frame, frame,
});
