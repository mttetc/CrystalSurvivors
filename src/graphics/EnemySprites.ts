// Enemy textures are now loaded as PNG spritesheets in BootScene.preload().
// Ninja Adventure monster sprites use 4 cols × 4 rows of 16×16 frames.
// Boss sprites use 48×48 or 50×50 frames.
// The enemy animation system (2-frame toggle) uses frames 0 and 1 from the loaded sheets.

export function generateEnemyTextures(_scene: Phaser.Scene): void {
  // No-op: textures loaded via BootScene.preload()
}
