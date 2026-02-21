import { EnhancementCategory, WeaponId, EnchantId, SkillFamily } from '../constants';

export const CATEGORY_WEIGHTS: Record<string, number> = {
  [EnhancementCategory.JOB_SKILL]: 22,
  [EnhancementCategory.NEW_WEAPON]: 10,
  [EnhancementCategory.WEAPON_UPGRADE]: 16,
  [EnhancementCategory.NEW_ENCHANT]: 6,
  [EnhancementCategory.ENCHANT_UPGRADE]: 8,
  [EnhancementCategory.FAMILY_BOOST]: 13,
  [EnhancementCategory.STAT_BOOST]: 25,
};

export const WEAPON_NAMES: Record<WeaponId, string> = {
  [WeaponId.HUNTERS_BOW]: "Hunter's Bow",
  [WeaponId.SACRED_SHIELD]: 'Sacred Shield',
  [WeaponId.FIRE_ROD]: 'Fire Rod',
  [WeaponId.DARK_CLAYMORE]: 'Dark Claymore',
  [WeaponId.WAR_HARP]: 'War Harp',
  [WeaponId.SHURIKEN]: 'Shuriken',
  [WeaponId.KATANA]: 'Katana',
  [WeaponId.BATTLE_AXE]: 'Battle Axe',
  [WeaponId.WAR_LANCE]: 'War Lance',
  [WeaponId.FLASK_THROW]: 'Flask Throw',
  [WeaponId.HOLY_ROD]: 'Holy Rod',
  [WeaponId.ETHER_ROD]: 'Ether Rod',
  [WeaponId.IRON_FISTS]: 'Iron Fists',
  [WeaponId.CHRONO_ROD]: 'Chrono Rod',
  [WeaponId.EARTH_ROD]: 'Earth Rod',
};

export const ENCHANT_NAMES: Record<EnchantId, string> = {
  [EnchantId.BURNING]: 'Burning',
  [EnchantId.FREEZING]: 'Freezing',
  [EnchantId.VAMPIRIC]: 'Vampiric',
  [EnchantId.PIERCING]: 'Piercing',
  [EnchantId.CHAIN]: 'Chain',
  [EnchantId.EXPLOSIVE]: 'Explosive',
  [EnchantId.TOXIC]: 'Toxic',
  [EnchantId.CRITICAL]: 'Critical',
};

export interface FamilyBoostDef {
  family: SkillFamily;
  name: string;
  icon: string;
  levels: {
    description: string;
    apply: (mods: any) => void;
  }[];
}

