import Phaser from 'phaser';
import { DEPTHS } from '../constants';

export class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
  public damage = 0;
  public lifetime = 0;
  public maxLifetime = 3000;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.PROJECTILES);
    this.setActive(false);
    this.setVisible(false);
  }

  public fire(x: number, y: number, vx: number, vy: number, damage: number, texture = 'enemy_bullet'): void {
    this.setTexture(texture);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body!.enable = true;
    this.setVelocity(vx, vy);
    this.damage = damage;
    this.lifetime = 0;
    this.setRotation(Math.atan2(vy, vx));
  }

  update(_time: number, delta: number): void {
    if (!this.active) return;
    this.lifetime += delta;
    if (this.lifetime >= this.maxLifetime) {
      this.deactivate();
      return;
    }
    if (this.x < -50 || this.x > 3050 || this.y < -50 || this.y > 3050) {
      this.deactivate();
    }
  }

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.body!.enable = false;
  }
}
