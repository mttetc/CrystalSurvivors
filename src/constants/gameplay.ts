import { SPRITE_SCALE } from './display';

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
export const MAX_ENEMIES = 350;
export const MAX_PROJECTILES = 200;

// ─── Waves ──────────────────────────────────────────────────────────
export const WAVE_COUNT = 20;
export const INTER_WAVE_PAUSE = 1000;

// ─── Combat ─────────────────────────────────────────────────────────
export const KNOCKBACK_VELOCITY = 180 * SPRITE_SCALE;
export const KNOCKBACK_DURATION = 150;

// ─── XP Gems ────────────────────────────────────────────────────────
export const GEM_SMALL_XP = 1;      // green  — common
export const GEM_MEDIUM_XP = 3;     // yellow — uncommon
export const GEM_LARGE_XP = 10;     // purple — rare
export const GEM_MEGA_XP = 30;      // red    — epic
export const GEM_SMALL_CHANCE = 0.65;
export const GEM_MEDIUM_CHANCE = 0.24;
export const GEM_LARGE_CHANCE = 0.08;
// Mega (red) = remaining 3%
export const HEALTH_DROP_CHANCE = 0.03;
export const HEALTH_DROP_AMOUNT = 15;

// ─── Jobs ───────────────────────────────────────────────────────────
export const JOB_SELECTION_LEVELS = [5, 12, 20, 28];

// ─── Difficulty Scaling ─────────────────────────────────────────────
export const SCALE_HP_PER_WAVE = 0.22;
export const SCALE_SPEED_PER_WAVE = 0.03;
export const SCALE_DAMAGE_PER_WAVE = 0.12;
