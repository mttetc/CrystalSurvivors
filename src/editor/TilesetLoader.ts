import { TILESETS, TILESETS_ANIMATED } from '../assets';
import type { TilesetInfo } from './types';

export class TilesetLoader {
  tilesets: Map<string, TilesetInfo> = new Map();

  async loadAll(): Promise<void> {
    const entries: [string, string, number][] = [];

    for (const [key, path] of Object.entries(TILESETS)) {
      entries.push([key, path, 16]);
    }
    for (const [key, path] of Object.entries(TILESETS_ANIMATED)) {
      const frameSize = key === 'anim_quicksand' ? 32 : 16;
      entries.push([key, path, frameSize]);
    }

    await Promise.all(
      entries.map(([key, path, frameSize]) => this.loadOne(key, path, frameSize)),
    );
  }

  private loadOne(key: string, path: string, frameSize: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const cols = Math.floor(img.width / frameSize);
        const rows = Math.floor(img.height / frameSize);
        this.tilesets.set(key, {
          key,
          image: img,
          frameWidth: frameSize,
          frameHeight: frameSize,
          cols,
          rows,
          totalFrames: cols * rows,
        });
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to load tileset: ${key} (${path})`);
        resolve(); // Don't block on missing tilesets
      };
      img.src = path;
    });
  }

  get(key: string): TilesetInfo | undefined {
    return this.tilesets.get(key);
  }

  getAll(): TilesetInfo[] {
    return Array.from(this.tilesets.values());
  }

  keys(): string[] {
    return Array.from(this.tilesets.keys());
  }
}
