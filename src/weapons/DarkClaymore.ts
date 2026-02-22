import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, SPRITE_SCALE } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';

export class DarkClaymore extends BaseWeapon {
  private swingAngle = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.DARK_CLAYMORE);
  }

  protected fire(_time: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    const hitRadius = this.getEffectiveRadius() + 5;
    const meleeScale = this.getMeleeScale();
    const visualRadius = hitRadius * meleeScale;
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
      const swingOffset = s * Math.PI;
      const startAngle = baseAngle + swingOffset - 0.5;
      const endAngle = baseAngle + swingOffset + 0.5;
      const arcSpan = endAngle - startAngle;

      const sp = this.getSpawnPoint(baseAngle + swingOffset);

      // Animated sword sprite swinging through the arc
      const blade = this.scene.add.image(sp.x, sp.y, 'weapon_claymore');
      blade.setOrigin(0, 0.5);
      blade.setRotation(startAngle);
      blade.setScale(2 * meleeScale);
      blade.setDepth(DEPTHS.EFFECTS);

      this.scene.tweens.add({
        targets: blade,
        rotation: endAngle,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          this.scene.tweens.add({
            targets: blade,
            alpha: 0,
            duration: 100,
            onComplete: () => blade.destroy(),
          });
        },
      });

      // Dark slash trail
      const trail = this.scene.add.graphics();
      trail.setDepth(DEPTHS.EFFECTS - 1);
      trail.fillStyle(0x8B0000, 0.35);
      trail.slice(sp.x, sp.y, visualRadius, startAngle, endAngle, false);
      trail.fillPath();
      trail.fillStyle(0xFF2222, 0.15);
      trail.slice(sp.x, sp.y, visualRadius * 0.6, startAngle, endAngle, false);
      trail.fillPath();

      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: () => trail.destroy(),
      });

      // Dark red additive glow on the slash trail
      const trailGlow = this.scene.add.graphics();
      trailGlow.setBlendMode(Phaser.BlendModes.ADD);
      trailGlow.setDepth(DEPTHS.EFFECTS - 2);
      trailGlow.fillStyle(0x8B0000, 0.25);
      trailGlow.slice(sp.x, sp.y, visualRadius * 0.95, startAngle, endAngle, false);
      trailGlow.fillPath();
      trailGlow.fillStyle(0xFF2222, 0.15);
      trailGlow.slice(sp.x, sp.y, visualRadius * 0.5, startAngle, endAngle, false);
      trailGlow.fillPath();

      this.scene.tweens.add({
        targets: trailGlow,
        alpha: 0,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => trailGlow.destroy(),
      });

      // Damage enemies in the arc
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
