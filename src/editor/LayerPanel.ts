import type { EditorState } from './types';

const LAYER_LABELS = ['Ground', 'Decorations', 'Collision'];

export class LayerPanel {
  private container: HTMLDivElement;
  private state: EditorState;
  private onChange: () => void;

  constructor(container: HTMLDivElement, state: EditorState, onChange: () => void) {
    this.container = container;
    this.state = state;
    this.onChange = onChange;
  }

  setState(state: EditorState): void {
    this.state = state;
  }

  render(): void {
    this.container.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = 'Layers';
    this.container.appendChild(title);

    for (let i = 0; i < LAYER_LABELS.length; i++) {
      const row = document.createElement('div');
      row.className = `layer-row${i === this.state.activeLayerIndex ? ' active' : ''}`;

      const eye = document.createElement('div');
      eye.className = `layer-visibility${this.state.layerVisibility[i] ? '' : ' hidden'}`;
      eye.textContent = this.state.layerVisibility[i] ? '\u{1F441}' : '\u{1F441}';
      eye.addEventListener('click', (e) => {
        e.stopPropagation();
        this.state.layerVisibility[i] = !this.state.layerVisibility[i];
        this.render();
        this.onChange();
      });

      const name = document.createElement('div');
      name.className = 'layer-name';
      name.textContent = LAYER_LABELS[i];

      row.appendChild(eye);
      row.appendChild(name);

      row.addEventListener('click', () => {
        this.state.activeLayerIndex = i;
        this.render();
      });

      this.container.appendChild(row);
    }

    // Map settings
    const settings = document.createElement('div');
    settings.className = 'map-settings';

    const titleSettings = document.createElement('div');
    titleSettings.className = 'panel-title';
    titleSettings.textContent = 'Map Info';
    settings.appendChild(titleSettings);

    this.addSettingRow(settings, 'Size', `${this.state.mapWidth} x ${this.state.mapHeight}`);
    this.addSettingRow(settings, 'Tiles', `${this.state.mapWidth * this.state.mapHeight}`);
    this.addSettingRow(settings, 'Spawn', `${this.state.spawn.x}, ${this.state.spawn.y}`);

    this.container.appendChild(settings);
  }

  private addSettingRow(parent: HTMLElement, label: string, value: string): void {
    const row = document.createElement('div');
    row.className = 'setting-row';
    row.innerHTML = `<span class="setting-label">${label}</span><span class="setting-value">${value}</span>`;
    parent.appendChild(row);
  }
}
