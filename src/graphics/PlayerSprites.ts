// Player textures are now loaded as PNG spritesheets in BootScene.preload().
// The Ninja Adventure Walk.png files use the same 4 cols × 4 rows layout
// (DOWN/LEFT/RIGHT/UP × 4 frames) that the game's animation system expects.
// No procedural generation needed.

export function generatePlayerTextures(_scene: Phaser.Scene): void {
  // No-op: textures loaded via BootScene.preload()
}
