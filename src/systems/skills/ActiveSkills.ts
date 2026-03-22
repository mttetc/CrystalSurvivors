import Phaser from 'phaser';
import { EVENTS, DEPTHS, JobSkillId, MasterySkillId, SPRITE_SCALE } from '../../constants';
import { Enemy } from '../../entities/Enemy';
import { MASTERY_SKILL_DEFS } from '../../data/jobs';
import { EventBus } from '../EventBus';
import { spawnFX, spawnFlash, spawnLine, spawnParticleBurst } from '../../weapons/fxHelper';
import { SkillContext, SkillHelpers } from './SkillTypes';

// ---- Ground zone type ----

export interface GroundZone {
  x: number; y: number; damage: number; slowPercent: number;
  remaining: number; tickTimer: number; graphics: Phaser.GameObjects.Sprite;
}

// ---- Jump state ----

export interface JumpState {
  isJumping: boolean;
  isChargingJump: boolean;
  jumpChargeTimer: number;
  jumpChargeDuration: number;
  jumpChargeGfx: Phaser.GameObjects.Sprite | null;
  jumpTimer: number;
  jumpDuration: number;
  jumpSkillId: string;
  jumpParams: Record<string, number>;
  jumpOriginX: number;
  jumpOriginY: number;
  jumpShadowGfx: Phaser.GameObjects.Sprite | null;
}

// ---- Dragon Dive state ----

export interface DragonDiveState {
  isDragonDiving: boolean;
  isDragonDiveAiming: boolean;
  dragonDiveAimTimer: number;
  dragonDiveTargetX: number;
  dragonDiveTargetY: number;
  dragonDiveAimGfx: Phaser.GameObjects.Sprite | null;
  dragonDiveTimer: number;
  dragonDiveDuration: number;
  dragonDiveSkillId: string;
  dragonDiveParams: Record<string, number>;
  dragonDiveOriginX: number;
  dragonDiveOriginY: number;
  dragonDiveShadowGfx: Phaser.GameObjects.Sprite | null;
}

// ---- Charge state ----

export interface ChargeState {
  isCharging: boolean;
  chargeTimer: number;
  chargeDuration: number;
  chargeSkillId: string;
  chargeParams: Record<string, number>;
  chargeAngle: number;
  chargeHitEnemies: Set<Enemy>;
}

// ---- Blade Storm state ----

export interface BladeStormState {
  bladeStormActive: boolean;
  bladeStormTimer: number;
  bladeStormSkillId: string;
  bladeStormParams: Record<string, number>;
  bladeStormGfx: Phaser.GameObjects.Sprite | null;
  bladeStormHitTimer: number;
}

// ---- Lock cooldown constant ----

export const LOCK_GAP = 2500;

// ═══════════════════════════════════════════════════════════════════════════
// JUMP (DRAGOON)
// ═══════════════════════════════════════════════════════════════════════════

export function updateJump(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
  jumpState: JumpState,
  lockCooldown: number,
): void {
  const { scene, player } = ctx;

  if (jumpState.isJumping || jumpState.isChargingJump) return;
  if (lockCooldown > 0) return;

  const cooldown = Math.max(4000, helpers.getEffectiveCooldown(params.cooldown ?? 8000));
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  jumpState.isChargingJump = true;
  jumpState.jumpChargeTimer = 0;
  jumpState.jumpSkillId = skillId;
  jumpState.jumpParams = { ...params };
  jumpState.jumpOriginX = player.x;
  jumpState.jumpOriginY = player.y;

  player.playerState.modifiers.speedMultiplier *= 0.55;

  if (!jumpState.jumpChargeGfx) {
    jumpState.jumpChargeGfx = scene.add.sprite(player.x, player.y, 'fx_circle_spark', 0);
    jumpState.jumpChargeGfx.setTint(0x4169E1);
  }
  jumpState.jumpChargeGfx.setDepth(DEPTHS.EFFECTS);
  jumpState.jumpChargeGfx.setAlpha(1);
}

