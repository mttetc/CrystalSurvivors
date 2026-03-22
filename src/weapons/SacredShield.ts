import Phaser from 'phaser';
import { WeaponId, KNOCKBACK_VELOCITY } from '../constants';
import { MeleeWeapon, MeleeConfig } from './MeleeWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { playImpactFX, playSlashFX } from './fxHelper';

export class SacredShield extends MeleeWeapon {
  private bashSide = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.SACRED_SHIELD);
  }

  protected getMeleeConfig(): MeleeConfig {
    return {
      arcHalf: 0.5,
      extraRadiusOffset: 0,
      slashFX: '',          // SacredShield handles its own FX in onSwing
      slashScale: 0,
      slashTint: 0,
      slashDuration: 250,
    };
  }

  protected getAutoSwingAngle(): number {
    this.bashSide++;
    return (this.bashSide % 4) * (Math.PI / 2);
  }

  protected onSwing(angle: number, _sp: { x: number; y: number }, _swingIndex: number, hitRadius: number): void {
    const meleeScale = this.getMeleeScale();
    const visualRadius = hitRadius * meleeScale;
    const bashDist = visualRadius * 0.7;
    const endX = this.player.x + Math.cos(angle) * bashDist;
    const endY = this.player.y + Math.sin(angle) * bashDist;

    // Shield bash slash FX at bash point
    const fxScale = this.getMeleeFXScale();
    playSlashFX(this.scene, endX, endY, angle, 'fx_slash', fxScale * 1.8, 0xFFDD00, 250);

    // Shield impact FX using golden magic shield sprite
    playImpactFX(this.scene, endX, endY, angle, 'fx_shield_yellow', fxScale * 2.5, 0xFFDD00, 250);
  }

  protected onHit(enemy: Enemy, angle: number): void {
    const pushAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
    enemy.setVelocity(
      Math.cos(pushAngle) * KNOCKBACK_VELOCITY * 1.2,
      Math.sin(pushAngle) * KNOCKBACK_VELOCITY * 1.2,
    );
  }
}
