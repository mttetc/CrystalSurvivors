import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../constants';
import { getMusicManager } from './TitleScene';

const FONT = 'NinjaFont, "Trebuchet MS", Verdana, sans-serif';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PAUSE);
  }

  create(): void {
    // Dim background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Panel background for pause menu
    if (this.textures.exists('ui_panel')) {
      this.add.nineslice(
        GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ui_panel',
        undefined, 300, 260, 5, 5, 5, 5,
      ).setAlpha(0.9);
    }

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 96, 'PAUSED', {
      fontSize: '36px',
      fontFamily: FONT,
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setResolution(2);

    // Button helper
    const makeButton = (y: number, label: string, color: string, hoverColor: string, cb: () => void) => {
      // Button background
      const hasBtn = this.textures.exists('ui_btn_normal');
      let btnBg: Phaser.GameObjects.NineSlice | null = null;
      if (hasBtn) {
        btnBg = this.add.nineslice(
          GAME_WIDTH / 2, y, 'ui_btn_normal',
          undefined, 220, 40, 4, 4, 3, 3,
        );
      }

      const text = this.add.text(GAME_WIDTH / 2, y, label, {
        fontSize: '22px',
        fontFamily: FONT,
        color,
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setResolution(2);

      text.on('pointerdown', cb);
      text.on('pointerover', () => {
        text.setColor(hoverColor);
        if (btnBg && this.textures.exists('ui_btn_hover')) {
          btnBg.setTexture('ui_btn_hover');
        }
      });
      text.on('pointerout', () => {
        text.setColor(color);
        if (btnBg && this.textures.exists('ui_btn_normal')) {
          btnBg.setTexture('ui_btn_normal');
        }
      });
    };

    makeButton(GAME_HEIGHT / 2 - 30, 'Perks [P]', '#FFAA44', '#FFCC88', () => this.openPerks());
    makeButton(GAME_HEIGHT / 2 + 16, 'Resume [ESC]', '#88CCFF', '#AADDFF', () => this.resumeGame());
    makeButton(GAME_HEIGHT / 2 + 62, 'Quit', '#CC6666', '#FF8888', () => {
      getMusicManager(this).playTitleMusic();
      this.scene.stop(SCENES.GAME);
      this.scene.stop(SCENES.HUD);
      this.scene.stop(SCENES.LEVEL_UP);
      this.scene.start(SCENES.TITLE);
    });

    // Keyboard shortcuts
    this.input.keyboard!.on('keydown-ESC', () => this.resumeGame());
    this.input.keyboard!.on('keydown-P', () => this.openPerks());
  }

  private openPerks(): void {
    this.scene.launch(SCENES.PERKS);
    this.scene.stop();
  }

  private resumeGame(): void {
    const gameScene = this.scene.get(SCENES.GAME) as any;
    gameScene.resumeGame();
    this.scene.stop();
  }
}
