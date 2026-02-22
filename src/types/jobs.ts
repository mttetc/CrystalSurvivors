import { JobId, JobSkillId, MasterySkillId, SkillFamily } from '../constants';
import { PlayerStatModifiers } from './enhancements';

export interface JobPassiveTier {
  description: string;
  apply: (mods: PlayerStatModifiers) => void;
}

export interface JobPassiveDef {
  name: string;
  tiers: JobPassiveTier[];  // 2 tiers (awakening at 11 + mastery at 17)
}

export interface JobDef {
  id: JobId;
  name: string;
  description: string;
  color: string;       // couleur du badge sur les cartes
  icon: string;        // texture key ex: 'job_ninja'
  skills: JobSkillId[];
  masterySkills: MasterySkillId[];  // unlocked post-awakening
  passive: JobPassiveDef;
}

export interface JobSkillDef {
  id: JobSkillId | MasterySkillId;
  jobId: JobId;
  name: string;
  type: 'modifier' | 'active';
  family: SkillFamily;
  levels: JobSkillLevel[];
}

export interface JobSkillLevel {
  description: string;
  apply?: (mods: PlayerStatModifiers) => void;  // pour type 'modifier'
  params?: Record<string, number>;  // pour type 'active'
}
