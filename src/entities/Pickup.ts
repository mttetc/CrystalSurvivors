import Phaser from 'phaser';
import { DEPTHS, GEM_SMALL_XP, GEM_MEDIUM_XP, GEM_LARGE_XP, HEALTH_DROP_AMOUNT } from '../constants';

export enum PickupType {
  GEM_SMALL = 'gem_small',
  GEM_MEDIUM = 'gem_medium',
  GEM_LARGE = 'gem_large',
  HEALTH = 'health_heart',
  MAGNET = 'magnet_pickup',
}

const PICKUP_VALUES: Record<PickupType, number> = {
  [PickupType.GEM_SMALL]: GEM_SMALL_XP,
  [PickupType.GEM_MEDIUM]: GEM_MEDIUM_XP,
  [PickupType.GEM_LARGE]: GEM_LARGE_XP,
  [PickupType.HEALTH]: HEALTH_DROP_AMOUNT,
  [PickupType.MAGNET]: 0, // no direct value, triggers collect-all
};

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  public pickupType: PickupType = PickupType.GEM_SMALL;
  public value = 1;
  public isBeingAttracted = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'gem_small');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.PICKUPS);
    this.setActive(false);
    this.setVisible(false);
  }

  public spawn(x: number, y: number, type: PickupType): void {
    this.pickupType = type;
    this.value = PICKUP_VALUES[type];
    this.setTexture(type);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body!.enable = true;
    this.isBeingAttracted = false;

    // Small scatter on spawn
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 15;
    this.setVelocity(
      Math.cos(angle) * dist * 3,
      Math.sin(angle) * dist * 3,
    );

    // Slow down
    this.scene.time.delayedCall(200, () => {
      if (this.active) this.setVelocity(0, 0);
    });
  }

  public attractTo(x: number, y: number, speed: number): void {
    this.isBeingAttracted = true;
    const dx = x - this.x;
    const dy = y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;
    this.setVelocity((dx / dist) * speed, (dy / dist) * speed);
  }

  public collect(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.body!.enable = false;
  }
}
