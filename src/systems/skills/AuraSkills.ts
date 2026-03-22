import Phaser from 'phaser';
import { EVENTS, DEPTHS, JobSkillId } from '../../constants';
import { EventBus } from '../EventBus';
import { SkillContext, SkillHelpers } from './SkillTypes';

/**
 * Updates aura skills (CONSECRATE, REQUIEM).
 * Manages persistent aura sprites that follow the player and deal periodic damage.
 */
export function updateAura(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
  auraGraphics: Map<string, Phaser.GameObjects.GameObject>,
): void {
  const { scene, player } = ctx;

  const radius = params.radius ?? 40;
  const damage = params.damage ?? 3;
  const cooldown = helpers.getEffectiveCooldown(params.cooldown ?? 1000);
  const slowPercent = params.slowPercent ?? 0;

  // Determine color
  const color = skillId === JobSkillId.CONSECRATE ? 0xFFD700 : 0xDAA520;
  const fillColor = skillId === JobSkillId.CONSECRATE ? 0xFFDD44 : 0xCC9922;

  // Draw persistent aura around player using sprites
  let auraSprite = auraGraphics.get(skillId) as Phaser.GameObjects.Sprite | undefined;
  if (!auraSprite) {
    auraSprite = scene.add.sprite(player.x, player.y, 'fx_circle_orange', 0);
    auraSprite.setDepth(DEPTHS.EFFECTS - 1);
    auraSprite.setTint(fillColor);
    auraGraphics.set(skillId, auraSprite);
  }

  // Subtle pulsing: radius oscillates based on time
  const pulsePhase = (Date.now() % 2000) / 2000;
  const pulseFactor = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.04;
  const displayRadius = radius * pulseFactor;

  // Inner fill with slight pulse in alpha
  const fillAlpha = 0.06 + Math.sin(pulsePhase * Math.PI * 2) * 0.03;
  auraSprite.setPosition(player.x, player.y);
  auraSprite.setScale((displayRadius * 2) / 32);
  auraSprite.setAlpha(fillAlpha);

  // Slowly rotate the sprite over time
  const rotationOffset = (Date.now() % 6000) / 6000 * Math.PI * 2;
  auraSprite.setRotation(rotationOffset);

  // Additive glow layer inside the aura for a subtle bloom effect
  let auraGlowSprite = auraGraphics.get(skillId + '_glow') as Phaser.GameObjects.Sprite | undefined;
  if (!auraGlowSprite) {
    auraGlowSprite = scene.add.sprite(player.x, player.y, 'fx_circle_spark', 0);
    auraGlowSprite.setBlendMode(Phaser.BlendModes.ADD);
    auraGlowSprite.setDepth(DEPTHS.EFFECTS - 2);
    auraGlowSprite.setTint(fillColor);
    auraGraphics.set(skillId + '_glow', auraGlowSprite);
  }

  const glowAlpha = 0.08 + Math.sin(pulsePhase * Math.PI * 2) * 0.04;
  auraGlowSprite.setPosition(player.x, player.y);
  auraGlowSprite.setScale((displayRadius * 0.85 * 2) / 32);
  auraGlowSprite.setAlpha(glowAlpha);
  auraGlowSprite.setRotation(-rotationOffset * 0.6);

  // Accumulate timer
  const elapsed = helpers.addTimer(skillId, delta);
  if (elapsed < cooldown) return;
  helpers.setTimer(skillId, elapsed - cooldown);

  // Deal damage
  const enemies = helpers.getEnemiesInRadius(player.x, player.y, radius);
  for (const enemy of enemies) {
    enemy.takeDamage(damage, false);
    EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
    // Requiem slow
    if (slowPercent > 0) {
      enemy.applySlow(slowPercent, 1000);
    }
  }

  // Pulse on tick
  helpers.drawPulse(player.x, player.y, radius, color, 0.5, 250);
}
