// ─── Tile Map Editor Types ──────────────────────────────────────────────────

export interface TileEntry {
  t: string;   // tileset key (e.g. 'tileset_field')
  f: number;   // frame index (start frame for animated tiles)
  af?: number; // animation frame count (undefined = static tile)
  fps?: number; // animation speed in frames per second (default 6)
}

export interface MapLayer {
  name: 'ground' | 'decorations' | 'collision';
  data: (TileEntry | null)[];
}

export interface MapFile {
  version: 1;
  width: number;
  height: number;
  tileSize: number;
  layers: MapLayer[];
  collision: number[];
  spawn: { x: number; y: number };
}

export interface TilesetInfo {
  key: string;
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  cols: number;
  rows: number;
  totalFrames: number;
}

export type ToolType = 'brush' | 'eraser' | 'fill' | 'rect';
export type LayerName = 'ground' | 'decorations' | 'collision';

export interface EditorState {
  mapWidth: number;
  mapHeight: number;
  layers: MapLayer[];
  collision: Uint8Array;
  spawn: { x: number; y: number };
  activeLayerIndex: number;
  layerVisibility: boolean[];
  selectedTool: ToolType;
  selectedTile: TileEntry | null;
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  dirty: boolean;
}

export interface Command {
  execute(): void;
  undo(): void;
}

export interface Tool {
  name: ToolType;
  onMouseDown(tileX: number, tileY: number): void;
  onMouseMove(tileX: number, tileY: number): void;
  onMouseUp(tileX: number, tileY: number): void;
}
