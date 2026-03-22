import Phaser from 'phaser';
import { Player } from '../../entities/Player';
import { Enemy } from '../../entities/Enemy';

// ---- Context passed to all skill handlers ----

export interface SkillContext {
  scene: Phaser.Scene;
  player: Player;
  enemyGroup: Phaser.Physics.Arcade.Group;
  projectileGroup: Phaser.Physics.Arcade.Group;
}

// ---- Timer helpers interface ----

export interface TimerAccess {
  getTimer(skillId: string): number;
  setTimer(skillId: string, value: number): void;
  addTimer(skillId: string, delta: number): number;
}

// ---- FX drawing helpers interface ----

export interface FXHelpers {
  drawPulse(x: number, y: number, radius: number, color: number, alpha?: number, duration?: number): void;
  drawExpandingRing(x: number, y: number, startRadius: number, endRadius: number, color: number, duration?: number): void;
  drawImpactParticles(x: number, y: number, color: number, count?: number, speed?: number, duration?: number): void;
  drawAdditiveGlow(x: number, y: number, radius: number, color: number, alpha?: number, duration?: number): void;
  drawLightningBolt(x1: number, y1: number, x2: number, y2: number, scale?: number): void;
}

// ---- Combined helpers passed to skill handlers ----

export interface SkillHelpers extends TimerAccess, FXHelpers {
  getEffectiveCooldown(baseCooldown: number): number;
  getEnemiesInRadius(cx: number, cy: number, radius: number): Enemy[];
  pointToSegmentDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number;
}
