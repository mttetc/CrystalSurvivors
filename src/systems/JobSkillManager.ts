import Phaser from 'phaser';
import { EVENTS, DEPTHS, JobSkillId, MasterySkillId, SPRITE_SCALE } from '../constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { JOB_SKILL_DEFS, MASTERY_SKILL_DEFS } from '../data/jobs';
import { EventBus } from './EventBus';
import { spawnFX, spawnCircleZone, spawnFlash, spawnRing, spawnLine, spawnParticleBurst, playImpactFX, playSlashFX } from '../weapons/fxHelper';

// ─── Skill category classification ──────────────────────────────────────────

const AURA_SKILLS = new Set<string>([JobSkillId.CONSECRATE, MasterySkillId.REQUIEM]);
const PERIODIC_AOE_SKILLS = new Set<string>([
  JobSkillId.CHI_BURST, JobSkillId.HOLY,
  JobSkillId.METEOR, JobSkillId.GUST, JobSkillId.QUAKE,
  JobSkillId.RAMUH, JobSkillId.TITAN, JobSkillId.LEVIATHAN,
  JobSkillId.ODIN, JobSkillId.DIABOLOS,
  JobSkillId.KNIGHTS_OF_THE_ROUND,
  // Mastery AoE skills
  MasterySkillId.SOUL_EATER, MasterySkillId.INNER_BEAST, MasterySkillId.FELL_CLEAVE,
  MasterySkillId.FLARE, MasterySkillId.DREADWYRM, MasterySkillId.ERUPTION,
  MasterySkillId.LANDSLIDE, MasterySkillId.STARDIVER, MasterySkillId.FINALE,
  MasterySkillId.COMET, MasterySkillId.MIDARE_SETSUGEKKA, MasterySkillId.EDEN,
]);
const LASER_SKILLS = new Set<string>([JobSkillId.BAHAMUT, JobSkillId.ALEXANDER]);
const JUMP_SKILLS = new Set<string>([JobSkillId.JUMP]);
const BARRAGE_SKILLS = new Set<string>([JobSkillId.BARRAGE]);
const FAMILIAR_SKILLS = new Set<string>([JobSkillId.IFRIT, JobSkillId.SHIVA, MasterySkillId.PHOENIX]);
const TRAIL_SKILLS = new Set<string>([JobSkillId.PITFALL]);
const ELIXIR_SKILLS = new Set<string>([JobSkillId.ELIXIR, MasterySkillId.CLEMENCY, MasterySkillId.BENEDICTION, MasterySkillId.MEGA_POTION]);
const ZANTETSUKEN_SKILLS = new Set<string>([JobSkillId.ZANTETSUKEN, MasterySkillId.HISSATSU]);
const ORBITAL_SKILLS = new Set<string>([JobSkillId.SACRED_ORBIT]);

// ─── Ninja / mastery active skill categories ──────────────────────────────
const FIREBALL_SKILLS = new Set<string>([MasterySkillId.KATON]);
const LIGHTNING_STRIKE_SKILLS = new Set<string>([MasterySkillId.RAITON]);
const GROUND_ZONE_SKILLS = new Set<string>([MasterySkillId.DOTON]);
const WAR_CRY_SKILLS = new Set<string>([JobSkillId.WAR_CRY]);
const CHARGE_SKILLS = new Set<string>([JobSkillId.RAMPAGE]);
const ARROW_RAIN_SKILLS = new Set<string>([JobSkillId.RAIN_OF_ARROWS]);
const PIERCING_PROJECTILE_SKILLS = new Set<string>([JobSkillId.CRESCENDO, JobSkillId.HADOUKEN]);
const DRAGON_DIVE_SKILLS = new Set<string>([JobSkillId.DRAGON_DIVE]);
const BLADE_STORM_SKILLS = new Set<string>([JobSkillId.BLADE_STORM]);
const SMOKE_BOMB_SKILLS = new Set<string>([JobSkillId.SMOKE_BOMB]);
const DUAL_STRIKE_SKILLS = new Set<string>([JobSkillId.DUAL_STRIKE]);
const HALLOWED_GROUND_SKILLS = new Set<string>([MasterySkillId.HALLOWED_GROUND]);
const TIME_STOP_SKILLS = new Set<string>([MasterySkillId.TIME_STOP]);
const FREEZE_SKILLS = new Set<string>([MasterySkillId.FREEZE]);
const ASYLUM_SKILLS = new Set<string>([MasterySkillId.ASYLUM]);

// DARKNESS and THUNDER are event-driven, not updated in the loop

// ─── Familiar orbit config ──────────────────────────────────────────────────

const FAMILIAR_ORBIT_RADIUS = 28;
const FAMILIAR_ORBIT_SPEED = 2.5; // radians per second
const FAMILIAR_SIZE = 5;
const FAMILIAR_HIT_RADIUS = 12;

// ─── Trail config ───────────────────────────────────────────────────────────

const TRAIL_ZONE_RADIUS = 8;
const TRAIL_TICK_INTERVAL = 500; // ms between damage ticks on a trail zone

// ─── JobSkillManager ────────────────────────────────────────────────────────

