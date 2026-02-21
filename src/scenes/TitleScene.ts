import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../constants';
import { MusicManager } from '../systems/MusicManager';

// Singleton music manager (persists across scene changes)
let musicManager: MusicManager | null = null;

export function getMusicManager(): MusicManager {
  if (!musicManager) {
    musicManager = new MusicManager();
  }
  return musicManager;
}

export class TitleScene extends Phaser.Scene {
  private particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[] = [];
  private particleGfx!: Phaser.GameObjects.Graphics;
  private fogGfx!: Phaser.GameObjects.Graphics;
  private fogTime = 0;

  constructor() {
    super(SCENES.TITLE);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#050510');

    // Start title music
    getMusicManager().playTitleMusic();

    // ─── Dark tiled ground background ────────────────────────────
    const bgContainer = this.add.container(0, 0);
    for (let x = 0; x < GAME_WIDTH; x += 64) {
      for (let y = 0; y < GAME_HEIGHT; y += 64) {
        const tile = this.add.image(x + 32, y + 32, 'ground_tile');
        tile.setAlpha(0.35);
        bgContainer.add(tile);
      }
    }

    // ─── Scattered decorations (dark, atmospheric) ───────────────
    const decoData = [
      { key: 'deco_gravestone', count: 8, alphaMin: 0.12, alphaMax: 0.25 },
      { key: 'deco_dead_tree', count: 5, alphaMin: 0.10, alphaMax: 0.20 },
      { key: 'deco_bones', count: 10, alphaMin: 0.08, alphaMax: 0.18 },
      { key: 'deco_skull_pile', count: 6, alphaMin: 0.10, alphaMax: 0.22 },
      { key: 'deco_blood_puddle', count: 8, alphaMin: 0.15, alphaMax: 0.30 },
      { key: 'deco_cobweb', count: 4, alphaMin: 0.06, alphaMax: 0.15 },
    ];

    for (const { key, count, alphaMin, alphaMax } of decoData) {
      for (let i = 0; i < count; i++) {
        const x = 20 + Math.random() * (GAME_WIDTH - 40);
        const y = 20 + Math.random() * (GAME_HEIGHT - 40);
        if (this.textures.exists(key)) {
          const deco = this.add.image(x, y, key);
          deco.setAlpha(alphaMin + Math.random() * (alphaMax - alphaMin));
          deco.setTint(0x334455);
        }
      }
    }

    // ─── Animated torches on sides ───────────────────────────────
    if (this.textures.exists('deco_torch')) {
      const torchPositions = [
        { x: 30, y: GAME_HEIGHT / 2 - 40 },
        { x: 30, y: GAME_HEIGHT / 2 + 40 },
        { x: GAME_WIDTH - 30, y: GAME_HEIGHT / 2 - 40 },
        { x: GAME_WIDTH - 30, y: GAME_HEIGHT / 2 + 40 },
      ];
      for (const pos of torchPositions) {
        const torch = this.add.sprite(pos.x, pos.y, 'deco_torch', 0);
        torch.setScale(2);
        torch.setAlpha(0.7);
        this.time.addEvent({
          delay: 250 + Math.random() * 200,
          loop: true,
          callback: () => {
            torch.setFrame(torch.frame.name === '0' ? 1 : 0);
          },
        });
      }
    }

    // ─── Dark vignette overlay (stepped for pixel-crisp look) ────
    const vignette = this.add.graphics();
    const vStep = 4; // step size in pixels for crisp banding
    // Top and bottom stepped dark bars
    for (let i = 0; i < 40; i += vStep) {
      const alpha = (1 - i / 40) * 0.6;
      vignette.fillStyle(0x000000, alpha);
      vignette.fillRect(0, i, GAME_WIDTH, vStep);
      vignette.fillRect(0, GAME_HEIGHT - i - vStep, GAME_WIDTH, vStep);
    }
    // Left and right stepped dark bars
    for (let i = 0; i < 60; i += vStep) {
      const alpha = (1 - i / 60) * 0.5;
      vignette.fillStyle(0x000000, alpha);
      vignette.fillRect(i, 0, vStep, GAME_HEIGHT);
      vignette.fillRect(GAME_WIDTH - i - vStep, 0, vStep, GAME_HEIGHT);
    }

    // ─── Floating particles (embers / dust) ──────────────────────
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        vx: (Math.random() - 0.5) * 8,
        vy: -5 - Math.random() * 15,
        alpha: 0.1 + Math.random() * 0.4,
        size: Math.random() < 0.3 ? 2 : 1,
      });
    }
    this.particleGfx = this.add.graphics();

    // ─── Fog layer ───────────────────────────────────────────────
    this.fogGfx = this.add.graphics();
    this.fogTime = 0;

    // ─── Title text with glow effect ─────────────────────────────
    // Glow behind title
    const glow = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'CRYSTAL SURVIVORS', {
      fontSize: '26px',
      fontFamily: 'monospace',
      color: '#1a3355',
      fontStyle: 'bold',
    }).setOrigin(0.5).setResolution(8).setAlpha(0.6);

    this.tweens.add({
      targets: glow,
      alpha: 0.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Main title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'CRYSTAL SURVIVORS', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#CC4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setResolution(8);

    // Subtle title pulse
    this.tweens.add({
      targets: title,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, 'Jobs, Crystals & Chaos', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#553333',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setResolution(8);

    // Divider line
    const divider = this.add.graphics();
    divider.lineStyle(1, 0x442222, 0.5);
    divider.beginPath();
    divider.moveTo(GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2 + 8);
    divider.lineTo(GAME_WIDTH / 2 + 80, GAME_HEIGHT / 2 + 8);
    divider.stroke();

    // Prompt
    const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Press ENTER to Start', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#666666',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setResolution(8);

    // Blink prompt
    this.tweens.add({
      targets: prompt,
      alpha: 0.15,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Controls hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'WASD: Move  |  SPACE: Dash  |  ESC: Pause', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#333344',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setResolution(8);

    this.input.keyboard!.once('keydown-ENTER', () => {
      this.scene.start(SCENES.CHAR_SELECT);
    });
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;

    // Update floating particles
    this.particleGfx.clear();
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Wrap around
      if (p.y < -5) {
        p.y = GAME_HEIGHT + 5;
        p.x = Math.random() * GAME_WIDTH;
      }
      if (p.x < -5) p.x = GAME_WIDTH + 5;
      if (p.x > GAME_WIDTH + 5) p.x = -5;

      // Flicker alpha
      const flicker = p.alpha * (0.7 + Math.sin(_time * 0.003 + p.x) * 0.3);

      // Draw - reddish embers
      this.particleGfx.fillStyle(0xFF4422, flicker);
      this.particleGfx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }

    // Pixel-art fog drift (rectangular blocks instead of smooth ellipses)
    this.fogTime += dt;
    this.fogGfx.clear();
    for (let i = 0; i < 3; i++) {
      const fogCX = ((this.fogTime * (8 + i * 3)) % (GAME_WIDTH + 200)) - 100;
      const fogCY = GAME_HEIGHT * 0.6 + i * 25 + Math.floor(Math.sin(this.fogTime * 0.5 + i) * 10);
      const fogW = 200 + i * 40;
      const fogH = 16 + i * 6;
      const baseAlpha = 0.06 + i * 0.015;
      // Draw fog as stacked rectangles for a pixel-crisp look
      const layers = 4;
      for (let l = 0; l < layers; l++) {
        const shrink = l * (fogW / (layers * 3));
        const lx = Math.floor(fogCX - fogW / 2 + shrink);
        const ly = Math.floor(fogCY - fogH / 2 + l * 2);
        const lw = Math.floor(fogW - shrink * 2);
        const lh = Math.max(2, Math.floor(fogH / layers));
        this.fogGfx.fillStyle(0x111122, baseAlpha);
        this.fogGfx.fillRect(lx, ly, lw, lh);
      }
    }
  }
}
