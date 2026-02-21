import { JobId } from '../constants';
import { WeaponInstance } from './weapons';
import { PlayerStatModifiers } from './enhancements';

export interface PlayerStats {
  maxHP: number;
  currentHP: number;
  speed: number;
  pickupRadius: number;
  level: number;
  xp: number;
  xpToNext: number;
  kills: number;
  damageDealt: number;
  damageTaken: number;
  timeSurvived: number;    // ms
}

export interface PlayerState {
  stats: PlayerStats;
  weapons: WeaponInstance[];
  modifiers: PlayerStatModifiers;
  chosenJobs: JobId[];
  jobSkillLevels: Record<string, number>;  // skillId → level (1-3)
  isDoubledDown: boolean;                   // true = locked to 2 jobs, enhanced skills
  passiveTiers: Record<string, number>;     // jobId → passive tier (0=none, 1, 2)
  activeSynergies: string[];                // active synergy IDs
  takenMalus: string[];                     // taken malus card IDs
  isInvulnerable: boolean;
  isDead: boolean;
}
