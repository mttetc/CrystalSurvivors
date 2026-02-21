import { EnemyType } from '../constants';
import { WaveDef } from '../types';

// Total target: ~15 minutes (900s)
// 20 waves + 19 inter-wave pauses (3s each) = 57s pauses
// Wave durations total ≈ 843s
// Bosses: waves 5, 10, 15, 20
// Each wave has a distinct enemy theme

export const WAVE_DEFS: WaveDef[] = [
  // ─── ACT 1: Introduction (waves 1-4) ───────────────────────────

  // Wave 1: "The Shambling Dead" - shamblers + early swarmers
  { wave: 1, duration: 33000, isBossWave: false, groups: [
    { type: EnemyType.SHAMBLER, count: 70, spawnRate: 4.0 },
    { type: EnemyType.SWARMER, count: 20, spawnRate: 2.0, delay: 8000 },
  ]},

  // Wave 2: "Bat Swarm" - fast + tiny enemies
  { wave: 2, duration: 33000, isBossWave: false, groups: [
    { type: EnemyType.SPRINTER, count: 35, spawnRate: 2.5 },
    { type: EnemyType.SWARMER, count: 50, spawnRate: 4.0 },
  ]},

  // Wave 3: "Restless Spirits" - ranged ghosts + melee backup
  { wave: 3, duration: 33000, isBossWave: false, groups: [
    { type: EnemyType.SPITTER, count: 18, spawnRate: 1.2 },
    { type: EnemyType.SHAMBLER, count: 35, spawnRate: 2.0 },
  ]},

  // Wave 4: "Skull Tide" - massive swarmer rush + sprinters
  { wave: 4, duration: 33000, isBossWave: false, groups: [
    { type: EnemyType.SWARMER, count: 60, spawnRate: 5.0 },
    { type: EnemyType.SPRINTER, count: 15, spawnRate: 1.5 },
    { type: EnemyType.SHAMBLER, count: 20, spawnRate: 1.5 },
  ]},

  // ─── BOSS 1: Wave 5 ────────────────────────────────────────────

  // Wave 5: Gorehound boss + swarmer support + phantoms debut
  { wave: 5, duration: 48000, isBossWave: true, bossType: EnemyType.GOREHOUND, bossHP: 500, groups: [
    { type: EnemyType.SWARMER, count: 50, spawnRate: 2.5 },
    { type: EnemyType.SHAMBLER, count: 30, spawnRate: 1.5 },
    { type: EnemyType.PHANTOM, count: 8, spawnRate: 0.4, delay: 10000 },
  ]},

  // ─── ACT 2: Full roster (waves 6-9) ────────────────────────────

  // Wave 6: "Heavy Hitters" - slow tanks + shamblers + bombers debut
  { wave: 6, duration: 38000, isBossWave: false, groups: [
    { type: EnemyType.BRUTE, count: 14, spawnRate: 0.8 },
    { type: EnemyType.SHAMBLER, count: 50, spawnRate: 3.0 },
    { type: EnemyType.BOMBER, count: 12, spawnRate: 0.8 },
  ]},

  // Wave 7: "Pumpkin Patch" - splitters + leapers debut
  { wave: 7, duration: 38000, isBossWave: false, groups: [
    { type: EnemyType.SPLITTER, count: 25, spawnRate: 1.5 },
    { type: EnemyType.SWARMER, count: 40, spawnRate: 3.0 },
    { type: EnemyType.LEAPER, count: 10, spawnRate: 0.7 },
  ]},

  // Wave 8: "Dark Ritual" - necromancers + tanks debut
  { wave: 8, duration: 38000, isBossWave: false, groups: [
    { type: EnemyType.NECROMANCER, count: 8, spawnRate: 0.5 },
    { type: EnemyType.SPITTER, count: 18, spawnRate: 1.2 },
    { type: EnemyType.SHAMBLER, count: 30, spawnRate: 2.0 },
    { type: EnemyType.TANK, count: 6, spawnRate: 0.3 },
  ]},

  // Wave 9: "Speed Demons" - pure fast chaos
  { wave: 9, duration: 38000, isBossWave: false, groups: [
    { type: EnemyType.SPRINTER, count: 35, spawnRate: 2.5 },
    { type: EnemyType.SWARMER, count: 60, spawnRate: 4.5 },
  ]},

  // ─── BOSS 2: Wave 10 ───────────────────────────────────────────

  // Wave 10: Gorehound (stronger) + brutes + necromancers
  { wave: 10, duration: 50000, isBossWave: true, bossType: EnemyType.GOREHOUND, bossHP: 800, groups: [
    { type: EnemyType.BRUTE, count: 10, spawnRate: 0.6 },
    { type: EnemyType.NECROMANCER, count: 5, spawnRate: 0.3 },
    { type: EnemyType.SHAMBLER, count: 60, spawnRate: 3.0 },
  ]},

  // ─── ACT 3: Intensity ramp (waves 11-14) ───────────────────────

  // Wave 11: "Undead Army" - heavy flood + phantoms + tanks
  { wave: 11, duration: 42000, isBossWave: false, groups: [
    { type: EnemyType.SHAMBLER, count: 90, spawnRate: 5.0 },
    { type: EnemyType.BRUTE, count: 8, spawnRate: 0.5 },
    { type: EnemyType.SPITTER, count: 12, spawnRate: 0.8 },
    { type: EnemyType.PHANTOM, count: 12, spawnRate: 0.7 },
    { type: EnemyType.TANK, count: 6, spawnRate: 0.3 },
  ]},

  // Wave 12: "The Splitting" - splitters + brutes, chain reaction chaos
  { wave: 12, duration: 42000, isBossWave: false, groups: [
    { type: EnemyType.SPLITTER, count: 35, spawnRate: 2.0 },
    { type: EnemyType.BRUTE, count: 12, spawnRate: 0.7 },
    { type: EnemyType.SHAMBLER, count: 40, spawnRate: 2.5 },
  ]},

  // Wave 13: "Ghost Storm" - ranged + necromancer hell
  { wave: 13, duration: 42000, isBossWave: false, groups: [
    { type: EnemyType.SPITTER, count: 25, spawnRate: 1.8 },
    { type: EnemyType.NECROMANCER, count: 10, spawnRate: 0.6 },
    { type: EnemyType.SWARMER, count: 60, spawnRate: 4.0 },
  ]},

  // Wave 14: "Charge!" - sprinters + brutes + bombers + leapers
  { wave: 14, duration: 42000, isBossWave: false, groups: [
    { type: EnemyType.SPRINTER, count: 45, spawnRate: 3.0 },
    { type: EnemyType.BRUTE, count: 15, spawnRate: 0.8 },
    { type: EnemyType.SHAMBLER, count: 50, spawnRate: 3.0 },
    { type: EnemyType.BOMBER, count: 15, spawnRate: 1.0 },
    { type: EnemyType.LEAPER, count: 12, spawnRate: 0.8 },
  ]},

  // ─── BOSS 3: Wave 15 ───────────────────────────────────────────

  // Wave 15: Gorehound (HP 1100) + necromancers + splitters
  { wave: 15, duration: 50000, isBossWave: true, bossType: EnemyType.GOREHOUND, bossHP: 1100, groups: [
    { type: EnemyType.NECROMANCER, count: 8, spawnRate: 0.5 },
    { type: EnemyType.SPLITTER, count: 25, spawnRate: 1.5 },
    { type: EnemyType.SWARMER, count: 60, spawnRate: 3.5 },
  ]},

  // ─── ACT 4: Endurance (waves 16-19) ────────────────────────────

  // Wave 16: "Endless Swarm" - pure numbers, maximum density
  { wave: 16, duration: 43000, isBossWave: false, groups: [
    { type: EnemyType.SWARMER, count: 100, spawnRate: 7.0 },
    { type: EnemyType.SHAMBLER, count: 80, spawnRate: 5.0 },
  ]},

  // Wave 17: "Dark Council" - elite composition: necros + brutes + ghosts
  { wave: 17, duration: 43000, isBossWave: false, groups: [
    { type: EnemyType.NECROMANCER, count: 12, spawnRate: 0.7 },
    { type: EnemyType.BRUTE, count: 18, spawnRate: 1.0 },
    { type: EnemyType.SPITTER, count: 20, spawnRate: 1.5 },
  ]},

  // Wave 18: "Blitz" - fast chaos: sprinters + swarmers + splitters
  { wave: 18, duration: 43000, isBossWave: false, groups: [
    { type: EnemyType.SPRINTER, count: 45, spawnRate: 3.0 },
    { type: EnemyType.SWARMER, count: 80, spawnRate: 5.0 },
    { type: EnemyType.SPLITTER, count: 30, spawnRate: 1.8 },
  ]},

  // Wave 19: "Apocalypse" - all types, max intensity
  { wave: 19, duration: 43000, isBossWave: false, groups: [
    { type: EnemyType.SHAMBLER, count: 80, spawnRate: 5.0 },
    { type: EnemyType.SWARMER, count: 70, spawnRate: 5.0 },
    { type: EnemyType.SPRINTER, count: 30, spawnRate: 2.0 },
    { type: EnemyType.BRUTE, count: 12, spawnRate: 0.7 },
    { type: EnemyType.NECROMANCER, count: 8, spawnRate: 0.5 },
    { type: EnemyType.SPLITTER, count: 20, spawnRate: 1.2 },
    { type: EnemyType.SPITTER, count: 15, spawnRate: 1.0 },
    { type: EnemyType.PHANTOM, count: 15, spawnRate: 1.0 },
    { type: EnemyType.BOMBER, count: 18, spawnRate: 1.2 },
    { type: EnemyType.TANK, count: 10, spawnRate: 0.5 },
    { type: EnemyType.LEAPER, count: 14, spawnRate: 0.9 },
  ]},

  // ─── FINAL BOSS: Wave 20 ───────────────────────────────────────

  // Wave 20: Hivemind + endless fodder from all types
  { wave: 20, duration: 75000, isBossWave: true, bossType: EnemyType.HIVEMIND, bossHP: 2000, groups: [
    { type: EnemyType.SHAMBLER, count: 150, spawnRate: 6.0 },
    { type: EnemyType.SWARMER, count: 120, spawnRate: 5.0 },
    { type: EnemyType.SPRINTER, count: 40, spawnRate: 2.0 },
    { type: EnemyType.NECROMANCER, count: 6, spawnRate: 0.3 },
  ]},
];
