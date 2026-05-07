import type { GameState } from "@/types/game";

const KEY = "architects-ascendance.save.v1";

// Abstraction so we can swap in Supabase later (same API surface)
export interface SaveAdapter {
  load(): Promise<GameState | null>;
  save(state: GameState): Promise<void>;
  clear(): Promise<void>;
  exists(): Promise<boolean>;
}

export const localAdapter: SaveAdapter = {
  async load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw) as GameState;
    } catch { return null; }
  },
  async save(state) {
    try {
      const slim = { ...state, battle: undefined };
      localStorage.setItem(KEY, JSON.stringify({ ...slim, saveTimestamp: Date.now() }));
    } catch {}
  },
  async clear() { try { localStorage.removeItem(KEY); } catch {} },
  async exists() { return !!localStorage.getItem(KEY); },
};

/**
 * Suggested Supabase schema (for v2):
 *   game_saves(id uuid pk, user_id uuid fk, slot int, state jsonb, updated_at timestamptz)
 *   characters(id text pk, name text, base_stats jsonb, ...)
 *   items(id text pk, name text, rarity text, slot text, stats jsonb, ...)
 *   enemies(id text pk, name text, hp int, ...)
 *   divisions(id text pk, name text, ...)
 *   quests(id text pk, division_id text fk, ...)
 *   sprites(id text pk, source_sheet text, row int, col int, public_path text, ...)
 *   audio_assets(id text pk, path text, kind text, loop bool)
 *
 * supabaseAdapter would mirror localAdapter using the `game_saves` table.
 */
export const saveSystem: SaveAdapter = localAdapter;
