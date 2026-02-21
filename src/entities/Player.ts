import Phaser from 'phaser';
import {
  PLAYER_SPEED, PLAYER_MAX_HP, PLAYER_PICKUP_RADIUS,
  PLAYER_INVULN_MS, PLAYER_MAX_WEAPONS, Direction, DEPTHS, EVENTS, WeaponId,
} from '../constants';
import { PlayerState, PlayerStatModifiers, WeaponInstance } from '../types';
import { EventBus } from '../systems/EventBus';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public playerState: PlayerState;
  private cursors!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    arrowUp: Phaser.Input.Keyboard.Key;
    arrowDown: Phaser.Input.Keyboard.Key;
    arrowLeft: Phaser.Input.Keyboard.Key;
    arrowRight: Phaser.Input.Keyboard.Key;
  };
  private dashKey!: Phaser.Input.Keyboard.Key;
  private dashShiftKey!: Phaser.Input.Keyboard.Key;
  private invulnTimer = 0;
  private regenAccum = 0;
  private facing: Direction = Direction.DOWN;
  private walkAnimTimer = 0;
  private currentFrame = 0;

  // Dash ability
  public dashCharges = 2;
  public maxDashCharges = 2;
  private dashRechargeTimer = 0;
  private dashRechargeTime = 3000;
  public isDashing = false;
  private dashTimer = 0;
  private dashDuration = 150;
  private dashTrailTimer = 0;
  private lastMoveVx = 0;
  private lastMoveVy = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTHS.PLAYER);
    this.setCollideWorldBounds(true);
    this.body!.setSize(10, 14);
    this.body!.setOffset(3, 5);

    this.playerState = this.createInitialState();

    const kb: Phaser.Input.Keyboard.KeyboardPlugin = scene.input.keyboard!;
    this.cursors = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      arrowUp: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      arrowDown: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      arrowLeft: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      arrowRight: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    };
    this.dashKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.dashShiftKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  private createInitialState(): PlayerState {
    return {
      stats: {
        maxHP: PLAYER_MAX_HP,
        currentHP: PLAYER_MAX_HP,
        speed: PLAYER_SPEED,
        pickupRadius: PLAYER_PICKUP_RADIUS,
        level: 1,
        xp: 0,
        xpToNext: 8,
        kills: 0,
        damageDealt: 0,
        damageTaken: 0,
        timeSurvived: 0,
      },
      weapons: [],  // Starting weapon granted by job selection
      modifiers: this.defaultModifiers(),
      chosenJobs: [],
      jobSkillLevels: {},
      isDoubledDown: false,
      passiveTiers: {},
      activeSynergies: [],
      takenMalus: [],
      isInvulnerable: false,
      isDead: false,
    };
  }

  private defaultModifiers(): PlayerStatModifiers {
    return {
      maxHpBonus: 0,
      speedMultiplier: 1,
      pickupRadiusMultiplier: 1,
      xpMultiplier: 1,
      cooldownMultiplier: 1,
      damageMultiplier: 1,
      armor: 0,
      regenPerSecond: 0,
      doubleGemChance: 0,
      adrenalineSpeedBonus: 0,
      adrenalineDamageBonus: 0,
      // Job skill modifiers
      lifeStealPercent: 0,
      lowHpDamageBonus: 0,
      lowHpDamageReduction: 0,
      bonusPierce: 0,
      bonusDashCharges: 0,
      dashRechargeReduction: 0,
      bonusProjectiles: 0,
      dodgeChance: 0,
      counterDamage: 0,
      counterRadius: 0,
      rageAttackSpeedPerKill: 0,
      rageMaxStacks: 0,
      frenzyAttackSpeedBonus: 0,
      killHealAmount: 0,
      projectileRangeMultiplier: 0,
      burnChance: 0,
      slowChance: 0,
      slowPercent: 0,
      critChance: 0,
      critDamageBonus: 0,
      healthDropMultiplier: 0,
      slowFieldRadius: 0,
      slowFieldPercent: 0,
      // Family modifiers
      projectileFamilyDamage: 0,
      magicFamilyDamage: 0,
      magicFamilyRadius: 0,
      meleeFamilyDamage: 0,
      meleeFamilyRange: 0,
      auraFamilyDamage: 0,
      auraFamilyRadius: 0,
      supportEffectiveness: 0,
      summonFamilyDamage: 0,
      summonFamilyCooldown: 0,
      // Range & visual scaling
      rangeMultiplier: 1,
      projectileScaleMultiplier: 1,
      meleeScaleMultiplier: 1,
      aoeScaleMultiplier: 1,
      // Malus-specific
      healingMultiplier: 1,
      meleeDamageMultiplier: 1,
      projectileDamageMultiplier: 1,
      aoeDamageMultiplier: 1,
    };
  }

  update(_time: number, delta: number): void {
    if (this.playerState.isDead) return;

    this.handleMovement(delta);
    this.handleDash(delta);
    this.handleInvulnerability(delta);
    this.handleRegen(delta);
    this.handleDashRecharge(delta);
    this.playerState.stats.timeSurvived += delta;
  }

  private handleMovement(delta: number): void {
    // During dash, don't change velocity from input
    if (this.isDashing) return;

    let vx = 0, vy = 0;

    if (this.cursors.left.isDown || this.cursors.arrowLeft.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.cursors.arrowRight.isDown) vx += 1;
    if (this.cursors.up.isDown || this.cursors.arrowUp.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.cursors.arrowDown.isDown) vy += 1;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      vx /= len;
      vy /= len;
    }

    // Track last movement direction for dash
    if (vx !== 0 || vy !== 0) {
      this.lastMoveVx = vx;
      this.lastMoveVy = vy;
    }

    const speed = this.getEffectiveSpeed();
    this.setVelocity(vx * speed, vy * speed);

    // Check for dash trigger
    if (Phaser.Input.Keyboard.JustDown(this.dashKey) || Phaser.Input.Keyboard.JustDown(this.dashShiftKey)) {
      this.triggerDash();
    }

    // Update facing
    if (vx !== 0 || vy !== 0) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx < 0 ? Direction.LEFT : Direction.RIGHT;
      } else {
        this.facing = vy < 0 ? Direction.UP : Direction.DOWN;
      }

      // Walk animation
      this.walkAnimTimer += delta;
      if (this.walkAnimTimer >= 150) {
        this.walkAnimTimer = 0;
        this.currentFrame = (this.currentFrame + 1) % 4;
      }
    } else {
      this.currentFrame = 0;
      this.walkAnimTimer = 0;
    }

    this.setFrame(this.facing * 4 + this.currentFrame);
  }

  private triggerDash(): void {
    const maxCharges = 2 + this.playerState.modifiers.bonusDashCharges;
    if (this.isDashing || this.dashCharges <= 0) return;
    if (this.lastMoveVx === 0 && this.lastMoveVy === 0) return;

    this.dashCharges--;
    this.isDashing = true;
    this.dashTimer = this.dashDuration;
    this.dashTrailTimer = 0;
    this.playerState.isInvulnerable = true;

    // Shadow Step: purple tint + faster dash (4x instead of 3x)
    const hasShadowStep = this.playerState.modifiers.bonusDashCharges > 0;
    const dashMultiplier = hasShadowStep ? 4 : 3;
    const speed = this.getEffectiveSpeed() * dashMultiplier;
    this.setVelocity(this.lastMoveVx * speed, this.lastMoveVy * speed);

    if (hasShadowStep) {
      this.setTint(0x9400D3);
    }

    EventBus.emit(EVENTS.PLAYER_DASHED, this.dashCharges, maxCharges);
  }

  private handleDash(delta: number): void {
    if (!this.isDashing) return;

    this.dashTimer -= delta;
    this.dashTrailTimer += delta;

    const hasShadowStep = this.playerState.modifiers.bonusDashCharges > 0;

    // Spawn afterimage + speed lines every 30ms
    if (this.dashTrailTimer >= 30) {
      this.dashTrailTimer -= 30;

      // Afterimage sprite at current position
      const afterimage = this.scene.add.image(this.x, this.y, this.texture.key, this.frame.name);
      afterimage.setAlpha(0.5);
      afterimage.setTint(hasShadowStep ? 0x9400D3 : 0x4488FF);
      afterimage.setDepth(DEPTHS.PLAYER - 1);
      afterimage.setScale(this.scaleX, this.scaleY);
      this.scene.tweens.add({
        targets: afterimage,
        alpha: 0,
        duration: 200,
        onComplete: () => afterimage.destroy(),
      });

      // Speed lines behind player
      const gfx = this.scene.add.graphics();
      gfx.setDepth(DEPTHS.EFFECTS);
      const lineColor = hasShadowStep ? 0x9400D3 : 0x4488FF;
      gfx.lineStyle(1, lineColor, 0.5);
      for (let i = 0; i < 3; i++) {
        const off = (Math.random() - 0.5) * 8;
        gfx.lineBetween(
          this.x + off, this.y + off,
          this.x - this.lastMoveVx * 10 + off, this.y - this.lastMoveVy * 10 + off,
        );
      }
      this.scene.tweens.add({
        targets: gfx,
        alpha: 0,
        duration: 150,
        onComplete: () => gfx.destroy(),
      });
    }

    // Flash/blink effect during dash
    this.setAlpha(Math.sin(this.dashTimer * 0.05) > 0 ? 1 : 0.2);

    if (this.dashTimer <= 0) {
      this.isDashing = false;
      this.dashTimer = 0;
      this.dashTrailTimer = 0;
      this.clearTint();
      if (this.invulnTimer <= 0) {
        this.playerState.isInvulnerable = false;
      }
      this.setAlpha(1);
    }
  }

  private handleDashRecharge(delta: number): void {
    const maxCharges = 2 + this.playerState.modifiers.bonusDashCharges;
    if (this.dashCharges >= maxCharges) {
      this.dashRechargeTimer = 0;
      return;
    }

    const rechargeTime = this.dashRechargeTime * (1 - this.playerState.modifiers.dashRechargeReduction);
    this.dashRechargeTimer += delta;
    if (this.dashRechargeTimer >= rechargeTime) {
      this.dashRechargeTimer -= rechargeTime;
      this.dashCharges = Math.min(maxCharges, this.dashCharges + 1);
      EventBus.emit(EVENTS.PLAYER_DASHED, this.dashCharges, maxCharges);
    }
  }

  private handleInvulnerability(delta: number): void {
    if (this.invulnTimer > 0) {
      this.invulnTimer -= delta;
      this.setAlpha(Math.sin(this.invulnTimer * 0.02) > 0 ? 1 : 0.3);
      if (this.invulnTimer <= 0) {
        this.invulnTimer = 0;
        this.playerState.isInvulnerable = false;
        this.setAlpha(1);
      }
    }
  }

  private handleRegen(delta: number): void {
    const regen = this.playerState.modifiers.regenPerSecond;
    if (regen <= 0) return;

    this.regenAccum += delta;
    if (this.regenAccum >= 1000) {
      this.regenAccum -= 1000;
      this.heal(regen);
    }
  }

  public getEffectiveSpeed(): number {
    let speed = this.playerState.stats.speed * this.playerState.modifiers.speedMultiplier;

    // Adrenaline bonus when below 50% HP
    if (this.playerState.stats.currentHP < this.getEffectiveMaxHP() * 0.5) {
      speed *= (1 + this.playerState.modifiers.adrenalineSpeedBonus);
    }

    return speed;
  }

  public getEffectiveMaxHP(): number {
    return PLAYER_MAX_HP + this.playerState.modifiers.maxHpBonus;
  }

  public getEffectiveDamageMultiplier(): number {
    let mult = this.playerState.modifiers.damageMultiplier;
    if (this.playerState.stats.currentHP < this.getEffectiveMaxHP() * 0.5) {
      mult *= (1 + this.playerState.modifiers.adrenalineDamageBonus);
    }
    // Dark Force: bonus damage below 30% HP
    if (this.playerState.modifiers.lowHpDamageBonus > 0 &&
        this.playerState.stats.currentHP < this.getEffectiveMaxHP() * 0.3) {
      mult *= (1 + this.playerState.modifiers.lowHpDamageBonus);
    }
    return mult;
  }

  public getEffectivePickupRadius(): number {
    return this.playerState.stats.pickupRadius * this.playerState.modifiers.pickupRadiusMultiplier;
  }

  public takeDamage(amount: number): void {
    if (this.playerState.isInvulnerable || this.playerState.isDead) return;

    // Dodge chance (Smoke Bomb)
    if (this.playerState.modifiers.dodgeChance > 0 && Math.random() < this.playerState.modifiers.dodgeChance) {
      return; // dodged
    }

    let finalDamage = Math.max(1, amount - this.playerState.modifiers.armor);

    // Divine Guard: damage reduction below 50% HP
    if (this.playerState.modifiers.lowHpDamageReduction > 0 &&
        this.playerState.stats.currentHP < this.getEffectiveMaxHP() * 0.5) {
      finalDamage = Math.max(1, Math.floor(finalDamage * (1 - this.playerState.modifiers.lowHpDamageReduction)));
    }

    this.playerState.stats.currentHP = Math.max(0, this.playerState.stats.currentHP - finalDamage);
    this.playerState.stats.damageTaken += finalDamage;

    EventBus.emit(EVENTS.PLAYER_HEALTH_CHANGED, this.playerState.stats.currentHP, this.getEffectiveMaxHP());
    EventBus.emit(EVENTS.PLAYER_DAMAGE_TAKEN, finalDamage);

    // Counter damage (Monk)
    if (this.playerState.modifiers.counterDamage > 0) {
      EventBus.emit(EVENTS.PLAYER_COUNTER, this.playerState.modifiers.counterDamage, this.playerState.modifiers.counterRadius);
    }

    if (this.playerState.stats.currentHP <= 0) {
      this.playerState.isDead = true;
      this.setVelocity(0, 0);
      EventBus.emit(EVENTS.PLAYER_DIED);
      return;
    }

    this.playerState.isInvulnerable = true;
    this.invulnTimer = PLAYER_INVULN_MS;
  }

  public heal(amount: number): void {
    const maxHP = this.getEffectiveMaxHP();
    this.playerState.stats.currentHP = Math.min(maxHP, this.playerState.stats.currentHP + amount);
    EventBus.emit(EVENTS.PLAYER_HEALTH_CHANGED, this.playerState.stats.currentHP, maxHP);
  }

  public getFacing(): Direction {
    return this.facing;
  }

  public getWeapon(id: WeaponId): WeaponInstance | undefined {
    return this.playerState.weapons.find(w => w.id === id);
  }

  public addWeapon(id: WeaponId): void {
    // Already have this weapon
    if (this.playerState.weapons.find(w => w.id === id)) return;
    // Accumulation model: max 6 weapons
    if (this.playerState.weapons.length >= PLAYER_MAX_WEAPONS) return;

    this.playerState.weapons.push({ id, level: 1, enchant: null, enchantTier: 0, element: null, elementUpgrades: [] });
    EventBus.emit(EVENTS.WEAPON_ADDED, id);
  }

  public upgradeWeapon(id: WeaponId): void {
    const weapon = this.playerState.weapons.find(w => w.id === id);
    if (!weapon || weapon.level >= 5) return;
    weapon.level++;
    EventBus.emit(EVENTS.WEAPON_UPGRADED, id, weapon.level);
  }
}