export const FAMILY_BOOST_DEFS: Record<SkillFamily, FamilyBoostDef> = {
  [SkillFamily.PROJECTILE]: {
    family: SkillFamily.PROJECTILE,
    name: 'Projectile Mastery',
    icon: 'family_projectile',
    levels: [
      {
        description: '+15% projectile damage',
        apply: (mods) => { mods.projectileFamilyDamage += 0.15; },
      },
      {
        description: '+30% projectile damage',
        apply: (mods) => { mods.projectileFamilyDamage += 0.30; },
      },
      {
        description: '+50% projectile damage',
        apply: (mods) => { mods.projectileFamilyDamage += 0.50; },
      },
    ],
  },
  [SkillFamily.MAGIC]: {
    family: SkillFamily.MAGIC,
    name: 'Arcane Power',
    icon: 'family_magic',
    levels: [
      {
        description: '+15% magic damage, +10% AoE radius',
        apply: (mods) => { mods.magicFamilyDamage += 0.15; mods.magicFamilyRadius += 0.10; },
      },
      {
        description: '+30% magic damage, +20% AoE radius',
        apply: (mods) => { mods.magicFamilyDamage += 0.30; mods.magicFamilyRadius += 0.20; },
      },
      {
        description: '+50% magic damage, +30% AoE radius',
        apply: (mods) => { mods.magicFamilyDamage += 0.50; mods.magicFamilyRadius += 0.30; },
      },
    ],
  },
  [SkillFamily.MELEE]: {
    family: SkillFamily.MELEE,
    name: 'Melee Fury',
    icon: 'family_melee',
    levels: [
      {
        description: '+15% melee damage, +10% melee range',
        apply: (mods) => { mods.meleeFamilyDamage += 0.15; mods.meleeFamilyRange += 0.10; },
      },
      {
        description: '+30% melee damage, +20% melee range',
        apply: (mods) => { mods.meleeFamilyDamage += 0.30; mods.meleeFamilyRange += 0.20; },
      },
      {
        description: '+50% melee damage, +30% melee range',
        apply: (mods) => { mods.meleeFamilyDamage += 0.50; mods.meleeFamilyRange += 0.30; },
      },
    ],
  },
  [SkillFamily.AURA]: {
    family: SkillFamily.AURA,
    name: 'Aura Expansion',
    icon: 'family_aura',
    levels: [
      {
        description: '+15% aura damage, +15% aura radius',
        apply: (mods) => { mods.auraFamilyDamage += 0.15; mods.auraFamilyRadius += 0.15; },
      },
      {
        description: '+30% aura damage, +25% aura radius',
        apply: (mods) => { mods.auraFamilyDamage += 0.30; mods.auraFamilyRadius += 0.25; },
      },
      {
        description: '+50% aura damage, +40% aura radius',
        apply: (mods) => { mods.auraFamilyDamage += 0.50; mods.auraFamilyRadius += 0.40; },
      },
    ],
  },
  [SkillFamily.SUPPORT]: {
    family: SkillFamily.SUPPORT,
    name: 'Support Mastery',
    icon: 'family_support',
    levels: [
      {
        description: '+20% heal/buff effectiveness',
        apply: (mods) => { mods.supportEffectiveness += 0.20; },
      },
      {
        description: '+40% heal/buff effectiveness',
        apply: (mods) => { mods.supportEffectiveness += 0.40; },
      },
      {
        description: '+60% heal/buff effectiveness',
        apply: (mods) => { mods.supportEffectiveness += 0.60; },
      },
    ],
  },
  [SkillFamily.SUMMONING]: {
    family: SkillFamily.SUMMONING,
    name: 'Summon Bond',
    icon: 'family_summoning',
    levels: [
      {
        description: '+15% summon damage, -10% summon CD',
        apply: (mods) => { mods.summonFamilyDamage += 0.15; mods.summonFamilyCooldown += 0.10; },
      },
      {
        description: '+30% summon damage, -15% summon CD',
        apply: (mods) => { mods.summonFamilyDamage += 0.30; mods.summonFamilyCooldown += 0.15; },
      },
      {
        description: '+50% summon damage, -25% summon CD',
        apply: (mods) => { mods.summonFamilyDamage += 0.50; mods.summonFamilyCooldown += 0.25; },
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STAT BOOST DEFINITIONS (filler cards - always available)
// ═══════════════════════════════════════════════════════════════════════════

export interface StatBoostDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  apply: (mods: any) => void;
  stackable: boolean; // can appear multiple times
}

export const STAT_BOOST_DEFS: StatBoostDef[] = [
  {
    id: 'power_up',
    name: 'Power Up',
    description: '+8% damage',
    icon: 'stat_power',
    apply: (mods) => { mods.damageMultiplier *= 1.08; },
    stackable: true,
  },
  {
    id: 'swift_strike',
    name: 'Swift Strike',
    description: '-8% cooldowns',
    icon: 'stat_speed',
    apply: (mods) => { mods.cooldownMultiplier *= 0.92; },
    stackable: true,
  },
  {
    id: 'iron_skin',
    name: 'Iron Skin',
    description: '+2 armor',
    icon: 'stat_armor',
    apply: (mods) => { mods.armor += 2; },
    stackable: true,
  },
  {
    id: 'vitality',
    name: 'Vitality',
    description: '+10 max HP',
    icon: 'stat_hp',
    apply: (mods) => { mods.maxHpBonus += 10; },
    stackable: true,
  },
  {
    id: 'regeneration',
    name: 'Regeneration',
    description: '+0.5 HP/s regen',
    icon: 'stat_regen',
    apply: (mods) => { mods.regenPerSecond += 0.5; },
    stackable: true,
  },
  {
    id: 'fleet_foot',
    name: 'Fleet Foot',
    description: '+8% move speed',
    icon: 'stat_move',
    apply: (mods) => { mods.speedMultiplier *= 1.08; },
    stackable: true,
  },
  {
    id: 'magnet',
    name: 'Magnet',
    description: '+15% pickup radius',
    icon: 'stat_magnet',
    apply: (mods) => { mods.pickupRadiusMultiplier *= 1.15; },
    stackable: true,
  },
  {
    id: 'lucky_star',
    name: 'Lucky Star',
    description: '+3% crit chance',
    icon: 'stat_crit',
    apply: (mods) => { mods.critChance += 0.03; },
    stackable: true,
  },
  {
    id: 'scavenger',
    name: 'Scavenger',
    description: '+10% double gem chance',
    icon: 'stat_gem',
    apply: (mods) => { mods.doubleGemChance += 0.10; },
    stackable: true,
  },
  {
    id: 'xp_boost',
    name: 'Wisdom',
    description: '+10% XP gain',
    icon: 'stat_xp',
    apply: (mods) => { mods.xpMultiplier *= 1.10; },
    stackable: true,
  },
];
