import Phaser from 'phaser';
import { WeaponId, EVENTS, SPRITE_SCALE } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';
import { playSlashFX, showWeaponInHand } from './fxHelper';

export interface MeleeConfig {
  /** Half-arc in radians on each side of the swing center (e.g. 0.4 for Katana = 0.8 total) */
  arcHalf: number;
  /** Extra radius added to getEffectiveRadius() for hit detection */
  extraRadiusOffset: number;
  /** Texture key for the slash FX sprite. Empty string to skip default slash FX. */
  slashFX: string;
  /** Multiplier applied to getMeleeFXScale() for slash size */
  slashScale: number;
  /** Color tint for the slash FX */
  slashTint: number;
  /** Duration in ms for the slash FX and weapon-in-hand display */
  slashDuration: number;
}

/**
 * Base class for melee weapons that swing in an arc and damage enemies within it.
 *
 * Subclasses must implement:
 *   - getMeleeConfig(): return the weapon-specific visual/arc configuration
 *
 * Subclasses may override:
 *   - onSwing(): add extra FX per swing (e.g. IronFists claw, SacredShield bash)
 *   - onHit(): add extra effects per enemy hit (e.g. SacredShield knockback)
 *   - getSwingAngle(): customize per-swing angle calculation (e.g. IronFists alternating sides)
 *   - getAutoSwingAngle(): customize the idle auto-swing rotation
 *   - getSwingSpawnPoint(): customize the FX spawn position
 */
export abstract class MeleeWeapon extends BaseWeapon {
  private autoSwingAngle = 0;

  protected abstract getMeleeConfig(): MeleeConfig;

  /**
   * Called after default slash FX and weapon-in-hand are shown for each swing.
   * Override to add weapon-specific visuals.
   */
  protected onSwing(
    _angle: number,
    _sp: { x: number; y: number },
    _swingIndex: number,
    _hitRadius: number,
  ): void {}

  /**
   * Called for each enemy hit within the arc.
   * Override to add weapon-specific effects like knockback.
   */
  protected onHit(_enemy: Enemy, _angle: number): void {}

  /**
   * Returns the angle for a given swing index. Override for custom per-swing angle logic
   * (e.g. IronFists alternating punch sides).
   * Default: baseAngle + swingIndex * PI
   */
  protected getSwingAngle(baseAngle: number, swingIndex: number): number {
    return baseAngle + swingIndex * Math.PI;
  }

  /**
   * Returns the next auto-swing angle when no target is found.
   * Default: increments by 0.75 * PI each fire.
   */
  protected getAutoSwingAngle(): number {
    const angle = this.autoSwingAngle;
    this.autoSwingAngle += Math.PI * 0.75;
    return angle;
  }

  /**
   * Returns the spawn point for slash FX. Override for custom positioning.
   * Default: uses BaseWeapon.getSpawnPoint(angle).
   */
  protected getSwingSpawnPoint(angle: number): { x: number; y: number } {
    return this.getSpawnPoint(angle);
  }

  protected fire(_time: number, enemies: Phaser.Physics.Arcade.Group): void {
    const config = this.getMeleeConfig();
    const stats = this.getStats();
    const hitRadius = this.getEffectiveRadius() + config.extraRadiusOffset;
    const damage = this.getDamage();
    const enchant = this.getEnchant();
    const swingCount = stats.count ?? 1;

    const target = this.findNearestEnemy(enemies, hitRadius + 20 * SPRITE_SCALE);
    let baseAngle: number;
    if (target) {
      baseAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    } else {
      baseAngle = this.getAutoSwingAngle();
    }

    for (let s = 0; s < swingCount; s++) {
      const swingAngle = this.getSwingAngle(baseAngle, s);
      const startAngle = swingAngle - config.arcHalf;
      const arcSpan = config.arcHalf * 2;

      const sp = this.getSwingSpawnPoint(swingAngle);

      // Slash FX (skipped when slashFX is empty -- weapon handles its own in onSwing)
      if (config.slashFX) {
        playSlashFX(
          this.scene, sp.x, sp.y, swingAngle,
          config.slashFX, this.getMeleeFXScale() * config.slashScale,
          config.slashTint, config.slashDuration,
        );
      }

      // Show weapon in hand facing attack direction
      showWeaponInHand(this.scene, this.player, swingAngle, this.id, config.slashDuration);

      // Player attack animation
      this.showAttackSprite(swingAngle);

      // Hook for weapon-specific per-swing FX
      this.onSwing(swingAngle, sp, s, hitRadius);

      // Damage enemies in the arc
      const children = enemies.getChildren() as Enemy[];
      for (const enemy of children) {
        if (!enemy.active) continue;
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y, enemy.x, enemy.y,
        );
        if (dist > hitRadius) continue;

        let enemyAngle = Math.atan2(
          enemy.y - this.player.y, enemy.x - this.player.x,
        );
        let relAngle = enemyAngle - startAngle;
        while (relAngle < -Math.PI) relAngle += Math.PI * 2;
        while (relAngle > Math.PI) relAngle -= Math.PI * 2;

        if (relAngle >= 0 && relAngle <= arcSpan) {
          enemy.takeDamage(damage);
          EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage, enchant.id, enchant.tier, this.id);
          this.onHit(enemy, swingAngle);
        }
      }
    }
  }
}
