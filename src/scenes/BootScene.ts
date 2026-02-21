import Phaser from 'phaser';
import { SCENES } from '../constants';
import { generateAllTextures } from '../graphics/SpriteFactory';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create(): void {
    generateAllTextures(this);
    this.scene.start(SCENES.TITLE);
  }
}
