import Phaser from 'phaser';
import { EVENTS, DEPTHS, JobSkillId, MasterySkillId } from '../../constants';
import { EventBus } from '../EventBus';
import { SkillContext, SkillHelpers } from './SkillTypes';

// ---- Familiar orbit config ----

const FAMILIAR_ORBIT_RADIUS = 28;
const FAMILIAR_ORBIT_SPEED = 2.5; // radians per second
const FAMILIAR_HIT_RADIUS = 12;

/**
 * Updates familiar skills (IFRIT, SHIVA, PHOENIX).
 * Familiars orbit the player and periodically damage nearby enemies.
 */
export function updateFamiliar(
  ctx: SkillContext,
  helpers: SkillHelpers,
  skillId: string,
  params: Record<string, number>,
  delta: number,
  familiarGraphics: Map<string, Phaser.GameObjects.Sprite>,
  familiarAngles: Map<string, number>,
  familiarAttackTimers: Map<string, number>,
): void {
  const { scene, player } = ctx;

  const attackInterval = params.attackInterval ?? 1500;
  const damage = params.damage ?? 0;
  const slowPercent = params.slowPercent ?? 0;

  // Initialize angle if needed
  if (!familiarAngles.has(skillId)) {
    const startAngle = skillId === JobSkillId.IFRIT ? 0 : Math.PI;
    familiarAngles.set(skillId, startAngle);
    familiarAttackTimers.set(skillId, 0);
  }

  // Orbit around player
  const angle = familiarAngles.get(skillId)! + FAMILIAR_ORBIT_SPEED * (delta / 1000);
  familiarAngles.set(skillId, angle % (Math.PI * 2));

  const fx = player.x + Math.cos(angle) * FAMILIAR_ORBIT_RADIUS;
  const fy = player.y + Math.sin(angle) * FAMILIAR_ORBIT_RADIUS;

  // Draw familiar using sprites
  let familiarSprite = familiarGraphics.get(skillId);
  if (!familiarSprite) {
    const isIfrit = skillId === JobSkillId.IFRIT;
    const isPhoenix = skillId === MasterySkillId.PHOENIX;
    const texKey = isIfrit ? 'fx_flame' : (isPhoenix ? 'fx_flame' : 'fx_ice');
    const tint = isIfrit ? 0xFF6600 : (isPhoenix ? 0xFF4400 : 0x44AAFF);
    familiarSprite = scene.add.sprite(fx, fy, texKey, 0);
    familiarSprite.setDepth(DEPTHS.EFFECTS);
    familiarSprite.setTint(tint);
    familiarSprite.setScale(1.2);
    familiarGraphics.set(skillId, familiarSprite);
  }

  // Reposition familiar sprite each frame
  familiarSprite.setPosition(fx, fy);
  const flickerAlpha = 0.7 + Math.sin(Date.now() * 0.01) * 0.2;
  familiarSprite.setAlpha(flickerAlpha);

  // Attack timer: damage enemies the familiar touches
  const atkTimer = (familiarAttackTimers.get(skillId) ?? 0) + delta;
  if (atkTimer >= attackInterval) {
    familiarAttackTimers.set(skillId, atkTimer - attackInterval);

    const enemies = helpers.getEnemiesInRadius(fx, fy, FAMILIAR_HIT_RADIUS);
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
      helpers.drawPulse(fx, fy, FAMILIAR_HIT_RADIUS, sparkColor, 0.5, 200);
    }
  } else {
    familiarAttackTimers.set(skillId, atkTimer);
  }
}
