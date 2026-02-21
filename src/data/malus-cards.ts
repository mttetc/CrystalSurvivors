import { Rarity } from '../constants';
import { PlayerStatModifiers } from '../types/enhancements';

export interface MalusCardDef {
  id: string;
  name: string;
  bonusText: string;    // displayed in green
  malusText: string;    // displayed in red
  rarity: Rarity;
  apply: (mods: PlayerStatModifiers) => void;  // applies BOTH bonus and malus
}

export const MALUS_CARD_DEFS: MalusCardDef[] = [
  {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    bonusText: '+40% damage',
    malusText: '-30% max HP',
    rarity: Rarity.RARE,
    apply: (mods) => {
      mods.damageMultiplier *= 1.40;
      mods.maxHpBonus -= 15;
    },
  },
  {
    id: 'adrenaline',
    name: 'Adrenaline',
    bonusText: '+25% speed',
    malusText: '-20% max HP',
    rarity: Rarity.RARE,
    apply: (mods) => {
      mods.speedMultiplier *= 1.25;
      mods.maxHpBonus -= 10;
    },
  },
  {
    id: 'berserkers_pact',
    name: "Berserker's Pact",
    bonusText: '+30% dmg, +15% AS',
    malusText: 'No regen, -1 HP/s',
    rarity: Rarity.EPIC,
    apply: (mods) => {
      mods.damageMultiplier *= 1.30;
      mods.cooldownMultiplier *= 0.85;
      mods.regenPerSecond -= 99;
    },
  },
  {
    id: 'feast_or_famine',
    name: 'Feast or Famine',
    bonusText: '+50% dmg below 30% HP',
    malusText: '-50% dmg above 70% HP',
    rarity: Rarity.EPIC,
    apply: (mods) => {
      mods.lowHpDamageBonus += 0.50;
      mods.damageMultiplier *= 0.85;
    },
  },
  {
    id: 'heavy_armor',
    name: 'Heavy Armor',
    bonusText: '+3 armor, +30 HP',
    malusText: '-25% speed',
    rarity: Rarity.RARE,
    apply: (mods) => {
      mods.armor += 3;
      mods.maxHpBonus += 30;
      mods.speedMultiplier *= 0.75;
    },
  },
  {
    id: 'tunnel_vision',
    name: 'Tunnel Vision',
    bonusText: '+35% projectile damage',
    malusText: '-40% AoE radius',
    rarity: Rarity.RARE,
    apply: (mods) => {
      mods.projectileFamilyDamage += 0.35;
      mods.aoeScaleMultiplier *= 0.60;
    },
  },
  {
    id: 'scatter_shot',
    name: 'Scatter Shot',
    bonusText: '+2 projectiles',
    malusText: '-30% damage per projectile',
    rarity: Rarity.EPIC,
    apply: (mods) => {
      mods.bonusProjectiles += 2;
      mods.damageMultiplier *= 0.70;
    },
  },
  {
    id: 'overcharge',
    name: 'Overcharge',
    bonusText: '+50% damage',
    malusText: '+40% cooldowns',
    rarity: Rarity.EPIC,
    apply: (mods) => {
      mods.damageMultiplier *= 1.50;
      mods.cooldownMultiplier *= 1.40;
    },
  },
  {
    id: 'vampiric_hunger',
    name: 'Vampiric Hunger',
    bonusText: '+8% lifesteal',
    malusText: '-50% healing from drops',
    rarity: Rarity.RARE,
    apply: (mods) => {
      mods.lifeStealPercent += 0.08;
      mods.healingMultiplier *= 0.50;
    },
  },
  {
    id: 'giants_might',
    name: "Giant's Might",
    bonusText: '+60% melee damage',
    malusText: '-30% projectile damage',
    rarity: Rarity.RARE,
    apply: (mods) => {
      mods.meleeFamilyDamage += 0.60;
      mods.projectileDamageMultiplier *= 0.70;
    },
  },
  {
    id: 'fragile_speed',
    name: 'Fragile Speed',
    bonusText: '+40% attack speed',
    malusText: '-2 armor, -15% HP',
    rarity: Rarity.EPIC,
    apply: (mods) => {
      mods.cooldownMultiplier *= 0.60;
      mods.armor -= 2;
      mods.maxHpBonus -= 8;
    },
  },
  {
    id: 'blood_magic',
    name: 'Blood Magic',
    bonusText: '-30% cooldowns',
    malusText: '-1 HP/s',
    rarity: Rarity.LEGENDARY,
    apply: (mods) => {
      mods.cooldownMultiplier *= 0.70;
      mods.regenPerSecond -= 1;
    },
  },
  {
    id: 'curse_of_greed',
    name: 'Curse of Greed',
    bonusText: '+100% XP',
    malusText: '-25% damage',
    rarity: Rarity.RARE,
    apply: (mods) => {
      mods.xpMultiplier *= 2.0;
      mods.damageMultiplier *= 0.75;
    },
  },
  {
    id: 'all_or_nothing',
    name: 'All or Nothing',
    bonusText: 'Crits = x3 damage',
    malusText: 'Non-crits = 0.7x',
    rarity: Rarity.EPIC,
    apply: (mods) => {
      mods.critDamageBonus += 2.0;
      mods.damageMultiplier *= 0.85;
    },
  },
  {
    id: 'magnet_pull',
    name: 'Magnet Pull',
    bonusText: 'Pickup radius x3',
    malusText: '-20% speed',
    rarity: Rarity.RARE,
    apply: (mods) => {
      mods.pickupRadiusMultiplier *= 3;
      mods.speedMultiplier *= 0.80;
    },
  },
];
