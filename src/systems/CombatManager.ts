import Phaser from 'phaser';
import { EVENTS } from '../constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { EnemyProjectile } from '../entities/EnemyProjectile';
import { EventBus } from './EventBus';

export class CombatManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public setupCollisions(
    player: Player,
    enemyGroup: Phaser.Physics.Arcade.Group,
    projectileGroup: Phaser.Physics.Arcade.Group,
    enemyProjectileGroup: Phaser.Physics.Arcade.Group,
  ): void {
    // Player projectiles vs enemies
    this.scene.physics.add.overlap(
      projectileGroup,
      enemyGroup,
      (projObj, enemyObj) => {
        const proj = projObj as Projectile;
        const enemy = enemyObj as Enemy;
        if (!proj.active || !enemy.active) return;

        // Use enemy's unique instance id for pierce tracking
        const enemyId = (enemy as any).__instanceId ?? 0;
        if (!proj.onHitEnemy(enemyId)) return;

        // Crit chance
        const mods = player.playerState.modifiers;
        let damage = proj.damage;
        let isCrit = false;
        if (mods.critChance > 0 && Math.random() < mods.critChance) {
          damage = Math.floor(damage * (1.5 + mods.critDamageBonus));
          isCrit = true;
        }

        enemy.takeDamage(damage);
        this.scene.cameras.main.shake(30, 0.002);

        // Track damage
        player.playerState.stats.damageDealt += damage;

        // Life steal
        if (mods.lifeStealPercent > 0) {
          const healAmount = Math.floor(damage * mods.lifeStealPercent);
          if (healAmount > 0) player.heal(healAmount);
        }

        // Burn chance (Black Mage Fire)
        if (mods.burnChance > 0 && Math.random() < mods.burnChance) {
          if (typeof (enemy as any).applyBurn === 'function') {
            (enemy as any).applyBurn(3, 2000); // 3 dmg/s for 2s
          }
        }

        // Slow chance (Black Mage Blizzard)
        if (mods.slowChance > 0 && Math.random() < mods.slowChance) {
          if (typeof (enemy as any).applySlow === 'function') {
            (enemy as any).applySlow(mods.slowPercent || 0.3, 2000);
          }
        }

        // Poison on hit (Poison Dagger weapon)
        if (proj.poisonOnHit) {
          if (typeof (enemy as any).applyPoison === 'function') {
            (enemy as any).applyPoison(2, 3000); // 2 dmg/s for 3s
          }
        }

        // Always emit hit for damage numbers + enchant processing
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage, proj.enchantId, proj.enchantTier, proj.weaponId);

        if (isCrit) {
          EventBus.emit(EVENTS.CRIT_HIT, enemy, damage);
        }
      },
      undefined,
      this,
    );

    // Enemies vs player (contact damage)
    this.scene.physics.add.overlap(
      player,
      enemyGroup,
      (_playerObj, enemyObj) => {
        const enemy = enemyObj as Enemy;
        if (!enemy.active) return;
        player.takeDamage(enemy.scaledDamage);
      },
      undefined,
      this,
    );

    // Enemy projectiles vs player
    this.scene.physics.add.overlap(
      player,
      enemyProjectileGroup,
      (_playerObj, projObj) => {
        const proj = projObj as EnemyProjectile;
        if (!proj.active) return;
        player.takeDamage(proj.damage);
        proj.deactivate();
      },
      undefined,
      this,
    );
  }
}
