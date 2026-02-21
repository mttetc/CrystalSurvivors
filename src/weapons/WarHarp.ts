import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';

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

    const target = this.findNearestEnemy(enemies, 300);
    if (!target) return;

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

      // Stun at level 3+
      if (level >= 3) {
        current.applyFreeze(300);
      }

      damage *= retention;

      // Find next target
      let nearest: Enemy | null = null;
      let nearestDist = 120; // chain range
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

    // Draw chain visual - smooth sound wave curves in golden color
    if (chainPoints.length >= 2) {
      const gfx = this.scene.add.graphics();
      gfx.setDepth(DEPTHS.EFFECTS);

      for (let i = 0; i < chainPoints.length - 1; i++) {
        const from = chainPoints[i];
        const to = chainPoints[i + 1];
        this.drawSoundWave(gfx, from.x, from.y, to.x, to.y);
      }

      this.scene.tweens.add({
        targets: gfx,
        alpha: 0,
        duration: 200,
        onComplete: () => gfx.destroy(),
      });
    }
  }

  private drawSoundWave(
    gfx: Phaser.GameObjects.Graphics,
    x1: number, y1: number,
    x2: number, y2: number,
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    // Perpendicular direction for wave oscillation
    const nx = -dy / dist;
    const ny = dx / dist;

    const segments = 16;
    const amplitude = 10;
    const frequency = 3; // number of wave cycles

    // Outer glow
    gfx.lineStyle(4, 0xFFDD88, 0.4);
    gfx.beginPath();
    gfx.moveTo(x1, y1);
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const baseX = x1 + dx * t;
      const baseY = y1 + dy * t;
      const wave = Math.sin(t * Math.PI * 2 * frequency) * amplitude * (1 - t * 0.5);
      gfx.lineTo(baseX + nx * wave, baseY + ny * wave);
    }
    gfx.stroke();

    // Primary wave
    gfx.lineStyle(2, 0xFFCC44, 0.9);
    gfx.beginPath();
    gfx.moveTo(x1, y1);
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const baseX = x1 + dx * t;
      const baseY = y1 + dy * t;
      const wave = Math.sin(t * Math.PI * 2 * frequency) * amplitude * (1 - t * 0.5);
      gfx.lineTo(baseX + nx * wave, baseY + ny * wave);
    }
    gfx.stroke();

    // Bright center line
    gfx.lineStyle(1, 0xFFFFFF, 0.6);
    gfx.beginPath();
    gfx.moveTo(x1, y1);
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const baseX = x1 + dx * t;
      const baseY = y1 + dy * t;
      const wave = Math.sin(t * Math.PI * 2 * frequency) * amplitude * 0.5 * (1 - t * 0.5);
      gfx.lineTo(baseX + nx * wave, baseY + ny * wave);
    }
    gfx.stroke();
  }
}
