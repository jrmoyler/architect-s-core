import { withAssetVersion } from "@/lib/assetVersion";

// Hard-embedded environment asset paths. Vite serves `public/` at the site root,
// so these MUST be rooted at `/assets/...` (NOT `/public/assets/...`).
// All paths run through `withAssetVersion` so swapped files bust caches on reload.
export const TITLE_BG_PATH          = withAssetVersion("/assets/game/environments/battle-backgrounds/1776824600678.png")!;
export const DEFAULT_BATTLE_BG_PATH = withAssetVersion("/assets/game/environments/battle-backgrounds/06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png")!;
export const VOID_TITAN_ARENA_PATH  = withAssetVersion("/assets/game/environments/hubs/489b80e3-b76c-4b2e-8172-38864224a5c0.png")!;
export const ARCHITECTS_SPIRE_PATH  = withAssetVersion("/assets/game/environments/hubs/1776824619908.png")!;
export const NEXUS_CITY_PATH        = withAssetVersion("/assets/game/environments/battle-backgrounds/1776824600678.png")!;
