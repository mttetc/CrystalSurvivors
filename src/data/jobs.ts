import { JobId, JobSkillId, SkillFamily } from '../constants';
import { JobDef, JobPassiveDef, JobSkillDef } from '../types';
import { PlayerStatModifiers } from '../types/enhancements';

// ─── Job Definitions ────────────────────────────────────────────────────────

export const JOB_DEFS: Record<JobId, JobDef> = {
  [JobId.PALADIN]: {
    id: JobId.PALADIN,
    name: 'Paladin',
    description: 'Sacred tank with holy protection',
    color: '#FFD700',
    icon: 'job_paladin',
    skills: [JobSkillId.SACRED_ORBIT, JobSkillId.DIVINE_GUARD, JobSkillId.CONSECRATE],
    passive: {
      name: 'Shield Wall',
      tiers: [
        {
          description: '+3 armor, +0.5 HP/s regen',
          apply: (mods: PlayerStatModifiers) => { mods.armor += 3; mods.regenPerSecond += 0.5; },
        },
        {
          description: '+5 armor, +1 HP/s regen, +10% damage reduction below 50% HP',
          apply: (mods: PlayerStatModifiers) => { mods.armor += 5; mods.regenPerSecond += 1; mods.lowHpDamageReduction += 0.10; },
        },
      ],
    },
  },
  [JobId.DARK_KNIGHT]: {
    id: JobId.DARK_KNIGHT,
    name: 'Dark Knight',
    description: 'Sacrificial warrior fueled by darkness',
    color: '#8B0000',
    icon: 'job_dark_knight',
    skills: [JobSkillId.ABYSSAL_DRAIN, JobSkillId.DARK_FORCE, JobSkillId.DARKNESS],
    passive: {
      name: 'Blood Price',
      tiers: [
        {
          description: '+15% damage, +2% lifesteal',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.15; mods.lifeStealPercent += 0.02; },
        },
        {
          description: '+30% damage, +5% lifesteal',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.30; mods.lifeStealPercent += 0.05; },
        },
      ],
    },
  },
  [JobId.DRAGOON]: {
    id: JobId.DRAGOON,
    name: 'Dragoon',
    description: 'Aerial lancer with devastating jumps',
    color: '#4169E1',
    icon: 'job_dragoon',
    skills: [JobSkillId.JUMP, JobSkillId.LANCE_MASTERY, JobSkillId.HIGHWIND],
    passive: {
      name: 'Aerial Mastery',
      tiers: [
        {
          description: '+20% damage, -15% cooldowns',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.20; mods.cooldownMultiplier -= 0.15; },
        },
        {
          description: '+35% damage, -25% cooldowns',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.35; mods.cooldownMultiplier -= 0.25; },
        },
      ],
    },
  },
  [JobId.NINJA]: {
    id: JobId.NINJA,
    name: 'Ninja',
    description: 'Swift assassin who dances through shadows',
    color: '#9400D3',
    icon: 'job_ninja',
    skills: [JobSkillId.SHADOW_STEP, JobSkillId.DUAL_STRIKE, JobSkillId.SMOKE_BOMB],
    passive: {
      name: 'Ninjutsu',
      tiers: [
        {
          description: '+2 bonus projectiles, +15% dodge chance',
          apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 2; mods.dodgeChance += 0.15; },
        },
        {
          description: '+4 bonus projectiles, +25% dodge chance, +2 dash charges',
          apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 4; mods.dodgeChance += 0.25; mods.bonusDashCharges += 2; },
        },
      ],
    },
  },
  [JobId.MONK]: {
    id: JobId.MONK,
    name: 'Monk',
    description: 'Iron-bodied brawler with counter strikes',
    color: '#FF8C00',
    icon: 'job_monk',
    skills: [JobSkillId.IRON_FIST, JobSkillId.CHI_BURST, JobSkillId.COUNTER],
    passive: {
      name: 'Flow State',
      tiers: [
        {
          description: '+30 max HP, +15% attack speed',
          apply: (mods: PlayerStatModifiers) => { mods.maxHpBonus += 30; mods.cooldownMultiplier -= 0.15; },
        },
        {
          description: '+50 max HP, -25% cooldowns, +15 counter damage',
          apply: (mods: PlayerStatModifiers) => { mods.maxHpBonus += 50; mods.cooldownMultiplier -= 0.25; mods.counterDamage += 15; },
        },
      ],
    },
  },
  [JobId.BERSERKER]: {
    id: JobId.BERSERKER,
    name: 'Berserker',
    description: 'Raging warrior who grows stronger with every kill',
    color: '#DC143C',
    icon: 'job_berserker',
    skills: [JobSkillId.RAGE, JobSkillId.FRENZY, JobSkillId.BLOODLUST],
    passive: {
      name: 'Undying Rage',
      tiers: [
        {
          description: '+25% damage, +3 kill heal',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.25; mods.killHealAmount += 3; },
        },
        {
          description: '+40% damage, +5 kill heal, +5% lifesteal',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.40; mods.killHealAmount += 5; mods.lifeStealPercent += 0.05; },
        },
      ],
    },
  },
  [JobId.RANGER]: {
    id: JobId.RANGER,
    name: 'Ranger',
    description: 'Eagle-eyed marksman raining projectiles',
    color: '#228B22',
    icon: 'job_ranger',
    skills: [JobSkillId.MULTI_SHOT, JobSkillId.EAGLE_EYE, JobSkillId.BARRAGE],
    passive: {
      name: 'True Aim',
      tiers: [
        {
          description: '+10% crit chance, +30% projectile range',
          apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.10; mods.projectileRangeMultiplier += 0.30; },
        },
        {
          description: '+20% crit chance, +50% projectile range, +2 bonus projectiles',
          apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.20; mods.projectileRangeMultiplier += 0.50; mods.bonusProjectiles += 2; },
        },
      ],
    },
  },
  [JobId.BARD]: {
    id: JobId.BARD,
    name: 'Bard',
    description: 'Melodic enchanter empowering through song',
    color: '#DAA520',
    icon: 'job_bard',
    skills: [JobSkillId.WAR_SONG, JobSkillId.SWIFT_SONG, JobSkillId.REQUIEM],
    passive: {
      name: 'Encore',
      tiers: [
        {
          description: '+15% damage, +15% speed',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.15; mods.speedMultiplier += 0.15; },
        },
        {
          description: '+25% damage, +25% speed, -15% cooldowns',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.25; mods.speedMultiplier += 0.25; mods.cooldownMultiplier -= 0.15; },
        },
      ],
    },
  },
  [JobId.BLACK_MAGE]: {
    id: JobId.BLACK_MAGE,
    name: 'Black Mage',
    description: 'Elemental spellcaster wielding fire, ice and thunder',
    color: '#191970',
    icon: 'job_black_mage',
    skills: [JobSkillId.FIRE, JobSkillId.BLIZZARD, JobSkillId.THUNDER],
    passive: {
      name: 'Mana Surge',
      tiers: [
        {
          description: '+20% burn chance, +15% slow chance',
          apply: (mods: PlayerStatModifiers) => { mods.burnChance += 0.20; mods.slowChance += 0.15; },
        },
        {
          description: '+35% burn chance, +25% slow chance, +30% magic damage',
          apply: (mods: PlayerStatModifiers) => { mods.burnChance += 0.35; mods.slowChance += 0.25; mods.magicFamilyDamage += 0.30; },
        },
      ],
    },
  },
  [JobId.WHITE_MAGE]: {
    id: JobId.WHITE_MAGE,
    name: 'White Mage',
    description: 'Holy healer shielded by divine light',
    color: '#FFFFFF',
    icon: 'job_white_mage',
    skills: [JobSkillId.REGEN_WM, JobSkillId.PROTECT, JobSkillId.HOLY],
    passive: {
      name: 'Guardian Angel',
      tiers: [
        {
          description: '+3 HP/s regen, +5 armor',
          apply: (mods: PlayerStatModifiers) => { mods.regenPerSecond += 3; mods.armor += 5; },
        },
        {
          description: '+5 HP/s regen, +8 armor, +20% heal effectiveness',
          apply: (mods: PlayerStatModifiers) => { mods.regenPerSecond += 5; mods.armor += 8; mods.supportEffectiveness += 0.20; },
        },
      ],
    },
  },
  [JobId.SUMMONER]: {
    id: JobId.SUMMONER,
    name: 'Summoner',
    description: 'Mystic commander of elemental familiars',
    color: '#FF69B4',
    icon: 'job_summoner',
    skills: [JobSkillId.IFRIT, JobSkillId.SHIVA, JobSkillId.BAHAMUT],
    passive: {
      name: 'Empathy',
      tiers: [
        {
          description: '+25% summon damage, -15% summon cooldowns',
          apply: (mods: PlayerStatModifiers) => { mods.summonFamilyDamage += 0.25; mods.summonFamilyCooldown += 0.15; },
        },
        {
          description: '+50% summon damage, -30% summon cooldowns',
          apply: (mods: PlayerStatModifiers) => { mods.summonFamilyDamage += 0.50; mods.summonFamilyCooldown += 0.30; },
        },
      ],
    },
  },
  [JobId.TIME_MAGE]: {
    id: JobId.TIME_MAGE,
    name: 'Time Mage',
    description: 'Chronomancer bending time and cooldowns',
    color: '#9370DB',
    icon: 'job_time_mage',
    skills: [JobSkillId.HASTE, JobSkillId.SLOW_FIELD, JobSkillId.METEOR],
    passive: {
      name: 'Time Warp',
      tiers: [
        {
          description: '-20% cooldowns, +10% speed',
          apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.20; mods.speedMultiplier += 0.10; },
        },
        {
          description: '-35% cooldowns, +20% speed',
          apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.35; mods.speedMultiplier += 0.20; },
        },
      ],
    },
  },
  [JobId.ALCHEMIST]: {
    id: JobId.ALCHEMIST,
    name: 'Alchemist',
    description: 'Resourceful survivor transmuting drops and potions',
    color: '#32CD32',
    icon: 'job_alchemist',
    skills: [JobSkillId.POTION_LORE, JobSkillId.TRANSMUTE, JobSkillId.ELIXIR],
    passive: {
      name: 'Brew Master',
      tiers: [
        {
          description: '+100% health drop effectiveness, +20% XP gain',
          apply: (mods: PlayerStatModifiers) => { mods.healthDropMultiplier += 1.00; mods.xpMultiplier += 0.20; },
        },
        {
          description: '+150% health drop effectiveness, +40% XP gain, +25% damage',
          apply: (mods: PlayerStatModifiers) => { mods.healthDropMultiplier += 1.50; mods.xpMultiplier += 0.40; mods.damageMultiplier += 0.25; },
        },
      ],
    },
  },
  [JobId.GEOMANCER]: {
    id: JobId.GEOMANCER,
    name: 'Geomancer',
    description: 'Terrain shaper controlling the battlefield',
    color: '#8B4513',
    icon: 'job_geomancer',
    skills: [JobSkillId.PITFALL, JobSkillId.GUST, JobSkillId.QUAKE],
    passive: {
      name: 'Stone Skin',
      tiers: [
        {
          description: '+5 armor, +25% melee damage, +20% melee range',
          apply: (mods: PlayerStatModifiers) => { mods.armor += 5; mods.meleeFamilyDamage += 0.25; mods.meleeFamilyRange += 0.20; },
        },
        {
          description: '+8 armor, +40% melee damage, +35% melee range',
          apply: (mods: PlayerStatModifiers) => { mods.armor += 8; mods.meleeFamilyDamage += 0.40; mods.meleeFamilyRange += 0.35; },
        },
      ],
    },
  },
  [JobId.SAMURAI]: {
    id: JobId.SAMURAI,
    name: 'Samurai',
    description: 'Precision swordsman striking lethal criticals',
    color: '#B22222',
    icon: 'job_samurai',
    skills: [JobSkillId.BUSHIDO, JobSkillId.IAI_STRIKE, JobSkillId.ZANTETSUKEN],
    passive: {
      name: 'Iaijutsu',
      tiers: [
        {
          description: '+15% crit chance, +50% crit damage bonus',
          apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.15; mods.critDamageBonus += 0.50; },
        },
        {
          description: '+25% crit chance, +80% crit damage bonus, +20% damage',
          apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.25; mods.critDamageBonus += 0.80; mods.damageMultiplier += 0.20; },
        },
      ],
    },
  },
};

