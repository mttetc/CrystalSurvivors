import Phaser from 'phaser';
import { WeaponId, EVENTS } from '../constants';
import { BaseWeapon } from '../weapons/BaseWeapon';
import { HuntersBow } from '../weapons/HuntersBow';
import { SacredShield } from '../weapons/SacredShield';
import { FireRod } from '../weapons/FireRod';
import { DarkClaymore } from '../weapons/DarkClaymore';
import { WarHarp } from '../weapons/WarHarp';
import { Shuriken } from '../weapons/Shuriken';
import { Katana } from '../weapons/Katana';
import { BattleAxe } from '../weapons/BattleAxe';
import { WarLance } from '../weapons/WarLance';
import { FlaskThrow } from '../weapons/FlaskThrow';
import { HolyRod } from '../weapons/HolyRod';
import { EtherRod } from '../weapons/EtherRod';
import { IronFists } from '../weapons/IronFists';
import { ChronoRod } from '../weapons/ChronoRod';
import { EarthRod } from '../weapons/EarthRod';
import { Player } from '../entities/Player';
import { EventBus } from './EventBus';

export class WeaponManager {
  private scene: Phaser.Scene;
  private player: Player;
  private weapons: Map<WeaponId, BaseWeapon> = new Map();
  private projectileGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, player: Player, projectileGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.player = player;
    this.projectileGroup = projectileGroup;

    // No default weapon - starting weapon comes from job selection

    EventBus.on(EVENTS.WEAPON_ADDED, (id: WeaponId) => {
      this.addWeapon(id);
    });
    EventBus.on(EVENTS.RESET_WEAPON_COOLDOWNS, () => {
      this.resetAllCooldowns();
    });
  }

  private addWeapon(id: WeaponId): void {
    if (this.weapons.has(id)) return;

    let weapon: BaseWeapon;
    switch (id) {
      case WeaponId.HUNTERS_BOW:
        weapon = new HuntersBow(this.scene, this.player, this.projectileGroup);
        break;
      case WeaponId.SACRED_SHIELD:
        weapon = new SacredShield(this.scene, this.player);
        break;
      case WeaponId.FIRE_ROD:
        weapon = new FireRod(this.scene, this.player, this.projectileGroup);
        break;
      case WeaponId.DARK_CLAYMORE:
        weapon = new DarkClaymore(this.scene, this.player);
        break;
      case WeaponId.WAR_HARP:
        weapon = new WarHarp(this.scene, this.player);
        break;
      case WeaponId.SHURIKEN:
        weapon = new Shuriken(this.scene, this.player, this.projectileGroup);
        break;
      case WeaponId.KATANA:
        weapon = new Katana(this.scene, this.player);
        break;
      case WeaponId.BATTLE_AXE:
        weapon = new BattleAxe(this.scene, this.player);
        break;
      case WeaponId.WAR_LANCE:
        weapon = new WarLance(this.scene, this.player, this.projectileGroup);
        break;
      case WeaponId.FLASK_THROW:
        weapon = new FlaskThrow(this.scene, this.player);
        break;
      case WeaponId.HOLY_ROD:
        weapon = new HolyRod(this.scene, this.player, this.projectileGroup);
        break;
      case WeaponId.ETHER_ROD:
        weapon = new EtherRod(this.scene, this.player, this.projectileGroup);
        break;
      case WeaponId.IRON_FISTS:
        weapon = new IronFists(this.scene, this.player);
        break;
      case WeaponId.CHRONO_ROD:
        weapon = new ChronoRod(this.scene, this.player);
        break;
      case WeaponId.EARTH_ROD:
        weapon = new EarthRod(this.scene, this.player);
        break;
      default:
        return;
    }
    this.weapons.set(id, weapon);
  }

  public update(time: number, delta: number, enemies: Phaser.Physics.Arcade.Group): void {
    for (const [id, weapon] of this.weapons) {
      // Only update if player has this weapon
      if (this.player.getWeapon(id)) {
        weapon.update(time, delta, enemies);
      }
    }
  }

  /** Reset all weapon cooldowns so they fire immediately */
  public resetAllCooldowns(): void {
    for (const [id, weapon] of this.weapons) {
      if (this.player.getWeapon(id)) {
        weapon.resetCooldown();
      }
    }
  }

  public destroy(): void {
    for (const weapon of this.weapons.values()) {
      if ('destroy' in weapon && typeof (weapon as any).destroy === 'function') {
        (weapon as any).destroy();
      }
    }
    this.weapons.clear();
  }
}
