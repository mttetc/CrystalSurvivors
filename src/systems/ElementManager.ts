import Phaser from 'phaser';
import { EVENTS, ElementId, WeaponId, DEPTHS } from '../constants';
import { ELEMENT_DEFS, ElementUpgradeDef } from '../data/elements';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { EventBus } from './EventBus';

/**
 * Manages element effects on weapons (parallel to EnchantManager).
 * Listens to ENEMY_HIT and applies element base effects + unlocked upgrades.
 */
export class ElementManager {
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
    _enchantId: any,
    _enchantTier: number,
    weaponId: WeaponId,
  ): void {
    if (!enemy.active) return;

    const weapon = this.player.getWeapon(weaponId);
    if (!weapon || !weapon.element) return;

    const elementId = weapon.element;
    const upgrades = weapon.elementUpgrades;
    const def = ELEMENT_DEFS[elementId];

    // Gather unlocked upgrades
    const unlockedUpgrades = def.upgrades.filter(u => upgrades.includes(u.id));

    // Apply base element effect + upgrades
    switch (elementId) {
      case ElementId.FIRE:
        this.applyFire(enemy, damage, unlockedUpgrades);
        break;
      case ElementId.ICE:
        this.applyIce(enemy, unlockedUpgrades);
        break;
      case ElementId.LIGHTNING:
        this.applyLightning(enemy, damage, unlockedUpgrades);
        break;
      case ElementId.POISON:
        this.applyPoison(enemy, unlockedUpgrades);
        break;
      case ElementId.HOLY:
        this.applyHoly(enemy, damage, unlockedUpgrades);
        break;
      case ElementId.DARK:
        this.applyDark(enemy, damage, unlockedUpgrades);
        break;
    }

    // Tint projectile/enemy flash with element color
    enemy.setTint(def.color);
    this.scene.time.delayedCall(200, () => {
      if (enemy.active) enemy.clearTint();
    });
  }

  // ─── Fire: Burn 2 dmg/s for 2s ──────────────────────────────────
  private applyFire(enemy: Enemy, damage: number, upgrades: ElementUpgradeDef[]): void {
    let burnDmg = 2;
    let burnDuration = 2000;

    for (const u of upgrades) {
      if (u.effect.burnDamage) burnDmg += u.effect.burnDamage;
      if (u.effect.burnDuration) burnDuration += u.effect.burnDuration;
    }

    enemy.applyDoT(burnDmg, 1000, burnDuration, true);

    // Embrasement: AoE on burning kill
    const hasAoeOnKill = upgrades.some(u => u.effect.burnAoeOnKill);
    if (hasAoeOnKill) {
      // Store flag on enemy for kill handler
      (enemy as any).__fireAoeOnKill = true;
      (enemy as any).__fireAoeDmg = burnDmg * 3;
    }

    // Inferno: burn spread
    const hasSpread = upgrades.some(u => u.effect.burnSpread);
    if (hasSpread) {
      const children = this.enemyGroup.getChildren() as Enemy[];
      for (const e of children) {
        if (!e.active || e === enemy) continue;
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, e.x, e.y);
        if (dist <= 50) {
          e.applyDoT(Math.floor(burnDmg * 0.5), 1000, burnDuration, true);
        }
      }
    }
  }

  // ─── Ice: Slow 25% for 2s ───────────────────────────────────────
  private applyIce(enemy: Enemy, upgrades: ElementUpgradeDef[]): void {
    let slowPercent = 25;
    let freezeChance = 0;

    for (const u of upgrades) {
      if (u.effect.slowBonus) slowPercent += u.effect.slowBonus;
      if (u.effect.freezeChance) freezeChance += u.effect.freezeChance;
    }

    if (freezeChance > 0 && Math.random() < freezeChance) {
      enemy.applyFreeze(1500);
    } else {
      enemy.applySlow(slowPercent / 100, 2000);
    }

    // Shatter: AoE on frozen kill
    const hasShatter = upgrades.some(u => u.effect.shatterAoe);
    if (hasShatter) {
      (enemy as any).__iceShatterOnKill = true;
    }
  }

  // ─── Lightning: Chain to 1 enemy ─────────────────────────────────
  private applyLightning(enemy: Enemy, damage: number, upgrades: ElementUpgradeDef[]): void {
    let chainCount = 1;
    let chainRange = 100;
    let stunDuration = 0;

    for (const u of upgrades) {
      if (u.effect.chainBonus) chainCount += u.effect.chainBonus;
      if (u.effect.chainRangeBonus) chainRange += u.effect.chainRangeBonus;
      if (u.effect.stunDuration) stunDuration += u.effect.stunDuration;
    }

    const chainDmg = Math.floor(damage * 0.5);
    let current = enemy;
    const hit = new Set<Enemy>([enemy]);

    for (let i = 0; i < chainCount; i++) {
      let nearest: Enemy | null = null;
      let nearestDist = chainRange;
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
      EventBus.emit(EVENTS.ENCHANT_DAMAGE, nearest.x, nearest.y, chainDmg, '#FFFF44');

      if (stunDuration > 0) {
        nearest.applyStun(stunDuration);
      }

      // Visual arc
      const gfx = this.scene.add.graphics();
      gfx.setDepth(DEPTHS.EFFECTS);
      gfx.lineStyle(1, 0xFFFF44, 0.8);
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
  }

  // ─── Poison: DoT 1 dmg/s for 3s ─────────────────────────────────
  private applyPoison(enemy: Enemy, upgrades: ElementUpgradeDef[]): void {
    let dotDmg = 1;

    for (const u of upgrades) {
      if (u.effect.dotDamage) dotDmg += u.effect.dotDamage;
    }

    enemy.applyDoT(dotDmg, 1000, 3000, false);
    enemy.applyPoison(3000);

    // Puddle on kill
    const hasPuddle = upgrades.some(u => u.effect.puddleOnKill);
    if (hasPuddle) {
      (enemy as any).__poisonPuddleOnKill = true;
      (enemy as any).__poisonPuddleDmg = dotDmg;
    }

    // Spread
    const hasSpread = upgrades.some(u => u.effect.poisonSpread);
    if (hasSpread) {
      const children = this.enemyGroup.getChildren() as Enemy[];
      for (const e of children) {
        if (!e.active || e === enemy) continue;
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, e.x, e.y);
        if (dist <= 50) {
          e.applyDoT(Math.floor(dotDmg * 0.5), 1000, 3000, false);
          e.applyPoison(3000);
        }
      }
    }
  }

  // ─── Holy: Heal 1 HP on hit ──────────────────────────────────────
  private applyHoly(enemy: Enemy, damage: number, upgrades: ElementUpgradeDef[]): void {
    let healAmount = 1;
    let groupDmgBonus = 0;

    for (const u of upgrades) {
      if (u.effect.healBonus) healAmount += u.effect.healBonus;
      if (u.effect.groupDamageBonus) groupDmgBonus += u.effect.groupDamageBonus;
    }

    this.player.heal(healAmount);

    // Group damage bonus: bonus damage when 3+ enemies nearby
    if (groupDmgBonus > 0) {
      const nearby = this.countNearbyEnemies(enemy, 80);
      if (nearby >= 3) {
        const bonusDmg = Math.floor(damage * groupDmgBonus);
        enemy.takeDamage(bonusDmg, false);
        EventBus.emit(EVENTS.ENCHANT_DAMAGE, enemy.x, enemy.y, bonusDmg, '#FFDD44');
      }
    }
  }

  // ─── Dark: 10% lifesteal ─────────────────────────────────────────
  private applyDark(enemy: Enemy, damage: number, upgrades: ElementUpgradeDef[]): void {
    let lifestealPercent = 0.10;
    let fearDuration = 0;

    for (const u of upgrades) {
      if (u.effect.lifestealBonus) lifestealPercent += u.effect.lifestealBonus / 100;
      if (u.effect.fearDuration) fearDuration += u.effect.fearDuration;
    }

    const heal = Math.max(1, Math.floor(damage * lifestealPercent));
    this.player.heal(heal);

    // Fear: push enemy away
    if (fearDuration > 0 && Math.random() < 0.3) {
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      const speed = 120;
      enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      enemy.applyStun(fearDuration);
    }

    // Ignore armor handled at damage calc level (flag on weapon)
  }

  // ─── Helpers ──────────────────────────────────────────────────────
  private countNearbyEnemies(target: Enemy, radius: number): number {
    let count = 0;
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const e of children) {
      if (!e.active || e === target) continue;
      const dist = Phaser.Math.Distance.Between(target.x, target.y, e.x, e.y);
      if (dist <= radius) count++;
    }
    return count;
  }

  public destroy(): void {
    EventBus.off(EVENTS.ENEMY_HIT, this.onEnemyHit, this);
  }
}
