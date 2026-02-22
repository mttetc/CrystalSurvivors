import Phaser from 'phaser';
import { WeaponId } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';

export class HolyRod extends BaseWeapon {
  private projectileGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, player: Player, projectileGroup: Phaser.Physics.Arcade.Group) {
    super(scene, player, WeaponId.HOLY_ROD);
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

      // Spread for multi-orb
      let angle = Math.atan2(dy, dx);
      if (count > 1) {
        const spread = 0.25;
        angle += (i - (count - 1) / 2) * spread;
      }

      const speed = stats.projectileSpeed ?? 200;
      const sp = this.getSpawnPoint(angle);

      proj.fire(
        sp.x, sp.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        'holy_orb',
        this.getDamage(),
        this.getEffectivePierce(),
        this.getEffectiveDamageRetention(),
        this.id,
        enchant.id,
        enchant.tier,
        2000,
      );
      proj.setScale(this.getProjectileScale());

      // Spinning rotation for boomerang visual
      this.scene.tweens.add({
        targets: proj,
        angle: 360 * 4,
        duration: 2000,
        repeat: 0,
      });

      // Boomerang: reverse velocity after 400ms to simulate return
      const projRef = proj;
      this.scene.time.delayedCall(400, () => {
        if (projRef.active) {
          const body = projRef.body as Phaser.Physics.Arcade.Body;
          body.setVelocity(-body.velocity.x, -body.velocity.y);
        }
      });
    }
  }
}
