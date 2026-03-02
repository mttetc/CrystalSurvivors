import Phaser from 'phaser';
import { DEPTHS, EnchantId, WeaponId, SPRITE_SCALE } from '../constants';

// Glow config per projectile texture key
const PROJECTILE_GLOW_CONFIG: Record<string, { color: number; alpha: number; radiusMultiplier: number }> = {
  fireball:       { color: 0xFF4400, alpha: 0.35, radiusMultiplier: 2.0 },
  energyball:     { color: 0xFFDD44, alpha: 0.3,  radiusMultiplier: 2.0 },
  big_energyball: { color: 0x9933FF, alpha: 0.3,  radiusMultiplier: 2.0 },
  item_bomb:      { color: 0x33FF44, alpha: 0.25, radiusMultiplier: 1.5 },
  kunai:          { color: 0xFFDD00, alpha: 0.25, radiusMultiplier: 1.3 },
};

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public damage = 0;
  public pierce = 0;
  public pierceCount = 0;
  public damageRetention = 1;
  public lifetime = 0;
  public maxLifetime = 2000;
  public weaponId: WeaponId = WeaponId.HUNTERS_BOW;
  public enchantId: EnchantId | null = null;
  public enchantTier = 0;
  public homing = false;
  public homingTurnRate = 3.0; // radians/sec
  public poisonOnHit = false;
  private hitEnemies: Set<number> = new Set();

  // Persistent glow sprite that follows the projectile
  private glowSprite: Phaser.GameObjects.Sprite | null = null;

  public static enemyGroup: Phaser.Physics.Arcade.Group | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'kunai');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.PROJECTILES);
    this.setScale(SPRITE_SCALE);
    this.setActive(false);
    this.setVisible(false);
  }

  public fire(
    x: number, y: number,
    vx: number, vy: number,
    texture: string,
    damage: number,
    pierce: number,
    damageRetention: number,
    weaponId: WeaponId,
    enchantId: EnchantId | null,
    enchantTier: number,
    maxLifetime = 2000,
  ): void {
    this.setTexture(texture);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body!.enable = true;
    this.setVelocity(vx, vy);

    this.damage = damage;
    this.pierce = pierce;
    this.pierceCount = 0;
    this.damageRetention = damageRetention;
    this.lifetime = 0;
    this.maxLifetime = maxLifetime;
    this.weaponId = weaponId;
    this.enchantId = enchantId;
    this.enchantTier = enchantTier;
    this.homing = false;
    this.poisonOnHit = false;
    this.hitEnemies.clear();

    // Rotate toward velocity
    this.setRotation(Math.atan2(vy, vx));

    // Set up persistent glow effect based on texture
    this.setupGlow(texture);
  }

  private setupGlow(texture: string): void {
    this.destroyGlow();

    const cfg = PROJECTILE_GLOW_CONFIG[texture];
    if (!cfg) return;

    const baseRadius = Math.max(this.displayWidth, this.displayHeight) * 0.5;
    const glowRadius = Math.max(baseRadius * cfg.radiusMultiplier, 6);

    const tex = this.scene.textures.exists('fx_circle_spark') ? 'fx_circle_spark' : 'fx_circle_orange';
    this.glowSprite = this.scene.add.sprite(this.x, this.y, tex, 0);
    this.glowSprite.setBlendMode(Phaser.BlendModes.ADD);
    this.glowSprite.setDepth(DEPTHS.PROJECTILES - 1);
    this.glowSprite.setScale((glowRadius * 2) / 32);
    this.glowSprite.setTint(cfg.color);
    this.glowSprite.setAlpha(cfg.alpha);
  }

  private updateGlowPosition(): void {
    if (this.glowSprite) {
      this.glowSprite.setPosition(this.x, this.y);
    }
  }

  private destroyGlow(): void {
    if (this.glowSprite) {
      this.glowSprite.destroy();
      this.glowSprite = null;
    }
  }

  update(_time: number, delta: number): void {
    if (!this.active) return;

    this.lifetime += delta;
    if (this.lifetime >= this.maxLifetime) {
      this.deactivate();
      return;
    }

    // Homing logic: steer toward nearest enemy
    if (this.homing && Projectile.enemyGroup) {
      const enemies = Projectile.enemyGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
      let nearest: Phaser.Physics.Arcade.Sprite | null = null;
      let nearestDist = Infinity;
      for (const e of enemies) {
        if (!e.active) continue;
        const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = e;
        }
      }
      if (nearest) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        const speed = body.velocity.length();
        const currentAngle = Math.atan2(body.velocity.y, body.velocity.x);
        const targetAngle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
        let diff = targetAngle - currentAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const maxTurn = this.homingTurnRate * (delta / 1000);
        const turn = Math.max(-maxTurn, Math.min(maxTurn, diff));
        const newAngle = currentAngle + turn;
        body.setVelocity(Math.cos(newAngle) * speed, Math.sin(newAngle) * speed);
        this.setRotation(newAngle);
      }
    }

    // Update glow position to follow projectile
    this.updateGlowPosition();

    // Off-world check
    if (this.x < -50 || this.x > 3050 || this.y < -50 || this.y > 3050) {
      this.deactivate();
    }
  }

  /** Clear hit tracking so the projectile can damage the same enemies again (boomerang return) */
  public resetHitEnemies(): void {
    this.hitEnemies.clear();
    this.pierceCount = 0;
  }

  public onHitEnemy(enemyId: number): boolean {
    if (this.hitEnemies.has(enemyId)) return false;
    this.hitEnemies.add(enemyId);

    this.pierceCount++;
    if (this.pierceCount > this.pierce) {
      this.deactivate();
    } else {
      // Reduce damage on pierce
      this.damage = Math.floor(this.damage * this.damageRetention);
    }
    return true;
  }

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.body!.enable = false;
    this.destroyGlow();
  }
}
