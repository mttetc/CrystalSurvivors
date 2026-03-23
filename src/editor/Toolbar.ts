import type { EditorApp } from './EditorApp';
import type { ToolType } from './types';

interface ToolButton {
  label: string;
  tool: ToolType;
  shortcut: string;
}

const TOOLS: ToolButton[] = [
  { label: 'Brush', tool: 'brush', shortcut: 'B' },
  { label: 'Eraser', tool: 'eraser', shortcut: 'E' },
  { label: 'Fill', tool: 'fill', shortcut: 'F' },
  { label: 'Rect', tool: 'rect', shortcut: 'R' },
];

export class Toolbar {
  private container: HTMLDivElement;
  private app: EditorApp;
  private toolButtons: Map<ToolType, HTMLButtonElement> = new Map();

  constructor(container: HTMLDivElement, app: EditorApp) {
    this.container = container;
    this.app = app;
  }

  render(): void {
    this.container.innerHTML = '';

    // Tool buttons
    for (const t of TOOLS) {
      const btn = document.createElement('button');
      btn.textContent = `${t.label} (${t.shortcut})`;
      btn.title = `${t.label} - ${t.shortcut}`;
      if (this.app.state.selectedTool === t.tool) btn.classList.add('active');
      btn.addEventListener('click', () => this.app.selectTool(t.tool));
      this.toolButtons.set(t.tool, btn);
      this.container.appendChild(btn);
    }

    this.addSeparator();

    // Grid toggle
    const gridBtn = document.createElement('button');
    gridBtn.textContent = 'Grid (G)';
    gridBtn.addEventListener('click', () => this.app.toggleGrid());
    this.container.appendChild(gridBtn);

    // Spawn
    const spawnBtn = document.createElement('button');
    spawnBtn.textContent = 'Set Spawn';
    spawnBtn.addEventListener('click', () => this.app.setSpawnMode());
    this.container.appendChild(spawnBtn);

    this.addSeparator();

    // Undo/Redo
    const undoBtn = document.createElement('button');
    undoBtn.textContent = 'Undo';
    undoBtn.addEventListener('click', () => this.app.undo());
    this.container.appendChild(undoBtn);

    const redoBtn = document.createElement('button');
    redoBtn.textContent = 'Redo';
    redoBtn.addEventListener('click', () => this.app.redo());
    this.container.appendChild(redoBtn);

    this.addSeparator();

    // File operations
    const newBtn = document.createElement('button');
    newBtn.textContent = 'New';
    newBtn.addEventListener('click', () => this.showNewMapDialog());
    this.container.appendChild(newBtn);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => this.app.save());
    this.container.appendChild(saveBtn);

    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load';
    loadBtn.addEventListener('click', () => this.app.load());
    this.container.appendChild(loadBtn);
  }

  updateActiveButton(): void {
    for (const [tool, btn] of this.toolButtons) {
      btn.classList.toggle('active', tool === this.app.state.selectedTool);
    }
  }

  private addSeparator(): void {
    const sep = document.createElement('div');
    sep.className = 'toolbar-sep';
    this.container.appendChild(sep);
  }

  private showNewMapDialog(): void {
    const dialog = document.getElementById('new-map-dialog')!;
    const preset = document.getElementById('map-preset') as HTMLSelectElement;
    const customDiv = document.getElementById('custom-size')!;
    const widthInput = document.getElementById('map-width-input') as HTMLInputElement;
    const heightInput = document.getElementById('map-height-input') as HTMLInputElement;
    const createBtn = document.getElementById('new-map-create')!;
    const cancelBtn = document.getElementById('new-map-cancel')!;

    dialog.classList.add('open');

    preset.onchange = () => {
      customDiv.style.display = preset.value === 'custom' ? 'block' : 'none';
    };

    const doCreate = () => {
      let w: number, h: number;
      if (preset.value === 'custom') {
        w = Math.max(10, Math.min(300, parseInt(widthInput.value) || 94));
        h = Math.max(10, Math.min(300, parseInt(heightInput.value) || 94));
      } else {
        w = h = parseInt(preset.value);
      }
      this.app.newMap(w, h);
      dialog.classList.remove('open');
      cleanup();
    };

    const doCancel = () => {
      dialog.classList.remove('open');
      cleanup();
    };

    const cleanup = () => {
      createBtn.removeEventListener('click', doCreate);
      cancelBtn.removeEventListener('click', doCancel);
    };

    createBtn.addEventListener('click', doCreate);
    cancelBtn.addEventListener('click', doCancel);
  }
}
