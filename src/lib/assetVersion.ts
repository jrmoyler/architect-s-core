// Single source of truth for asset cache-busting.
// Bump this whenever you swap any asset in /public/assets so that all clients
// fetch the new file immediately on next reload. Can be overridden at build
// time by `VITE_ASSET_VERSION` (e.g. a git SHA in CI).
const ENV_VERSION =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_ASSET_VERSION) || "";

export const ASSET_VERSION: string = ENV_VERSION || "2026-05-10-reslice";

/** Append `?v=<ASSET_VERSION>` to any same-origin asset URL.
 *  - Skips data: / blob: / external URLs
 *  - Preserves any existing querystring */
export const withAssetVersion = (url?: string | null): string | null => {
  if (!url) return null;
  if (/^(data:|blob:|https?:\/\/)/i.test(url)) return url;
  if (/[?&]v=/.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(ASSET_VERSION)}`;
};
