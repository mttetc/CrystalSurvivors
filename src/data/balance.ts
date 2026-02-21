import { SCALE_HP_PER_WAVE, SCALE_SPEED_PER_WAVE, SCALE_DAMAGE_PER_WAVE } from '../constants';

export function xpRequired(level: number): number {
  return Math.floor(8 + (level - 1) * 4 + Math.pow(level - 1, 1.6));
}

export function scaleHP(baseHP: number, wave: number): number {
  return Math.floor(baseHP * (1 + SCALE_HP_PER_WAVE * (wave - 1)));
}

export function scaleSpeed(baseSpeed: number, wave: number): number {
  return baseSpeed * (1 + SCALE_SPEED_PER_WAVE * (wave - 1));
}

export function scaleDamage(baseDamage: number, wave: number): number {
  return Math.floor(baseDamage * (1 + SCALE_DAMAGE_PER_WAVE * (wave - 1)));
}
