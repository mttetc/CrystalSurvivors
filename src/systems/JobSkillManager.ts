import Phaser from 'phaser';
import { EVENTS, JobSkillId, MasterySkillId } from '../constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { JOB_SKILL_DEFS, MASTERY_SKILL_DEFS } from '../data/jobs';
import { EventBus } from './EventBus';
import {
  // Types
  SkillContext, SkillHelpers,
  TrailZone, GroundZone,
  JumpState, DragonDiveState, ChargeState, BladeStormState,
  // Helpers
  createSkillHelpers,
  // Categories
  AURA_SKILLS, PERIODIC_AOE_SKILLS, LASER_SKILLS, JUMP_SKILLS, BARRAGE_SKILLS,
  FAMILIAR_SKILLS, TRAIL_SKILLS, ELIXIR_SKILLS, ZANTETSUKEN_SKILLS, ORBITAL_SKILLS,
  FIREBALL_SKILLS, LIGHTNING_STRIKE_SKILLS, GROUND_ZONE_SKILLS, WAR_CRY_SKILLS,
  CHARGE_SKILLS, ARROW_RAIN_SKILLS, PIERCING_PROJECTILE_SKILLS, DRAGON_DIVE_SKILLS,
  BLADE_STORM_SKILLS, SMOKE_BOMB_SKILLS, DUAL_STRIKE_SKILLS, HALLOWED_GROUND_SKILLS,
  TIME_STOP_SKILLS, FREEZE_SKILLS, ASYLUM_SKILLS,
  // Skill handlers
  updateAura,
  updatePeriodicAoE,
  updateLaser,
  updateFamiliar,
  updateTrail, updateTrailZones, updateElixir, updateZantetsuken,
  updateOrbital, destroyOrbitalShields,
  handleDarkness, handleThunder,
  updateSmokeBomb, updateHallowedGround, updateTimeStop, updateFreeze, updateAsylum,
  updateJump, updateJumpCharge, updateJumpInProgress,
  updateBarrage,
  updateFireball, updateLightningStrike, updateGroundZone, updateGroundZones,
  updateWarCry, updateCharge, updateChargeInProgress,
  updateArrowRain, updatePiercingProjectile,
  updateDragonDive, updateDragonDiveAim, updateDragonDiveInProgress,
  updateBladeStorm, updateBladeStormInProgress,
  updateDualStrike,
  LOCK_GAP,
} from './skills';

// ─── JobSkillManager ────────────────────────────────────────────────────────

export class JobSkillManager {
  private ctx: SkillContext;
  private helpers: SkillHelpers;

  // Cooldown accumulators per skill (ms elapsed since last trigger)
  private skillTimers: Map<string, number> = new Map();

  // Persistent aura sprites (repositioned each frame)
  private auraGraphics: Map<string, Phaser.GameObjects.GameObject> = new Map();

  // Familiar state
  private familiarGraphics: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private familiarAngles: Map<string, number> = new Map();
  private familiarAttackTimers: Map<string, number> = new Map();

  // Jump state
  private jumpState: JumpState = {
    isJumping: false,
    isChargingJump: false,
    jumpChargeTimer: 0,
    jumpChargeDuration: 1000,
    jumpChargeGfx: null,
    jumpTimer: 0,
    jumpDuration: 900,
    jumpSkillId: '',
    jumpParams: {},
    jumpOriginX: 0,
    jumpOriginY: 0,
    jumpShadowGfx: null,
  };

  // Trail zones
  private trailZones: TrailZone[] = [];

  // Lock cooldown: minimum free-movement gap between position-locking skills
  private lockCooldown = 0;

  // Dragon Dive state
  private dragonDiveState: DragonDiveState = {
    isDragonDiving: false,
    isDragonDiveAiming: false,
    dragonDiveAimTimer: 0,
    dragonDiveTargetX: 0,
    dragonDiveTargetY: 0,
    dragonDiveAimGfx: null,
    dragonDiveTimer: 0,
    dragonDiveDuration: 700,
    dragonDiveSkillId: '',
    dragonDiveParams: {},
    dragonDiveOriginX: 0,
    dragonDiveOriginY: 0,
    dragonDiveShadowGfx: null,
  };

  // Rampage charge state
  private chargeState: ChargeState = {
    isCharging: false,
    chargeTimer: 0,
    chargeDuration: 400,
    chargeSkillId: '',
    chargeParams: {},
    chargeAngle: 0,
    chargeHitEnemies: new Set<Enemy>(),
  };

  // Blade Storm state
  private bladeStormState: BladeStormState = {
    bladeStormActive: false,
    bladeStormTimer: 0,
    bladeStormSkillId: '',
    bladeStormParams: {},
    bladeStormGfx: null,
    bladeStormHitTimer: 0,
  };

