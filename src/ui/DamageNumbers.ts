import Phaser from 'phaser';
import { DEPTHS } from '../constants';

interface DamageText {
  text: Phaser.GameObjects.Text;
  timer: number;
  maxTimer: number;
}

export class DamageNumbers {
  private scene: Phaser.Scene;
  private pool: DamageText[] = [];
  private active: DamageText[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Pre-create pool
    for (let i = 0; i < 40; i++) {
      const text = scene.add.text(0, 0, '', {
        fontSize: '22px',
        fontFamily: '"Trebuchet MS", Verdana, sans-serif',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      }).setResolution(16);
      text.setDepth(DEPTHS.EFFECTS + 10);
      text.setVisible(false);
      this.pool.push({ text, timer: 0, maxTimer: 600 });
    }
  }

  public spawn(x: number, y: number, amount: number, color = '#FFFFFF'): void {
    const item = this.pool.pop();
    if (!item) return;

    item.text.setText(String(Math.floor(amount)));
    item.text.setPosition(
      x - 8 + (Math.random() - 0.5) * 20,
      y - 16 + (Math.random() - 0.5) * 12,
    );
    item.text.setVisible(true);
    item.text.setAlpha(1);
    item.text.setStyle({ color, fontSize: '20px' });
    item.text.setScale(1);
    item.timer = 600;
    item.maxTimer = 600;
    this.active.push(item);
  }

  public spawnCrit(x: number, y: number, amount: number): void {
    const item = this.pool.pop();
    if (!item) return;

    item.text.setText(`${Math.floor(amount)}!`);
    item.text.setPosition(
      x - 12 + (Math.random() - 0.5) * 20,
      y - 24 + (Math.random() - 0.5) * 12,
    );
    item.text.setVisible(true);
    item.text.setAlpha(1);
    item.text.setStyle({ color: '#FFDD00', fontSize: '26px', fontStyle: 'bold' });
    item.text.setScale(1.3);
    item.timer = 800;
    item.maxTimer = 800;
    this.active.push(item);
  }

  public spawnText(x: number, y: number, text: string, color: string): void {
    const item = this.pool.pop();
    if (!item) return;

    item.text.setText(text);
    item.text.setPosition(x - 16, y - 16);
    item.text.setVisible(true);
    item.text.setAlpha(1);
    item.text.setStyle({ color, fontSize: '18px' });
    item.text.setScale(1);
    item.timer = 800;
    item.maxTimer = 800;
    this.active.push(item);
  }

  public update(_time: number, delta: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const item = this.active[i];
      item.timer -= delta;
      item.text.y -= delta * 0.06;
      item.text.setAlpha(Math.max(0, item.timer / item.maxTimer));

      // Crit scale pop effect (scale down from large)
      if (item.text.scaleX > 1) {
        const progress = 1 - (item.timer / item.maxTimer);
        item.text.setScale(Math.max(1, item.text.scaleX - delta * 0.002));
      }

      if (item.timer <= 0) {
        item.text.setVisible(false);
        item.text.setScale(1);
        this.pool.push(item);
        this.active.splice(i, 1);
      }
    }
  }
}
