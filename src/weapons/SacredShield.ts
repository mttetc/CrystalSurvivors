import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, KNOCKBACK_VELOCITY, SPRITE_SCALE } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';

export class SacredShield extends BaseWeapon {
  private bashSide = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.SACRED_SHIELD);
  }

  protected fire(_time: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    const hitRadius = this.getEffectiveRadius();
    const meleeScale = this.getMeleeScale();
    const damage = this.getDamage();
    const enchant = this.getEnchant();
    const bashCount = stats.count ?? 1;

    const target = this.findNearestEnemy(enemies, hitRadius + 20 * SPRITE_SCALE);
    let baseAngle: number;
    if (target) {
      baseAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    } else {
      this.bashSide++;
      baseAngle = (this.bashSide % 4) * (Math.PI / 2);
    }

    for (let b = 0; b < bashCount; b++) {
      const bashOffset = b * Math.PI;
      const bashAngle = baseAngle + bashOffset;
      const visualRadius = hitRadius * meleeScale;
      const bashDist = visualRadius * 0.7;
      const endX = this.player.x + Math.cos(bashAngle) * bashDist;
      const endY = this.player.y + Math.sin(bashAngle) * bashDist;

      // Shield sprite thrust forward
      const shield = this.scene.add.image(this.player.x, this.player.y, 'weapon_shield');
      shield.setScale(2.2 * meleeScale);
      shield.setDepth(DEPTHS.EFFECTS);
      shield.setRotation(bashAngle + Math.PI / 2);
      shield.setAlpha(1);

      this.scene.tweens.add({
        targets: shield,
        x: endX,
        y: endY,
        scaleX: 2.8 * meleeScale,
        scaleY: 2.8 * meleeScale,
        duration: 100,
        ease: 'Back.easeOut',
        onComplete: () => {
          // White impact flash on shield
          shield.setTint(0xFFFFFF);

          // Golden impact sparks at bash point
          for (let i = 0; i < 4; i++) {
            const spark = this.scene.add.image(endX, endY, 'shield_spark');
            spark.setDepth(DEPTHS.EFFECTS + 1);
            spark.setScale(0.8);
            const spreadAngle = bashAngle + (Math.random() - 0.5) * 1.2;
            const spreadDist = (8 + Math.random() * 12) * SPRITE_SCALE;

            this.scene.tweens.add({
              targets: spark,
              x: endX + Math.cos(spreadAngle) * spreadDist,
              y: endY + Math.sin(spreadAngle) * spreadDist,
              alpha: 0,
              scaleX: 0.2,
              scaleY: 0.2,
              duration: 180 + Math.random() * 100,
              ease: 'Power2',
              onComplete: () => spark.destroy(),
            });
          }

          // Golden additive glow on impact
          const impactGlow = this.scene.add.graphics();
          impactGlow.setBlendMode(Phaser.BlendModes.ADD);
          impactGlow.setDepth(DEPTHS.EFFECTS - 1);
          impactGlow.fillStyle(0xFFDD00, 0.35);
          impactGlow.fillCircle(endX, endY, 9 * SPRITE_SCALE * meleeScale);
          impactGlow.fillStyle(0xFFFFFF, 0.2);
          impactGlow.fillCircle(endX, endY, 5 * SPRITE_SCALE * meleeScale);

          this.scene.tweens.add({
            targets: impactGlow,
            alpha: 0,
            duration: 200,
            ease: 'Quad.easeOut',
            onComplete: () => impactGlow.destroy(),
          });

          // Retract shield
          this.scene.tweens.add({
            targets: shield,
            alpha: 0,
            scaleX: 1.5 * meleeScale,
            scaleY: 1.5 * meleeScale,
            duration: 150,
            ease: 'Power2',
            onComplete: () => shield.destroy(),
          });
        },
      });

      // Damage enemies in frontal cone
      const arcSpan = 1.0;
      const startAngle = bashAngle - arcSpan / 2;
      const children = enemies.getChildren() as Enemy[];
      for (const enemy of children) {
        if (!enemy.active) continue;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
        if (dist > hitRadius) continue;

        let enemyAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
        let relAngle = enemyAngle - startAngle;
        while (relAngle < -Math.PI) relAngle += Math.PI * 2;
        while (relAngle > Math.PI) relAngle -= Math.PI * 2;

        if (relAngle >= 0 && relAngle <= arcSpan) {
          enemy.takeDamage(damage);
          EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage, enchant.id, enchant.tier, this.id);

          // Knockback push
          const pushAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
          enemy.setVelocity(
            Math.cos(pushAngle) * KNOCKBACK_VELOCITY * 1.2,
            Math.sin(pushAngle) * KNOCKBACK_VELOCITY * 1.2,
          );
        }
      }
    }
  }
}
