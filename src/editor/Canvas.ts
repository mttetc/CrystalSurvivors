import type { EditorState, TileEntry } from './types';
import type { TilesetLoader } from './TilesetLoader';

const TILE = 16;

export class EditorCanvas {
  private canvas: HTMLCanvasElement;
  private container: HTMLDivElement;
  private ctx: CanvasRenderingContext2D;
  private state: EditorState;
  private loader: TilesetLoader;
  private _dirty = true;
  private animId = 0;
  private animTime = 0;
  private lastFrameTime = 0;
  private hasAnimatedTiles = false;

  // Mouse state
  private mouseDown = false;
  private isPanning = false;
  private spaceHeld = false;
  private lastPanX = 0;
  private lastPanY = 0;
  private hoverTileX = -1;
  private hoverTileY = -1;

  // Public callbacks
  onTileHover: ((x: number, y: number) => void) | null = null;
  onToolAction: ((action: 'down' | 'move' | 'up', x: number, y: number) => void) | null = null;
  spawnMode = false;

  constructor(
    canvas: HTMLCanvasElement,
    container: HTMLDivElement,
    state: EditorState,
    loader: TilesetLoader,
  ) {
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext('2d')!;
    this.state = state;
    this.loader = loader;

    this.setupEvents();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  setState(state: EditorState): void {
    this.state = state;
  }

  markDirty(): void {
    this._dirty = true;
  }

  start(): void {
    this.centerView();
    this.loop();
  }

  centerView(): void {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const mapPxW = this.state.mapWidth * TILE * this.state.zoom;
    const mapPxH = this.state.mapHeight * TILE * this.state.zoom;
    this.state.panX = (cw - mapPxW) / 2;
    this.state.panY = (ch - mapPxH) / 2;
    this._dirty = true;
  }

  private resize(): void {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this._dirty = true;
  }

  private loop = (timestamp: number = 0): void => {
    if (this.lastFrameTime === 0) this.lastFrameTime = timestamp;
    const dt = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    this.animTime += dt;

    // Animated tiles need continuous redraws
    if (this._dirty || this.hasAnimatedTiles) {
      this.render();
      this._dirty = false;
    }
    this.animId = requestAnimationFrame(this.loop);
  };

  private render(): void {
    const ctx = this.ctx;
    const { mapWidth, mapHeight, zoom, panX, panY, layers, layerVisibility, collision, showGrid } = this.state;

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const tileSize = TILE * zoom;

    ctx.clearRect(0, 0, cw, ch);
    this.hasAnimatedTiles = false;

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, cw, ch);

    // Map area background
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(panX, panY, mapWidth * tileSize, mapHeight * tileSize);

    // Viewport culling: compute visible tile range
    const startCol = Math.max(0, Math.floor(-panX / tileSize));
    const startRow = Math.max(0, Math.floor(-panY / tileSize));
    const endCol = Math.min(mapWidth, Math.ceil((cw - panX) / tileSize));
    const endRow = Math.min(mapHeight, Math.ceil((ch - panY) / tileSize));

    ctx.imageSmoothingEnabled = false;

    // Render layers (ground, decorations)
    for (let li = 0; li < 2; li++) {
      if (!layerVisibility[li]) continue;
      const layer = layers[li];
      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          const tile = layer.data[row * mapWidth + col];
          if (!tile) continue;
          this.drawTile(ctx, tile, col, row, tileSize);
        }
      }
    }

    // Render collision overlay
    if (layerVisibility[2]) {
      ctx.fillStyle = 'rgba(255, 40, 40, 0.35)';
      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          if (collision[row * mapWidth + col]) {
            const dx = panX + col * tileSize;
            const dy = panY + row * tileSize;
            ctx.fillRect(dx, dy, tileSize, tileSize);
          }
        }
      }
    }

    // Render collision layer tiles (visual markers on collision layer)
    if (layerVisibility[2]) {
      const collisionLayer = layers[2];
      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          const tile = collisionLayer.data[row * mapWidth + col];
          if (!tile) continue;
          this.drawTile(ctx, tile, col, row, tileSize);
        }
      }
    }

    // Grid
    if (showGrid && zoom >= 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let col = startCol; col <= endCol; col++) {
        const x = Math.round(panX + col * tileSize) + 0.5;
        ctx.moveTo(x, panY + startRow * tileSize);
        ctx.lineTo(x, panY + endRow * tileSize);
      }
      for (let row = startRow; row <= endRow; row++) {
        const y = Math.round(panY + row * tileSize) + 0.5;
        ctx.moveTo(panX + startCol * tileSize, y);
        ctx.lineTo(panX + endCol * tileSize, y);
      }
      ctx.stroke();
    }

    // Spawn point marker
    const sx = this.state.spawn.x;
    const sy = this.state.spawn.y;
    if (sx >= startCol && sx < endCol && sy >= startRow && sy < endRow) {
      const dx = panX + sx * tileSize;
      const dy = panY + sy * tileSize;
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.strokeRect(dx + 2, dy + 2, tileSize - 4, tileSize - 4);
      ctx.fillStyle = '#00ff88';
      ctx.font = `${Math.max(10, tileSize * 0.4)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', dx + tileSize / 2, dy + tileSize / 2);
    }

    // Cursor preview
    if (this.hoverTileX >= 0 && this.hoverTileY >= 0 &&
        this.hoverTileX < mapWidth && this.hoverTileY < mapHeight &&
        !this.isPanning) {
      const dx = panX + this.hoverTileX * tileSize;
      const dy = panY + this.hoverTileY * tileSize;

      // Highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(dx, dy, tileSize, tileSize);

      // Preview tile
      if (this.state.selectedTile && this.state.selectedTool === 'brush') {
        ctx.globalAlpha = 0.5;
        this.drawTile(ctx, this.state.selectedTile, this.hoverTileX, this.hoverTileY, tileSize);
        ctx.globalAlpha = 1;
      }
    }
  }

  private drawTile(ctx: CanvasRenderingContext2D, tile: TileEntry, col: number, row: number, tileSize: number): void {
    const info = this.loader.get(tile.t);
    if (!info) return;

    let frame = tile.f;

    // Animated tile: cycle through frames
    if (tile.af && tile.af > 1) {
      this.hasAnimatedTiles = true;
      const fps = tile.fps || 6;
      const msPerFrame = 1000 / fps;
      const animFrame = Math.floor(this.animTime / msPerFrame) % tile.af;
      frame = tile.f + animFrame;
      // Wrap around if exceeding total frames
      if (frame >= info.totalFrames) frame = tile.f;
    }

    const srcX = (frame % info.cols) * info.frameWidth;
    const srcY = Math.floor(frame / info.cols) * info.frameHeight;
    const dx = this.state.panX + col * tileSize;
    const dy = this.state.panY + row * tileSize;

    ctx.drawImage(info.image, srcX, srcY, info.frameWidth, info.frameHeight, dx, dy, tileSize, tileSize);
  }

  private screenToTile(screenX: number, screenY: number): { x: number; y: number } {
    const tileSize = TILE * this.state.zoom;
    return {
      x: Math.floor((screenX - this.state.panX) / tileSize),
      y: Math.floor((screenY - this.state.panY) / tileSize),
    };
  }

  private setupEvents(): void {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.spaceHeld = true;
        this.canvas.style.cursor = 'grab';
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spaceHeld = false;
        if (!this.isPanning) this.canvas.style.cursor = 'crosshair';
      }
    });
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Middle button or space+left = pan
    if (e.button === 1 || (e.button === 0 && this.spaceHeld)) {
      this.isPanning = true;
      this.lastPanX = mx;
      this.lastPanY = my;
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    if (e.button === 0) {
      const tile = this.screenToTile(mx, my);

      if (this.spawnMode) {
        if (tile.x >= 0 && tile.x < this.state.mapWidth && tile.y >= 0 && tile.y < this.state.mapHeight) {
          this.state.spawn = { x: tile.x, y: tile.y };
          this.spawnMode = false;
          this.canvas.style.cursor = 'crosshair';
          this._dirty = true;
        }
        return;
      }

      this.mouseDown = true;
      this.onToolAction?.('down', tile.x, tile.y);
      this._dirty = true;
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (this.isPanning) {
      this.state.panX += mx - this.lastPanX;
      this.state.panY += my - this.lastPanY;
      this.lastPanX = mx;
      this.lastPanY = my;
      this._dirty = true;
      return;
    }

    const tile = this.screenToTile(mx, my);
    if (tile.x !== this.hoverTileX || tile.y !== this.hoverTileY) {
      this.hoverTileX = tile.x;
      this.hoverTileY = tile.y;
      this.onTileHover?.(tile.x, tile.y);
      this._dirty = true;
    }

    if (this.mouseDown) {
      this.onToolAction?.('move', tile.x, tile.y);
      this._dirty = true;
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = this.spaceHeld ? 'grab' : 'crosshair';
      return;
    }

    if (this.mouseDown) {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const tile = this.screenToTile(mx, my);
      this.onToolAction?.('up', tile.x, tile.y);
      this.mouseDown = false;
      this._dirty = true;
    }
  }

  private handleMouseLeave(): void {
    this.hoverTileX = -1;
    this.hoverTileY = -1;
    if (this.mouseDown) {
      this.onToolAction?.('up', -1, -1);
      this.mouseDown = false;
    }
    this._dirty = true;
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const zoomLevels = [0.5, 1, 1.5, 2, 3, 4];
    const currentIdx = zoomLevels.indexOf(this.state.zoom);
    let newIdx: number;

    if (currentIdx === -1) {
      // Find nearest
      newIdx = zoomLevels.findIndex(z => z >= this.state.zoom);
      if (newIdx === -1) newIdx = zoomLevels.length - 1;
    } else {
      newIdx = currentIdx + (e.deltaY < 0 ? 1 : -1);
    }

    newIdx = Math.max(0, Math.min(zoomLevels.length - 1, newIdx));
    const newZoom = zoomLevels[newIdx];

    if (newZoom !== this.state.zoom) {
      // Zoom toward cursor
      const oldZoom = this.state.zoom;
      const worldX = (mx - this.state.panX) / (TILE * oldZoom);
      const worldY = (my - this.state.panY) / (TILE * oldZoom);

      this.state.zoom = newZoom;
      this.state.panX = mx - worldX * TILE * newZoom;
      this.state.panY = my - worldY * TILE * newZoom;
      this._dirty = true;
    }
  }
}
