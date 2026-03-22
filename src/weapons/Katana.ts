import Phaser from 'phaser';
import { WeaponId } from '../constants';
import { MeleeWeapon, MeleeConfig } from './MeleeWeapon';
import { Player } from '../entities/Player';

export class Katana extends MeleeWeapon {
  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.KATANA);
  }

  protected getMeleeConfig(): MeleeConfig {
    return {
      arcHalf: 0.4,
      extraRadiusOffset: 0,
      slashFX: 'fx_slash_curved',
      slashScale: 1.8,
      slashTint: 0x44FFCC,
      slashDuration: 200,
    };
  }
}
