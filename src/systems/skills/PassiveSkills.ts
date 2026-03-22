import Phaser from 'phaser';
import { EVENTS, DEPTHS, JobSkillId } from '../../constants';
import { Enemy } from '../../entities/Enemy';
import { EventBus } from '../EventBus';
import { spawnLine, spawnCircleZone, spawnRing, spawnParticleBurst } from '../../weapons/fxHelper';
import { SkillContext, SkillHelpers } from './SkillTypes';
import { JOB_SKILL_DEFS } from '../../data/jobs';

// ---- Trail config ----

const TRAIL_ZONE_RADIUS = 8;
const TRAIL_TICK_INTERVAL = 500;

// ---- Trail zone type ----

export interface TrailZone {
  x: number; y: number; damage: number; remaining: number;
  tickTimer: number; graphics: Phaser.GameObjects.Sprite;
}

/**
 * Updates trail skills (PITFALL).
 */
export function updateTrail(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
  trailZones: TrailZone[],
): void {
  const { scene, player } = ctx;

  const damage = params.damage ?? 2;
  const duration = params.duration ?? 2000;
  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 500);

  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const trailSprite = scene.add.sprite(player.x, player.y, 'fx_circle_orange', 0);
  trailSprite.setDepth(DEPTHS.EFFECTS - 2);
  trailSprite.setTint(0x8B4513);
  trailSprite.setAlpha(0.35);
  trailSprite.setScale((TRAIL_ZONE_RADIUS * 2) / 32);

  trailZones.push({
    x: player.x,
    y: player.y,
    damage,
    remaining: duration,
    tickTimer: 0,
    graphics: trailSprite,
  });
}

/**
 * Updates all active trail zones (tick damage + cleanup).
 */
export function updateTrailZones(
  helpers: SkillHelpers,
  delta: number,
  trailZones: TrailZone[],
): void {
  for (let i = trailZones.length - 1; i >= 0; i--) {
    const zone = trailZones[i];
    zone.remaining -= delta;
    zone.tickTimer += delta;

    if (zone.remaining <= 0) {
      zone.graphics.destroy();
      trailZones.splice(i, 1);
      continue;
    }

    const alpha = Math.min(1, zone.remaining / 500);
    zone.graphics.setAlpha(alpha);

    if (zone.tickTimer >= TRAIL_TICK_INTERVAL) {
      zone.tickTimer -= TRAIL_TICK_INTERVAL;
      const enemies = helpers.getEnemiesInRadius(zone.x, zone.y, TRAIL_ZONE_RADIUS);
      for (const enemy of enemies) {
        enemy.takeDamage(zone.damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, zone.damage);
      }
    }
  }
}

/**
 * Updates elixir/heal skills (ELIXIR, CLEMENCY, BENEDICTION, MEGA_POTION).
 */
export function updateElixir(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { player } = ctx;

  const healPercent = params.healPercent ?? 0.30;
  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 60000);

  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const maxHP = player.getEffectiveMaxHP();
  const currentHP = player.playerState.stats.currentHP;
  if (currentHP >= maxHP) {
    helpers.setTimer(skillId, cooldown - 500);
    return;
  }

  const healAmount = Math.floor(maxHP * healPercent);
  player.heal(healAmount);

  helpers.drawExpandingRing(player.x, player.y, 5, 25, 0x32CD32, 400);
  helpers.drawPulse(player.x, player.y, 20, 0x44FF44, 0.7, 300);
}

/**
 * Updates zantetsuken / hissatsu line slash skills.
 */
export function updateZantetsuken(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player, enemyGroup } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 10000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const range = params.range ?? 120;
  const damage = params.damage ?? 20;
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

  const slashWidth = 16;
  const endX = px + Math.cos(aimAngle) * range;
  const endY = py + Math.sin(aimAngle) * range;

  for (const enemy of children) {
    if (!enemy.active) continue;
    const dist = helpers.pointToSegmentDist(enemy.x, enemy.y, px, py, endX, endY);
    if (dist <= slashWidth) {
      enemy.takeDamage(damage, true);
      EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
    }
  }

  spawnLine(scene, px, py, endX, endY, 0xB22222, 250, 0.9);
  spawnLine(scene, px, py, endX, endY, 0xFF4444, 250, 0.4);
}

/**
 * Updates orbital shield skills (SACRED_ORBIT).
 */
