import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, SPRITE_SCALE } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';

export class IronFists extends BaseWeapon {
  private swingAngle = 0;
  private lastPunchSide = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.IRON_FISTS);
  }

  protected fire(_time: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    const hitRadius = this.getEffectiveRadius();
    const meleeScale = this.getMeleeScale();
    const damage = this.getDamage();
    const enchant = this.getEnchant();
    const swingCount = stats.count ?? 1;

    const target = this.findNearestEnemy(enemies, hitRadius + 20 * SPRITE_SCALE);
    let baseAngle: number;
    if (target) {
      baseAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    } else {
      baseAngle = this.swingAngle;
      this.swingAngle += Math.PI * 0.75;
    }

    for (let s = 0; s < swingCount; s++) {
      // Alternate left/right fist with slight angle offset
      this.lastPunchSide = (this.lastPunchSide + 1) % 2;
      const sideOffset = (this.lastPunchSide === 0 ? -0.15 : 0.15) + s * Math.PI;
      const punchAngle = baseAngle + sideOffset;
      const sp = this.getSpawnPoint(punchAngle);
      const visualRadius = hitRadius * meleeScale;
      const endX = sp.x + Math.cos(punchAngle) * visualRadius;
      const endY = sp.y + Math.sin(punchAngle) * visualRadius;

      // Fist sprite punching outward
      const fist = this.scene.add.image(sp.x, sp.y, 'weapon_fist');
      fist.setScale(1.5 * meleeScale);
      fist.setDepth(DEPTHS.EFFECTS);
      fist.setRotation(punchAngle);
      fist.setAlpha(0.9);

      this.scene.tweens.add({
        targets: fist,
        x: endX,
        y: endY,
        scaleX: 2 * meleeScale,
        scaleY: 2 * meleeScale,
        duration: 80,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Impact flash at punch landing
          const impact = this.scene.add.graphics();
          impact.setDepth(DEPTHS.EFFECTS);
          impact.fillStyle(0xFFDD00, 0.6);
          impact.fillCircle(endX, endY, 6 * SPRITE_SCALE * meleeScale);
          impact.fillStyle(0xFFFFFF, 0.4);
          impact.fillCircle(endX, endY, 3 * SPRITE_SCALE * meleeScale);

          this.scene.tweens.add({
            targets: impact,
            alpha: 0,
            duration: 120,
            onComplete: () => impact.destroy(),
          });

          // Yellow additive glow on impact
          const impactGlow = this.scene.add.graphics();
          impactGlow.setBlendMode(Phaser.BlendModes.ADD);
          impactGlow.setDepth(DEPTHS.EFFECTS - 1);
          impactGlow.fillStyle(0xFFDD00, 0.3);
          impactGlow.fillCircle(endX, endY, 8 * SPRITE_SCALE * meleeScale);
          impactGlow.fillStyle(0xFFFF88, 0.2);
          impactGlow.fillCircle(endX, endY, 4 * SPRITE_SCALE * meleeScale);

          this.scene.tweens.add({
            targets: impactGlow,
            alpha: 0,
            duration: 180,
            ease: 'Quad.easeOut',
            onComplete: () => impactGlow.destroy(),
          });

          // Fist fades
          this.scene.tweens.add({
            targets: fist,
            alpha: 0,
            duration: 80,
            onComplete: () => fist.destroy(),
          });
        },
      });

      // Damage enemies in cone in front of punch (wide for fists)
      const arcSpan = 0.9;
      const startAngle = punchAngle - arcSpan / 2;
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
        }
      }
    }
  }
}
