// ─── Skill Families ─────────────────────────────────────────────────
export enum SkillFamily {
  PROJECTILE = 'projectile',
  MAGIC = 'magic',
  MELEE = 'melee',
  AURA = 'aura',
  SUPPORT = 'support',
  SUMMONING = 'summoning',
}

// ─── Jobs ───────────────────────────────────────────────────────────
export enum JobId {
  PALADIN = 'paladin',
  DARK_KNIGHT = 'dark_knight',
  DRAGOON = 'dragoon',
  NINJA = 'ninja',
  MONK = 'monk',
  BERSERKER = 'berserker',
  RANGER = 'ranger',
  BARD = 'bard',
  BLACK_MAGE = 'black_mage',
  WHITE_MAGE = 'white_mage',
  SUMMONER = 'summoner',
  TIME_MAGE = 'time_mage',
  ALCHEMIST = 'alchemist',
  GEOMANCER = 'geomancer',
  SAMURAI = 'samurai',
}

export enum JobSkillId {
  // Paladin
  SACRED_ORBIT = 'sacred_orbit',
  DIVINE_GUARD = 'divine_guard',
  CONSECRATE = 'consecrate',
  // Dark Knight
  ABYSSAL_DRAIN = 'abyssal_drain',
  DARK_FORCE = 'dark_force',
  DARKNESS = 'darkness',
  // Dragoon
  JUMP = 'jump',
  LANCE_MASTERY = 'lance_mastery',
  DRAGON_DIVE = 'dragon_dive',
  // Ninja
  SHADOW_STEP = 'shadow_step',
  DUAL_STRIKE = 'dual_strike',
  SMOKE_BOMB = 'smoke_bomb',
  // Monk
  IRON_FIST = 'iron_fist',
  CHI_BURST = 'chi_burst',
  HADOUKEN = 'hadouken',
  // Berserker
  WAR_CRY = 'war_cry',
  FRENZY = 'frenzy',
  RAMPAGE = 'rampage',
  // Ranger
  MULTI_SHOT = 'multi_shot',
  RAIN_OF_ARROWS = 'rain_of_arrows',
  BARRAGE = 'barrage',
  // Bard
  WAR_SONG = 'war_song',
  SWIFT_SONG = 'swift_song',
  CRESCENDO = 'crescendo',
  // Black Mage
  FIRE = 'fire',
  BLIZZARD = 'blizzard',
  THUNDER = 'thunder',
  // White Mage
  REGEN_WM = 'regen_wm',
  PROTECT = 'protect',
  HOLY = 'holy',
  // Summoner
  IFRIT = 'ifrit',
  SHIVA = 'shiva',
  RAMUH = 'ramuh',
  TITAN = 'titan',
  CARBUNCLE = 'carbuncle',
  LEVIATHAN = 'leviathan',
  ODIN = 'odin',
  ALEXANDER = 'alexander',
  BAHAMUT = 'bahamut',
  DIABOLOS = 'diabolos',
  KNIGHTS_OF_THE_ROUND = 'knights_of_the_round',
  // Time Mage
  HASTE = 'haste',
  SLOW_FIELD = 'slow_field',
  METEOR = 'meteor',
  // Alchemist
  POTION_LORE = 'potion_lore',
  TRANSMUTE = 'transmute',
  ELIXIR = 'elixir',
  // Geomancer
  PITFALL = 'pitfall',
  GUST = 'gust',
  QUAKE = 'quake',
  // Samurai
  BUSHIDO = 'bushido',
  BLADE_STORM = 'blade_storm',
  ZANTETSUKEN = 'zantetsuken',
}

export enum MasterySkillId {
  // Paladin
  HALLOWED_GROUND = 'hallowed_ground',
  CLEMENCY = 'clemency',
  // Dark Knight
  SOUL_EATER = 'soul_eater',
  LIVING_DEAD = 'living_dead',
  // Dragoon
  STARDIVER = 'stardiver',
  NASTROND = 'nastrond',
  // Ninja
  KATON = 'katon',
  RAITON = 'raiton',
  DOTON = 'doton',
  // Monk
  FORBIDDEN_CHAKRA = 'forbidden_chakra',
  PHANTOM_RUSH = 'phantom_rush',
  // Berserker
  INNER_BEAST = 'inner_beast',
  FELL_CLEAVE = 'fell_cleave',
  // Ranger
  SIDEWINDER = 'sidewinder',
  EMPYREAL_ARROW = 'empyreal_arrow',
  // Bard
  REQUIEM = 'requiem',
  FINALE = 'finale',
  // Black Mage
  FLARE = 'flare',
  FREEZE = 'freeze',
  // White Mage
  BENEDICTION = 'benediction',
  ASYLUM = 'asylum',
  // Summoner
  PHOENIX = 'phoenix',
  DREADWYRM = 'dreadwyrm',
  EDEN = 'eden',
  // Time Mage
  TIME_STOP = 'time_stop',
  COMET = 'comet',
  // Alchemist
  PHILOSOPHER_STONE = 'philosopher_stone',
  MEGA_POTION = 'mega_potion',
  // Geomancer
  ERUPTION = 'eruption',
  LANDSLIDE = 'landslide',
  // Samurai
  MIDARE_SETSUGEKKA = 'midare_setsugekka',
  HISSATSU = 'hissatsu',
}

