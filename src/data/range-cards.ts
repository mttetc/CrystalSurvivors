import { PlayerStatModifiers } from '../types/enhancements';

export interface RangeCardDef {
  id: string;
  name: string;
  description: string;
  descriptionFn?: (mult: number) => string;
  malusFn?: (mult: number) => string;  // negative part shown in red
  apply: (mods: PlayerStatModifiers, mult?: number) => void;
}

const pct = (base: number, mult: number) => `${Math.round(base * mult * 100)}%`;

export const RANGE_CARD_DEFS: RangeCardDef[] = [
  {
    id: 'extended_reach',
    name: 'Extended Reach',
    description: '+10% radius/range, +8% melee scale',
    descriptionFn: (m) => `+${pct(0.10, m)} radius/range, +${pct(0.08, m)} melee scale`,
    apply: (mods, mult = 1) => {
      mods.rangeMultiplier *= 1 + 0.10 * mult;
      mods.meleeScaleMultiplier *= 1 + 0.08 * mult;
    },
  },
  {
    id: 'giant_weapons',
    name: 'Giant Weapons',
    description: '+15% radius/range, +12% melee scale',
    descriptionFn: (m) => `+${pct(0.15, m)} radius/range, +${pct(0.12, m)} melee scale`,
    apply: (mods, mult = 1) => {
      mods.rangeMultiplier *= 1 + 0.15 * mult;
      mods.meleeScaleMultiplier *= 1 + 0.12 * mult;
    },
  },
  {
    id: 'long_shot',
    name: 'Long Shot',
    description: '+12% projectile range, +10% proj scale',
    descriptionFn: (m) => `+${pct(0.12, m)} proj range, +${pct(0.10, m)} proj scale`,
    apply: (mods, mult = 1) => {
      mods.projectileRangeMultiplier += 0.12 * mult;
      mods.rangeMultiplier *= 1 + 0.06 * mult;
      mods.projectileScaleMultiplier *= 1 + 0.10 * mult;
    },
  },
  {
    id: 'massive_impact',
    name: 'Massive Impact',
    description: '+10% AoE radius, +15% AoE scale',
    descriptionFn: (m) => `+${pct(0.10, m)} AoE radius, +${pct(0.15, m)} AoE scale`,
    apply: (mods, mult = 1) => {
      mods.rangeMultiplier *= 1 + 0.10 * mult;
      mods.aoeScaleMultiplier *= 1 + 0.15 * mult;
    },
  },
  {
    id: 'titans_grip',
    name: "Titan's Grip",
    description: '+12% melee radius, +18% melee scale',
    descriptionFn: (m) => `+${pct(0.12, m)} melee radius, +${pct(0.18, m)} melee scale`,
    malusFn: (m) => `-${pct(0.08, m)} attack speed`,
    apply: (mods, mult = 1) => {
      mods.rangeMultiplier *= 1 + 0.12 * mult;
      mods.meleeScaleMultiplier *= 1 + 0.18 * mult;
      mods.cooldownMultiplier *= 1 + 0.08 * mult;
    },
  },
];
