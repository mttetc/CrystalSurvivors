import Phaser from 'phaser';
import { WeaponId } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';

export class Shuriken extends BaseWeapon {
  private projectileGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, player: Player, projectileGroup: Phaser.Physics.Arcade.Group) {
    super(scene, player, WeaponId.SHURIKEN);
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

      // Spread for multi-shot
      let angle = Math.atan2(dy, dx);
      if (count > 1) {
        const spread = 0.3;
        angle += (i - (count - 1) / 2) * spread;
      }

      const speed = stats.projectileSpeed ?? 220;
      const sp = this.getSpawnPoint(angle);
      proj.fire(
        sp.x, sp.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        'shuriken',
        this.getDamage(),
        this.getEffectivePierce(),
        this.getEffectiveDamageRetention(),
        this.id,
        enchant.id,
        enchant.tier,
        1500,
      );
      proj.setScale(this.getProjectileScale());

      // Add spinning rotation via a tween
      this.scene.tweens.add({
        targets: proj,
        angle: 360 * 4,
        duration: 1500,
        repeat: 0,
      });

      // Boomerang: after 750ms, reverse velocity to come back
      const playerRef = this.player;
      this.scene.time.delayedCall(750, () => {
        if (!proj.active) return;
        // Clear hit list so shuriken damages on the return trip too
        proj.resetHitEnemies();
        const bx = playerRef.x - proj.x;
        const by = playerRef.y - proj.y;
        const bd = Math.sqrt(bx * bx + by * by) || 1;
        const returnSpeed = speed * 1.2;
        proj.setVelocity(
          (bx / bd) * returnSpeed,
          (by / bd) * returnSpeed,
        );
      });
    }
  }
}
