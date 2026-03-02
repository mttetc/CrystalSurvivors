import Phaser from 'phaser';
import { WeaponId } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { playSlashFX, showWeaponInHand } from './fxHelper';

export class WarLance extends BaseWeapon {
  private projectileGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, player: Player, projectileGroup: Phaser.Physics.Arcade.Group) {
    super(scene, player, WeaponId.WAR_LANCE);
    this.projectileGroup = projectileGroup;
  }

  protected fire(_time: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    const target = this.findNearestEnemy(enemies);
    if (!target) return;

    const count = stats.count ?? 1;
    const enchant = this.getEnchant();

    // Base angle toward target for weapon-in-hand display
    const baseAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    const meleeScale = this.getMeleeScale();

    // Show lance in hand facing target
    showWeaponInHand(this.scene, this.player, baseAngle, this.id, 250);

    // Thrust cut FX at spawn point
    const thrustSp = this.getSpawnPoint(baseAngle);
    playSlashFX(this.scene, thrustSp.x, thrustSp.y, baseAngle, 'fx_cut', this.getMeleeFXScale() * 1.6, 0x8888FF, 200);

    for (let i = 0; i < count; i++) {
      const proj = this.projectileGroup.getFirstDead(false) as Projectile | null;
      if (!proj) break;

      const dx = target.x - this.player.x;
      const dy = target.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) break;

      // Minimal spread for multi-lance
      let angle = Math.atan2(dy, dx);
      if (count > 1) {
        const spread = 0.05; // minimal spread
        angle += (i - (count - 1) / 2) * spread;
      }

      const speed = stats.projectileSpeed ?? 160;
      const sp = this.getSpawnPoint(angle);

      proj.fire(
        sp.x, sp.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        'item_lance',
        this.getDamage(),
        this.getEffectivePierce(),
        this.getEffectiveDamageRetention(),
        this.id,
        enchant.id,
        enchant.tier,
        3000, // longer lifetime for slow projectile
      );
      proj.setScale(this.getProjectileScale());
    }
  }
}
