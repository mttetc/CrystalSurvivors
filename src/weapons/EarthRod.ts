import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, SPRITE_SCALE } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';

export class EarthRod extends BaseWeapon {
  private damageTimer = 0;
  private auraSprite: Phaser.GameObjects.Sprite | null = null;
  private auraAnimTimer = 0;
  private auraFrame = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.EARTH_ROD);
  }

  public update(time: number, delta: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    const radius = this.getEffectiveRadius() || 35;
    const tickInterval = stats.cooldown ?? 500;
    const aoeScale = this.getAoeScale();

    // Persistent aura using magic circle sprite
    if (!this.auraSprite) {
      this.auraSprite = this.scene.add.sprite(this.player.x, this.player.y, 'fx_circle_orange', 0);
      this.auraSprite.setDepth(DEPTHS.EFFECTS - 1);
      this.auraSprite.setAlpha(0.4);
      this.auraSprite.setTint(0x8B6513);
    }

    // Update aura position and animate
    const visualRadius = radius * aoeScale;
    const auraScale = (visualRadius / 16) * SPRITE_SCALE;
    this.auraSprite.setPosition(this.player.x, this.player.y);
    this.auraSprite.setScale(auraScale);

    this.auraAnimTimer += delta;
    if (this.auraAnimTimer >= 200) {
      this.auraAnimTimer = 0;
      this.auraFrame = (this.auraFrame + 1) % 4;
      this.auraSprite.setFrame(this.auraFrame);
    }

    // Accumulate damage timer
    this.damageTimer += delta;
    if (this.damageTimer < tickInterval) return;
    this.damageTimer -= tickInterval;

    // Gentle repulsion
    const pushForce = 30 * SPRITE_SCALE;
    const children = enemies.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0 && dist <= radius) {
        const strength = pushForce * (1 - dist / radius);
        enemy.x += (dx / dist) * strength * (delta / 1000);
        enemy.y += (dy / dist) * strength * (delta / 1000);
      }
    }

    // Deal damage
    const damage = this.getDamage();
    const enchant = this.getEnchant();

    for (const enemy of children) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist <= radius) {
        enemy.takeDamage(damage);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage, enchant.id, enchant.tier, this.id);
      }
    }

    // Pulse visual — rock spike FX on damage tick
    const pulse = this.scene.add.sprite(this.player.x, this.player.y, 'fx_rock', 0);
    pulse.setDepth(DEPTHS.EFFECTS);
    pulse.setScale(aoeScale * 2);
    pulse.setTint(0x8B4513);
    pulse.setAlpha(0.6);

    let pFrame = 0;
    const pulseAnim = this.scene.time.addEvent({
      delay: 50,
      repeat: 5,
      callback: () => {
        pFrame++;
        if (pulse.active) pulse.setFrame(Math.min(pFrame, 13));
      },
    });

    this.scene.tweens.add({
      targets: pulse,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => { pulseAnim.destroy(); pulse.destroy(); },
    });
  }

  protected fire(): void {
    // EarthRod doesn't use the fire() cooldown pattern
  }

  public destroy(): void {
    if (this.auraSprite) {
      this.auraSprite.destroy();
      this.auraSprite = null;
    }
  }
}
