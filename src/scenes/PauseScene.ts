import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../constants';
import { getMusicManager } from './TitleScene';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PAUSE);
  }

  create(): void {
    // Dim background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'PAUSED', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(8);

    // Resume button
    const resumeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'Resume [ESC]', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#88CCFF',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setResolution(8);

    resumeText.on('pointerdown', () => this.resumeGame());
    resumeText.on('pointerover', () => resumeText.setColor('#AADDFF'));
    resumeText.on('pointerout', () => resumeText.setColor('#88CCFF'));

    // Quit button
    const quitText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'Quit', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#CC6666',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setResolution(8);

    quitText.on('pointerdown', () => {
      getMusicManager().playTitleMusic();
      this.scene.stop(SCENES.GAME);
      this.scene.stop(SCENES.HUD);
      this.scene.stop(SCENES.LEVEL_UP);
      this.scene.start(SCENES.TITLE);
    });
    quitText.on('pointerover', () => quitText.setColor('#FF8888'));
    quitText.on('pointerout', () => quitText.setColor('#CC6666'));

    // ESC to resume
    this.input.keyboard!.on('keydown-ESC', () => this.resumeGame());
  }

  private resumeGame(): void {
    const gameScene = this.scene.get(SCENES.GAME) as any;
    gameScene.resumeGame();
    this.scene.stop();
  }
}
