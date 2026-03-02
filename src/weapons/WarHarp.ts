import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, SPRITE_SCALE } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';
import { playSlashFX, showWeaponInHand } from './fxHelper';

export class WarHarp extends BaseWeapon {
  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.WAR_HARP);
  }

  protected fire(_time: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    const maxChains = stats.count ?? 2;
    const retention = stats.damageRetention ?? 0.8;
    let damage = this.getDamage();
    const enchant = this.getEnchant();
    const level = this.player.getWeapon(this.id)?.level ?? 1;

    const target = this.findNearestEnemy(enemies, 300 * SPRITE_SCALE);
    if (!target) return;

    // Show harp in hand facing target
    const baseAngle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    const meleeScale = this.getMeleeScale();
    showWeaponInHand(this.scene, this.player, baseAngle, this.id, 300);

    // Strum slash FX at player position
    const sp = this.getSpawnPoint(baseAngle);
    playSlashFX(this.scene, sp.x, sp.y, baseAngle, 'fx_slash_double', this.getMeleeFXScale() * 1.6, 0xFFCC44, 250);

    const hit: Set<Enemy> = new Set();
    let current: Enemy = target;
    const chainPoints: { x: number; y: number }[] = [{ x: this.player.x, y: this.player.y }];

    for (let i = 0; i <= maxChains && current; i++) {
      if (hit.has(current)) break;
      hit.add(current);

      chainPoints.push({ x: current.x, y: current.y });
      const dmg = Math.floor(damage);
      current.takeDamage(dmg, false);
      EventBus.emit(EVENTS.ENEMY_HIT, current, dmg, enchant.id, enchant.tier, this.id);

      if (level >= 3) {
        current.applyFreeze(300);
      }

      damage *= retention;

      let nearest: Enemy | null = null;
      let nearestDist = 120 * SPRITE_SCALE;
      const children = enemies.getChildren() as Enemy[];
      for (const enemy of children) {
        if (!enemy.active || hit.has(enemy)) continue;
        const dist = Phaser.Math.Distance.Between(current.x, current.y, enemy.x, enemy.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = enemy;
        }
      }
      current = nearest!;
    }

    // Draw chain visual using spark sprites along the chain path
    if (chainPoints.length >= 2) {
      for (let i = 0; i < chainPoints.length - 1; i++) {
        const from = chainPoints[i];
        const to = chainPoints[i + 1];
        this.drawChainSprites(from.x, from.y, to.x, to.y);
      }
    }
  }

  private drawChainSprites(x1: number, y1: number, x2: number, y2: number): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const angle = Math.atan2(dy, dx);
    const steps = Math.max(3, Math.floor(dist / (20 * SPRITE_SCALE)));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const nx = -dy / dist;
      const ny = dx / dist;
      const wave = Math.sin(t * Math.PI * 3) * 8 * SPRITE_SCALE * (1 - t * 0.5);
      const px = x1 + dx * t + nx * wave;
      const py = y1 + dy * t + ny * wave;

      const spark = this.scene.add.sprite(px, py, 'fx_spark', Math.floor(Math.random() * 4));
      spark.setDepth(DEPTHS.EFFECTS);
      spark.setScale(0.8);
      spark.setTint(0xFFCC44);
      spark.setAlpha(0.8 - t * 0.4);

      this.scene.tweens.add({
        targets: spark,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 200 + t * 100,
        onComplete: () => spark.destroy(),
      });
    }
  }
}
