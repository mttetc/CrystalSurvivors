import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, SPRITE_SCALE } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';
import { playSlashFX, showWeaponInHand } from './fxHelper';

export class Katana extends BaseWeapon {
  private swingAngle = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.KATANA);
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
      const swingOffset = s * Math.PI;
      const startAngle = baseAngle + swingOffset - 0.4;
      const endAngle = baseAngle + swingOffset + 0.4;
      const arcSpan = endAngle - startAngle;

      const sp = this.getSpawnPoint(baseAngle + swingOffset);

      // Fast katana slash FX
      playSlashFX(this.scene, sp.x, sp.y, baseAngle + swingOffset, 'fx_slash_curved', this.getMeleeFXScale() * 1.8, 0x44FFCC, 200);

      // Show weapon in hand facing attack direction
      showWeaponInHand(this.scene, this.player, baseAngle + swingOffset, this.id, 200);

      // Player attack animation
      this.showAttackSprite(baseAngle + swingOffset);

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
