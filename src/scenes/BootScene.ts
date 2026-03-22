import Phaser from 'phaser';
import { SCENES } from '../constants';
import {
  CHARACTERS,
  MONSTERS, BOSSES,
  PROJECTILE_IMAGES, PROJECTILE_SHEETS,
  FX_SLASH, FX_ELEMENTAL, FX_MAGIC, FX_SMOKE,
  PARTICLES,
  ITEM_WEAPONS, ITEM_MISC, WEAPON_INHAND,
  TILESETS, TILESETS_ANIMATED,
  PICKUP_IMAGES, PICKUP_SHEETS,
  ENVIRONMENT,
  UI_BARS, UI_THEME, UI_RECEPTACLE, UI_DIALOG,
  ICONS,
  MUSIC, JINGLES, SFX,
} from '../assets';

// ── Helpers ────────────────────────────────────────────────────────────────
function loadImages(loader: Phaser.Loader.LoaderPlugin, map: Record<string, string>): void {
  for (const [key, path] of Object.entries(map)) {
    loader.image(key, path);
  }
}
function loadSheets(
  loader: Phaser.Loader.LoaderPlugin,
  map: Record<string, { path: string; frameWidth: number; frameHeight: number }>,
): void {
  for (const [key, { path, frameWidth, frameHeight }] of Object.entries(map)) {
    loader.spritesheet(key, path, { frameWidth, frameHeight });
  }
}
function loadAudio(loader: Phaser.Loader.LoaderPlugin, map: Record<string, string>): void {
  for (const [key, path] of Object.entries(map)) {
    loader.audio(key, path);
  }
}

// ── Scene ──────────────────────────────────────────────────────────────────
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  preload(): void {
    // Characters — each entry produces walk / jump / attack / dead texture keys
    for (const [key, walkPath] of Object.entries(CHARACTERS)) {
      const basePath = walkPath.replace('.png', '');
      this.load.spritesheet(key, walkPath, { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet(`${key}_jump`, `${basePath}_jump.png`, { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet(`${key}_attack`, `${basePath}_attack.png`, { frameWidth: 16, frameHeight: 16 });
      this.load.image(`${key}_dead`, `${basePath}_dead.png`);
    }

    // Monsters (16x16 spritesheets)
    for (const [key, path] of Object.entries(MONSTERS)) {
      this.load.spritesheet(key, path, { frameWidth: 16, frameHeight: 16 });
    }

    // Bosses (custom frame sizes)
    loadSheets(this.load, BOSSES);

    // Projectiles
    loadImages(this.load, PROJECTILE_IMAGES);
    loadSheets(this.load, PROJECTILE_SHEETS);

    // FX — slash (all 32x32)
    for (const [key, path] of Object.entries(FX_SLASH)) {
      this.load.spritesheet(key, path, { frameWidth: 32, frameHeight: 32 });
    }

    // FX — elemental, magic, smoke
    loadSheets(this.load, FX_ELEMENTAL);
    loadSheets(this.load, FX_MAGIC);
    loadSheets(this.load, FX_SMOKE);

    // Particles
    loadImages(this.load, PARTICLES);

    // Items
    loadImages(this.load, ITEM_WEAPONS);
    loadImages(this.load, ITEM_MISC);
    loadImages(this.load, WEAPON_INHAND);

    // Tilesets (16x16 spritesheets)
    for (const [key, path] of Object.entries(TILESETS)) {
      this.load.spritesheet(key, path, { frameWidth: 16, frameHeight: 16 });
    }
    // Animated tilesets (16x16 spritesheets, except quicksand 32x32)
    for (const [key, path] of Object.entries(TILESETS_ANIMATED)) {
      const size = key === 'anim_quicksand' ? 32 : 16;
      this.load.spritesheet(key, path, { frameWidth: size, frameHeight: size });
    }

    // Pickups
    loadImages(this.load, PICKUP_IMAGES);
    loadSheets(this.load, PICKUP_SHEETS);

    // Environment
    loadImages(this.load, ENVIRONMENT);

    // UI bars
    loadImages(this.load, UI_BARS);

    // UI theme (panels, buttons)
    loadImages(this.load, UI_THEME);

    // UI receptacles (hearts, bars, spheres)
    loadImages(this.load, UI_RECEPTACLE);
    // Heart spritesheet: 5 frames at 16x16 in an 80x16 strip
    this.load.spritesheet('ui_hearts_sheet', 'assets/ui/receptacle/heart_full.png', { frameWidth: 16, frameHeight: 16 });

    // UI dialog boxes
    loadImages(this.load, UI_DIALOG);

    // Font
    const fontFace = new FontFace('NinjaFont', 'url(assets/ui/font/NormalFont.ttf)');
    fontFace.load().then(f => { document.fonts.add(f); }).catch(() => {});

    // Icons (images)
    loadImages(this.load, ICONS);

    // Audio
    loadAudio(this.load, MUSIC);
    loadAudio(this.load, JINGLES);
    loadAudio(this.load, SFX);
  }

  create(): void {
    this.scene.start(SCENES.TITLE);
  }
}
