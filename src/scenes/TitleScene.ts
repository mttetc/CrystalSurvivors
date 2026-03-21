import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../constants';
import { MusicManager } from '../systems/MusicManager';

// Singleton music manager (persists across scene changes)
let musicManager: MusicManager | null = null;

export function getMusicManager(scene?: Phaser.Scene): MusicManager {
  if (!musicManager) {
    musicManager = new MusicManager();
  }
  if (scene) {
    musicManager.setScene(scene);
  }
  return musicManager;
}

interface TitleParticle {
  sprite: Phaser.GameObjects.Sprite;
  vx: number;
  vy: number;
  baseAlpha: number;
}

const FONT = 'NinjaFont, "Trebuchet MS", Verdana, sans-serif';

export class TitleScene extends Phaser.Scene {
  private particles: TitleParticle[] = [];
  private fogSprites: Phaser.GameObjects.Sprite[] = [];
  private fogTime = 0;

  constructor() {
    super(SCENES.TITLE);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#2a5a1a');

    // Start title music
    getMusicManager(this).playTitleMusic();

    // ─── Nature tiled ground background ──────────────────────────
    const bgContainer = this.add.container(0, 0);
    const tileSize = 16;
    const scale = 2;
    const scaledSize = tileSize * scale;
    const grassFrames = [21, 21, 21, 36, 28, 29]; // green grass center variants
    for (let x = 0; x < GAME_WIDTH; x += scaledSize) {
      for (let y = 0; y < GAME_HEIGHT; y += scaledSize) {
        const frame = grassFrames[Math.floor(Math.random() * grassFrames.length)];
        const tile = this.add.image(x + scaledSize / 2, y + scaledSize / 2, 'tileset_field', frame);
        tile.setScale(scale).setAlpha(0.4);
        bgContainer.add(tile);
      }
    }

    // ─── Scattered nature decorations ────────────────────────────
    const decoData = [
      { key: 'env_bush', count: 8, alphaMin: 0.15, alphaMax: 0.30, scale: 1.5 },
      { key: 'env_flowers', count: 6, alphaMin: 0.12, alphaMax: 0.25, scale: 1.2 },
    ];

    for (const { key, count, alphaMin, alphaMax, scale: s } of decoData) {
      for (let i = 0; i < count; i++) {
        const x = 40 + Math.random() * (GAME_WIDTH - 80);
        const y = 40 + Math.random() * (GAME_HEIGHT - 80);
        if (this.textures.exists(key)) {
          const deco = this.add.image(x, y, key);
          deco.setAlpha(alphaMin + Math.random() * (alphaMax - alphaMin));
          deco.setScale(s);
          deco.setTint(0x556655);
        }
      }
    }

    // ─── Vignette overlay ───────────────────────────────────────
    const vStep = 8;
    for (let i = 0; i < 80; i += vStep) {
      const alpha = (1 - i / 80) * 0.5;
      this.add.rectangle(GAME_WIDTH / 2, i + vStep / 2, GAME_WIDTH, vStep, 0x0a1a0a).setAlpha(alpha);
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - i - vStep / 2, GAME_WIDTH, vStep, 0x0a1a0a).setAlpha(alpha);
    }
    for (let i = 0; i < 120; i += vStep) {
      const alpha = (1 - i / 120) * 0.4;
      this.add.rectangle(i + vStep / 2, GAME_HEIGHT / 2, vStep, GAME_HEIGHT, 0x0a1a0a).setAlpha(alpha);
      this.add.rectangle(GAME_WIDTH - i - vStep / 2, GAME_HEIGHT / 2, vStep, GAME_HEIGHT, 0x0a1a0a).setAlpha(alpha);
    }

    // ─── Floating particles (firefly sprites) ────────────────────
    this.particles = [];
    const particleTex = this.textures.exists('fx_spark') ? 'fx_spark' : 'fx_circle_spark';
    for (let i = 0; i < 30; i++) {
      const sprite = this.add.sprite(
        Math.random() * GAME_WIDTH,
        Math.random() * GAME_HEIGHT,
        particleTex, 0,
      );
      sprite.setScale(Math.random() < 0.3 ? 0.12 : 0.07);
      sprite.setTint(0xFFDD44);
      sprite.setBlendMode(Phaser.BlendModes.ADD);
      const baseAlpha = 0.1 + Math.random() * 0.4;
      sprite.setAlpha(baseAlpha);
      this.particles.push({
        sprite,
        vx: (Math.random() - 0.5) * 16,
        vy: -10 - Math.random() * 30,
        baseAlpha,
      });
    }

