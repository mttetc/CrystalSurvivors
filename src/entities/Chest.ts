import Phaser from 'phaser';
import { DEPTHS, Rarity } from '../constants';

export class Chest extends Phaser.Physics.Arcade.Sprite {
  public chestRarity: Rarity = Rarity.COMMON;
  public isOpened = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'chest_common');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.PICKUPS + 1);
    this.setActive(false);
    this.setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).setImmovable(true);
  }

  public spawn(x: number, y: number, rarity: Rarity): void {
    this.chestRarity = rarity;
    this.isOpened = false;

    const textureKey = `chest_${rarity}`;
    this.setTexture(textureKey);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body!.enable = true;
    this.setAlpha(1);
  }

  public open(): void {
    if (this.isOpened) return;
    this.isOpened = true;

    // Flash and fade
    this.setTintFill(0xFFFFFF);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 10,
      duration: 400,
      onComplete: () => {
        this.setActive(false);
        this.setVisible(false);
        this.body!.enable = false;
      },
    });
  }

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.body!.enable = false;
  }
}