export function updateOrbital(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
  orbitalImages: Map<string, Phaser.GameObjects.Image[]>,
  orbitalAngles: Map<string, number[]>,
  orbitalHitTimers: Map<string, number[]>,
  orbitalLastCount: Map<string, number>,
): void {
  const { scene, player } = ctx;

  const count = params.count ?? 2;
  const damage = params.damage ?? 10;
  const hitInterval = params.hitInterval ?? 300;
  const orbitRadius = params.orbitRadius ?? 30;
  const orbitSpeed = 2;

  const prevCount = orbitalLastCount.get(skillId) ?? 0;
  if (prevCount !== count) {
    destroyOrbitalShields(skillId, orbitalImages, orbitalAngles, orbitalHitTimers);
    orbitalLastCount.set(skillId, count);

    const images: Phaser.GameObjects.Image[] = [];
    const angles: number[] = [];
    const timers: number[] = [];
    for (let i = 0; i < count; i++) {
      const img = scene.add.sprite(player.x, player.y, 'fx_shield_yellow', 0);
      img.setScale(1.5);
      img.setDepth(DEPTHS.EFFECTS);
      images.push(img);
      angles.push((Math.PI * 2 / count) * i);
      timers.push(0);
    }
    orbitalImages.set(skillId, images);
    orbitalAngles.set(skillId, angles);
    orbitalHitTimers.set(skillId, timers);
  }

  const images = orbitalImages.get(skillId);
  const angles = orbitalAngles.get(skillId);
  const timers = orbitalHitTimers.get(skillId);
  if (!images || !angles || !timers) return;

  const deltaSec = delta / 1000;

  for (let i = 0; i < images.length; i++) {
    angles[i] = (angles[i] + orbitSpeed * deltaSec) % (Math.PI * 2);

    const sx = player.x + Math.cos(angles[i]) * orbitRadius;
    const sy = player.y + Math.sin(angles[i]) * orbitRadius;
    images[i].setPosition(sx, sy);
    images[i].setRotation(angles[i] + Math.PI / 2);

    timers[i] += delta;
    if (timers[i] >= hitInterval) {
      timers[i] -= hitInterval;

      const enemies = helpers.getEnemiesInRadius(sx, sy, 14);
      for (const enemy of enemies) {
        enemy.takeDamage(damage, false);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
      }

      if (enemies.length > 0) {
        helpers.drawPulse(sx, sy, 10, 0xFFD700, 0.5, 200);
      }
    }
  }
}

export function destroyOrbitalShields(
  skillId: string,
  orbitalImages: Map<string, Phaser.GameObjects.Image[]>,
  orbitalAngles: Map<string, number[]>,
  orbitalHitTimers: Map<string, number[]>,
): void {
  const images = orbitalImages.get(skillId);
  if (images) {
    for (const img of images) {
      img.destroy();
    }
  }
  orbitalImages.delete(skillId);
  orbitalAngles.delete(skillId);
  orbitalHitTimers.delete(skillId);
}

/**
 * Handles DARKNESS (Dark Knight) - triggered on player damage taken.
 */
export function handleDarkness(
  ctx: SkillContext,
  helpers: SkillHelpers,
): void {
  const { player } = ctx;

  const skillLevels = player.playerState.jobSkillLevels;
  const level = skillLevels[JobSkillId.DARKNESS] ?? 0;
  if (level <= 0) return;

  const def = JOB_SKILL_DEFS[JobSkillId.DARKNESS];
  const params = def.levels[level - 1]?.params;
  if (!params) return;

  const radius = params.radius ?? 40;
  const damage = params.damage ?? 10;
  const hpCost = params.hpCost ?? 3;

  if (player.playerState.stats.currentHP <= hpCost) return;

  player.playerState.stats.currentHP -= hpCost;
  EventBus.emit(
    EVENTS.PLAYER_HEALTH_CHANGED,
    player.playerState.stats.currentHP,
    player.getEffectiveMaxHP(),
  );

  const enemies = helpers.getEnemiesInRadius(player.x, player.y, radius);
  for (const enemy of enemies) {
    enemy.takeDamage(damage, false);
    EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
  }

  helpers.drawExpandingRing(player.x, player.y, 5, radius, 0x8B0000, 350);
  helpers.drawPulse(player.x, player.y, radius, 0x440044, 0.7, 300);
}

/**
 * Handles THUNDER (Black Mage) - triggered on critical hits.
 */
