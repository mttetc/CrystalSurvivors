import Phaser from 'phaser';
import { EVENTS, DEPTHS, JobSkillId } from '../../constants';
import { Enemy } from '../../entities/Enemy';
import { EventBus } from '../EventBus';
import { spawnLine } from '../../weapons/fxHelper';
import { SkillContext, SkillHelpers } from './SkillTypes';

/**
 * Updates laser beam skills (BAHAMUT, ALEXANDER).
 */
export function updateLaser(
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

  const beamWidth = params.beamWidth ?? 30;
  const beamLength = params.beamLength ?? 400;
  const damage = params.damage ?? 20;
  const px = player.x;
  const py = player.y;

  // Determine direction: toward densest enemy cluster
  let bestAngle = Math.random() * Math.PI * 2;
  let bestCount = 0;
  const children = enemyGroup.getChildren() as Enemy[];

  // Sample 8 directions, pick the one with most enemies
  for (let i = 0; i < 8; i++) {
    const testAngle = (i / 8) * Math.PI * 2;
    let count = 0;
    for (const e of children) {
      if (!e.active) continue;
      const ex = e.x - px;
      const ey = e.y - py;
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

  // Visual: beam using sprite-based lines
  spawnLine(scene, px, py, endX, endY, edgeColor, 700, 0.4);
  spawnLine(scene, px, py, endX, endY, coreColor, 700, 0.9);
  spawnLine(scene, px, py, endX, endY, 0xFFFFFF, 500, 0.8);

  // Impact particles along beam
  for (let d = 30; d < beamLength; d += 50) {
    const ix = px + cosA * d;
    const iy = py + sinA * d;
    helpers.drawImpactParticles(ix, iy, particleColor, 3, 20, 300);
  }

  // Additive glow at origin
  helpers.drawAdditiveGlow(px, py, 40, coreColor, 0.5, 300);

  // Dragon silhouette for Bahamut
  if (skillId === JobSkillId.BAHAMUT && scene.textures.exists('fx_spirit')) {
    const dragon = scene.add.sprite(px, py, 'fx_spirit', 0);
    dragon.setDepth(DEPTHS.EFFECTS + 3);
    dragon.setScale(2);
    dragon.setTint(0x4488FF);
    dragon.setAlpha(0.8);
    dragon.setRotation(bestAngle);
    scene.tweens.add({
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
