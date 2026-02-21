import Phaser from 'phaser';
import {
  EVENTS, INTER_WAVE_PAUSE, SPAWN_RING_RADIUS, MAX_ENEMIES,
  WAVE_COUNT, EnemyType,
} from '../constants';
import { WaveDef, WaveSpawnGroup } from '../types';
import { WAVE_DEFS } from '../data/waves';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { EventBus } from './EventBus';

export class WaveManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemyGroup: Phaser.Physics.Arcade.Group;
  private currentWave = 0;
  private waveTimer = 0;
  private interWaveTimer = 0;
  private isInWave = false;
  private isPaused = false;
  private spawnAccumulators: Map<number, number> = new Map();
  private spawnedCounts: Map<number, number> = new Map();
  private allWavesComplete = false;
  // Swarm rush
  private swarmRushTimer = 90000; // first swarm at 90s
  private isSwarmActive = false;
  private swarmTimer = 0;
  private swarmAngle = 0;

  constructor(scene: Phaser.Scene, player: Player, enemyGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.player = player;
    this.enemyGroup = enemyGroup;
  }

  public start(): void {
    this.currentWave = 0;
    this.interWaveTimer = 1000; // Short delay before wave 1
    this.isInWave = false;
  }

  public pause(): void { this.isPaused = true; }
  public resume(): void { this.isPaused = false; }

  public update(_time: number, delta: number): void {
    if (this.isPaused || this.allWavesComplete) return;

    // Swarm rush timer
    this.updateSwarmRush(delta);

    if (!this.isInWave) {
      this.interWaveTimer -= delta;

      // Continuous background spawning between waves (keeps pressure up)
      const activeCount = this.enemyGroup.countActive(true);
      if (activeCount < MAX_ENEMIES * 0.5) {
        // Aggressive continuous spawning - scale with wave number
        const bgRate = 3.0 + this.currentWave * 0.8;
        // Pick enemy type based on current wave
        const bgTypes = this.getBackgroundEnemyTypes();
        const dtSec = delta / 1000;
        let toSpawn = bgRate * dtSec;
        // If screen is nearly empty, burst spawn to keep action going
        if (activeCount < 5) {
          toSpawn = Math.max(toSpawn, 3);
        }
        while (toSpawn >= 1) {
          const type = bgTypes[Math.floor(Math.random() * bgTypes.length)];
          this.spawnEnemy(type);
          toSpawn -= 1;
        }
        if (Math.random() < toSpawn) {
          const type = bgTypes[Math.floor(Math.random() * bgTypes.length)];
          this.spawnEnemy(type);
        }
      }

      if (this.interWaveTimer <= 0) {
        this.startNextWave();
      }
      return;
    }

    this.waveTimer -= delta;

    // Spawn enemies
    const waveDef = WAVE_DEFS[this.currentWave - 1];
    if (waveDef) {
      this.spawnEnemies(waveDef, delta);
    }

    // Check wave end
    if (this.waveTimer <= 0) {
      this.endWave();
    }
  }

  private startNextWave(): void {
    this.currentWave++;
    if (this.currentWave > WAVE_COUNT) {
      this.allWavesComplete = true;
      EventBus.emit(EVENTS.GAME_WON);
      return;
    }

    const waveDef = WAVE_DEFS[this.currentWave - 1];
    this.waveTimer = waveDef.duration;
    this.isInWave = true;
    this.spawnAccumulators.clear();
    this.spawnedCounts.clear();

    waveDef.groups.forEach((_, i) => {
      this.spawnAccumulators.set(i, 0);
      this.spawnedCounts.set(i, 0);
    });

    EventBus.emit(EVENTS.WAVE_STARTED, this.currentWave, waveDef.isBossWave);

    // Spawn boss
    if (waveDef.isBossWave && waveDef.bossType) {
      this.scene.time.delayedCall(2000, () => {
        this.spawnBoss(waveDef.bossType!, waveDef.bossHP);
      });
    }
  }

  private endWave(): void {
    this.isInWave = false;
    this.interWaveTimer = INTER_WAVE_PAUSE;
  }

  private spawnEnemies(waveDef: WaveDef, delta: number): void {
    const activeCount = this.enemyGroup.countActive(true);
    if (activeCount >= MAX_ENEMIES) return;

    waveDef.groups.forEach((group, i) => {
      const spawned = this.spawnedCounts.get(i) ?? 0;
      if (spawned >= group.count) return;

      const delay = group.delay ?? 0;
      const elapsed = waveDef.duration - this.waveTimer;
      if (elapsed < delay) return;

      let accum = this.spawnAccumulators.get(i) ?? 0;
      accum += group.spawnRate * (delta / 1000);
      const toSpawn = Math.floor(accum);
      this.spawnAccumulators.set(i, accum - toSpawn);

      for (let j = 0; j < toSpawn && spawned + j < group.count; j++) {
        if (this.enemyGroup.countActive(true) >= MAX_ENEMIES) break;
        this.spawnEnemy(group.type);
        this.spawnedCounts.set(i, (this.spawnedCounts.get(i) ?? 0) + 1);
      }
    });
  }

  public spawnEnemy(type: EnemyType, x?: number, y?: number, forceElite = false): Enemy | null {
    const enemy = this.enemyGroup.getFirstDead(false) as Enemy | null;
    if (!enemy) return null;

    if (x === undefined || y === undefined) {
      const pos = this.getSpawnPosition();
      x = pos.x;
      y = pos.y;
    }

    // 2% chance to be elite (increases with wave), or forced
    const eliteChance = 0.02 + this.currentWave * 0.005;
    const isElite = forceElite || (Math.random() < eliteChance);

    enemy.body!.enable = true;
    enemy.init(type, x, y, this.currentWave, undefined, isElite);
    return enemy;
  }

  private spawnBoss(type: EnemyType, hpOverride?: number): void {
    const pos = this.getSpawnPosition();
    const enemy = this.enemyGroup.getFirstDead(false) as Enemy | null;
    if (!enemy) return;

    enemy.body!.enable = true;
    enemy.init(type, pos.x, pos.y, this.currentWave, hpOverride);
    EventBus.emit(EVENTS.BOSS_SPAWNED, type);
  }

  private getSpawnPosition(): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: this.player.x + Math.cos(angle) * SPAWN_RING_RADIUS,
      y: this.player.y + Math.sin(angle) * SPAWN_RING_RADIUS,
    };
  }

  private getBackgroundEnemyTypes(): EnemyType[] {
    const wave = this.currentWave;
    if (wave <= 1) return [EnemyType.SHAMBLER];
    if (wave <= 3) return [EnemyType.SHAMBLER, EnemyType.SWARMER];
    if (wave <= 6) return [EnemyType.SHAMBLER, EnemyType.SWARMER, EnemyType.SPRINTER, EnemyType.BOMBER];
    if (wave <= 10) return [EnemyType.SHAMBLER, EnemyType.SWARMER, EnemyType.SPRINTER, EnemyType.SPITTER, EnemyType.PHANTOM];
    return [EnemyType.SHAMBLER, EnemyType.SWARMER, EnemyType.SPRINTER, EnemyType.SPITTER, EnemyType.SPLITTER, EnemyType.PHANTOM, EnemyType.BOMBER, EnemyType.LEAPER];
  }

  // ─── Swarm Rush ────────────────────────────────────────────────────
  private updateSwarmRush(delta: number): void {
    if (this.isSwarmActive) {
      this.swarmTimer -= delta;
      // Burst spawn from one direction during swarm
      const spawnCount = Math.ceil(6 * (delta / 1000)); // ~6 per second
      for (let i = 0; i < spawnCount; i++) {
        if (this.enemyGroup.countActive(true) >= MAX_ENEMIES) break;
        const spread = (Math.random() - 0.5) * 0.8;
        const angle = this.swarmAngle + spread;
        const x = this.player.x + Math.cos(angle) * SPAWN_RING_RADIUS;
        const y = this.player.y + Math.sin(angle) * SPAWN_RING_RADIUS;
        const types = [EnemyType.SWARMER, EnemyType.SWARMER, EnemyType.SPRINTER];
        const type = types[Math.floor(Math.random() * types.length)];
        this.spawnEnemy(type, x, y);
      }
      if (this.swarmTimer <= 0) {
        this.isSwarmActive = false;
      }
      return;
    }

    this.swarmRushTimer -= delta;
    if (this.swarmRushTimer <= 0) {
      this.triggerSwarmRush();
      // Next swarm in 60-90s
      this.swarmRushTimer = 60000 + Math.random() * 30000;
    }
  }

  private triggerSwarmRush(): void {
    this.isSwarmActive = true;
    this.swarmTimer = 8000 + Math.random() * 4000; // 8-12s duration
    this.swarmAngle = Math.random() * Math.PI * 2;
    EventBus.emit(EVENTS.SWARM_INCOMING);
  }

  public getCurrentWave(): number { return this.currentWave; }
  public getWaveTimer(): number { return this.waveTimer; }
  public isWaveActive(): boolean { return this.isInWave; }
  public isComplete(): boolean { return this.allWavesComplete; }
}
