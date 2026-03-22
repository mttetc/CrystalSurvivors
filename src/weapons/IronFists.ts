import Phaser from 'phaser';
import { WeaponId } from '../constants';
import { MeleeWeapon, MeleeConfig } from './MeleeWeapon';
import { Player } from '../entities/Player';
import { playImpactFX } from './fxHelper';

export class IronFists extends MeleeWeapon {
  private lastPunchSide = 0;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.IRON_FISTS);
  }

  protected getMeleeConfig(): MeleeConfig {
    return {
      arcHalf: 0.45,
      extraRadiusOffset: 0,
      slashFX: '',          // IronFists uses impact FX instead, handled in onSwing
      slashScale: 0,
      slashTint: 0,
      slashDuration: 200,
    };
  }

  protected getSwingAngle(baseAngle: number, swingIndex: number): number {
    this.lastPunchSide = (this.lastPunchSide + 1) % 2;
    const sideOffset = (this.lastPunchSide === 0 ? -0.15 : 0.15) + swingIndex * Math.PI;
    return baseAngle + sideOffset;
  }

  protected onSwing(angle: number, _sp: { x: number; y: number }, _swingIndex: number, hitRadius: number): void {
    const meleeScale = this.getMeleeScale();
    const visualRadius = hitRadius * meleeScale;
    const sp = this.getSpawnPoint(angle);
    const endX = sp.x + Math.cos(angle) * visualRadius;
    const endY = sp.y + Math.sin(angle) * visualRadius;

    // Alternate claw FX: single claw for left punch, double claw for right punch
    const clawFX = this.lastPunchSide === 0 ? 'fx_claw' : 'fx_claw_double';
    playImpactFX(this.scene, endX, endY, angle, clawFX, this.getMeleeFXScale() * 1.5, 0xFFDD00, 200);
  }
}
