import { EnemyType } from '../constants';

export interface WaveSpawnGroup {
  type: EnemyType;
  count: number;
  spawnRate: number;       // enemies per second
  delay?: number;          // ms delay before this group starts
}

export interface WaveDef {
  wave: number;
  duration: number;        // ms
  groups: WaveSpawnGroup[];
  isBossWave: boolean;
  bossType?: EnemyType;
  bossHP?: number;         // override base HP for scaling
}
