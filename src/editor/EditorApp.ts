import type { EditorState, TileEntry, ToolType } from './types';
import { MapData } from './MapData';
import { TilesetLoader } from './TilesetLoader';
import { TilesetPanel } from './TilesetPanel';
import { EditorCanvas } from './Canvas';
import { ToolManager } from './Tools';
import { History } from './History';
import { LayerPanel } from './LayerPanel';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import { Shortcuts } from './Shortcuts';

export class EditorApp {
  state: EditorState;
  tilesetLoader: TilesetLoader;
  tilesetPanel!: TilesetPanel;
  canvas!: EditorCanvas;
  toolManager!: ToolManager;
  history!: History;
  layerPanel!: LayerPanel;
  toolbar!: Toolbar;
  statusBar!: StatusBar;
  shortcuts!: Shortcuts;

  constructor() {
    this.state = MapData.create(94, 94);
    this.tilesetLoader = new TilesetLoader();
  }

  async init(): Promise<void> {
    await this.tilesetLoader.loadAll();

    this.history = new History();

    this.canvas = new EditorCanvas(
      document.getElementById('editor-canvas') as HTMLCanvasElement,
      document.getElementById('canvas-container') as HTMLDivElement,
      this.state,
      this.tilesetLoader,
    );

    this.toolManager = new ToolManager(this.state, this.history, this.canvas);

    this.tilesetPanel = new TilesetPanel(
      document.getElementById('tileset-panel') as HTMLDivElement,
      this.tilesetLoader,
      (tile: TileEntry) => this.selectTile(tile),
    );

    this.layerPanel = new LayerPanel(
      document.getElementById('layer-panel') as HTMLDivElement,
      this.state,
      () => this.canvas.markDirty(),
    );

    this.toolbar = new Toolbar(
      document.getElementById('toolbar') as HTMLDivElement,
      this,
    );

    this.statusBar = new StatusBar(
      document.getElementById('status-bar') as HTMLDivElement,
      this.state,
    );

    this.shortcuts = new Shortcuts(this);

    this.canvas.onTileHover = (x, y) => this.statusBar.update(x, y);
    this.canvas.onToolAction = (action, x, y) => {
      if (action === 'down') this.toolManager.onMouseDown(x, y);
      else if (action === 'move') this.toolManager.onMouseMove(x, y);
      else if (action === 'up') this.toolManager.onMouseUp(x, y);
    };

    this.canvas.start();
    this.tilesetPanel.render();
    this.layerPanel.render();
    this.toolbar.render();
    this.statusBar.render();
  }

  selectTile(tile: TileEntry): void {
    this.state.selectedTile = tile;
    this.tilesetPanel.setSelected(tile);
    this.statusBar.render();
  }

  selectTool(tool: ToolType): void {
    this.state.selectedTool = tool;
    this.toolbar.updateActiveButton();
  }

  toggleGrid(): void {
    this.state.showGrid = !this.state.showGrid;
    this.canvas.markDirty();
  }

  undo(): void {
    this.history.undo();
    this.canvas.markDirty();
  }

  redo(): void {
    this.history.redo();
    this.canvas.markDirty();
  }

  newMap(width: number, height: number): void {
    this.state = MapData.create(width, height);
    this.history.clear();
    this.canvas.setState(this.state);
    this.toolManager.setState(this.state);
    this.layerPanel.setState(this.state);
    this.statusBar.setState(this.state);
    this.canvas.centerView();
    this.canvas.markDirty();
    this.layerPanel.render();
  }

  save(): void {
    const json = MapData.exportJSON(this.state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `map_${this.state.mapWidth}x${this.state.mapHeight}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.state.dirty = false;
  }

  load(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          this.state = MapData.importJSON(reader.result as string);
          this.history.clear();
          this.canvas.setState(this.state);
          this.toolManager.setState(this.state);
          this.layerPanel.setState(this.state);
          this.statusBar.setState(this.state);
          this.canvas.centerView();
          this.canvas.markDirty();
          this.layerPanel.render();
        } catch (e) {
          alert(`Failed to load map: ${(e as Error).message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  setSpawnMode(): void {
    this.canvas.spawnMode = true;
  }
}
