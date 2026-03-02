import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, SPRITE_SCALE } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';
import { playImpactFX, showWeaponInHand } from './fxHelper';

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
      this.lastPunchSide = (this.lastPunchSide + 1) % 2;
      const sideOffset = (this.lastPunchSide === 0 ? -0.15 : 0.15) + s * Math.PI;
      const punchAngle = baseAngle + sideOffset;
      const sp = this.getSpawnPoint(punchAngle);
      const visualRadius = hitRadius * meleeScale;
      const endX = sp.x + Math.cos(punchAngle) * visualRadius;
      const endY = sp.y + Math.sin(punchAngle) * visualRadius;

      // Show weapon in hand facing attack direction
      showWeaponInHand(this.scene, this.player, punchAngle, this.id, 200);

      // Player attack animation
      this.showAttackSprite(punchAngle);

      // Alternate claw FX: single claw for left punch, double claw for right punch
      const clawFX = this.lastPunchSide === 0 ? 'fx_claw' : 'fx_claw_double';
      playImpactFX(this.scene, endX, endY, punchAngle, clawFX, this.getMeleeFXScale() * 1.5, 0xFFDD00, 200);

      // Damage enemies in cone
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
