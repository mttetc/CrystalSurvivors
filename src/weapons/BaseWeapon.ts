import Phaser from 'phaser';
import { WeaponId, EnchantId, SPRITE_SCALE } from '../constants';
import { WeaponLevelStats } from '../types';
import { WEAPON_DEFS } from '../data/weapons';
import { ENCHANT_DEFS } from '../data/enchants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export abstract class BaseWeapon {
  protected scene: Phaser.Scene;
  protected player: Player;
  public id: WeaponId;
  protected cooldownTimer = 0;

  constructor(scene: Phaser.Scene, player: Player, id: WeaponId) {
    this.scene = scene;
    this.player = player;
    this.id = id;
  }

  public getStats(): WeaponLevelStats {
    const weapon = this.player.getWeapon(this.id);
    const level = weapon ? weapon.level : 1;
    return WEAPON_DEFS[this.id].levels[level - 1];
  }

  public getEnchant(): { id: EnchantId | null; tier: number } {
    const weapon = this.player.getWeapon(this.id);
    return { id: weapon?.enchant ?? null, tier: weapon?.enchantTier ?? 0 };
  }

  public getCooldown(): number {
    return this.getStats().cooldown * this.player.getEffectiveCooldownMultiplier();
  }

  public getDamage(): number {
    return Math.floor(this.getStats().damage * this.player.getEffectiveDamageMultiplier());
  }

  /** Get effective radius/range, scaled by rangeMultiplier */
  public getEffectiveRadius(): number {
    const baseRadius = this.getStats().radius ?? 0;
    return baseRadius * this.player.playerState.modifiers.rangeMultiplier;
  }

  /** Get projectile scale multiplier for visual scaling */
  public getProjectileScale(): number {
    return this.player.playerState.modifiers.projectileScaleMultiplier;
  }

  /** Get melee scale multiplier for visual scaling */
  public getMeleeScale(): number {
    return this.player.playerState.modifiers.meleeScaleMultiplier;
  }

  /** Get AoE scale multiplier for visual scaling */
  public getAoeScale(): number {
    return this.player.playerState.modifiers.aoeScaleMultiplier;
  }

  /** Get base pierce + piercing enchant bonus */
  public getEffectivePierce(): number {
    const basePierce = this.getStats().pierce ?? 0;
    const enchant = this.getEnchant();
    if (enchant.id === EnchantId.PIERCING && enchant.tier > 0) {
      const tier = ENCHANT_DEFS[EnchantId.PIERCING].tiers[enchant.tier - 1];
      return basePierce + (tier?.bonusPierce ?? 0);
    }
    return basePierce;
  }

  /** Get damage retention (from piercing enchant or default 1.0) */
  public getEffectiveDamageRetention(): number {
    const enchant = this.getEnchant();
    if (enchant.id === EnchantId.PIERCING && enchant.tier > 0) {
      const tier = ENCHANT_DEFS[EnchantId.PIERCING].tiers[enchant.tier - 1];
      return tier?.damageRetention ?? 1;
    }
    return 1;
  }

  public update(time: number, delta: number, enemies: Phaser.Physics.Arcade.Group): void {
    this.cooldownTimer -= delta;
    if (this.cooldownTimer <= 0) {
      this.cooldownTimer = this.getCooldown();
      this.fire(time, enemies);
    }
  }

  /** Reset cooldown so weapon fires immediately on next update */
  public resetCooldown(): void {
    this.cooldownTimer = 0;
  }

  /** Offset spawn point away from player center in the given direction */
  protected getSpawnPoint(angle: number): { x: number; y: number } {
    const offset = 12 * SPRITE_SCALE;
    return {
      x: this.player.x + Math.cos(angle) * offset,
      y: this.player.y + Math.sin(angle) * offset,
    };
  }

  protected abstract fire(time: number, enemies: Phaser.Physics.Arcade.Group): void;

  protected findNearestEnemy(enemies: Phaser.Physics.Arcade.Group, maxRange = 400 * SPRITE_SCALE): Enemy | null {
    let nearest: Enemy | null = null;
    let nearestDist = maxRange;

    const children = enemies.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  protected findEnemiesInRange(enemies: Phaser.Physics.Arcade.Group, range: number): Enemy[] {
    const result: Enemy[] = [];
    const children = enemies.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist <= range) {
        result.push(enemy);
      }
    }
    return result;
  }
}
