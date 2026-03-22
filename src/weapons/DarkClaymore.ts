import Phaser from 'phaser';
import { WeaponId } from '../constants';
import { MeleeWeapon, MeleeConfig } from './MeleeWeapon';
import { Player } from '../entities/Player';

export class DarkClaymore extends MeleeWeapon {
  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.DARK_CLAYMORE);
  }

  protected getMeleeConfig(): MeleeConfig {
    return {
      arcHalf: 0.5,
      extraRadiusOffset: 5,
      slashFX: 'fx_slash_double_curved',
      slashScale: 2,
      slashTint: 0xFF2222,
      slashDuration: 300,
    };
  }
}
