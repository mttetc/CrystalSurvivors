import { EnemyType, EnemyBehavior } from '../constants';

export interface EnemyDef {
  type: EnemyType;
  name: string;
  baseHP: number;
  baseSpeed: number;
  baseDamage: number;
  xpValue: number;
  behavior: EnemyBehavior;
  firstWave: number;
  isBoss: boolean;
  size: number;            // sprite size in px
  color: string;           // primary color for sprite gen
  // Behavior-specific
  projectileSpeed?: number;
  summonInterval?: number; // ms for Necromancer
  splitCount?: number;
  splitType?: EnemyType;
  chargeSpeed?: number;
  keepDistance?: number;    // for ranged enemies
}
