import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../constants';
import { PlayerStats } from '../types';
import { getMusicManager } from './TitleScene';

const FONT = 'NinjaFont, "Trebuchet MS", Verdana, sans-serif';

interface GameOverData {
  victory: boolean;
  stats: PlayerStats;
  wave: number;
  weaponCount?: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME_OVER);
  }

  create(data: GameOverData): void {
    this.cameras.main.setBackgroundColor('#0a0a1a');

    const title = data.victory ? 'VICTORY!' : 'GAME OVER';
    const titleColor = data.victory ? '#44FF44' : '#FF4444';

    // Main panel background
    if (this.textures.exists('ui_panel')) {
      this.add.nineslice(
        GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ui_panel',
        undefined, GAME_WIDTH - 80, GAME_HEIGHT - 60, 5, 5, 5, 5,
      ).setAlpha(0.85);
    }

    this.add.text(GAME_WIDTH / 2, 60, title, {
      fontSize: '38px',
      fontFamily: FONT,
      color: titleColor,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setResolution(2);

    if (data.victory) {
      this.add.text(GAME_WIDTH / 2, 104, 'You survived the horde!', {
        fontSize: '20px',
        fontFamily: FONT,
        color: '#88CC88',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setResolution(2);
    }

    // Stats
    const stats = data.stats;
    const timeSec = Math.floor(stats.timeSurvived / 1000);
    const timeMin = Math.floor(timeSec / 60);
    const timeSecs = timeSec % 60;
    const dps = timeSec > 0 ? (stats.damageDealt / timeSec).toFixed(1) : '0.0';

    const statsLines = [
      `Wave Reached: ${data.wave}`,
      `Level: ${stats.level}`,
      `Kills: ${stats.kills}`,
      `Damage Dealt: ${stats.damageDealt}`,
      `Damage Taken: ${stats.damageTaken}`,
      `DPS: ${dps}`,
      `Weapons: ${data.weaponCount ?? 0}`,
      `Time: ${timeMin}:${timeSecs.toString().padStart(2, '0')}`,
    ];

    statsLines.forEach((line, i) => {
      this.add.text(GAME_WIDTH / 2, 150 + i * 34, line, {
        fontSize: '20px',
        fontFamily: FONT,
        color: '#CCCCCC',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setResolution(2);
    });

    // Play again button
    const btnY = GAME_HEIGHT - 80;
    if (this.textures.exists('ui_btn_normal')) {
      this.add.nineslice(
        GAME_WIDTH / 2, btnY, 'ui_btn_normal',
        undefined, 340, 48, 4, 4, 3, 3,
      );
    }

    const playAgain = this.add.text(GAME_WIDTH / 2, btnY, 'Click or ENTER to Play Again', {
      fontSize: '26px',
      fontFamily: FONT,
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2);

    // Make clickable
    playAgain.setInteractive({ useHandCursor: true });
    const startNewGame = () => {
      getMusicManager(this).playGameMusic();
      this.scene.stop(SCENES.LEVEL_UP);
      this.scene.stop(SCENES.HUD);
      this.scene.start(SCENES.GAME);
    };
    playAgain.on('pointerdown', startNewGame);
    playAgain.on('pointerover', () => playAgain.setColor('#FFD700'));
    playAgain.on('pointerout', () => playAgain.setColor('#FFFFFF'));

    this.tweens.add({
      targets: playAgain,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard!.once('keydown-ENTER', startNewGame);
  }
}
