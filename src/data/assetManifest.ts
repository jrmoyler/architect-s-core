// AUTO-GENERATED — do not edit manually. Re-run scripts/finalize-and-generate.mjs
import type { AssetManifestEntry } from "@/types/game";
import manifestJson from "../../public/assets/game/asset-manifest.json";

export const GAME_ASSET_MANIFEST: AssetManifestEntry[] = manifestJson as unknown as AssetManifestEntry[];

export const ASSET_BY_SOURCE_FILE: Record<string, (typeof GAME_ASSET_MANIFEST)[0]> =
  Object.fromEntries(GAME_ASSET_MANIFEST.filter(e => e.sourceFileOriginalName).map(e => [e.sourceFileOriginalName as string, e]));

export const ASSET_BY_MANIFEST_ID: Record<string, (typeof GAME_ASSET_MANIFEST)[0]> =
  Object.fromEntries(GAME_ASSET_MANIFEST.map(e => [e.id, e]));
