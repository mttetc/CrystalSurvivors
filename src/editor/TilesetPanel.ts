import type { TileEntry, TilesetInfo } from './types';
import type { TilesetLoader } from './TilesetLoader';

export class TilesetPanel {
  private container: HTMLDivElement;
  private loader: TilesetLoader;
  private onSelect: (tile: TileEntry) => void;
  private selectedEl: HTMLCanvasElement | null = null;
  private selectedTile: TileEntry | null = null;
  private animConfigEl: HTMLDivElement | null = null;

  constructor(container: HTMLDivElement, loader: TilesetLoader, onSelect: (tile: TileEntry) => void) {
    this.container = container;
    this.loader = loader;
    this.onSelect = onSelect;
  }

  render(): void {
    this.container.innerHTML = '';
    const tilesets = this.loader.getAll();

    for (const info of tilesets) {
      const section = document.createElement('div');
      section.className = 'tileset-section';

      const isAnimated = info.key.startsWith('anim_');
      const label = isAnimated ? `${info.key} (anim)` : info.key;

      const header = document.createElement('div');
      header.className = 'tileset-header';
      header.innerHTML = `<span>${label}</span><span class="arrow">&#9654;</span>`;

      const grid = document.createElement('div');
      grid.className = 'tileset-grid';

      header.addEventListener('click', () => {
        header.classList.toggle('open');
        grid.classList.toggle('open');
        if (grid.classList.contains('open') && grid.children.length === 0) {
          this.renderFrames(grid, info);
        }
      });

      section.appendChild(header);
      section.appendChild(grid);
      this.container.appendChild(section);
    }
  }

  private renderFrames(grid: HTMLDivElement, info: TilesetInfo): void {
    const previewSize = 32;

    for (let frame = 0; frame < info.totalFrames; frame++) {
      const canvas = document.createElement('canvas');
      canvas.width = previewSize;
      canvas.height = previewSize;
      canvas.className = 'tile-frame';
      canvas.title = `${info.key} #${frame}`;

      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      const srcX = (frame % info.cols) * info.frameWidth;
      const srcY = Math.floor(frame / info.cols) * info.frameHeight;

      ctx.drawImage(
        info.image,
        srcX, srcY, info.frameWidth, info.frameHeight,
        0, 0, previewSize, previewSize,
      );

      canvas.addEventListener('click', () => {
        const isAnimated = info.key.startsWith('anim_');
        if (isAnimated) {
          this.showAnimConfig(canvas, info, frame);
        } else {
          this.selectFrame(canvas, { t: info.key, f: frame });
        }
      });

      grid.appendChild(canvas);
    }
  }

  private showAnimConfig(el: HTMLCanvasElement, info: TilesetInfo, startFrame: number): void {
    // Remove old config panel
    this.removeAnimConfig();

    // Highlight selected
    if (this.selectedEl) this.selectedEl.classList.remove('selected');
    el.classList.add('selected');
    this.selectedEl = el;

    // Max possible consecutive frames from startFrame
    const maxFrames = info.totalFrames - startFrame;

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#1a1a40;border:1px solid #0f3460;border-radius:4px;padding:8px;margin:4px 0;';

    panel.innerHTML = `
      <div style="font-size:11px;color:#888;margin-bottom:6px;">Animation Settings</div>
      <label style="font-size:11px;color:#aaa;display:block;margin-bottom:2px;">
        Frames (from #${startFrame}, max ${maxFrames})
      </label>
      <input type="range" id="anim-frames" min="1" max="${maxFrames}" value="${Math.min(maxFrames, 4)}"
        style="width:100%;accent-color:#e94560;" />
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#e0e0e0;">
        <span>Count: <strong id="anim-frames-val">${Math.min(maxFrames, 4)}</strong></span>
      </div>
      <label style="font-size:11px;color:#aaa;display:block;margin-top:6px;margin-bottom:2px;">FPS</label>
      <input type="range" id="anim-fps" min="1" max="24" value="6"
        style="width:100%;accent-color:#e94560;" />
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#e0e0e0;">
        <span>Speed: <strong id="anim-fps-val">6</strong> fps</span>
      </div>
      <div style="display:flex;gap:4px;margin-top:8px;">
        <button id="anim-ok" style="flex:1;background:#e94560;border:none;color:white;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:12px;">
          Use Animated
        </button>
        <button id="anim-static" style="flex:1;background:#1a1a40;border:1px solid #0f3460;color:#e0e0e0;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:12px;">
          Use Static
        </button>
      </div>
    `;

    // Insert after the grid that contains the clicked element
    el.parentElement!.after(panel);
    this.animConfigEl = panel;

    // Wire up sliders
    const framesSlider = panel.querySelector('#anim-frames') as HTMLInputElement;
    const framesVal = panel.querySelector('#anim-frames-val') as HTMLElement;
    const fpsSlider = panel.querySelector('#anim-fps') as HTMLInputElement;
    const fpsVal = panel.querySelector('#anim-fps-val') as HTMLElement;

    framesSlider.addEventListener('input', () => {
      framesVal.textContent = framesSlider.value;
    });
    fpsSlider.addEventListener('input', () => {
      fpsVal.textContent = fpsSlider.value;
    });

    // OK = animated tile
    panel.querySelector('#anim-ok')!.addEventListener('click', () => {
      const af = parseInt(framesSlider.value);
      const fps = parseInt(fpsSlider.value);
      const tile: TileEntry = { t: info.key, f: startFrame, af, fps };
      this.selectedTile = tile;
      this.onSelect(tile);
      this.removeAnimConfig();
    });

    // Static = single frame, no animation
    panel.querySelector('#anim-static')!.addEventListener('click', () => {
      const tile: TileEntry = { t: info.key, f: startFrame };
      this.selectedTile = tile;
      this.onSelect(tile);
      this.removeAnimConfig();
    });
  }

  private removeAnimConfig(): void {
    if (this.animConfigEl) {
      this.animConfigEl.remove();
      this.animConfigEl = null;
    }
  }

  private selectFrame(el: HTMLCanvasElement, tile: TileEntry): void {
    this.removeAnimConfig();
    if (this.selectedEl) {
      this.selectedEl.classList.remove('selected');
    }
    el.classList.add('selected');
    this.selectedEl = el;
    this.selectedTile = tile;
    this.onSelect(tile);
  }

  setSelected(tile: TileEntry): void {
    this.selectedTile = tile;
  }
}