export class JobSkillManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemyGroup: Phaser.Physics.Arcade.Group;
  private projectileGroup: Phaser.Physics.Arcade.Group;

  // Cooldown accumulators per skill (ms elapsed since last trigger)
  private skillTimers: Map<string, number> = new Map();

  // Persistent aura sprites (repositioned each frame)
  private auraGraphics: Map<string, Phaser.GameObjects.GameObject> = new Map();

  // Familiar state
  private familiarGraphics: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private familiarAngles: Map<string, number> = new Map();
  private familiarAttackTimers: Map<string, number> = new Map();

  // Jump state
  private isJumping = false;
  private isChargingJump = false;
  private jumpChargeTimer = 0;
  private jumpChargeDuration = 1000; // 1s charge before jump
  private jumpChargeGfx: Phaser.GameObjects.Sprite | null = null;
  private jumpTimer = 0;
  private jumpDuration = 900; // ms in the air
  private jumpSkillId: string = '';
  private jumpParams: Record<string, number> = {};
  private jumpOriginX = 0;
  private jumpOriginY = 0;
  private jumpShadowGfx: Phaser.GameObjects.Sprite | null = null;

  // Trail zones: { x, y, damage, remaining, tickTimer }
  private trailZones: Array<{
    x: number; y: number; damage: number; remaining: number;
    tickTimer: number; graphics: Phaser.GameObjects.Sprite;
  }> = [];

  // Lock cooldown: minimum free-movement gap between position-locking skills
  private lockCooldown = 0;
  private static LOCK_GAP = 2500; // 2.5s minimum free movement between locks

  // Dragon Dive state (separate from Jump)
  private isDragonDiving = false;
  private isDragonDiveAiming = false;
  private dragonDiveAimTimer = 0;
  private dragonDiveTargetX = 0;
  private dragonDiveTargetY = 0;
  private dragonDiveAimGfx: Phaser.GameObjects.Sprite | null = null;
  private dragonDiveTimer = 0;
  private dragonDiveDuration = 700; // ms in the air
  private dragonDiveSkillId = '';
  private dragonDiveParams: Record<string, number> = {};
  private dragonDiveOriginX = 0;
  private dragonDiveOriginY = 0;
  private dragonDiveShadowGfx: Phaser.GameObjects.Sprite | null = null;

  // Rampage charge state
  private isCharging = false;
  private chargeTimer = 0;
  private chargeDuration = 400; // ms of charge
  private chargeSkillId = '';
  private chargeParams: Record<string, number> = {};
  private chargeAngle = 0;
  private chargeHitEnemies = new Set<Enemy>();

  // Blade Storm state
  private bladeStormActive = false;
  private bladeStormTimer = 0;
  private bladeStormSkillId = '';
  private bladeStormParams: Record<string, number> = {};
  private bladeStormGfx: Phaser.GameObjects.Sprite | null = null;
  private bladeStormHitTimer = 0;

  // Ground zone state (Doton - persistent zones)
  private groundZones: Array<{
    x: number; y: number; damage: number; slowPercent: number;
    remaining: number; tickTimer: number; graphics: Phaser.GameObjects.Sprite;
  }> = [];

  // Darkness internal cooldown to avoid spam
  private darknessCooldownTimer = 0;
  private readonly darknessCooldown = 500; // ms minimum between darkness procs

  // Orbital shield state (SACRED_ORBIT)
  private orbitalImages: Map<string, Phaser.GameObjects.Image[]> = new Map();
  private orbitalAngles: Map<string, number[]> = new Map();
  private orbitalHitTimers: Map<string, number[]> = new Map();
  private orbitalLastCount: Map<string, number> = new Map();

  // Event listener refs for cleanup
  private onPlayerDamageTaken: ((damage: number) => void) | null = null;
  private onCritHit: ((enemy: Enemy, damage: number) => void) | null = null;
  private onJobSkillUpgraded: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    enemyGroup: Phaser.Physics.Arcade.Group,
    projectileGroup: Phaser.Physics.Arcade.Group,
  ) {
    this.scene = scene;
    this.player = player;
    this.enemyGroup = enemyGroup;
    this.projectileGroup = projectileGroup;

    // Listen for skill upgrades to re-initialize timers if needed
    this.onJobSkillUpgraded = () => {
      this.refreshSkills();
    };
    EventBus.on(EVENTS.JOB_SKILL_UPGRADED, this.onJobSkillUpgraded);

    // DARKNESS: triggered when player takes damage
    this.onPlayerDamageTaken = (_damage: number) => {
      this.handleDarkness();
    };
    EventBus.on(EVENTS.PLAYER_DAMAGE_TAKEN, this.onPlayerDamageTaken);

    // THUNDER: triggered on critical hits
    this.onCritHit = (enemy: Enemy, damage: number) => {
      this.handleThunder(enemy, damage);
    };
    EventBus.on(EVENTS.CRIT_HIT, this.onCritHit);
  }

  // ─── Main update loop ───────────────────────────────────────────────────

  public update(_time: number, delta: number): void {
    const skillLevels = this.player.playerState.jobSkillLevels;

    // Update darkness internal cooldown
    if (this.darknessCooldownTimer > 0) {
      this.darknessCooldownTimer -= delta;
    }

    // Update lock cooldown (minimum gap between position-locking skills)
    if (this.lockCooldown > 0) {
      this.lockCooldown -= delta;
    }

    // Update Dragon Dive aim phase
    if (this.isDragonDiveAiming) {
      this.updateDragonDiveAim(delta);
      return;
    }

    // Update jump charge or active jump
    if (this.isChargingJump) {
      this.updateJumpCharge(delta);
      return;
    }
    if (this.isJumping) {
      this.updateJumpInProgress(delta);
      return;
    }

    // Update Dragon Dive if active
    if (this.isDragonDiving) {
      this.updateDragonDiveInProgress(delta);
      return;
    }

    // Update charge if active
    if (this.isCharging) {
      this.updateChargeInProgress(delta);
      return;
    }

    // Update Blade Storm if active
    if (this.bladeStormActive) {
      this.updateBladeStormInProgress(delta);
    }

    // Update trail zones
    this.updateTrailZones(delta);

    // Update ground zones (Doton)
    this.updateGroundZones(delta);

    // Iterate active skills
    for (const [skillId, level] of Object.entries(skillLevels)) {
      if (level <= 0) continue;

      const def = JOB_SKILL_DEFS[skillId as JobSkillId] ?? MASTERY_SKILL_DEFS[skillId as MasterySkillId];
      if (!def || def.type !== 'active') continue;

      const params = def.levels[level - 1]?.params;
      if (!params) continue;

      if (AURA_SKILLS.has(skillId)) {
        this.updateAura(skillId, params, delta);
      } else if (PERIODIC_AOE_SKILLS.has(skillId)) {
        this.updatePeriodicAoE(skillId, params, delta);
      } else if (LASER_SKILLS.has(skillId)) {
        this.updateLaser(skillId, params, delta);
      } else if (JUMP_SKILLS.has(skillId)) {
        this.updateJump(skillId, params, delta);
      } else if (BARRAGE_SKILLS.has(skillId)) {
        this.updateBarrage(skillId, params, delta);
      } else if (FAMILIAR_SKILLS.has(skillId)) {
        this.updateFamiliar(skillId, params, delta);
      } else if (TRAIL_SKILLS.has(skillId)) {
        this.updateTrail(skillId, params, delta);
      } else if (ELIXIR_SKILLS.has(skillId)) {
        this.updateElixir(skillId, params, delta);
      } else if (ZANTETSUKEN_SKILLS.has(skillId)) {
        this.updateZantetsuken(skillId, params, delta);
      } else if (ORBITAL_SKILLS.has(skillId)) {
        this.updateOrbital(skillId, params, delta);
      } else if (FIREBALL_SKILLS.has(skillId)) {
        this.updateFireball(skillId, params, delta);
      } else if (LIGHTNING_STRIKE_SKILLS.has(skillId)) {
        this.updateLightningStrike(skillId, params, delta);
      } else if (GROUND_ZONE_SKILLS.has(skillId)) {
        this.updateGroundZone(skillId, params, delta);
      } else if (WAR_CRY_SKILLS.has(skillId)) {
        this.updateWarCry(skillId, params, delta);
      } else if (CHARGE_SKILLS.has(skillId)) {
        this.updateCharge(skillId, params, delta);
      } else if (ARROW_RAIN_SKILLS.has(skillId)) {
        this.updateArrowRain(skillId, params, delta);
      } else if (PIERCING_PROJECTILE_SKILLS.has(skillId)) {
        this.updatePiercingProjectile(skillId, params, delta);
      } else if (DRAGON_DIVE_SKILLS.has(skillId)) {
        this.updateDragonDive(skillId, params, delta);
      } else if (BLADE_STORM_SKILLS.has(skillId)) {
        this.updateBladeStorm(skillId, params, delta);
      } else if (SMOKE_BOMB_SKILLS.has(skillId)) {
        this.updateSmokeBomb(skillId, params, delta);
      } else if (DUAL_STRIKE_SKILLS.has(skillId)) {
        this.updateDualStrike(skillId, params, delta);
      } else if (HALLOWED_GROUND_SKILLS.has(skillId)) {
        this.updateHallowedGround(skillId, params, delta);
      } else if (TIME_STOP_SKILLS.has(skillId)) {
        this.updateTimeStop(skillId, params, delta);
      } else if (FREEZE_SKILLS.has(skillId)) {
        this.updateFreeze(skillId, params, delta);
      } else if (ASYLUM_SKILLS.has(skillId)) {
        this.updateAsylum(skillId, params, delta);
      }
      // DARKNESS and THUNDER are event-driven, handled separately
    }
  }

  // ─── Skill refresh on upgrade ───────────────────────────────────────────

  private refreshSkills(): void {
    // No special re-init needed; timers carry over naturally.
    // New skills will get their timer initialized on first update call.
  }

  // ─── Helper: get or init timer ──────────────────────────────────────────

  private getTimer(skillId: string): number {
    if (!this.skillTimers.has(skillId)) {
      this.skillTimers.set(skillId, 0);
    }
    return this.skillTimers.get(skillId)!;
  }

  private setTimer(skillId: string, value: number): void {
    this.skillTimers.set(skillId, value);
  }

  private addTimer(skillId: string, delta: number): number {
    const t = this.getTimer(skillId) + delta;
    this.skillTimers.set(skillId, t);
    return t;
  }

  // ─── Helper: get effective cooldown (respects Haste) ────────────────────

  private getEffectiveCooldown(baseCooldown: number): number {
    const cdMult = this.player.getEffectiveCooldownMultiplier();
    return Math.max(100, baseCooldown * cdMult);
  }

  // ─── Helper: get enemies in radius ──────────────────────────────────────

  private getEnemiesInRadius(cx: number, cy: number, radius: number): Enemy[] {
    const result: Enemy[] = [];
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(cx, cy, enemy.x, enemy.y);
      if (dist <= radius) {
        result.push(enemy);
      }
    }
    return result;
  }

  // ─── Helper: visual pulse effect ────────────────────────────────────────

  private drawPulse(x: number, y: number, radius: number, color: number, alpha = 0.6, duration = 300): void {
    const textureKey = this.scene.textures.exists('fx_circle_orange') ? 'fx_circle_orange' : null;
    if (!textureKey) return;
    const sprite = this.scene.add.sprite(x, y, textureKey, 0);
    sprite.setDepth(DEPTHS.EFFECTS);
    sprite.setTint(color);
    sprite.setAlpha(alpha);
    sprite.setScale(radius / 16);
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0,
      scaleX: (radius * 1.3) / 16,
      scaleY: (radius * 1.3) / 16,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => sprite.destroy(),
    });
  }

  // ─── Helper: expanding ring effect (dual-layer: inner bright, outer dim) ──

  private drawExpandingRing(
    x: number, y: number, startRadius: number, endRadius: number,
    color: number, duration = 400,
  ): void {
    const textureKey = this.scene.textures.exists('fx_circle_spark') ? 'fx_circle_spark' : 'fx_circle_orange';
    if (!this.scene.textures.exists(textureKey)) return;
    const sprite = this.scene.add.sprite(x, y, textureKey, 0);
    sprite.setDepth(DEPTHS.EFFECTS);
    sprite.setTint(color);
    sprite.setAlpha(0.8);
    sprite.setScale(startRadius / 16);
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0,
      scaleX: endRadius / 16,
      scaleY: endRadius / 16,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => sprite.destroy(),
    });
  }

  // ─── Helper: flash particles on AoE impact ────────────────────────────────

  private drawImpactParticles(
    x: number, y: number, color: number, count = 6, speed = 50, duration = 300,
  ): void {
    const textureKey = this.scene.textures.exists('fx_spark') ? 'fx_spark' : null;
    if (!textureKey) return;
    for (let i = 0; i < Math.min(count, 8); i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const spd = speed * (0.6 + Math.random() * 0.8);
      const spark = this.scene.add.sprite(x, y, textureKey, Math.floor(Math.random() * 4));
      spark.setDepth(DEPTHS.EFFECTS + 1);
      spark.setTint(color);
      spark.setAlpha(0.8);
      spark.setScale(0.5);
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * spd * (duration / 1000),
        y: y + Math.sin(angle) * spd * (duration / 1000),
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  // ─── Helper: additive glow flash (creates bloom-like effect) ────────────

  private drawAdditiveGlow(
    x: number, y: number, radius: number, color: number, alpha = 0.35, duration = 400,
  ): void {
    const textureKey = this.scene.textures.exists('fx_circle_spark') ? 'fx_circle_spark' : 'fx_circle_orange';
    if (!this.scene.textures.exists(textureKey)) return;
    const sprite = this.scene.add.sprite(x, y, textureKey, 0);
    sprite.setBlendMode(Phaser.BlendModes.ADD);
    sprite.setDepth(DEPTHS.EFFECTS - 1);
    sprite.setTint(color);
    sprite.setAlpha(alpha);
    sprite.setScale(radius / 16);
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => sprite.destroy(),
    });
  }

    // ═══════════════════════════════════════════════════════════════════════════
  // AURA SKILLS (CONSECRATE, REQUIEM)
  // ═══════════════════════════════════════════════════════════════════════════

  private updateAura(skillId: string, params: Record<string, number>, delta: number): void {
    const radius = params.radius ?? 40;
    const damage = params.damage ?? 3;
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 1000);
    const slowPercent = params.slowPercent ?? 0;

    // Determine color
    const color = skillId === JobSkillId.CONSECRATE ? 0xFFD700 : 0xDAA520;
    const fillColor = skillId === JobSkillId.CONSECRATE ? 0xFFDD44 : 0xCC9922;

    // Draw persistent aura around player using sprites
    let auraSprite = this.auraGraphics.get(skillId) as Phaser.GameObjects.Sprite | undefined;
    if (!auraSprite) {
      auraSprite = this.scene.add.sprite(this.player.x, this.player.y, 'fx_circle_orange', 0);
      auraSprite.setDepth(DEPTHS.EFFECTS - 1);
      auraSprite.setTint(fillColor);
      this.auraGraphics.set(skillId, auraSprite);
    }

    // Subtle pulsing: radius oscillates based on time
    const pulsePhase = (Date.now() % 2000) / 2000; // 0..1 over 2 seconds
    const pulseFactor = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.04; // +/- 4%
    const displayRadius = radius * pulseFactor;

    // Inner fill with slight pulse in alpha
    const fillAlpha = 0.06 + Math.sin(pulsePhase * Math.PI * 2) * 0.03;
    auraSprite.setPosition(this.player.x, this.player.y);
    auraSprite.setScale((displayRadius * 2) / 32);
    auraSprite.setAlpha(fillAlpha);

    // Slowly rotate the sprite over time
    const rotationOffset = (Date.now() % 6000) / 6000 * Math.PI * 2;
    auraSprite.setRotation(rotationOffset);

    // Additive glow layer inside the aura for a subtle bloom effect
    let auraGlowSprite = this.auraGraphics.get(skillId + '_glow') as Phaser.GameObjects.Sprite | undefined;
    if (!auraGlowSprite) {
      auraGlowSprite = this.scene.add.sprite(this.player.x, this.player.y, 'fx_circle_spark', 0);
      auraGlowSprite.setBlendMode(Phaser.BlendModes.ADD);
      auraGlowSprite.setDepth(DEPTHS.EFFECTS - 2);
      auraGlowSprite.setTint(fillColor);
      this.auraGraphics.set(skillId + '_glow', auraGlowSprite);
    }
    const glowAlpha = 0.08 + Math.sin(pulsePhase * Math.PI * 2) * 0.04;
    auraGlowSprite.setPosition(this.player.x, this.player.y);
    auraGlowSprite.setScale((displayRadius * 0.85 * 2) / 32);
    auraGlowSprite.setAlpha(glowAlpha);
    auraGlowSprite.setRotation(-rotationOffset * 0.6);

    // Accumulate timer
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    // Deal damage
    const enemies = this.getEnemiesInRadius(this.player.x, this.player.y, radius);
    for (const enemy of enemies) {
      enemy.takeDamage(damage, false);
      EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      // Requiem slow
      if (slowPercent > 0) {
        enemy.applySlow(slowPercent, 1000);
      }
    }

    // Pulse on tick
    this.drawPulse(this.player.x, this.player.y, radius, color, 0.5, 250);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PERIODIC AOE SKILLS (CHI_BURST, HOLY, BAHAMUT, METEOR, GUST, QUAKE)
  // ═══════════════════════════════════════════════════════════════════════════

  private updatePeriodicAoE(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 5000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const radius = params.radius ?? 50;
    const damage = params.damage ?? 0;
    const stunDuration = params.stunDuration ?? 0;
    const px = this.player.x;
    const py = this.player.y;

    // Determine center and color per skill
    let cx = px;
    let cy = py;
    let color = 0xFFFFFF;

    switch (skillId) {
      case JobSkillId.CHI_BURST:
        color = 0xFF8C00;
        // Use explosion sprite for a real burst visual
        spawnFX(this.scene, cx, cy, 'fx_explosion', {
          scale: (radius * 2) / 40,
          tint: 0xFF8C00,
          alpha: 0.85,
          duration: 400,
          scaleEnd: (radius * 2.5) / 40,
        });
        spawnFX(this.scene, cx, cy, 'fx_explosion', {
          scale: (radius * 1.2) / 40,
          tint: 0xFFCC44,
          alpha: 0.6,
          duration: 300,
          blendMode: Phaser.BlendModes.ADD,
          scaleEnd: (radius * 0.5) / 40,
        });
        this.drawImpactParticles(cx, cy, 0xFFAA00, 8, 60, 300);
        break;

      case JobSkillId.HOLY:
        color = 0xFFFFCC;
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0xFFFFCC, 400);
        spawnFX(this.scene, cx, cy, 'fx_circle_white', { scale: (radius * 2) / 32, tint: 0xFFFFFF, alpha: 0.6, duration: 300, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 2.5) / 32 });
        this.drawImpactParticles(cx, cy, 0xFFFF88, 10, 70, 350);
        break;

      case JobSkillId.METEOR: {
        // Random position near player
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 120 + 30;
        cx = px + Math.cos(angle) * dist;
        cy = py + Math.sin(angle) * dist;
        color = 0xFF3300;
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0xFF3300, 400);
        spawnFX(this.scene, cx, cy, 'fx_flame', { scale: (radius * 1.5) / 40, tint: 0xFF6600, alpha: 0.8, duration: 350, scaleEnd: (radius * 0.5) / 40 });
        this.drawImpactParticles(cx, cy, 0xFF4400, 8, 80, 400);
        break;
      }

      case JobSkillId.GUST:
        color = 0xAAFFAA;
        spawnFX(this.scene, cx, cy, 'fx_plant', { scale: (radius * 2) / 30, tint: 0x44FF44, alpha: 0.8, duration: 350, scaleEnd: (radius * 2.5) / 30 });
        spawnFX(this.scene, cx, cy, 'fx_plant', { scale: (radius * 1.2) / 30, tint: 0x88FF88, alpha: 0.5, duration: 250, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 0.4) / 30 });
        this.drawImpactParticles(cx, cy, 0x44FF44, 6, 60, 300);
        break;

      case JobSkillId.QUAKE:
        color = 0x8B4513;
        playImpactFX(this.scene, cx, cy, 0, 'fx_rock_spike', (radius * 2) / 48, 0xBB8844, 400);
        spawnFX(this.scene, cx, cy, 'fx_rock', { scale: (radius * 1.5) / 30, tint: 0x996633, alpha: 0.8, duration: 350, scaleEnd: (radius * 0.5) / 30 });
        this.drawImpactParticles(cx, cy, 0x886633, 8, 60, 350);
        break;

      case JobSkillId.RAMUH:
        color = 0xFFDD44;
        playImpactFX(this.scene, cx, cy, 0, 'fx_thunder', (radius * 2) / 32, 0xFFDD44, 350);
        spawnFX(this.scene, cx, cy, 'fx_spark', { scale: (radius * 1.5) / 27, tint: 0xFFFF88, alpha: 0.7, duration: 300, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 0.4) / 27 });
        this.drawImpactParticles(cx, cy, 0xFFDD44, 8, 70, 300);
        break;

      case JobSkillId.TITAN:
        color = 0x8B6633;
        playImpactFX(this.scene, cx, cy, 0, 'fx_rock_spike', (radius * 2.5) / 48, 0xAA7744, 450);
        spawnFX(this.scene, cx, cy, 'fx_rock', { scale: (radius * 2) / 30, tint: 0x886633, alpha: 0.8, duration: 400, scaleEnd: (radius * 0.8) / 30 });
        this.drawImpactParticles(cx, cy, 0x996633, 10, 80, 400);
        break;

      case JobSkillId.LEVIATHAN:
        color = 0x4488FF;
        playImpactFX(this.scene, cx, cy, 0, 'fx_water_pillar', (radius * 2) / 27, 0x4488FF, 400);
        spawnFX(this.scene, cx, cy, 'fx_water', { scale: (radius * 2) / 40, tint: 0x2266CC, alpha: 0.8, duration: 400, scaleEnd: (radius * 2.5) / 40 });
        this.drawImpactParticles(cx, cy, 0x4488FF, 8, 70, 350);
        break;

      case JobSkillId.ODIN: {
        color = 0x8844AA;
        playSlashFX(this.scene, cx, cy, Math.random() * Math.PI * 2, 'fx_slash_double', (radius * 2) / 32, 0x8844AA, 350);
        spawnFX(this.scene, cx, cy, 'fx_spirit', { scale: (radius * 1.5) / 32, tint: 0x8844AA, alpha: 0.7, duration: 350, scaleEnd: (radius * 0.5) / 32 });
        this.drawImpactParticles(cx, cy, 0xAA66CC, 8, 70, 300);
        break;
      }

      case JobSkillId.DIABOLOS: {
        color = 0x7733BB;
        spawnFX(this.scene, cx, cy, 'fx_spirit_double', { scale: (radius * 2) / 32, tint: 0x440088, alpha: 0.8, duration: 400, scaleEnd: (radius * 0.3) / 32 });
        spawnFX(this.scene, cx, cy, 'fx_circle_spark', { scale: (radius * 2.5) / 32, tint: 0x220044, alpha: 0.5, duration: 500, scaleEnd: (radius * 0.2) / 32 });
        this.drawImpactParticles(cx, cy, 0x660099, 6, 50, 400);
        break;
      }

      case JobSkillId.KNIGHTS_OF_THE_ROUND: {
        color = 0xFF1144;
        // 13 rapid sequential strikes in a circle
        const strikeCount = params.strikeCount ?? 13;
        for (let s = 0; s < strikeCount; s++) {
          const angle = (s / strikeCount) * Math.PI * 2;
          const sx = cx + Math.cos(angle) * radius * 0.6;
          const sy = cy + Math.sin(angle) * radius * 0.6;
          this.scene.time.delayedCall(s * 80, () => {
            playSlashFX(this.scene, sx, sy, Math.random() * Math.PI * 2, 'fx_cut', SPRITE_SCALE * 1.5, 0xFFDD44, 200);
            this.drawImpactParticles(sx, sy, 0xFFCC44, 3, 30, 200);
          });
        }
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0xFFDD44, 500);
        break;
      }

      // ─── Mastery AoE Skills ─────────────────────────────────────────────

      case MasterySkillId.SOUL_EATER:
        color = 0x440088;
        spawnFX(this.scene, cx, cy, 'fx_spirit_double', { scale: (radius * 2) / 32, tint: 0x440088, alpha: 0.8, duration: 400, scaleEnd: (radius * 0.4) / 32 });
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 1.5) / 40, 0x330066, 350);
        this.drawImpactParticles(cx, cy, 0x660099, 8, 60, 350);
        break;

      case MasterySkillId.INNER_BEAST:
        color = 0xCC2222;
        playSlashFX(this.scene, cx, cy, Math.random() * Math.PI * 2, 'fx_slash_curved', (radius * 2) / 32, 0xCC2222, 350);
        spawnFX(this.scene, cx, cy, 'fx_explosion', { scale: (radius * 1.2) / 40, tint: 0xFF4444, alpha: 0.7, duration: 300, scaleEnd: (radius * 0.4) / 40 });
        this.drawImpactParticles(cx, cy, 0xFF4444, 8, 60, 300);
        break;

      case MasterySkillId.FELL_CLEAVE:
        color = 0xDD3333;
        playSlashFX(this.scene, cx, cy, Math.random() * Math.PI * 2, 'fx_slash_double_curved', (radius * 2.5) / 32, 0xDD3333, 400);
        spawnFX(this.scene, cx, cy, 'fx_explosion', { scale: (radius * 1.5) / 40, tint: 0xFF2222, alpha: 0.8, duration: 350, scaleEnd: (radius * 0.5) / 40 });
        this.drawImpactParticles(cx, cy, 0xFF4444, 10, 80, 350);
        break;

      case MasterySkillId.FLARE:
        color = 0xFF4400;
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 2.5) / 40, 0xFF4400, 450);
        spawnFX(this.scene, cx, cy, 'fx_flame', { scale: (radius * 2) / 40, tint: 0xFF6600, alpha: 0.8, duration: 400, scaleEnd: (radius * 0.6) / 40 });
        this.drawImpactParticles(cx, cy, 0xFF6600, 10, 90, 400);
        break;

      case MasterySkillId.DREADWYRM:
        color = 0x440066;
        spawnFX(this.scene, cx, cy, 'fx_spirit_double', { scale: (radius * 2) / 32, tint: 0x440066, alpha: 0.8, duration: 450, scaleEnd: (radius * 0.3) / 32 });
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 1.8) / 40, 0x330055, 400);
        this.drawImpactParticles(cx, cy, 0x660099, 10, 70, 400);
        break;

      case MasterySkillId.ERUPTION:
        color = 0xFF3300;
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0xFF3300, 400);
        spawnFX(this.scene, cx, cy, 'fx_flame', { scale: (radius * 1.8) / 40, tint: 0xFF5500, alpha: 0.8, duration: 380, scaleEnd: (radius * 0.5) / 40 });
        this.drawImpactParticles(cx, cy, 0xFF4400, 8, 70, 350);
        break;

      case MasterySkillId.LANDSLIDE:
        color = 0x8B4513;
        playImpactFX(this.scene, cx, cy, 0, 'fx_rock_spike', (radius * 2) / 48, 0xAA7744, 400);
        spawnFX(this.scene, cx, cy, 'fx_rock', { scale: (radius * 1.8) / 30, tint: 0x886633, alpha: 0.8, duration: 380, scaleEnd: (radius * 0.6) / 30 });
        this.drawImpactParticles(cx, cy, 0x996633, 8, 70, 350);
        break;

      case MasterySkillId.STARDIVER:
        color = 0x4488FF;
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 2.5) / 40, 0x4488FF, 450);
        spawnFX(this.scene, cx, cy, 'fx_circle_white', { scale: (radius * 2) / 32, tint: 0x6699FF, alpha: 0.7, duration: 400, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 2.5) / 32 });
        this.drawImpactParticles(cx, cy, 0x4488FF, 10, 80, 400);
        break;

      case MasterySkillId.FINALE:
        color = 0xFFFFCC;
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0xFFFFCC, 400);
        spawnFX(this.scene, cx, cy, 'fx_circle_white', { scale: (radius * 2) / 32, tint: 0xFFFFFF, alpha: 0.7, duration: 350, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 2.5) / 32 });
        this.drawImpactParticles(cx, cy, 0xFFFF88, 8, 70, 350);
        break;

      case MasterySkillId.COMET: {
        // Random position near player for each comet
        const cometAngle = Math.random() * Math.PI * 2;
        const cometDist = Math.random() * 100 + 20;
        cx = px + Math.cos(cometAngle) * cometDist;
        cy = py + Math.sin(cometAngle) * cometDist;
        color = 0x8855CC;
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0x8855CC, 400);
        spawnFX(this.scene, cx, cy, 'fx_flame', { scale: (radius * 1.5) / 40, tint: 0x6633AA, alpha: 0.8, duration: 350, scaleEnd: (radius * 0.4) / 40 });
        this.drawImpactParticles(cx, cy, 0x8855CC, 8, 70, 350);
        break;
      }

      case MasterySkillId.MIDARE_SETSUGEKKA:
        color = 0xCCEEFF;
        playSlashFX(this.scene, cx, cy, Math.random() * Math.PI * 2, 'fx_slash_double_curved', (radius * 2) / 32, 0xCCEEFF, 300);
        spawnFX(this.scene, cx, cy, 'fx_ice', { scale: (radius * 1.5) / 32, tint: 0x88CCFF, alpha: 0.7, duration: 300, scaleEnd: (radius * 0.4) / 32 });
        this.drawImpactParticles(cx, cy, 0x88CCFF, 8, 60, 300);
        break;

      case MasterySkillId.EDEN:
        color = 0xFFFFFF;
        playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', (radius * 3) / 40, 0xFFFFFF, 500);
        spawnFX(this.scene, cx, cy, 'fx_circle_white', { scale: (radius * 3) / 32, tint: 0xFFFFFF, alpha: 0.8, duration: 500, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 4) / 32 });
        this.drawImpactParticles(cx, cy, 0xFFFFFF, 12, 100, 500);
        break;
    }

    // Apply effects to enemies in radius
    const enemies = this.getEnemiesInRadius(cx, cy, radius);
    for (const enemy of enemies) {
      // Damage
      if (damage > 0) {
        enemy.takeDamage(damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      }

      // Stun (HOLY, QUAKE, TITAN)
      if (stunDuration > 0) {
        enemy.applyStun(stunDuration);
      }

      // Gust/Leviathan repulsion: push enemies away
      if (skillId === JobSkillId.GUST || skillId === JobSkillId.LEVIATHAN) {
        const dx = enemy.x - cx;
        const dy = enemy.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const pushForce = 250;
        enemy.setVelocity((dx / dist) * pushForce, (dy / dist) * pushForce);
      }

      // Odin execute: % instant kill on low HP enemies
      if (skillId === JobSkillId.ODIN) {
        const threshold = params.executeThreshold ?? 0.20;
        const hpRatio = enemy.currentHP / Math.max(1, enemy.maxHP);
        if (hpRatio < threshold && Math.random() < threshold) {
          enemy.takeDamage(9999, false);
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LASER SKILLS (BAHAMUT, ALEXANDER)
  // ═══════════════════════════════════════════════════════════════════════════

  private updateLaser(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 10000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const beamWidth = params.beamWidth ?? 30;
    const beamLength = params.beamLength ?? 400;
    const damage = params.damage ?? 20;
    const px = this.player.x;
    const py = this.player.y;

    // Determine direction: toward densest enemy cluster
    let bestAngle = Math.random() * Math.PI * 2;
    let bestCount = 0;
    const children = this.enemyGroup.getChildren() as Enemy[];

    // Sample 8 directions, pick the one with most enemies
    for (let i = 0; i < 8; i++) {
      const testAngle = (i / 8) * Math.PI * 2;
      let count = 0;
      for (const e of children) {
        if (!e.active) continue;
        const ex = e.x - px;
        const ey = e.y - py;
        // Project onto beam direction
        const cosA = Math.cos(testAngle);
        const sinA = Math.sin(testAngle);
        const along = ex * cosA + ey * sinA;
        const perp = Math.abs(-ex * sinA + ey * cosA);
        if (along > 0 && along < beamLength && perp < beamWidth) {
          count++;
        }
      }
      if (count > bestCount) {
        bestCount = count;
        bestAngle = testAngle;
      }
    }

    const cosA = Math.cos(bestAngle);
    const sinA = Math.sin(bestAngle);
    const endX = px + cosA * beamLength;
    const endY = py + sinA * beamLength;

    // Determine colors based on skill
    let coreColor = 0xFFFFFF;
    let edgeColor = 0x4488FF;
    let particleColor = 0x88BBFF;

    if (skillId === JobSkillId.ALEXANDER) {
      coreColor = 0xFFFFDD;
      edgeColor = 0xFFD700;
      particleColor = 0xFFEE88;
    }

    // Visual: beam using sprite-based lines (edge glow, core, inner core)
    // Edge glow line
    spawnLine(this.scene, px, py, endX, endY, edgeColor, 700, 0.4);
    // Core beam line
    spawnLine(this.scene, px, py, endX, endY, coreColor, 700, 0.9);
    // Inner bright core line
    spawnLine(this.scene, px, py, endX, endY, 0xFFFFFF, 500, 0.8);

    // Impact particles along beam
    for (let d = 30; d < beamLength; d += 50) {
      const ix = px + cosA * d;
      const iy = py + sinA * d;
      this.drawImpactParticles(ix, iy, particleColor, 3, 20, 300);
    }

    // Camera shake
    // screen shake removed

    // Additive glow at origin
    this.drawAdditiveGlow(px, py, 40, coreColor, 0.5, 300);

    // Dragon silhouette for Bahamut (uses boss sprite)
    if (skillId === JobSkillId.BAHAMUT && this.scene.textures.exists('fx_spirit')) {
      const dragon = this.scene.add.sprite(px, py, 'fx_spirit', 0);
      dragon.setDepth(DEPTHS.EFFECTS + 3);
      dragon.setScale(2);
      dragon.setTint(0x4488FF);
      dragon.setAlpha(0.8);
      dragon.setRotation(bestAngle);
      this.scene.tweens.add({
        targets: dragon,
        alpha: 0,
        scaleX: 3,
        scaleY: 3,
        duration: 500,
        onComplete: () => dragon.destroy(),
      });
    }

    // Damage: all enemies within the beam rectangle
    for (const enemy of children) {
      if (!enemy.active) continue;
      const ex = enemy.x - px;
      const ey = enemy.y - py;
      const along = ex * cosA + ey * sinA;
      const perp = Math.abs(-ex * sinA + ey * cosA);
      if (along > -10 && along < beamLength && perp < beamWidth) {
        enemy.takeDamage(damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // JUMP (DRAGOON)
  // ═══════════════════════════════════════════════════════════════════════════

  private updateJump(skillId: string, params: Record<string, number>, delta: number): void {
    if (this.isJumping || this.isChargingJump) return;
    if (this.lockCooldown > 0) return; // wait for free-movement gap

    const cooldown = Math.max(4000, this.getEffectiveCooldown(params.cooldown ?? 8000));
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    // Start charge phase
    this.isChargingJump = true;
    this.jumpChargeTimer = 0;
    this.jumpSkillId = skillId;
    this.jumpParams = { ...params };
    this.jumpOriginX = this.player.x;
    this.jumpOriginY = this.player.y;

    // Player slows during charge (can still move a bit)
    this.player.playerState.modifiers.speedMultiplier *= 0.55;

    // Create charge visual sprite
    if (!this.jumpChargeGfx) {
      this.jumpChargeGfx = this.scene.add.sprite(this.player.x, this.player.y, 'fx_circle_spark', 0);
      this.jumpChargeGfx.setTint(0x4169E1);
    }
    this.jumpChargeGfx.setDepth(DEPTHS.EFFECTS);
    this.jumpChargeGfx.setAlpha(1);
  }

  private updateJumpCharge(delta: number): void {
    this.jumpChargeTimer += delta;
    const progress = Math.min(this.jumpChargeTimer / this.jumpChargeDuration, 1);

    // Update origin to current player position (they can still drift)
    this.jumpOriginX = this.player.x;
    this.jumpOriginY = this.player.y;

    // Draw charge-up ring converging on player using sprite
    if (this.jumpChargeGfx) {
      const px = this.player.x;
      const py = this.player.y;

      // Converging ring - scale shrinks as progress increases
      const ringRadius = (1 - progress) * 40 * SPRITE_SCALE + 6 * SPRITE_SCALE;
      this.jumpChargeGfx.setPosition(px, py);
      this.jumpChargeGfx.setScale((ringRadius * 2) / 32);
      this.jumpChargeGfx.setAlpha(0.5 + progress * 0.5);

      // Spawn occasional dust particles rising from ground
      if (Math.random() < 0.15) {
        const angle = Math.random() * Math.PI * 2;
        const dist = ringRadius * 0.8;
        const px2 = px + Math.cos(angle) * dist;
        const py2 = py + Math.sin(angle) * dist;
        spawnFX(this.scene, px2, py2, 'fx_smoke_circular', {
          scale: 0.5, tint: 0x8899AA, alpha: 0.5 * (1 - progress * 0.5),
          duration: 200, depth: DEPTHS.EFFECTS,
        });
      }

      // Player squishes down (crouching to jump)
      this.player.setScale(SPRITE_SCALE * (1 + progress * 0.1), SPRITE_SCALE * (1 - progress * 0.2));
    }

    // Charge complete -> launch jump
    if (progress >= 1) {
      this.isChargingJump = false;

      // Restore speed multiplier
      this.player.playerState.modifiers.speedMultiplier /= 0.55;

      // Clean up charge gfx
      if (this.jumpChargeGfx) {
        this.jumpChargeGfx.setAlpha(0);
      }

      // Reset scale
      this.player.setScale(SPRITE_SCALE);

      // Now start the actual jump
      this.isJumping = true;
      this.jumpTimer = 0;

      this.player.playerState.isInvulnerable = true;
      if (this.player.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).enable = false;
      }

      if (!this.jumpShadowGfx) {
        this.jumpShadowGfx = this.scene.add.sprite(this.player.x, this.player.y, 'fx_circle_orange', 0);
        this.jumpShadowGfx.setTint(0x000000);
      }
      this.jumpShadowGfx.setDepth(DEPTHS.GROUND + 1);
      this.jumpShadowGfx.setAlpha(1);
    }
  }

  private updateJumpInProgress(delta: number): void {
    this.jumpTimer += delta;
    const totalDuration = this.jumpDuration; // 600ms
    const progress = Math.min(this.jumpTimer / totalDuration, 1);

    // Phase 1: Ascend (0 -> 0.5) - player rises up
    // Phase 2: Hover briefly (0.5 -> 0.65)
    // Phase 3: Descend fast (0.65 -> 1.0)
    const ascendEnd = 0.5;
    const hoverEnd = 0.65;

    let heightFactor: number; // 0 = ground, 1 = peak
    if (progress < ascendEnd) {
      // Ascend with ease-out
      const t = progress / ascendEnd;
      heightFactor = 1 - Math.pow(1 - t, 2);
    } else if (progress < hoverEnd) {
      heightFactor = 1;
    } else {
      // Descend with ease-in (fast slam)
      const t = (progress - hoverEnd) / (1 - hoverEnd);
      heightFactor = 1 - t * t;
    }

    const maxHeight = 200 * SPRITE_SCALE; // very high jump
    const yOffset = -heightFactor * maxHeight;

    // Move the player sprite visually upward (keep x the same)
    this.player.y = this.jumpOriginY + yOffset;
    this.player.x = this.jumpOriginX;

    // Scale slightly at peak for perspective (preserve SPRITE_SCALE)
    const scale = SPRITE_SCALE * (1 + heightFactor * 0.4);
    this.player.setScale(scale);

    // Spinning dive animation during descent
    if (progress > hoverEnd) {
      const descendProgress = (progress - hoverEnd) / (1 - hoverEnd);
      this.player.setAngle(descendProgress * 360);
    } else {
      this.player.setAngle(0);
    }

    // Draw shadow on the ground (shrinks as player goes higher) using sprite
    if (this.jumpShadowGfx) {
      const shadowScale = 1 - heightFactor * 0.5;
      const shadowAlpha = 0.4 * (1 - heightFactor * 0.3);
      this.jumpShadowGfx.setPosition(this.jumpOriginX, this.jumpOriginY + 2 * SPRITE_SCALE);
      this.jumpShadowGfx.setScale(
        (12 * SPRITE_SCALE * shadowScale) / 16,
        (4 * SPRITE_SCALE * shadowScale) / 16,
      );
      this.jumpShadowGfx.setAlpha(shadowAlpha);
    }

    // Landing
    if (progress >= 1) {
      this.isJumping = false;
      this.jumpTimer = 0;

      // Restore player
      this.player.setScale(SPRITE_SCALE);
      this.player.setAngle(0);
      this.player.x = this.jumpOriginX;
      this.player.y = this.jumpOriginY;
      this.player.playerState.isInvulnerable = false;

      // Re-enable physics body
      if (this.player.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).enable = true;
      }

      // Clean up shadow
      if (this.jumpShadowGfx) {
        this.jumpShadowGfx.setAlpha(0);
      }

      // AoE damage on landing
      const radius = this.jumpParams.radius ?? 40;
      const damage = this.jumpParams.damage ?? 15;
      const lx = this.jumpOriginX;
      const ly = this.jumpOriginY;

      const enemies = this.getEnemiesInRadius(lx, ly, radius);
      for (const enemy of enemies) {
        enemy.takeDamage(damage, true);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      }

      // Big impact visual - expanding shockwave
      this.drawExpandingRing(lx, ly, 5, radius, 0x4169E1, 500);
      this.drawExpandingRing(lx, ly, 3, radius * 0.6, 0x6699FF, 300);
      this.drawPulse(lx, ly, radius, 0x88BBFF, 0.9, 400);

      // Impact dust particles using sprite-based burst
      spawnParticleBurst(this.scene, lx, ly, 8, 0x8899AA, 40, 300);

      // Strong camera shake on impact
      // screen shake removed

      // Set lock cooldown to ensure free-movement gap
      this.lockCooldown = JobSkillManager.LOCK_GAP;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BARRAGE (RANGER) - cone of projectiles
  // ═══════════════════════════════════════════════════════════════════════════

  private updateBarrage(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 6000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const count = params.count ?? 5;
    const px = this.player.x;
    const py = this.player.y;

    // Find nearest enemy for aim direction
    let aimAngle = 0;
    let nearestDist = Infinity;
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
      if (d < nearestDist) {
        nearestDist = d;
        aimAngle = Math.atan2(enemy.y - py, enemy.x - px);
      }
    }

    // Spread projectiles in a cone
    const coneSpread = Math.PI * 0.4; // ~72 degree cone total
    const speed = 200;
    const damage = 5; // Base barrage arrow damage
    const startAngle = aimAngle - coneSpread / 2;
    const step = count > 1 ? coneSpread / (count - 1) : 0;

    for (let i = 0; i < count; i++) {
      const angle = count > 1 ? startAngle + step * i : aimAngle;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // Get a projectile from the pool
      const proj = this.projectileGroup.getFirstDead(false);
      if (proj) {
        proj.fire(
          px, py,
          vx, vy,
          'kunai',    // texture
          damage,
          0,          // pierce
          1,          // damage retention
          'barrage' as any,  // weaponId placeholder
          null,       // enchant
          0,          // enchant tier
          1500,       // max lifetime
        );
      }
    }

    // Visual muzzle flash
    this.drawPulse(px, py, 12, 0x228B22, 0.6, 200);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FAMILIAR SKILLS (IFRIT, SHIVA)
  // ═══════════════════════════════════════════════════════════════════════════

  private updateFamiliar(skillId: string, params: Record<string, number>, delta: number): void {
    const attackInterval = params.attackInterval ?? 1500;
    const damage = params.damage ?? 0;
    const slowPercent = params.slowPercent ?? 0;

    // Initialize angle if needed
    if (!this.familiarAngles.has(skillId)) {
      // Offset familiars so they don't overlap
      const startAngle = skillId === JobSkillId.IFRIT ? 0 : Math.PI;
      this.familiarAngles.set(skillId, startAngle);
      this.familiarAttackTimers.set(skillId, 0);
    }

    // Orbit around player
    const angle = this.familiarAngles.get(skillId)! + FAMILIAR_ORBIT_SPEED * (delta / 1000);
    this.familiarAngles.set(skillId, angle % (Math.PI * 2));

    const fx = this.player.x + Math.cos(angle) * FAMILIAR_ORBIT_RADIUS;
    const fy = this.player.y + Math.sin(angle) * FAMILIAR_ORBIT_RADIUS;

    // Draw familiar using sprites
    let familiarSprite = this.familiarGraphics.get(skillId);
    if (!familiarSprite) {
      const isIfrit = skillId === JobSkillId.IFRIT;
      const isPhoenix = skillId === MasterySkillId.PHOENIX;
      const texKey = isIfrit ? 'fx_flame' : (isPhoenix ? 'fx_flame' : 'fx_ice');
      const tint = isIfrit ? 0xFF6600 : (isPhoenix ? 0xFF4400 : 0x44AAFF);
      familiarSprite = this.scene.add.sprite(fx, fy, texKey, 0);
      familiarSprite.setDepth(DEPTHS.EFFECTS);
      familiarSprite.setTint(tint);
      familiarSprite.setScale(1.2);
      this.familiarGraphics.set(skillId, familiarSprite);
    }

    // Reposition familiar sprite each frame
    familiarSprite.setPosition(fx, fy);
    // Subtle flicker effect via alpha
    const flickerAlpha = 0.7 + Math.sin(Date.now() * 0.01) * 0.2;
    familiarSprite.setAlpha(flickerAlpha);

    // Attack timer: damage enemies the familiar touches
    const atkTimer = (this.familiarAttackTimers.get(skillId) ?? 0) + delta;
    if (atkTimer >= attackInterval) {
      this.familiarAttackTimers.set(skillId, atkTimer - attackInterval);

      const enemies = this.getEnemiesInRadius(fx, fy, FAMILIAR_HIT_RADIUS);
      for (const enemy of enemies) {
        if (damage > 0) {
          enemy.takeDamage(damage, false);
          EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        }
        if (slowPercent > 0) {
          enemy.applySlow(slowPercent, 1500);
        }
      }

      // Small spark effect on attack
      if (enemies.length > 0) {
        const sparkColor = skillId === JobSkillId.IFRIT ? 0xFF6600 : 0x66CCFF;
        this.drawPulse(fx, fy, FAMILIAR_HIT_RADIUS, sparkColor, 0.5, 200);
      }
    } else {
      this.familiarAttackTimers.set(skillId, atkTimer);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TRAIL (PITFALL)
  // ═══════════════════════════════════════════════════════════════════════════

  private updateTrail(skillId: string, params: Record<string, number>, delta: number): void {
    const damage = params.damage ?? 2;
    const duration = params.duration ?? 2000;
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 500);

    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    // Drop a damage zone at player's current position using sprite
    const trailSprite = this.scene.add.sprite(this.player.x, this.player.y, 'fx_circle_orange', 0);
    trailSprite.setDepth(DEPTHS.EFFECTS - 2);
    trailSprite.setTint(0x8B4513);
    trailSprite.setAlpha(0.35);
    trailSprite.setScale((TRAIL_ZONE_RADIUS * 2) / 32);

    this.trailZones.push({
      x: this.player.x,
      y: this.player.y,
      damage,
      remaining: duration,
      tickTimer: 0,
      graphics: trailSprite,
    });
  }

  private updateTrailZones(delta: number): void {
    for (let i = this.trailZones.length - 1; i >= 0; i--) {
      const zone = this.trailZones[i];
      zone.remaining -= delta;
      zone.tickTimer += delta;

      if (zone.remaining <= 0) {
        zone.graphics.destroy();
        this.trailZones.splice(i, 1);
        continue;
      }

      // Fade out as duration decreases
      const alpha = Math.min(1, zone.remaining / 500);
      zone.graphics.setAlpha(alpha);

      // Deal damage periodically
      if (zone.tickTimer >= TRAIL_TICK_INTERVAL) {
        zone.tickTimer -= TRAIL_TICK_INTERVAL;
        const enemies = this.getEnemiesInRadius(zone.x, zone.y, TRAIL_ZONE_RADIUS);
        for (const enemy of enemies) {
          enemy.takeDamage(zone.damage, false);
          EventBus.emit(EVENTS.ENEMY_HIT, enemy, zone.damage);
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELIXIR (auto-heal)
  // ═══════════════════════════════════════════════════════════════════════════

  private updateElixir(skillId: string, params: Record<string, number>, delta: number): void {
    const healPercent = params.healPercent ?? 0.30;
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 60000);

    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    // Only heal if below max HP
    const maxHP = this.player.getEffectiveMaxHP();
    const currentHP = this.player.playerState.stats.currentHP;
    if (currentHP >= maxHP) {
      // Don't waste the cooldown; reset timer to near-ready so it checks again soon
      this.setTimer(skillId, cooldown - 500);
      return;
    }

    const healAmount = Math.floor(maxHP * healPercent);
    this.player.heal(healAmount);

    // Green heal visual
    this.drawExpandingRing(this.player.x, this.player.y, 5, 25, 0x32CD32, 400);
    this.drawPulse(this.player.x, this.player.y, 20, 0x44FF44, 0.7, 300);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZANTETSUKEN (Samurai line slash)
  // ═══════════════════════════════════════════════════════════════════════════

  private updateZantetsuken(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 10000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const range = params.range ?? 120;
    const damage = params.damage ?? 20;
    const px = this.player.x;
    const py = this.player.y;

    // Find nearest enemy for aim direction
    let aimAngle = 0;
    let nearestDist = Infinity;
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
      if (d < nearestDist) {
        nearestDist = d;
        aimAngle = Math.atan2(enemy.y - py, enemy.x - px);
      }
    }

    // Slash line: damage all enemies in a rectangle extending from player
    const slashWidth = 16;
    const endX = px + Math.cos(aimAngle) * range;
    const endY = py + Math.sin(aimAngle) * range;

    for (const enemy of children) {
      if (!enemy.active) continue;
      // Point-to-line distance check
      const dist = this.pointToSegmentDist(enemy.x, enemy.y, px, py, endX, endY);
      if (dist <= slashWidth) {
        enemy.takeDamage(damage, true);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      }
    }

    // Slash visual: line from player outward using sprite-based lines
    spawnLine(this.scene, px, py, endX, endY, 0xB22222, 250, 0.9);
    spawnLine(this.scene, px, py, endX, endY, 0xFF4444, 250, 0.4);
  }

  private pointToSegmentDist(
    px: number, py: number,
    ax: number, ay: number,
    bx: number, by: number,
  ): number {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Phaser.Math.Distance.Between(px, py, ax, ay);

    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const closestX = ax + t * dx;
    const closestY = ay + t * dy;
    return Phaser.Math.Distance.Between(px, py, closestX, closestY);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ORBITAL SKILLS (SACRED_ORBIT) - persistent shields orbiting the player
  // ═══════════════════════════════════════════════════════════════════════════

  private updateOrbital(skillId: string, params: Record<string, number>, delta: number): void {
    const count = params.count ?? 2;
    const damage = params.damage ?? 10;
    const hitInterval = params.hitInterval ?? 300;
    const orbitRadius = params.orbitRadius ?? 30;
    const orbitSpeed = 2; // rad/s

    // If shield count changed (level up), tear down old shields and recreate
    const prevCount = this.orbitalLastCount.get(skillId) ?? 0;
    if (prevCount !== count) {
      this.destroyOrbitalShields(skillId);
      this.orbitalLastCount.set(skillId, count);

      // Create new shield images
      const images: Phaser.GameObjects.Image[] = [];
      const angles: number[] = [];
      const timers: number[] = [];
      for (let i = 0; i < count; i++) {
        const img = this.scene.add.sprite(this.player.x, this.player.y, 'fx_shield_yellow', 0);
        img.setScale(1.5);
        img.setDepth(DEPTHS.EFFECTS);
        images.push(img);
        angles.push((Math.PI * 2 / count) * i);
        timers.push(0);
      }
      this.orbitalImages.set(skillId, images);
      this.orbitalAngles.set(skillId, angles);
      this.orbitalHitTimers.set(skillId, timers);
    }

    const images = this.orbitalImages.get(skillId);
    const angles = this.orbitalAngles.get(skillId);
    const timers = this.orbitalHitTimers.get(skillId);
    if (!images || !angles || !timers) return;

    const deltaSec = delta / 1000;

    for (let i = 0; i < images.length; i++) {
      // Rotate the angle
      angles[i] = (angles[i] + orbitSpeed * deltaSec) % (Math.PI * 2);

      // Position the shield
      const sx = this.player.x + Math.cos(angles[i]) * orbitRadius;
      const sy = this.player.y + Math.sin(angles[i]) * orbitRadius;
      images[i].setPosition(sx, sy);
      images[i].setRotation(angles[i] + Math.PI / 2);

      // Hit detection timer
      timers[i] += delta;
      if (timers[i] >= hitInterval) {
        timers[i] -= hitInterval;

        const enemies = this.getEnemiesInRadius(sx, sy, 14);
        for (const enemy of enemies) {
          enemy.takeDamage(damage, false);
          EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        }

        // Small golden pulse on hit
        if (enemies.length > 0) {
          this.drawPulse(sx, sy, 10, 0xFFD700, 0.5, 200);
        }
      }
    }
  }

  private destroyOrbitalShields(skillId: string): void {
    const images = this.orbitalImages.get(skillId);
    if (images) {
      for (const img of images) {
        img.destroy();
      }
    }
    this.orbitalImages.delete(skillId);
    this.orbitalAngles.delete(skillId);
    this.orbitalHitTimers.delete(skillId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // KATON (Ninja) - fireball projectile that explodes on impact
  // ═══════════════════════════════════════════════════════════════════════════

  private updateFireball(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 5000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const radius = params.radius ?? 60;
    const damage = params.damage ?? 12;
    const burnDamage = params.burnDamage ?? 3;
    const burnDuration = params.burnDuration ?? 2000;
    const px = this.player.x;
    const py = this.player.y;

    // Find nearest enemy as target
    let target: Enemy | null = null;
    let nearestDist = Infinity;
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
      if (d < nearestDist && d <= radius * 3) { nearestDist = d; target = enemy; }
    }
    if (!target) return;

    const tx = target.x;
    const ty = target.y;
    const dist = Phaser.Math.Distance.Between(px, py, tx, ty);
    const travelDuration = Math.max(150, dist * 1.5);

    // Scale visual with damage (higher level = bigger fireball)
    const fbScale = 0.7 + damage / 25; // 12→1.18, 20→1.5, 30→1.9

    // Create fireball visual using sprite
    const fireball = this.scene.add.sprite(px, py, 'fx_flame', 0);
    fireball.setDepth(DEPTHS.EFFECTS + 1);
    fireball.setTint(0xFFAA00);
    fireball.setScale(fbScale);
    fireball.setAlpha(0.9);

    // Muzzle flash at player (scales with level)
    spawnFlash(this.scene, px, py, 10 * fbScale, 0xFF6600, 150);

    // Store target for explosion callback
    const fireballTargetX = tx;
    const fireballTargetY = ty;

    // Tween fireball to target position
    this.scene.tweens.add({
      targets: fireball,
      x: tx,
      y: ty,
      duration: travelDuration,
      ease: 'Quad.easeIn',
      onUpdate: () => {
        // Spawn trailing fire particles (reduced frequency for perf)
        if (Math.random() < 0.08) {
          spawnFX(this.scene,
            fireball.x + (Math.random() - 0.5) * 4 * fbScale,
            fireball.y + (Math.random() - 0.5) * 4 * fbScale,
            'fx_smoke_circular', {
              scale: (0.3 + Math.random() * 0.3) * fbScale,
              tint: 0xFF6600, alpha: 0.6, duration: 200, depth: DEPTHS.EFFECTS,
            });
        }
      },
      onComplete: () => {
        const explosionX = fireball.x;
        const explosionY = fireball.y;
        fireball.destroy();
        // Explode at impact point
        this.fireballExplode(explosionX, explosionY, radius, damage, burnDamage, burnDuration);
      },
    });
  }

  private fireballExplode(
    x: number, y: number, radius: number,
    damage: number, burnDamage: number, burnDuration: number,
  ): void {
    // Damage + burn enemies in radius
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (d <= radius) {
        enemy.takeDamage(damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        if (burnDamage > 0) {
          enemy.applyBurn(burnDamage, burnDuration);
        }
      }
    }

    // Explosion visual
    this.drawExpandingRing(x, y, 5, radius, 0xFF4400, 400);
    this.drawExpandingRing(x, y, 3, radius * 0.6, 0xFF8800, 300);
    this.drawPulse(x, y, radius * 0.7, 0xFF6600, 0.8, 300);
    this.drawImpactParticles(x, y, 0xFF4400, 10, 70, 350);
    this.drawAdditiveGlow(x, y, radius * 0.6, 0xFF4400, 0.4, 400);
    // screen shake removed
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RAITON (Ninja) - random lightning strikes from above
  // ═══════════════════════════════════════════════════════════════════════════

  private updateLightningStrike(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 6000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const strikeCount = params.chainTargets ?? 3;
    const damage = params.damage ?? 15;
    const range = params.chainRange ?? 80;
    const px = this.player.x;
    const py = this.player.y;

    // Collect all enemies in range
    const candidates: Enemy[] = [];
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
      if (d <= range * 2) candidates.push(enemy);
    }
    if (candidates.length === 0) return;

    // Pick random enemies (up to strikeCount)
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const targets = candidates.slice(0, strikeCount);

    // Strike each target with a staggered delay
    for (let i = 0; i < targets.length; i++) {
      const enemy = targets[i];
      const delay = i * 100; // stagger strikes by 100ms
      this.scene.time.delayedCall(delay, () => {
        if (!enemy.active) return;
        enemy.takeDamage(damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        this.drawLightningStrike(enemy.x, enemy.y, damage);
      });
    }
  }

  private drawLightningStrike(x: number, y: number, power: number): void {
    const scale = 0.6 + power / 25; // 15→1.2, 22→1.48, 30→1.8
    const boltHeight = 80 * scale;
    const topY = y - boltHeight;

    // Draw bolt from above (thicker at higher levels)
    this.drawLightningBolt(x + (Math.random() - 0.5) * 10 * scale, topY, x, y, scale);

    // Second branch bolt at higher power
    if (power >= 22) {
      this.drawLightningBolt(x + (Math.random() - 0.5) * 16 * scale, topY - 10, x, y, scale * 0.6);
    }

    // Impact flash at ground (scales with power) using sprites
    spawnFlash(this.scene, x, y, 8 * scale, 0xFFFF44, 250);
    spawnFlash(this.scene, x, y, 14 * scale, 0x4488FF, 250);

    // Ground scorch (scales with power)
    this.drawPulse(x, y, 10 * scale, 0x4444FF, 0.6, 200);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DOTON (Ninja) - ground zone (slow + damage)
  // ═══════════════════════════════════════════════════════════════════════════

  private updateGroundZone(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 8000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const radius = params.radius ?? 50;
    const damage = params.damage ?? 8;
    const duration = params.duration ?? 3000;
    const px = this.player.x;
    const py = this.player.y;

    // Place zone at nearest enemy cluster
    let cx = px, cy = py;
    let nearestDist = Infinity;
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
      if (d < nearestDist && d <= radius * 3) { nearestDist = d; cx = enemy.x; cy = enemy.y; }
    }

    const groundSprite = this.scene.add.sprite(cx, cy, 'fx_circle_orange', 0);
    groundSprite.setDepth(DEPTHS.EFFECTS - 2);
    groundSprite.setTint(0x554422);
    groundSprite.setScale((radius * 2) / 32);
    groundSprite.setAlpha(0.5);

    this.groundZones.push({
      x: cx, y: cy, damage, slowPercent: 0.5,
      remaining: duration, tickTimer: 0, graphics: groundSprite,
    });

    // Initial impact visual
    this.drawExpandingRing(cx, cy, 5, radius, 0x8B4513, 400);
    this.drawImpactParticles(cx, cy, 0xAA6633, 8, 50, 300);
  }

  private updateGroundZones(delta: number): void {
    for (let i = this.groundZones.length - 1; i >= 0; i--) {
      const zone = this.groundZones[i];
      zone.remaining -= delta;
      zone.tickTimer += delta;

      if (zone.remaining <= 0) {
        zone.graphics.destroy();
        this.groundZones.splice(i, 1);
        continue;
      }

      // Update zone visual using sprite properties
      const alpha = Math.min(1, zone.remaining / 500) * 0.6;
      // Look up radius from the skill level
      const skillLevels = this.player.playerState.jobSkillLevels;
      const level = skillLevels[MasterySkillId.DOTON] ?? 1;
      const def = MASTERY_SKILL_DEFS[MasterySkillId.DOTON];
      const zoneRadius = def?.levels[level - 1]?.params?.radius ?? 50;

      const time = this.scene.time.now;
      const pulse = 0.5 + 0.15 * Math.sin(time * 0.004);

      // Update sprite alpha and scale with pulse
      zone.graphics.setAlpha(alpha * pulse);
      zone.graphics.setScale((zoneRadius * 2) / 32);
      zone.graphics.setRotation(time * 0.001);

      // Spawn occasional dust particle sprites rising from the zone
      if (Math.random() < 0.05) {
        const pAngle = Math.random() * Math.PI * 2;
        const dist = zoneRadius * (0.2 + Math.random() * 0.6);
        const px = zone.x + Math.cos(pAngle) * dist;
        const py = zone.y + Math.sin(pAngle) * dist;
        spawnFX(this.scene, px, py, 'fx_smoke_circular', {
          scale: 0.3, tint: 0xBB9955, alpha: alpha * 0.6,
          duration: 400, depth: DEPTHS.EFFECTS - 1,
        });
      }

      // Damage + slow every 500ms
      if (zone.tickTimer >= 500) {
        zone.tickTimer -= 500;
        const enemies = this.getEnemiesInRadius(zone.x, zone.y, zoneRadius);
        for (const enemy of enemies) {
          enemy.takeDamage(zone.damage, false);
          EventBus.emit(EVENTS.ENEMY_HIT, enemy, zone.damage);
          enemy.applySlow(zone.slowPercent, 600);
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WAR CRY (Berserker) - AoE stun + damage buff
  // ═══════════════════════════════════════════════════════════════════════════

  private updateWarCry(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 10000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const radius = params.radius ?? 80;
    const stunDuration = params.stunDuration ?? 1000;
    const buffDamage = params.buffDamage ?? 0.20;
    const buffDuration = params.buffDuration ?? 5000;
    const px = this.player.x;
    const py = this.player.y;

    // AoE stun enemies
    const enemies = this.getEnemiesInRadius(px, py, radius);
    for (const enemy of enemies) {
      enemy.applyStun(stunDuration);
    }

    // Apply temporary damage buff to player
    this.player.playerState.modifiers.damageMultiplier += buffDamage;
    this.scene.time.delayedCall(buffDuration, () => {
      this.player.playerState.modifiers.damageMultiplier -= buffDamage;
    });

    // Visual: red/orange shockwave
    this.drawExpandingRing(px, py, 10, radius, 0xDC143C, 500);
    this.drawExpandingRing(px, py, 5, radius * 0.7, 0xFF4444, 350);
    this.drawAdditiveGlow(px, py, radius * 0.5, 0xFF4400, 0.35, 400);
    // screen shake removed
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RAMPAGE (Berserker) - charge dash with damage
  // ═══════════════════════════════════════════════════════════════════════════

  private updateCharge(skillId: string, params: Record<string, number>, delta: number): void {
    if (this.isCharging) return;
    if (this.lockCooldown > 0) return; // wait for free-movement gap

    const cooldown = Math.max(4000, this.getEffectiveCooldown(params.cooldown ?? 8000));
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    // Find nearest enemy for charge direction
    const px = this.player.x;
    const py = this.player.y;
    let aimAngle = 0;
    let nearestDist = Infinity;
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
      if (d < nearestDist) { nearestDist = d; aimAngle = Math.atan2(enemy.y - py, enemy.x - px); }
    }

    this.isCharging = true;
    this.chargeTimer = 0;
    this.chargeSkillId = skillId;
    this.chargeParams = { ...params };
    this.chargeAngle = aimAngle;
    this.chargeHitEnemies.clear();
    this.player.playerState.isInvulnerable = true;
  }

  private updateChargeInProgress(delta: number): void {
    this.chargeTimer += delta;
    const progress = Math.min(this.chargeTimer / this.chargeDuration, 1);
    const range = this.chargeParams.range ?? 120;
    const damage = this.chargeParams.damage ?? 20;
    const speed = range / (this.chargeDuration / 1000);

    // Move player in charge direction
    const dx = Math.cos(this.chargeAngle) * speed * (delta / 1000);
    const dy = Math.sin(this.chargeAngle) * speed * (delta / 1000);
    this.player.x += dx;
    this.player.y += dy;

    // Hit enemies along the way
    const hitRadius = 20;
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active || this.chargeHitEnemies.has(enemy)) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (d <= hitRadius) {
        enemy.takeDamage(damage, true);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        this.chargeHitEnemies.add(enemy);
      }
    }

    // Trail visual
    if (Math.random() < 0.5) {
      this.drawPulse(this.player.x, this.player.y, 8, 0xDC143C, 0.5, 200);
    }

    if (progress >= 1) {
      this.isCharging = false;
      this.player.playerState.isInvulnerable = false;
      this.chargeHitEnemies.clear();
      // Impact at end
      this.drawExpandingRing(this.player.x, this.player.y, 5, 30, 0xFF4444, 300);
      this.lockCooldown = JobSkillManager.LOCK_GAP;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RAIN OF ARROWS (Ranger) - arrow rain in area
  // ═══════════════════════════════════════════════════════════════════════════

  private updateArrowRain(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 7000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const radius = params.radius ?? 70;
    const impacts = params.count ?? 8;
    const damage = params.damage ?? 6;
    const px = this.player.x;
    const py = this.player.y;

    // Target area: nearest enemy position
    let cx = px, cy = py;
    let nearestDist = Infinity;
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
      if (d < nearestDist && d <= 300) { nearestDist = d; cx = enemy.x; cy = enemy.y; }
    }

    // Spawn impact arrows over time (staggered)
    for (let i = 0; i < impacts; i++) {
      const delay = i * 80; // stagger each arrow
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      const impactX = cx + Math.cos(angle) * dist;
      const impactY = cy + Math.sin(angle) * dist;

      this.scene.time.delayedCall(delay, () => {
        // Damage enemies at impact
        const enemies = this.getEnemiesInRadius(impactX, impactY, 12);
        for (const enemy of enemies) {
          enemy.takeDamage(damage, false);
          EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        }

        // Arrow impact visual using sprite-based FX
        // Arrow falling line
        spawnLine(this.scene, impactX, impactY - 20, impactX, impactY, 0x228B22, 300, 0.8);
        // Impact spark
        spawnFlash(this.scene, impactX, impactY, 3, 0x44AA44, 300);
      });
    }

    // Zone indicator
    this.drawPulse(cx, cy, radius, 0x228B22, 0.3, 600);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CRESCENDO / HADOUKEN - piercing projectile
  // ═══════════════════════════════════════════════════════════════════════════

  private updatePiercingProjectile(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 6000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const damage = params.damage ?? 15;
    const speed = params.speed ?? 200;
    const px = this.player.x;
    const py = this.player.y;

    // Aim at nearest enemy
    let aimAngle = 0;
    let nearestDist = Infinity;
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
      if (d < nearestDist) { nearestDist = d; aimAngle = Math.atan2(enemy.y - py, enemy.x - px); }
    }

    const isHadouken = skillId === JobSkillId.HADOUKEN;
    const color = isHadouken ? 0xFF8C00 : 0xDAA520;
    const glowColor = isHadouken ? 0xFFDD44 : 0xFFDD88;
    const projScale = 0.7 + damage / 25; // scales with level: 15→1.3, 25→1.7, 35→2.1
    const projSize = (isHadouken ? 10 : 10) * projScale;

    // Use a tween to move a position tracker, and update graphics from scene update
    const projState = {
      x: px, y: py,
      vx: Math.cos(aimAngle) * speed,
      vy: Math.sin(aimAngle) * speed,
      alive: true,
      age: 0,
      hitEnemies: new Set<Enemy>(),
    };
    const maxLifetime = 2500;

    // Projectile sprite
    const projTexture = isHadouken ? 'energyball' : 'big_energyball';
    const projSprite = this.scene.add.sprite(px, py, projTexture, 0);
    projSprite.setDepth(DEPTHS.EFFECTS);
    projSprite.setScale(projScale * 0.8);
    projSprite.setTint(color);
    projSprite.setRotation(aimAngle);

    // Trail glow sprite (additive blend, follows behind)
    const trailSprite = this.scene.add.sprite(px, py, 'fx_circle_spark', 0);
    trailSprite.setBlendMode(Phaser.BlendModes.ADD);
    trailSprite.setDepth(DEPTHS.EFFECTS - 1);
    trailSprite.setTint(color);
    trailSprite.setScale(projScale * 0.5);
    trailSprite.setAlpha(0.3);

    // Register a scene update handler for this projectile
    const updateHandler = (_time: number, dt: number) => {
      if (!projState.alive) return;
      const dtSec = dt / 1000;
      projState.x += projState.vx * dtSec;
      projState.y += projState.vy * dtSec;
      projState.age += dt;

      if (projState.age >= maxLifetime) {
        projState.alive = false;
        this.scene.events.off('update', updateHandler);
        this.scene.tweens.add({
          targets: [projSprite, trailSprite], alpha: 0, duration: 200,
          onComplete: () => { projSprite.destroy(); trailSprite.destroy(); },
        });
        return;
      }

      // Reposition projectile sprite
      projSprite.setPosition(projState.x, projState.y);

      // Trail follows slightly behind
      trailSprite.setPosition(
        projState.x - projState.vx * dtSec * 3,
        projState.y - projState.vy * dtSec * 3,
      );

      // Spawn occasional trailing particles
      if (Math.random() < 0.15) {
        spawnFX(this.scene, projState.x, projState.y, 'fx_smoke_circular', {
          scale: projScale * 0.3, tint: color, alpha: 0.25,
          duration: 150, depth: DEPTHS.EFFECTS - 1,
          blendMode: Phaser.BlendModes.ADD,
        });
      }

      // Hit detection
      const enemies = this.getEnemiesInRadius(projState.x, projState.y, projSize + 6);
      for (const enemy of enemies) {
        if (projState.hitEnemies.has(enemy)) continue;
        enemy.takeDamage(damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        projState.hitEnemies.add(enemy);
        this.drawPulse(enemy.x, enemy.y, 12, color, 0.7, 200);
        this.drawImpactParticles(enemy.x, enemy.y, color, 4, 40, 200);
      }
    };

    this.scene.events.on('update', updateHandler);

    // Muzzle flash + additive glow
    this.drawPulse(px, py, 14, color, 0.7, 250);
    this.drawAdditiveGlow(px, py, 16, color, 0.4, 250);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAGON DIVE (Dragoon) - big jump + flames on landing
  // ═══════════════════════════════════════════════════════════════════════════

  private updateDragonDive(skillId: string, params: Record<string, number>, delta: number): void {
    if (this.isDragonDiving || this.isDragonDiveAiming || this.isJumping) return;
    if (this.lockCooldown > 0) return; // wait for free-movement gap

    const cooldown = Math.max(4000, this.getEffectiveCooldown(params.cooldown ?? 10000));
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    // Start aim phase
    this.isDragonDiveAiming = true;
    this.dragonDiveAimTimer = 0;
    this.dragonDiveSkillId = skillId;
    this.dragonDiveParams = { ...params };

    // Slow player during aim (less harsh than Jump)
    this.player.playerState.modifiers.speedMultiplier *= 0.6;

    if (!this.dragonDiveAimGfx) {
      this.dragonDiveAimGfx = this.scene.add.sprite(this.player.x, this.player.y, 'fx_circle_orange', 0);
      this.dragonDiveAimGfx.setTint(0xFF4400);
    }
    this.dragonDiveAimGfx.setDepth(DEPTHS.EFFECTS);
    this.dragonDiveAimGfx.setAlpha(1);
  }

  private updateDragonDiveAim(delta: number): void {
    this.dragonDiveAimTimer += delta;
    const aimDuration = 600; // 600ms aim phase (longer for progressive distance)
    const maxDiveDistance = 120 * SPRITE_SCALE;
    const indicatorDelay = 100; // indicator shows 100ms after aim starts

    // Progressive distance: ramps from 30% to 100% over aim duration
    const distProgress = Math.min(this.dragonDiveAimTimer / aimDuration, 1);
    const easedProgress = distProgress * distProgress; // ease-in: starts slow, accelerates
    const currentDistance = maxDiveDistance * (0.3 + 0.7 * easedProgress);

    // Determine aim direction from player facing
    const facing = this.player.getFacing();
    let dirX = 0, dirY = 0;
    switch (facing) {
      case 0: dirX = 0; dirY = 1; break;   // DOWN
      case 1: dirX = -1; dirY = 0; break;  // LEFT
      case 2: dirX = 1; dirY = 0; break;   // RIGHT
      case 3: dirX = 0; dirY = -1; break;  // UP
    }

    // Calculate target with progressive distance
    const targetX = this.player.x + dirX * currentDistance;
    const targetY = this.player.y + dirY * currentDistance;

    // Clamp to world bounds
    const cam = this.scene.cameras.main;
    const worldW = cam.getBounds().width || 3000;
    const worldH = cam.getBounds().height || 3000;
    this.dragonDiveTargetX = Phaser.Math.Clamp(targetX, 20, worldW - 20);
    this.dragonDiveTargetY = Phaser.Math.Clamp(targetY, 20, worldH - 20);

    // Draw aim indicator using sprites (appears after short delay)
    if (this.dragonDiveAimGfx && this.dragonDiveAimTimer >= indicatorDelay) {
      const px = this.player.x;
      const py = this.player.y;
      const tx = this.dragonDiveTargetX;
      const ty = this.dragonDiveTargetY;
      const pulseAlpha = 0.5 + Math.sin(this.dragonDiveAimTimer * 0.012) * 0.3;
      const fadeIn = Math.min((this.dragonDiveAimTimer - indicatorDelay) / 150, 1);
      const alpha = pulseAlpha * fadeIn;

      // Position the aim sprite at the landing zone
      const landingRadius = 20 * SPRITE_SCALE;
      const ringPulse = 1 + Math.sin(this.dragonDiveAimTimer * 0.01) * 0.15;
      this.dragonDiveAimGfx.setPosition(tx, ty);
      this.dragonDiveAimGfx.setScale((landingRadius * 2 * ringPulse) / 32);
      this.dragonDiveAimGfx.setAlpha(alpha * 0.4);

      // Spawn fire trail particles along the path periodically
      if (Math.random() < 0.3) {
        const t = Math.random();
        const trailX = px + (tx - px) * t + (Math.random() - 0.5) * 6 * SPRITE_SCALE;
        const trailY = py + (ty - py) * t + (Math.random() - 0.5) * 6 * SPRITE_SCALE;
        spawnFX(this.scene, trailX, trailY, 'fx_flame', {
          scale: 0.4 + Math.random() * 0.3,
          tint: 0xFF6600, alpha: alpha * 0.5, duration: 150, depth: DEPTHS.EFFECTS,
        });
      }

      // Spawn line indicator along the aim path periodically
      if (Math.random() < 0.2) {
        spawnLine(this.scene, px, py, tx, ty, 0xFF4400, 100, alpha * 0.3);
      }
    }

    // Aim phase complete -> start dive
    if (this.dragonDiveAimTimer >= aimDuration) {
      this.isDragonDiveAiming = false;

      // Restore aim speed
      this.player.playerState.modifiers.speedMultiplier /= 0.6;

      // Clean up aim gfx
      if (this.dragonDiveAimGfx) {
        this.dragonDiveAimGfx.setAlpha(0);
      }

      // Start the actual dive
      this.isDragonDiving = true;
      this.dragonDiveTimer = 0;
      this.dragonDiveOriginX = this.player.x;
      this.dragonDiveOriginY = this.player.y;
      this.player.playerState.isInvulnerable = true;

      if (this.player.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).enable = false;
      }

      if (!this.dragonDiveShadowGfx) {
        this.dragonDiveShadowGfx = this.scene.add.sprite(this.player.x, this.player.y, 'fx_circle_orange', 0);
        this.dragonDiveShadowGfx.setTint(0x000000);
      }
      this.dragonDiveShadowGfx.setDepth(DEPTHS.GROUND + 1);
      this.dragonDiveShadowGfx.setAlpha(1);
    }
  }

  private updateDragonDiveInProgress(delta: number): void {
    this.dragonDiveTimer += delta;
    const totalDuration = this.dragonDiveDuration;
    const progress = Math.min(this.dragonDiveTimer / totalDuration, 1);

    const ascendEnd = 0.35;
    const hoverEnd = 0.50;

    let heightFactor: number;
    if (progress < ascendEnd) {
      const t = progress / ascendEnd;
      heightFactor = 1 - Math.pow(1 - t, 2);
    } else if (progress < hoverEnd) {
      heightFactor = 1;
    } else {
      const t = (progress - hoverEnd) / (1 - hoverEnd);
      heightFactor = 1 - t * t;
    }

    // Travel progress: how far along X/Y from origin to target
    const travelProgress = Math.min(progress / 0.95, 1); // reach target slightly before landing

    const maxHeight = 100;
    const yOffset = -heightFactor * maxHeight;

    // Interpolate player X/Y from origin toward target, plus height arc
    const groundX = Phaser.Math.Linear(this.dragonDiveOriginX, this.dragonDiveTargetX, travelProgress);
    const groundY = Phaser.Math.Linear(this.dragonDiveOriginY, this.dragonDiveTargetY, travelProgress);
    this.player.x = groundX;
    this.player.y = groundY + yOffset;

    const scale = SPRITE_SCALE * (1 + heightFactor * 0.5);
    this.player.setScale(scale);

    // Spinning descent with fire tint
    if (progress > hoverEnd) {
      const descendProgress = (progress - hoverEnd) / (1 - hoverEnd);
      this.player.setAngle(descendProgress * 720);
      this.player.setTint(0xFF4400);
    } else {
      this.player.setAngle(0);
      this.player.clearTint();
    }

    // Shadow on ground travels toward target using sprite
    if (this.dragonDiveShadowGfx) {
      const shadowX = Phaser.Math.Linear(this.dragonDiveOriginX, this.dragonDiveTargetX, travelProgress);
      const shadowY = Phaser.Math.Linear(this.dragonDiveOriginY, this.dragonDiveTargetY, travelProgress);
      const shadowScale = 1 - heightFactor * 0.5;
      const shadowAlpha = 0.4 * (1 - heightFactor * 0.3);
      this.dragonDiveShadowGfx.setPosition(shadowX, shadowY + 2);
      this.dragonDiveShadowGfx.setScale(
        (14 * shadowScale) / 16,
        (5 * shadowScale) / 16,
      );
      this.dragonDiveShadowGfx.setAlpha(shadowAlpha);
    }

    // Landing
    if (progress >= 1) {
      this.isDragonDiving = false;
      this.dragonDiveTimer = 0;

      this.player.setScale(SPRITE_SCALE);
      this.player.setAngle(0);
      this.player.clearTint();
      // Teleport player to landing position
      this.player.x = this.dragonDiveTargetX;
      this.player.y = this.dragonDiveTargetY;
      this.player.playerState.isInvulnerable = false;

      if (this.player.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).enable = true;
      }

      if (this.dragonDiveShadowGfx) {
        this.dragonDiveShadowGfx.setAlpha(0);
      }

      const radius = this.dragonDiveParams.radius ?? 70;
      const damage = this.dragonDiveParams.damage ?? 20;
      const flameDamage = this.dragonDiveParams.flameDamage ?? 4;
      const flameDuration = this.dragonDiveParams.flameDuration ?? 2000;
      const lx = this.dragonDiveTargetX;
      const ly = this.dragonDiveTargetY;

      // Impact damage at landing spot
      const enemies = this.getEnemiesInRadius(lx, ly, radius);
      for (const enemy of enemies) {
        enemy.takeDamage(damage, true);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        if (flameDamage > 0) {
          enemy.applyBurn(flameDamage, flameDuration);
        }
      }

      // Big fire impact visual
      this.drawExpandingRing(lx, ly, 10, radius, 0xFF4400, 500);
      this.drawExpandingRing(lx, ly, 5, radius * 0.7, 0xFF8800, 350);
      this.drawPulse(lx, ly, radius, 0xFF6600, 0.8, 400);
      this.drawAdditiveGlow(lx, ly, radius, 0xFF4400, 0.5, 500);
      this.drawImpactParticles(lx, ly, 0xFF4400, 12, 80, 400);

      // Screen flash (brief white overlay) using sprite
      const cam = this.scene.cameras.main;
      const flashSprite = this.scene.add.sprite(
        cam.scrollX + cam.width / 2,
        cam.scrollY + cam.height / 2,
        'fx_circle_white', 0,
      );
      flashSprite.setDepth(DEPTHS.UI - 1);
      flashSprite.setScale(Math.max(cam.width, cam.height) / 16);
      flashSprite.setAlpha(0.4);
      flashSprite.setTint(0xFFFFFF);
      this.scene.tweens.add({
        targets: flashSprite, alpha: 0, duration: 150,
        onComplete: () => flashSprite.destroy(),
      });

      // Leave flame zone on ground using sprites
      const flameR = radius * 0.8;
      const flameSprite = this.scene.add.sprite(lx, ly, 'fx_circle_orange', 0);
      flameSprite.setDepth(DEPTHS.EFFECTS - 2);
      flameSprite.setTint(0xFF4400);
      flameSprite.setScale((flameR * 2) / 32);
      flameSprite.setAlpha(0.35);
      const flameInnerSprite = this.scene.add.sprite(lx, ly, 'fx_circle_spark', 0);
      flameInnerSprite.setDepth(DEPTHS.EFFECTS - 2);
      flameInnerSprite.setTint(0xFF8800);
      flameInnerSprite.setScale((flameR * 0.5 * 2) / 32);
      flameInnerSprite.setAlpha(0.35 * 0.6);
      this.scene.tweens.add({
        targets: [flameSprite, flameInnerSprite], alpha: 0, duration: flameDuration,
        ease: 'Linear',
        onComplete: () => { flameSprite.destroy(); flameInnerSprite.destroy(); },
      });

      // screen shake removed

      // Set lock cooldown
      this.lockCooldown = JobSkillManager.LOCK_GAP;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BLADE STORM (Samurai) - rotary slashes around player
  // ═══════════════════════════════════════════════════════════════════════════

  private updateBladeStorm(skillId: string, params: Record<string, number>, delta: number): void {
    if (this.bladeStormActive) return;
    if (this.lockCooldown > 0) return; // wait for free-movement gap

    const cooldown = Math.max(4000, this.getEffectiveCooldown(params.cooldown ?? 7000));
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    this.bladeStormActive = true;
    this.bladeStormTimer = 0;
    this.bladeStormSkillId = skillId;
    this.bladeStormParams = { ...params };
    this.bladeStormHitTimer = 0;

    if (!this.bladeStormGfx) {
      this.bladeStormGfx = this.scene.add.sprite(this.player.x, this.player.y, 'fx_circular_slash', 0);
      this.bladeStormGfx.setDepth(DEPTHS.EFFECTS);
      this.bladeStormGfx.setTint(0xFF4444);
    }
  }

  private updateBladeStormInProgress(delta: number): void {
    this.bladeStormTimer += delta;
    const duration = this.bladeStormParams.duration ?? 1500;
    const radius = this.bladeStormParams.radius ?? 50;
    const damage = this.bladeStormParams.damage ?? 12;
    const slashCount = this.bladeStormParams.slashCount ?? 4;

    if (this.bladeStormTimer >= duration) {
      this.bladeStormActive = false;
      if (this.bladeStormGfx) {
        this.bladeStormGfx.setAlpha(0);
      }
      this.lockCooldown = JobSkillManager.LOCK_GAP;
      return;
    }

    const progress = this.bladeStormTimer / duration;
    const rotSpeed = Math.PI * 6; // 3 full rotations over the duration
    const currentAngle = progress * rotSpeed;
    const fadeAlpha = progress > 0.7 ? (1 - progress) / 0.3 : 1;

    // Update rotating slash sprite
    if (this.bladeStormGfx) {
      const px = this.player.x;
      const py = this.player.y;

      // Reposition and rotate the circular slash sprite
      this.bladeStormGfx.setPosition(px, py);
      this.bladeStormGfx.setRotation(currentAngle);
      this.bladeStormGfx.setScale((radius * 2) / 32);
      this.bladeStormGfx.setAlpha(fadeAlpha * 0.8);

      // Spawn slash line particles at blade tips
      if (Math.random() < 0.3) {
        for (let i = 0; i < slashCount; i++) {
          const slashAngle = currentAngle + (Math.PI * 2 / slashCount) * i;
          const sx = px + Math.cos(slashAngle) * radius;
          const sy = py + Math.sin(slashAngle) * radius;
          spawnFX(this.scene, sx, sy, 'fx_spark', {
            scale: 0.3, tint: 0xFFAAAA, alpha: fadeAlpha * 0.6,
            duration: 100, depth: DEPTHS.EFFECTS,
          });
        }
      }
    }

    // Hit enemies periodically
    this.bladeStormHitTimer += delta;
    const hitInterval = duration / (slashCount * 2);
    if (this.bladeStormHitTimer >= hitInterval) {
      this.bladeStormHitTimer -= hitInterval;
      const enemies = this.getEnemiesInRadius(this.player.x, this.player.y, radius);
      for (const enemy of enemies) {
        enemy.takeDamage(damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DARKNESS (Dark Knight) - triggered on player damage taken
  // ═══════════════════════════════════════════════════════════════════════════

  private handleDarkness(): void {
    const skillLevels = this.player.playerState.jobSkillLevels;
    const level = skillLevels[JobSkillId.DARKNESS] ?? 0;
    if (level <= 0) return;

    // Internal cooldown to prevent rapid-fire
    if (this.darknessCooldownTimer > 0) return;
    this.darknessCooldownTimer = this.darknessCooldown;

    const def = JOB_SKILL_DEFS[JobSkillId.DARKNESS];
    const params = def.levels[level - 1]?.params;
    if (!params) return;

    const radius = params.radius ?? 40;
    const damage = params.damage ?? 10;
    const hpCost = params.hpCost ?? 3;

    // Check if player can afford the HP cost
    if (this.player.playerState.stats.currentHP <= hpCost) return;

    // Pay HP cost (direct reduction, bypass armor/invuln)
    this.player.playerState.stats.currentHP -= hpCost;
    EventBus.emit(
      EVENTS.PLAYER_HEALTH_CHANGED,
      this.player.playerState.stats.currentHP,
      this.player.getEffectiveMaxHP(),
    );

    // Deal AoE damage
    const enemies = this.getEnemiesInRadius(this.player.x, this.player.y, radius);
    for (const enemy of enemies) {
      enemy.takeDamage(damage, false);
      EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
    }

    // Dark purple AoE visual
    this.drawExpandingRing(this.player.x, this.player.y, 5, radius, 0x8B0000, 350);
    this.drawPulse(this.player.x, this.player.y, radius, 0x440044, 0.7, 300);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // THUNDER (Black Mage) - triggered on crit hit
  // ═══════════════════════════════════════════════════════════════════════════

  private handleThunder(sourceEnemy: Enemy, _damage: number): void {
    const skillLevels = this.player.playerState.jobSkillLevels;
    const level = skillLevels[JobSkillId.THUNDER] ?? 0;
    if (level <= 0) return;

    const def = JOB_SKILL_DEFS[JobSkillId.THUNDER];
    const params = def.levels[level - 1]?.params;
    if (!params) return;

    const chainTargets = params.chainTargets ?? 3;
    const chainDamage = 8; // Base chain lightning damage per bounce
    const chainRange = 80; // Max distance to chain to next target

    // Build chain: start from the crit target, bounce to nearby enemies
    const hitSet = new Set<Enemy>();
    hitSet.add(sourceEnemy);
    let current = sourceEnemy;
    const chainOrder: Enemy[] = [sourceEnemy];

    for (let i = 1; i < chainTargets; i++) {
      let nearest: Enemy | null = null;
      let nearestDist = Infinity;

      const children = this.enemyGroup.getChildren() as Enemy[];
      for (const enemy of children) {
        if (!enemy.active || hitSet.has(enemy)) continue;
        const d = Phaser.Math.Distance.Between(current.x, current.y, enemy.x, enemy.y);
        if (d <= chainRange && d < nearestDist) {
          nearestDist = d;
          nearest = enemy;
        }
      }

      if (!nearest) break;

      hitSet.add(nearest);
      chainOrder.push(nearest);
      nearest.takeDamage(chainDamage, false);
      EventBus.emit(EVENTS.ENEMY_HIT, nearest, chainDamage);
      current = nearest;
    }

    // Draw chain lightning lines
    for (let i = 0; i < chainOrder.length - 1; i++) {
      const from = chainOrder[i];
      const to = chainOrder[i + 1];
      this.drawLightningBolt(from.x, from.y, to.x, to.y, 1);
    }
  }

  private drawLightningBolt(x1: number, y1: number, x2: number, y2: number, scale = 1): void {
    // Jagged lightning with segments - draw as a series of sprite-based line segments
    const segments = Math.floor(4 + scale);
    const points: { x: number; y: number }[] = [{ x: x1, y: y1 }];
    const dx = x2 - x1;
    const dy = y2 - y1;

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const jitter = 6 * scale;
      points.push({
        x: x1 + dx * t + (Math.random() - 0.5) * jitter * 2,
        y: y1 + dy * t + (Math.random() - 0.5) * jitter * 2,
      });
    }
    points.push({ x: x2, y: y2 });

    // Draw jagged bolt segments as sprite-based lines
    for (let i = 0; i < points.length - 1; i++) {
      // Bright core line
      spawnLine(this.scene, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 0xFFFF44, 200, 0.9);
      // Glow line
      spawnLine(this.scene, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 0x4444FF, 250, 0.3);
    }

    // Glow flashes at each bolt vertex for extra bloom
    for (const pt of points) {
      spawnFlash(this.scene, pt.x, pt.y, 6, 0x4488FF, 250);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTROY / CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // SMOKE BOMB (Ninja) - invuln + blind nearby enemies
  // ═══════════════════════════════════════════════════════════════════════════

  private updateSmokeBomb(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 10000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const radius = params.radius ?? 50;
    const invulnDuration = params.invulnDuration ?? 1500;

    // Make player invulnerable
    this.player.playerState.isInvulnerable = true;
    this.scene.time.delayedCall(invulnDuration, () => {
      this.player.playerState.isInvulnerable = false;
    });

    // Stun/blind enemies in radius (treat as stun)
    const enemies = this.getEnemiesInRadius(this.player.x, this.player.y, radius);
    for (const enemy of enemies) {
      enemy.applyStun(params.blindDuration ?? 2000);
    }

    // Smoke visual using sprite
    spawnCircleZone(this.scene, this.player.x, this.player.y, radius, 0x333344, 0.6, invulnDuration, DEPTHS.EFFECTS);
    // Additional smoke particles
    spawnParticleBurst(this.scene, this.player.x, this.player.y, 6, 0x555566, 30, invulnDuration * 0.5);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DUAL STRIKE (Ninja) - multi-hit AoE
  // ═══════════════════════════════════════════════════════════════════════════

  private updateDualStrike(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 4000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const radius = params.radius ?? 40;
    const damage = params.damage ?? 8;
    const hitCount = params.hitCount ?? 2;
    const px = this.player.x;
    const py = this.player.y;

    // Find nearest enemy for direction
    let target: Enemy | null = null;
    let nearestDist = Infinity;
    const children = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
      if (d < nearestDist) { nearestDist = d; target = enemy; }
    }
    const baseAngle = target
      ? Math.atan2(target.y - py, target.x - px)
      : Math.random() * Math.PI * 2;

    for (let h = 0; h < hitCount; h++) {
      const slashAngle = baseAngle + (h - (hitCount - 1) / 2) * 0.5;
      const delay = h * 100;

      this.scene.time.delayedCall(delay, () => {
        // Damage enemies in arc
        const enemies = this.getEnemiesInRadius(px, py, radius);
        for (const enemy of enemies) {
          enemy.takeDamage(damage, false);
          EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        }

        // Purple slash visual using sprite
        spawnFX(this.scene,
          px + Math.cos(slashAngle) * radius * 0.5,
          py + Math.sin(slashAngle) * radius * 0.5,
          'fx_slash', {
            scale: (radius * 2) / 32,
            tint: 0x9933FF, alpha: 0.7, duration: 200,
            rotation: slashAngle, depth: DEPTHS.EFFECTS,
          });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HALLOWED GROUND (Paladin mastery) - invulnerability zone
  // ═══════════════════════════════════════════════════════════════════════════

  private updateHallowedGround(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 20000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const duration = params.duration ?? 2000;

    this.player.playerState.isInvulnerable = true;
    this.scene.time.delayedCall(duration, () => {
      this.player.playerState.isInvulnerable = false;
    });

    // Golden zone visual using sprites
    const radius = params.radius ?? 60;
    spawnCircleZone(this.scene, this.player.x, this.player.y, radius, 0xFFDD44, 0.3, duration, DEPTHS.EFFECTS - 1);
    // Outer ring
    spawnRing(this.scene, this.player.x, this.player.y, radius, radius * 1.1, 0xFFDD44, duration, 0.8);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIME STOP (Time Mage mastery) - freeze all enemies
  // ═══════════════════════════════════════════════════════════════════════════

  private updateTimeStop(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 20000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const duration = params.duration ?? 2000;
    const enemies = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      enemy.applyStun(duration);
    }

    // Screen flash
    this.drawPulse(this.player.x, this.player.y, 500, 0x9370DB, 0.3, duration);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FREEZE (Black Mage mastery) - freeze enemies in area
  // ═══════════════════════════════════════════════════════════════════════════

  private updateFreeze(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 12000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const radius = params.radius ?? 60;
    const freezeDuration = params.freezeDuration ?? 1500;
    const enemies = this.getEnemiesInRadius(this.player.x, this.player.y, radius);
    for (const enemy of enemies) {
      enemy.applyStun(freezeDuration);
    }

    // Ice field visual using sprite
    spawnCircleZone(this.scene, this.player.x, this.player.y, radius, 0x88CCFF, 0.4, freezeDuration, DEPTHS.EFFECTS - 1);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ASYLUM (White Mage mastery) - healing zone
  // ═══════════════════════════════════════════════════════════════════════════

  private updateAsylum(skillId: string, params: Record<string, number>, delta: number): void {
    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 15000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    const radius = params.radius ?? 60;
    const healPerTick = params.healPerTick ?? 3;
    const duration = params.duration ?? 5000;
    const tickInterval = 1000;
    const px = this.player.x;
    const py = this.player.y;

    // Green healing zone visual using sprites
    spawnCircleZone(this.scene, px, py, radius, 0x44FF88, 0.25, duration, DEPTHS.EFFECTS - 1);
    // Outer ring
    spawnRing(this.scene, px, py, radius, radius * 1.05, 0x44FF88, duration, 0.6);

    // Heal ticks
    let ticksRemaining = Math.floor(duration / tickInterval);
    this.scene.time.addEvent({
      delay: tickInterval,
      repeat: ticksRemaining - 1,
      callback: () => {
        const dist = Phaser.Math.Distance.Between(px, py, this.player.x, this.player.y);
        if (dist <= radius) {
          this.player.heal(healPerTick);
        }
      },
    });
  }

  public destroy(): void {
    // Remove event listeners
    if (this.onJobSkillUpgraded) {
      EventBus.off(EVENTS.JOB_SKILL_UPGRADED, this.onJobSkillUpgraded);
    }
    if (this.onPlayerDamageTaken) {
      EventBus.off(EVENTS.PLAYER_DAMAGE_TAKEN, this.onPlayerDamageTaken);
    }
    if (this.onCritHit) {
      EventBus.off(EVENTS.CRIT_HIT, this.onCritHit);
    }

    // Destroy aura graphics
    for (const gfx of this.auraGraphics.values()) {
      gfx.destroy();
    }
    this.auraGraphics.clear();

    // Destroy familiar graphics
    for (const gfx of this.familiarGraphics.values()) {
      gfx.destroy();
    }
    this.familiarGraphics.clear();

    // Destroy orbital shield images
    for (const skillId of this.orbitalImages.keys()) {
      this.destroyOrbitalShields(skillId);
    }
    this.orbitalLastCount.clear();

    // Destroy jump graphics
    if (this.jumpShadowGfx) {
      this.jumpShadowGfx.destroy();
      this.jumpShadowGfx = null;
    }
    if (this.jumpChargeGfx) {
      this.jumpChargeGfx.destroy();
      this.jumpChargeGfx = null;
    }

    // Destroy dragon dive graphics
    if (this.dragonDiveShadowGfx) {
      this.dragonDiveShadowGfx.destroy();
      this.dragonDiveShadowGfx = null;
    }
    if (this.dragonDiveAimGfx) {
      this.dragonDiveAimGfx.destroy();
      this.dragonDiveAimGfx = null;
    }

    // Destroy blade storm graphics
    if (this.bladeStormGfx) {
      this.bladeStormGfx.destroy();
      this.bladeStormGfx = null;
    }

    // Destroy trail zone graphics
    for (const zone of this.trailZones) {
      zone.graphics.destroy();
    }
    this.trailZones.length = 0;

    // Destroy ground zone graphics
    for (const zone of this.groundZones) {
      zone.graphics.destroy();
    }
    this.groundZones.length = 0;

    // Clear timers
    this.skillTimers.clear();
    this.familiarAngles.clear();
    this.familiarAttackTimers.clear();
  }
}
