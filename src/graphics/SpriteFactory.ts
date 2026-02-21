import { generatePlayerTextures } from './PlayerSprites';
import { generateEnemyTextures } from './EnemySprites';
import { generateProjectileTextures } from './ProjectileSprites';
import { generatePickupTextures } from './PickupSprites';
import { generateUITextures, generateEnvironmentTextures } from './UISprites';

export function generateAllTextures(scene: Phaser.Scene): void {
  generatePlayerTextures(scene);
  generateEnemyTextures(scene);
  generateProjectileTextures(scene);
  generatePickupTextures(scene);
  generateUITextures(scene);
  generateEnvironmentTextures(scene);
}
