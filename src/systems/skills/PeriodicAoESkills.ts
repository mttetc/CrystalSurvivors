import Phaser from 'phaser';
import { EVENTS, JobSkillId, MasterySkillId, SPRITE_SCALE } from '../../constants';
import { EventBus } from '../EventBus';
import { spawnFX, playImpactFX, playSlashFX } from '../../weapons/fxHelper';
import { SkillContext, SkillHelpers } from './SkillTypes';

/**
 * Updates periodic AoE skills (CHI_BURST, HOLY, METEOR, GUST, QUAKE,
 * RAMUH, TITAN, LEVIATHAN, ODIN, DIABOLOS, KNIGHTS_OF_THE_ROUND,
 * and mastery AoE skills).
 */
export function updatePeriodicAoE(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
): void {
  const { scene, player } = ctx;

  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 5000);
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  const radius = params.radius ?? 50;
  const damage = params.damage ?? 0;
  const stunDuration = params.stunDuration ?? 0;
  const px = player.x;
  const py = player.y;

  // Determine center and color per skill
  let cx = px;
  let cy = py;
  let color = 0xFFFFFF;

  switch (skillId) {
    case JobSkillId.CHI_BURST:
      color = 0xFF8C00;
      spawnFX(scene, cx, cy, 'fx_explosion', {
        scale: (radius * 2) / 40,
        tint: 0xFF8C00,
        alpha: 0.85,
        duration: 400,
        scaleEnd: (radius * 2.5) / 40,
      });
      spawnFX(scene, cx, cy, 'fx_explosion', {
        scale: (radius * 1.2) / 40,
        tint: 0xFFCC44,
        alpha: 0.6,
        duration: 300,
        blendMode: Phaser.BlendModes.ADD,
        scaleEnd: (radius * 0.5) / 40,
      });
      helpers.drawImpactParticles(cx, cy, 0xFFAA00, 8, 60, 300);
      break;

    case JobSkillId.HOLY:
      color = 0xFFFFCC;
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0xFFFFCC, 400);
      spawnFX(scene, cx, cy, 'fx_circle_white', { scale: (radius * 2) / 32, tint: 0xFFFFFF, alpha: 0.6, duration: 300, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 2.5) / 32 });
      helpers.drawImpactParticles(cx, cy, 0xFFFF88, 10, 70, 350);
      break;

    case JobSkillId.METEOR: {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 120 + 30;
      cx = px + Math.cos(angle) * dist;
      cy = py + Math.sin(angle) * dist;
      color = 0xFF3300;
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0xFF3300, 400);
      spawnFX(scene, cx, cy, 'fx_flame', { scale: (radius * 1.5) / 40, tint: 0xFF6600, alpha: 0.8, duration: 350, scaleEnd: (radius * 0.5) / 40 });
      helpers.drawImpactParticles(cx, cy, 0xFF4400, 8, 80, 400);
      break;
    }

    case JobSkillId.GUST:
      color = 0xAAFFAA;
      spawnFX(scene, cx, cy, 'fx_plant', { scale: (radius * 2) / 30, tint: 0x44FF44, alpha: 0.8, duration: 350, scaleEnd: (radius * 2.5) / 30 });
      spawnFX(scene, cx, cy, 'fx_plant', { scale: (radius * 1.2) / 30, tint: 0x88FF88, alpha: 0.5, duration: 250, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 0.4) / 30 });
      helpers.drawImpactParticles(cx, cy, 0x44FF44, 6, 60, 300);
      break;

    case JobSkillId.QUAKE:
      color = 0x8B4513;
      playImpactFX(scene, cx, cy, 0, 'fx_rock_spike', (radius * 2) / 48, 0xBB8844, 400);
      spawnFX(scene, cx, cy, 'fx_rock', { scale: (radius * 1.5) / 30, tint: 0x996633, alpha: 0.8, duration: 350, scaleEnd: (radius * 0.5) / 30 });
      helpers.drawImpactParticles(cx, cy, 0x886633, 8, 60, 350);
      break;

    case JobSkillId.RAMUH:
      color = 0xFFDD44;
      playImpactFX(scene, cx, cy, 0, 'fx_thunder', (radius * 2) / 32, 0xFFDD44, 350);
      spawnFX(scene, cx, cy, 'fx_spark', { scale: (radius * 1.5) / 27, tint: 0xFFFF88, alpha: 0.7, duration: 300, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 0.4) / 27 });
      helpers.drawImpactParticles(cx, cy, 0xFFDD44, 8, 70, 300);
      break;

    case JobSkillId.TITAN:
      color = 0x8B6633;
      playImpactFX(scene, cx, cy, 0, 'fx_rock_spike', (radius * 2.5) / 48, 0xAA7744, 450);
      spawnFX(scene, cx, cy, 'fx_rock', { scale: (radius * 2) / 30, tint: 0x886633, alpha: 0.8, duration: 400, scaleEnd: (radius * 0.8) / 30 });
      helpers.drawImpactParticles(cx, cy, 0x996633, 10, 80, 400);
      break;

    case JobSkillId.LEVIATHAN:
      color = 0x4488FF;
      playImpactFX(scene, cx, cy, 0, 'fx_water_pillar', (radius * 2) / 27, 0x4488FF, 400);
      spawnFX(scene, cx, cy, 'fx_water', { scale: (radius * 2) / 40, tint: 0x2266CC, alpha: 0.8, duration: 400, scaleEnd: (radius * 2.5) / 40 });
      helpers.drawImpactParticles(cx, cy, 0x4488FF, 8, 70, 350);
      break;

    case JobSkillId.ODIN: {
      color = 0x8844AA;
      playSlashFX(scene, cx, cy, Math.random() * Math.PI * 2, 'fx_slash_double', (radius * 2) / 32, 0x8844AA, 350);
      spawnFX(scene, cx, cy, 'fx_spirit', { scale: (radius * 1.5) / 32, tint: 0x8844AA, alpha: 0.7, duration: 350, scaleEnd: (radius * 0.5) / 32 });
      helpers.drawImpactParticles(cx, cy, 0xAA66CC, 8, 70, 300);
      break;
    }

    case JobSkillId.DIABOLOS: {
      color = 0x7733BB;
      spawnFX(scene, cx, cy, 'fx_spirit_double', { scale: (radius * 2) / 32, tint: 0x440088, alpha: 0.8, duration: 400, scaleEnd: (radius * 0.3) / 32 });
      spawnFX(scene, cx, cy, 'fx_circle_spark', { scale: (radius * 2.5) / 32, tint: 0x220044, alpha: 0.5, duration: 500, scaleEnd: (radius * 0.2) / 32 });
      helpers.drawImpactParticles(cx, cy, 0x660099, 6, 50, 400);
      break;
    }

    case JobSkillId.KNIGHTS_OF_THE_ROUND: {
      color = 0xFF1144;
      const strikeCount = params.strikeCount ?? 13;
      for (let s = 0; s < strikeCount; s++) {
        const angle = (s / strikeCount) * Math.PI * 2;
        const sx = cx + Math.cos(angle) * radius * 0.6;
        const sy = cy + Math.sin(angle) * radius * 0.6;
        scene.time.delayedCall(s * 80, () => {
          playSlashFX(scene, sx, sy, Math.random() * Math.PI * 2, 'fx_cut', SPRITE_SCALE * 1.5, 0xFFDD44, 200);
          helpers.drawImpactParticles(sx, sy, 0xFFCC44, 3, 30, 200);
        });
      }
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0xFFDD44, 500);
      break;
    }

    // ---- Mastery AoE Skills ----

    case MasterySkillId.SOUL_EATER:
      color = 0x440088;
      spawnFX(scene, cx, cy, 'fx_spirit_double', { scale: (radius * 2) / 32, tint: 0x440088, alpha: 0.8, duration: 400, scaleEnd: (radius * 0.4) / 32 });
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 1.5) / 40, 0x330066, 350);
      helpers.drawImpactParticles(cx, cy, 0x660099, 8, 60, 350);
      break;

    case MasterySkillId.INNER_BEAST:
      color = 0xCC2222;
      playSlashFX(scene, cx, cy, Math.random() * Math.PI * 2, 'fx_slash_curved', (radius * 2) / 32, 0xCC2222, 350);
      spawnFX(scene, cx, cy, 'fx_explosion', { scale: (radius * 1.2) / 40, tint: 0xFF4444, alpha: 0.7, duration: 300, scaleEnd: (radius * 0.4) / 40 });
      helpers.drawImpactParticles(cx, cy, 0xFF4444, 8, 60, 300);
      break;

    case MasterySkillId.FELL_CLEAVE:
      color = 0xDD3333;
      playSlashFX(scene, cx, cy, Math.random() * Math.PI * 2, 'fx_slash_double_curved', (radius * 2.5) / 32, 0xDD3333, 400);
      spawnFX(scene, cx, cy, 'fx_explosion', { scale: (radius * 1.5) / 40, tint: 0xFF2222, alpha: 0.8, duration: 350, scaleEnd: (radius * 0.5) / 40 });
      helpers.drawImpactParticles(cx, cy, 0xFF4444, 10, 80, 350);
      break;

    case MasterySkillId.FLARE:
      color = 0xFF4400;
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 2.5) / 40, 0xFF4400, 450);
      spawnFX(scene, cx, cy, 'fx_flame', { scale: (radius * 2) / 40, tint: 0xFF6600, alpha: 0.8, duration: 400, scaleEnd: (radius * 0.6) / 40 });
      helpers.drawImpactParticles(cx, cy, 0xFF6600, 10, 90, 400);
      break;

    case MasterySkillId.DREADWYRM:
      color = 0x440066;
      spawnFX(scene, cx, cy, 'fx_spirit_double', { scale: (radius * 2) / 32, tint: 0x440066, alpha: 0.8, duration: 450, scaleEnd: (radius * 0.3) / 32 });
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 1.8) / 40, 0x330055, 400);
      helpers.drawImpactParticles(cx, cy, 0x660099, 10, 70, 400);
      break;

    case MasterySkillId.ERUPTION:
      color = 0xFF3300;
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0xFF3300, 400);
      spawnFX(scene, cx, cy, 'fx_flame', { scale: (radius * 1.8) / 40, tint: 0xFF5500, alpha: 0.8, duration: 380, scaleEnd: (radius * 0.5) / 40 });
      helpers.drawImpactParticles(cx, cy, 0xFF4400, 8, 70, 350);
      break;

    case MasterySkillId.LANDSLIDE:
      color = 0x8B4513;
      playImpactFX(scene, cx, cy, 0, 'fx_rock_spike', (radius * 2) / 48, 0xAA7744, 400);
      spawnFX(scene, cx, cy, 'fx_rock', { scale: (radius * 1.8) / 30, tint: 0x886633, alpha: 0.8, duration: 380, scaleEnd: (radius * 0.6) / 30 });
      helpers.drawImpactParticles(cx, cy, 0x996633, 8, 70, 350);
      break;

    case MasterySkillId.STARDIVER:
      color = 0x4488FF;
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 2.5) / 40, 0x4488FF, 450);
      spawnFX(scene, cx, cy, 'fx_circle_white', { scale: (radius * 2) / 32, tint: 0x6699FF, alpha: 0.7, duration: 400, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 2.5) / 32 });
      helpers.drawImpactParticles(cx, cy, 0x4488FF, 10, 80, 400);
      break;

    case MasterySkillId.FINALE:
      color = 0xFFFFCC;
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0xFFFFCC, 400);
      spawnFX(scene, cx, cy, 'fx_circle_white', { scale: (radius * 2) / 32, tint: 0xFFFFFF, alpha: 0.7, duration: 350, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 2.5) / 32 });
      helpers.drawImpactParticles(cx, cy, 0xFFFF88, 8, 70, 350);
      break;

    case MasterySkillId.COMET: {
      const cometAngle = Math.random() * Math.PI * 2;
      const cometDist = Math.random() * 100 + 20;
      cx = px + Math.cos(cometAngle) * cometDist;
      cy = py + Math.sin(cometAngle) * cometDist;
      color = 0x8855CC;
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 2) / 40, 0x8855CC, 400);
      spawnFX(scene, cx, cy, 'fx_flame', { scale: (radius * 1.5) / 40, tint: 0x6633AA, alpha: 0.8, duration: 350, scaleEnd: (radius * 0.4) / 40 });
      helpers.drawImpactParticles(cx, cy, 0x8855CC, 8, 70, 350);
      break;
    }

    case MasterySkillId.MIDARE_SETSUGEKKA:
      color = 0xCCEEFF;
      playSlashFX(scene, cx, cy, Math.random() * Math.PI * 2, 'fx_slash_double_curved', (radius * 2) / 32, 0xCCEEFF, 300);
      spawnFX(scene, cx, cy, 'fx_ice', { scale: (radius * 1.5) / 32, tint: 0x88CCFF, alpha: 0.7, duration: 300, scaleEnd: (radius * 0.4) / 32 });
      helpers.drawImpactParticles(cx, cy, 0x88CCFF, 8, 60, 300);
      break;

    case MasterySkillId.EDEN:
      color = 0xFFFFFF;
      playImpactFX(scene, cx, cy, 0, 'fx_explosion', (radius * 3) / 40, 0xFFFFFF, 500);
      spawnFX(scene, cx, cy, 'fx_circle_white', { scale: (radius * 3) / 32, tint: 0xFFFFFF, alpha: 0.8, duration: 500, blendMode: Phaser.BlendModes.ADD, scaleEnd: (radius * 4) / 32 });
      helpers.drawImpactParticles(cx, cy, 0xFFFFFF, 12, 100, 500);
      break;
  }

  // Apply effects to enemies in radius
  const enemies = helpers.getEnemiesInRadius(cx, cy, radius);
  for (const enemy of enemies) {
    if (damage > 0) {
      enemy.takeDamage(damage, false);
      EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
    }

    if (stunDuration > 0) {
      enemy.applyStun(stunDuration);
    }

    // Gust/Leviathan repulsion
    if (skillId === JobSkillId.GUST || skillId === JobSkillId.LEVIATHAN) {
      const dx = enemy.x - cx;
      const dy = enemy.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const pushForce = 250;
      enemy.setVelocity((dx / dist) * pushForce, (dy / dist) * pushForce);
    }

    // Odin execute
    if (skillId === JobSkillId.ODIN) {
      const threshold = params.executeThreshold ?? 0.20;
      const hpRatio = enemy.currentHP / Math.max(1, enemy.maxHP);
      if (hpRatio < threshold && Math.random() < threshold) {
        enemy.takeDamage(9999, false);
      }
    }
  }
}
