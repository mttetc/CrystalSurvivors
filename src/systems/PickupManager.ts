import Phaser from 'phaser';
import {
  EVENTS, GEM_SMALL_CHANCE, GEM_MEDIUM_CHANCE, HEALTH_DROP_CHANCE,
} from '../constants';
import { Player } from '../entities/Player';
import { Pickup, PickupType } from '../entities/Pickup';
import { XPManager } from './XPManager';
import { EventBus } from './EventBus';

export class PickupManager {
  private scene: Phaser.Scene;
  private player: Player;
  private pickupGroup: Phaser.Physics.Arcade.Group;
  private xpManager: XPManager;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    pickupGroup: Phaser.Physics.Arcade.Group,
    xpManager: XPManager,
  ) {
    this.scene = scene;
    this.player = player;
    this.pickupGroup = pickupGroup;
    this.xpManager = xpManager;

    // Listen for enemy kills to spawn pickups
    EventBus.on(EVENTS.ENEMY_KILLED, this.onEnemyKilled, this);

    // Setup collection overlap
    this.scene.physics.add.overlap(
      player,
      pickupGroup,
      (_playerObj, pickupObj) => {
        const pickup = pickupObj as Pickup;
        if (!pickup.active) return;
        this.collectPickup(pickup);
      },
    );
  }

  private onEnemyKilled(_type: string, x: number, y: number, _xpValue: number, _isBoss: boolean): void {
    // Determine gem type
    const roll = Math.random();
    let type: PickupType;

    if (roll < HEALTH_DROP_CHANCE) {
      type = PickupType.HEALTH;
    } else if (roll < HEALTH_DROP_CHANCE + GEM_SMALL_CHANCE * (1 - HEALTH_DROP_CHANCE)) {
      type = PickupType.GEM_SMALL;
    } else if (roll < HEALTH_DROP_CHANCE + (GEM_SMALL_CHANCE + GEM_MEDIUM_CHANCE) * (1 - HEALTH_DROP_CHANCE)) {
      type = PickupType.GEM_MEDIUM;
    } else {
      type = PickupType.GEM_LARGE;
    }

    const pickup = this.pickupGroup.getFirstDead(false) as Pickup | null;
    if (pickup) {
      pickup.body!.enable = true;
      pickup.spawn(x, y, type);
    }
  }

  public update(_time: number, _delta: number): void {
    const pickupRadius = this.player.getEffectivePickupRadius();

    const pickups = this.pickupGroup.getChildren() as Pickup[];
    for (const pickup of pickups) {
      if (!pickup.active) continue;

      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        pickup.x, pickup.y,
      );

      // Magnet attraction
      if (dist < pickupRadius && !pickup.isBeingAttracted) {
        pickup.attractTo(this.player.x, this.player.y, 250);
      } else if (pickup.isBeingAttracted) {
        pickup.attractTo(this.player.x, this.player.y, 250);
      }
    }
  }

  private collectPickup(pickup: Pickup): void {
    if (pickup.pickupType === PickupType.HEALTH) {
      this.player.heal(pickup.value);
    } else {
      this.xpManager.addXP(pickup.value);
    }
    pickup.collect();
  }

  public destroy(): void {
    EventBus.off(EVENTS.ENEMY_KILLED, this.onEnemyKilled, this);
  }
}