export function handleThunder(
  ctx: SkillContext,
  helpers: SkillHelpers,
  sourceEnemy: Enemy,
): void {
  const { player, enemyGroup } = ctx;

  const skillLevels = player.playerState.jobSkillLevels;
  const level = skillLevels[JobSkillId.THUNDER] ?? 0;
  if (level <= 0) return;

  const def = JOB_SKILL_DEFS[JobSkillId.THUNDER];
  const params = def.levels[level - 1]?.params;
  if (!params) return;

  const chainTargets = params.chainTargets ?? 3;
  const chainDamage = 8;
  const chainRange = 80;

  const hitSet = new Set<Enemy>();
  hitSet.add(sourceEnemy);
  let current = sourceEnemy;
  const chainOrder: Enemy[] = [sourceEnemy];

  for (let i = 1; i < chainTargets; i++) {
    let nearest: Enemy | null = null;
    let nearestDist = Infinity;

    const children = enemyGroup.getChildren() as Enemy[];
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

  for (let i = 0; i < chainOrder.length - 1; i++) {
    const from = chainOrder[i];
    const to = chainOrder[i + 1];
    helpers.drawLightningBolt(from.x, from.y, to.x, to.y, 1);
  }
}

/**
 * Updates Smoke Bomb skill (Ninja).
 */
export function updateSmokeBomb(
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

  const radius = params.radius ?? 50;
  const invulnDuration = params.invulnDuration ?? 1500;

  player.playerState.isInvulnerable = true;
  scene.time.delayedCall(invulnDuration, () => {
    player.playerState.isInvulnerable = false;
  });

  const enemies = helpers.getEnemiesInRadius(player.x, player.y, radius);
  for (const enemy of enemies) {
    enemy.applyStun(params.blindDuration ?? 2000);
  }

  spawnCircleZone(scene, player.x, player.y, radius, 0x333344, 0.6, invulnDuration, DEPTHS.EFFECTS);
  spawnParticleBurst(scene, player.x, player.y, 6, 0x555566, 30, invulnDuration * 0.5);
}

/**
 * Updates Hallowed Ground skill (Paladin mastery).
 */
export function updateHallowedGround(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 20000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const duration = params.duration ?? 2000;

  player.playerState.isInvulnerable = true;
  scene.time.delayedCall(duration, () => {
    player.playerState.isInvulnerable = false;
  });

  const radius = params.radius ?? 60;
  spawnCircleZone(scene, player.x, player.y, radius, 0xFFDD44, 0.3, duration, DEPTHS.EFFECTS - 1);
  spawnRing(scene, player.x, player.y, radius, radius * 1.1, 0xFFDD44, duration, 0.8);
}

/**
 * Updates Time Stop skill (Time Mage mastery).
 */
export function updateTimeStop(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { player, enemyGroup } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 20000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const duration = params.duration ?? 2000;
  const enemies = enemyGroup.getChildren() as Enemy[];
  for (const enemy of enemies) {
    if (!enemy.active) continue;
    enemy.applyStun(duration);
  }

  helpers.drawPulse(player.x, player.y, 500, 0x9370DB, 0.3, duration);
}

/**
 * Updates Freeze skill (Black Mage mastery).
 */
export function updateFreeze(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 12000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const radius = params.radius ?? 60;
  const freezeDuration = params.freezeDuration ?? 1500;
  const enemies = helpers.getEnemiesInRadius(player.x, player.y, radius);
  for (const enemy of enemies) {
    enemy.applyStun(freezeDuration);
  }

  spawnCircleZone(scene, player.x, player.y, radius, 0x88CCFF, 0.4, freezeDuration, DEPTHS.EFFECTS - 1);
}

/**
 * Updates Asylum skill (White Mage mastery).
 */
export function updateAsylum(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 15000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const radius = params.radius ?? 60;
  const healPerTick = params.healPerTick ?? 3;
  const duration = params.duration ?? 5000;
  const tickInterval = 1000;
  const px = player.x;
  const py = player.y;

  spawnCircleZone(scene, px, py, radius, 0x44FF88, 0.25, duration, DEPTHS.EFFECTS - 1);
  spawnRing(scene, px, py, radius, radius * 1.05, 0x44FF88, duration, 0.6);

  let ticksRemaining = Math.floor(duration / tickInterval);
  scene.time.addEvent({
    delay: tickInterval,
    repeat: ticksRemaining - 1,
    callback: () => {
      const dist = Phaser.Math.Distance.Between(px, py, player.x, player.y);
      if (dist <= radius) {
        player.heal(healPerTick);
      }
    },
  });
}
