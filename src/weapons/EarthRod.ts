import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';

export class EarthRod extends BaseWeapon {
  private damageTimer = 0;
  private auraGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.EARTH_ROD);
  }

  public update(time: number, delta: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    const radius = this.getEffectiveRadius() || 35;
    const tickInterval = stats.cooldown ?? 500;
    const aoeScale = this.getAoeScale();

    // Draw persistent aura visual
    if (!this.auraGraphics) {
      this.auraGraphics = this.scene.add.graphics();
      this.auraGraphics.setDepth(DEPTHS.EFFECTS - 1);
    }

    // Update aura position - brown-green earth aura
    this.auraGraphics.clear();
    const visualRadius = radius * aoeScale;
    this.auraGraphics.lineStyle(1, 0x8B4513, 0.3);
    this.auraGraphics.strokeCircle(this.player.x, this.player.y, visualRadius);
    this.auraGraphics.fillStyle(0x654321, 0.1);
    this.auraGraphics.fillCircle(this.player.x, this.player.y, visualRadius);

    // Accumulate damage timer
    this.damageTimer += delta;
    if (this.damageTimer < tickInterval) return;
    this.damageTimer -= tickInterval;

    // Deal damage to all enemies in radius
    const damage = this.getDamage();
    const enchant = this.getEnchant();
    const children = enemies.getChildren() as Enemy[];

    for (const enemy of children) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist <= radius) {
        enemy.takeDamage(damage);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage, enchant.id, enchant.tier, this.id);
      }
    }

    // Pulse visual on damage tick - earthy brown pulse
    const pulse = this.scene.add.graphics();
    pulse.setDepth(DEPTHS.EFFECTS);
    pulse.lineStyle(2, 0x8B4513, 0.5);
    pulse.strokeCircle(this.player.x, this.player.y, radius * aoeScale);

    this.scene.tweens.add({
      targets: pulse,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => pulse.destroy(),
    });
  }

  protected fire(): void {
    // EarthRod doesn't use the fire() cooldown pattern - it's always active via update()
  }

  public destroy(): void {
    if (this.auraGraphics) {
      this.auraGraphics.destroy();
      this.auraGraphics = null;
    }
  }
}
