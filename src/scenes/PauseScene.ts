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
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'PAUSED', {
      fontSize: '36px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setResolution(16);

    // Perks button
    const perksText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'Perks [P]', {
      fontSize: '24px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#FFAA44',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setResolution(16);

    perksText.on('pointerdown', () => this.openPerks());
    perksText.on('pointerover', () => perksText.setColor('#FFCC88'));
    perksText.on('pointerout', () => perksText.setColor('#FFAA44'));

    // Resume button
    const resumeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'Resume [ESC]', {
      fontSize: '24px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#88CCFF',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setResolution(16);

    resumeText.on('pointerdown', () => this.resumeGame());
    resumeText.on('pointerover', () => resumeText.setColor('#AADDFF'));
    resumeText.on('pointerout', () => resumeText.setColor('#88CCFF'));

    // Quit button
    const quitText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 'Quit', {
      fontSize: '24px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#CC6666',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setResolution(16);

    quitText.on('pointerdown', () => {
      getMusicManager().playTitleMusic();
      this.scene.stop(SCENES.GAME);
      this.scene.stop(SCENES.HUD);
      this.scene.stop(SCENES.LEVEL_UP);
      this.scene.start(SCENES.TITLE);
    });
    quitText.on('pointerover', () => quitText.setColor('#FF8888'));
    quitText.on('pointerout', () => quitText.setColor('#CC6666'));

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