// ─── Weapons ────────────────────────────────────────────────────────
export enum WeaponId {
  HUNTERS_BOW = 'hunters_bow',       // Ranger - fast arrow projectiles
  SACRED_SHIELD = 'sacred_shield',   // Paladin - orbiting shield shards
  FIRE_ROD = 'fire_rod',             // Black Mage - fireball projectiles
  DARK_CLAYMORE = 'dark_claymore',   // Dark Knight - dark melee arc slash
  WAR_HARP = 'war_harp',             // Bard - chain sound waves
  SHURIKEN = 'shuriken',             // Ninja - spinning boomerang star
  KATANA = 'katana',                 // Samurai - arc slash
  BATTLE_AXE = 'battle_axe',         // Berserker - wide melee arc
  WAR_LANCE = 'war_lance',           // Dragoon - piercing lance throw
  FLASK_THROW = 'flask_throw',       // Alchemist - thrown potion bottles
  HOLY_ROD = 'holy_rod',             // White Mage - light boomerang
  ETHER_ROD = 'ether_rod',           // Summoner - homing orbs
  IRON_FISTS = 'iron_fists',         // Monk - rapid melee punches
  CHRONO_ROD = 'chrono_rod',         // Time Mage - time AoE + slow
  EARTH_ROD = 'earth_rod',           // Geomancer - earth damage aura
}

// ─── Enemies ────────────────────────────────────────────────────────
export enum EnemyType {
  SHAMBLER = 'shambler',
  SPRINTER = 'sprinter',
  BRUTE = 'brute',
  SPITTER = 'spitter',
  SPLITTER = 'splitter',
  SWARMER = 'swarmer',
  NECROMANCER = 'necromancer',
  GOREHOUND = 'gorehound',
  HIVEMIND = 'hivemind',
  PHANTOM = 'phantom',
  BOMBER = 'bomber',
  TANK = 'tank',
  LEAPER = 'leaper',
}

export enum EnemyBehavior {
  CHASE = 'chase',
  BURST_CHARGE = 'burst_charge',
  RANGED = 'ranged',
  SPLIT = 'split',
  SWARM = 'swarm',
  SUMMON = 'summon',
  BOSS_GOREHOUND = 'boss_gorehound',
  BOSS_HIVEMIND = 'boss_hivemind',
  PHASE = 'phase',
  SUICIDE = 'suicide',
  SHIELD = 'shield',
  LEAP = 'leap',
}

// ─── Enchants & Elements ────────────────────────────────────────────
export enum EnchantId {
  BURNING = 'burning',
  FREEZING = 'freezing',
  VAMPIRIC = 'vampiric',
  PIERCING = 'piercing',
  CHAIN = 'chain',
  EXPLOSIVE = 'explosive',
  TOXIC = 'toxic',
  CRITICAL = 'critical',
}

export enum ElementId {
  FIRE = 'fire',
  ICE = 'ice',
  LIGHTNING = 'lightning',
  POISON = 'poison',
  HOLY = 'holy',
  DARK = 'dark',
}

// ─── Enhancements ───────────────────────────────────────────────────
export enum EnhancementCategory {
  JOB_SELECTION = 'job_selection',
  JOB_SKILL = 'job_skill',
  JOB_AWAKENING = 'job_awakening',
  MASTERY_SKILL = 'mastery_skill',
  NEW_WEAPON = 'new_weapon',
  WEAPON_UPGRADE = 'weapon_upgrade',
  NEW_ENCHANT = 'new_enchant',
  ENCHANT_UPGRADE = 'enchant_upgrade',
  APPLY_ELEMENT = 'apply_element',
  ELEMENT_UPGRADE = 'element_upgrade',
  FAMILY_BOOST = 'family_boost',
  STAT_BOOST = 'stat_boost',
  MALUS_TRADE = 'malus_trade',
  SYNERGY_UPGRADE = 'synergy_upgrade',
}

// ─── Rarity ─────────────────────────────────────────────────────────
export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
}
