import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES, JobId, WeaponId } from '../constants';
import { JOB_DEFS } from '../data/jobs';
import { WEAPON_DEFS } from '../data/weapons';

const ALL_JOBS: JobId[] = Object.values(JobId);
const COLS = 5;
const ROWS = 3;
const CARD_W = 84;
const CARD_H = 82;
const GAP_X = 8;
const GAP_Y = 6;

// Map each job to its player texture key
function getPlayerTexture(jobId: JobId): string {
  const key = 'player_' + jobId;
  return key;
}

function getAffinityWeaponName(jobId: JobId): string {
  for (const wId of Object.values(WeaponId)) {
    const def = WEAPON_DEFS[wId];
    if (def.affinityJob === jobId) return def.name;
  }
  return '';
}

export class CharSelectScene extends Phaser.Scene {
  private selectedIndex = 0;
  private selectorGfx!: Phaser.GameObjects.Graphics;
  private inputEnabled = true;
  private infoText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private skillText!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENES.CHAR_SELECT);
  }

  create(): void {
    this.selectedIndex = 0;
    this.inputEnabled = true;

    this.cameras.main.setBackgroundColor('#080818');

    // Title
    this.add.text(GAME_WIDTH / 2, 8, 'CHOOSE YOUR CLASS', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5, 0).setResolution(8);

    // Grid layout
    const totalW = COLS * CARD_W + (COLS - 1) * GAP_X;
    const startX = (GAME_WIDTH - totalW) / 2;
    const startY = 28;

    for (let i = 0; i < ALL_JOBS.length; i++) {
      const jobId = ALL_JOBS[i];
      const job = JOB_DEFS[jobId];
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const cx = startX + col * (CARD_W + GAP_X) + CARD_W / 2;
      const cy = startY + row * (CARD_H + GAP_Y) + CARD_H / 2;

      // Card background
      const bg = this.add.graphics();
      const jobColor = Phaser.Display.Color.HexStringToColor(job.color).color;
      bg.fillStyle(0x111133, 0.85);
      bg.fillRoundedRect(cx - CARD_W / 2, cy - CARD_H / 2, CARD_W, CARD_H, 3);
      bg.lineStyle(2, jobColor, 0.6);
      bg.strokeRoundedRect(cx - CARD_W / 2, cy - CARD_H / 2, CARD_W, CARD_H, 3);

      // Player sprite preview (animated)
      const textureKey = getPlayerTexture(jobId);
      const hasTexture = this.textures.exists(textureKey);
      const sprite = this.add.sprite(cx, cy - 12, hasTexture ? textureKey : 'player', 0);
      sprite.setScale(2);

      // Animate walk
      let animFrame = 0;
      this.time.addEvent({
        delay: 220 + i * 10,
        loop: true,
        callback: () => {
          animFrame = (animFrame + 1) % 4;
          sprite.setFrame(animFrame);
        },
      });

      // Job name
      this.add.text(cx, cy + 22, job.name, {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: job.color,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setResolution(8);

      // First skill name (small)
      const firstSkillName = job.skills[0] ? job.skills[0].replace(/_/g, ' ') : '';
      this.add.text(cx, cy + 33, firstSkillName, {
        fontSize: '7px',
        fontFamily: 'monospace',
        color: '#666688',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setResolution(8);
    }

    // Selection highlight
    this.selectorGfx = this.add.graphics();
    this.selectorGfx.setDepth(100);

    // Info bar at bottom
    this.infoText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 36, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#AAAACC',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setResolution(8);

    this.weaponText = this.add.text(GAME_WIDTH / 2 - 100, GAME_HEIGHT - 22, '', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#FFAA44',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0.5).setResolution(8);

    this.skillText = this.add.text(GAME_WIDTH / 2 + 100, GAME_HEIGHT - 22, '', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#44AAFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0.5).setResolution(8);

    // Controls hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 8, 'Arrows to select  |  ENTER to confirm', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#333355',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setResolution(8);

    this.drawSelector();
    this.updateInfo();

    // Input
    const kb = this.input.keyboard!;
    kb.on('keydown-LEFT', () => this.moveSelection(-1, 0));
    kb.on('keydown-RIGHT', () => this.moveSelection(1, 0));
    kb.on('keydown-UP', () => this.moveSelection(0, -1));
    kb.on('keydown-DOWN', () => this.moveSelection(0, 1));
    kb.on('keydown-A', () => this.moveSelection(-1, 0));
    kb.on('keydown-D', () => this.moveSelection(1, 0));
    kb.on('keydown-W', () => this.moveSelection(0, -1));
    kb.on('keydown-S', () => this.moveSelection(0, 1));
    kb.on('keydown-ENTER', () => this.confirmSelection());
    kb.on('keydown-SPACE', () => this.confirmSelection());
  }

  private moveSelection(dx: number, dy: number): void {
    if (!this.inputEnabled) return;
    const col = this.selectedIndex % COLS;
    const row = Math.floor(this.selectedIndex / COLS);
    let newCol = col + dx;
    let newRow = row + dy;

    // Wrap
    if (newCol < 0) newCol = COLS - 1;
    if (newCol >= COLS) newCol = 0;
    if (newRow < 0) newRow = ROWS - 1;
    if (newRow >= ROWS) newRow = 0;

    const newIndex = newRow * COLS + newCol;
    if (newIndex >= 0 && newIndex < ALL_JOBS.length) {
      this.selectedIndex = newIndex;
      this.drawSelector();
      this.updateInfo();
    }
  }

  private drawSelector(): void {
    this.selectorGfx.clear();
    const totalW = COLS * CARD_W + (COLS - 1) * GAP_X;
    const startX = (GAME_WIDTH - totalW) / 2;
    const startY = 28;

    const col = this.selectedIndex % COLS;
    const row = Math.floor(this.selectedIndex / COLS);
    const cx = startX + col * (CARD_W + GAP_X) + CARD_W / 2;
    const cy = startY + row * (CARD_H + GAP_Y) + CARD_H / 2;

    // Gold selector border
    this.selectorGfx.lineStyle(2, 0xFFD700, 1);
    this.selectorGfx.strokeRoundedRect(
      cx - CARD_W / 2 - 2, cy - CARD_H / 2 - 2,
      CARD_W + 4, CARD_H + 4, 5,
    );

    // Subtle glow
    this.selectorGfx.lineStyle(1, 0xFFD700, 0.3);
    this.selectorGfx.strokeRoundedRect(
      cx - CARD_W / 2 - 4, cy - CARD_H / 2 - 4,
      CARD_W + 8, CARD_H + 8, 7,
    );
  }

  private updateInfo(): void {
    const jobId = ALL_JOBS[this.selectedIndex];
    const job = JOB_DEFS[jobId];
    this.infoText.setText(job.description);
    this.weaponText.setText('Weapon: ' + getAffinityWeaponName(jobId));

    const firstSkillId = job.skills[0];
    const skillName = firstSkillId ? firstSkillId.replace(/_/g, ' ') : '';
    this.skillText.setText('Skill: ' + skillName);
  }

  private confirmSelection(): void {
    if (!this.inputEnabled) return;
    this.inputEnabled = false;

    const jobId = ALL_JOBS[this.selectedIndex];
    const textureKey = getPlayerTexture(jobId);

    this.cameras.main.flash(300, 255, 215, 0);

    this.time.delayedCall(400, () => {
      this.scene.start(SCENES.GAME, {
        startingJobId: jobId,
        playerTexture: this.textures.exists(textureKey) ? textureKey : 'player',
      });
    });
  }
}
