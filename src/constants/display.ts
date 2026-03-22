// ─── Display ────────────────────────────────────────────────────────
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GAME_ZOOM = 1;

// ─── Sprite Scale ───────────────────────────────────────────────────
// Change this ONE value to scale all sprites, hitboxes, radii, and ranges.
// 1 = original pixel size, 2 = FFBE/FFT style (32x40 player), 3 = even bigger
export const SPRITE_SCALE = 2;

// ─── World ──────────────────────────────────────────────────────────
export const WORLD_WIDTH = 3000;
export const WORLD_HEIGHT = 3000;

// ─── Scenes ─────────────────────────────────────────────────────────
export const SCENES = {
  BOOT: 'BootScene',
  TITLE: 'TitleScene',
  CHAR_SELECT: 'CharSelectScene',
  GAME: 'GameScene',
  HUD: 'HUDScene',
  LEVEL_UP: 'LevelUpScene',
  PAUSE: 'PauseScene',
  PERKS: 'PerksScene',
  GAME_OVER: 'GameOverScene',
} as const;

// ─── Depths ─────────────────────────────────────────────────────────
export const DEPTHS = {
  GROUND: 0,
  PICKUPS: 5,
  ENEMIES: 10,
  PLAYER: 15,
  PROJECTILES: 20,
  EFFECTS: 100,
  UI: 200,
} as const;

// ─── Direction ──────────────────────────────────────────────────────
export enum Direction {
  DOWN = 0,
  LEFT = 1,
  RIGHT = 2,
  UP = 3,
}
