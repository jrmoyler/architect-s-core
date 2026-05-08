/**
 * reclassify.mjs — Apply visual inspection findings to correct manifest categories.
 * Run: node scripts/reclassify.mjs
 */
import fs from "fs";
import path from "path";

const MANIFEST = "public/assets/game/asset-manifest.json";
const entries = JSON.parse(fs.readFileSync(MANIFEST));

// Visual inspection dimension → category corrections
const DIM_CORRECTIONS = {
  "512x512":   "CHARACTER_SPRITE_SHEET",   // character battle animation sheets
  "1024x1024": "CHARACTER_SPRITE_SHEET",   // Ahmed + multi-char sheet
  "1122x1402": "ENEMY_OR_BOSS_ART",        // individual enemy/boss portrait (tall)
  "1402x1122": "ENEMY_OR_BOSS_ART",
  "1448x1086": "PLAYABLE_CHARACTER_SHEET", // character turnarounds FRONT/SIDE/BACK
  "1086x1448": "PLAYABLE_CHARACTER_SHEET",
  "1672x941":  "HUB_MAP_OR_TILEMAP",       // division hub maps
  "1536x1024": "HUB_MAP_OR_TILEMAP",       // hub overview sheets
  "512x279":   "CHARACTER_SPRITE_SHEET",   // multi-char action sheets with labels
  "512x286":   "ENVIRONMENT_BACKGROUND",   // pixel art city skylines
  "512x343":   "PLAYABLE_CHARACTER_SHEET", // character reference sheets (Hataalii male)
  "343x512":   "ENEMY_OR_BOSS_ART",        // individual enemy sprites
  "1264x848":  "ENVIRONMENT_BACKGROUND",
  "1254x1254": "ENVIRONMENT_BACKGROUND",
  "1196x1315": "ENEMY_OR_BOSS_ART",
  "1024x1536": "PROMOTIONAL_OR_TITLE_ART",
};

// Specific file overrides (visually confirmed)
const FILE_OVERRIDES = {
  // Hub map
  "1776824619908.png": { cat: "HUB_MAP_OR_TILEMAP", name: "Architect's Spire Hub Map", tags: ["hub", "spire", "nexus", "overworld"] },
  // Character battle sprites
  "1776824652831.png": { cat: "CHARACTER_SPRITE_SHEET", name: "Hataalii Battle Sprites", tags: ["hataalii", "character", "battle", "mage"] },
  "1776824649078.png": { cat: "CHARACTER_SPRITE_SHEET", name: "Devon Scout Battle Sprites", tags: ["devon", "character", "battle", "dps"] },
  "1776824643708.png": { cat: "CHARACTER_SPRITE_SHEET", name: "Kenza Orchestrator Battle Sprites", tags: ["kenza", "character", "battle", "support"] },
  "1776825262236.png": { cat: "CHARACTER_SPRITE_SHEET", name: "Ahmed Strategist Battle Sprites", tags: ["ahmed", "character", "battle", "support"] },
  // Character references
  "1776824582721.png": { cat: "PLAYABLE_CHARACTER_SHEET", name: "Hataalii Male Architect Reference", tags: ["hataalii", "turnaround", "reference"] },
  "1776824589181.png": { cat: "PLAYABLE_CHARACTER_SHEET", name: "Character Reference Sheet 2", tags: ["turnaround", "reference"] },
  "1776824595224.png": { cat: "PLAYABLE_CHARACTER_SHEET", name: "Character Reference Sheet 3", tags: ["turnaround", "reference"] },
  "1776824632951.png": { cat: "PLAYABLE_CHARACTER_SHEET", name: "Character Reference Sheet 4", tags: ["turnaround", "reference"] },
  // Enemy sprites
  "1776824629863.png": { cat: "ENEMY_OR_BOSS_ART", name: "Mech Enforcer Enemy", tags: ["enemy", "robot", "mech"] },
  "1776824635731.png": { cat: "ENEMY_OR_BOSS_ART", name: "Void Entity Enemy", tags: ["enemy", "boss", "void"] },
  "1776824638793.png": { cat: "ENEMY_OR_BOSS_ART", name: "Enemy Sprite 3", tags: ["enemy"] },
  // Enemy portrait art
  "000c9fa0-159c-49e1-b996-bf36766ef46c.png": { cat: "ENEMY_OR_BOSS_ART", name: "Data Breach Wraith", tags: ["enemy", "boss", "wraith", "data"] },
  // Hub maps
  "26c116bb-476c-4d9a-8ef0-b6fc3547ab91.png": { cat: "HUB_MAP_OR_TILEMAP", name: "Quantum Ledger Hub Map", tags: ["hub", "quantum-ledger", "division"] },
  "06d26d78-b6d9-4f97-98eb-eb0580d2c80c.png": { cat: "ENVIRONMENT_BACKGROUND", name: "Collective Strategic Council Chamber", tags: ["battle-background", "council", "environment"] },
  // Nexus city skyline — title background
  "1776824600678.png": { cat: "ENVIRONMENT_BACKGROUND", name: "Nexus City Skyline", tags: ["title", "city", "spire", "background"] },
  "1776824616404.png": { cat: "ENVIRONMENT_BACKGROUND", name: "Nexus Battle Background 2", tags: ["battle-background", "city"] },
  // Hub overview
  "030bf3cf-5eed-4edc-aca0-2d662147c7f4.png": { cat: "HUB_MAP_OR_TILEMAP", name: "Five Division Hub Overview", tags: ["hub", "overview", "kinetic", "quantum", "civic", "hybrid", "zenflow"] },
  // Character turnaround
  "0f2d33b6-88b0-4a46-8828-7f8a3801750a.png": { cat: "PLAYABLE_CHARACTER_SHEET", name: "Stanley Guardian Turnaround", tags: ["stanley", "guardian", "turnaround"] },
};

let corrected = 0;
for (const e of entries) {
  if (e.sourceSheetId) continue; // skip sliced cells
  const override = FILE_OVERRIDES[e.sourceFileOriginalName];
  if (override) {
    e.category = override.cat;
    e.canonicalName = override.name;
    e.visualTags = override.tags || [];
    corrected++;
    continue;
  }
  const dimKey = `${e.width}x${e.height}`;
  const correction = DIM_CORRECTIONS[dimKey];
  if (correction && e.category !== correction) {
    e.category = correction;
    corrected++;
  }
}

fs.writeFileSync(MANIFEST, JSON.stringify(entries, null, 2));

// Print updated counts
const cats = {};
entries.filter(e => !e.sourceSheetId).forEach(e => { cats[e.category] = (cats[e.category]||0)+1; });
console.log(`Reclassified ${corrected} entries.\nUpdated category counts:`);
Object.entries(cats).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
