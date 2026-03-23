import type { EditorState, TileEntry, Command } from './types';
import { MapData } from './MapData';
import type { History } from './History';
import type { EditorCanvas } from './Canvas';

interface TileChange {
  layerIndex: number;
  index: number;
  oldTile: TileEntry | null;
  newTile: TileEntry | null;
}

interface CollisionChange {
  index: number;
  oldVal: number;
  newVal: number;
}

class PaintCommand implements Command {
  constructor(
    private state: EditorState,
    private tileChanges: TileChange[],
    private collisionChanges: CollisionChange[],
  ) {}

  execute(): void {
    for (const c of this.tileChanges) {
      this.state.layers[c.layerIndex].data[c.index] = c.newTile;
    }
    for (const c of this.collisionChanges) {
      this.state.collision[c.index] = c.newVal;
    }
  }

  undo(): void {
    for (const c of this.tileChanges) {
      this.state.layers[c.layerIndex].data[c.index] = c.oldTile;
    }
    for (const c of this.collisionChanges) {
      this.state.collision[c.index] = c.oldVal;
    }
  }
}

export class ToolManager {
  private state: EditorState;
  private history: History;
  private canvas: EditorCanvas;

  // Stroke accumulator
  private tileChanges: TileChange[] = [];
  private collisionChanges: CollisionChange[] = [];
  private visited = new Set<number>();
  private lastTileX = -1;
  private lastTileY = -1;
  private isDrawing = false;

  // Rect tool state
  private rectStartX = -1;
  private rectStartY = -1;

  constructor(state: EditorState, history: History, canvas: EditorCanvas) {
    this.state = state;
    this.history = history;
    this.canvas = canvas;
  }

  setState(state: EditorState): void {
    this.state = state;
  }

  onMouseDown(x: number, y: number): void {
    if (!MapData.inBounds(this.state, x, y)) return;

    this.tileChanges = [];
    this.collisionChanges = [];
    this.visited.clear();
    this.isDrawing = true;

    const tool = this.state.selectedTool;

    if (tool === 'brush' || tool === 'eraser') {
      this.applyBrush(x, y);
      this.lastTileX = x;
      this.lastTileY = y;
    } else if (tool === 'fill') {
      this.applyFill(x, y);
      this.commitStroke();
    } else if (tool === 'rect') {
      this.rectStartX = x;
      this.rectStartY = y;
    }
  }

  onMouseMove(x: number, y: number): void {
    if (!this.isDrawing) return;
    if (!MapData.inBounds(this.state, x, y)) return;

    const tool = this.state.selectedTool;

    if (tool === 'brush' || tool === 'eraser') {
      // Bresenham interpolation
      this.bresenham(this.lastTileX, this.lastTileY, x, y, (tx, ty) => {
        this.applyBrush(tx, ty);
      });
      this.lastTileX = x;
      this.lastTileY = y;
    }
    // rect: preview handled by canvas
  }

  onMouseUp(x: number, y: number): void {
    if (!this.isDrawing) return;

    const tool = this.state.selectedTool;

    if (tool === 'rect' && this.rectStartX >= 0) {
      const x1 = Math.max(0, Math.min(this.rectStartX, x));
      const y1 = Math.max(0, Math.min(this.rectStartY, y));
      const x2 = Math.min(this.state.mapWidth - 1, Math.max(this.rectStartX, x));
      const y2 = Math.min(this.state.mapHeight - 1, Math.max(this.rectStartY, y));

      for (let row = y1; row <= y2; row++) {
        for (let col = x1; col <= x2; col++) {
          this.applyBrush(col, row);
        }
      }
      this.rectStartX = -1;
      this.rectStartY = -1;
    }

    this.commitStroke();
    this.isDrawing = false;
  }

