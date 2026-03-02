import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, KNOCKBACK_VELOCITY, SPRITE_SCALE } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';
import { playImpactFX, playSlashFX, showWeaponInHand } from './fxHelper';

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

      // Show weapon in hand facing attack direction
      showWeaponInHand(this.scene, this.player, bashAngle, this.id, 250);

      // Player attack animation
      this.showAttackSprite(bashAngle);

      // Shield bash slash FX at bash point
      const fxScale = this.getMeleeFXScale();
      playSlashFX(this.scene, endX, endY, bashAngle, 'fx_slash', fxScale * 1.8, 0xFFDD00, 250);

      // Shield impact FX using golden magic shield sprite
      playImpactFX(this.scene, endX, endY, bashAngle, 'fx_shield_yellow', fxScale * 2.5, 0xFFDD00, 250);

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