// ─── Job Skill Definitions ──────────────────────────────────────────────────

export const JOB_SKILL_DEFS: Record<JobSkillId, JobSkillDef> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // PALADIN
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.SACRED_ORBIT]: {
    id: JobSkillId.SACRED_ORBIT,
    jobId: JobId.PALADIN,
    name: 'Sacred Orbit',
    type: 'active',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '2 holy shields orbit the player (10 dmg per hit)',
        params: { count: 2, damage: 10, hitInterval: 300, orbitRadius: 30 },
      },
      {
        description: '3 holy shields orbit the player (14 dmg per hit)',
        params: { count: 3, damage: 14, hitInterval: 250, orbitRadius: 35 },
      },
      {
        description: '4 holy shields orbit the player (18 dmg per hit)',
        params: { count: 4, damage: 18, hitInterval: 200, orbitRadius: 40 },
      },
    ],
  },
  [JobSkillId.DIVINE_GUARD]: {
    id: JobSkillId.DIVINE_GUARD,
    jobId: JobId.PALADIN,
    name: 'Divine Guard',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '-10% damage taken below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageReduction += 0.10; },
      },
      {
        description: '-10% damage taken below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageReduction += 0.10; },
      },
      {
        description: '-10% damage taken below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageReduction += 0.10; },
      },
    ],
  },
  [JobSkillId.CONSECRATE]: {
    id: JobSkillId.CONSECRATE,
    jobId: JobId.PALADIN,
    name: 'Consecrate',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      {
        description: 'Holy aura 30px dealing 3 dmg/s',
        params: { radius: 30, damage: 3, cooldown: 1000 },
      },
      {
        description: 'Holy aura 40px dealing 5 dmg/s',
        params: { radius: 40, damage: 5, cooldown: 1000 },
      },
      {
        description: 'Holy aura 50px dealing 8 dmg/s',
        params: { radius: 50, damage: 8, cooldown: 1000 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DARK KNIGHT
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.ABYSSAL_DRAIN]: {
    id: JobSkillId.ABYSSAL_DRAIN,
    jobId: JobId.DARK_KNIGHT,
    name: 'Abyssal Drain',
    type: 'modifier',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: '3% life steal on damage dealt',
        apply: (mods: PlayerStatModifiers) => { mods.lifeStealPercent += 0.03; },
      },
      {
        description: '2% life steal on damage dealt',
        apply: (mods: PlayerStatModifiers) => { mods.lifeStealPercent += 0.02; },
      },
      {
        description: '3% life steal on damage dealt',
        apply: (mods: PlayerStatModifiers) => { mods.lifeStealPercent += 0.03; },
      },
    ],
  },
  [JobSkillId.DARK_FORCE]: {
    id: JobSkillId.DARK_FORCE,
    jobId: JobId.DARK_KNIGHT,
    name: 'Dark Force',
    type: 'modifier',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: '+25% damage below 30% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageBonus += 0.25; },
      },
      {
        description: '+15% damage below 30% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageBonus += 0.15; },
      },
      {
        description: '+20% damage below 30% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageBonus += 0.20; },
      },
    ],
  },
  [JobSkillId.DARKNESS]: {
    id: JobSkillId.DARKNESS,
    jobId: JobId.DARK_KNIGHT,
    name: 'Darkness',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'On-hit dark AoE 40px dealing 10 dmg (costs 3 HP)',
        params: { radius: 40, damage: 10, hpCost: 3 },
      },
      {
        description: 'On-hit dark AoE 50px dealing 18 dmg (costs 3 HP)',
        params: { radius: 50, damage: 18, hpCost: 3 },
      },
      {
        description: 'On-hit dark AoE 60px dealing 28 dmg (costs 3 HP)',
        params: { radius: 60, damage: 28, hpCost: 3 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAGOON
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.JUMP]: {
    id: JobSkillId.JUMP,
    jobId: JobId.DRAGOON,
    name: 'Jump',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Invulnerable leap, AoE 40px dealing 15 dmg (8s CD)',
        params: { radius: 40, damage: 15, cooldown: 8000 },
      },
      {
        description: 'Invulnerable leap, AoE 50px dealing 25 dmg (6s CD)',
        params: { radius: 50, damage: 25, cooldown: 6000 },
      },
      {
        description: 'Invulnerable leap, AoE 60px dealing 40 dmg (4s CD)',
        params: { radius: 60, damage: 40, cooldown: 4000 },
      },
    ],
  },
  [JobSkillId.LANCE_MASTERY]: {
    id: JobSkillId.LANCE_MASTERY,
    jobId: JobId.DRAGOON,
    name: 'Lance Mastery',
    type: 'modifier',
    family: SkillFamily.PROJECTILE,
    levels: [
      {
        description: '+1 pierce on projectiles',
        apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 1; },
      },
      {
        description: '+1 pierce on projectiles',
        apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 1; },
      },
      {
        description: '+1 pierce on projectiles',
        apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 1; },
      },
    ],
  },
  [JobSkillId.HIGHWIND]: {
    id: JobSkillId.HIGHWIND,
    jobId: JobId.DRAGOON,
    name: 'Highwind',
    type: 'modifier',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Jump AoE radius +30%',
        apply: (_mods: PlayerStatModifiers) => { /* Enhances Jump radius; handled by JobSkillManager */ },
      },
      {
        description: 'Jump AoE radius +60%',
        apply: (_mods: PlayerStatModifiers) => { /* Enhances Jump radius; handled by JobSkillManager */ },
      },
      {
        description: 'Jump AoE radius +100%',
        apply: (_mods: PlayerStatModifiers) => { /* Enhances Jump radius; handled by JobSkillManager */ },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NINJA
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.SHADOW_STEP]: {
    id: JobSkillId.SHADOW_STEP,
    jobId: JobId.NINJA,
    name: 'Shadow Step',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '+1 dash charge, -20% dash recharge time',
        apply: (mods: PlayerStatModifiers) => {
          mods.bonusDashCharges += 1;
          mods.dashRechargeReduction += 0.20;
        },
      },
      {
        description: '+1 dash charge, -10% dash recharge time',
        apply: (mods: PlayerStatModifiers) => {
          mods.bonusDashCharges += 1;
          mods.dashRechargeReduction += 0.10;
        },
      },
      {
        description: '+1 dash charge, -10% dash recharge time',
        apply: (mods: PlayerStatModifiers) => {
          mods.bonusDashCharges += 1;
          mods.dashRechargeReduction += 0.10;
        },
      },
    ],
  },
  [JobSkillId.DUAL_STRIKE]: {
    id: JobSkillId.DUAL_STRIKE,
    jobId: JobId.NINJA,
    name: 'Dual Strike',
    type: 'modifier',
    family: SkillFamily.PROJECTILE,
    levels: [
      {
        description: '+1 bonus projectile',
        apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 1; },
      },
      {
        description: '+1 bonus projectile',
        apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 1; },
      },
      {
        description: '+2 bonus projectiles',
        apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 2; },
      },
    ],
  },
  [JobSkillId.SMOKE_BOMB]: {
    id: JobSkillId.SMOKE_BOMB,
    jobId: JobId.NINJA,
    name: 'Smoke Bomb',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '12% dodge chance',
        apply: (mods: PlayerStatModifiers) => { mods.dodgeChance += 0.12; },
      },
      {
        description: '8% dodge chance',
        apply: (mods: PlayerStatModifiers) => { mods.dodgeChance += 0.08; },
      },
      {
        description: '10% dodge chance',
        apply: (mods: PlayerStatModifiers) => { mods.dodgeChance += 0.10; },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MONK
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.IRON_FIST]: {
    id: JobSkillId.IRON_FIST,
    jobId: JobId.MONK,
    name: 'Iron Fist',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '+25 max HP',
        apply: (mods: PlayerStatModifiers) => { mods.maxHpBonus += 25; },
      },
      {
        description: '+20 max HP',
        apply: (mods: PlayerStatModifiers) => { mods.maxHpBonus += 20; },
      },
      {
        description: '+25 max HP',
        apply: (mods: PlayerStatModifiers) => { mods.maxHpBonus += 25; },
      },
    ],
  },
  [JobSkillId.CHI_BURST]: {
    id: JobSkillId.CHI_BURST,
    jobId: JobId.MONK,
    name: 'Chi Burst',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Energy wave 50px dealing 8 dmg (5s CD)',
        params: { radius: 50, damage: 8, cooldown: 5000 },
      },
      {
        description: 'Energy wave 60px dealing 15 dmg (4s CD)',
        params: { radius: 60, damage: 15, cooldown: 4000 },
      },
      {
        description: 'Energy wave 75px dealing 25 dmg (3s CD)',
        params: { radius: 75, damage: 25, cooldown: 3000 },
      },
    ],
  },
  [JobSkillId.COUNTER]: {
    id: JobSkillId.COUNTER,
    jobId: JobId.MONK,
    name: 'Counter',
    type: 'modifier',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Counter-attack dealing 8 dmg in 40px radius when hit',
        apply: (mods: PlayerStatModifiers) => {
          mods.counterDamage = 8;
          mods.counterRadius = 40;
        },
      },
      {
        description: 'Counter-attack dealing 15 dmg in 50px radius when hit',
        apply: (mods: PlayerStatModifiers) => {
          mods.counterDamage = 15;
          mods.counterRadius = 50;
        },
      },
      {
        description: 'Counter-attack dealing 25 dmg in 60px radius when hit',
        apply: (mods: PlayerStatModifiers) => {
          mods.counterDamage = 25;
          mods.counterRadius = 60;
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BERSERKER
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.RAGE]: {
    id: JobSkillId.RAGE,
    jobId: JobId.BERSERKER,
    name: 'Rage',
    type: 'modifier',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Kills grant +5% attack speed for 3s (max 5 stacks)',
        apply: (mods: PlayerStatModifiers) => {
          mods.rageAttackSpeedPerKill += 0.05;
          mods.rageMaxStacks = 5;
        },
      },
      {
        description: 'Kills grant +3% attack speed for 3s (max 5 stacks)',
        apply: (mods: PlayerStatModifiers) => {
          mods.rageAttackSpeedPerKill += 0.03;
          mods.rageMaxStacks = 5;
        },
      },
      {
        description: 'Kills grant +4% attack speed for 3s (max 5 stacks)',
        apply: (mods: PlayerStatModifiers) => {
          mods.rageAttackSpeedPerKill += 0.04;
          mods.rageMaxStacks = 5;
        },
      },
    ],
  },
  [JobSkillId.FRENZY]: {
    id: JobSkillId.FRENZY,
    jobId: JobId.BERSERKER,
    name: 'Frenzy',
    type: 'modifier',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: '+15% attack speed below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.frenzyAttackSpeedBonus += 0.15; },
      },
      {
        description: '+10% attack speed below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.frenzyAttackSpeedBonus += 0.10; },
      },
      {
        description: '+15% attack speed below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.frenzyAttackSpeedBonus += 0.15; },
      },
    ],
  },
  [JobSkillId.BLOODLUST]: {
    id: JobSkillId.BLOODLUST,
    jobId: JobId.BERSERKER,
    name: 'Bloodlust',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: 'Kills heal 1 HP',
        apply: (mods: PlayerStatModifiers) => { mods.killHealAmount += 1; },
      },
      {
        description: 'Kills heal 1 HP',
        apply: (mods: PlayerStatModifiers) => { mods.killHealAmount += 1; },
      },
      {
        description: 'Kills heal 1 HP',
        apply: (mods: PlayerStatModifiers) => { mods.killHealAmount += 1; },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RANGER
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.MULTI_SHOT]: {
    id: JobSkillId.MULTI_SHOT,
    jobId: JobId.RANGER,
    name: 'Multi-Shot',
    type: 'modifier',
    family: SkillFamily.PROJECTILE,
    levels: [
      {
        description: '+1 bonus projectile',
        apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 1; },
      },
      {
        description: '+1 bonus projectile',
        apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 1; },
      },
      {
        description: '+2 bonus projectiles',
        apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 2; },
      },
    ],
  },
  [JobSkillId.EAGLE_EYE]: {
    id: JobSkillId.EAGLE_EYE,
    jobId: JobId.RANGER,
    name: 'Eagle Eye',
    type: 'modifier',
    family: SkillFamily.PROJECTILE,
    levels: [
      {
        description: '+25% projectile range',
        apply: (mods: PlayerStatModifiers) => { mods.projectileRangeMultiplier += 0.25; },
      },
      {
        description: '+15% projectile range',
        apply: (mods: PlayerStatModifiers) => { mods.projectileRangeMultiplier += 0.15; },
      },
      {
        description: '+20% projectile range',
        apply: (mods: PlayerStatModifiers) => { mods.projectileRangeMultiplier += 0.20; },
      },
    ],
  },
  [JobSkillId.BARRAGE]: {
    id: JobSkillId.BARRAGE,
    jobId: JobId.RANGER,
    name: 'Barrage',
    type: 'active',
    family: SkillFamily.PROJECTILE,
    levels: [
      {
        description: 'Fire a cone of 5 arrows (6s CD)',
        params: { count: 5, cooldown: 6000 },
      },
      {
        description: 'Fire a cone of 8 arrows (5s CD)',
        params: { count: 8, cooldown: 5000 },
      },
      {
        description: 'Fire a cone of 12 arrows (4s CD)',
        params: { count: 12, cooldown: 4000 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BARD
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.WAR_SONG]: {
    id: JobSkillId.WAR_SONG,
    jobId: JobId.BARD,
    name: 'War Song',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '+10% damage',
        apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.10; },
      },
      {
        description: '+8% damage',
        apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.08; },
      },
      {
        description: '+10% damage',
        apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.10; },
      },
    ],
  },
  [JobSkillId.SWIFT_SONG]: {
    id: JobSkillId.SWIFT_SONG,
    jobId: JobId.BARD,
    name: 'Swift Song',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '+12% movement speed',
        apply: (mods: PlayerStatModifiers) => { mods.speedMultiplier += 0.12; },
      },
      {
        description: '+8% movement speed',
        apply: (mods: PlayerStatModifiers) => { mods.speedMultiplier += 0.08; },
      },
      {
        description: '+10% movement speed',
        apply: (mods: PlayerStatModifiers) => { mods.speedMultiplier += 0.10; },
      },
    ],
  },
  [JobSkillId.REQUIEM]: {
    id: JobSkillId.REQUIEM,
    jobId: JobId.BARD,
    name: 'Requiem',
    type: 'active',
    family: SkillFamily.AURA,
    levels: [
      {
        description: 'Sonic aura 45px dealing 2 dmg/s, 10% slow',
        params: { radius: 45, damage: 2, slowPercent: 0.10, cooldown: 1000 },
      },
      {
        description: 'Sonic aura 55px dealing 4 dmg/s, 15% slow',
        params: { radius: 55, damage: 4, slowPercent: 0.15, cooldown: 1000 },
      },
      {
        description: 'Sonic aura 65px dealing 7 dmg/s, 20% slow',
        params: { radius: 65, damage: 7, slowPercent: 0.20, cooldown: 1000 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLACK MAGE
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.FIRE]: {
    id: JobSkillId.FIRE,
    jobId: JobId.BLACK_MAGE,
    name: 'Fire',
    type: 'modifier',
    family: SkillFamily.MAGIC,
    levels: [
      {
        description: '12% chance to inflict burn (3 dmg/s for 2s)',
        apply: (mods: PlayerStatModifiers) => { mods.burnChance += 0.12; },
      },
      {
        description: '8% chance to inflict burn (3 dmg/s for 2s)',
        apply: (mods: PlayerStatModifiers) => { mods.burnChance += 0.08; },
      },
      {
        description: '10% chance to inflict burn (3 dmg/s for 2s)',
        apply: (mods: PlayerStatModifiers) => { mods.burnChance += 0.10; },
      },
    ],
  },
  [JobSkillId.BLIZZARD]: {
    id: JobSkillId.BLIZZARD,
    jobId: JobId.BLACK_MAGE,
    name: 'Blizzard',
    type: 'modifier',
    family: SkillFamily.MAGIC,
    levels: [
      {
        description: '10% chance to slow enemies by 30% for 2s',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowChance += 0.10;
          mods.slowPercent = 0.30;
        },
      },
      {
        description: '8% chance to slow enemies by 30% for 2s',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowChance += 0.08;
          mods.slowPercent = 0.30;
        },
      },
      {
        description: '10% chance to slow enemies by 30% for 2s',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowChance += 0.10;
          mods.slowPercent = 0.30;
        },
      },
    ],
  },
  [JobSkillId.THUNDER]: {
    id: JobSkillId.THUNDER,
    jobId: JobId.BLACK_MAGE,
    name: 'Thunder',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      {
        description: 'Critical chain lightning hitting 3 targets',
        params: { chainTargets: 3, cooldown: 0 },
      },
      {
        description: 'Critical chain lightning hitting 5 targets',
        params: { chainTargets: 5, cooldown: 0 },
      },
      {
        description: 'Critical chain lightning hitting 8 targets',
        params: { chainTargets: 8, cooldown: 0 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WHITE MAGE
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.REGEN_WM]: {
    id: JobSkillId.REGEN_WM,
    jobId: JobId.WHITE_MAGE,
    name: 'Regen',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '+1.5 HP/s regeneration',
        apply: (mods: PlayerStatModifiers) => { mods.regenPerSecond += 1.5; },
      },
      {
        description: '+1.5 HP/s regeneration',
        apply: (mods: PlayerStatModifiers) => { mods.regenPerSecond += 1.5; },
      },
      {
        description: '+2 HP/s regeneration',
        apply: (mods: PlayerStatModifiers) => { mods.regenPerSecond += 2; },
      },
    ],
  },
  [JobSkillId.PROTECT]: {
    id: JobSkillId.PROTECT,
    jobId: JobId.WHITE_MAGE,
    name: 'Protect',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '+3 armor',
        apply: (mods: PlayerStatModifiers) => { mods.armor += 3; },
      },
      {
        description: '+2 armor',
        apply: (mods: PlayerStatModifiers) => { mods.armor += 2; },
      },
      {
        description: '+3 armor',
        apply: (mods: PlayerStatModifiers) => { mods.armor += 3; },
      },
    ],
  },
  [JobSkillId.HOLY]: {
    id: JobSkillId.HOLY,
    jobId: JobId.WHITE_MAGE,
    name: 'Holy',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      {
        description: 'Holy burst 50px stunning enemies for 0.5s (8s CD)',
        params: { radius: 50, stunDuration: 500, cooldown: 8000 },
      },
      {
        description: 'Holy burst 65px stunning enemies for 0.8s (6s CD)',
        params: { radius: 65, stunDuration: 800, cooldown: 6000 },
      },
      {
        description: 'Holy burst 80px stunning enemies for 1s (4s CD)',
        params: { radius: 80, stunDuration: 1000, cooldown: 4000 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMONER
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.IFRIT]: {
    id: JobSkillId.IFRIT,
    jobId: JobId.SUMMONER,
    name: 'Ifrit',
    type: 'active',
    family: SkillFamily.SUMMONING,
    levels: [
      {
        description: 'Fire familiar orbiting, 5 dmg per hit (1.5s interval)',
        params: { damage: 5, attackInterval: 1500 },
      },
      {
        description: 'Fire familiar orbiting, 10 dmg per hit (1.2s interval)',
        params: { damage: 10, attackInterval: 1200 },
      },
      {
        description: 'Fire familiar orbiting, 18 dmg per hit (0.9s interval)',
        params: { damage: 18, attackInterval: 900 },
      },
    ],
  },
  [JobSkillId.SHIVA]: {
    id: JobSkillId.SHIVA,
    jobId: JobId.SUMMONER,
    name: 'Shiva',
    type: 'active',
    family: SkillFamily.SUMMONING,
    levels: [
      {
        description: 'Ice familiar orbiting, 25% slow on hit',
        params: { slowPercent: 0.25, freezeChance: 0, attackInterval: 1500 },
      },
      {
        description: 'Ice familiar orbiting, 35% slow on hit',
        params: { slowPercent: 0.35, freezeChance: 0, attackInterval: 1500 },
      },
      {
        description: 'Ice familiar orbiting, 50% slow + 10% freeze chance',
        params: { slowPercent: 0.50, freezeChance: 0.10, attackInterval: 1500 },
      },
    ],
  },
  [JobSkillId.BAHAMUT]: {
    id: JobSkillId.BAHAMUT,
    jobId: JobId.SUMMONER,
    name: 'Bahamut',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      {
        description: 'Mega Flare AoE 80px dealing 20 dmg (12s CD)',
        params: { radius: 80, damage: 20, cooldown: 12000 },
      },
      {
        description: 'Mega Flare AoE 100px dealing 35 dmg (9s CD)',
        params: { radius: 100, damage: 35, cooldown: 9000 },
      },
      {
        description: 'Mega Flare AoE 120px dealing 55 dmg (6s CD)',
        params: { radius: 120, damage: 55, cooldown: 6000 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIME MAGE
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.HASTE]: {
    id: JobSkillId.HASTE,
    jobId: JobId.TIME_MAGE,
    name: 'Haste',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '-12% cooldowns on all abilities',
        apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.12; },
      },
      {
        description: '-8% cooldowns on all abilities',
        apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.08; },
      },
      {
        description: '-10% cooldowns on all abilities',
        apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.10; },
      },
    ],
  },
  [JobSkillId.SLOW_FIELD]: {
    id: JobSkillId.SLOW_FIELD,
    jobId: JobId.TIME_MAGE,
    name: 'Slow Field',
    type: 'modifier',
    family: SkillFamily.AURA,
    levels: [
      {
        description: 'Aura slowing enemies by 20% in 60px',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowFieldRadius = 60;
          mods.slowFieldPercent = 0.20;
        },
      },
      {
        description: 'Aura slowing enemies by 30% in 75px',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowFieldRadius = 75;
          mods.slowFieldPercent = 0.30;
        },
      },
      {
        description: 'Aura slowing enemies by 40% in 90px',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowFieldRadius = 90;
          mods.slowFieldPercent = 0.40;
        },
      },
    ],
  },
  [JobSkillId.METEOR]: {
    id: JobSkillId.METEOR,
    jobId: JobId.TIME_MAGE,
    name: 'Meteor',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      {
        description: 'Meteor strike 60px dealing 18 dmg (10s CD)',
        params: { radius: 60, damage: 18, cooldown: 10000 },
      },
      {
        description: 'Meteor strike 75px dealing 30 dmg (7s CD)',
        params: { radius: 75, damage: 30, cooldown: 7000 },
      },
      {
        description: 'Meteor strike 90px dealing 45 dmg (5s CD)',
        params: { radius: 90, damage: 45, cooldown: 5000 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ALCHEMIST
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.POTION_LORE]: {
    id: JobSkillId.POTION_LORE,
    jobId: JobId.ALCHEMIST,
    name: 'Potion Lore',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '+50% health drop effectiveness',
        apply: (mods: PlayerStatModifiers) => { mods.healthDropMultiplier += 0.50; },
      },
      {
        description: '+50% health drop effectiveness',
        apply: (mods: PlayerStatModifiers) => { mods.healthDropMultiplier += 0.50; },
      },
      {
        description: '+50% health drop effectiveness',
        apply: (mods: PlayerStatModifiers) => { mods.healthDropMultiplier += 0.50; },
      },
    ],
  },
  [JobSkillId.TRANSMUTE]: {
    id: JobSkillId.TRANSMUTE,
    jobId: JobId.ALCHEMIST,
    name: 'Transmute',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: '+20% XP gained',
        apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.20; },
      },
      {
        description: '+15% XP gained',
        apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.15; },
      },
      {
        description: '+20% XP gained',
        apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.20; },
      },
    ],
  },
  [JobSkillId.ELIXIR]: {
    id: JobSkillId.ELIXIR,
    jobId: JobId.ALCHEMIST,
    name: 'Elixir',
    type: 'active',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: 'Auto-heal 30% max HP (60s CD)',
        params: { healPercent: 0.30, cooldown: 60000 },
      },
      {
        description: 'Auto-heal 50% max HP (45s CD)',
        params: { healPercent: 0.50, cooldown: 45000 },
      },
      {
        description: 'Auto-heal 100% max HP (30s CD)',
        params: { healPercent: 1.00, cooldown: 30000 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GEOMANCER
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.PITFALL]: {
    id: JobSkillId.PITFALL,
    jobId: JobId.GEOMANCER,
    name: 'Pitfall',
    type: 'active',
    family: SkillFamily.AURA,
    levels: [
      {
        description: 'Leave damage trail dealing 2 dmg/s for 2s',
        params: { damage: 2, duration: 2000, cooldown: 500 },
      },
      {
        description: 'Leave damage trail dealing 4 dmg/s for 3s',
        params: { damage: 4, duration: 3000, cooldown: 500 },
      },
      {
        description: 'Leave damage trail dealing 7 dmg/s for 4s',
        params: { damage: 7, duration: 4000, cooldown: 500 },
      },
    ],
  },
  [JobSkillId.GUST]: {
    id: JobSkillId.GUST,
    jobId: JobId.GEOMANCER,
    name: 'Gust',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      {
        description: 'Repel enemies in 70px radius (8s CD)',
        params: { radius: 70, cooldown: 8000 },
      },
      {
        description: 'Repel enemies in 90px radius (6s CD)',
        params: { radius: 90, cooldown: 6000 },
      },
      {
        description: 'Repel enemies in 110px radius (4s CD)',
        params: { radius: 110, cooldown: 4000 },
      },
    ],
  },
  [JobSkillId.QUAKE]: {
    id: JobSkillId.QUAKE,
    jobId: JobId.GEOMANCER,
    name: 'Quake',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Ground slam 55px stunning for 0.5s (10s CD)',
        params: { radius: 55, stunDuration: 500, cooldown: 10000 },
      },
      {
        description: 'Ground slam 70px stunning for 0.8s (7s CD)',
        params: { radius: 70, stunDuration: 800, cooldown: 7000 },
      },
      {
        description: 'Ground slam 85px stunning for 1.2s (5s CD)',
        params: { radius: 85, stunDuration: 1200, cooldown: 5000 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAMURAI
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.BUSHIDO]: {
    id: JobSkillId.BUSHIDO,
    jobId: JobId.SAMURAI,
    name: 'Bushido',
    type: 'modifier',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: '+12% critical hit chance',
        apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.12; },
      },
      {
        description: '+10% critical hit chance',
        apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.10; },
      },
      {
        description: '+13% critical hit chance',
        apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.13; },
      },
    ],
  },
  [JobSkillId.IAI_STRIKE]: {
    id: JobSkillId.IAI_STRIKE,
    jobId: JobId.SAMURAI,
    name: 'Iai Strike',
    type: 'modifier',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Crits deal +50% extra damage',
        apply: (mods: PlayerStatModifiers) => { mods.critDamageBonus += 0.50; },
      },
      {
        description: 'Crits deal +30% extra damage',
        apply: (mods: PlayerStatModifiers) => { mods.critDamageBonus += 0.30; },
      },
      {
        description: 'Crits deal +40% extra damage',
        apply: (mods: PlayerStatModifiers) => { mods.critDamageBonus += 0.40; },
      },
    ],
  },
  [JobSkillId.ZANTETSUKEN]: {
    id: JobSkillId.ZANTETSUKEN,
    jobId: JobId.SAMURAI,
    name: 'Zantetsuken',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Line slash 120px dealing 20 dmg (10s CD)',
        params: { range: 120, damage: 20, cooldown: 10000 },
      },
      {
        description: 'Line slash 150px dealing 35 dmg (7s CD)',
        params: { range: 150, damage: 35, cooldown: 7000 },
      },
      {
        description: 'Line slash 180px dealing 55 dmg (5s CD)',
        params: { range: 180, damage: 55, cooldown: 5000 },
      },
    ],
  },
};