  private applyBrush(x: number, y: number): void {
    if (!MapData.inBounds(this.state, x, y)) return;

    const idx = MapData.index(this.state, x, y);
    if (this.visited.has(idx)) return;
    this.visited.add(idx);

    const layerIdx = this.state.activeLayerIndex;
    const isCollisionLayer = layerIdx === 2;
    const isEraser = this.state.selectedTool === 'eraser';

    if (isCollisionLayer) {
      // Toggle collision
      const oldVal = this.state.collision[idx];
      const newVal = isEraser ? 0 : 1;
      if (oldVal !== newVal) {
        this.collisionChanges.push({ index: idx, oldVal, newVal });
        this.state.collision[idx] = newVal;
      }
    } else {
      // Paint tile
      const oldTile = this.state.layers[layerIdx].data[idx];
      const newTile = isEraser ? null : this.state.selectedTile;
      if (!this.tilesEqual(oldTile, newTile)) {
        this.tileChanges.push({
          layerIndex: layerIdx,
          index: idx,
          oldTile: oldTile ? { ...oldTile } : null,
          newTile: newTile ? { ...newTile } : null,
        });
        this.state.layers[layerIdx].data[idx] = newTile ? { ...newTile } : null;
      }
    }
  }

  private applyFill(startX: number, startY: number): void {
    const layerIdx = this.state.activeLayerIndex;
    const isCollisionLayer = layerIdx === 2;

    if (isCollisionLayer) {
      // Flood fill collision
      const targetVal = this.state.collision[MapData.index(this.state, startX, startY)];
      const fillVal = targetVal === 0 ? 1 : 0;
      if (targetVal === fillVal) return;

      const queue: [number, number][] = [[startX, startY]];
      const visited = new Set<number>();

      while (queue.length > 0) {
        const [cx, cy] = queue.shift()!;
        if (!MapData.inBounds(this.state, cx, cy)) continue;
        const idx = MapData.index(this.state, cx, cy);
        if (visited.has(idx)) continue;
        if (this.state.collision[idx] !== targetVal) continue;
        visited.add(idx);

        this.collisionChanges.push({ index: idx, oldVal: targetVal, newVal: fillVal });
        this.state.collision[idx] = fillVal;

        queue.push([cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]);
      }
    } else {
      // Flood fill tiles
      const targetTile = this.state.layers[layerIdx].data[MapData.index(this.state, startX, startY)];
      const fillTile = this.state.selectedTile;
      if (this.tilesEqual(targetTile, fillTile)) return;

      const queue: [number, number][] = [[startX, startY]];
      const visited = new Set<number>();

      while (queue.length > 0) {
        const [cx, cy] = queue.shift()!;
        if (!MapData.inBounds(this.state, cx, cy)) continue;
        const idx = MapData.index(this.state, cx, cy);
        if (visited.has(idx)) continue;
        const currentTile = this.state.layers[layerIdx].data[idx];
        if (!this.tilesEqual(currentTile, targetTile)) continue;
        visited.add(idx);

        this.tileChanges.push({
          layerIndex: layerIdx,
          index: idx,
          oldTile: currentTile ? { ...currentTile } : null,
          newTile: fillTile ? { ...fillTile } : null,
        });
        this.state.layers[layerIdx].data[idx] = fillTile ? { ...fillTile } : null;

        queue.push([cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]);
      }
    }
  }

  private commitStroke(): void {
    if (this.tileChanges.length === 0 && this.collisionChanges.length === 0) return;

    // The changes are already applied, create a command for undo
    const cmd = new PaintCommand(
      this.state,
      [...this.tileChanges],
      [...this.collisionChanges],
    );
    // Push without re-executing (already applied)
    this.history['undoStack'].push(cmd);
    this.history['redoStack'].length = 0;

    this.tileChanges = [];
    this.collisionChanges = [];
    this.visited.clear();
    this.state.dirty = true;
  }

  private tilesEqual(a: TileEntry | null, b: TileEntry | null): boolean {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    return a.t === b.t && a.f === b.f;
  }

  private bresenham(x0: number, y0: number, x1: number, y1: number, callback: (x: number, y: number) => void): void {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      callback(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }
}
