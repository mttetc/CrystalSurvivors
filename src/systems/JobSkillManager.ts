import Phaser from 'phaser';
import { EVENTS, DEPTHS, JobSkillId, MasterySkillId, SPRITE_SCALE } from '../constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { JOB_SKILL_DEFS, MASTERY_SKILL_DEFS } from '../data/jobs';
import { EventBus } from './EventBus';

// ─── Skill category classification ──────────────────────────────────────────

const AURA_SKILLS = new Set<string>([JobSkillId.CONSECRATE, MasterySkillId.REQUIEM]);
const PERIODIC_AOE_SKILLS = new Set<string>([
  JobSkillId.CHI_BURST, JobSkillId.HOLY, JobSkillId.BAHAMUT,
  JobSkillId.METEOR, JobSkillId.GUST, JobSkillId.QUAKE,
  // Mastery AoE skills
  MasterySkillId.SOUL_EATER, MasterySkillId.INNER_BEAST, MasterySkillId.FELL_CLEAVE,
  MasterySkillId.FLARE, MasterySkillId.DREADWYRM, MasterySkillId.ERUPTION,
  MasterySkillId.LANDSLIDE, MasterySkillId.STARDIVER, MasterySkillId.FINALE,
  MasterySkillId.COMET, MasterySkillId.MIDARE_SETSUGEKKA,
]);
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

  // Persistent aura graphics (redrawn each frame)
  private auraGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();

  // Familiar state
  private familiarGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private familiarAngles: Map<string, number> = new Map();
  private familiarAttackTimers: Map<string, number> = new Map();

  // Jump state
  private isJumping = false;
  private isChargingJump = false;
  private jumpChargeTimer = 0;
  private jumpChargeDuration = 1000; // 1s charge before jump
  private jumpChargeGfx: Phaser.GameObjects.Graphics | null = null;
  private jumpTimer = 0;
  private jumpDuration = 900; // ms in the air
  private jumpSkillId: string = '';
  private jumpParams: Record<string, number> = {};
  private jumpOriginX = 0;
  private jumpOriginY = 0;
  private jumpShadowGfx: Phaser.GameObjects.Graphics | null = null;

  // Trail zones: { x, y, damage, remaining, tickTimer }
  private trailZones: Array<{
    x: number; y: number; damage: number; remaining: number;
    tickTimer: number; graphics: Phaser.GameObjects.Graphics;
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
  private dragonDiveAimGfx: Phaser.GameObjects.Graphics | null = null;
  private dragonDiveTimer = 0;
  private dragonDiveDuration = 700; // ms in the air
  private dragonDiveSkillId = '';
  private dragonDiveParams: Record<string, number> = {};
  private dragonDiveOriginX = 0;
  private dragonDiveOriginY = 0;
  private dragonDiveShadowGfx: Phaser.GameObjects.Graphics | null = null;

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
  private bladeStormGfx: Phaser.GameObjects.Graphics | null = null;
  private bladeStormHitTimer = 0;

  // Ground zone state (Doton - persistent zones)
  private groundZones: Array<{
    x: number; y: number; damage: number; slowPercent: number;
    remaining: number; tickTimer: number; graphics: Phaser.GameObjects.Graphics;
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
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS);
    gfx.lineStyle(2, color, alpha);
    gfx.strokeCircle(x, y, radius);
    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => gfx.destroy(),
    });
  }

  // ─── Helper: expanding ring effect (dual-layer: inner bright, outer dim) ──

  private drawExpandingRing(
    x: number, y: number, startRadius: number, endRadius: number,
    color: number, duration = 400,
  ): void {
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS);
    const progress = { t: 0 };
    this.scene.tweens.add({
      targets: progress,
      t: 1,
      duration,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        gfx.clear();
        const r = Phaser.Math.Linear(startRadius, endRadius, progress.t);
        const a = 1 - progress.t;

        // Outer ring (dim, wider, slightly ahead)
        const outerR = r * 1.15;
        gfx.lineStyle(1, color, a * 0.3);
        gfx.strokeCircle(x, y, outerR);

        // Inner ring (bright, thicker)
        gfx.lineStyle(2, color, a * 0.9);
        gfx.strokeCircle(x, y, r);

        // Core fill (very faint, fades fast)
        if (progress.t < 0.4) {
          const fillAlpha = (0.4 - progress.t) * 0.3;
          gfx.fillStyle(color, fillAlpha);
          gfx.fillCircle(x, y, r * 0.6);
        }
      },
      onComplete: () => gfx.destroy(),
    });
  }

  // ─── Helper: flash particles on AoE impact ────────────────────────────────

  private drawImpactParticles(
    x: number, y: number, color: number, count = 6, speed = 50, duration = 300,
  ): void {
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS + 1);
    const particles: { px: number; py: number; vx: number; vy: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const spd = speed * (0.6 + Math.random() * 0.8);
      particles.push({
        px: x, py: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
      });
    }
    const progress = { t: 0 };
    this.scene.tweens.add({
      targets: progress,
      t: 1,
      duration,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        gfx.clear();
        const dt = 0.016;
        for (const p of particles) {
          p.px += p.vx * dt;
          p.py += p.vy * dt;
          const alpha = (1 - progress.t) * 0.9;
          const size = Math.max(1, 2 * (1 - progress.t));
          gfx.fillStyle(color, alpha);
          gfx.fillRect(Math.floor(p.px), Math.floor(p.py), size, size);
          // Bright white center for first half
          if (progress.t < 0.5) {
            gfx.fillStyle(0xFFFFFF, alpha * 0.6);
            gfx.fillRect(Math.floor(p.px), Math.floor(p.py), 1, 1);
          }
        }
      },
      onComplete: () => gfx.destroy(),
    });
  }

  // ─── Helper: additive glow flash (creates bloom-like effect) ────────────

  private drawAdditiveGlow(
    x: number, y: number, radius: number, color: number, alpha = 0.35, duration = 400,
  ): void {
    const gfx = this.scene.add.graphics();
    gfx.setBlendMode(Phaser.BlendModes.ADD);
    gfx.setDepth(DEPTHS.EFFECTS - 1);
    // Outer soft glow
    gfx.fillStyle(color, alpha * 0.4);
    gfx.fillCircle(x, y, radius);
    // Inner bright core
    gfx.fillStyle(color, alpha);
    gfx.fillCircle(x, y, radius * 0.5);
    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => gfx.destroy(),
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

    // Draw persistent aura around player with pulsing & segmented circle
    let gfx = this.auraGraphics.get(skillId);
    if (!gfx) {
      gfx = this.scene.add.graphics();
      gfx.setDepth(DEPTHS.EFFECTS - 1);
      this.auraGraphics.set(skillId, gfx);
    }
    gfx.clear();

    // Subtle pulsing: radius oscillates based on time
    const pulsePhase = (Date.now() % 2000) / 2000; // 0..1 over 2 seconds
    const pulseFactor = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.04; // +/- 4%
    const displayRadius = radius * pulseFactor;

    // Inner fill with slight pulse in alpha
    const fillAlpha = 0.06 + Math.sin(pulsePhase * Math.PI * 2) * 0.03;
    gfx.fillStyle(fillColor, fillAlpha);
    gfx.fillCircle(this.player.x, this.player.y, displayRadius);

    // Segmented/dashed outer circle for a magical look
    const segments = 16;
    const gapRatio = 0.3; // 30% of each segment is a gap
    const segmentAngle = (Math.PI * 2) / segments;
    const arcAngle = segmentAngle * (1 - gapRatio);
    // Slowly rotate the segments over time
    const rotationOffset = (Date.now() % 6000) / 6000 * Math.PI * 2;

    gfx.lineStyle(1.5, color, 0.4);
    for (let i = 0; i < segments; i++) {
      const startAngle = rotationOffset + i * segmentAngle;
      gfx.beginPath();
      gfx.arc(this.player.x, this.player.y, displayRadius, startAngle, startAngle + arcAngle);
      gfx.strokePath();
    }

    // Inner ring (dimmer, rotates opposite direction)
    const innerRadius = displayRadius * 0.7;
    const innerRotation = -rotationOffset * 0.6;
    gfx.lineStyle(1, color, 0.2);
    for (let i = 0; i < 12; i++) {
      const startAngle = innerRotation + i * (Math.PI * 2 / 12);
      const innerArc = (Math.PI * 2 / 12) * 0.6;
      gfx.beginPath();
      gfx.arc(this.player.x, this.player.y, innerRadius, startAngle, startAngle + innerArc);
      gfx.strokePath();
    }

    // Small rune-like dots at cardinal points
    const dotCount = 8;
    gfx.fillStyle(color, 0.35);
    for (let i = 0; i < dotCount; i++) {
      const dotAngle = rotationOffset * 0.5 + (Math.PI * 2 / dotCount) * i;
      const dx = this.player.x + Math.cos(dotAngle) * displayRadius;
      const dy = this.player.y + Math.sin(dotAngle) * displayRadius;
      gfx.fillCircle(dx, dy, 1.5);
    }

    // Additive glow layer inside the aura for a subtle bloom effect
    let auraGlowGfx = this.auraGraphics.get(skillId + '_glow');
    if (!auraGlowGfx) {
      auraGlowGfx = this.scene.add.graphics();
      auraGlowGfx.setBlendMode(Phaser.BlendModes.ADD);
      auraGlowGfx.setDepth(DEPTHS.EFFECTS - 2);
      this.auraGraphics.set(skillId + '_glow', auraGlowGfx);
    }
    auraGlowGfx.clear();
    const glowAlpha = 0.08 + Math.sin(pulsePhase * Math.PI * 2) * 0.04;
    auraGlowGfx.fillStyle(fillColor, glowAlpha);
    auraGlowGfx.fillCircle(this.player.x, this.player.y, displayRadius * 0.85);

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
        this.drawExpandingRing(cx, cy, 5, radius, color, 350);
        this.drawExpandingRing(cx, cy, 3, radius * 0.6, 0xFFCC44, 250);
        this.drawImpactParticles(cx, cy, 0xFFAA00, 8, 60, 300);
        // Additive orange glow on the burst
        this.drawAdditiveGlow(cx, cy, radius * 0.7, 0xFF8C00, 0.35, 350);
        break;

      case JobSkillId.HOLY:
        color = 0xFFFFCC;
        this.drawPulse(cx, cy, radius, color, 0.8, 400);
        // Bright flash
        this.drawPulse(cx, cy, radius * 0.5, 0xFFFFFF, 1.0, 200);
        this.drawExpandingRing(cx, cy, 5, radius * 0.8, 0xFFFFFF, 300);
        this.drawImpactParticles(cx, cy, 0xFFFF88, 10, 70, 350);
        // Bright white additive glow flash
        this.drawAdditiveGlow(cx, cy, radius * 0.8, 0xFFFFFF, 0.5, 400);
        this.drawAdditiveGlow(cx, cy, radius * 0.4, 0xFFFFCC, 0.6, 200);
        break;

      case JobSkillId.BAHAMUT: {
        color = 0xFF4444;

        // Dragon swoops in from above
        const dragon = this.scene.add.image(cx, cy - 40, 'bahamut_dragon');
        dragon.setDepth(DEPTHS.EFFECTS + 2);
        dragon.setScale(0);
        dragon.setTint(0xFF4444);
        dragon.setAlpha(0.9);

        this.scene.tweens.add({
          targets: dragon,
          y: cy,
          scaleX: 3,
          scaleY: 3,
          duration: 300,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.scene.tweens.add({
              targets: dragon,
              alpha: 0,
              scaleX: 4,
              scaleY: 4,
              duration: 500,
              onComplete: () => dragon.destroy(),
            });
          },
        });

        // White flash on impact
        const bahaFlash = this.scene.add.graphics();
        bahaFlash.setDepth(DEPTHS.EFFECTS + 1);
        bahaFlash.fillStyle(0xFFFFFF, 0.5);
        bahaFlash.fillCircle(cx, cy, radius * 0.4);
        this.scene.tweens.add({
          targets: bahaFlash,
          alpha: 0,
          duration: 200,
          onComplete: () => bahaFlash.destroy(),
        });

        // Fire explosion rings
        this.drawExpandingRing(cx, cy, 10, radius, color, 500);
        this.drawExpandingRing(cx, cy, 5, radius * 0.7, 0xFF8800, 350);
        this.drawPulse(cx, cy, radius, 0xFF6600, 0.7, 400);
        this.drawImpactParticles(cx, cy, 0xFF6644, 12, 80, 400);
        this.drawPulse(cx, cy, radius * 0.3, 0xFFAA44, 0.9, 200);

        // Camera shake for mega flare
        this.scene.cameras.main.shake(200, 0.008);

        // Large orange-red additive glow flash on impact
        this.drawAdditiveGlow(cx, cy, radius, 0xFF4400, 0.4, 500);
        this.drawAdditiveGlow(cx, cy, radius * 0.5, 0xFF6600, 0.5, 300);
        break;
      }

      case JobSkillId.METEOR: {
        // Random position near player
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 120 + 30;
        cx = px + Math.cos(angle) * dist;
        cy = py + Math.sin(angle) * dist;
        color = 0xFF3300;
        // Impact effect - dual rings
        this.drawExpandingRing(cx, cy, 5, radius, color, 400);
        this.drawExpandingRing(cx, cy, 3, radius * 0.6, 0xFF8800, 300);
        this.drawPulse(cx, cy, radius * 0.7, 0xFF6600, 0.8, 300);
        this.drawImpactParticles(cx, cy, 0xFF4400, 10, 90, 350);
        // Ground scorch flash
        this.drawPulse(cx, cy, radius * 0.4, 0xFFAA00, 1.0, 150);
        // Additive orange glow at impact
        this.drawAdditiveGlow(cx, cy, radius * 0.8, 0xFF4400, 0.4, 400);
        break;
      }

      case JobSkillId.GUST:
        color = 0xAAFFAA;
        this.drawExpandingRing(cx, cy, 10, radius, color, 400);
        this.drawExpandingRing(cx, cy, 5, radius * 0.7, 0xCCFFCC, 300);
        this.drawImpactParticles(cx, cy, 0x88FF88, 8, 100, 350);
        break;

      case JobSkillId.QUAKE:
        color = 0x8B4513;
        this.drawPulse(cx, cy, radius, color, 0.7, 350);
        // Ground crack visual - dual ring
        this.drawExpandingRing(cx, cy, radius * 0.3, radius, 0x654321, 300);
        this.drawExpandingRing(cx, cy, 5, radius * 0.5, 0xAA7744, 250);
        this.drawImpactParticles(cx, cy, 0xAA6633, 8, 50, 300);
        // Camera micro-shake for ground impact feel
        this.scene.cameras.main.shake(100, 0.004);
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

      // Stun (HOLY, QUAKE)
      if (stunDuration > 0) {
        enemy.applyStun(stunDuration);
      }

      // Gust repulsion: push enemies away
      if (skillId === JobSkillId.GUST) {
        const dx = enemy.x - cx;
        const dy = enemy.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const pushForce = 250;
        enemy.setVelocity((dx / dist) * pushForce, (dy / dist) * pushForce);
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

    // Create charge visual
    if (!this.jumpChargeGfx) {
      this.jumpChargeGfx = this.scene.add.graphics();
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

    // Draw charge-up rings converging on player
    if (this.jumpChargeGfx) {
      this.jumpChargeGfx.clear();
      const px = this.player.x;
      const py = this.player.y;

      // Converging ring
      const ringRadius = (1 - progress) * 40 * SPRITE_SCALE + 6 * SPRITE_SCALE;
      this.jumpChargeGfx.lineStyle(2, 0x4169E1, 0.5 + progress * 0.5);
      this.jumpChargeGfx.strokeCircle(px, py, ringRadius);

      // Inner glow growing
      const innerRadius = progress * 8 * SPRITE_SCALE;
      this.jumpChargeGfx.fillStyle(0x6699FF, progress * 0.4);
      this.jumpChargeGfx.fillCircle(px, py, innerRadius);

      // Dust particles rising from ground
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 / 4) * i + this.jumpChargeTimer * 0.005;
        const dist = ringRadius * 0.8;
        const px2 = px + Math.cos(angle) * dist;
        const py2 = py + Math.sin(angle) * dist - progress * 10 * SPRITE_SCALE;
        this.jumpChargeGfx.fillStyle(0x8899AA, 0.5 * (1 - progress * 0.5));
        this.jumpChargeGfx.fillRect(px2, py2, 2, 2);
      }

      // Player squishes down (crouching to jump)
      this.player.setScale(1 + progress * 0.1, 1 - progress * 0.2);
    }

    // Charge complete -> launch jump
    if (progress >= 1) {
      this.isChargingJump = false;

      // Restore speed multiplier
      this.player.playerState.modifiers.speedMultiplier /= 0.55;

      // Clean up charge gfx
      if (this.jumpChargeGfx) {
        this.jumpChargeGfx.clear();
      }

      // Reset scale
      this.player.setScale(1);

      // Now start the actual jump
      this.isJumping = true;
      this.jumpTimer = 0;

      this.player.playerState.isInvulnerable = true;
      if (this.player.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).enable = false;
      }

      if (!this.jumpShadowGfx) {
        this.jumpShadowGfx = this.scene.add.graphics();
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

    // Scale slightly at peak for perspective
    const scale = 1 + heightFactor * 0.4;
    this.player.setScale(scale);

    // Spinning dive animation during descent
    if (progress > hoverEnd) {
      const descendProgress = (progress - hoverEnd) / (1 - hoverEnd);
      this.player.setAngle(descendProgress * 360);
    } else {
      this.player.setAngle(0);
    }

    // Draw shadow on the ground (shrinks as player goes higher)
    if (this.jumpShadowGfx) {
      this.jumpShadowGfx.clear();
      const shadowScale = 1 - heightFactor * 0.5;
      const shadowAlpha = 0.4 * (1 - heightFactor * 0.3);
      this.jumpShadowGfx.fillStyle(0x000000, shadowAlpha);
      this.jumpShadowGfx.fillEllipse(
        this.jumpOriginX, this.jumpOriginY + 2 * SPRITE_SCALE,
        12 * SPRITE_SCALE * shadowScale, 4 * SPRITE_SCALE * shadowScale,
      );
    }

    // Landing
    if (progress >= 1) {
      this.isJumping = false;
      this.jumpTimer = 0;

      // Restore player
      this.player.setScale(1);
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
        this.jumpShadowGfx.clear();
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

      // Impact dust particles
      const dustGfx = this.scene.add.graphics();
      dustGfx.setDepth(DEPTHS.EFFECTS);
      const dustParticles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        dustParticles.push({
          x: lx,
          y: ly,
          vx: Math.cos(angle) * 40,
          vy: Math.sin(angle) * 20 - 15,
          life: 300,
        });
      }
      const dustTween = { t: 0 };
      this.scene.tweens.add({
        targets: dustTween,
        t: 1,
        duration: 300,
        onUpdate: () => {
          dustGfx.clear();
          for (const p of dustParticles) {
            p.x += p.vx * 0.016;
            p.y += p.vy * 0.016;
            p.vy += 60 * 0.016; // gravity
            const alpha = (1 - dustTween.t) * 0.6;
            dustGfx.fillStyle(0x8899AA, alpha);
            dustGfx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
          }
        },
        onComplete: () => dustGfx.destroy(),
      });

      // Strong camera shake on impact
      this.scene.cameras.main.shake(200, 0.01);

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
          'bullet',   // texture
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

    // Draw familiar
    let gfx = this.familiarGraphics.get(skillId);
    if (!gfx) {
      gfx = this.scene.add.graphics();
      gfx.setDepth(DEPTHS.EFFECTS);
      this.familiarGraphics.set(skillId, gfx);
    }
    gfx.clear();

    if (skillId === JobSkillId.IFRIT) {
      // ── Ifrit: pixel-art flame shape ──────────────────────────────
      // Outer glow
      gfx.fillStyle(0xFF6600, 0.2);
      gfx.fillCircle(fx, fy, FAMILIAR_SIZE + 4);

      // Flame body (wider at bottom, narrowing at top)
      // Bottom base (widest)
      gfx.fillStyle(0xFF4400, 0.9);
      gfx.fillRect(fx - 4, fy + 2, 8, 3);
      // Middle
      gfx.fillRect(fx - 3, fy - 1, 6, 4);
      // Upper body
      gfx.fillStyle(0xFF6600, 0.95);
      gfx.fillRect(fx - 2, fy - 3, 4, 3);
      // Top narrow
      gfx.fillStyle(0xFFAA00, 0.95);
      gfx.fillRect(fx - 1, fy - 5, 2, 3);
      // Flame tip (flickers using time-based random)
      const flickerX = ((Date.now() % 400) < 200) ? -1 : 0;
      gfx.fillStyle(0xFFDD44, 0.9);
      gfx.fillRect(fx + flickerX, fy - 7, 2, 2);
      // Second flicker tip (sometimes appears)
      if ((Date.now() % 600) < 300) {
        gfx.fillStyle(0xFFEE66, 0.7);
        gfx.fillRect(fx + 1, fy - 6, 1, 2);
      }
      // Inner hot core
      gfx.fillStyle(0xFFDD44, 0.8);
      gfx.fillRect(fx - 1, fy - 1, 2, 3);
      // Ember eyes
      gfx.fillStyle(0xFFFF00, 1);
      gfx.fillRect(fx - 2, fy, 1, 1);
      gfx.fillRect(fx + 1, fy, 1, 1);
      // Random ember sparks
      if ((Date.now() % 500) < 250) {
        gfx.fillStyle(0xFFAA00, 0.6);
        gfx.fillRect(fx - 4, fy - 2, 1, 1);
        gfx.fillRect(fx + 3, fy - 3, 1, 1);
      }
    } else {
      // ── Shiva: ice crystal / diamond shape ────────────────────────
      // Outer frost glow
      gfx.fillStyle(0x88CCFF, 0.15);
      gfx.fillCircle(fx, fy, FAMILIAR_SIZE + 4);

      // Main diamond body
      gfx.fillStyle(0x44AAFF, 0.9);
      // Draw diamond with rects (pixel-art style)
      gfx.fillRect(fx - 1, fy - 5, 2, 1);  // top point
      gfx.fillRect(fx - 2, fy - 4, 4, 1);
      gfx.fillRect(fx - 3, fy - 3, 6, 1);
      gfx.fillRect(fx - 4, fy - 2, 8, 1);
      gfx.fillRect(fx - 4, fy - 1, 8, 2);  // widest center
      gfx.fillRect(fx - 3, fy + 1, 6, 1);
      gfx.fillRect(fx - 2, fy + 2, 4, 1);
      gfx.fillRect(fx - 1, fy + 3, 2, 1);  // bottom point

      // Crystal facet highlights (lighter inner diamond)
      gfx.fillStyle(0xAADDFF, 0.8);
      gfx.fillRect(fx - 1, fy - 3, 2, 1);
      gfx.fillRect(fx - 2, fy - 2, 3, 1);
      gfx.fillRect(fx - 2, fy - 1, 3, 2);

      // Center sparkle (white)
      gfx.fillStyle(0xFFFFFF, 0.9);
      gfx.fillRect(fx - 1, fy - 1, 2, 2);

      // Ice spike arms (extending outward like a snowflake)
      gfx.fillStyle(0x66BBFF, 0.7);
      gfx.fillRect(fx - 6, fy, 2, 1);  // left spike
      gfx.fillRect(fx + 4, fy, 2, 1);  // right spike
      gfx.fillRect(fx, fy - 7, 1, 2);  // top spike
      gfx.fillRect(fx, fy + 4, 1, 2);  // bottom spike

      // Twinkling sparkle (alternates position)
      const sparklePhase = (Date.now() % 800) < 400;
      gfx.fillStyle(0xFFFFFF, 0.8);
      if (sparklePhase) {
        gfx.fillRect(fx - 3, fy - 3, 1, 1);
        gfx.fillRect(fx + 2, fy + 2, 1, 1);
      } else {
        gfx.fillRect(fx + 2, fy - 3, 1, 1);
        gfx.fillRect(fx - 3, fy + 2, 1, 1);
      }
    }

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

    // Drop a damage zone at player's current position
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS - 2);
    gfx.fillStyle(0x8B4513, 0.35);
    gfx.fillCircle(0, 0, TRAIL_ZONE_RADIUS);
    gfx.setPosition(this.player.x, this.player.y);

    this.trailZones.push({
      x: this.player.x,
      y: this.player.y,
      damage,
      remaining: duration,
      tickTimer: 0,
      graphics: gfx,
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

    // Slash visual: line from player outward
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS);
    gfx.lineStyle(3, 0xB22222, 0.9);
    gfx.lineBetween(px, py, endX, endY);
    gfx.lineStyle(5, 0xFF4444, 0.4);
    gfx.lineBetween(px, py, endX, endY);

    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: 250,
      ease: 'Quad.easeOut',
      onComplete: () => gfx.destroy(),
    });
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
        const img = this.scene.add.image(this.player.x, this.player.y, 'weapon_shield');
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

    // Create fireball visual
    const fireball = this.scene.add.graphics();
    fireball.setDepth(DEPTHS.EFFECTS + 1);
    fireball.x = px;
    fireball.y = py;

    // Draw fireball shape (orange core + red glow) - scales with level
    fireball.fillStyle(0xFFAA00, 0.9);
    fireball.fillCircle(0, 0, 5 * fbScale);
    fireball.fillStyle(0xFF4400, 0.5);
    fireball.fillCircle(0, 0, 8 * fbScale);

    // Muzzle flash at player (scales with level)
    const flash = this.scene.add.graphics();
    flash.setDepth(DEPTHS.EFFECTS);
    flash.fillStyle(0xFF6600, 0.6);
    flash.fillCircle(px, py, 10 * fbScale);
    this.scene.tweens.add({
      targets: flash, alpha: 0, duration: 150,
      onComplete: () => flash.destroy(),
    });

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
          const trail = this.scene.add.graphics();
          trail.setDepth(DEPTHS.EFFECTS);
          trail.fillStyle(0xFF6600, 0.6);
          trail.fillCircle(fireball.x + (Math.random() - 0.5) * 4 * fbScale, fireball.y + (Math.random() - 0.5) * 4 * fbScale, (2 + Math.random() * 2) * fbScale);
          this.scene.tweens.add({
            targets: trail, alpha: 0, duration: 200,
            onComplete: () => trail.destroy(),
          });
        }
      },
      onComplete: () => {
        fireball.destroy();
        // Explode at impact point
        this.fireballExplode(fireball.x, fireball.y, radius, damage, burnDamage, burnDuration);
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
    this.scene.cameras.main.shake(80, 0.003);
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

    // Impact flash at ground (scales with power)
    const flash = this.scene.add.graphics();
    flash.setDepth(DEPTHS.EFFECTS + 1);
    flash.fillStyle(0xFFFF44, 0.8);
    flash.fillCircle(x, y, 8 * scale);
    flash.fillStyle(0x4488FF, 0.4);
    flash.fillCircle(x, y, 14 * scale);
    this.scene.tweens.add({
      targets: flash, alpha: 0, duration: 250,
      onComplete: () => flash.destroy(),
    });

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

    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS - 2);

    this.groundZones.push({
      x: cx, y: cy, damage, slowPercent: 0.5,
      remaining: duration, tickTimer: 0, graphics: gfx,
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

      // Redraw zone visual
      const alpha = Math.min(1, zone.remaining / 500) * 0.6;
      zone.graphics.clear();
      // Look up radius from the skill level
      const skillLevels = this.player.playerState.jobSkillLevels;
      const level = skillLevels[MasterySkillId.DOTON] ?? 1;
      const def = MASTERY_SKILL_DEFS[MasterySkillId.DOTON];
      const zoneRadius = def?.levels[level - 1]?.params?.radius ?? 50;

      const time = this.scene.time.now;
      const pulse = 0.5 + 0.15 * Math.sin(time * 0.004);

      // Base zone - darker earth fill
      zone.graphics.fillStyle(0x554422, alpha * 0.5);
      zone.graphics.fillCircle(zone.x, zone.y, zoneRadius);

      // Inner swirl pattern (rotating cracks)
      const crackAlpha = alpha * pulse;
      zone.graphics.lineStyle(2, 0x8B6914, crackAlpha);
      for (let c = 0; c < 6; c++) {
        const angle = (Math.PI * 2 / 6) * c + time * 0.001;
        const innerR = zoneRadius * 0.3;
        const outerR = zoneRadius * 0.85;
        zone.graphics.beginPath();
        zone.graphics.moveTo(zone.x + Math.cos(angle) * innerR, zone.y + Math.sin(angle) * innerR);
        zone.graphics.lineTo(zone.x + Math.cos(angle) * outerR, zone.y + Math.sin(angle) * outerR);
        zone.graphics.strokePath();
      }

      // Edge ring pulsing
      zone.graphics.lineStyle(2, 0xAA8833, alpha * pulse);
      zone.graphics.strokeCircle(zone.x, zone.y, zoneRadius);

      // Dust particles rising (small squares drifting upward)
      for (let p = 0; p < 5; p++) {
        const seed = (time * 0.002 + p * 1.3) % 1;
        const pAngle = (p / 5) * Math.PI * 2 + time * 0.001;
        const dist = zoneRadius * (0.2 + seed * 0.6);
        const px = zone.x + Math.cos(pAngle) * dist;
        const py = zone.y + Math.sin(pAngle) * dist - seed * 12;
        const pAlpha = alpha * (1 - seed) * 0.8;
        zone.graphics.fillStyle(0xBB9955, pAlpha);
        zone.graphics.fillRect(px, py, 2, 2);
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
    this.scene.cameras.main.shake(150, 0.006);
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

        // Arrow impact visual
        const gfx = this.scene.add.graphics();
        gfx.setDepth(DEPTHS.EFFECTS);
        // Arrow falling line
        gfx.lineStyle(1, 0x228B22, 0.8);
        gfx.lineBetween(impactX, impactY - 20, impactX, impactY);
        // Impact spark
        gfx.fillStyle(0x44AA44, 0.7);
        gfx.fillCircle(impactX, impactY, 3);

        this.scene.tweens.add({
          targets: gfx, alpha: 0, duration: 300,
          onComplete: () => gfx.destroy(),
        });
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

    const projGfx = this.scene.add.graphics();
    projGfx.setDepth(DEPTHS.EFFECTS);

    // Trail graphics (additive blend)
    const trailGfx = this.scene.add.graphics();
    trailGfx.setBlendMode(Phaser.BlendModes.ADD);
    trailGfx.setDepth(DEPTHS.EFFECTS - 1);

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
          targets: [projGfx, trailGfx], alpha: 0, duration: 200,
          onComplete: () => { projGfx.destroy(); trailGfx.destroy(); },
        });
        return;
      }

      // Redraw projectile at new position
      projGfx.clear();
      // Outer glow
      projGfx.fillStyle(color, 0.7);
      projGfx.fillCircle(projState.x, projState.y, projSize);
      // Inner bright core
      projGfx.fillStyle(glowColor, 0.9);
      projGfx.fillCircle(projState.x, projState.y, projSize * 0.55);
      // White hot center
      projGfx.fillStyle(0xFFFFFF, 0.7);
      projGfx.fillCircle(projState.x, projState.y, projSize * 0.2);

      // Trail (fading circles behind)
      trailGfx.clear();
      for (let i = 1; i <= 4; i++) {
        const trailAlpha = (0.25 - i * 0.05);
        const trailX = projState.x - projState.vx * dtSec * i * 2;
        const trailY = projState.y - projState.vy * dtSec * i * 2;
        trailGfx.fillStyle(color, trailAlpha);
        trailGfx.fillCircle(trailX, trailY, projSize * (1 - i * 0.15));
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
      this.dragonDiveAimGfx = this.scene.add.graphics();
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

    // Draw aim indicator (appears after short delay)
    if (this.dragonDiveAimGfx && this.dragonDiveAimTimer >= indicatorDelay) {
      this.dragonDiveAimGfx.clear();
      const px = this.player.x;
      const py = this.player.y;
      const tx = this.dragonDiveTargetX;
      const ty = this.dragonDiveTargetY;
      const pulseAlpha = 0.5 + Math.sin(this.dragonDiveAimTimer * 0.012) * 0.3;
      const fadeIn = Math.min((this.dragonDiveAimTimer - indicatorDelay) / 150, 1); // fade in over 150ms
      const alpha = pulseAlpha * fadeIn;

      // Fire trail particles along the arrow path
      const arrowDist = Math.sqrt((tx - px) * (tx - px) + (ty - py) * (ty - py));
      const angle = Math.atan2(ty - py, tx - px);
      const particleCount = Math.floor(arrowDist / (8 * SPRITE_SCALE));
      for (let i = 0; i < particleCount; i++) {
        const t = (i + 0.5) / particleCount;
        const flicker = Math.sin(this.dragonDiveAimTimer * 0.015 + i * 1.2) * 3 * SPRITE_SCALE;
        const perpX = -Math.sin(angle) * flicker;
        const perpY = Math.cos(angle) * flicker;
        const fx = px + (tx - px) * t + perpX;
        const fy = py + (ty - py) * t + perpY;
        const size = (2 + Math.sin(this.dragonDiveAimTimer * 0.02 + i) * 1.5) * SPRITE_SCALE;
        // Fire gradient: orange core -> red outer
        const fireAlpha = alpha * (0.4 + 0.4 * Math.sin(this.dragonDiveAimTimer * 0.018 + i * 0.8));
        this.dragonDiveAimGfx.fillStyle(0xFF6600, fireAlpha);
        this.dragonDiveAimGfx.fillCircle(fx, fy, size);
        this.dragonDiveAimGfx.fillStyle(0xFFAA00, fireAlpha * 0.6);
        this.dragonDiveAimGfx.fillCircle(fx, fy, size * 0.6);
      }

      // Main arrow line (fiery)
      this.dragonDiveAimGfx.lineStyle(3, 0xFF4400, alpha);
      this.dragonDiveAimGfx.beginPath();
      this.dragonDiveAimGfx.moveTo(px, py);
      this.dragonDiveAimGfx.lineTo(tx, ty);
      this.dragonDiveAimGfx.strokePath();
      // Glow line (wider, fainter)
      this.dragonDiveAimGfx.lineStyle(6, 0xFF6600, alpha * 0.25);
      this.dragonDiveAimGfx.beginPath();
      this.dragonDiveAimGfx.moveTo(px, py);
      this.dragonDiveAimGfx.lineTo(tx, ty);
      this.dragonDiveAimGfx.strokePath();

      // Dragon head arrowhead (larger, fiercer)
      const headLen = 12 * SPRITE_SCALE;
      this.dragonDiveAimGfx.lineStyle(3, 0xFF4400, alpha);
      this.dragonDiveAimGfx.beginPath();
      this.dragonDiveAimGfx.moveTo(tx, ty);
      this.dragonDiveAimGfx.lineTo(
        tx - Math.cos(angle - 0.5) * headLen,
        ty - Math.sin(angle - 0.5) * headLen,
      );
      this.dragonDiveAimGfx.moveTo(tx, ty);
      this.dragonDiveAimGfx.lineTo(
        tx - Math.cos(angle + 0.5) * headLen,
        ty - Math.sin(angle + 0.5) * headLen,
      );
      this.dragonDiveAimGfx.strokePath();

      // Landing zone: fire circle with expanding/contracting ring
      const landingRadius = 20 * SPRITE_SCALE;
      const ringPulse = 1 + Math.sin(this.dragonDiveAimTimer * 0.01) * 0.15;
      // Outer fire glow
      this.dragonDiveAimGfx.fillStyle(0xFF2200, alpha * 0.08);
      this.dragonDiveAimGfx.fillCircle(tx, ty, landingRadius * 1.5 * ringPulse);
      // Main landing zone
      this.dragonDiveAimGfx.lineStyle(2, 0xFF6600, alpha * 0.8);
      this.dragonDiveAimGfx.strokeCircle(tx, ty, landingRadius * ringPulse);
      this.dragonDiveAimGfx.fillStyle(0xFF4400, alpha * 0.15);
      this.dragonDiveAimGfx.fillCircle(tx, ty, landingRadius * ringPulse);
      // Inner fire core
      this.dragonDiveAimGfx.fillStyle(0xFFAA00, alpha * 0.25);
      this.dragonDiveAimGfx.fillCircle(tx, ty, landingRadius * 0.4);

      // Dragon wing shapes at landing zone (decorative arcs)
      const wingAlpha = alpha * 0.3;
      this.dragonDiveAimGfx.lineStyle(2, 0xFF4400, wingAlpha);
      this.dragonDiveAimGfx.beginPath();
      this.dragonDiveAimGfx.arc(tx - 8 * SPRITE_SCALE, ty, 10 * SPRITE_SCALE, -Math.PI * 0.6, Math.PI * 0.6);
      this.dragonDiveAimGfx.strokePath();
      this.dragonDiveAimGfx.beginPath();
      this.dragonDiveAimGfx.arc(tx + 8 * SPRITE_SCALE, ty, 10 * SPRITE_SCALE, Math.PI * 0.4, Math.PI * 1.6);
      this.dragonDiveAimGfx.strokePath();
    }

    // Aim phase complete -> start dive
    if (this.dragonDiveAimTimer >= aimDuration) {
      this.isDragonDiveAiming = false;

      // Restore aim speed
      this.player.playerState.modifiers.speedMultiplier /= 0.6;

      // Clean up aim gfx
      if (this.dragonDiveAimGfx) {
        this.dragonDiveAimGfx.clear();
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
        this.dragonDiveShadowGfx = this.scene.add.graphics();
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

    const scale = 1 + heightFactor * 0.5;
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

    // Shadow on ground travels toward target
    if (this.dragonDiveShadowGfx) {
      this.dragonDiveShadowGfx.clear();
      const shadowX = Phaser.Math.Linear(this.dragonDiveOriginX, this.dragonDiveTargetX, travelProgress);
      const shadowY = Phaser.Math.Linear(this.dragonDiveOriginY, this.dragonDiveTargetY, travelProgress);
      const shadowScale = 1 - heightFactor * 0.5;
      const shadowAlpha = 0.4 * (1 - heightFactor * 0.3);
      this.dragonDiveShadowGfx.fillStyle(0x000000, shadowAlpha);
      this.dragonDiveShadowGfx.fillEllipse(
        shadowX, shadowY + 2,
        14 * shadowScale, 5 * shadowScale,
      );
    }

    // Landing
    if (progress >= 1) {
      this.isDragonDiving = false;
      this.dragonDiveTimer = 0;

      this.player.setScale(1);
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
        this.dragonDiveShadowGfx.clear();
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

      // Screen flash (brief white overlay)
      const flashGfx = this.scene.add.graphics();
      flashGfx.setDepth(DEPTHS.UI - 1);
      flashGfx.fillStyle(0xFFFFFF, 0.4);
      flashGfx.fillRect(
        this.scene.cameras.main.scrollX,
        this.scene.cameras.main.scrollY,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
      );
      this.scene.tweens.add({
        targets: flashGfx, alpha: 0, duration: 150,
        onComplete: () => flashGfx.destroy(),
      });

      // Leave flame zone on ground
      const flameGfx = this.scene.add.graphics();
      flameGfx.setDepth(DEPTHS.EFFECTS - 2);
      const flameProgress = { remaining: flameDuration };
      const flameR = radius * 0.8;

      this.scene.tweens.add({
        targets: flameProgress, remaining: 0, duration: flameDuration,
        onUpdate: () => {
          flameGfx.clear();
          const a = Math.max(0, flameProgress.remaining / flameDuration) * 0.35;
          flameGfx.fillStyle(0xFF4400, a);
          flameGfx.fillCircle(lx, ly, flameR);
          flameGfx.fillStyle(0xFF8800, a * 0.6);
          flameGfx.fillCircle(lx, ly, flameR * 0.5);
        },
        onComplete: () => flameGfx.destroy(),
      });

      this.scene.cameras.main.shake(250, 0.012);

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
      this.bladeStormGfx = this.scene.add.graphics();
      this.bladeStormGfx.setDepth(DEPTHS.EFFECTS);
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
        this.bladeStormGfx.clear();
      }
      this.lockCooldown = JobSkillManager.LOCK_GAP;
      return;
    }

    const progress = this.bladeStormTimer / duration;
    const rotSpeed = Math.PI * 6; // 3 full rotations over the duration
    const currentAngle = progress * rotSpeed;
    const fadeAlpha = progress > 0.7 ? (1 - progress) / 0.3 : 1;

    // Draw rotating slash arcs
    if (this.bladeStormGfx) {
      this.bladeStormGfx.clear();
      const px = this.player.x;
      const py = this.player.y;

      for (let i = 0; i < slashCount; i++) {
        const slashAngle = currentAngle + (Math.PI * 2 / slashCount) * i;
        const sx = px + Math.cos(slashAngle) * radius * 0.8;
        const sy = py + Math.sin(slashAngle) * radius * 0.8;
        const ex = px + Math.cos(slashAngle) * radius;
        const ey = py + Math.sin(slashAngle) * radius;

        // Bright slash line
        this.bladeStormGfx.lineStyle(2, 0xFF4444, fadeAlpha * 0.9);
        this.bladeStormGfx.lineBetween(px, py, ex, ey);

        // Slash tip glow
        this.bladeStormGfx.fillStyle(0xFFAAAA, fadeAlpha * 0.6);
        this.bladeStormGfx.fillCircle(sx, sy, 2);
      }

      // Center glow
      this.bladeStormGfx.fillStyle(0xB22222, fadeAlpha * 0.2);
      this.bladeStormGfx.fillCircle(px, py, radius * 0.3);
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
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS);

    // Jagged lightning with segments scaling with size
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

    // Draw bright core (thicker at higher scale)
    gfx.lineStyle(Math.max(2, 2 * scale), 0xFFFF44, 0.9);
    gfx.beginPath();
    gfx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      gfx.lineTo(points[i].x, points[i].y);
    }
    gfx.strokePath();

    // Draw glow (thicker at higher scale)
    gfx.lineStyle(Math.max(4, 4 * scale), 0x4444FF, 0.3);
    gfx.beginPath();
    gfx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      gfx.lineTo(points[i].x, points[i].y);
    }
    gfx.strokePath();

    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => gfx.destroy(),
    });

    // Electric blue additive glow along the bolt path
    const boltGlow = this.scene.add.graphics();
    boltGlow.setBlendMode(Phaser.BlendModes.ADD);
    boltGlow.setDepth(DEPTHS.EFFECTS - 1);
    // Draw thick soft glow line following the bolt segments
    boltGlow.lineStyle(8, 0x4488FF, 0.25);
    boltGlow.beginPath();
    boltGlow.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      boltGlow.lineTo(points[i].x, points[i].y);
    }
    boltGlow.strokePath();
    // Glow circles at each bolt vertex for extra bloom
    for (const pt of points) {
      boltGlow.fillStyle(0x4488FF, 0.2);
      boltGlow.fillCircle(pt.x, pt.y, 6);
    }
    this.scene.tweens.add({
      targets: boltGlow,
      alpha: 0,
      duration: 250,
      ease: 'Quad.easeOut',
      onComplete: () => boltGlow.destroy(),
    });
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

    // Smoke visual
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS);
    gfx.fillStyle(0x333344, 0.6);
    gfx.fillCircle(this.player.x, this.player.y, radius);
    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: invulnDuration,
      ease: 'Quad.easeOut',
      onComplete: () => gfx.destroy(),
    });
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

        // Purple slash visual
        const gfx = this.scene.add.graphics();
        gfx.setDepth(DEPTHS.EFFECTS);
        gfx.fillStyle(0x9933FF, 0.4);
        gfx.slice(px, py, radius, slashAngle - 0.4, slashAngle + 0.4, false);
        gfx.fillPath();
        this.scene.tweens.add({
          targets: gfx, alpha: 0, duration: 200,
          onComplete: () => gfx.destroy(),
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

    // Golden zone visual
    const radius = params.radius ?? 60;
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS - 1);
    gfx.fillStyle(0xFFDD44, 0.3);
    gfx.fillCircle(this.player.x, this.player.y, radius);
    gfx.lineStyle(2, 0xFFDD44, 0.8);
    gfx.strokeCircle(this.player.x, this.player.y, radius);
    this.scene.tweens.add({
      targets: gfx, alpha: 0, duration: duration,
      ease: 'Linear',
      onComplete: () => gfx.destroy(),
    });
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

    // Ice field visual
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS - 1);
    gfx.fillStyle(0x88CCFF, 0.4);
    gfx.fillCircle(this.player.x, this.player.y, radius);
    this.scene.tweens.add({
      targets: gfx, alpha: 0, duration: freezeDuration,
      onComplete: () => gfx.destroy(),
    });
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

    // Green healing zone visual
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS - 1);
    gfx.fillStyle(0x44FF88, 0.25);
    gfx.fillCircle(px, py, radius);
    gfx.lineStyle(2, 0x44FF88, 0.6);
    gfx.strokeCircle(px, py, radius);
    this.scene.tweens.add({
      targets: gfx, alpha: 0, duration: duration,
      ease: 'Linear',
      onComplete: () => gfx.destroy(),
    });

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

    // Destroy dragon dive shadow
    if (this.dragonDiveShadowGfx) {
      this.dragonDiveShadowGfx.destroy();
      this.dragonDiveShadowGfx = null;
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
