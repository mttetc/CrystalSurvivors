import Phaser from 'phaser';
import {
  EVENTS, GEM_SMALL_CHANCE, GEM_MEDIUM_CHANCE, HEALTH_DROP_CHANCE,
  WORLD_WIDTH, WORLD_HEIGHT, SPRITE_SCALE,
} from '../constants';
import { Player } from '../entities/Player';
import { Pickup, PickupType } from '../entities/Pickup';
import { XPManager } from './XPManager';
import { EventBus } from './EventBus';

// Magnet spawns on the map periodically
const MAGNET_SPAWN_INTERVAL = 45000; // every 45 seconds
const MAGNET_MAX_ON_MAP = 2;

export class PickupManager {
  private scene: Phaser.Scene;
  private player: Player;
  private pickupGroup: Phaser.Physics.Arcade.Group;
  private xpManager: XPManager;
  private magnetSpawnTimer = 15000; // first magnet at 30s (timer starts at 15s)
  private magnetsOnMap = 0;

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

  public update(_time: number, delta: number): void {
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

    // Spawn magnet pickups periodically on the map
    this.magnetSpawnTimer += delta;
    if (this.magnetSpawnTimer >= MAGNET_SPAWN_INTERVAL && this.magnetsOnMap < MAGNET_MAX_ON_MAP) {
      this.magnetSpawnTimer = 0;
      this.spawnMagnetOnMap();
    }
  }

  private spawnMagnetOnMap(): void {
    const pickup = this.pickupGroup.getFirstDead(false) as Pickup | null;
    if (!pickup) return;

    // Spawn near the player but at a random offset (within view)
    const angle = Math.random() * Math.PI * 2;
    const dist = 150 + Math.random() * 200;
    const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 50, WORLD_WIDTH - 50);
    const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 50, WORLD_HEIGHT - 50);

    pickup.body!.enable = true;
    pickup.spawn(x, y, PickupType.MAGNET);
    this.magnetsOnMap++;
  }

  private collectPickup(pickup: Pickup): void {
    if (pickup.pickupType === PickupType.MAGNET) {
      // Magnet: attract ALL active pickups on the map to the player
      this.magnetsOnMap = Math.max(0, this.magnetsOnMap - 1);
      const allPickups = this.pickupGroup.getChildren() as Pickup[];
      for (const p of allPickups) {
        if (p.active && p !== pickup) {
          p.attractTo(this.player.x, this.player.y, 400);
        }
      }
      pickup.collect();
      return;
    }
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
