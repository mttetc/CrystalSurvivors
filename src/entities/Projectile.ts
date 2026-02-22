import Phaser from 'phaser';
import { DEPTHS, EnchantId, WeaponId } from '../constants';

// Glow config per projectile texture key
const PROJECTILE_GLOW_CONFIG: Record<string, { color: number; alpha: number; radiusMultiplier: number }> = {
  fireball:  { color: 0xFF4400, alpha: 0.35, radiusMultiplier: 2.0 },
  holy_orb:  { color: 0xFFDD44, alpha: 0.3,  radiusMultiplier: 2.0 },
  ether_orb: { color: 0x9933FF, alpha: 0.3,  radiusMultiplier: 2.0 },
  flask:     { color: 0x33FF44, alpha: 0.25, radiusMultiplier: 1.5 },
  bullet:    { color: 0xFFDD00, alpha: 0.25, radiusMultiplier: 1.3 },
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

  // Persistent glow graphics that follows the projectile
  private glowGfx: Phaser.GameObjects.Graphics | null = null;
  private glowConfig: { color: number; alpha: number; radius: number } | null = null;

  public static enemyGroup: Phaser.Physics.Arcade.Group | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.PROJECTILES);
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
    // Destroy previous glow if any
    this.destroyGlow();

    const cfg = PROJECTILE_GLOW_CONFIG[texture];
    if (!cfg) return;

    // Estimate projectile radius from display size (half of the larger dimension)
    const baseRadius = Math.max(this.displayWidth, this.displayHeight) * 0.5;
    const glowRadius = Math.max(baseRadius * cfg.radiusMultiplier, 6);

    this.glowConfig = { color: cfg.color, alpha: cfg.alpha, radius: glowRadius };

    this.glowGfx = this.scene.add.graphics();
    this.glowGfx.setBlendMode(Phaser.BlendModes.ADD);
    this.glowGfx.setDepth(DEPTHS.PROJECTILES - 1);
    this.drawGlow();
  }

  private drawGlow(): void {
    if (!this.glowGfx || !this.glowConfig) return;
    this.glowGfx.clear();
    // Outer soft glow
    this.glowGfx.fillStyle(this.glowConfig.color, this.glowConfig.alpha * 0.4);
    this.glowGfx.fillCircle(this.x, this.y, this.glowConfig.radius);
    // Inner brighter core
    this.glowGfx.fillStyle(this.glowConfig.color, this.glowConfig.alpha);
    this.glowGfx.fillCircle(this.x, this.y, this.glowConfig.radius * 0.5);
  }

  private destroyGlow(): void {
    if (this.glowGfx) {
      this.glowGfx.destroy();
      this.glowGfx = null;
    }
    this.glowConfig = null;
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
    this.drawGlow();

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
