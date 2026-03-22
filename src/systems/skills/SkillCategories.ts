import { JobSkillId, MasterySkillId } from '../../constants';

// ---- Skill category classification sets ----

export const AURA_SKILLS = new Set<string>([JobSkillId.CONSECRATE, MasterySkillId.REQUIEM]);

export const PERIODIC_AOE_SKILLS = new Set<string>([
  JobSkillId.CHI_BURST, JobSkillId.HOLY,
  JobSkillId.METEOR, JobSkillId.GUST, JobSkillId.QUAKE,
  JobSkillId.RAMUH, JobSkillId.TITAN, JobSkillId.LEVIATHAN,
  JobSkillId.ODIN, JobSkillId.DIABOLOS,
  JobSkillId.KNIGHTS_OF_THE_ROUND,
  // Mastery AoE skills
  MasterySkillId.SOUL_EATER, MasterySkillId.INNER_BEAST, MasterySkillId.FELL_CLEAVE,
  MasterySkillId.FLARE, MasterySkillId.DREADWYRM, MasterySkillId.ERUPTION,
  MasterySkillId.LANDSLIDE, MasterySkillId.STARDIVER, MasterySkillId.FINALE,
  MasterySkillId.COMET, MasterySkillId.MIDARE_SETSUGEKKA, MasterySkillId.EDEN,
]);

export const LASER_SKILLS = new Set<string>([JobSkillId.BAHAMUT, JobSkillId.ALEXANDER]);
export const JUMP_SKILLS = new Set<string>([JobSkillId.JUMP]);
export const BARRAGE_SKILLS = new Set<string>([JobSkillId.BARRAGE]);
export const FAMILIAR_SKILLS = new Set<string>([JobSkillId.IFRIT, JobSkillId.SHIVA, MasterySkillId.PHOENIX]);
export const TRAIL_SKILLS = new Set<string>([JobSkillId.PITFALL]);
export const ELIXIR_SKILLS = new Set<string>([JobSkillId.ELIXIR, MasterySkillId.CLEMENCY, MasterySkillId.BENEDICTION, MasterySkillId.MEGA_POTION]);
export const ZANTETSUKEN_SKILLS = new Set<string>([JobSkillId.ZANTETSUKEN, MasterySkillId.HISSATSU]);
export const ORBITAL_SKILLS = new Set<string>([JobSkillId.SACRED_ORBIT]);

// ---- Ninja / mastery active skill categories ----

export const FIREBALL_SKILLS = new Set<string>([MasterySkillId.KATON]);
export const LIGHTNING_STRIKE_SKILLS = new Set<string>([MasterySkillId.RAITON]);
export const GROUND_ZONE_SKILLS = new Set<string>([MasterySkillId.DOTON]);
export const WAR_CRY_SKILLS = new Set<string>([JobSkillId.WAR_CRY]);
export const CHARGE_SKILLS = new Set<string>([JobSkillId.RAMPAGE]);
export const ARROW_RAIN_SKILLS = new Set<string>([JobSkillId.RAIN_OF_ARROWS]);
export const PIERCING_PROJECTILE_SKILLS = new Set<string>([JobSkillId.CRESCENDO, JobSkillId.HADOUKEN]);
export const DRAGON_DIVE_SKILLS = new Set<string>([JobSkillId.DRAGON_DIVE]);
export const BLADE_STORM_SKILLS = new Set<string>([JobSkillId.BLADE_STORM]);
export const SMOKE_BOMB_SKILLS = new Set<string>([JobSkillId.SMOKE_BOMB]);
export const DUAL_STRIKE_SKILLS = new Set<string>([JobSkillId.DUAL_STRIKE]);
export const HALLOWED_GROUND_SKILLS = new Set<string>([MasterySkillId.HALLOWED_GROUND]);
export const TIME_STOP_SKILLS = new Set<string>([MasterySkillId.TIME_STOP]);
export const FREEZE_SKILLS = new Set<string>([MasterySkillId.FREEZE]);
export const ASYLUM_SKILLS = new Set<string>([MasterySkillId.ASYLUM]);
