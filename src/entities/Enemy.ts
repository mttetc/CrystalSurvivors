import Phaser from 'phaser';
import {
  EnemyType, EnemyBehavior, DEPTHS, EVENTS, SPAWN_RING_RADIUS,
  KNOCKBACK_VELOCITY, KNOCKBACK_DURATION,
} from '../constants';
import { EnemyDef } from '../types';
import { ENEMY_DEFS } from '../data/enemies';
import { scaleHP, scaleSpeed, scaleDamage } from '../data/balance';
import { EventBus } from '../systems/EventBus';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public enemyType!: EnemyType;
  public def!: EnemyDef;
  public maxHP!: number;
  public currentHP!: number;
  public scaledSpeed!: number;
  public scaledDamage!: number;
  public xpValue!: number;
  public wave!: number;
  public isElite = false;

  // Behavior state
  private behaviorTimer = 0;
  private chargeTimer = 0;
  private isCharging = false;
  private summonTimer = 0;
  private shootTimer = 0;
  private knockbackTimer = 0;

  // Slow/freeze from enchants
  public slowMultiplier = 1;
  public slowTimer = 0;
  public isFrozen = false;
  public freezeTimer = 0;

  // Stun
  public isStunned = false;
  public stunTimer = 0;

  // DoT (burning)
  public dotDamage = 0;
  public dotInterval = 0;
  public dotDuration = 0;
  public dotTimer = 0;
  public dotTickTimer = 0;
  public dotShowNumbers = false;
  public isBurning = false;

  // Poison cloud (not on enemy itself, but track if poisoned)
  public isPoisoned = false;
  public poisonTimer = 0;

  // Visual effect timers
  private effectParticleTimer = 0;

  private animTimer = 0;
  private animFrame = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, EnemyType.SHAMBLER, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.ENEMIES);
    this.setActive(false);
    this.setVisible(false);
  }

  public init(type: EnemyType, x: number, y: number, wave: number, hpOverride?: number, elite = false): void {
    this.enemyType = type;
    this.def = ENEMY_DEFS[type];
    this.wave = wave;
    this.isElite = elite;

    const eliteMult = elite ? 3 : 1;
    this.maxHP = (hpOverride ?? scaleHP(this.def.baseHP, wave)) * eliteMult;
    this.currentHP = this.maxHP;
    this.scaledSpeed = scaleSpeed(this.def.baseSpeed, wave) * (elite ? 1.15 : 1);
    this.scaledDamage = scaleDamage(this.def.baseDamage, wave) * (elite ? 2 : 1);
    this.xpValue = this.def.xpValue * (elite ? 5 : 1);

    this.setTexture(type, 0);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(1);

    // Elite enemies are bigger and glow
    if (elite) {
      this.setScale(1.5);
      this.setTint(0xFF4444);
    } else {
      this.setScale(1);
    }

    this.body!.setSize(this.def.size - 2, this.def.size - 2);
    this.body!.setOffset(1, 1);

    // Reset state
    this.behaviorTimer = 0;
    this.chargeTimer = 0;
    this.isCharging = false;
    this.summonTimer = 0;
    this.shootTimer = 0;
    this.knockbackTimer = 0;
    this.slowMultiplier = 1;
    this.slowTimer = 0;
    this.isFrozen = false;
    this.freezeTimer = 0;
    this.isStunned = false;
    this.stunTimer = 0;
    this.dotDamage = 0;
    this.dotDuration = 0;
    this.dotTimer = 0;
    this.dotTickTimer = 0;
    this.dotShowNumbers = false;
    this.isBurning = false;
    this.isPoisoned = false;
    this.poisonTimer = 0;
    this.effectParticleTimer = 0;
    this.animTimer = 0;
    this.animFrame = 0;
  }

  update(_time: number, delta: number): void {
    if (!this.active) return;

    // Knockback
    if (this.knockbackTimer > 0) {
      this.knockbackTimer -= delta;
      if (this.knockbackTimer <= 0) {
        this.knockbackTimer = 0;
      }
      return;
    }

    // Stun
    if (this.isStunned) {
      this.stunTimer -= delta;
      this.setVelocity(0, 0);
      // Flash yellow when stunned
      this.effectParticleTimer += delta;
      if (this.effectParticleTimer > 150) {
        this.effectParticleTimer = 0;
        this.setTint(this.tintTopLeft === 0xFFFF44 ? 0xFFFFFF : 0xFFFF44);
      }
      if (this.stunTimer <= 0) {
        this.isStunned = false;
        this.stunTimer = 0;
        this.refreshStatusTint();
      }
      return;
    }

    // Freeze
    if (this.isFrozen) {
      this.freezeTimer -= delta;
      this.setVelocity(0, 0);
      this.setTint(0x88CCFF);
      if (this.freezeTimer <= 0) {
        this.isFrozen = false;
        this.refreshStatusTint();
      }
      return;
    }

    // Slow
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      if (this.slowTimer <= 0) {
        this.slowMultiplier = 1;
      }
    }

    // DoT (burning)
    if (this.dotDuration > 0) {
      this.dotTimer += delta;
      this.dotTickTimer += delta;
      this.isBurning = true;
      if (this.dotTickTimer >= this.dotInterval) {
        this.dotTickTimer -= this.dotInterval;
        this.takeDamage(this.dotDamage, false);
        if (this.dotShowNumbers) {
          EventBus.emit(EVENTS.ENCHANT_DAMAGE, this.x, this.y, this.dotDamage, '#FF6644');
        }
      }
      if (this.dotTimer >= this.dotDuration) {
        this.dotDamage = 0;
        this.dotDuration = 0;
        this.dotTimer = 0;
        this.dotTickTimer = 0;
        this.isBurning = false;
      }
    }

    // Poison timer
    if (this.isPoisoned) {
      this.poisonTimer -= delta;
      if (this.poisonTimer <= 0) {
        this.isPoisoned = false;
      }
    }

    // Visual effects for status
    this.updateStatusVisuals(delta);

    // Animation
    this.animTimer += delta;
    if (this.animTimer >= 300) {
      this.animTimer = 0;
      this.animFrame = this.animFrame === 0 ? 1 : 0;
      this.setFrame(this.animFrame);
    }

    // Behavior - handled by GameScene for access to player ref
  }

  private updateStatusVisuals(delta: number): void {
    this.effectParticleTimer += delta;

    // Spawn flame particles when burning
    if (this.isBurning && this.effectParticleTimer > 200) {
      this.effectParticleTimer = 0;
      this.spawnFlameParticle();
      this.setTint(0xFF6644);
    }
    // Green tint + drip for poison
    else if (this.isPoisoned && !this.isBurning) {
      if (this.effectParticleTimer > 300) {
        this.effectParticleTimer = 0;
        this.spawnPoisonDrip();
      }
      this.setTint(0x44CC44);
    }
    // Slow tint
    else if (this.slowTimer > 0 && !this.isBurning && !this.isPoisoned) {
      this.setTint(0xAADDFF);
    }
    // Reset tint if no status
    else if (!this.isBurning && !this.isPoisoned && this.slowTimer <= 0) {
      if (this.isElite) {
        this.setTint(0xFF4444);
      } else {
        this.clearTint();
      }
    }
  }

  private spawnFlameParticle(): void {
    if (!this.scene || !this.active) return;
    const offsetX = (Math.random() - 0.5) * 8;
    const flame = this.scene.add.rectangle(
      this.x + offsetX, this.y - 6,
      3, 3, 0xFF6600,
    );
    flame.setDepth(DEPTHS.EFFECTS);
    this.scene.tweens.add({
      targets: flame,
      y: flame.y - 10,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 300,
      onComplete: () => flame.destroy(),
    });
  }

  private spawnPoisonDrip(): void {
    if (!this.scene || !this.active) return;
    const offsetX = (Math.random() - 0.5) * 6;
    const drip = this.scene.add.rectangle(
      this.x + offsetX, this.y + 4,
      2, 2, 0x44CC44,
    );
    drip.setDepth(DEPTHS.EFFECTS);
    this.scene.tweens.add({
      targets: drip,
      y: drip.y + 8,
      alpha: 0,
      duration: 400,
      onComplete: () => drip.destroy(),
    });
  }

  private refreshStatusTint(): void {
    if (this.isBurning) {
      this.setTint(0xFF6644);
    } else if (this.isFrozen) {
      this.setTint(0x88CCFF);
    } else if (this.isPoisoned) {
      this.setTint(0x44CC44);
    } else if (this.slowTimer > 0) {
      this.setTint(0xAADDFF);
    } else if (this.isElite) {
      this.setTint(0xFF4444);
    } else {
      this.clearTint();
    }
  }

  public moveToward(targetX: number, targetY: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const speed = this.scaledSpeed * this.slowMultiplier;
    this.setVelocity((dx / dist) * speed, (dy / dist) * speed);
  }

  public moveAway(targetX: number, targetY: number): void {
    const dx = this.x - targetX;
    const dy = this.y - targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const speed = this.scaledSpeed * this.slowMultiplier;
    this.setVelocity((dx / dist) * speed, (dy / dist) * speed);
  }

  public keepDistanceFrom(targetX: number, targetY: number, distance: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < distance - 20) {
      this.moveAway(targetX, targetY);
    } else if (dist > distance + 20) {
      this.moveToward(targetX, targetY);
    } else {
      this.setVelocity(0, 0);
    }
  }

  public chargeToward(targetX: number, targetY: number, speed: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    this.setVelocity((dx / dist) * speed, (dy / dist) * speed);
  }

  public canShoot(delta: number, interval: number): boolean {
    this.shootTimer += delta;
    if (this.shootTimer >= interval) {
      this.shootTimer = 0;
      return true;
    }
    return false;
  }

  public canSummon(delta: number): boolean {
    if (!this.def.summonInterval) return false;
    this.summonTimer += delta;
    if (this.summonTimer >= this.def.summonInterval) {
      this.summonTimer = 0;
      return true;
    }
    return false;
  }

  public startCharge(): void {
    this.isCharging = true;
    this.chargeTimer = 500; // charge for 500ms
  }

  public updateCharge(delta: number): boolean {
    if (!this.isCharging) return false;
    this.chargeTimer -= delta;
    if (this.chargeTimer <= 0) {
      this.isCharging = false;
      return true; // charge ended
    }
    return false;
  }

  public getIsCharging(): boolean {
    return this.isCharging;
  }

  public getBehaviorTimer(): number {
    return this.behaviorTimer;
  }

  public addBehaviorTimer(delta: number): void {
    this.behaviorTimer += delta;
  }

  public resetBehaviorTimer(): void {
    this.behaviorTimer = 0;
  }

  public takeDamage(amount: number, knockback = true): void {
    if (!this.active) return;

    this.currentHP -= amount;

    // Flash white briefly
    this.setTintFill(0xFFFFFF);
    this.scene.time.delayedCall(60, () => {
      if (this.active) {
        this.clearTint();
        this.refreshStatusTint();
      }
    });

    if (this.currentHP <= 0) {
      this.die();
      return;
    }

    if (knockback && this.scene.children) {
      this.applyKnockback();
    }
  }

  private applyKnockback(): void {
    // Knockback away from player
    const gameScene = this.scene as any;
    if (!gameScene.player) return;

    const dx = this.x - gameScene.player.x;
    const dy = this.y - gameScene.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    this.setVelocity(
      (dx / dist) * KNOCKBACK_VELOCITY,
      (dy / dist) * KNOCKBACK_VELOCITY,
    );
    this.knockbackTimer = KNOCKBACK_DURATION;
  }

  private die(): void {
    if (this.isElite) {
      EventBus.emit(EVENTS.ELITE_KILLED, this.enemyType, this.x, this.y, this.xpValue);
    }
    EventBus.emit(EVENTS.ENEMY_KILLED, this.enemyType, this.x, this.y, this.xpValue, this.def.isBoss);
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.setScale(1);
    this.body!.enable = false;
  }

  public applySlow(percent: number, duration: number): void {
    this.slowMultiplier = 1 - percent;
    this.slowTimer = duration;
  }

  public applyFreeze(duration: number): void {
    this.isFrozen = true;
    this.freezeTimer = duration;
    this.setVelocity(0, 0);
  }

  public applyStun(duration: number): void {
    this.isStunned = true;
    this.stunTimer = duration;
    this.setVelocity(0, 0);
  }

  public applyPoison(duration: number): void {
    this.isPoisoned = true;
    this.poisonTimer = duration;
  }

  public applyBurn(damagePerSecond: number, duration: number): void {
    this.applyDoT(damagePerSecond, 1000, duration, true);
  }

  public applyDoT(damage: number, interval: number, duration: number, showNumbers = false): void {
    // Refresh if stronger
    if (damage >= this.dotDamage) {
      this.dotDamage = damage;
      this.dotInterval = interval;
      this.dotDuration = duration;
      this.dotTimer = 0;
      this.dotTickTimer = 0;
      this.dotShowNumbers = showNumbers;
      this.isBurning = true;
    }
  }
}
