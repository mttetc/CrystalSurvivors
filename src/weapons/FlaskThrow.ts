import Phaser from 'phaser';
import { WeaponId, DEPTHS, EVENTS, KNOCKBACK_VELOCITY, SPRITE_SCALE } from '../constants';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from '../systems/EventBus';

export class FlaskThrow extends BaseWeapon {
  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.FLASK_THROW);
  }

  protected fire(_time: number, enemies: Phaser.Physics.Arcade.Group): void {
    const stats = this.getStats();
    // Prefer melee/mid-range enemies (150*SS range) before falling back to longer range
    const preferredRange = 150 * SPRITE_SCALE;
    let target = this.findNearestEnemy(enemies, preferredRange);
    if (!target) target = this.findNearestEnemy(enemies, 300 * SPRITE_SCALE);
    if (!target) return;

    const count = stats.count ?? 1;
    const enchant = this.getEnchant();
    const aoeRadius = this.getEffectiveRadius() || 35;
    const damage = this.getDamage();

    // Determine weapon level for poison puddle check
    const weaponInst = this.player.getWeapon(this.id);
    const weaponLevel = weaponInst ? weaponInst.level : 1;

    // Filter to nearby enemies for multi-flask targeting
    const children = enemies.getChildren() as Enemy[];
    const activeEnemies = children.filter(e => {
      if (!e.active) return false;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      return d <= 300 * SPRITE_SCALE;
    });

    for (let i = 0; i < count; i++) {
      // Pick target: for multi-flask, pick different nearby enemies if available
      const t = activeEnemies[i % activeEnemies.length] || target;

      const throwAngle = Math.atan2(t.y - this.player.y, t.x - this.player.x);
      const sp = this.getSpawnPoint(throwAngle);
      const startX = sp.x;
      const startY = sp.y;
      const endX = t.x;
      const endY = t.y;
      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) continue;

      const flightDuration = Math.min(800, Math.max(400, dist * 2.5));
      const arcHeight = Math.min(80 * SPRITE_SCALE, dist * 0.35);

      // --- Flask sprite (Image, not physics body) ---
      const flask = this.scene.add.image(startX, startY, 'flask');
      flask.setDepth(DEPTHS.PROJECTILES);

      // --- Shadow on the ground ---
      const shadow = this.scene.add.ellipse(startX, startY, 8 * SPRITE_SCALE, 4 * SPRITE_SCALE, 0x000000, 0.35);
      shadow.setDepth(DEPTHS.GROUND + 1);

      // --- Shadow tween: moves linearly toward target on the ground ---
      this.scene.tweens.add({
        targets: shadow,
        x: endX,
        y: endY,
        duration: flightDuration,
        ease: 'Linear',
        onComplete: () => shadow.destroy(),
      });

      // --- Flask parabolic arc tween ---
      this.scene.tweens.add({
        targets: flask,
        x: endX,
        y: endY,
        duration: flightDuration,
        ease: 'Linear',
        onUpdate: (tween) => {
          const progress = tween.progress;
          // Parabolic vertical offset: sin(progress * PI) * arcHeight
          const arcOffset = Math.sin(progress * Math.PI) * arcHeight;
          // Linearly interpolated base Y, then subtract arc offset to go "up"
          const baseY = startY + (endY - startY) * progress;
          flask.y = baseY - arcOffset;
        },
        onComplete: () => {
          // Impact position
          const impactX = flask.x;
          const impactY = flask.y;
          flask.destroy();

          this.onImpact(
            impactX, impactY, aoeRadius, damage, enchant,
            enemies, weaponLevel,
          );
        },
      });

      // --- Flask rotation during flight ---
      this.scene.tweens.add({
        targets: flask,
        angle: 360 * 3,
        duration: flightDuration,
        ease: 'Linear',
      });
    }
  }

  /**
   * Handle flask impact: green AoE explosion, damage enemies, optional poison puddle.
   */
  private onImpact(
    x: number,
    y: number,
    aoeRadius: number,
    damage: number,
    enchant: { id: import('../constants').EnchantId | null; tier: number },
    enemies: Phaser.Physics.Arcade.Group,
    weaponLevel: number,
  ): void {
    // --- Green explosion ring: expand + fade ---
    const ring = this.scene.add.circle(x, y, 4 * SPRITE_SCALE, 0x44FF44, 0.8);
    ring.setDepth(DEPTHS.EFFECTS);
    const visualRadius = aoeRadius;

    this.scene.tweens.add({
      targets: ring,
      scaleX: visualRadius / (4 * SPRITE_SCALE),
      scaleY: visualRadius / (4 * SPRITE_SCALE),
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });

    // --- Damage enemies in radius ---
    const children = enemies.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const eDist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (eDist <= aoeRadius) {
        const aoeDmg = Math.floor(damage * 0.6);
        enemy.takeDamage(aoeDmg);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, aoeDmg, enchant.id, enchant.tier, this.id);

        // Knockback from explosion center
        const kdx = enemy.x - x;
        const kdy = enemy.y - y;
        const kd = Math.sqrt(kdx * kdx + kdy * kdy) || 1;
        enemy.setVelocity(
          (kdx / kd) * KNOCKBACK_VELOCITY,
          (kdy / kd) * KNOCKBACK_VELOCITY,
        );
      }
    }

    // --- Poison puddle at level 3+ ---
    if (weaponLevel >= 3) {
      this.spawnPoisonPuddle(x, y, aoeRadius, enemies);
    }
  }

  /**
   * Spawn a poison puddle that deals 2 damage/s for 3 seconds.
   */
  private spawnPoisonPuddle(
    x: number,
    y: number,
    aoeRadius: number,
    enemies: Phaser.Physics.Arcade.Group,
  ): void {
    const puddleRadius = aoeRadius * 0.7;
    const puddle = this.scene.add.circle(x, y, puddleRadius, 0x22AA22, 0.45);
    puddle.setDepth(DEPTHS.GROUND + 2);

    const puddleDuration = 3000; // 3 seconds
    const tickInterval = 500;    // damage tick every 500ms
    const dmgPerTick = 1;        // 2 dmg/s => 1 dmg per 0.5s tick
    let elapsed = 0;

    const timerEvent = this.scene.time.addEvent({
      delay: tickInterval,
      repeat: (puddleDuration / tickInterval) - 1,
      callback: () => {
        elapsed += tickInterval;
        const children = enemies.getChildren() as Enemy[];
        for (const enemy of children) {
          if (!enemy.active) continue;
          const eDist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
          if (eDist <= puddleRadius) {
            enemy.takeDamage(dmgPerTick);
          }
        }
      },
    });

    // Fade out the puddle over its lifetime, then destroy
    this.scene.tweens.add({
      targets: puddle,
      alpha: 0,
      duration: puddleDuration,
      ease: 'Linear',
      onComplete: () => {
        timerEvent.destroy();
        puddle.destroy();
      },
    });
  }
}
