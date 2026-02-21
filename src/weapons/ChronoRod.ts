import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, KNOCKBACK_VELOCITY } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';

export class ChronoRod extends BaseWeapon {
  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.CHRONO_ROD);
  }

  protected fire(_time: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    const radius = this.getEffectiveRadius() || 60;
    const damage = this.getDamage();
    const enchant = this.getEnchant();
    const aoeScale = this.getAoeScale();

    // Visual: expanding time distortion ring
    const ring = this.scene.add.sprite(this.player.x, this.player.y, 'nova_ring');
    ring.setDepth(DEPTHS.EFFECTS);
    ring.setAlpha(0.8);
    ring.setTint(0x9966FF);
    ring.setScale(0.5);

    this.scene.tweens.add({
      targets: ring,
      scaleX: (radius * aoeScale) / 8,
      scaleY: (radius * aoeScale) / 8,
      alpha: 0,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });

    // Inner glow ring
    const glow = this.scene.add.graphics();
    glow.setDepth(DEPTHS.EFFECTS);
    glow.lineStyle(3, 0xCC99FF, 0.6);
    glow.strokeCircle(this.player.x, this.player.y, radius * 0.3 * aoeScale);

    this.scene.tweens.add({
      targets: glow,
      alpha: 0,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => glow.destroy(),
    });

    // Damage and slow enemies in range
    const children = enemies.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist <= radius) {
        enemy.takeDamage(damage);

        // Apply slow effect: reduce velocity temporarily
        const origSpeed = enemy.body?.velocity.length() ?? 0;
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;

        // Light knockback
        enemy.setVelocity(
          (dx / d) * KNOCKBACK_VELOCITY * 0.5,
          (dy / d) * KNOCKBACK_VELOCITY * 0.5,
        );

        // Slow: tint enemy purple and reduce speed for 1.5 seconds
        enemy.setTint(0x9966FF);
        const slowMultiplier = 0.4;
        const enemyRef = enemy;
        this.scene.time.delayedCall(1500, () => {
          if (enemyRef.active) {
            enemyRef.clearTint();
          }
        });

        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage, enchant.id, enchant.tier, this.id);
      }
    }
  }
}
