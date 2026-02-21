import { EnchantId } from '../constants';

export interface EnchantTierStats {
  // Burning
  dotDamage?: number;
  dotInterval?: number;    // ms
  dotDuration?: number;    // ms
  // Freezing
  slowPercent?: number;
  slowDuration?: number;   // ms
  freezeChance?: number;
  // Vampiric
  lifestealPercent?: number;
  // Piercing
  bonusPierce?: number;
  damageRetention?: number;
  // Chain
  chainCount?: number;
  chainDamagePercent?: number;
  // Explosive
  explosionRadius?: number;
  explosionDamagePercent?: number;
  // Toxic
  cloudRadius?: number;
  cloudDamage?: number;
  cloudDuration?: number;  // ms
  toxicProcChance?: number;
  // Critical
  critChance?: number;
  critMultiplier?: number;
}

export interface EnchantDef {
  id: EnchantId;
  name: string;
  description: string;
  tiers: EnchantTierStats[];  // index 0 = tier 1, up to 2 = tier 3
}

export interface EnchantInstance {
  id: EnchantId;
  tier: number;  // 1-3
}
