import { EventBus } from './EventBus';
import { EVENTS } from '../constants';

/**
 * SFX manager using Phaser-loaded audio files from Ninja Adventure.
 * Replaces procedural synthesis with real .wav sound effects.
 */
export class SFXManager {
  private scene: Phaser.Scene | null = null;
  private _volume = 0.4;
  private listeners: Array<{ event: string; fn: (...args: any[]) => void }> = [];

  constructor() {}

  /** Bind to a scene for audio access, and wire up EventBus listeners */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
    this.bindEvents();
  }

  get volume(): number { return this._volume; }
  set volume(v: number) { this._volume = Math.max(0, Math.min(1, v)); }

  private play(key: string, volume?: number): void {
    if (!this.scene || !this.scene.cache.audio.exists(key)) return;
    this.scene.sound.play(key, { volume: (volume ?? 1) * this._volume });
  }

  // ── Shoot (called manually by weapons) ──
  public playShoot(): void {
    this.play('sfx_launch', 0.3);
  }

  // ── Event bindings ──
  private bindEvents(): void {
    this.removeListeners();

    const bind = (event: string, fn: () => void) => {
      this.listeners.push({ event, fn });
      EventBus.on(event, fn);
    };

    bind(EVENTS.ENEMY_HIT, () => {
      const keys = ['sfx_hit1', 'sfx_hit2'];
      this.play(keys[Math.floor(Math.random() * keys.length)], 0.25);
    });

    bind(EVENTS.ENEMY_KILLED, () => {
      this.play('sfx_impact', 0.3);
    });

    bind(EVENTS.PLAYER_DAMAGE_TAKEN, () => {
      this.play('sfx_hit1', 0.5);
    });

    bind(EVENTS.LEVEL_UP, () => {
      this.play('sfx_level_up', 0.6);
    });

    bind(EVENTS.WAVE_STARTED, () => {
      this.play('sfx_alert', 0.5);
    });

    bind(EVENTS.BOSS_SPAWNED, () => {
      this.play('sfx_alert', 0.7);
    });

    bind(EVENTS.CHEST_COLLECTED, () => {
      this.play('sfx_gold', 0.5);
    });

    bind(EVENTS.ENHANCEMENT_PICKED, () => {
      this.play('sfx_powerup', 0.5);
    });

    bind(EVENTS.WEAPON_ADDED, () => {
      this.play('sfx_success', 0.5);
    });

    bind(EVENTS.ELITE_KILLED, () => {
      this.play('sfx_explosion', 0.5);
    });
  }

  private removeListeners(): void {
    for (const { event, fn } of this.listeners) {
      EventBus.off(event, fn);
    }
    this.listeners = [];
  }

  public destroy(): void {
    this.removeListeners();
    this.scene = null;
  }
}
