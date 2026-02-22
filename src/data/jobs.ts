import { JobId, JobSkillId, MasterySkillId, SkillFamily, SPRITE_SCALE } from '../constants';
import { JobDef, JobPassiveDef, JobSkillDef } from '../types';
import { PlayerStatModifiers } from '../types/enhancements';

const SS = SPRITE_SCALE;

// ─── Job Definitions ────────────────────────────────────────────────────────

export const JOB_DEFS: Record<JobId, JobDef> = {
  [JobId.PALADIN]: {
    id: JobId.PALADIN,
    name: 'Paladin',
    description: 'Sacred tank with holy protection',
    color: '#FFD700',
    icon: 'job_paladin',
    skills: [JobSkillId.SACRED_ORBIT, JobSkillId.DIVINE_GUARD, JobSkillId.CONSECRATE],
    masterySkills: [MasterySkillId.HALLOWED_GROUND, MasterySkillId.CLEMENCY],
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
    masterySkills: [MasterySkillId.SOUL_EATER, MasterySkillId.LIVING_DEAD],
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
    skills: [JobSkillId.JUMP, JobSkillId.LANCE_MASTERY, JobSkillId.DRAGON_DIVE],
    masterySkills: [MasterySkillId.STARDIVER, MasterySkillId.NASTROND],
    passive: {
      name: 'Aerial Mastery',
      tiers: [
        {
          description: '+20% damage, -15% cooldowns, +20% AoE radius',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.20; mods.cooldownMultiplier -= 0.15; mods.aoeScaleMultiplier += 0.20; },
        },
        {
          description: '+35% damage, -25% cooldowns, +35% AoE radius',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.35; mods.cooldownMultiplier -= 0.25; mods.aoeScaleMultiplier += 0.35; },
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
    masterySkills: [MasterySkillId.KATON, MasterySkillId.RAITON, MasterySkillId.DOTON],
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
    skills: [JobSkillId.IRON_FIST, JobSkillId.CHI_BURST, JobSkillId.HADOUKEN],
    masterySkills: [MasterySkillId.FORBIDDEN_CHAKRA, MasterySkillId.PHANTOM_RUSH],
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
    skills: [JobSkillId.WAR_CRY, JobSkillId.FRENZY, JobSkillId.RAMPAGE],
    masterySkills: [MasterySkillId.INNER_BEAST, MasterySkillId.FELL_CLEAVE],
    passive: {
      name: 'Undying Rage',
      tiers: [
        {
          description: '+25% damage, +3 kill heal, kills grant +5% AS (5 stacks)',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.25; mods.killHealAmount += 3; mods.rageAttackSpeedPerKill += 0.05; mods.rageMaxStacks = 5; },
        },
        {
          description: '+40% damage, +5 kill heal, +5% lifesteal, kills grant +8% AS (5 stacks)',
          apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.40; mods.killHealAmount += 5; mods.lifeStealPercent += 0.05; mods.rageAttackSpeedPerKill += 0.08; mods.rageMaxStacks = 5; },
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
    skills: [JobSkillId.MULTI_SHOT, JobSkillId.RAIN_OF_ARROWS, JobSkillId.BARRAGE],
    masterySkills: [MasterySkillId.SIDEWINDER, MasterySkillId.EMPYREAL_ARROW],
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
    skills: [JobSkillId.WAR_SONG, JobSkillId.SWIFT_SONG, JobSkillId.CRESCENDO],
    masterySkills: [MasterySkillId.REQUIEM, MasterySkillId.FINALE],
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
    masterySkills: [MasterySkillId.FLARE, MasterySkillId.FREEZE],
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
    masterySkills: [MasterySkillId.BENEDICTION, MasterySkillId.ASYLUM],
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
    masterySkills: [MasterySkillId.PHOENIX, MasterySkillId.DREADWYRM],
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
    masterySkills: [MasterySkillId.TIME_STOP, MasterySkillId.COMET],
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
    masterySkills: [MasterySkillId.PHILOSOPHER_STONE, MasterySkillId.MEGA_POTION],
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
    masterySkills: [MasterySkillId.ERUPTION, MasterySkillId.LANDSLIDE],
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
    skills: [JobSkillId.BUSHIDO, JobSkillId.BLADE_STORM, JobSkillId.ZANTETSUKEN],
    masterySkills: [MasterySkillId.MIDARE_SETSUGEKKA, MasterySkillId.HISSATSU],
    passive: {
      name: 'Iaijutsu',
      tiers: [
        {
          description: '+15% crit chance, +100% crit damage bonus',
          apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.15; mods.critDamageBonus += 1.00; },
        },
        {
          description: '+25% crit chance, +150% crit damage bonus, +20% damage',
          apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.25; mods.critDamageBonus += 1.50; mods.damageMultiplier += 0.20; },
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
        params: { count: 2, damage: 10, hitInterval: 300, orbitRadius: 30 * SS },
      },
      {
        description: '3 holy shields orbit the player (14 dmg per hit)',
        params: { count: 3, damage: 14, hitInterval: 250, orbitRadius: 35 * SS },
      },
      {
        description: '4 holy shields orbit the player (18 dmg per hit)',
        params: { count: 4, damage: 18, hitInterval: 200, orbitRadius: 40 * SS },
      },
      {
        description: '5 holy shields orbit the player (23 dmg per hit)',
        params: { count: 5, damage: 23, hitInterval: 160, orbitRadius: 45 * SS },
      },
      {
        description: '6 holy shields orbit the player (29 dmg per hit)',
        params: { count: 6, damage: 29, hitInterval: 130, orbitRadius: 50 * SS },
      },
      {
        description: '7 holy shields orbit the player (36 dmg per hit)',
        params: { count: 7, damage: 36, hitInterval: 100, orbitRadius: 55 * SS },
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
      {
        description: '-12% damage taken below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageReduction += 0.12; },
      },
      {
        description: '-14% damage taken below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageReduction += 0.14; },
      },
      {
        description: '-16% damage taken below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageReduction += 0.16; },
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
        params: { radius: 30 * SS, damage: 3, cooldown: 1000 },
      },
      {
        description: 'Holy aura 40px dealing 5 dmg/s',
        params: { radius: 40 * SS, damage: 5, cooldown: 1000 },
      },
      {
        description: 'Holy aura 50px dealing 8 dmg/s',
        params: { radius: 50 * SS, damage: 8, cooldown: 1000 },
      },
      {
        description: 'Holy aura 60px dealing 12 dmg/s',
        params: { radius: 60 * SS, damage: 12, cooldown: 1000 },
      },
      {
        description: 'Holy aura 70px dealing 17 dmg/s',
        params: { radius: 70 * SS, damage: 17, cooldown: 1000 },
      },
      {
        description: 'Holy aura 80px dealing 23 dmg/s',
        params: { radius: 80 * SS, damage: 23, cooldown: 1000 },
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
      {
        description: '4% life steal on damage dealt',
        apply: (mods: PlayerStatModifiers) => { mods.lifeStealPercent += 0.04; },
      },
      {
        description: '5% life steal on damage dealt',
        apply: (mods: PlayerStatModifiers) => { mods.lifeStealPercent += 0.05; },
      },
      {
        description: '6% life steal on damage dealt',
        apply: (mods: PlayerStatModifiers) => { mods.lifeStealPercent += 0.06; },
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
      {
        description: '+25% damage below 30% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageBonus += 0.25; },
      },
      {
        description: '+30% damage below 30% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageBonus += 0.30; },
      },
      {
        description: '+35% damage below 30% HP',
        apply: (mods: PlayerStatModifiers) => { mods.lowHpDamageBonus += 0.35; },
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
        params: { radius: 40 * SS, damage: 10, hpCost: 3 },
      },
      {
        description: 'On-hit dark AoE 50px dealing 18 dmg (costs 3 HP)',
        params: { radius: 50 * SS, damage: 18, hpCost: 3 },
      },
      {
        description: 'On-hit dark AoE 60px dealing 28 dmg (costs 3 HP)',
        params: { radius: 60 * SS, damage: 28, hpCost: 3 },
      },
      {
        description: 'On-hit dark AoE 70px dealing 40 dmg (costs 3 HP)',
        params: { radius: 70 * SS, damage: 40, hpCost: 3 },
      },
      {
        description: 'On-hit dark AoE 80px dealing 54 dmg (costs 3 HP)',
        params: { radius: 80 * SS, damage: 54, hpCost: 3 },
      },
      {
        description: 'On-hit dark AoE 90px dealing 70 dmg (costs 3 HP)',
        params: { radius: 90 * SS, damage: 70, hpCost: 3 },
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
        params: { radius: 40 * SS, damage: 15, cooldown: 8000 },
      },
      {
        description: 'Invulnerable leap, AoE 50px dealing 25 dmg (6s CD)',
        params: { radius: 50 * SS, damage: 25, cooldown: 6000 },
      },
      {
        description: 'Invulnerable leap, AoE 60px dealing 40 dmg (4s CD)',
        params: { radius: 60 * SS, damage: 40, cooldown: 4000 },
      },
      {
        description: 'Invulnerable leap, AoE 70px dealing 55 dmg (3.5s CD)',
        params: { radius: 70 * SS, damage: 55, cooldown: 3500 },
      },
      {
        description: 'Invulnerable leap, AoE 80px dealing 70 dmg (3s CD)',
        params: { radius: 80 * SS, damage: 70, cooldown: 3000 },
      },
      {
        description: 'Invulnerable leap, AoE 90px dealing 90 dmg (2.5s CD)',
        params: { radius: 90 * SS, damage: 90, cooldown: 2500 },
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
        description: '+1 pierce on ALL projectile weapons',
        apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 1; },
      },
      {
        description: '+1 pierce on ALL projectile weapons',
        apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 1; },
      },
      {
        description: '+1 pierce on ALL projectile weapons',
        apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 1; },
      },
      {
        description: '+2 pierce on ALL projectile weapons',
        apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 2; },
      },
      {
        description: '+2 pierce on ALL projectile weapons',
        apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 2; },
      },
      {
        description: '+3 pierce on ALL projectile weapons',
        apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 3; },
      },
    ],
  },
  [JobSkillId.DRAGON_DIVE]: {
    id: JobSkillId.DRAGON_DIVE,
    jobId: JobId.DRAGOON,
    name: 'Dragon Dive',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Dive on zone 70px, 20 dmg + flames 2s (10s CD)',
        params: { radius: 70 * SS, damage: 20, flameDamage: 4, flameDuration: 2000, cooldown: 10000 },
      },
      {
        description: 'Dive on zone 90px, 35 dmg + flames 2.5s (8s CD)',
        params: { radius: 90 * SS, damage: 35, flameDamage: 6, flameDuration: 2500, cooldown: 8000 },
      },
      {
        description: 'Dive on zone 110px, 50 dmg + flames 3s (6s CD)',
        params: { radius: 110 * SS, damage: 50, flameDamage: 9, flameDuration: 3000, cooldown: 6000 },
      },
      {
        description: 'Dive on zone 130px, 65 dmg + flames 3.5s (5s CD)',
        params: { radius: 130 * SS, damage: 65, flameDamage: 12, flameDuration: 3500, cooldown: 5000 },
      },
      {
        description: 'Dive on zone 150px, 80 dmg + flames 4s (4s CD)',
        params: { radius: 150 * SS, damage: 80, flameDamage: 16, flameDuration: 4000, cooldown: 4000 },
      },
      {
        description: 'Dive on zone 170px, 100 dmg + flames 4.5s (3s CD)',
        params: { radius: 170 * SS, damage: 100, flameDamage: 20, flameDuration: 4500, cooldown: 3000 },
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
    family: SkillFamily.MELEE,
    levels: [
      {
        description: '+1 dash charge, +10% speed',
        apply: (mods: PlayerStatModifiers) => { mods.bonusDashCharges += 1; mods.speedMultiplier += 0.10; },
      },
      {
        description: '+1 dash charge, +10% speed',
        apply: (mods: PlayerStatModifiers) => { mods.bonusDashCharges += 1; mods.speedMultiplier += 0.10; },
      },
      {
        description: '+1 dash charge, +15% dodge',
        apply: (mods: PlayerStatModifiers) => { mods.bonusDashCharges += 1; mods.dodgeChance += 0.15; },
      },
      {
        description: '+1 dash charge, +10% dodge, +10% speed',
        apply: (mods: PlayerStatModifiers) => { mods.bonusDashCharges += 1; mods.dodgeChance += 0.10; mods.speedMultiplier += 0.10; },
      },
      {
        description: '+1 dash charge, +12% dodge, +12% speed',
        apply: (mods: PlayerStatModifiers) => { mods.bonusDashCharges += 1; mods.dodgeChance += 0.12; mods.speedMultiplier += 0.12; },
      },
      {
        description: '+2 dash charges, +15% dodge, +15% speed',
        apply: (mods: PlayerStatModifiers) => { mods.bonusDashCharges += 2; mods.dodgeChance += 0.15; mods.speedMultiplier += 0.15; },
      },
    ],
  },
  [JobSkillId.DUAL_STRIKE]: {
    id: JobSkillId.DUAL_STRIKE,
    jobId: JobId.NINJA,
    name: 'Dual Strike',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Double slash 40px dealing 2x8 dmg (4s CD)',
        params: { radius: 40 * SS, damage: 8, hitCount: 2, cooldown: 4000 },
      },
      {
        description: 'Double slash 50px dealing 2x14 dmg (3s CD)',
        params: { radius: 50 * SS, damage: 14, hitCount: 2, cooldown: 3000 },
      },
      {
        description: 'Triple slash 60px dealing 3x18 dmg (2.5s CD)',
        params: { radius: 60 * SS, damage: 18, hitCount: 3, cooldown: 2500 },
      },
      {
        description: 'Triple slash 70px dealing 3x24 dmg (2s CD)',
        params: { radius: 70 * SS, damage: 24, hitCount: 3, cooldown: 2000 },
      },
      {
        description: 'Quad slash 80px dealing 4x30 dmg (2s CD)',
        params: { radius: 80 * SS, damage: 30, hitCount: 4, cooldown: 2000 },
      },
      {
        description: 'Penta slash 90px dealing 5x38 dmg (2s CD)',
        params: { radius: 90 * SS, damage: 38, hitCount: 5, cooldown: 2000 },
      },
    ],
  },
  [JobSkillId.SMOKE_BOMB]: {
    id: JobSkillId.SMOKE_BOMB,
    jobId: JobId.NINJA,
    name: 'Smoke Bomb',
    type: 'active',
    family: SkillFamily.SUPPORT,
    levels: [
      {
        description: 'Smoke cloud: invulnerable 1.5s + blind enemies 50px (10s CD)',
        params: { radius: 50 * SS, invulnDuration: 1500, blindDuration: 2000, cooldown: 10000 },
      },
      {
        description: 'Smoke cloud: invulnerable 2s + blind enemies 65px (8s CD)',
        params: { radius: 65 * SS, invulnDuration: 2000, blindDuration: 2500, cooldown: 8000 },
      },
      {
        description: 'Smoke cloud: invulnerable 2.5s + blind enemies 80px (6s CD)',
        params: { radius: 80 * SS, invulnDuration: 2500, blindDuration: 3000, cooldown: 6000 },
      },
      {
        description: 'Smoke cloud: invulnerable 3s + blind enemies 95px (5s CD)',
        params: { radius: 95 * SS, invulnDuration: 3000, blindDuration: 3500, cooldown: 5000 },
      },
      {
        description: 'Smoke cloud: invulnerable 3.5s + blind enemies 110px (4s CD)',
        params: { radius: 110 * SS, invulnDuration: 3500, blindDuration: 4000, cooldown: 4000 },
      },
      {
        description: 'Smoke cloud: invulnerable 4s + blind enemies 125px (3s CD)',
        params: { radius: 125 * SS, invulnDuration: 4000, blindDuration: 4500, cooldown: 3000 },
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
      {
        description: '+30 max HP',
        apply: (mods: PlayerStatModifiers) => { mods.maxHpBonus += 30; },
      },
      {
        description: '+35 max HP',
        apply: (mods: PlayerStatModifiers) => { mods.maxHpBonus += 35; },
      },
      {
        description: '+40 max HP',
        apply: (mods: PlayerStatModifiers) => { mods.maxHpBonus += 40; },
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
        params: { radius: 50 * SS, damage: 8, cooldown: 5000 },
      },
      {
        description: 'Energy wave 60px dealing 15 dmg (4s CD)',
        params: { radius: 60 * SS, damage: 15, cooldown: 4000 },
      },
      {
        description: 'Energy wave 75px dealing 25 dmg (3s CD)',
        params: { radius: 75 * SS, damage: 25, cooldown: 3000 },
      },
      {
        description: 'Energy wave 90px dealing 37 dmg (2.5s CD)',
        params: { radius: 90 * SS, damage: 37, cooldown: 2500 },
      },
      {
        description: 'Energy wave 105px dealing 50 dmg (2s CD)',
        params: { radius: 105 * SS, damage: 50, cooldown: 2000 },
      },
      {
        description: 'Energy wave 120px dealing 66 dmg (2s CD)',
        params: { radius: 120 * SS, damage: 66, cooldown: 2000 },
      },
    ],
  },
  [JobSkillId.HADOUKEN]: {
    id: JobSkillId.HADOUKEN,
    jobId: JobId.MONK,
    name: 'Hadouken',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Energy ball piercing through enemies (6s CD)',
        params: { damage: 18, speed: 200 * SS, cooldown: 6000 },
      },
      {
        description: 'Larger energy ball piercing through enemies (5s CD)',
        params: { damage: 28, speed: 220 * SS, cooldown: 5000 },
      },
      {
        description: 'Massive energy ball piercing through enemies (4s CD)',
        params: { damage: 40, speed: 240 * SS, cooldown: 4000 },
      },
      {
        description: 'Devastating energy ball piercing through enemies (3s CD)',
        params: { damage: 54, speed: 260 * SS, cooldown: 3000 },
      },
      {
        description: 'Cataclysmic energy ball piercing through enemies (2.5s CD)',
        params: { damage: 70, speed: 280 * SS, cooldown: 2500 },
      },
      {
        description: 'Ultimate energy ball piercing through enemies (2s CD)',
        params: { damage: 90, speed: 300 * SS, cooldown: 2000 },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BERSERKER
  // ═══════════════════════════════════════════════════════════════════════════
  [JobSkillId.WAR_CRY]: {
    id: JobSkillId.WAR_CRY,
    jobId: JobId.BERSERKER,
    name: 'War Cry',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'AoE stun 0.8s + 20% dmg buff 5s (10s CD)',
        params: { radius: 80 * SS, stunDuration: 800, buffDuration: 5000, buffDamage: 0.20, cooldown: 10000 },
      },
      {
        description: 'AoE stun 1.2s + 25% dmg buff 6s (8s CD)',
        params: { radius: 100 * SS, stunDuration: 1200, buffDuration: 6000, buffDamage: 0.25, cooldown: 8000 },
      },
      {
        description: 'AoE stun 1.5s + 30% dmg buff 7s (6s CD)',
        params: { radius: 120 * SS, stunDuration: 1500, buffDuration: 7000, buffDamage: 0.30, cooldown: 6000 },
      },
      {
        description: 'AoE stun 1.8s + 35% dmg buff 8s (5s CD)',
        params: { radius: 140 * SS, stunDuration: 1800, buffDuration: 8000, buffDamage: 0.35, cooldown: 5000 },
      },
      {
        description: 'AoE stun 2.1s + 40% dmg buff 9s (4s CD)',
        params: { radius: 160 * SS, stunDuration: 2100, buffDuration: 9000, buffDamage: 0.40, cooldown: 4000 },
      },
      {
        description: 'AoE stun 2.5s + 50% dmg buff 10s (3s CD)',
        params: { radius: 180 * SS, stunDuration: 2500, buffDuration: 10000, buffDamage: 0.50, cooldown: 3000 },
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
      {
        description: '+18% attack speed below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.frenzyAttackSpeedBonus += 0.18; },
      },
      {
        description: '+22% attack speed below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.frenzyAttackSpeedBonus += 0.22; },
      },
      {
        description: '+28% attack speed below 50% HP',
        apply: (mods: PlayerStatModifiers) => { mods.frenzyAttackSpeedBonus += 0.28; },
      },
    ],
  },
  [JobSkillId.RAMPAGE]: {
    id: JobSkillId.RAMPAGE,
    jobId: JobId.BERSERKER,
    name: 'Rampage',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Charge dash dealing 20 dmg, invulnerable (8s CD)',
        params: { damage: 20, range: 120 * SS, cooldown: 8000 },
      },
      {
        description: 'Charge dash dealing 35 dmg, invulnerable (6s CD)',
        params: { damage: 35, range: 150 * SS, cooldown: 6000 },
      },
      {
        description: 'Charge dash dealing 50 dmg, invulnerable (5s CD)',
        params: { damage: 50, range: 180 * SS, cooldown: 5000 },
      },
      {
        description: 'Charge dash dealing 68 dmg, invulnerable (4s CD)',
        params: { damage: 68, range: 210 * SS, cooldown: 4000 },
      },
      {
        description: 'Charge dash dealing 88 dmg, invulnerable (3.5s CD)',
        params: { damage: 88, range: 240 * SS, cooldown: 3500 },
      },
      {
        description: 'Charge dash dealing 110 dmg, invulnerable (3s CD)',
        params: { damage: 110, range: 270 * SS, cooldown: 3000 },
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
      {
        description: '+2 bonus projectiles',
        apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 2; },
      },
      {
        description: '+2 bonus projectiles',
        apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 2; },
      },
      {
        description: '+3 bonus projectiles',
        apply: (mods: PlayerStatModifiers) => { mods.bonusProjectiles += 3; },
      },
    ],
  },
  [JobSkillId.RAIN_OF_ARROWS]: {
    id: JobSkillId.RAIN_OF_ARROWS,
    jobId: JobId.RANGER,
    name: 'Rain of Arrows',
    type: 'active',
    family: SkillFamily.PROJECTILE,
    levels: [
      {
        description: 'Arrow rain in area, 8 impacts (7s CD)',
        params: { count: 8, damage: 6, radius: 70 * SS, cooldown: 7000 },
      },
      {
        description: 'Arrow rain in area, 12 impacts (6s CD)',
        params: { count: 12, damage: 9, radius: 85 * SS, cooldown: 6000 },
      },
      {
        description: 'Arrow rain in area, 16 impacts (5s CD)',
        params: { count: 16, damage: 12, radius: 100 * SS, cooldown: 5000 },
      },
      {
        description: 'Arrow rain in area, 20 impacts (4s CD)',
        params: { count: 20, damage: 16, radius: 115 * SS, cooldown: 4000 },
      },
      {
        description: 'Arrow rain in area, 24 impacts (3s CD)',
        params: { count: 24, damage: 20, radius: 130 * SS, cooldown: 3000 },
      },
      {
        description: 'Arrow rain in area, 28 impacts (2.5s CD)',
        params: { count: 28, damage: 25, radius: 145 * SS, cooldown: 2500 },
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
      {
        description: 'Fire a cone of 16 arrows (3.5s CD)',
        params: { count: 16, cooldown: 3500 },
      },
      {
        description: 'Fire a cone of 20 arrows (3s CD)',
        params: { count: 20, cooldown: 3000 },
      },
      {
        description: 'Fire a cone of 25 arrows (2.5s CD)',
        params: { count: 25, cooldown: 2500 },
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
      {
        description: '+12% damage',
        apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.12; },
      },
      {
        description: '+14% damage',
        apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.14; },
      },
      {
        description: '+16% damage',
        apply: (mods: PlayerStatModifiers) => { mods.damageMultiplier += 0.16; },
      },
    ],
  },
  [JobSkillId.CRESCENDO]: {
    id: JobSkillId.CRESCENDO,
    jobId: JobId.BARD,
    name: 'Crescendo',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      {
        description: 'Giant note traversing screen, 15 dmg (8s CD)',
        params: { damage: 15, speed: 180 * SS, cooldown: 8000 },
      },
      {
        description: 'Giant note traversing screen, 25 dmg (6s CD)',
        params: { damage: 25, speed: 200 * SS, cooldown: 6000 },
      },
      {
        description: 'Giant note traversing screen, 38 dmg (5s CD)',
        params: { damage: 38, speed: 220 * SS, cooldown: 5000 },
      },
      {
        description: 'Giant note traversing screen, 52 dmg (4s CD)',
        params: { damage: 52, speed: 240 * SS, cooldown: 4000 },
      },
      {
        description: 'Giant note traversing screen, 68 dmg (3s CD)',
        params: { damage: 68, speed: 260 * SS, cooldown: 3000 },
      },
      {
        description: 'Giant note traversing screen, 88 dmg (2.5s CD)',
        params: { damage: 88, speed: 280 * SS, cooldown: 2500 },
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
        description: '+10% movement speed, -8% cooldowns',
        apply: (mods: PlayerStatModifiers) => { mods.speedMultiplier += 0.10; mods.cooldownMultiplier -= 0.08; },
      },
      {
        description: '+10% movement speed, -8% cooldowns',
        apply: (mods: PlayerStatModifiers) => { mods.speedMultiplier += 0.10; mods.cooldownMultiplier -= 0.08; },
      },
      {
        description: '+15% movement speed, -10% cooldowns',
        apply: (mods: PlayerStatModifiers) => { mods.speedMultiplier += 0.15; mods.cooldownMultiplier -= 0.10; },
      },
      {
        description: '+15% movement speed, -12% cooldowns',
        apply: (mods: PlayerStatModifiers) => { mods.speedMultiplier += 0.15; mods.cooldownMultiplier -= 0.12; },
      },
      {
        description: '+18% movement speed, -14% cooldowns',
        apply: (mods: PlayerStatModifiers) => { mods.speedMultiplier += 0.18; mods.cooldownMultiplier -= 0.14; },
      },
      {
        description: '+22% movement speed, -16% cooldowns',
        apply: (mods: PlayerStatModifiers) => { mods.speedMultiplier += 0.22; mods.cooldownMultiplier -= 0.16; },
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
      {
        description: '12% chance to inflict burn (3 dmg/s for 2s)',
        apply: (mods: PlayerStatModifiers) => { mods.burnChance += 0.12; },
      },
      {
        description: '14% chance to inflict burn (3 dmg/s for 2s)',
        apply: (mods: PlayerStatModifiers) => { mods.burnChance += 0.14; },
      },
      {
        description: '18% chance to inflict burn (3 dmg/s for 2s)',
        apply: (mods: PlayerStatModifiers) => { mods.burnChance += 0.18; },
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
      {
        description: '12% chance to slow enemies by 35% for 2.5s',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowChance += 0.12;
          mods.slowPercent = 0.35;
        },
      },
      {
        description: '14% chance to slow enemies by 40% for 3s',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowChance += 0.14;
          mods.slowPercent = 0.40;
        },
      },
      {
        description: '18% chance to slow enemies by 50% for 3.5s',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowChance += 0.18;
          mods.slowPercent = 0.50;
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
      {
        description: 'Critical chain lightning hitting 11 targets',
        params: { chainTargets: 11, cooldown: 0 },
      },
      {
        description: 'Critical chain lightning hitting 15 targets',
        params: { chainTargets: 15, cooldown: 0 },
      },
      {
        description: 'Critical chain lightning hitting 20 targets',
        params: { chainTargets: 20, cooldown: 0 },
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
      {
        description: '+2.5 HP/s regeneration',
        apply: (mods: PlayerStatModifiers) => { mods.regenPerSecond += 2.5; },
      },
      {
        description: '+3 HP/s regeneration',
        apply: (mods: PlayerStatModifiers) => { mods.regenPerSecond += 3; },
      },
      {
        description: '+4 HP/s regeneration',
        apply: (mods: PlayerStatModifiers) => { mods.regenPerSecond += 4; },
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
      {
        description: '+4 armor',
        apply: (mods: PlayerStatModifiers) => { mods.armor += 4; },
      },
      {
        description: '+5 armor',
        apply: (mods: PlayerStatModifiers) => { mods.armor += 5; },
      },
      {
        description: '+6 armor',
        apply: (mods: PlayerStatModifiers) => { mods.armor += 6; },
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
        params: { radius: 50 * SS, stunDuration: 500, cooldown: 8000 },
      },
      {
        description: 'Holy burst 65px stunning enemies for 0.8s (6s CD)',
        params: { radius: 65 * SS, stunDuration: 800, cooldown: 6000 },
      },
      {
        description: 'Holy burst 80px stunning enemies for 1s (4s CD)',
        params: { radius: 80 * SS, stunDuration: 1000, cooldown: 4000 },
      },
      {
        description: 'Holy burst 95px stunning enemies for 1.2s (3s CD)',
        params: { radius: 95 * SS, stunDuration: 1200, cooldown: 3000 },
      },
      {
        description: 'Holy burst 110px stunning enemies for 1.5s (2.5s CD)',
        params: { radius: 110 * SS, stunDuration: 1500, cooldown: 2500 },
      },
      {
        description: 'Holy burst 125px stunning enemies for 1.8s (2s CD)',
        params: { radius: 125 * SS, stunDuration: 1800, cooldown: 2000 },
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
      {
        description: 'Fire familiar orbiting, 28 dmg per hit (0.7s interval)',
        params: { damage: 28, attackInterval: 700 },
      },
      {
        description: 'Fire familiar orbiting, 40 dmg per hit (0.55s interval)',
        params: { damage: 40, attackInterval: 550 },
      },
      {
        description: 'Fire familiar orbiting, 55 dmg per hit (0.4s interval)',
        params: { damage: 55, attackInterval: 400 },
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
      {
        description: 'Ice familiar orbiting, 55% slow + 15% freeze chance',
        params: { slowPercent: 0.55, freezeChance: 0.15, attackInterval: 1500 },
      },
      {
        description: 'Ice familiar orbiting, 60% slow + 20% freeze chance',
        params: { slowPercent: 0.60, freezeChance: 0.20, attackInterval: 1500 },
      },
      {
        description: 'Ice familiar orbiting, 70% slow + 30% freeze chance',
        params: { slowPercent: 0.70, freezeChance: 0.30, attackInterval: 1500 },
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
        params: { radius: 80 * SS, damage: 20, cooldown: 12000 },
      },
      {
        description: 'Mega Flare AoE 100px dealing 35 dmg (9s CD)',
        params: { radius: 100 * SS, damage: 35, cooldown: 9000 },
      },
      {
        description: 'Mega Flare AoE 120px dealing 55 dmg (6s CD)',
        params: { radius: 120 * SS, damage: 55, cooldown: 6000 },
      },
      {
        description: 'Mega Flare AoE 140px dealing 78 dmg (5s CD)',
        params: { radius: 140 * SS, damage: 78, cooldown: 5000 },
      },
      {
        description: 'Mega Flare AoE 160px dealing 105 dmg (4s CD)',
        params: { radius: 160 * SS, damage: 105, cooldown: 4000 },
      },
      {
        description: 'Mega Flare AoE 180px dealing 138 dmg (3s CD)',
        params: { radius: 180 * SS, damage: 138, cooldown: 3000 },
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
      {
        description: '-12% cooldowns on all abilities',
        apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.12; },
      },
      {
        description: '-14% cooldowns on all abilities',
        apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.14; },
      },
      {
        description: '-16% cooldowns on all abilities',
        apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.16; },
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
          mods.slowFieldRadius = 60 * SS;
          mods.slowFieldPercent = 0.20;
        },
      },
      {
        description: 'Aura slowing enemies by 30% in 75px',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowFieldRadius = 75 * SS;
          mods.slowFieldPercent = 0.30;
        },
      },
      {
        description: 'Aura slowing enemies by 40% in 90px',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowFieldRadius = 90 * SS;
          mods.slowFieldPercent = 0.40;
        },
      },
      {
        description: 'Aura slowing enemies by 48% in 105px',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowFieldRadius = 105 * SS;
          mods.slowFieldPercent = 0.48;
        },
      },
      {
        description: 'Aura slowing enemies by 55% in 120px',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowFieldRadius = 120 * SS;
          mods.slowFieldPercent = 0.55;
        },
      },
      {
        description: 'Aura slowing enemies by 62% in 135px',
        apply: (mods: PlayerStatModifiers) => {
          mods.slowFieldRadius = 135 * SS;
          mods.slowFieldPercent = 0.62;
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
        params: { radius: 60 * SS, damage: 18, cooldown: 10000 },
      },
      {
        description: 'Meteor strike 75px dealing 30 dmg (7s CD)',
        params: { radius: 75 * SS, damage: 30, cooldown: 7000 },
      },
      {
        description: 'Meteor strike 90px dealing 45 dmg (5s CD)',
        params: { radius: 90 * SS, damage: 45, cooldown: 5000 },
      },
      {
        description: 'Meteor strike 105px dealing 63 dmg (4s CD)',
        params: { radius: 105 * SS, damage: 63, cooldown: 4000 },
      },
      {
        description: 'Meteor strike 120px dealing 84 dmg (3s CD)',
        params: { radius: 120 * SS, damage: 84, cooldown: 3000 },
      },
      {
        description: 'Meteor strike 135px dealing 110 dmg (2.5s CD)',
        params: { radius: 135 * SS, damage: 110, cooldown: 2500 },
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
      {
        description: '+60% health drop effectiveness',
        apply: (mods: PlayerStatModifiers) => { mods.healthDropMultiplier += 0.60; },
      },
      {
        description: '+75% health drop effectiveness',
        apply: (mods: PlayerStatModifiers) => { mods.healthDropMultiplier += 0.75; },
      },
      {
        description: '+100% health drop effectiveness',
        apply: (mods: PlayerStatModifiers) => { mods.healthDropMultiplier += 1.00; },
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
      {
        description: '+25% XP gained',
        apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.25; },
      },
      {
        description: '+30% XP gained',
        apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.30; },
      },
      {
        description: '+40% XP gained',
        apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.40; },
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
      {
        description: 'Auto-heal 100% max HP (22s CD)',
        params: { healPercent: 1.00, cooldown: 22000 },
      },
      {
        description: 'Auto-heal 100% max HP (16s CD)',
        params: { healPercent: 1.00, cooldown: 16000 },
      },
      {
        description: 'Auto-heal 100% max HP (10s CD)',
        params: { healPercent: 1.00, cooldown: 10000 },
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
      {
        description: 'Leave damage trail dealing 11 dmg/s for 5s',
        params: { damage: 11, duration: 5000, cooldown: 400 },
      },
      {
        description: 'Leave damage trail dealing 16 dmg/s for 6s',
        params: { damage: 16, duration: 6000, cooldown: 300 },
      },
      {
        description: 'Leave damage trail dealing 22 dmg/s for 7s',
        params: { damage: 22, duration: 7000, cooldown: 250 },
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
        params: { radius: 70 * SS, cooldown: 8000 },
      },
      {
        description: 'Repel enemies in 90px radius (6s CD)',
        params: { radius: 90 * SS, cooldown: 6000 },
      },
      {
        description: 'Repel enemies in 110px radius (4s CD)',
        params: { radius: 110 * SS, cooldown: 4000 },
      },
      {
        description: 'Repel enemies in 130px radius (3s CD)',
        params: { radius: 130 * SS, cooldown: 3000 },
      },
      {
        description: 'Repel enemies in 150px radius (2.5s CD)',
        params: { radius: 150 * SS, cooldown: 2500 },
      },
      {
        description: 'Repel enemies in 170px radius (2s CD)',
        params: { radius: 170 * SS, cooldown: 2000 },
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
        params: { radius: 55 * SS, stunDuration: 500, cooldown: 10000 },
      },
      {
        description: 'Ground slam 70px stunning for 0.8s (7s CD)',
        params: { radius: 70 * SS, stunDuration: 800, cooldown: 7000 },
      },
      {
        description: 'Ground slam 85px stunning for 1.2s (5s CD)',
        params: { radius: 85 * SS, stunDuration: 1200, cooldown: 5000 },
      },
      {
        description: 'Ground slam 100px stunning for 1.5s (4s CD)',
        params: { radius: 100 * SS, stunDuration: 1500, cooldown: 4000 },
      },
      {
        description: 'Ground slam 115px stunning for 1.8s (3s CD)',
        params: { radius: 115 * SS, stunDuration: 1800, cooldown: 3000 },
      },
      {
        description: 'Ground slam 130px stunning for 2.2s (2.5s CD)',
        params: { radius: 130 * SS, stunDuration: 2200, cooldown: 2500 },
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
      {
        description: '+15% critical hit chance',
        apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.15; },
      },
      {
        description: '+18% critical hit chance',
        apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.18; },
      },
      {
        description: '+22% critical hit chance',
        apply: (mods: PlayerStatModifiers) => { mods.critChance += 0.22; },
      },
    ],
  },
  [JobSkillId.BLADE_STORM]: {
    id: JobSkillId.BLADE_STORM,
    jobId: JobId.SAMURAI,
    name: 'Blade Storm',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      {
        description: 'Rotary slashes 50px dealing 12 dmg (7s CD)',
        params: { radius: 50 * SS, damage: 12, slashCount: 4, duration: 1500, cooldown: 7000 },
      },
      {
        description: 'Rotary slashes 65px dealing 20 dmg (6s CD)',
        params: { radius: 65 * SS, damage: 20, slashCount: 6, duration: 2000, cooldown: 6000 },
      },
      {
        description: 'Rotary slashes 80px dealing 30 dmg (5s CD)',
        params: { radius: 80 * SS, damage: 30, slashCount: 8, duration: 2500, cooldown: 5000 },
      },
      {
        description: 'Rotary slashes 95px dealing 42 dmg (4s CD)',
        params: { radius: 95 * SS, damage: 42, slashCount: 10, duration: 3000, cooldown: 4000 },
      },
      {
        description: 'Rotary slashes 110px dealing 56 dmg (3s CD)',
        params: { radius: 110 * SS, damage: 56, slashCount: 12, duration: 3500, cooldown: 3000 },
      },
      {
        description: 'Rotary slashes 125px dealing 72 dmg (2.5s CD)',
        params: { radius: 125 * SS, damage: 72, slashCount: 14, duration: 4000, cooldown: 2500 },
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
        params: { range: 120 * SS, damage: 20, cooldown: 10000 },
      },
      {
        description: 'Line slash 150px dealing 35 dmg (7s CD)',
        params: { range: 150 * SS, damage: 35, cooldown: 7000 },
      },
      {
        description: 'Line slash 180px dealing 55 dmg (5s CD)',
        params: { range: 180 * SS, damage: 55, cooldown: 5000 },
      },
      {
        description: 'Line slash 210px dealing 78 dmg (4s CD)',
        params: { range: 210 * SS, damage: 78, cooldown: 4000 },
      },
      {
        description: 'Line slash 240px dealing 105 dmg (3s CD)',
        params: { range: 240 * SS, damage: 105, cooldown: 3000 },
      },
      {
        description: 'Line slash 270px dealing 138 dmg (2.5s CD)',
        params: { range: 270 * SS, damage: 138, cooldown: 2500 },
      },
    ],
  },
};

