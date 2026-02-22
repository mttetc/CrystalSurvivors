import { EnhancementCategory, WeaponId, EnchantId, ElementId, Rarity, JobId, JobSkillId, MasterySkillId, SkillFamily } from '../constants';

export interface EnhancementCard {
  category: EnhancementCategory;
  title: string;
  description: string;
  icon: string;            // texture key
  rarity: Rarity;
  // Category-specific
  jobId?: JobId;              // for JOB_SELECTION and JOB_SKILL
  jobSkillId?: JobSkillId;    // for JOB_SKILL
  masterySkillId?: MasterySkillId;  // for MASTERY_SKILL
  weaponId?: WeaponId;
  enchantId?: EnchantId;
  targetWeaponId?: WeaponId;  // for enchant/element application
  skillFamily?: SkillFamily;  // for FAMILY_BOOST
  statBoostId?: string;       // for STAT_BOOST
  elementId?: ElementId;      // for APPLY_ELEMENT
  elementUpgradeId?: string;  // for ELEMENT_UPGRADE
  malusCardId?: string;       // for MALUS_TRADE
  synergyId?: string;         // for SYNERGY_UPGRADE
  // Malus display
  bonusText?: string;         // green text for malus cards
  malusText?: string;         // red text for malus cards
}

export interface PlayerStatModifiers {
  // Core
  maxHpBonus: number;
  speedMultiplier: number;
  pickupRadiusMultiplier: number;
  xpMultiplier: number;
  cooldownMultiplier: number;
  damageMultiplier: number;
  armor: number;
  regenPerSecond: number;
  doubleGemChance: number;
  adrenalineSpeedBonus: number;
  adrenalineDamageBonus: number;
  // Job skill modifiers
  lifeStealPercent: number;         // Abyssal Drain
  lowHpDamageBonus: number;         // Dark Force (below 30%)
  lowHpDamageReduction: number;     // Divine Guard (below 50%)
  bonusPierce: number;              // Lance Mastery
  bonusDashCharges: number;         // Shadow Step
  dashRechargeReduction: number;    // Shadow Step
  bonusProjectiles: number;         // Dual Strike / Multi-Shot
  dodgeChance: number;              // Smoke Bomb
  counterDamage: number;            // Counter
  counterRadius: number;            // Counter
  rageAttackSpeedPerKill: number;   // Rage
  rageMaxStacks: number;            // Rage
  frenzyAttackSpeedBonus: number;   // Frenzy
  killHealAmount: number;           // Bloodlust
  deathSaveCooldown: number;        // Living Dead (0 = disabled)
  projectileRangeMultiplier: number;// Eagle Eye
  burnChance: number;               // Fire
  slowChance: number;               // Blizzard
  slowPercent: number;              // Blizzard
  critChance: number;               // Bushido
  critDamageBonus: number;          // Iai Strike
  healthDropMultiplier: number;     // Potion Lore
  slowFieldRadius: number;          // Slow Field
  slowFieldPercent: number;         // Slow Field
  // Family modifiers
  projectileFamilyDamage: number;
  magicFamilyDamage: number;
  magicFamilyRadius: number;
  meleeFamilyDamage: number;
  meleeFamilyRange: number;
  auraFamilyDamage: number;
  auraFamilyRadius: number;
  supportEffectiveness: number;
  summonFamilyDamage: number;
  summonFamilyCooldown: number;
  // Range & visual scaling (Phase 5)
  rangeMultiplier: number;             // 1.0 base, affects radius/range
  projectileScaleMultiplier: number;   // 1.0 base, visual scale for projectiles
  meleeScaleMultiplier: number;        // 1.0 base, visual scale for melee weapons
  aoeScaleMultiplier: number;          // 1.0 base, visual scale for AoE effects
  // Malus-specific
  healingMultiplier: number;           // 1.0 base, affects healing from drops
  meleeDamageMultiplier: number;       // 1.0 base
  projectileDamageMultiplier: number;  // 1.0 base
  aoeDamageMultiplier: number;         // 1.0 base (unused for now, reserved)
}