export function updateJumpCharge(
  ctx: SkillContext,
  helpers: SkillHelpers,
  delta: number,
  jumpState: JumpState,
): void {
  const { scene, player } = ctx;

  jumpState.jumpChargeTimer += delta;
  const progress = Math.min(jumpState.jumpChargeTimer / jumpState.jumpChargeDuration, 1);

  jumpState.jumpOriginX = player.x;
  jumpState.jumpOriginY = player.y;

  if (jumpState.jumpChargeGfx) {
    const px = player.x;
    const py = player.y;

    const ringRadius = (1 - progress) * 40 * SPRITE_SCALE + 6 * SPRITE_SCALE;
    jumpState.jumpChargeGfx.setPosition(px, py);
    jumpState.jumpChargeGfx.setScale((ringRadius * 2) / 32);
    jumpState.jumpChargeGfx.setAlpha(0.5 + progress * 0.5);

    if (Math.random() < 0.15) {
      const angle = Math.random() * Math.PI * 2;
      const dist = ringRadius * 0.8;
      const px2 = px + Math.cos(angle) * dist;
      const py2 = py + Math.sin(angle) * dist;
      spawnFX(scene, px2, py2, 'fx_smoke_circular', {
        scale: 0.5, tint: 0x8899AA, alpha: 0.5 * (1 - progress * 0.5),
        duration: 200, depth: DEPTHS.EFFECTS,
      });
    }

    player.setScale(SPRITE_SCALE * (1 + progress * 0.1), SPRITE_SCALE * (1 - progress * 0.2));
  }

  if (progress >= 1) {
    jumpState.isChargingJump = false;

    player.playerState.modifiers.speedMultiplier /= 0.55;

    if (jumpState.jumpChargeGfx) {
      jumpState.jumpChargeGfx.setAlpha(0);
    }

    player.setScale(SPRITE_SCALE);

    jumpState.isJumping = true;
    jumpState.jumpTimer = 0;

    player.playerState.isInvulnerable = true;
    if (player.body) {
      (player.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    if (!jumpState.jumpShadowGfx) {
      jumpState.jumpShadowGfx = scene.add.sprite(player.x, player.y, 'fx_circle_orange', 0);
      jumpState.jumpShadowGfx.setTint(0x000000);
    }
    jumpState.jumpShadowGfx.setDepth(DEPTHS.GROUND + 1);
    jumpState.jumpShadowGfx.setAlpha(1);
  }
}

export function updateJumpInProgress(
  ctx: SkillContext,
  helpers: SkillHelpers,
  delta: number,
  jumpState: JumpState,
): { lockCooldownSet: boolean } {
  const { scene, player } = ctx;

  jumpState.jumpTimer += delta;
  const totalDuration = jumpState.jumpDuration;
  const progress = Math.min(jumpState.jumpTimer / totalDuration, 1);

  const ascendEnd = 0.5;
  const hoverEnd = 0.65;

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

  const maxHeight = 200 * SPRITE_SCALE;
  const yOffset = -heightFactor * maxHeight;

  player.y = jumpState.jumpOriginY + yOffset;
  player.x = jumpState.jumpOriginX;

  const scale = SPRITE_SCALE * (1 + heightFactor * 0.4);
  player.setScale(scale);

  if (progress > hoverEnd) {
    const descendProgress = (progress - hoverEnd) / (1 - hoverEnd);
    player.setAngle(descendProgress * 360);
  } else {
    player.setAngle(0);
  }

  if (jumpState.jumpShadowGfx) {
    const shadowScale = 1 - heightFactor * 0.5;
    const shadowAlpha = 0.4 * (1 - heightFactor * 0.3);
    jumpState.jumpShadowGfx.setPosition(jumpState.jumpOriginX, jumpState.jumpOriginY + 2 * SPRITE_SCALE);
    jumpState.jumpShadowGfx.setScale(
      (12 * SPRITE_SCALE * shadowScale) / 16,
      (4 * SPRITE_SCALE * shadowScale) / 16,
    );
    jumpState.jumpShadowGfx.setAlpha(shadowAlpha);
  }

  if (progress >= 1) {
    jumpState.isJumping = false;
    jumpState.jumpTimer = 0;

    player.setScale(SPRITE_SCALE);
    player.setAngle(0);
    player.x = jumpState.jumpOriginX;
    player.y = jumpState.jumpOriginY;
    player.playerState.isInvulnerable = false;

    if (player.body) {
      (player.body as Phaser.Physics.Arcade.Body).enable = true;
    }

    if (jumpState.jumpShadowGfx) {
      jumpState.jumpShadowGfx.setAlpha(0);
    }

    const radius = jumpState.jumpParams.radius ?? 40;
    const damage = jumpState.jumpParams.damage ?? 15;
    const lx = jumpState.jumpOriginX;
    const ly = jumpState.jumpOriginY;

    const enemies = helpers.getEnemiesInRadius(lx, ly, radius);
    for (const enemy of enemies) {
      enemy.takeDamage(damage, true);
      EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
    }

    helpers.drawExpandingRing(lx, ly, 5, radius, 0x4169E1, 500);
    helpers.drawExpandingRing(lx, ly, 3, radius * 0.6, 0x6699FF, 300);
    helpers.drawPulse(lx, ly, radius, 0x88BBFF, 0.9, 400);

    spawnParticleBurst(scene, lx, ly, 8, 0x8899AA, 40, 300);

    return { lockCooldownSet: true };
  }

  return { lockCooldownSet: false };
}

// ═══════════════════════════════════════════════════════════════════════════
// BARRAGE (RANGER)
// ═══════════════════════════════════════════════════════════════════════════

export function updateBarrage(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { player, enemyGroup, projectileGroup } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 6000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const count = params.count ?? 5;
  const px = player.x;
  const py = player.y;

  let aimAngle = 0;
  let nearestDist = Infinity;
  const children = enemyGroup.getChildren() as Enemy[];
  for (const enemy of children) {
    if (!enemy.active) continue;
    const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
    if (d < nearestDist) {
      nearestDist = d;
      aimAngle = Math.atan2(enemy.y - py, enemy.x - px);
    }
  }

  const coneSpread = Math.PI * 0.4;
  const speed = 200;
  const damage = 5;
  const startAngle = aimAngle - coneSpread / 2;
  const step = count > 1 ? coneSpread / (count - 1) : 0;

  for (let i = 0; i < count; i++) {
    const angle = count > 1 ? startAngle + step * i : aimAngle;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const proj = projectileGroup.getFirstDead(false);
    if (proj) {
      proj.fire(
        px, py,
        vx, vy,
        'kunai',
        damage,
        0,
        1,
        'barrage' as any,
        null,
        0,
        1500,
      );
    }
  }

  helpers.drawPulse(px, py, 12, 0x228B22, 0.6, 200);
}

// ═══════════════════════════════════════════════════════════════════════════
// KATON (Ninja) - fireball
// ═══════════════════════════════════════════════════════════════════════════

export function updateFireball(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player, enemyGroup } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 5000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const radius = params.radius ?? 60;
  const damage = params.damage ?? 12;
  const burnDamage = params.burnDamage ?? 3;
  const burnDuration = params.burnDuration ?? 2000;
  const px = player.x;
  const py = player.y;

  let target: Enemy | null = null;
  let nearestDist = Infinity;
  const children = enemyGroup.getChildren() as Enemy[];
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

  const fbScale = 0.7 + damage / 25;

  const fireball = scene.add.sprite(px, py, 'fx_flame', 0);
  fireball.setDepth(DEPTHS.EFFECTS + 1);
  fireball.setTint(0xFFAA00);
  fireball.setScale(fbScale);
  fireball.setAlpha(0.9);

  spawnFlash(scene, px, py, 10 * fbScale, 0xFF6600, 150);

  scene.tweens.add({
    targets: fireball,
    x: tx,
    y: ty,
    duration: travelDuration,
    ease: 'Quad.easeIn',
    onUpdate: () => {
      if (Math.random() < 0.08) {
        spawnFX(scene,
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
      fireballExplode(ctx, helpers, explosionX, explosionY, radius, damage, burnDamage, burnDuration);
    },
  });
}

function fireballExplode(
  ctx: SkillContext,
  helpers: SkillHelpers,
  x: number, y: number, radius: number,
  damage: number, burnDamage: number, burnDuration: number,
): void {
  const children = ctx.enemyGroup.getChildren() as Enemy[];
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

  helpers.drawExpandingRing(x, y, 5, radius, 0xFF4400, 400);
  helpers.drawExpandingRing(x, y, 3, radius * 0.6, 0xFF8800, 300);
  helpers.drawPulse(x, y, radius * 0.7, 0xFF6600, 0.8, 300);
  helpers.drawImpactParticles(x, y, 0xFF4400, 10, 70, 350);
  helpers.drawAdditiveGlow(x, y, radius * 0.6, 0xFF4400, 0.4, 400);
}

// ═══════════════════════════════════════════════════════════════════════════
// RAITON (Ninja) - lightning strikes
// ═══════════════════════════════════════════════════════════════════════════

export function updateLightningStrike(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player, enemyGroup } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 6000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const strikeCount = params.chainTargets ?? 3;
  const damage = params.damage ?? 15;
  const range = params.chainRange ?? 80;
  const px = player.x;
  const py = player.y;

  const candidates: Enemy[] = [];
  const children = enemyGroup.getChildren() as Enemy[];
  for (const enemy of children) {
    if (!enemy.active) continue;
    const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
    if (d <= range * 2) candidates.push(enemy);
  }
  if (candidates.length === 0) return;

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const targets = candidates.slice(0, strikeCount);

  for (let i = 0; i < targets.length; i++) {
    const enemy = targets[i];
    const delay = i * 100;
    scene.time.delayedCall(delay, () => {
      if (!enemy.active) return;
      enemy.takeDamage(damage, false);
      EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      drawLightningStrike(scene, helpers, enemy.x, enemy.y, damage);
    });
  }
}

function drawLightningStrike(scene: Phaser.Scene, helpers: SkillHelpers, x: number, y: number, power: number): void {
  const scale = 0.6 + power / 25;
  const boltHeight = 80 * scale;
  const topY = y - boltHeight;

  helpers.drawLightningBolt(x + (Math.random() - 0.5) * 10 * scale, topY, x, y, scale);

  if (power >= 22) {
    helpers.drawLightningBolt(x + (Math.random() - 0.5) * 16 * scale, topY - 10, x, y, scale * 0.6);
  }

  spawnFlash(scene, x, y, 8 * scale, 0xFFFF44, 250);
  spawnFlash(scene, x, y, 14 * scale, 0x4488FF, 250);

  helpers.drawPulse(x, y, 10 * scale, 0x4444FF, 0.6, 200);
}

// ═══════════════════════════════════════════════════════════════════════════
// DOTON (Ninja) - ground zone
// ═══════════════════════════════════════════════════════════════════════════

export function updateGroundZone(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
  groundZones: GroundZone[],
): void {
  const { scene, player, enemyGroup } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 8000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const radius = params.radius ?? 50;
  const damage = params.damage ?? 8;
  const duration = params.duration ?? 3000;
  const px = player.x;
  const py = player.y;

  let cx = px, cy = py;
  let nearestDist = Infinity;
  const children = enemyGroup.getChildren() as Enemy[];
  for (const enemy of children) {
    if (!enemy.active) continue;
    const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
    if (d < nearestDist && d <= radius * 3) { nearestDist = d; cx = enemy.x; cy = enemy.y; }
  }

  const groundSprite = scene.add.sprite(cx, cy, 'fx_circle_orange', 0);
  groundSprite.setDepth(DEPTHS.EFFECTS - 2);
  groundSprite.setTint(0x554422);
  groundSprite.setScale((radius * 2) / 32);
  groundSprite.setAlpha(0.5);

  groundZones.push({
    x: cx, y: cy, damage, slowPercent: 0.5,
    remaining: duration, tickTimer: 0, graphics: groundSprite,
  });

  helpers.drawExpandingRing(cx, cy, 5, radius, 0x8B4513, 400);
  helpers.drawImpactParticles(cx, cy, 0xAA6633, 8, 50, 300);
}

export function updateGroundZones(
  ctx: SkillContext,
  helpers: SkillHelpers,
  delta: number,
  groundZones: GroundZone[],
): void {
  const { scene, player } = ctx;

  for (let i = groundZones.length - 1; i >= 0; i--) {
    const zone = groundZones[i];
    zone.remaining -= delta;
    zone.tickTimer += delta;

    if (zone.remaining <= 0) {
      zone.graphics.destroy();
      groundZones.splice(i, 1);
      continue;
    }

    const alpha = Math.min(1, zone.remaining / 500) * 0.6;
    const skillLevels = player.playerState.jobSkillLevels;
    const level = skillLevels[MasterySkillId.DOTON] ?? 1;
    const def = MASTERY_SKILL_DEFS[MasterySkillId.DOTON];
    const zoneRadius = def?.levels[level - 1]?.params?.radius ?? 50;

    const time = scene.time.now;
    const pulse = 0.5 + 0.15 * Math.sin(time * 0.004);

    zone.graphics.setAlpha(alpha * pulse);
    zone.graphics.setScale((zoneRadius * 2) / 32);
    zone.graphics.setRotation(time * 0.001);

    if (Math.random() < 0.05) {
      const pAngle = Math.random() * Math.PI * 2;
      const dist = zoneRadius * (0.2 + Math.random() * 0.6);
      const px = zone.x + Math.cos(pAngle) * dist;
      const py = zone.y + Math.sin(pAngle) * dist;
      spawnFX(scene, px, py, 'fx_smoke_circular', {
        scale: 0.3, tint: 0xBB9955, alpha: alpha * 0.6,
        duration: 400, depth: DEPTHS.EFFECTS - 1,
      });
    }

    if (zone.tickTimer >= 500) {
      zone.tickTimer -= 500;
      const enemies = helpers.getEnemiesInRadius(zone.x, zone.y, zoneRadius);
      for (const enemy of enemies) {
        enemy.takeDamage(zone.damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, zone.damage);
        enemy.applySlow(zone.slowPercent, 600);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WAR CRY (Berserker)
// ═══════════════════════════════════════════════════════════════════════════

export function updateWarCry(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 10000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const radius = params.radius ?? 80;
  const stunDuration = params.stunDuration ?? 1000;
  const buffDamage = params.buffDamage ?? 0.20;
  const buffDuration = params.buffDuration ?? 5000;
  const px = player.x;
  const py = player.y;

  const enemies = helpers.getEnemiesInRadius(px, py, radius);
  for (const enemy of enemies) {
    enemy.applyStun(stunDuration);
  }

  player.playerState.modifiers.damageMultiplier += buffDamage;
  scene.time.delayedCall(buffDuration, () => {
    player.playerState.modifiers.damageMultiplier -= buffDamage;
  });

  helpers.drawExpandingRing(px, py, 10, radius, 0xDC143C, 500);
  helpers.drawExpandingRing(px, py, 5, radius * 0.7, 0xFF4444, 350);
  helpers.drawAdditiveGlow(px, py, radius * 0.5, 0xFF4400, 0.35, 400);
}

// ═══════════════════════════════════════════════════════════════════════════
// RAMPAGE (Berserker) - charge dash
// ═══════════════════════════════════════════════════════════════════════════

export function updateCharge(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
  chargeState: ChargeState,
  lockCooldown: number,
): void {
  const { player, enemyGroup } = ctx;

  if (chargeState.isCharging) return;
  if (lockCooldown > 0) return;

  const cooldown = Math.max(4000, helpers.getEffectiveCooldown(params.cooldown ?? 8000));
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const px = player.x;
  const py = player.y;
  let aimAngle = 0;
  let nearestDist = Infinity;
  const children = enemyGroup.getChildren() as Enemy[];
  for (const enemy of children) {
    if (!enemy.active) continue;
    const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
    if (d < nearestDist) { nearestDist = d; aimAngle = Math.atan2(enemy.y - py, enemy.x - px); }
  }

  chargeState.isCharging = true;
  chargeState.chargeTimer = 0;
  chargeState.chargeSkillId = skillId;
  chargeState.chargeParams = { ...params };
  chargeState.chargeAngle = aimAngle;
  chargeState.chargeHitEnemies.clear();
  player.playerState.isInvulnerable = true;
}

export function updateChargeInProgress(
  ctx: SkillContext,
  helpers: SkillHelpers,
  delta: number,
  chargeState: ChargeState,
): { lockCooldownSet: boolean } {
  const { player, enemyGroup } = ctx;

  chargeState.chargeTimer += delta;
  const progress = Math.min(chargeState.chargeTimer / chargeState.chargeDuration, 1);
  const range = chargeState.chargeParams.range ?? 120;
  const damage = chargeState.chargeParams.damage ?? 20;
  const speed = range / (chargeState.chargeDuration / 1000);

  const dx = Math.cos(chargeState.chargeAngle) * speed * (delta / 1000);
  const dy = Math.sin(chargeState.chargeAngle) * speed * (delta / 1000);
  player.x += dx;
  player.y += dy;

  const hitRadius = 20;
  const children = enemyGroup.getChildren() as Enemy[];
  for (const enemy of children) {
    if (!enemy.active || chargeState.chargeHitEnemies.has(enemy)) continue;
    const d = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
    if (d <= hitRadius) {
      enemy.takeDamage(damage, true);
      EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      chargeState.chargeHitEnemies.add(enemy);
    }
  }

  if (Math.random() < 0.5) {
    helpers.drawPulse(player.x, player.y, 8, 0xDC143C, 0.5, 200);
  }

  if (progress >= 1) {
    chargeState.isCharging = false;
    player.playerState.isInvulnerable = false;
    chargeState.chargeHitEnemies.clear();
    helpers.drawExpandingRing(player.x, player.y, 5, 30, 0xFF4444, 300);
    return { lockCooldownSet: true };
  }

  return { lockCooldownSet: false };
}

// ═══════════════════════════════════════════════════════════════════════════
// RAIN OF ARROWS (Ranger)
// ═══════════════════════════════════════════════════════════════════════════

export function updateArrowRain(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player, enemyGroup } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 7000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const radius = params.radius ?? 70;
  const impacts = params.count ?? 8;
  const damage = params.damage ?? 6;
  const px = player.x;
  const py = player.y;

  let cx = px, cy = py;
  let nearestDist = Infinity;
  const children = enemyGroup.getChildren() as Enemy[];
  for (const enemy of children) {
    if (!enemy.active) continue;
    const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
    if (d < nearestDist && d <= 300) { nearestDist = d; cx = enemy.x; cy = enemy.y; }
  }

  for (let i = 0; i < impacts; i++) {
    const delay = i * 80;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius;
    const impactX = cx + Math.cos(angle) * dist;
    const impactY = cy + Math.sin(angle) * dist;

    scene.time.delayedCall(delay, () => {
      const enemies = helpers.getEnemiesInRadius(impactX, impactY, 12);
      for (const enemy of enemies) {
        enemy.takeDamage(damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      }

      spawnLine(scene, impactX, impactY - 20, impactX, impactY, 0x228B22, 300, 0.8);
      spawnFlash(scene, impactX, impactY, 3, 0x44AA44, 300);
    });
  }

  helpers.drawPulse(cx, cy, radius, 0x228B22, 0.3, 600);
}

// ═══════════════════════════════════════════════════════════════════════════
// CRESCENDO / HADOUKEN - piercing projectile
// ═══════════════════════════════════════════════════════════════════════════

export function updatePiercingProjectile(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player, enemyGroup } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 6000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const damage = params.damage ?? 15;
  const speed = params.speed ?? 200;
  const px = player.x;
  const py = player.y;

  let aimAngle = 0;
  let nearestDist = Infinity;
  const children = enemyGroup.getChildren() as Enemy[];
  for (const enemy of children) {
    if (!enemy.active) continue;
    const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
    if (d < nearestDist) { nearestDist = d; aimAngle = Math.atan2(enemy.y - py, enemy.x - px); }
  }

  const isHadouken = skillId === JobSkillId.HADOUKEN;
  const color = isHadouken ? 0xFF8C00 : 0xDAA520;
  const projScale = 0.7 + damage / 25;
  const projSize = 10 * projScale;

  const projState = {
    x: px, y: py,
    vx: Math.cos(aimAngle) * speed,
    vy: Math.sin(aimAngle) * speed,
    alive: true,
    age: 0,
    hitEnemies: new Set<Enemy>(),
  };
  const maxLifetime = 2500;

  const projTexture = isHadouken ? 'energyball' : 'big_energyball';
  const projSprite = scene.add.sprite(px, py, projTexture, 0);
  projSprite.setDepth(DEPTHS.EFFECTS);
  projSprite.setScale(projScale * 0.8);
  projSprite.setTint(color);
  projSprite.setRotation(aimAngle);

  const trailSprite = scene.add.sprite(px, py, 'fx_circle_spark', 0);
  trailSprite.setBlendMode(Phaser.BlendModes.ADD);
  trailSprite.setDepth(DEPTHS.EFFECTS - 1);
  trailSprite.setTint(color);
  trailSprite.setScale(projScale * 0.5);
  trailSprite.setAlpha(0.3);

  const updateHandler = (_time: number, dt: number) => {
    if (!projState.alive) return;
    const dtSec = dt / 1000;
    projState.x += projState.vx * dtSec;
    projState.y += projState.vy * dtSec;
    projState.age += dt;

    if (projState.age >= maxLifetime) {
      projState.alive = false;
      scene.events.off('update', updateHandler);
      scene.tweens.add({
        targets: [projSprite, trailSprite], alpha: 0, duration: 200,
        onComplete: () => { projSprite.destroy(); trailSprite.destroy(); },
      });
      return;
    }

    projSprite.setPosition(projState.x, projState.y);

    trailSprite.setPosition(
      projState.x - projState.vx * dtSec * 3,
      projState.y - projState.vy * dtSec * 3,
    );

    if (Math.random() < 0.15) {
      spawnFX(scene, projState.x, projState.y, 'fx_smoke_circular', {
        scale: projScale * 0.3, tint: color, alpha: 0.25,
        duration: 150, depth: DEPTHS.EFFECTS - 1,
        blendMode: Phaser.BlendModes.ADD,
      });
    }

    const enemies = helpers.getEnemiesInRadius(projState.x, projState.y, projSize + 6);
    for (const enemy of enemies) {
      if (projState.hitEnemies.has(enemy)) continue;
      enemy.takeDamage(damage, false);
      EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      projState.hitEnemies.add(enemy);
      helpers.drawPulse(enemy.x, enemy.y, 12, color, 0.7, 200);
      helpers.drawImpactParticles(enemy.x, enemy.y, color, 4, 40, 200);
    }
  };

  scene.events.on('update', updateHandler);

  helpers.drawPulse(px, py, 14, color, 0.7, 250);
  helpers.drawAdditiveGlow(px, py, 16, color, 0.4, 250);
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAGON DIVE (Dragoon)
// ═══════════════════════════════════════════════════════════════════════════

export function updateDragonDive(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
  ddState: DragonDiveState,
  jumpState: JumpState,
  lockCooldown: number,
): void {
  const { scene, player } = ctx;

  if (ddState.isDragonDiving || ddState.isDragonDiveAiming || jumpState.isJumping) return;
  if (lockCooldown > 0) return;

  const cooldown = Math.max(4000, helpers.getEffectiveCooldown(params.cooldown ?? 10000));
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  ddState.isDragonDiveAiming = true;
  ddState.dragonDiveAimTimer = 0;
  ddState.dragonDiveSkillId = skillId;
  ddState.dragonDiveParams = { ...params };

  player.playerState.modifiers.speedMultiplier *= 0.6;

  if (!ddState.dragonDiveAimGfx) {
    ddState.dragonDiveAimGfx = scene.add.sprite(player.x, player.y, 'fx_circle_orange', 0);
    ddState.dragonDiveAimGfx.setTint(0xFF4400);
  }
  ddState.dragonDiveAimGfx.setDepth(DEPTHS.EFFECTS);
  ddState.dragonDiveAimGfx.setAlpha(1);
}

export function updateDragonDiveAim(
  ctx: SkillContext,
  helpers: SkillHelpers,
  delta: number,
  ddState: DragonDiveState,
): void {
  const { scene, player } = ctx;

  ddState.dragonDiveAimTimer += delta;
  const aimDuration = 600;
  const maxDiveDistance = 120 * SPRITE_SCALE;
  const indicatorDelay = 100;

  const distProgress = Math.min(ddState.dragonDiveAimTimer / aimDuration, 1);
  const easedProgress = distProgress * distProgress;
  const currentDistance = maxDiveDistance * (0.3 + 0.7 * easedProgress);

  const facing = player.getFacing();
  let dirX = 0, dirY = 0;
  switch (facing) {
    case 0: dirX = 0; dirY = 1; break;
    case 1: dirX = -1; dirY = 0; break;
    case 2: dirX = 1; dirY = 0; break;
    case 3: dirX = 0; dirY = -1; break;
  }

  const targetX = player.x + dirX * currentDistance;
  const targetY = player.y + dirY * currentDistance;

  const cam = scene.cameras.main;
  const worldW = cam.getBounds().width || 3000;
  const worldH = cam.getBounds().height || 3000;
  ddState.dragonDiveTargetX = Phaser.Math.Clamp(targetX, 20, worldW - 20);
  ddState.dragonDiveTargetY = Phaser.Math.Clamp(targetY, 20, worldH - 20);

  if (ddState.dragonDiveAimGfx && ddState.dragonDiveAimTimer >= indicatorDelay) {
    const px = player.x;
    const py = player.y;
    const tx = ddState.dragonDiveTargetX;
    const ty = ddState.dragonDiveTargetY;
    const pulseAlpha = 0.5 + Math.sin(ddState.dragonDiveAimTimer * 0.012) * 0.3;
    const fadeIn = Math.min((ddState.dragonDiveAimTimer - indicatorDelay) / 150, 1);
    const alpha = pulseAlpha * fadeIn;

    const landingRadius = 20 * SPRITE_SCALE;
    const ringPulse = 1 + Math.sin(ddState.dragonDiveAimTimer * 0.01) * 0.15;
    ddState.dragonDiveAimGfx.setPosition(tx, ty);
    ddState.dragonDiveAimGfx.setScale((landingRadius * 2 * ringPulse) / 32);
    ddState.dragonDiveAimGfx.setAlpha(alpha * 0.4);

    if (Math.random() < 0.3) {
      const t = Math.random();
      const trailX = px + (tx - px) * t + (Math.random() - 0.5) * 6 * SPRITE_SCALE;
      const trailY = py + (ty - py) * t + (Math.random() - 0.5) * 6 * SPRITE_SCALE;
      spawnFX(scene, trailX, trailY, 'fx_flame', {
        scale: 0.4 + Math.random() * 0.3,
        tint: 0xFF6600, alpha: alpha * 0.5, duration: 150, depth: DEPTHS.EFFECTS,
      });
    }

    if (Math.random() < 0.2) {
      spawnLine(scene, px, py, tx, ty, 0xFF4400, 100, alpha * 0.3);
    }
  }

  if (ddState.dragonDiveAimTimer >= aimDuration) {
    ddState.isDragonDiveAiming = false;

    player.playerState.modifiers.speedMultiplier /= 0.6;

    if (ddState.dragonDiveAimGfx) {
      ddState.dragonDiveAimGfx.setAlpha(0);
    }

    ddState.isDragonDiving = true;
    ddState.dragonDiveTimer = 0;
    ddState.dragonDiveOriginX = player.x;
    ddState.dragonDiveOriginY = player.y;
    player.playerState.isInvulnerable = true;

    if (player.body) {
      (player.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    if (!ddState.dragonDiveShadowGfx) {
      ddState.dragonDiveShadowGfx = scene.add.sprite(player.x, player.y, 'fx_circle_orange', 0);
      ddState.dragonDiveShadowGfx.setTint(0x000000);
    }
    ddState.dragonDiveShadowGfx.setDepth(DEPTHS.GROUND + 1);
    ddState.dragonDiveShadowGfx.setAlpha(1);
  }
}

export function updateDragonDiveInProgress(
  ctx: SkillContext,
  helpers: SkillHelpers,
  delta: number,
  ddState: DragonDiveState,
): { lockCooldownSet: boolean } {
  const { scene, player } = ctx;

  ddState.dragonDiveTimer += delta;
  const totalDuration = ddState.dragonDiveDuration;
  const progress = Math.min(ddState.dragonDiveTimer / totalDuration, 1);

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

  const travelProgress = Math.min(progress / 0.95, 1);

  const maxHeight = 100;
  const yOffset = -heightFactor * maxHeight;

  const groundX = Phaser.Math.Linear(ddState.dragonDiveOriginX, ddState.dragonDiveTargetX, travelProgress);
  const groundY = Phaser.Math.Linear(ddState.dragonDiveOriginY, ddState.dragonDiveTargetY, travelProgress);
  player.x = groundX;
  player.y = groundY + yOffset;

  const scale = SPRITE_SCALE * (1 + heightFactor * 0.5);
  player.setScale(scale);

  if (progress > hoverEnd) {
    const descendProgress = (progress - hoverEnd) / (1 - hoverEnd);
    player.setAngle(descendProgress * 720);
    player.setTint(0xFF4400);
  } else {
    player.setAngle(0);
    player.clearTint();
  }

  if (ddState.dragonDiveShadowGfx) {
    const shadowX = Phaser.Math.Linear(ddState.dragonDiveOriginX, ddState.dragonDiveTargetX, travelProgress);
    const shadowY = Phaser.Math.Linear(ddState.dragonDiveOriginY, ddState.dragonDiveTargetY, travelProgress);
    const shadowScale = 1 - heightFactor * 0.5;
    const shadowAlpha = 0.4 * (1 - heightFactor * 0.3);
    ddState.dragonDiveShadowGfx.setPosition(shadowX, shadowY + 2);
    ddState.dragonDiveShadowGfx.setScale(
      (14 * shadowScale) / 16,
      (5 * shadowScale) / 16,
    );
    ddState.dragonDiveShadowGfx.setAlpha(shadowAlpha);
  }

  if (progress >= 1) {
    ddState.isDragonDiving = false;
    ddState.dragonDiveTimer = 0;

    player.setScale(SPRITE_SCALE);
    player.setAngle(0);
    player.clearTint();
    player.x = ddState.dragonDiveTargetX;
    player.y = ddState.dragonDiveTargetY;
    player.playerState.isInvulnerable = false;

    if (player.body) {
      (player.body as Phaser.Physics.Arcade.Body).enable = true;
    }

    if (ddState.dragonDiveShadowGfx) {
      ddState.dragonDiveShadowGfx.setAlpha(0);
    }

    const radius = ddState.dragonDiveParams.radius ?? 70;
    const damage = ddState.dragonDiveParams.damage ?? 20;
    const flameDamage = ddState.dragonDiveParams.flameDamage ?? 4;
    const flameDuration = ddState.dragonDiveParams.flameDuration ?? 2000;
    const lx = ddState.dragonDiveTargetX;
    const ly = ddState.dragonDiveTargetY;

    const enemies = helpers.getEnemiesInRadius(lx, ly, radius);
    for (const enemy of enemies) {
      enemy.takeDamage(damage, true);
      EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      if (flameDamage > 0) {
        enemy.applyBurn(flameDamage, flameDuration);
      }
    }

    helpers.drawExpandingRing(lx, ly, 10, radius, 0xFF4400, 500);
    helpers.drawExpandingRing(lx, ly, 5, radius * 0.7, 0xFF8800, 350);
    helpers.drawPulse(lx, ly, radius, 0xFF6600, 0.8, 400);
    helpers.drawAdditiveGlow(lx, ly, radius, 0xFF4400, 0.5, 500);
    helpers.drawImpactParticles(lx, ly, 0xFF4400, 12, 80, 400);

    // Screen flash
    const cam = scene.cameras.main;
    const flashSprite = scene.add.sprite(
      cam.scrollX + cam.width / 2,
      cam.scrollY + cam.height / 2,
      'fx_circle_white', 0,
    );
    flashSprite.setDepth(DEPTHS.UI - 1);
    flashSprite.setScale(Math.max(cam.width, cam.height) / 16);
    flashSprite.setAlpha(0.4);
    flashSprite.setTint(0xFFFFFF);
    scene.tweens.add({
      targets: flashSprite, alpha: 0, duration: 150,
      onComplete: () => flashSprite.destroy(),
    });

    // Leave flame zone on ground
    const flameR = radius * 0.8;
    const flameSprite = scene.add.sprite(lx, ly, 'fx_circle_orange', 0);
    flameSprite.setDepth(DEPTHS.EFFECTS - 2);
    flameSprite.setTint(0xFF4400);
    flameSprite.setScale((flameR * 2) / 32);
    flameSprite.setAlpha(0.35);
    const flameInnerSprite = scene.add.sprite(lx, ly, 'fx_circle_spark', 0);
    flameInnerSprite.setDepth(DEPTHS.EFFECTS - 2);
    flameInnerSprite.setTint(0xFF8800);
    flameInnerSprite.setScale((flameR * 0.5 * 2) / 32);
    flameInnerSprite.setAlpha(0.35 * 0.6);
    scene.tweens.add({
      targets: [flameSprite, flameInnerSprite], alpha: 0, duration: flameDuration,
      ease: 'Linear',
      onComplete: () => { flameSprite.destroy(); flameInnerSprite.destroy(); },
    });

    return { lockCooldownSet: true };
  }

  return { lockCooldownSet: false };
}

// ═══════════════════════════════════════════════════════════════════════════
// BLADE STORM (Samurai)
// ═══════════════════════════════════════════════════════════════════════════

export function updateBladeStorm(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
  bsState: BladeStormState,
  lockCooldown: number,
): void {
  const { scene, player } = ctx;

  if (bsState.bladeStormActive) return;
  if (lockCooldown > 0) return;

  const cooldown = Math.max(4000, helpers.getEffectiveCooldown(params.cooldown ?? 7000));
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  bsState.bladeStormActive = true;
  bsState.bladeStormTimer = 0;
  bsState.bladeStormSkillId = skillId;
  bsState.bladeStormParams = { ...params };
  bsState.bladeStormHitTimer = 0;

  if (!bsState.bladeStormGfx) {
    bsState.bladeStormGfx = scene.add.sprite(player.x, player.y, 'fx_circular_slash', 0);
    bsState.bladeStormGfx.setDepth(DEPTHS.EFFECTS);
    bsState.bladeStormGfx.setTint(0xFF4444);
  }
}

export function updateBladeStormInProgress(
  ctx: SkillContext,
  helpers: SkillHelpers,
  delta: number,
  bsState: BladeStormState,
): { lockCooldownSet: boolean } {
  const { scene, player } = ctx;

  bsState.bladeStormTimer += delta;
  const duration = bsState.bladeStormParams.duration ?? 1500;
  const radius = bsState.bladeStormParams.radius ?? 50;
  const damage = bsState.bladeStormParams.damage ?? 12;
  const slashCount = bsState.bladeStormParams.slashCount ?? 4;

  if (bsState.bladeStormTimer >= duration) {
    bsState.bladeStormActive = false;
    if (bsState.bladeStormGfx) {
      bsState.bladeStormGfx.setAlpha(0);
    }
    return { lockCooldownSet: true };
  }

  const progress = bsState.bladeStormTimer / duration;
  const rotSpeed = Math.PI * 6;
  const currentAngle = progress * rotSpeed;
  const fadeAlpha = progress > 0.7 ? (1 - progress) / 0.3 : 1;

  if (bsState.bladeStormGfx) {
    const px = player.x;
    const py = player.y;

    bsState.bladeStormGfx.setPosition(px, py);
    bsState.bladeStormGfx.setRotation(currentAngle);
    bsState.bladeStormGfx.setScale((radius * 2) / 32);
    bsState.bladeStormGfx.setAlpha(fadeAlpha * 0.8);

    if (Math.random() < 0.3) {
      for (let i = 0; i < slashCount; i++) {
        const slashAngle = currentAngle + (Math.PI * 2 / slashCount) * i;
        const sx = px + Math.cos(slashAngle) * radius;
        const sy = py + Math.sin(slashAngle) * radius;
        spawnFX(scene, sx, sy, 'fx_spark', {
          scale: 0.3, tint: 0xFFAAAA, alpha: fadeAlpha * 0.6,
          duration: 100, depth: DEPTHS.EFFECTS,
        });
      }
    }
  }

  bsState.bladeStormHitTimer += delta;
  const hitInterval = duration / (slashCount * 2);
  if (bsState.bladeStormHitTimer >= hitInterval) {
    bsState.bladeStormHitTimer -= hitInterval;
    const enemies = helpers.getEnemiesInRadius(player.x, player.y, radius);
    for (const enemy of enemies) {
      enemy.takeDamage(damage, false);
      EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
    }
  }

  return { lockCooldownSet: false };
}

// ═══════════════════════════════════════════════════════════════════════════
// DUAL STRIKE (Ninja)
// ═══════════════════════════════════════════════════════════════════════════

export function updateDualStrike(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player, enemyGroup } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 4000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const radius = params.radius ?? 40;
  const damage = params.damage ?? 8;
  const hitCount = params.hitCount ?? 2;
  const px = player.x;
  const py = player.y;

  let target: Enemy | null = null;
  let nearestDist = Infinity;
  const children = enemyGroup.getChildren() as Enemy[];
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

    scene.time.delayedCall(delay, () => {
      const enemies = helpers.getEnemiesInRadius(px, py, radius);
      for (const enemy of enemies) {
        enemy.takeDamage(damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      }

      spawnFX(scene,
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
