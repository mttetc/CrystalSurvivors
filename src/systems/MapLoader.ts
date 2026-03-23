import Phaser from 'phaser';
import { SPRITE_SCALE, DEPTHS } from '../constants';
import type { MapFile, TileEntry } from '../editor/types';

// Counter for unique anim keys
let animKeyCounter = 0;

export class MapLoader {
  static async loadMap(scene: Phaser.Scene, key: string): Promise<MapFile> {
    const json = scene.cache.json.get(key);
    if (!json) throw new Error(`Map JSON not found in cache: ${key}`);
    return json as MapFile;
  }

  static renderGround(scene: Phaser.Scene, mapData: MapFile): void {
    const scaledTile = mapData.tileSize * SPRITE_SCALE;
    const layer = mapData.layers.find(l => l.name === 'ground');
    if (!layer) return;

    for (let row = 0; row < mapData.height; row++) {
      for (let col = 0; col < mapData.width; col++) {
        const tile = layer.data[row * mapData.width + col] as TileEntry | null;
        if (!tile) continue;

        const x = col * scaledTile + scaledTile / 2;
        const y = row * scaledTile + scaledTile / 2;

        this.placeTile(scene, tile, x, y, DEPTHS.GROUND);
      }
    }
  }

  static renderDecorations(scene: Phaser.Scene, mapData: MapFile): void {
    const scaledTile = mapData.tileSize * SPRITE_SCALE;
    const layer = mapData.layers.find(l => l.name === 'decorations');
    if (!layer) return;

    for (let row = 0; row < mapData.height; row++) {
      for (let col = 0; col < mapData.width; col++) {
        const tile = layer.data[row * mapData.width + col] as TileEntry | null;
        if (!tile) continue;

        const x = col * scaledTile + scaledTile / 2;
        const y = row * scaledTile + scaledTile / 2;

        this.placeTile(scene, tile, x, y, DEPTHS.GROUND + 2);
      }
    }
  }

  private static placeTile(
    scene: Phaser.Scene,
    tile: TileEntry,
    x: number,
    y: number,
    depth: number,
  ): void {
    if (tile.af && tile.af > 1) {
      // Animated tile: use sprite with animation
      const animKey = `maptile_${tile.t}_${tile.f}_${tile.af}_${tile.fps || 6}`;

      // Create animation if it doesn't exist yet
      if (!scene.anims.exists(animKey)) {
        const frames: Phaser.Types.Animations.AnimationFrame[] = [];
        for (let i = 0; i < tile.af; i++) {
          frames.push({ key: tile.t, frame: tile.f + i });
        }
        scene.anims.create({
          key: animKey,
          frames,
          frameRate: tile.fps || 6,
          repeat: -1,
        });
      }

      const sprite = scene.add.sprite(x, y, tile.t, tile.f);
      sprite.setScale(SPRITE_SCALE);
      sprite.setDepth(depth);
      sprite.play(animKey);
    } else {
      // Static tile
      const img = scene.add.image(x, y, tile.t, tile.f);
      img.setScale(SPRITE_SCALE);
      img.setDepth(depth);
    }
  }

  static createCollision(
    scene: Phaser.Scene,
    mapData: MapFile,
  ): Phaser.Physics.Arcade.StaticGroup {
    const scaledTile = mapData.tileSize * SPRITE_SCALE;
    const group = scene.physics.add.staticGroup();

    // Merge adjacent blocking tiles into rectangles for performance
    const visited = new Uint8Array(mapData.width * mapData.height);
    const collision = mapData.collision;

    for (let row = 0; row < mapData.height; row++) {
      for (let col = 0; col < mapData.width; col++) {
        const idx = row * mapData.width + col;
        if (!collision[idx] || visited[idx]) continue;

        // Find max width of rectangle starting here
        let maxW = 0;
        while (col + maxW < mapData.width &&
               collision[row * mapData.width + col + maxW] &&
               !visited[row * mapData.width + col + maxW]) {
          maxW++;
        }

        // Find max height for that width
        let maxH = 1;
        outer:
        for (let r = row + 1; r < mapData.height; r++) {
          for (let c = col; c < col + maxW; c++) {
            const i = r * mapData.width + c;
            if (!collision[i] || visited[i]) break outer;
          }
          maxH++;
        }

        // Mark visited
        for (let r = row; r < row + maxH; r++) {
          for (let c = col; c < col + maxW; c++) {
            visited[r * mapData.width + c] = 1;
          }
        }

        // Create one static body for this rectangle
        const x = col * scaledTile + (maxW * scaledTile) / 2;
        const y = row * scaledTile + (maxH * scaledTile) / 2;
        const rect = scene.add.rectangle(x, y, maxW * scaledTile, maxH * scaledTile);
        rect.setVisible(false);
        group.add(rect);
        (rect.body as Phaser.Physics.Arcade.StaticBody).setSize(maxW * scaledTile, maxH * scaledTile);
        (rect.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      }
    }

    return group;
  }

  static getSpawnPoint(mapData: MapFile): { x: number; y: number } {
    const scaledTile = mapData.tileSize * SPRITE_SCALE;
    return {
      x: mapData.spawn.x * scaledTile + scaledTile / 2,
      y: mapData.spawn.y * scaledTile + scaledTile / 2,
    };
  }

  static getWorldSize(mapData: MapFile): { width: number; height: number } {
    const scaledTile = mapData.tileSize * SPRITE_SCALE;
    return {
      width: mapData.width * scaledTile,
      height: mapData.height * scaledTile,
    };
  }
}
