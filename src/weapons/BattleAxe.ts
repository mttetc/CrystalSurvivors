import Phaser from 'phaser';
import { WeaponId } from '../constants';
import { MeleeWeapon, MeleeConfig } from './MeleeWeapon';
import { Player } from '../entities/Player';

export class BattleAxe extends MeleeWeapon {
  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, WeaponId.BATTLE_AXE);
  }

  protected getMeleeConfig(): MeleeConfig {
    return {
      arcHalf: 0.6,
      extraRadiusOffset: 10,
      slashFX: 'fx_circular_slash',
      slashScale: 2,
      slashTint: 0xFF4400,
      slashDuration: 350,
    };
  }
}
