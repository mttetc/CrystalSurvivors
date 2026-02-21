import Phaser from 'phaser';
import { EVENTS, EnchantId, WeaponId, DEPTHS } from '../constants';
import { ENCHANT_DEFS } from '../data/enchants';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { EventBus } from './EventBus';

export class EnchantManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemyGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, player: Player, enemyGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.player = player;
    this.enemyGroup = enemyGroup;

    EventBus.on(EVENTS.ENEMY_HIT, this.onEnemyHit, this);
  }

  private onEnemyHit(
    enemy: Enemy,
    damage: number,
    enchantId: EnchantId,
    enchantTier: number,
    _weaponId: WeaponId,
  ): void {
    if (!enchantId || enchantTier <= 0 || !enemy.active) return;

    const def = ENCHANT_DEFS[enchantId];
    const tier = def.tiers[enchantTier - 1];
    if (!tier) return;

    switch (enchantId) {
      case EnchantId.BURNING:
        if (tier.dotDamage && tier.dotInterval && tier.dotDuration) {
          enemy.applyDoT(tier.dotDamage, tier.dotInterval, tier.dotDuration, true);
          enemy.setTint(0xFF6644);
        }
        break;

      case EnchantId.FREEZING:
        if (tier.freezeChance && Math.random() < tier.freezeChance) {
          enemy.applyFreeze(1500);
        } else if (tier.slowPercent && tier.slowDuration) {
          enemy.applySlow(tier.slowPercent, tier.slowDuration);
        }
        break;

      case EnchantId.VAMPIRIC:
        if (tier.lifestealPercent) {
          const heal = Math.max(1, Math.floor(damage * tier.lifestealPercent));
          this.player.heal(heal);
        }
        break;

      case EnchantId.PIERCING:
        // Handled by projectile pierce stats
        break;

      case EnchantId.CHAIN: {
        if (!tier.chainCount || !tier.chainDamagePercent) break;
        const chainDmg = Math.floor(damage * tier.chainDamagePercent);
        const chainCount = tier.chainCount;
        let current = enemy;
        const hit = new Set<Enemy>([enemy]);

        for (let i = 0; i < chainCount; i++) {
          let nearest: Enemy | null = null;
          let nearestDist = 100;
          const children = this.enemyGroup.getChildren() as Enemy[];
          for (const e of children) {
            if (!e.active || hit.has(e)) continue;
            const dist = Phaser.Math.Distance.Between(current.x, current.y, e.x, e.y);
            if (dist < nearestDist) {
              nearestDist = dist;
              nearest = e;
            }
          }
          if (!nearest) break;
          hit.add(nearest);
          nearest.takeDamage(chainDmg, false);
          EventBus.emit(EVENTS.ENCHANT_DAMAGE, nearest.x, nearest.y, chainDmg, '#FFDD44');
          // Stun at tier 2+
          if (enchantTier >= 2) {
            nearest.applyStun(400 + enchantTier * 200);
          }

          // Visual arc
          const gfx = this.scene.add.graphics();
          gfx.setDepth(DEPTHS.EFFECTS);
          gfx.lineStyle(1, 0xFFDD44, 0.6);
          gfx.beginPath();
          gfx.moveTo(current.x, current.y);
          gfx.lineTo(nearest.x, nearest.y);
          gfx.stroke();
          this.scene.tweens.add({
            targets: gfx,
            alpha: 0,
            duration: 150,
            onComplete: () => gfx.destroy(),
          });

          current = nearest;
        }
        break;
      }

      case EnchantId.EXPLOSIVE: {
        if (!tier.explosionRadius || !tier.explosionDamagePercent) break;
        const explodeDmg = Math.floor(damage * tier.explosionDamagePercent);
        const radius = tier.explosionRadius;

        // Visual
        const circle = this.scene.add.circle(enemy.x, enemy.y, radius, 0xFF8800, 0.3);
        circle.setDepth(DEPTHS.EFFECTS);
        this.scene.tweens.add({
          targets: circle,
          alpha: 0,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 300,
          onComplete: () => circle.destroy(),
        });

        // Damage
        const children = this.enemyGroup.getChildren() as Enemy[];
        for (const e of children) {
          if (!e.active || e === enemy) continue;
          const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, e.x, e.y);
          if (dist <= radius) {
            e.takeDamage(explodeDmg, false);
            EventBus.emit(EVENTS.ENCHANT_DAMAGE, e.x, e.y, explodeDmg, '#FF8800');
          }
        }
        break;
      }

      case EnchantId.TOXIC: {
        if (!tier.cloudRadius || !tier.cloudDamage || !tier.cloudDuration) break;
        // Proc chance gate - not every hit spawns a cloud
        if (tier.toxicProcChance && Math.random() >= tier.toxicProcChance) break;
        const cloudX = enemy.x;
        const cloudY = enemy.y;
        const cloudRadius = tier.cloudRadius;
        const cloudDmg = tier.cloudDamage;
        const cloudDur = tier.cloudDuration;

        const cloud = this.scene.add.circle(cloudX, cloudY, cloudRadius, 0x44AA44, 0.25);
        cloud.setDepth(DEPTHS.EFFECTS - 1);

        let elapsed = 0;
        const tickInterval = 500;
        let tickAccum = 0;

        const cloudTimer = this.scene.time.addEvent({
          delay: 16,
          loop: true,
          callback: () => {
            elapsed += 16;
            tickAccum += 16;
            if (tickAccum >= tickInterval) {
              tickAccum -= tickInterval;
              const children = this.enemyGroup.getChildren() as Enemy[];
              for (const e of children) {
                if (!e.active) continue;
                const dist = Phaser.Math.Distance.Between(cloudX, cloudY, e.x, e.y);
                if (dist <= cloudRadius) {
                  e.takeDamage(cloudDmg, false);
                  e.applyPoison(1000);
                  EventBus.emit(EVENTS.ENCHANT_DAMAGE, e.x, e.y, cloudDmg, '#44CC44');
                }
              }
            }
            if (elapsed >= cloudDur) {
              cloudTimer.remove();
              cloud.destroy();
            }
          },
        });
        break;
      }

      case EnchantId.CRITICAL:
        if (tier.critChance && tier.critMultiplier && Math.random() < tier.critChance) {
          const bonusDmg = Math.floor(damage * (tier.critMultiplier - 1));
          enemy.takeDamage(bonusDmg, false);
          EventBus.emit(EVENTS.CRIT_HIT, enemy, damage + bonusDmg);
        }
        break;
    }
  }

  public destroy(): void {
    EventBus.off(EVENTS.ENEMY_HIT, this.onEnemyHit, this);
  }
}
