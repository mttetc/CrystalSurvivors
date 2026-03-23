import type { EditorState, MapFile, MapLayer, TileEntry } from './types';

export class MapData {
  static create(width: number, height: number): EditorState {
    const size = width * height;
    const layers: MapLayer[] = [
      { name: 'ground', data: new Array(size).fill(null) },
      { name: 'decorations', data: new Array(size).fill(null) },
      { name: 'collision', data: new Array(size).fill(null) },
    ];

    return {
      mapWidth: width,
      mapHeight: height,
      layers,
      collision: new Uint8Array(size),
      spawn: { x: Math.floor(width / 2), y: Math.floor(height / 2) },
      activeLayerIndex: 0,
      layerVisibility: [true, true, true],
      selectedTool: 'brush',
      selectedTile: null,
      zoom: 2,
      panX: 0,
      panY: 0,
      showGrid: true,
      dirty: false,
    };
  }

  static index(state: EditorState, x: number, y: number): number {
    return y * state.mapWidth + x;
  }

  static inBounds(state: EditorState, x: number, y: number): boolean {
    return x >= 0 && x < state.mapWidth && y >= 0 && y < state.mapHeight;
  }

  static getTile(state: EditorState, layerIndex: number, x: number, y: number): TileEntry | null {
    if (!this.inBounds(state, x, y)) return null;
    return state.layers[layerIndex].data[this.index(state, x, y)];
  }

  static setTile(state: EditorState, layerIndex: number, x: number, y: number, tile: TileEntry | null): void {
    if (!this.inBounds(state, x, y)) return;
    state.layers[layerIndex].data[this.index(state, x, y)] = tile;
    state.dirty = true;
  }

  static getCollision(state: EditorState, x: number, y: number): number {
    if (!this.inBounds(state, x, y)) return 0;
    return state.collision[this.index(state, x, y)];
  }

  static setCollision(state: EditorState, x: number, y: number, val: number): void {
    if (!this.inBounds(state, x, y)) return;
    state.collision[this.index(state, x, y)] = val;
    state.dirty = true;
  }

  static exportJSON(state: EditorState): string {
    const mapFile: MapFile = {
      version: 1,
      width: state.mapWidth,
      height: state.mapHeight,
      tileSize: 16,
      layers: [
        { name: 'ground', data: [...state.layers[0].data] },
        { name: 'decorations', data: [...state.layers[1].data] },
        { name: 'collision', data: [...state.layers[2].data] },
      ],
      collision: Array.from(state.collision),
      spawn: { ...state.spawn },
    };
    return JSON.stringify(mapFile);
  }

  static importJSON(json: string): EditorState {
    const data = JSON.parse(json) as MapFile;
    if (data.version !== 1) throw new Error(`Unsupported map version: ${data.version}`);
    if (!data.width || !data.height) throw new Error('Invalid map dimensions');

    const size = data.width * data.height;
    const state = this.create(data.width, data.height);

    for (let i = 0; i < data.layers.length; i++) {
      const srcLayer = data.layers[i];
      const targetIndex = state.layers.findIndex(l => l.name === srcLayer.name);
      if (targetIndex === -1) continue;
      for (let j = 0; j < Math.min(srcLayer.data.length, size); j++) {
        state.layers[targetIndex].data[j] = srcLayer.data[j];
      }
    }

    if (data.collision) {
      for (let j = 0; j < Math.min(data.collision.length, size); j++) {
        state.collision[j] = data.collision[j];
      }
    }

    if (data.spawn) {
      state.spawn = { ...data.spawn };
    }

    state.dirty = false;
    return state;
  }
}
