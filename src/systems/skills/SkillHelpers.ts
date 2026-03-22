import Phaser from 'phaser';
import { DEPTHS } from '../../constants';
import { Enemy } from '../../entities/Enemy';
import { spawnLine, spawnFlash } from '../../weapons/fxHelper';
import { SkillContext, SkillHelpers } from './SkillTypes';

/**
 * Creates a SkillHelpers instance bound to the given context and timer maps.
 * This provides all shared utility methods that skill handlers need.
 */
export function createSkillHelpers(
  ctx: SkillContext,
  skillTimers: Map<string, number>,
): SkillHelpers {
  const { scene, player, enemyGroup } = ctx;

  // ---- Timer helpers ----

  function getTimer(skillId: string): number {
    if (!skillTimers.has(skillId)) {
      skillTimers.set(skillId, 0);
    }
    return skillTimers.get(skillId)!;
  }

  function setTimer(skillId: string, value: number): void {
    skillTimers.set(skillId, value);
  }

  function addTimer(skillId: string, delta: number): number {
    const t = getTimer(skillId) + delta;
    skillTimers.set(skillId, t);
    return t;
  }

  // ---- Cooldown helper ----

  function getEffectiveCooldown(baseCooldown: number): number {
    const cdMult = player.getEffectiveCooldownMultiplier();
    return Math.max(100, baseCooldown * cdMult);
  }

  // ---- Enemy query ----

  function getEnemiesInRadius(cx: number, cy: number, radius: number): Enemy[] {
    const result: Enemy[] = [];
    const children = enemyGroup.getChildren() as Enemy[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(cx, cy, enemy.x, enemy.y);
      if (dist <= radius) {
        result.push(enemy);
      }
    }
    return result;
  }

  // ---- Geometry helper ----

  function pointToSegmentDist(
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

  // ---- FX drawing helpers ----

  function drawPulse(x: number, y: number, radius: number, color: number, alpha = 0.6, duration = 300): void {
    const textureKey = scene.textures.exists('fx_circle_orange') ? 'fx_circle_orange' : null;
    if (!textureKey) return;
    const sprite = scene.add.sprite(x, y, textureKey, 0);
    sprite.setDepth(DEPTHS.EFFECTS);
    sprite.setTint(color);
    sprite.setAlpha(alpha);
    sprite.setScale(radius / 16);
    scene.tweens.add({
      targets: sprite,
      alpha: 0,
      scaleX: (radius * 1.3) / 16,
      scaleY: (radius * 1.3) / 16,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => sprite.destroy(),
    });
  }

  function drawExpandingRing(
    x: number, y: number, startRadius: number, endRadius: number,
    color: number, duration = 400,
  ): void {
    const textureKey = scene.textures.exists('fx_circle_spark') ? 'fx_circle_spark' : 'fx_circle_orange';
    if (!scene.textures.exists(textureKey)) return;
    const sprite = scene.add.sprite(x, y, textureKey, 0);
    sprite.setDepth(DEPTHS.EFFECTS);
    sprite.setTint(color);
    sprite.setAlpha(0.8);
    sprite.setScale(startRadius / 16);
    scene.tweens.add({
      targets: sprite,
      alpha: 0,
      scaleX: endRadius / 16,
      scaleY: endRadius / 16,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => sprite.destroy(),
    });
  }

  function drawImpactParticles(
    x: number, y: number, color: number, count = 6, speed = 50, duration = 300,
  ): void {
    const textureKey = scene.textures.exists('fx_spark') ? 'fx_spark' : null;
    if (!textureKey) return;
    for (let i = 0; i < Math.min(count, 8); i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const spd = speed * (0.6 + Math.random() * 0.8);
      const spark = scene.add.sprite(x, y, textureKey, Math.floor(Math.random() * 4));
      spark.setDepth(DEPTHS.EFFECTS + 1);
      spark.setTint(color);
      spark.setAlpha(0.8);
      spark.setScale(0.5);
      scene.tweens.add({
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

  function drawAdditiveGlow(
    x: number, y: number, radius: number, color: number, alpha = 0.35, duration = 400,
  ): void {
    const textureKey = scene.textures.exists('fx_circle_spark') ? 'fx_circle_spark' : 'fx_circle_orange';
    if (!scene.textures.exists(textureKey)) return;
    const sprite = scene.add.sprite(x, y, textureKey, 0);
    sprite.setBlendMode(Phaser.BlendModes.ADD);
    sprite.setDepth(DEPTHS.EFFECTS - 1);
    sprite.setTint(color);
    sprite.setAlpha(alpha);
    sprite.setScale(radius / 16);
    scene.tweens.add({
      targets: sprite,
      alpha: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => sprite.destroy(),
    });
  }

  function drawLightningBolt(x1: number, y1: number, x2: number, y2: number, scale = 1): void {
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

    for (let i = 0; i < points.length - 1; i++) {
      spawnLine(scene, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 0xFFFF44, 200, 0.9);
      spawnLine(scene, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 0x4444FF, 250, 0.3);
    }

    for (const pt of points) {
      spawnFlash(scene, pt.x, pt.y, 6, 0x4488FF, 250);
    }
  }

  return {
    getTimer,
    setTimer,
    addTimer,
    getEffectiveCooldown,
    getEnemiesInRadius,
    pointToSegmentDist,
    drawPulse,
    drawExpandingRing,
    drawImpactParticles,
    drawAdditiveGlow,
    drawLightningBolt,
  };
}