// ─── Mastery Skill Definitions (unlocked post-awakening) ────────────────────

export const MASTERY_SKILL_DEFS: Record<MasterySkillId, JobSkillDef> = {
  // ═══ PALADIN ═══
  [MasterySkillId.HALLOWED_GROUND]: {
    id: MasterySkillId.HALLOWED_GROUND,
    jobId: JobId.PALADIN,
    name: 'Hallowed Ground',
    type: 'active',
    family: SkillFamily.SUPPORT,
    levels: [
      { description: 'Holy zone 60px: become invulnerable 2s (20s CD)', params: { radius: 60 * SS, duration: 2000, cooldown: 20000 } },
      { description: 'Holy zone 75px: become invulnerable 3s (16s CD)', params: { radius: 75 * SS, duration: 3000, cooldown: 16000 } },
      { description: 'Holy zone 90px: become invulnerable 4s (12s CD)', params: { radius: 90 * SS, duration: 4000, cooldown: 12000 } },
      { description: 'Holy zone 105px: become invulnerable 5s (9s CD)', params: { radius: 105 * SS, duration: 5000, cooldown: 9000 } },
      { description: 'Holy zone 120px: become invulnerable 6s (7s CD)', params: { radius: 120 * SS, duration: 6000, cooldown: 7000 } },
      { description: 'Holy zone 135px: become invulnerable 7s (5s CD)', params: { radius: 135 * SS, duration: 7000, cooldown: 5000 } },
    ],
  },
  [MasterySkillId.CLEMENCY]: {
    id: MasterySkillId.CLEMENCY,
    jobId: JobId.PALADIN,
    name: 'Clemency',
    type: 'active',
    family: SkillFamily.SUPPORT,
    levels: [
      { description: 'Heal 20% max HP instantly (15s CD)', params: { healPercent: 0.20, cooldown: 15000 } },
      { description: 'Heal 30% max HP instantly (12s CD)', params: { healPercent: 0.30, cooldown: 12000 } },
      { description: 'Heal 40% max HP instantly (10s CD)', params: { healPercent: 0.40, cooldown: 10000 } },
      { description: 'Heal 50% max HP instantly (8s CD)', params: { healPercent: 0.50, cooldown: 8000 } },
      { description: 'Heal 60% max HP instantly (6s CD)', params: { healPercent: 0.60, cooldown: 6000 } },
      { description: 'Heal 75% max HP instantly (4s CD)', params: { healPercent: 0.75, cooldown: 4000 } },
    ],
  },
  // ═══ DARK KNIGHT ═══
  [MasterySkillId.SOUL_EATER]: {
    id: MasterySkillId.SOUL_EATER,
    jobId: JobId.DARK_KNIGHT,
    name: 'Soul Eater',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      { description: 'Dark AoE 50px, drain 50% dmg as HP (8s CD)', params: { radius: 50 * SS, damage: 25, drainPercent: 0.50, cooldown: 8000 } },
      { description: 'Dark AoE 65px, drain 50% dmg as HP (6s CD)', params: { radius: 65 * SS, damage: 40, drainPercent: 0.50, cooldown: 6000 } },
      { description: 'Dark AoE 80px, drain 60% dmg as HP (5s CD)', params: { radius: 80 * SS, damage: 55, drainPercent: 0.60, cooldown: 5000 } },
      { description: 'Dark AoE 95px, drain 65% dmg as HP (4s CD)', params: { radius: 95 * SS, damage: 72, drainPercent: 0.65, cooldown: 4000 } },
      { description: 'Dark AoE 110px, drain 70% dmg as HP (3s CD)', params: { radius: 110 * SS, damage: 92, drainPercent: 0.70, cooldown: 3000 } },
      { description: 'Dark AoE 125px, drain 80% dmg as HP (2.5s CD)', params: { radius: 125 * SS, damage: 115, drainPercent: 0.80, cooldown: 2500 } },
    ],
  },
  [MasterySkillId.LIVING_DEAD]: {
    id: MasterySkillId.LIVING_DEAD,
    jobId: JobId.DARK_KNIGHT,
    name: 'Living Dead',
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      { description: 'Cheat death once per 60s (survive at 1 HP)', apply: (mods: PlayerStatModifiers) => { mods.deathSaveCooldown = 60000; } },
      { description: 'Cheat death once per 45s (survive at 1 HP)', apply: (mods: PlayerStatModifiers) => { mods.deathSaveCooldown = 45000; } },
      { description: 'Cheat death once per 30s (survive at 1 HP)', apply: (mods: PlayerStatModifiers) => { mods.deathSaveCooldown = 30000; } },
      { description: 'Cheat death once per 22s (survive at 1 HP)', apply: (mods: PlayerStatModifiers) => { mods.deathSaveCooldown = 22000; } },
      { description: 'Cheat death once per 16s (survive at 1 HP)', apply: (mods: PlayerStatModifiers) => { mods.deathSaveCooldown = 16000; } },
      { description: 'Cheat death once per 10s (survive at 1 HP)', apply: (mods: PlayerStatModifiers) => { mods.deathSaveCooldown = 10000; } },
    ],
  },
  // ═══ DRAGOON ═══
  [MasterySkillId.STARDIVER]: {
    id: MasterySkillId.STARDIVER,
    jobId: JobId.DRAGOON,
    name: 'Stardiver',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      { description: 'Mega jump AoE 80px, 40 dmg + stun 1s (12s CD)', params: { radius: 80 * SS, damage: 40, stunDuration: 1000, cooldown: 12000 } },
      { description: 'Mega jump AoE 100px, 60 dmg + stun 1.5s (10s CD)', params: { radius: 100 * SS, damage: 60, stunDuration: 1500, cooldown: 10000 } },
      { description: 'Mega jump AoE 120px, 85 dmg + stun 2s (8s CD)', params: { radius: 120 * SS, damage: 85, stunDuration: 2000, cooldown: 8000 } },
      { description: 'Mega jump AoE 140px, 115 dmg + stun 2.5s (6s CD)', params: { radius: 140 * SS, damage: 115, stunDuration: 2500, cooldown: 6000 } },
      { description: 'Mega jump AoE 160px, 150 dmg + stun 3s (5s CD)', params: { radius: 160 * SS, damage: 150, stunDuration: 3000, cooldown: 5000 } },
      { description: 'Mega jump AoE 180px, 190 dmg + stun 3.5s (4s CD)', params: { radius: 180 * SS, damage: 190, stunDuration: 3500, cooldown: 4000 } },
    ],
  },
  [MasterySkillId.NASTROND]: {
    id: MasterySkillId.NASTROND,
    jobId: JobId.DRAGOON,
    name: 'Nastrond',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      { description: 'Dragon breath cone 15 dmg/s for 2s (10s CD)', params: { damage: 15, duration: 2000, cooldown: 10000 } },
      { description: 'Dragon breath cone 25 dmg/s for 2.5s (8s CD)', params: { damage: 25, duration: 2500, cooldown: 8000 } },
      { description: 'Dragon breath cone 35 dmg/s for 3s (6s CD)', params: { damage: 35, duration: 3000, cooldown: 6000 } },
      { description: 'Dragon breath cone 47 dmg/s for 3.5s (5s CD)', params: { damage: 47, duration: 3500, cooldown: 5000 } },
      { description: 'Dragon breath cone 60 dmg/s for 4s (4s CD)', params: { damage: 60, duration: 4000, cooldown: 4000 } },
      { description: 'Dragon breath cone 75 dmg/s for 4.5s (3s CD)', params: { damage: 75, duration: 4500, cooldown: 3000 } },
    ],
  },
  // ═══ NINJA (moved from regular) ═══
  [MasterySkillId.KATON]: {
    id: MasterySkillId.KATON,
    jobId: JobId.NINJA,
    name: 'Katon',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      { description: 'Fireball exploding for 12 dmg + burn in 60px (5s CD)', params: { radius: 60 * SS, damage: 12, burnDamage: 3, burnDuration: 2000, cooldown: 5000 } },
      { description: 'Fireball exploding for 20 dmg + burn in 75px (4s CD)', params: { radius: 75 * SS, damage: 20, burnDamage: 5, burnDuration: 2500, cooldown: 4000 } },
      { description: 'Fireball exploding for 30 dmg + burn in 90px (3s CD)', params: { radius: 90 * SS, damage: 30, burnDamage: 7, burnDuration: 3000, cooldown: 3000 } },
      { description: 'Fireball exploding for 42 dmg + burn in 105px (2.5s CD)', params: { radius: 105 * SS, damage: 42, burnDamage: 10, burnDuration: 3500, cooldown: 2500 } },
      { description: 'Fireball exploding for 56 dmg + burn in 120px (2s CD)', params: { radius: 120 * SS, damage: 56, burnDamage: 13, burnDuration: 4000, cooldown: 2000 } },
      { description: 'Fireball exploding for 72 dmg + burn in 135px (2s CD)', params: { radius: 135 * SS, damage: 72, burnDamage: 17, burnDuration: 4500, cooldown: 2000 } },
    ],
  },
  [MasterySkillId.RAITON]: {
    id: MasterySkillId.RAITON,
    jobId: JobId.NINJA,
    name: 'Raiton',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      { description: 'Lightning strikes 3 random enemies for 15 dmg (6s CD)', params: { chainTargets: 3, damage: 15, chainRange: 80 * SS, cooldown: 6000 } },
      { description: 'Lightning strikes 5 random enemies for 22 dmg (5s CD)', params: { chainTargets: 5, damage: 22, chainRange: 100 * SS, cooldown: 5000 } },
      { description: 'Lightning strikes 8 random enemies for 30 dmg (4s CD)', params: { chainTargets: 8, damage: 30, chainRange: 120 * SS, cooldown: 4000 } },
      { description: 'Lightning strikes 10 random enemies for 40 dmg (3s CD)', params: { chainTargets: 10, damage: 40, chainRange: 140 * SS, cooldown: 3000 } },
      { description: 'Lightning strikes 13 random enemies for 52 dmg (2.5s CD)', params: { chainTargets: 13, damage: 52, chainRange: 160 * SS, cooldown: 2500 } },
      { description: 'Lightning strikes 16 random enemies for 66 dmg (2s CD)', params: { chainTargets: 16, damage: 66, chainRange: 180 * SS, cooldown: 2000 } },
    ],
  },
  [MasterySkillId.DOTON]: {
    id: MasterySkillId.DOTON,
    jobId: JobId.NINJA,
    name: 'Doton',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      { description: 'Earth zone 50px slowing + 4 dmg/s for 3s (8s CD)', params: { radius: 50 * SS, damage: 4, slowPercent: 0.30, duration: 3000, cooldown: 8000 } },
      { description: 'Earth zone 65px slowing + 7 dmg/s for 3s (7s CD)', params: { radius: 65 * SS, damage: 7, slowPercent: 0.40, duration: 3000, cooldown: 7000 } },
      { description: 'Earth zone 80px slowing + 10 dmg/s for 4s (6s CD)', params: { radius: 80 * SS, damage: 10, slowPercent: 0.50, duration: 4000, cooldown: 6000 } },
      { description: 'Earth zone 95px slowing + 14 dmg/s for 4.5s (5s CD)', params: { radius: 95 * SS, damage: 14, slowPercent: 0.55, duration: 4500, cooldown: 5000 } },
      { description: 'Earth zone 110px slowing + 19 dmg/s for 5s (4s CD)', params: { radius: 110 * SS, damage: 19, slowPercent: 0.60, duration: 5000, cooldown: 4000 } },
      { description: 'Earth zone 125px slowing + 25 dmg/s for 5.5s (3s CD)', params: { radius: 125 * SS, damage: 25, slowPercent: 0.65, duration: 5500, cooldown: 3000 } },
    ],
  },
  // ═══ MONK ═══
  [MasterySkillId.FORBIDDEN_CHAKRA]: {
    id: MasterySkillId.FORBIDDEN_CHAKRA,
    jobId: JobId.MONK,
    name: 'Forbidden Chakra',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      { description: 'Mega punch single target 50 dmg (8s CD)', params: { damage: 50, cooldown: 8000 } },
      { description: 'Mega punch single target 80 dmg (6s CD)', params: { damage: 80, cooldown: 6000 } },
      { description: 'Mega punch single target 120 dmg (5s CD)', params: { damage: 120, cooldown: 5000 } },
      { description: 'Mega punch single target 165 dmg (4s CD)', params: { damage: 165, cooldown: 4000 } },
      { description: 'Mega punch single target 215 dmg (3s CD)', params: { damage: 215, cooldown: 3000 } },
      { description: 'Mega punch single target 275 dmg (2.5s CD)', params: { damage: 275, cooldown: 2500 } },
    ],
  },
  [MasterySkillId.PHANTOM_RUSH]: {
    id: MasterySkillId.PHANTOM_RUSH,
    jobId: JobId.MONK,
    name: 'Phantom Rush',
    type: 'modifier',
    family: SkillFamily.MELEE,
    levels: [
      { description: '+20% attack speed, +15% melee damage', apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.20; mods.meleeFamilyDamage += 0.15; } },
      { description: '+15% attack speed, +15% melee damage', apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.15; mods.meleeFamilyDamage += 0.15; } },
      { description: '+20% attack speed, +20% melee damage', apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.20; mods.meleeFamilyDamage += 0.20; } },
      { description: '+22% attack speed, +25% melee damage', apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.22; mods.meleeFamilyDamage += 0.25; } },
      { description: '+25% attack speed, +30% melee damage', apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.25; mods.meleeFamilyDamage += 0.30; } },
      { description: '+30% attack speed, +35% melee damage', apply: (mods: PlayerStatModifiers) => { mods.cooldownMultiplier -= 0.30; mods.meleeFamilyDamage += 0.35; } },
    ],
  },
  // ═══ BERSERKER ═══
  [MasterySkillId.INNER_BEAST]: {
    id: MasterySkillId.INNER_BEAST,
    jobId: JobId.BERSERKER,
    name: 'Inner Beast',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      { description: 'AoE 60px, 30 dmg + heal 15% of dmg dealt (10s CD)', params: { radius: 60 * SS, damage: 30, healPercent: 0.15, cooldown: 10000 } },
      { description: 'AoE 75px, 50 dmg + heal 20% of dmg dealt (8s CD)', params: { radius: 75 * SS, damage: 50, healPercent: 0.20, cooldown: 8000 } },
      { description: 'AoE 90px, 70 dmg + heal 25% of dmg dealt (6s CD)', params: { radius: 90 * SS, damage: 70, healPercent: 0.25, cooldown: 6000 } },
      { description: 'AoE 105px, 95 dmg + heal 30% of dmg dealt (5s CD)', params: { radius: 105 * SS, damage: 95, healPercent: 0.30, cooldown: 5000 } },
      { description: 'AoE 120px, 125 dmg + heal 35% of dmg dealt (4s CD)', params: { radius: 120 * SS, damage: 125, healPercent: 0.35, cooldown: 4000 } },
      { description: 'AoE 135px, 160 dmg + heal 40% of dmg dealt (3s CD)', params: { radius: 135 * SS, damage: 160, healPercent: 0.40, cooldown: 3000 } },
    ],
  },
  [MasterySkillId.FELL_CLEAVE]: {
    id: MasterySkillId.FELL_CLEAVE,
    jobId: JobId.BERSERKER,
    name: 'Fell Cleave',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      { description: 'Massive cleave 70px dealing 45 dmg (8s CD)', params: { radius: 70 * SS, damage: 45, cooldown: 8000 } },
      { description: 'Massive cleave 85px dealing 65 dmg (6s CD)', params: { radius: 85 * SS, damage: 65, cooldown: 6000 } },
      { description: 'Massive cleave 100px dealing 90 dmg (5s CD)', params: { radius: 100 * SS, damage: 90, cooldown: 5000 } },
      { description: 'Massive cleave 115px dealing 120 dmg (4s CD)', params: { radius: 115 * SS, damage: 120, cooldown: 4000 } },
      { description: 'Massive cleave 130px dealing 155 dmg (3s CD)', params: { radius: 130 * SS, damage: 155, cooldown: 3000 } },
      { description: 'Massive cleave 145px dealing 195 dmg (2.5s CD)', params: { radius: 145 * SS, damage: 195, cooldown: 2500 } },
    ],
  },
  // ═══ RANGER ═══
  [MasterySkillId.SIDEWINDER]: {
    id: MasterySkillId.SIDEWINDER,
    jobId: JobId.RANGER,
    name: 'Sidewinder',
    type: 'active',
    family: SkillFamily.PROJECTILE,
    levels: [
      { description: 'Homing arrow, 35 dmg + poison 3s (7s CD)', params: { damage: 35, poisonDamage: 3, poisonDuration: 3000, cooldown: 7000 } },
      { description: 'Homing arrow, 55 dmg + poison 4s (5s CD)', params: { damage: 55, poisonDamage: 5, poisonDuration: 4000, cooldown: 5000 } },
      { description: 'Homing arrow, 80 dmg + poison 5s (4s CD)', params: { damage: 80, poisonDamage: 7, poisonDuration: 5000, cooldown: 4000 } },
      { description: 'Homing arrow, 108 dmg + poison 5.5s (3s CD)', params: { damage: 108, poisonDamage: 10, poisonDuration: 5500, cooldown: 3000 } },
      { description: 'Homing arrow, 140 dmg + poison 6s (2.5s CD)', params: { damage: 140, poisonDamage: 13, poisonDuration: 6000, cooldown: 2500 } },
      { description: 'Homing arrow, 175 dmg + poison 6.5s (2s CD)', params: { damage: 175, poisonDamage: 17, poisonDuration: 6500, cooldown: 2000 } },
    ],
  },
  [MasterySkillId.EMPYREAL_ARROW]: {
    id: MasterySkillId.EMPYREAL_ARROW,
    jobId: JobId.RANGER,
    name: 'Empyreal Arrow',
    type: 'modifier',
    family: SkillFamily.PROJECTILE,
    levels: [
      { description: '+2 pierce, +15% projectile damage', apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 2; mods.projectileFamilyDamage += 0.15; } },
      { description: '+1 pierce, +15% projectile damage', apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 1; mods.projectileFamilyDamage += 0.15; } },
      { description: '+2 pierce, +20% projectile damage', apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 2; mods.projectileFamilyDamage += 0.20; } },
      { description: '+2 pierce, +22% projectile damage', apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 2; mods.projectileFamilyDamage += 0.22; } },
      { description: '+3 pierce, +25% projectile damage', apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 3; mods.projectileFamilyDamage += 0.25; } },
      { description: '+3 pierce, +30% projectile damage', apply: (mods: PlayerStatModifiers) => { mods.bonusPierce += 3; mods.projectileFamilyDamage += 0.30; } },
    ],
  },
  // ═══ BARD (moved from regular) ═══
  [MasterySkillId.REQUIEM]: {
    id: MasterySkillId.REQUIEM,
    jobId: JobId.BARD,
    name: 'Requiem',
    type: 'active',
    family: SkillFamily.AURA,
    levels: [
      { description: 'Sonic aura 45px dealing 2 dmg/s, 10% slow', params: { radius: 45 * SS, damage: 2, slowPercent: 0.10, cooldown: 1000 } },
      { description: 'Sonic aura 55px dealing 4 dmg/s, 15% slow', params: { radius: 55 * SS, damage: 4, slowPercent: 0.15, cooldown: 1000 } },
      { description: 'Sonic aura 65px dealing 7 dmg/s, 20% slow', params: { radius: 65 * SS, damage: 7, slowPercent: 0.20, cooldown: 1000 } },
      { description: 'Sonic aura 75px dealing 11 dmg/s, 25% slow', params: { radius: 75 * SS, damage: 11, slowPercent: 0.25, cooldown: 800 } },
      { description: 'Sonic aura 85px dealing 16 dmg/s, 30% slow', params: { radius: 85 * SS, damage: 16, slowPercent: 0.30, cooldown: 600 } },
      { description: 'Sonic aura 95px dealing 22 dmg/s, 35% slow', params: { radius: 95 * SS, damage: 22, slowPercent: 0.35, cooldown: 500 } },
    ],
  },
  [MasterySkillId.FINALE]: {
    id: MasterySkillId.FINALE,
    jobId: JobId.BARD,
    name: 'Finale',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      { description: 'Crescendo burst 80px, 25 dmg + 30% buff 5s (12s CD)', params: { radius: 80 * SS, damage: 25, buffDamage: 0.30, buffDuration: 5000, cooldown: 12000 } },
      { description: 'Crescendo burst 100px, 40 dmg + 40% buff 6s (10s CD)', params: { radius: 100 * SS, damage: 40, buffDamage: 0.40, buffDuration: 6000, cooldown: 10000 } },
      { description: 'Crescendo burst 120px, 60 dmg + 50% buff 7s (8s CD)', params: { radius: 120 * SS, damage: 60, buffDamage: 0.50, buffDuration: 7000, cooldown: 8000 } },
      { description: 'Crescendo burst 140px, 82 dmg + 60% buff 8s (6s CD)', params: { radius: 140 * SS, damage: 82, buffDamage: 0.60, buffDuration: 8000, cooldown: 6000 } },
      { description: 'Crescendo burst 160px, 108 dmg + 70% buff 9s (5s CD)', params: { radius: 160 * SS, damage: 108, buffDamage: 0.70, buffDuration: 9000, cooldown: 5000 } },
      { description: 'Crescendo burst 180px, 138 dmg + 80% buff 10s (4s CD)', params: { radius: 180 * SS, damage: 138, buffDamage: 0.80, buffDuration: 10000, cooldown: 4000 } },
    ],
  },
  // ═══ BLACK MAGE ═══
  [MasterySkillId.FLARE]: {
    id: MasterySkillId.FLARE,
    jobId: JobId.BLACK_MAGE,
    name: 'Flare',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      { description: 'Mega fire AoE 90px, 40 dmg + burn (12s CD)', params: { radius: 90 * SS, damage: 40, burnDamage: 5, burnDuration: 3000, cooldown: 12000 } },
      { description: 'Mega fire AoE 110px, 60 dmg + burn (9s CD)', params: { radius: 110 * SS, damage: 60, burnDamage: 7, burnDuration: 3000, cooldown: 9000 } },
      { description: 'Mega fire AoE 130px, 85 dmg + burn (7s CD)', params: { radius: 130 * SS, damage: 85, burnDamage: 10, burnDuration: 3000, cooldown: 7000 } },
      { description: 'Mega fire AoE 150px, 115 dmg + burn (5s CD)', params: { radius: 150 * SS, damage: 115, burnDamage: 14, burnDuration: 3500, cooldown: 5000 } },
      { description: 'Mega fire AoE 170px, 150 dmg + burn (4s CD)', params: { radius: 170 * SS, damage: 150, burnDamage: 18, burnDuration: 4000, cooldown: 4000 } },
      { description: 'Mega fire AoE 190px, 190 dmg + burn (3s CD)', params: { radius: 190 * SS, damage: 190, burnDamage: 23, burnDuration: 4500, cooldown: 3000 } },
    ],
  },
  [MasterySkillId.FREEZE]: {
    id: MasterySkillId.FREEZE,
    jobId: JobId.BLACK_MAGE,
    name: 'Freeze',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      { description: 'Ice field 60px, freeze enemies 1.5s (12s CD)', params: { radius: 60 * SS, freezeDuration: 1500, cooldown: 12000 } },
      { description: 'Ice field 80px, freeze enemies 2s (10s CD)', params: { radius: 80 * SS, freezeDuration: 2000, cooldown: 10000 } },
      { description: 'Ice field 100px, freeze enemies 2.5s (8s CD)', params: { radius: 100 * SS, freezeDuration: 2500, cooldown: 8000 } },
      { description: 'Ice field 120px, freeze enemies 3s (6s CD)', params: { radius: 120 * SS, freezeDuration: 3000, cooldown: 6000 } },
      { description: 'Ice field 140px, freeze enemies 3.5s (5s CD)', params: { radius: 140 * SS, freezeDuration: 3500, cooldown: 5000 } },
      { description: 'Ice field 160px, freeze enemies 4s (4s CD)', params: { radius: 160 * SS, freezeDuration: 4000, cooldown: 4000 } },
    ],
  },
  // ═══ WHITE MAGE ═══
  [MasterySkillId.BENEDICTION]: {
    id: MasterySkillId.BENEDICTION,
    jobId: JobId.WHITE_MAGE,
    name: 'Benediction',
    type: 'active',
    family: SkillFamily.SUPPORT,
    levels: [
      { description: 'Full heal to 100% HP (60s CD)', params: { healPercent: 1.00, cooldown: 60000 } },
      { description: 'Full heal to 100% HP (45s CD)', params: { healPercent: 1.00, cooldown: 45000 } },
      { description: 'Full heal to 100% HP + 5s invuln (30s CD)', params: { healPercent: 1.00, invulnDuration: 5000, cooldown: 30000 } },
      { description: 'Full heal to 100% HP + 6s invuln (22s CD)', params: { healPercent: 1.00, invulnDuration: 6000, cooldown: 22000 } },
      { description: 'Full heal to 100% HP + 7s invuln (16s CD)', params: { healPercent: 1.00, invulnDuration: 7000, cooldown: 16000 } },
      { description: 'Full heal to 100% HP + 8s invuln (10s CD)', params: { healPercent: 1.00, invulnDuration: 8000, cooldown: 10000 } },
    ],
  },
  [MasterySkillId.ASYLUM]: {
    id: MasterySkillId.ASYLUM,
    jobId: JobId.WHITE_MAGE,
    name: 'Asylum',
    type: 'active',
    family: SkillFamily.SUPPORT,
    levels: [
      { description: 'Healing zone 60px, 3 HP/s for 5s (15s CD)', params: { radius: 60 * SS, healPerTick: 3, duration: 5000, cooldown: 15000 } },
      { description: 'Healing zone 75px, 5 HP/s for 6s (12s CD)', params: { radius: 75 * SS, healPerTick: 5, duration: 6000, cooldown: 12000 } },
      { description: 'Healing zone 90px, 8 HP/s for 7s (10s CD)', params: { radius: 90 * SS, healPerTick: 8, duration: 7000, cooldown: 10000 } },
      { description: 'Healing zone 105px, 12 HP/s for 8s (8s CD)', params: { radius: 105 * SS, healPerTick: 12, duration: 8000, cooldown: 8000 } },
      { description: 'Healing zone 120px, 16 HP/s for 9s (6s CD)', params: { radius: 120 * SS, healPerTick: 16, duration: 9000, cooldown: 6000 } },
      { description: 'Healing zone 135px, 22 HP/s for 10s (5s CD)', params: { radius: 135 * SS, healPerTick: 22, duration: 10000, cooldown: 5000 } },
    ],
  },
  // ═══ SUMMONER ═══
  [MasterySkillId.PHOENIX]: {
    id: MasterySkillId.PHOENIX,
    jobId: JobId.SUMMONER,
    name: 'Phoenix',
    type: 'active',
    family: SkillFamily.SUMMONING,
    levels: [
      { description: 'Fire familiar + heal 2 HP/s while alive', params: { damage: 8, healPerSecond: 2, attackInterval: 1200 } },
      { description: 'Fire familiar + heal 3 HP/s while alive', params: { damage: 14, healPerSecond: 3, attackInterval: 1000 } },
      { description: 'Fire familiar + heal 5 HP/s while alive', params: { damage: 22, healPerSecond: 5, attackInterval: 800 } },
      { description: 'Fire familiar + heal 7 HP/s while alive', params: { damage: 32, healPerSecond: 7, attackInterval: 650 } },
      { description: 'Fire familiar + heal 10 HP/s while alive', params: { damage: 44, healPerSecond: 10, attackInterval: 500 } },
      { description: 'Fire familiar + heal 14 HP/s while alive', params: { damage: 60, healPerSecond: 14, attackInterval: 400 } },
    ],
  },
  [MasterySkillId.DREADWYRM]: {
    id: MasterySkillId.DREADWYRM,
    jobId: JobId.SUMMONER,
    name: 'Dreadwyrm',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      { description: 'Dark AoE 90px dealing 30 dmg (10s CD)', params: { radius: 90 * SS, damage: 30, cooldown: 10000 } },
      { description: 'Dark AoE 110px dealing 50 dmg (8s CD)', params: { radius: 110 * SS, damage: 50, cooldown: 8000 } },
      { description: 'Dark AoE 130px dealing 75 dmg (6s CD)', params: { radius: 130 * SS, damage: 75, cooldown: 6000 } },
      { description: 'Dark AoE 150px dealing 105 dmg (5s CD)', params: { radius: 150 * SS, damage: 105, cooldown: 5000 } },
      { description: 'Dark AoE 170px dealing 140 dmg (4s CD)', params: { radius: 170 * SS, damage: 140, cooldown: 4000 } },
      { description: 'Dark AoE 190px dealing 180 dmg (3s CD)', params: { radius: 190 * SS, damage: 180, cooldown: 3000 } },
    ],
  },
  // ═══ TIME MAGE ═══
  [MasterySkillId.TIME_STOP]: {
    id: MasterySkillId.TIME_STOP,
    jobId: JobId.TIME_MAGE,
    name: 'Time Stop',
    type: 'active',
    family: SkillFamily.SUPPORT,
    levels: [
      { description: 'Freeze all enemies for 2s (20s CD)', params: { duration: 2000, cooldown: 20000 } },
      { description: 'Freeze all enemies for 3s (16s CD)', params: { duration: 3000, cooldown: 16000 } },
      { description: 'Freeze all enemies for 4s (12s CD)', params: { duration: 4000, cooldown: 12000 } },
      { description: 'Freeze all enemies for 5s (9s CD)', params: { duration: 5000, cooldown: 9000 } },
      { description: 'Freeze all enemies for 6s (7s CD)', params: { duration: 6000, cooldown: 7000 } },
      { description: 'Freeze all enemies for 7s (5s CD)', params: { duration: 7000, cooldown: 5000 } },
    ],
  },
  [MasterySkillId.COMET]: {
    id: MasterySkillId.COMET,
    jobId: JobId.TIME_MAGE,
    name: 'Comet',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      { description: '3 comets striking random targets, 20 dmg each (10s CD)', params: { count: 3, damage: 20, radius: 40 * SS, cooldown: 10000 } },
      { description: '5 comets striking random targets, 30 dmg each (8s CD)', params: { count: 5, damage: 30, radius: 50 * SS, cooldown: 8000 } },
      { description: '8 comets striking random targets, 40 dmg each (6s CD)', params: { count: 8, damage: 40, radius: 60 * SS, cooldown: 6000 } },
      { description: '11 comets striking random targets, 55 dmg each (5s CD)', params: { count: 11, damage: 55, radius: 70 * SS, cooldown: 5000 } },
      { description: '14 comets striking random targets, 72 dmg each (4s CD)', params: { count: 14, damage: 72, radius: 80 * SS, cooldown: 4000 } },
      { description: '18 comets striking random targets, 92 dmg each (3s CD)', params: { count: 18, damage: 92, radius: 90 * SS, cooldown: 3000 } },
    ],
  },
  // ═══ ALCHEMIST ═══
  [MasterySkillId.PHILOSOPHER_STONE]: {
    id: MasterySkillId.PHILOSOPHER_STONE,
    jobId: JobId.ALCHEMIST,
    name: "Philosopher's Stone",
    type: 'modifier',
    family: SkillFamily.SUPPORT,
    levels: [
      { description: '+30% XP, +50% health drop effectiveness', apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.30; mods.healthDropMultiplier += 0.50; } },
      { description: '+20% XP, +50% health drop effectiveness', apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.20; mods.healthDropMultiplier += 0.50; } },
      { description: '+30% XP, +75% health drop effectiveness', apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.30; mods.healthDropMultiplier += 0.75; } },
      { description: '+35% XP, +85% health drop effectiveness', apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.35; mods.healthDropMultiplier += 0.85; } },
      { description: '+40% XP, +100% health drop effectiveness', apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.40; mods.healthDropMultiplier += 1.00; } },
      { description: '+50% XP, +125% health drop effectiveness', apply: (mods: PlayerStatModifiers) => { mods.xpMultiplier += 0.50; mods.healthDropMultiplier += 1.25; } },
    ],
  },
  [MasterySkillId.MEGA_POTION]: {
    id: MasterySkillId.MEGA_POTION,
    jobId: JobId.ALCHEMIST,
    name: 'Mega Potion',
    type: 'active',
    family: SkillFamily.SUPPORT,
    levels: [
      { description: 'Heal 40% max HP + 5s damage buff 25% (20s CD)', params: { healPercent: 0.40, buffDamage: 0.25, buffDuration: 5000, cooldown: 20000 } },
      { description: 'Heal 50% max HP + 6s damage buff 30% (15s CD)', params: { healPercent: 0.50, buffDamage: 0.30, buffDuration: 6000, cooldown: 15000 } },
      { description: 'Heal 60% max HP + 7s damage buff 40% (12s CD)', params: { healPercent: 0.60, buffDamage: 0.40, buffDuration: 7000, cooldown: 12000 } },
      { description: 'Heal 70% max HP + 8s damage buff 48% (9s CD)', params: { healPercent: 0.70, buffDamage: 0.48, buffDuration: 8000, cooldown: 9000 } },
      { description: 'Heal 80% max HP + 9s damage buff 55% (7s CD)', params: { healPercent: 0.80, buffDamage: 0.55, buffDuration: 9000, cooldown: 7000 } },
      { description: 'Heal 90% max HP + 10s damage buff 65% (5s CD)', params: { healPercent: 0.90, buffDamage: 0.65, buffDuration: 10000, cooldown: 5000 } },
    ],
  },
  // ═══ GEOMANCER ═══
  [MasterySkillId.ERUPTION]: {
    id: MasterySkillId.ERUPTION,
    jobId: JobId.GEOMANCER,
    name: 'Eruption',
    type: 'active',
    family: SkillFamily.MAGIC,
    levels: [
      { description: 'Fire geyser 50px, 30 dmg + burn 2s (10s CD)', params: { radius: 50 * SS, damage: 30, burnDamage: 5, burnDuration: 2000, cooldown: 10000 } },
      { description: 'Fire geyser 65px, 45 dmg + burn 3s (8s CD)', params: { radius: 65 * SS, damage: 45, burnDamage: 7, burnDuration: 3000, cooldown: 8000 } },
      { description: 'Fire geyser 80px, 65 dmg + burn 3s (6s CD)', params: { radius: 80 * SS, damage: 65, burnDamage: 10, burnDuration: 3000, cooldown: 6000 } },
      { description: 'Fire geyser 95px, 88 dmg + burn 3.5s (5s CD)', params: { radius: 95 * SS, damage: 88, burnDamage: 14, burnDuration: 3500, cooldown: 5000 } },
      { description: 'Fire geyser 110px, 115 dmg + burn 4s (4s CD)', params: { radius: 110 * SS, damage: 115, burnDamage: 18, burnDuration: 4000, cooldown: 4000 } },
      { description: 'Fire geyser 125px, 148 dmg + burn 4.5s (3s CD)', params: { radius: 125 * SS, damage: 148, burnDamage: 23, burnDuration: 4500, cooldown: 3000 } },
    ],
  },
  [MasterySkillId.LANDSLIDE]: {
    id: MasterySkillId.LANDSLIDE,
    jobId: JobId.GEOMANCER,
    name: 'Landslide',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      { description: 'Knockback wave 70px, 15 dmg + stun 0.5s (8s CD)', params: { radius: 70 * SS, damage: 15, stunDuration: 500, cooldown: 8000 } },
      { description: 'Knockback wave 90px, 25 dmg + stun 0.8s (6s CD)', params: { radius: 90 * SS, damage: 25, stunDuration: 800, cooldown: 6000 } },
      { description: 'Knockback wave 110px, 40 dmg + stun 1s (5s CD)', params: { radius: 110 * SS, damage: 40, stunDuration: 1000, cooldown: 5000 } },
      { description: 'Knockback wave 130px, 57 dmg + stun 1.3s (4s CD)', params: { radius: 130 * SS, damage: 57, stunDuration: 1300, cooldown: 4000 } },
      { description: 'Knockback wave 150px, 78 dmg + stun 1.6s (3s CD)', params: { radius: 150 * SS, damage: 78, stunDuration: 1600, cooldown: 3000 } },
      { description: 'Knockback wave 170px, 102 dmg + stun 2s (2.5s CD)', params: { radius: 170 * SS, damage: 102, stunDuration: 2000, cooldown: 2500 } },
    ],
  },
  // ═══ SAMURAI ═══
  [MasterySkillId.MIDARE_SETSUGEKKA]: {
    id: MasterySkillId.MIDARE_SETSUGEKKA,
    jobId: JobId.SAMURAI,
    name: 'Midare Setsugekka',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      { description: 'Triple slash 60px, 3x15 dmg (8s CD)', params: { radius: 60 * SS, damage: 15, hitCount: 3, cooldown: 8000 } },
      { description: 'Triple slash 75px, 3x25 dmg (6s CD)', params: { radius: 75 * SS, damage: 25, hitCount: 3, cooldown: 6000 } },
      { description: 'Triple slash 90px, 3x38 dmg (5s CD)', params: { radius: 90 * SS, damage: 38, hitCount: 3, cooldown: 5000 } },
      { description: 'Quad slash 105px, 4x52 dmg (4s CD)', params: { radius: 105 * SS, damage: 52, hitCount: 4, cooldown: 4000 } },
      { description: 'Quad slash 120px, 4x70 dmg (3s CD)', params: { radius: 120 * SS, damage: 70, hitCount: 4, cooldown: 3000 } },
      { description: 'Penta slash 135px, 5x92 dmg (2.5s CD)', params: { radius: 135 * SS, damage: 92, hitCount: 5, cooldown: 2500 } },
    ],
  },
  [MasterySkillId.HISSATSU]: {
    id: MasterySkillId.HISSATSU,
    jobId: JobId.SAMURAI,
    name: 'Hissatsu',
    type: 'active',
    family: SkillFamily.MELEE,
    levels: [
      { description: 'Dash slash 150px dealing 30 dmg (8s CD)', params: { range: 150 * SS, damage: 30, cooldown: 8000 } },
      { description: 'Dash slash 180px dealing 50 dmg (6s CD)', params: { range: 180 * SS, damage: 50, cooldown: 6000 } },
      { description: 'Dash slash 220px dealing 75 dmg (5s CD)', params: { range: 220 * SS, damage: 75, cooldown: 5000 } },
      { description: 'Dash slash 260px dealing 105 dmg (4s CD)', params: { range: 260 * SS, damage: 105, cooldown: 4000 } },
      { description: 'Dash slash 300px dealing 140 dmg (3s CD)', params: { range: 300 * SS, damage: 140, cooldown: 3000 } },
      { description: 'Dash slash 340px dealing 180 dmg (2.5s CD)', params: { range: 340 * SS, damage: 180, cooldown: 2500 } },
    ],
  },
};
