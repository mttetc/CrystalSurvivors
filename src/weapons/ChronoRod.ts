import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, KNOCKBACK_VELOCITY, SPRITE_SCALE } from '../constants';
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

    // Visual: expanding time distortion ring using magic circle sprite
    const ring = this.scene.add.sprite(this.player.x, this.player.y, 'fx_circle_white', 0);
    ring.setDepth(DEPTHS.EFFECTS);
    ring.setAlpha(0.8);
    ring.setTint(0x9966FF);
    ring.setScale(0.5);

    // Animate frames
    let ringFrame = 0;
    const ringAnim = this.scene.time.addEvent({
      delay: 80,
      repeat: 3,
      callback: () => {
        ringFrame++;
        if (ring.active) ring.setFrame(Math.min(ringFrame, 3));
      },
    });

    this.scene.tweens.add({
      targets: ring,
      scaleX: (radius * aoeScale) / 8,
      scaleY: (radius * aoeScale) / 8,
      alpha: 0,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => { ringAnim.destroy(); ring.destroy(); },
    });

    // Inner spirit FX
    const spirit = this.scene.add.sprite(this.player.x, this.player.y, 'fx_spirit_blue', 0);
    spirit.setDepth(DEPTHS.EFFECTS);
    spirit.setAlpha(0.6);
    spirit.setTint(0xCC99FF);
    spirit.setScale(aoeScale * 1.5);

    let sFrame = 0;
    const spiritAnim = this.scene.time.addEvent({
      delay: 80,
      repeat: 4,
      callback: () => {
        sFrame++;
        if (spirit.active) spirit.setFrame(Math.min(sFrame, 4));
      },
    });

    this.scene.tweens.add({
      targets: spirit,
      alpha: 0,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => { spiritAnim.destroy(); spirit.destroy(); },
    });

    // Damage and slow enemies in range
    const children = enemies.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist <= radius) {
        enemy.takeDamage(damage);

        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;

        enemy.setVelocity(
          (dx / d) * KNOCKBACK_VELOCITY * 0.5,
          (dy / d) * KNOCKBACK_VELOCITY * 0.5,
        );

        // Slow: tint enemy purple for 1.5 seconds
        enemy.setTint(0x9966FF);
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
