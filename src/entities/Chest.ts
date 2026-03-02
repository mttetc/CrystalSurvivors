import Phaser from 'phaser';
import { DEPTHS, Rarity, SPRITE_SCALE } from '../constants';

// Map rarity to texture key and tint colour
const CHEST_CONFIG: Record<Rarity, { texture: string; tint: number }> = {
  [Rarity.COMMON]:    { texture: 'chest_small', tint: 0xFFFFFF },
  [Rarity.RARE]:      { texture: 'chest_small', tint: 0x4488FF },
  [Rarity.EPIC]:      { texture: 'chest_big',   tint: 0xBB44FF },
  [Rarity.LEGENDARY]: { texture: 'chest_big',   tint: 0xFFDD00 },
  [Rarity.MYTHIC]:    { texture: 'chest_big',   tint: 0xFF4444 },
};

export class Chest extends Phaser.Physics.Arcade.Sprite {
  public chestRarity: Rarity = Rarity.COMMON;
  public isOpened = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'chest_small', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.PICKUPS + 1);
    this.setScale(SPRITE_SCALE);
    this.setActive(false);
    this.setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).setImmovable(true);
  }

  public spawn(x: number, y: number, rarity: Rarity): void {
    this.chestRarity = rarity;
    this.isOpened = false;

    const cfg = CHEST_CONFIG[rarity] ?? CHEST_CONFIG[Rarity.COMMON];
    this.setTexture(cfg.texture, 0); // frame 0 = closed
    this.setTint(cfg.tint);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body!.enable = true;
    this.setAlpha(1);
  }

  public open(): void {
    if (this.isOpened) return;
    this.isOpened = true;

    // Show open frame
    this.setFrame(1);

    // Flash and fade
    this.setTintFill(0xFFFFFF);
    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        const cfg = CHEST_CONFIG[this.chestRarity] ?? CHEST_CONFIG[Rarity.COMMON];
        this.setTint(cfg.tint);
      }
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
