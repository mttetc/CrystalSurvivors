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
  description: string;           // base description (for Rare/mult=1.0)
  descriptionFn?: (mult: number) => string;  // dynamic description per rarity
  icon: string;
  apply: (mods: any, mult?: number) => void;
  stackable: boolean; // can appear multiple times
}

// Base values are tuned for Rare (mult=1.0).
// Common (0.6x) → small boost, Legendary (2.0x) → big boost.
const pct = (base: number, mult: number) => `${Math.round(base * mult * 100)}%`;
const flat = (base: number, mult: number) => `${Math.max(1, Math.floor(base * mult))}`;

export const STAT_BOOST_DEFS: StatBoostDef[] = [
  {
    id: 'power_up',
    name: 'Power Up',
    description: '+10% damage',
    descriptionFn: (m) => `+${pct(0.10, m)} damage`,
    icon: 'stat_power',
    apply: (mods, mult = 1) => { mods.damageMultiplier *= 1 + 0.10 * mult; },
    stackable: true,
  },
  {
    id: 'swift_strike',
    name: 'Swift Strike',
    description: '-10% cooldowns',
    descriptionFn: (m) => `-${pct(0.10, m)} cooldowns`,
    icon: 'stat_speed',
    apply: (mods, mult = 1) => { mods.cooldownMultiplier *= 1 - 0.10 * mult; },
    stackable: true,
  },
  {
    id: 'iron_skin',
    name: 'Iron Skin',
    description: '+3 armor',
    descriptionFn: (m) => `+${flat(3, m)} armor`,
    icon: 'stat_armor',
    apply: (mods, mult = 1) => { mods.armor += Math.max(1, Math.floor(3 * mult)); },
    stackable: true,
  },
  {
    id: 'vitality',
    name: 'Vitality',
    description: '+15 max HP',
    descriptionFn: (m) => `+${flat(15, m)} max HP`,
    icon: 'stat_hp',
    apply: (mods, mult = 1) => { mods.maxHpBonus += Math.max(5, Math.floor(15 * mult)); },
    stackable: true,
  },
  {
    id: 'regeneration',
    name: 'Regeneration',
    description: '+0.8 HP/s regen',
    descriptionFn: (m) => `+${(0.8 * m).toFixed(1)} HP/s regen`,
    icon: 'stat_regen',
    apply: (mods, mult = 1) => { mods.regenPerSecond += 0.8 * mult; },
    stackable: true,
  },
  {
    id: 'fleet_foot',
    name: 'Fleet Foot',
    description: '+10% move speed',
    descriptionFn: (m) => `+${pct(0.10, m)} move speed`,
    icon: 'stat_move',
    apply: (mods, mult = 1) => { mods.speedMultiplier *= 1 + 0.10 * mult; },
    stackable: true,
  },
  {
    id: 'magnet',
    name: 'Magnet',
    description: '+20% pickup radius',
    descriptionFn: (m) => `+${pct(0.20, m)} pickup radius`,
    icon: 'stat_magnet',
    apply: (mods, mult = 1) => { mods.pickupRadiusMultiplier *= 1 + 0.20 * mult; },
    stackable: true,
  },
  {
    id: 'lucky_star',
    name: 'Lucky Star',
    description: '+5% crit chance',
    descriptionFn: (m) => `+${pct(0.05, m)} crit chance`,
    icon: 'stat_crit',
    apply: (mods, mult = 1) => { mods.critChance += 0.05 * mult; },
    stackable: true,
  },
  {
    id: 'scavenger',
    name: 'Scavenger',
    description: '+12% double gem chance',
    descriptionFn: (m) => `+${pct(0.12, m)} double gem chance`,
    icon: 'stat_gem',
    apply: (mods, mult = 1) => { mods.doubleGemChance += 0.12 * mult; },
    stackable: true,
  },
  {
    id: 'xp_boost',
    name: 'Wisdom',
    description: '+12% XP gain',
    descriptionFn: (m) => `+${pct(0.12, m)} XP gain`,
    icon: 'stat_xp',
    apply: (mods, mult = 1) => { mods.xpMultiplier *= 1 + 0.12 * mult; },
    stackable: true,
  },
  // ─── Damage type boosts ───
  {
    id: 'sharp_edge',
    name: 'Sharp Edge',
    description: '+12% melee damage',
    descriptionFn: (m) => `+${pct(0.12, m)} melee damage`,
    icon: 'stat_power',
    apply: (mods, mult = 1) => { mods.meleeDamageMultiplier *= 1 + 0.12 * mult; },
    stackable: true,
  },
  {
    id: 'steady_aim',
    name: 'Steady Aim',
    description: '+12% projectile damage',
    descriptionFn: (m) => `+${pct(0.12, m)} projectile damage`,
    icon: 'stat_power',
    apply: (mods, mult = 1) => { mods.projectileDamageMultiplier *= 1 + 0.12 * mult; },
    stackable: true,
  },
  {
    id: 'arcane_focus',
    name: 'Arcane Focus',
    description: '+12% magic damage & radius',
    descriptionFn: (m) => `+${pct(0.12, m)} magic dmg, +${pct(0.08, m)} radius`,
    icon: 'stat_power',
    apply: (mods, mult = 1) => { mods.magicFamilyDamage += 0.12 * mult; mods.magicFamilyRadius += 0.08 * mult; },
    stackable: true,
  },
  {
    id: 'aura_mastery',
    name: 'Aura Mastery',
    description: '+12% aura damage & radius',
    descriptionFn: (m) => `+${pct(0.12, m)} aura dmg, +${pct(0.08, m)} radius`,
    icon: 'stat_power',
    apply: (mods, mult = 1) => { mods.auraFamilyDamage += 0.12 * mult; mods.auraFamilyRadius += 0.08 * mult; },
    stackable: true,
  },
  // ─── Elemental / status ───
  {
    id: 'pyromaniac',
    name: 'Pyromaniac',
    description: '+8% burn chance',
    descriptionFn: (m) => `+${pct(0.08, m)} burn chance`,
    icon: 'stat_power',
    apply: (mods, mult = 1) => { mods.burnChance += 0.08 * mult; },
    stackable: true,
  },
  {
    id: 'frost_touch',
    name: 'Frost Touch',
    description: '+8% slow chance, +5% slow strength',
    descriptionFn: (m) => `+${pct(0.08, m)} slow chance, +${pct(0.05, m)} slow`,
    icon: 'icon_frost_nova',
    apply: (mods, mult = 1) => { mods.slowChance += 0.08 * mult; mods.slowPercent += 0.05 * mult; },
    stackable: true,
  },
  // ─── Defensive / utility ───
  {
    id: 'nimble',
    name: 'Nimble',
    description: '+5% dodge chance',
    descriptionFn: (m) => `+${pct(0.05, m)} dodge chance`,
    icon: 'stat_move',
    apply: (mods, mult = 1) => { mods.dodgeChance += 0.05 * mult; },
    stackable: true,
  },
  {
    id: 'crit_mastery',
    name: 'Crit Mastery',
    description: '+15% critical damage',
    descriptionFn: (m) => `+${pct(0.15, m)} crit damage`,
    icon: 'stat_crit',
    apply: (mods, mult = 1) => { mods.critDamageBonus += 0.15 * mult; },
    stackable: true,
  },
  {
    id: 'lifedrinker',
    name: 'Lifedrinker',
    description: '+2% lifesteal',
    descriptionFn: (m) => `+${pct(0.02, m)} lifesteal`,
    icon: 'stat_regen',
    apply: (mods, mult = 1) => { mods.lifeStealPercent += 0.02 * mult; },
    stackable: true,
  },
  {
    id: 'piercing_shots',
    name: 'Piercing Shots',
    description: '+1 pierce',
    descriptionFn: (m) => `+${flat(1, m)} pierce`,
    icon: 'stat_power',
    apply: (mods, mult = 1) => { mods.bonusPierce += Math.max(1, Math.floor(1 * mult)); },
    stackable: true,
  },
  {
    id: 'long_range',
    name: 'Long Range',
    description: '+15% projectile range',
    descriptionFn: (m) => `+${pct(0.15, m)} projectile range`,
    icon: 'stat_move',
    apply: (mods, mult = 1) => { mods.projectileRangeMultiplier *= 1 + 0.15 * mult; },
    stackable: true,
  },
  {
    id: 'battle_fury',
    name: 'Battle Fury',
    description: '+8% damage & +8% attack speed',
    descriptionFn: (m) => `+${pct(0.08, m)} dmg & +${pct(0.08, m)} attack speed`,
    icon: 'stat_power',
    apply: (mods, mult = 1) => { mods.damageMultiplier *= 1 + 0.08 * mult; mods.cooldownMultiplier *= 1 - 0.08 * mult; },
    stackable: true,
  },
];
