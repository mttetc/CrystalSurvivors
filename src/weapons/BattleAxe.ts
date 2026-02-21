import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';

export class BattleAxe extends BaseWeapon {
  private swingAngle = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.BATTLE_AXE);
  }

  protected fire(_time: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    const hitRadius = this.getEffectiveRadius() + 10;
    const meleeScale = this.getMeleeScale();
    const visualRadius = hitRadius * meleeScale;
    const damage = this.getDamage();
    const enchant = this.getEnchant();
    const swingCount = stats.count ?? 1;

    const target = this.findNearestEnemy(enemies, hitRadius + 20);
    let baseAngle: number;
    if (target) {
      baseAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    } else {
      baseAngle = this.swingAngle;
      this.swingAngle += Math.PI * 0.75;
    }

    for (let s = 0; s < swingCount; s++) {
      const swingOffset = s * Math.PI;
      const startAngle = baseAngle + swingOffset - 0.6;
      const endAngle = baseAngle + swingOffset + 0.6;
      const arcSpan = endAngle - startAngle;

      // Heavy axe swinging through wide arc
      const axe = this.scene.add.image(this.player.x, this.player.y, 'weapon_axe');
      axe.setOrigin(0, 0.5);
      axe.setRotation(startAngle);
      axe.setScale(2 * meleeScale);
      axe.setDepth(DEPTHS.EFFECTS);

      this.scene.tweens.add({
        targets: axe,
        rotation: endAngle,
        duration: 250,
        ease: 'Power2',
        onComplete: () => {
          this.scene.tweens.add({
            targets: axe,
            alpha: 0,
            duration: 120,
            onComplete: () => axe.destroy(),
          });
        },
      });

      // Orange-red slash trail (wide)
      const trail = this.scene.add.graphics();
      trail.setDepth(DEPTHS.EFFECTS - 1);
      trail.fillStyle(0xFF4400, 0.35);
      trail.slice(this.player.x, this.player.y, visualRadius, startAngle, endAngle, false);
      trail.fillPath();
      trail.fillStyle(0xFF8844, 0.15);
      trail.slice(this.player.x, this.player.y, visualRadius * 0.5, startAngle, endAngle, false);
      trail.fillPath();

      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => trail.destroy(),
      });

      // Orange additive glow on the slash trail
      const trailGlow = this.scene.add.graphics();
      trailGlow.setBlendMode(Phaser.BlendModes.ADD);
      trailGlow.setDepth(DEPTHS.EFFECTS - 2);
      trailGlow.fillStyle(0xFF4400, 0.25);
      trailGlow.slice(this.player.x, this.player.y, visualRadius * 1.1, startAngle, endAngle, false);
      trailGlow.fillPath();
      trailGlow.fillStyle(0xFF8844, 0.15);
      trailGlow.slice(this.player.x, this.player.y, visualRadius * 0.5, startAngle, endAngle, false);
      trailGlow.fillPath();

      this.scene.tweens.add({
        targets: trailGlow,
        alpha: 0,
        duration: 400,
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
