import { JobId } from '../constants';
import { PlayerStatModifiers } from '../types/enhancements';

export interface JobSynergy {
  id: string;
  name: string;
  jobs: [JobId, JobId];
  description: string;
  apply: (mods: PlayerStatModifiers) => void;
}

export const JOB_SYNERGIES: JobSynergy[] = [
  {
    id: 'holy_knight',
    name: 'Holy Knight',
    jobs: [JobId.PALADIN, JobId.WHITE_MAGE],
    description: 'Heals also deal 30% as AoE holy damage',
    apply: (mods) => {
      mods.supportEffectiveness += 0.30;
      mods.armor += 3;
    },
  },
  {
    id: 'blood_warrior',
    name: 'Blood Warrior',
    jobs: [JobId.DARK_KNIGHT, JobId.BERSERKER],
    description: 'Lifesteal doubled below 30% HP',
    apply: (mods) => {
      mods.lifeStealPercent += 0.05;
      mods.damageMultiplier *= 1.20;
    },
  },
  {
    id: 'shadow_blade',
    name: 'Shadow Blade',
    jobs: [JobId.NINJA, JobId.SAMURAI],
    description: 'Crits create shadow slashes',
    apply: (mods) => {
      mods.critChance += 0.15;
      mods.critDamageBonus += 0.50;
    },
  },
  {
    id: 'arcane_master',
    name: 'Arcane Master',
    jobs: [JobId.BLACK_MAGE, JobId.SUMMONER],
    description: 'Summons gain elemental AoE',
    apply: (mods) => {
      mods.summonFamilyDamage += 0.25;
      mods.magicFamilyDamage += 0.20;
    },
  },
  {
    id: 'sky_hunter',
    name: 'Sky Hunter',
    jobs: [JobId.RANGER, JobId.DRAGOON],
    description: 'Projectiles pierce +2, enhanced jump',
    apply: (mods) => {
      mods.bonusPierce += 2;
      mods.bonusProjectiles += 2;
    },
  },
  {
    id: 'tempo_master',
    name: 'Tempo Master',
    jobs: [JobId.BARD, JobId.TIME_MAGE],
    description: 'All allies +20% attack speed',
    apply: (mods) => {
      mods.cooldownMultiplier -= 0.20;
      mods.speedMultiplier += 0.15;
    },
  },
  {
    id: 'earth_fist',
    name: 'Earth Fist',
    jobs: [JobId.MONK, JobId.GEOMANCER],
    description: 'Punches leave trail zones, +30% melee AoE',
    apply: (mods) => {
      mods.meleeFamilyDamage += 0.30;
      mods.meleeFamilyRange += 0.25;
      mods.maxHpBonus += 20;
    },
  },
  {
    id: 'apothecary',
    name: 'Apothecary',
    jobs: [JobId.ALCHEMIST, JobId.WHITE_MAGE],
    description: 'Potions heal 3x, heal drops +50%',
    apply: (mods) => {
      mods.healthDropMultiplier += 1.50;
      mods.regenPerSecond += 2;
    },
  },
  {
    id: 'chrono_assassin',
    name: 'Chrono Assassin',
    jobs: [JobId.NINJA, JobId.TIME_MAGE],
    description: 'Dash resets cooldowns',
    apply: (mods) => {
      mods.bonusDashCharges += 2;
      mods.cooldownMultiplier -= 0.15;
    },
  },
  {
    id: 'iron_berserker',
    name: 'Iron Berserker',
    jobs: [JobId.BERSERKER, JobId.MONK],
    description: '+50 max HP, kills heal 2 HP',
    apply: (mods) => {
      mods.maxHpBonus += 50;
      mods.killHealAmount += 2;
    },
  },
];