    // ─── Fog layer ──────────────────────────────────────────────
    this.fogSprites = [];
    this.fogTime = 0;
    const fogTex = this.textures.exists('fx_smoke') ? 'fx_smoke' : 'fx_circle_spark';
    for (let i = 0; i < 3; i++) {
      const fog = this.add.sprite(0, 0, fogTex, 0);
      fog.setTint(0x1a331a);
      fog.setAlpha(0.06 + i * 0.015);
      fog.setScale((400 + i * 80) / 32, (32 + i * 12) / 32);
      fog.setBlendMode(Phaser.BlendModes.MULTIPLY);
      this.fogSprites.push(fog);
    }

    // ─── Title panel (nine-patch) ────────────────────────────────
    const titleCY = GAME_HEIGHT / 2 - 50;
    if (this.textures.exists('ui_panel')) {
      const titlePanel = this.add.nineslice(
        GAME_WIDTH / 2, titleCY, 'ui_panel',
        undefined, 580, 150, 5, 5, 5, 5,
      );
      titlePanel.setAlpha(0.85);
    }

    // Glow behind title
    const glow = this.add.text(GAME_WIDTH / 2, titleCY - 18, 'CRYSTAL SURVIVORS', {
      fontSize: '52px',
      fontFamily: FONT,
      color: '#554411',
      fontStyle: 'bold',
    }).setOrigin(0.5).setResolution(2).setAlpha(0.6);

    this.tweens.add({
      targets: glow,
      alpha: 0.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Main title
    const title = this.add.text(GAME_WIDTH / 2, titleCY - 18, 'CRYSTAL SURVIVORS', {
      fontSize: '48px',
      fontFamily: FONT,
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 10,
    }).setOrigin(0.5).setResolution(2);

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
    this.add.text(GAME_WIDTH / 2, titleCY + 36, 'Jobs, Crystals & Chaos', {
      fontSize: '26px',
      fontFamily: FONT,
      color: '#88AA44',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2);

    // ─── Prompt button (themed) ─────────────────────────────────
    const promptY = GAME_HEIGHT / 2 + 110;
    if (this.textures.exists('ui_btn_normal')) {
      const btnBg = this.add.nineslice(
        GAME_WIDTH / 2, promptY, 'ui_btn_normal',
        undefined, 320, 48, 4, 4, 3, 3,
      );
      btnBg.setAlpha(0.9);
    }

    const prompt = this.add.text(GAME_WIDTH / 2, promptY, 'Click or Press ENTER to Start', {
      fontSize: '26px',
      fontFamily: FONT,
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2);

    // Make prompt clickable
    prompt.setInteractive({ useHandCursor: true });
    prompt.on('pointerdown', () => {
      this.scene.start(SCENES.CHAR_SELECT);
    });
    prompt.on('pointerover', () => prompt.setColor('#FFD700'));
    prompt.on('pointerout', () => prompt.setColor('#FFFFFF'));

    this.tweens.add({
      targets: prompt,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // ─── Controls hint (dialog box) ─────────────────────────────
    const controlsY = GAME_HEIGHT - 36;
    if (this.textures.exists('ui_dialog_simple')) {
      const ctrlPanel = this.add.image(GAME_WIDTH / 2, controlsY, 'ui_dialog_simple');
      ctrlPanel.setDisplaySize(560, 40);
      ctrlPanel.setAlpha(0.6);
    }

    this.add.text(GAME_WIDTH / 2, controlsY, 'WASD: Move  |  SPACE: Dash  |  ESC: Pause', {
      fontSize: '20px',
      fontFamily: FONT,
      color: '#556644',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2);

    this.input.keyboard!.once('keydown-ENTER', () => {
      this.scene.start(SCENES.CHAR_SELECT);
    });
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;

    // Update floating particle sprites
    for (const p of this.particles) {
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;

      if (p.sprite.y < -5) {
        p.sprite.y = GAME_HEIGHT + 5;
        p.sprite.x = Math.random() * GAME_WIDTH;
      }
      if (p.sprite.x < -5) p.sprite.x = GAME_WIDTH + 5;
      if (p.sprite.x > GAME_WIDTH + 5) p.sprite.x = -5;

      p.sprite.setAlpha(p.baseAlpha * (0.7 + Math.sin(_time * 0.003 + p.sprite.x) * 0.3));
    }

    // Fog drift
    this.fogTime += dt;
    for (let i = 0; i < this.fogSprites.length; i++) {
      const fog = this.fogSprites[i];
      const fogCX = ((this.fogTime * (16 + i * 6)) % (GAME_WIDTH + 400)) - 200;
      const fogCY = GAME_HEIGHT * 0.6 + i * 50 + Math.floor(Math.sin(this.fogTime * 0.5 + i) * 20);
      fog.setPosition(fogCX, fogCY);
    }
  }
}
