export type SynergyTier = "Fragmented" | "Aligned" | "In Sync" | "Unified";

export const synergyTier = (s: number): SynergyTier =>
  s <= 25 ? "Fragmented" : s <= 50 ? "Aligned" : s <= 75 ? "In Sync" : "Unified";

export const synergyDamageMultiplier = (s: number): number => {
  const t = synergyTier(s);
  if (t === "Fragmented") return 0.75;
  if (t === "In Sync") return 1.15;
  if (t === "Unified") return 1.30;
  return 1.0;
};

export const canCombo = (s: number) => s >= 51;
export const canUnifiedVision = (s: number) => s >= 76;

export const tierColor = (s: number) => {
  const t = synergyTier(s);
  if (t === "Fragmented") return "text-destructive";
  if (t === "Aligned") return "text-muted-foreground";
  if (t === "In Sync") return "text-cyan";
  return "text-gold glow-gold";
};
