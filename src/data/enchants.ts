import { EnchantId, SPRITE_SCALE } from '../constants';
import { EnchantDef } from '../types';

const SS = SPRITE_SCALE;

export const ENCHANT_DEFS: Record<EnchantId, EnchantDef> = {
  [EnchantId.BURNING]: {
    id: EnchantId.BURNING,
    name: 'Burning',
    description: 'Sets enemies on fire, dealing damage over time',
    tiers: [
      { dotDamage: 2, dotInterval: 500, dotDuration: 3000 },
      { dotDamage: 4, dotInterval: 500, dotDuration: 4000 },
      { dotDamage: 6, dotInterval: 500, dotDuration: 5000 },
    ],
  },
  [EnchantId.FREEZING]: {
    id: EnchantId.FREEZING,
    name: 'Freezing',
    description: 'Slows enemies, chance to freeze',
    tiers: [
      { slowPercent: 0.30, slowDuration: 2000, freezeChance: 0 },
      { slowPercent: 0.40, slowDuration: 2500, freezeChance: 0.05 },
      { slowPercent: 0.50, slowDuration: 3000, freezeChance: 0.15 },
    ],
  },
  [EnchantId.VAMPIRIC]: {
    id: EnchantId.VAMPIRIC,
    name: 'Vampiric',
    description: 'Heals player on hit',
    tiers: [
      { lifestealPercent: 0.05 },
      { lifestealPercent: 0.10 },
      { lifestealPercent: 0.15 },
    ],
  },
  [EnchantId.PIERCING]: {
    id: EnchantId.PIERCING,
    name: 'Piercing',
    description: 'Projectiles pierce through enemies',
    tiers: [
      { bonusPierce: 1, damageRetention: 0.85 },
      { bonusPierce: 2, damageRetention: 0.90 },
      { bonusPierce: 4, damageRetention: 0.95 },
    ],
  },
  [EnchantId.CHAIN]: {
    id: EnchantId.CHAIN,
    name: 'Chain',
    description: 'Hits arc to nearby enemies',
    tiers: [
      { chainCount: 1, chainDamagePercent: 0.40 },
      { chainCount: 2, chainDamagePercent: 0.50 },
      { chainCount: 3, chainDamagePercent: 0.60 },
    ],
  },
  [EnchantId.EXPLOSIVE]: {
    id: EnchantId.EXPLOSIVE,
    name: 'Explosive',
    description: 'Hits explode in an area',
    tiers: [
      { explosionRadius: 25 * SS, explosionDamagePercent: 0.25 },
      { explosionRadius: 32 * SS, explosionDamagePercent: 0.35 },
      { explosionRadius: 42 * SS, explosionDamagePercent: 0.50 },
    ],
  },
  [EnchantId.TOXIC]: {
    id: EnchantId.TOXIC,
    name: 'Toxic',
    description: 'Creates poison clouds on hit',
    tiers: [
      { cloudRadius: 20 * SS, cloudDamage: 2, cloudDuration: 2000, toxicProcChance: 0.25 },
      { cloudRadius: 26 * SS, cloudDamage: 3, cloudDuration: 2500, toxicProcChance: 0.35 },
      { cloudRadius: 32 * SS, cloudDamage: 5, cloudDuration: 3000, toxicProcChance: 0.50 },
    ],
  },
  [EnchantId.CRITICAL]: {
    id: EnchantId.CRITICAL,
    name: 'Critical',
    description: 'Chance to deal critical damage',
    tiers: [
      { critChance: 0.10, critMultiplier: 2.0 },
      { critChance: 0.18, critMultiplier: 2.2 },
      { critChance: 0.25, critMultiplier: 2.5 },
    ],
  },
};
