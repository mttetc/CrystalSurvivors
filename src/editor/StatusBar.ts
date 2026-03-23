import type { EditorState } from './types';

const LAYER_NAMES = ['Ground', 'Decorations', 'Collision'];

export class StatusBar {
  private container: HTMLDivElement;
  private state: EditorState;

  private posEl!: HTMLSpanElement;
  private zoomEl!: HTMLSpanElement;
  private tileEl!: HTMLSpanElement;
  private layerEl!: HTMLSpanElement;
  private sizeEl!: HTMLSpanElement;

  constructor(container: HTMLDivElement, state: EditorState) {
    this.container = container;
    this.state = state;
  }

  setState(state: EditorState): void {
    this.state = state;
    this.render();
  }

  render(): void {
    this.container.innerHTML = '';

    this.posEl = this.addItem('Pos:', '—');
    this.zoomEl = this.addItem('Zoom:', `${this.state.zoom}x`);
    this.tileEl = this.addItem('Tile:', this.formatTile());
    this.layerEl = this.addItem('Layer:', LAYER_NAMES[this.state.activeLayerIndex]);
    this.sizeEl = this.addItem('Map:', `${this.state.mapWidth}x${this.state.mapHeight}`);
  }

  update(tileX: number, tileY: number): void {
    if (this.posEl) {
      this.posEl.textContent = tileX >= 0 && tileY >= 0 ? `${tileX}, ${tileY}` : '—';
    }
    if (this.zoomEl) {
      this.zoomEl.textContent = `${this.state.zoom}x`;
    }
    if (this.layerEl) {
      this.layerEl.textContent = LAYER_NAMES[this.state.activeLayerIndex];
    }
    if (this.tileEl) {
      this.tileEl.textContent = this.formatTile();
    }
  }

  private formatTile(): string {
    const t = this.state.selectedTile;
    if (!t) return 'None';
    if (t.af && t.af > 1) {
      return `${t.t} #${t.f} (anim: ${t.af}f @${t.fps || 6}fps)`;
    }
    return `${t.t} #${t.f}`;
  }

  private addItem(label: string, value: string): HTMLSpanElement {
    const item = document.createElement('div');
    item.className = 'status-item';
    item.textContent = `${label} `;
    const span = document.createElement('span');
    span.textContent = value;
    item.appendChild(span);
    this.container.appendChild(item);
    return span;
  }
}
