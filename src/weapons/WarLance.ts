import Phaser from 'phaser';
import { WeaponId } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';

export class WarLance extends BaseWeapon {
  private projectileGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, player: Player, projectileGroup: Phaser.Physics.Arcade.Group) {
    super(scene, player, WeaponId.WAR_LANCE);
    this.projectileGroup = projectileGroup;
  }

  protected fire(_time: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    const target = this.findNearestEnemy(enemies);
    if (!target) return;

    const count = stats.count ?? 1;
    const enchant = this.getEnchant();

    for (let i = 0; i < count; i++) {
      const proj = this.projectileGroup.getFirstDead(false) as Projectile | null;
      if (!proj) break;

      const dx = target.x - this.player.x;
      const dy = target.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) break;

      // Minimal spread for multi-lance
      let angle = Math.atan2(dy, dx);
      if (count > 1) {
        const spread = 0.05; // minimal spread
        angle += (i - (count - 1) / 2) * spread;
      }

      const speed = stats.projectileSpeed ?? 160;

      proj.fire(
        this.player.x, this.player.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        'war_lance',
        this.getDamage(),
        this.getEffectivePierce(),
        this.getEffectiveDamageRetention(),
        this.id,
        enchant.id,
        enchant.tier,
        3000, // longer lifetime for slow projectile
      );
      proj.setScale(this.getProjectileScale());
    }
  }
}
