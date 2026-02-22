// ─── Display ────────────────────────────────────────────────────────
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GAME_ZOOM = 1;

// ─── Sprite Scale ───────────────────────────────────────────────────
// Change this ONE value to scale all sprites, hitboxes, radii, and ranges.
// 1 = original pixel size, 2 = FFBE/FFT style (32x40 player), 3 = even bigger
export const SPRITE_SCALE = 2;

// ─── World ──────────────────────────────────────────────────────────
export const WORLD_WIDTH = 3000;
export const WORLD_HEIGHT = 3000;

// ─── Player ─────────────────────────────────────────────────────────
export const PLAYER_SPEED = 90; // Not scaled - movement speed is independent of sprite size
export const PLAYER_MAX_HP = 50;
export const PLAYER_PICKUP_RADIUS = 48 * SPRITE_SCALE;
export const PLAYER_INVULN_MS = 500;
export const PLAYER_REGEN_RATE = 0; // HP/s, boosted by enhancements
export const PLAYER_MAX_WEAPONS = 6;
export const PLAYER_MAX_JOBS = 3;

// ─── Spawning ───────────────────────────────────────────────────────
export const SPAWN_RING_RADIUS = 280 * SPRITE_SCALE;
export const MAX_ENEMIES = 250;
export const MAX_PROJECTILES = 200;

// ─── Waves ──────────────────────────────────────────────────────────
export const WAVE_COUNT = 20;
export const INTER_WAVE_PAUSE = 1000;

// ─── Combat ─────────────────────────────────────────────────────────
export const KNOCKBACK_VELOCITY = 180 * SPRITE_SCALE;
export const KNOCKBACK_DURATION = 150;

// ─── XP Gems ────────────────────────────────────────────────────────
export const GEM_SMALL_XP = 1;
export const GEM_MEDIUM_XP = 3;
export const GEM_LARGE_XP = 10;
export const GEM_SMALL_CHANCE = 0.70;
export const GEM_MEDIUM_CHANCE = 0.25;
// Large = remaining 5%
export const HEALTH_DROP_CHANCE = 0.05;
export const HEALTH_DROP_AMOUNT = 15;

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
export const JOB_SELECTION_LEVELS = [5, 12, 20, 28];

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
  BAHAMUT = 'bahamut',
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

// ─── Enums ──────────────────────────────────────────────────────────
export enum Direction {
  DOWN = 0,
  LEFT = 1,
  RIGHT = 2,
  UP = 3,
}

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

export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

// ─── Scenes ─────────────────────────────────────────────────────────
export const SCENES = {
  BOOT: 'BootScene',
  TITLE: 'TitleScene',
  CHAR_SELECT: 'CharSelectScene',
  GAME: 'GameScene',
  HUD: 'HUDScene',
  LEVEL_UP: 'LevelUpScene',
  PAUSE: 'PauseScene',
  PERKS: 'PerksScene',
  GAME_OVER: 'GameOverScene',
} as const;

// ─── Events ─────────────────────────────────────────────────────────
export const EVENTS = {
  PLAYER_HEALTH_CHANGED: 'player-health-changed',
  PLAYER_DIED: 'player-died',
  PLAYER_DAMAGE_TAKEN: 'player-damage-taken',
  ENEMY_KILLED: 'enemy-killed',
  ENEMY_HIT: 'enemy-hit',
  XP_CHANGED: 'xp-changed',
  LEVEL_UP: 'level-up',
  WAVE_STARTED: 'wave-started',
  WAVE_CLEARED: 'wave-cleared',
  BOSS_SPAWNED: 'boss-spawned',
  ENHANCEMENT_PICKED: 'enhancement-picked',
  WEAPON_ADDED: 'weapon-added',
  WEAPON_UPGRADED: 'weapon-upgraded',
  ENCHANT_APPLIED: 'enchant-applied',
  ENCHANT_UPGRADED: 'enchant-upgraded',
  GAME_OVER: 'game-over',
  GAME_WON: 'game-won',
  PAUSE_TOGGLE: 'pause-toggle',
  STATS_CHANGED: 'stats-changed',
  CHEST_COLLECTED: 'chest-collected',
  ELITE_KILLED: 'elite-killed',
  CRIT_HIT: 'crit-hit',
  ENCHANT_DAMAGE: 'enchant-damage',
  PLAYER_DASHED: 'player-dashed',
  PLAYER_COUNTER: 'player-counter',
  JOB_CHOSEN: 'job-chosen',
  JOB_SKILL_UPGRADED: 'job-skill-upgraded',
  SWARM_INCOMING: 'swarm-incoming',
  RESET_WEAPON_COOLDOWNS: 'reset-weapon-cooldowns',
  SYNERGY_SKILL_UPGRADE: 'synergy-skill-upgrade',
} as const;

// ─── Depths ─────────────────────────────────────────────────────────
export const DEPTHS = {
  GROUND: 0,
  PICKUPS: 5,
  ENEMIES: 10,
  PLAYER: 15,
  PROJECTILES: 20,
  EFFECTS: 100,
  UI: 200,
} as const;

// ─── Difficulty Scaling ─────────────────────────────────────────────
export const SCALE_HP_PER_WAVE = 0.22;
export const SCALE_SPEED_PER_WAVE = 0.03;
export const SCALE_DAMAGE_PER_WAVE = 0.12;