  // Ground zone state (Doton)
  private groundZones: GroundZone[] = [];

  // Darkness internal cooldown
  private darknessCooldownTimer = 0;
  private readonly darknessCooldown = 500;

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
    this.ctx = { scene, player, enemyGroup, projectileGroup };
    this.helpers = createSkillHelpers(this.ctx, this.skillTimers);

    // Listen for skill upgrades to re-initialize timers if needed
    this.onJobSkillUpgraded = () => {
      // No special re-init needed; timers carry over naturally.
    };
    EventBus.on(EVENTS.JOB_SKILL_UPGRADED, this.onJobSkillUpgraded);

    // DARKNESS: triggered when player takes damage
    this.onPlayerDamageTaken = (_damage: number) => {
      if (this.darknessCooldownTimer > 0) return;
      this.darknessCooldownTimer = this.darknessCooldown;
      handleDarkness(this.ctx, this.helpers);
    };
    EventBus.on(EVENTS.PLAYER_DAMAGE_TAKEN, this.onPlayerDamageTaken);

    // THUNDER: triggered on critical hits
    this.onCritHit = (enemy: Enemy, damage: number) => {
      handleThunder(this.ctx, this.helpers, enemy);
    };
    EventBus.on(EVENTS.CRIT_HIT, this.onCritHit);
  }

  // ─── Main update loop ───────────────────────────────────────────────────

  public update(_time: number, delta: number): void {
    const skillLevels = this.ctx.player.playerState.jobSkillLevels;

    // Update darkness internal cooldown
    if (this.darknessCooldownTimer > 0) {
      this.darknessCooldownTimer -= delta;
    }

    // Update lock cooldown (minimum gap between position-locking skills)
    if (this.lockCooldown > 0) {
      this.lockCooldown -= delta;
    }

    // Update Dragon Dive aim phase
    if (this.dragonDiveState.isDragonDiveAiming) {
      updateDragonDiveAim(this.ctx, this.helpers, delta, this.dragonDiveState);
      return;
    }

    // Update jump charge or active jump
    if (this.jumpState.isChargingJump) {
      updateJumpCharge(this.ctx, this.helpers, delta, this.jumpState);
      return;
    }
    if (this.jumpState.isJumping) {
      const result = updateJumpInProgress(this.ctx, this.helpers, delta, this.jumpState);
      if (result.lockCooldownSet) this.lockCooldown = LOCK_GAP;
      return;
    }

    // Update Dragon Dive if active
    if (this.dragonDiveState.isDragonDiving) {
      const result = updateDragonDiveInProgress(this.ctx, this.helpers, delta, this.dragonDiveState);
      if (result.lockCooldownSet) this.lockCooldown = LOCK_GAP;
      return;
    }

    // Update charge if active
    if (this.chargeState.isCharging) {
      const result = updateChargeInProgress(this.ctx, this.helpers, delta, this.chargeState);
      if (result.lockCooldownSet) this.lockCooldown = LOCK_GAP;
      return;
    }

    // Update Blade Storm if active
    if (this.bladeStormState.bladeStormActive) {
      const result = updateBladeStormInProgress(this.ctx, this.helpers, delta, this.bladeStormState);
      if (result.lockCooldownSet) this.lockCooldown = LOCK_GAP;
    }

    // Update trail zones
    updateTrailZones(this.helpers, delta, this.trailZones);

    // Update ground zones (Doton)
    updateGroundZones(this.ctx, this.helpers, delta, this.groundZones);

    // Iterate active skills
    for (const [skillId, level] of Object.entries(skillLevels)) {
      if (level <= 0) continue;

      const def = JOB_SKILL_DEFS[skillId as JobSkillId] ?? MASTERY_SKILL_DEFS[skillId as MasterySkillId];
      if (!def || def.type !== 'active') continue;

      const params = def.levels[level - 1]?.params;
      if (!params) continue;

      if (AURA_SKILLS.has(skillId)) {
        updateAura(this.ctx, this.helpers, skillId, params, delta, this.auraGraphics);
      } else if (PERIODIC_AOE_SKILLS.has(skillId)) {
        updatePeriodicAoE(this.ctx, this.helpers, skillId, params, delta);
      } else if (LASER_SKILLS.has(skillId)) {
        updateLaser(this.ctx, this.helpers, skillId, params, delta);
      } else if (JUMP_SKILLS.has(skillId)) {
        updateJump(this.ctx, this.helpers, skillId, params, delta, this.jumpState, this.lockCooldown);
      } else if (BARRAGE_SKILLS.has(skillId)) {
        updateBarrage(this.ctx, this.helpers, skillId, params, delta);
      } else if (FAMILIAR_SKILLS.has(skillId)) {
        updateFamiliar(this.ctx, this.helpers, skillId, params, delta, this.familiarGraphics, this.familiarAngles, this.familiarAttackTimers);
      } else if (TRAIL_SKILLS.has(skillId)) {
        updateTrail(this.ctx, this.helpers, skillId, params, delta, this.trailZones);
      } else if (ELIXIR_SKILLS.has(skillId)) {
        updateElixir(this.ctx, this.helpers, skillId, params, delta);
      } else if (ZANTETSUKEN_SKILLS.has(skillId)) {
        updateZantetsuken(this.ctx, this.helpers, skillId, params, delta);
      } else if (ORBITAL_SKILLS.has(skillId)) {
        updateOrbital(this.ctx, this.helpers, skillId, params, delta, this.orbitalImages, this.orbitalAngles, this.orbitalHitTimers, this.orbitalLastCount);
      } else if (FIREBALL_SKILLS.has(skillId)) {
        updateFireball(this.ctx, this.helpers, skillId, params, delta);
      } else if (LIGHTNING_STRIKE_SKILLS.has(skillId)) {
        updateLightningStrike(this.ctx, this.helpers, skillId, params, delta);
      } else if (GROUND_ZONE_SKILLS.has(skillId)) {
        updateGroundZone(this.ctx, this.helpers, skillId, params, delta, this.groundZones);
      } else if (WAR_CRY_SKILLS.has(skillId)) {
        updateWarCry(this.ctx, this.helpers, skillId, params, delta);
      } else if (CHARGE_SKILLS.has(skillId)) {
        updateCharge(this.ctx, this.helpers, skillId, params, delta, this.chargeState, this.lockCooldown);
      } else if (ARROW_RAIN_SKILLS.has(skillId)) {
        updateArrowRain(this.ctx, this.helpers, skillId, params, delta);
      } else if (PIERCING_PROJECTILE_SKILLS.has(skillId)) {
        updatePiercingProjectile(this.ctx, this.helpers, skillId, params, delta);
      } else if (DRAGON_DIVE_SKILLS.has(skillId)) {
        updateDragonDive(this.ctx, this.helpers, skillId, params, delta, this.dragonDiveState, this.jumpState, this.lockCooldown);
      } else if (BLADE_STORM_SKILLS.has(skillId)) {
        updateBladeStorm(this.ctx, this.helpers, skillId, params, delta, this.bladeStormState, this.lockCooldown);
      } else if (SMOKE_BOMB_SKILLS.has(skillId)) {
        updateSmokeBomb(this.ctx, this.helpers, skillId, params, delta);
      } else if (DUAL_STRIKE_SKILLS.has(skillId)) {
        updateDualStrike(this.ctx, this.helpers, skillId, params, delta);
      } else if (HALLOWED_GROUND_SKILLS.has(skillId)) {
        updateHallowedGround(this.ctx, this.helpers, skillId, params, delta);
      } else if (TIME_STOP_SKILLS.has(skillId)) {
        updateTimeStop(this.ctx, this.helpers, skillId, params, delta);
      } else if (FREEZE_SKILLS.has(skillId)) {
        updateFreeze(this.ctx, this.helpers, skillId, params, delta);
      } else if (ASYLUM_SKILLS.has(skillId)) {
        updateAsylum(this.ctx, this.helpers, skillId, params, delta);
      }
      // DARKNESS and THUNDER are event-driven, handled separately
    }
  }

  // ─── Cleanup ────────────────────────────────────────────────────────────

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
      destroyOrbitalShields(skillId, this.orbitalImages, this.orbitalAngles, this.orbitalHitTimers);
    }
    this.orbitalLastCount.clear();

    // Destroy jump graphics
    if (this.jumpState.jumpShadowGfx) {
      this.jumpState.jumpShadowGfx.destroy();
      this.jumpState.jumpShadowGfx = null;
    }
    if (this.jumpState.jumpChargeGfx) {
      this.jumpState.jumpChargeGfx.destroy();
      this.jumpState.jumpChargeGfx = null;
    }

    // Destroy dragon dive graphics
    if (this.dragonDiveState.dragonDiveShadowGfx) {
      this.dragonDiveState.dragonDiveShadowGfx.destroy();
      this.dragonDiveState.dragonDiveShadowGfx = null;
    }
    if (this.dragonDiveState.dragonDiveAimGfx) {
      this.dragonDiveState.dragonDiveAimGfx.destroy();
      this.dragonDiveState.dragonDiveAimGfx = null;
    }

    // Destroy blade storm graphics
    if (this.bladeStormState.bladeStormGfx) {
      this.bladeStormState.bladeStormGfx.destroy();
      this.bladeStormState.bladeStormGfx = null;
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
