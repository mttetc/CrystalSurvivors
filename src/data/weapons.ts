import { WeaponId, JobId } from '../constants';
import { WeaponDef } from '../types';

export const WEAPON_DEFS: Record<WeaponId, WeaponDef> = {
  // ─── Ranger: Hunter's Bow ──────────────────────────────────────────
  [WeaponId.HUNTERS_BOW]: {
    id: WeaponId.HUNTERS_BOW,
    name: "Hunter's Bow",
    description: 'Rapid arrows toward nearest enemy',
    affinityJob: JobId.RANGER,
    levels: [
      { damage: 4,  cooldown: 500, projectileSpeed: 280, pierce: 0, count: 1 },
      { damage: 6,  cooldown: 440, projectileSpeed: 300, pierce: 0, count: 1 },
      { damage: 9,  cooldown: 380, projectileSpeed: 320, pierce: 0, count: 2 },
      { damage: 11, cooldown: 330, projectileSpeed: 340, pierce: 1, count: 2 },
      { damage: 14, cooldown: 280, projectileSpeed: 360, pierce: 2, count: 3 },
    ],
  },
  // ─── Paladin: Sacred Shield ────────────────────────────────────────
  [WeaponId.SACRED_SHIELD]: {
    id: WeaponId.SACRED_SHIELD,
    name: 'Sacred Shield',
    description: 'Forward shield bash that knocks back enemies',
    affinityJob: JobId.PALADIN,
    levels: [
      { damage: 14, cooldown: 900,  count: 1, radius: 38 },
      { damage: 20, cooldown: 800,  count: 1, radius: 42 },
      { damage: 27, cooldown: 700,  count: 1, radius: 46 },
      { damage: 35, cooldown: 600,  count: 2, radius: 50 },
      { damage: 44, cooldown: 500,  count: 2, radius: 55 },
    ],
  },
  // ─── Black Mage: Fire Rod ──────────────────────────────────────────
  [WeaponId.FIRE_ROD]: {
    id: WeaponId.FIRE_ROD,
    name: 'Fire Rod',
    description: 'Launches fireballs at nearest enemy',
    affinityJob: JobId.BLACK_MAGE,
    levels: [
      { damage: 8,  cooldown: 800,  projectileSpeed: 200, pierce: 0, count: 1 },
      { damage: 13, cooldown: 720,  projectileSpeed: 210, pierce: 0, count: 1 },
      { damage: 19, cooldown: 640,  projectileSpeed: 220, pierce: 1, count: 1 },
      { damage: 26, cooldown: 560,  projectileSpeed: 230, pierce: 1, count: 2 },
      { damage: 35, cooldown: 480,  projectileSpeed: 240, pierce: 2, count: 2 },
    ],
  },
  // ─── Dark Knight: Dark Claymore ────────────────────────────────────
  [WeaponId.DARK_CLAYMORE]: {
    id: WeaponId.DARK_CLAYMORE,
    name: 'Dark Claymore',
    description: 'Massive dark sword slash in an arc',
    affinityJob: JobId.DARK_KNIGHT,
    levels: [
      { damage: 18, cooldown: 1400, radius: 45, count: 1 },
      { damage: 26, cooldown: 1200, radius: 50, count: 1 },
      { damage: 36, cooldown: 1000, radius: 58, count: 1 },
      { damage: 48, cooldown: 850,  radius: 65, count: 2 },
      { damage: 62, cooldown: 700,  radius: 72, count: 2 },
    ],
  },
  // ─── Bard: War Harp ────────────────────────────────────────────────
  [WeaponId.WAR_HARP]: {
    id: WeaponId.WAR_HARP,
    name: 'War Harp',
    description: 'Sound waves that chain between enemies',
    affinityJob: JobId.BARD,
    levels: [
      { damage: 8,  cooldown: 1800, count: 2, damageRetention: 0.80 },
      { damage: 14, cooldown: 1600, count: 3, damageRetention: 0.82 },
      { damage: 20, cooldown: 1400, count: 4, damageRetention: 0.85 },
      { damage: 28, cooldown: 1200, count: 5, damageRetention: 0.87 },
      { damage: 36, cooldown: 1000, count: 7, damageRetention: 0.90 },
    ],
  },
  // ─── Ninja: Shuriken ───────────────────────────────────────────────
  [WeaponId.SHURIKEN]: {
    id: WeaponId.SHURIKEN,
    name: 'Shuriken',
    description: 'Spinning projectiles that pierce and boomerang back',
    affinityJob: JobId.NINJA,
    levels: [
      { damage: 7,  cooldown: 1200, projectileSpeed: 220, pierce: 2, count: 1 },
      { damage: 10, cooldown: 1100, projectileSpeed: 240, pierce: 3, count: 1 },
      { damage: 14, cooldown: 1000, projectileSpeed: 260, pierce: 4, count: 2 },
      { damage: 18, cooldown: 900,  projectileSpeed: 280, pierce: 5, count: 2 },
      { damage: 24, cooldown: 800,  projectileSpeed: 300, pierce: 6, count: 3 },
    ],
  },
  // ─── Samurai: Katana ───────────────────────────────────────────────
  [WeaponId.KATANA]: {
    id: WeaponId.KATANA,
    name: 'Katana',
    description: 'Swift sword arc slashes nearby enemies',
    affinityJob: JobId.SAMURAI,
    levels: [
      { damage: 15, cooldown: 1600, radius: 40,  count: 1 },
      { damage: 22, cooldown: 1400, radius: 48,  count: 1 },
      { damage: 30, cooldown: 1200, radius: 55,  count: 1 },
      { damage: 40, cooldown: 1000, radius: 62,  count: 2 },
      { damage: 52, cooldown: 850,  radius: 70,  count: 2 },
    ],
  },
  // ─── Berserker: Battle Axe ─────────────────────────────────────────
  [WeaponId.BATTLE_AXE]: {
    id: WeaponId.BATTLE_AXE,
    name: 'Battle Axe',
    description: 'Wide heavy axe sweep around the player',
    affinityJob: JobId.BERSERKER,
    levels: [
      { damage: 20, cooldown: 1800, radius: 48, count: 1 },
      { damage: 30, cooldown: 1600, radius: 55, count: 1 },
      { damage: 42, cooldown: 1400, radius: 62, count: 1 },
      { damage: 55, cooldown: 1200, radius: 70, count: 2 },
      { damage: 70, cooldown: 1000, radius: 80, count: 2 },
    ],
  },
  // ─── Dragoon: War Lance ────────────────────────────────────────────
  [WeaponId.WAR_LANCE]: {
    id: WeaponId.WAR_LANCE,
    name: 'War Lance',
    description: 'Slow piercing lance that tears through everything',
    affinityJob: JobId.DRAGOON,
    levels: [
      { damage: 25, cooldown: 1800, projectileSpeed: 160, pierce: 999, count: 1 },
      { damage: 35, cooldown: 1600, projectileSpeed: 170, pierce: 999, count: 1 },
      { damage: 48, cooldown: 1400, projectileSpeed: 180, pierce: 999, count: 1 },
      { damage: 62, cooldown: 1200, projectileSpeed: 190, pierce: 999, count: 2 },
      { damage: 80, cooldown: 1000, projectileSpeed: 200, pierce: 999, count: 2 },
    ],
  },
  // ─── Alchemist: Flask Throw ────────────────────────────────────────
  [WeaponId.FLASK_THROW]: {
    id: WeaponId.FLASK_THROW,
    name: 'Flask Throw',
    description: 'Arcing potions that explode on impact, leaving poison at higher levels',
    affinityJob: JobId.ALCHEMIST,
    levels: [
      { damage: 8,  cooldown: 1400, radius: 30, count: 1 },
      { damage: 13, cooldown: 1200, radius: 35, count: 1 },
      { damage: 19, cooldown: 1000, radius: 40, count: 2 },
      { damage: 26, cooldown: 850,  radius: 48, count: 2 },
      { damage: 34, cooldown: 700,  radius: 55, count: 3 },
    ],
  },
  // ─── White Mage: Holy Rod ──────────────────────────────────────────
  [WeaponId.HOLY_ROD]: {
    id: WeaponId.HOLY_ROD,
    name: 'Holy Rod',
    description: 'Boomerang orb of light that pierces all',
    affinityJob: JobId.WHITE_MAGE,
    levels: [
      { damage: 15, cooldown: 1600, projectileSpeed: 200, pierce: 999, count: 1 },
      { damage: 22, cooldown: 1400, projectileSpeed: 220, pierce: 999, count: 1 },
      { damage: 30, cooldown: 1200, projectileSpeed: 240, pierce: 999, count: 1 },
      { damage: 40, cooldown: 1000, projectileSpeed: 260, pierce: 999, count: 2 },
      { damage: 52, cooldown: 800,  projectileSpeed: 280, pierce: 999, count: 2 },
    ],
  },
  // ─── Summoner: Ether Rod ───────────────────────────────────────────
  [WeaponId.ETHER_ROD]: {
    id: WeaponId.ETHER_ROD,
    name: 'Ether Rod',
    description: 'Seeking magical orbs that track the nearest enemy',
    affinityJob: JobId.SUMMONER,
    levels: [
      { damage: 8,  cooldown: 1200, projectileSpeed: 150, pierce: 0, count: 1 },
      { damage: 12, cooldown: 1100, projectileSpeed: 160, pierce: 0, count: 1 },
      { damage: 18, cooldown: 1000, projectileSpeed: 170, pierce: 1, count: 2 },
      { damage: 25, cooldown: 900,  projectileSpeed: 180, pierce: 1, count: 2 },
      { damage: 34, cooldown: 800,  projectileSpeed: 190, pierce: 2, count: 3 },
    ],
  },
  // ─── Monk: Iron Fists ──────────────────────────────────────────────
  [WeaponId.IRON_FISTS]: {
    id: WeaponId.IRON_FISTS,
    name: 'Iron Fists',
    description: 'Rapid punch strikes in melee range',
    affinityJob: JobId.MONK,
    levels: [
      { damage: 12, cooldown: 500,  radius: 32, count: 1 },
      { damage: 18, cooldown: 420,  radius: 34, count: 1 },
      { damage: 24, cooldown: 350,  radius: 36, count: 2 },
      { damage: 32, cooldown: 300,  radius: 38, count: 2 },
      { damage: 42, cooldown: 250,  radius: 42, count: 3 },
    ],
  },
  // ─── Time Mage: Chrono Rod ─────────────────────────────────────────
  [WeaponId.CHRONO_ROD]: {
    id: WeaponId.CHRONO_ROD,
    name: 'Chrono Rod',
    description: 'Periodic time distortion that slows and damages',
    affinityJob: JobId.TIME_MAGE,
    levels: [
      { damage: 10, cooldown: 3500, radius: 60 },
      { damage: 16, cooldown: 3000, radius: 75 },
      { damage: 24, cooldown: 2600, radius: 90 },
      { damage: 34, cooldown: 2200, radius: 110 },
      { damage: 45, cooldown: 1800, radius: 130 },
    ],
  },
  // ─── Geomancer: Earth Rod ──────────────────────────────────────────
  [WeaponId.EARTH_ROD]: {
    id: WeaponId.EARTH_ROD,
    name: 'Earth Rod',
    description: 'Passive earth aura that damages all nearby enemies',
    affinityJob: JobId.GEOMANCER,
    levels: [
      { damage: 2,  cooldown: 500, radius: 35 },
      { damage: 3,  cooldown: 450, radius: 40 },
      { damage: 5,  cooldown: 400, radius: 48 },
      { damage: 7,  cooldown: 350, radius: 55 },
      { damage: 10, cooldown: 300, radius: 65 },
    ],
  },
};
