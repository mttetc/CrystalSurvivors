import Phaser from 'phaser';
import { EVENTS, DEPTHS, JobSkillId } from '../constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { JOB_SKILL_DEFS } from '../data/jobs';
import { EventBus } from './EventBus';

// ─── Skill category classification ──────────────────────────────────────────

const AURA_SKILLS = new Set<string>([JobSkillId.CONSECRATE, JobSkillId.REQUIEM]);
const PERIODIC_AOE_SKILLS = new Set<string>([
  JobSkillId.CHI_BURST, JobSkillId.HOLY, JobSkillId.BAHAMUT,
  JobSkillId.METEOR, JobSkillId.GUST, JobSkillId.QUAKE,
]);
const JUMP_SKILLS = new Set<string>([JobSkillId.JUMP]);
const BARRAGE_SKILLS = new Set<string>([JobSkillId.BARRAGE]);
const FAMILIAR_SKILLS = new Set<string>([JobSkillId.IFRIT, JobSkillId.SHIVA]);
const TRAIL_SKILLS = new Set<string>([JobSkillId.PITFALL]);
const ELIXIR_SKILLS = new Set<string>([JobSkillId.ELIXIR]);
const ZANTETSUKEN_SKILLS = new Set<string>([JobSkillId.ZANTETSUKEN]);
const ORBITAL_SKILLS = new Set<string>([JobSkillId.SACRED_ORBIT]);

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
  private jumpTimer = 0;
  private jumpDuration = 600; // ms in the air
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

    // Update jump if active
    if (this.isJumping) {
      this.updateJumpInProgress(delta);
      // While jumping, skip other skill updates
      return;
    }

    // Update trail zones
    this.updateTrailZones(delta);

    // Iterate active skills
    for (const [skillId, level] of Object.entries(skillLevels)) {
      if (level <= 0) continue;

      const def = JOB_SKILL_DEFS[skillId as JobSkillId];
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
    const cdMult = this.player.playerState.modifiers.cooldownMultiplier;
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
    if (this.isJumping) return;

    const cooldown = this.getEffectiveCooldown(params.cooldown ?? 8000);
    const elapsed = this.addTimer(skillId, delta);
    if (elapsed < cooldown) return;
    this.setTimer(skillId, elapsed - cooldown);

    // Start jump
    this.isJumping = true;
    this.jumpTimer = 0;
    this.jumpSkillId = skillId;
    this.jumpParams = { ...params };
    this.jumpOriginX = this.player.x;
    this.jumpOriginY = this.player.y;

    // Player becomes invulnerable during jump
    this.player.playerState.isInvulnerable = true;

    // Disable player body during jump so they can't be pushed
    if (this.player.body) {
      (this.player.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    // Create shadow sprite on the ground
    if (!this.jumpShadowGfx) {
      this.jumpShadowGfx = this.scene.add.graphics();
    }
    this.jumpShadowGfx.setDepth(DEPTHS.GROUND + 1);
    this.jumpShadowGfx.setAlpha(1);
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

    const maxHeight = 80; // pixels above ground (high jump!)
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
        this.jumpOriginX, this.jumpOriginY + 2,
        12 * shadowScale, 4 * shadowScale,
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
      this.drawLightningBolt(from.x, from.y, to.x, to.y);
    }
  }

  private drawLightningBolt(x1: number, y1: number, x2: number, y2: number): void {
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS);

    // Jagged lightning with 4 segments
    const segments = 4;
    const points: { x: number; y: number }[] = [{ x: x1, y: y1 }];
    const dx = x2 - x1;
    const dy = y2 - y1;

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const jitter = 6;
      points.push({
        x: x1 + dx * t + (Math.random() - 0.5) * jitter * 2,
        y: y1 + dy * t + (Math.random() - 0.5) * jitter * 2,
      });
    }
    points.push({ x: x2, y: y2 });

    // Draw bright core
    gfx.lineStyle(2, 0xFFFF44, 0.9);
    gfx.beginPath();
    gfx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      gfx.lineTo(points[i].x, points[i].y);
    }
    gfx.strokePath();

    // Draw glow
    gfx.lineStyle(4, 0x4444FF, 0.3);
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

    // Destroy jump shadow graphics
    if (this.jumpShadowGfx) {
      this.jumpShadowGfx.destroy();
      this.jumpShadowGfx = null;
    }

    // Destroy trail zone graphics
    for (const zone of this.trailZones) {
      zone.graphics.destroy();
    }
    this.trailZones.length = 0;

    // Clear timers
    this.skillTimers.clear();
    this.familiarAngles.clear();
    this.familiarAttackTimers.clear();
  }
}
