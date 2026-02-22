import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, EVENTS } from '../constants';
import { EventBus } from '../systems/EventBus';

export class WaveBanner {
  private scene: Phaser.Scene;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.text = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '', {
      fontSize: '32px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300).setAlpha(0).setResolution(16);

    EventBus.on(EVENTS.WAVE_STARTED, this.onWaveStarted, this);
    EventBus.on(EVENTS.BOSS_SPAWNED, this.onBossSpawned, this);
  }

  private onWaveStarted(wave: number, isBoss: boolean): void {
    if (isBoss) {
      this.show(`WAVE ${wave} - BOSS INCOMING`, '#FF4444');
    } else {
      this.show(`WAVE ${wave}`, '#88CCFF');
    }
  }

  private onBossSpawned(_type: string): void {
    this.show('BOSS INCOMING!', '#FF4444');
  }

  public show(message: string, color: string): void {
    this.text.setText(message);
    this.text.setStyle({ color, stroke: '#000000', strokeThickness: 6 });
    this.text.setAlpha(1);
    this.text.setScale(0.5);

    this.scene.tweens.add({
      targets: this.text,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.scene.tweens.add({
      targets: this.text,
      alpha: 0,
      delay: 1500,
      duration: 500,
    });
  }

  public destroy(): void {
    EventBus.off(EVENTS.WAVE_STARTED, this.onWaveStarted, this);
    EventBus.off(EVENTS.BOSS_SPAWNED, this.onBossSpawned, this);
  }
}
