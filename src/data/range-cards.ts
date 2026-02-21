import { PlayerStatModifiers } from '../types/enhancements';

export interface RangeCardDef {
  id: string;
  name: string;
  description: string;
  apply: (mods: PlayerStatModifiers) => void;
}

export const RANGE_CARD_DEFS: RangeCardDef[] = [
  {
    id: 'extended_reach',
    name: 'Extended Reach',
    description: '+15% radius/range, +10% melee scale',
    apply: (mods) => {
      mods.rangeMultiplier *= 1.15;
      mods.meleeScaleMultiplier *= 1.10;
    },
  },
  {
    id: 'giant_weapons',
    name: 'Giant Weapons',
    description: '+25% radius/range, +20% melee scale',
    apply: (mods) => {
      mods.rangeMultiplier *= 1.25;
      mods.meleeScaleMultiplier *= 1.20;
    },
  },
  {
    id: 'long_shot',
    name: 'Long Shot',
    description: '+20% projectile range, +15% projectile scale',
    apply: (mods) => {
      mods.projectileRangeMultiplier += 0.20;
      mods.rangeMultiplier *= 1.10;
      mods.projectileScaleMultiplier *= 1.15;
    },
  },
  {
    id: 'massive_impact',
    name: 'Massive Impact',
    description: '+30% AoE radius, +25% AoE scale',
    apply: (mods) => {
      mods.rangeMultiplier *= 1.15;
      mods.aoeScaleMultiplier *= 1.25;
    },
  },
  {
    id: 'titans_grip',
    name: "Titan's Grip",
    description: '+40% melee radius, +35% melee scale, -10% AS',
    apply: (mods) => {
      mods.rangeMultiplier *= 1.20;
      mods.meleeScaleMultiplier *= 1.35;
      mods.cooldownMultiplier *= 1.10;
    },
  },
];
