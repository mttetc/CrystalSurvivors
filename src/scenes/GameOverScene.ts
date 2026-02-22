import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../constants';
import { PlayerStats } from '../types';
import { getMusicManager } from './TitleScene';

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

    this.add.text(GAME_WIDTH / 2, 60, title, {
      fontSize: '40px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: titleColor,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setResolution(16);

    if (data.victory) {
      this.add.text(GAME_WIDTH / 2, 104, 'You survived the horde!', {
        fontSize: '22px',
        fontFamily: '"Trebuchet MS", Verdana, sans-serif',
        color: '#88CC88',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setResolution(16);
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
      this.add.text(GAME_WIDTH / 2, 160 + i * 36, line, {
        fontSize: '22px',
        fontFamily: '"Trebuchet MS", Verdana, sans-serif',
        color: '#CCCCCC',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setResolution(16);
    });

    // Play again
    const playAgain = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'Press ENTER to Play Again', {
      fontSize: '24px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#AAAAAA',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(16);

    this.tweens.add({
      targets: playAgain,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard!.once('keydown-ENTER', () => {
      getMusicManager().playGameMusic();
      this.scene.stop(SCENES.LEVEL_UP);
      this.scene.stop(SCENES.HUD);
      this.scene.start(SCENES.GAME);
    });
  }
}
