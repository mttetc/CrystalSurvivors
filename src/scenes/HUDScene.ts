import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, SCENES, EVENTS, PLAYER_MAX_HP,
  EnhancementCategory,
} from '../constants';
import { EventBus } from '../systems/EventBus';
import { EnhancementCard } from '../types';

type HUDFamily = 'job' | 'weapon' | 'enchant';

interface HUDEnhancement {
  key: string;
  icon: string;
  family: HUDFamily;
  level: number;
}

const FAMILY_COLORS: Record<HUDFamily, number> = {
  job: 0xFFDD44,
  weapon: 0xFFAA44,
  enchant: 0xDD44FF,
};

export class HUDScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private xpText!: Phaser.GameObjects.Text;
  private dashText!: Phaser.GameObjects.Text;
  private dashGfx!: Phaser.GameObjects.Graphics;

  private currentHP = PLAYER_MAX_HP;
  private maxHP = PLAYER_MAX_HP;
  private currentXP = 0;
  private xpToNext = 8;
  private currentWave = 0;
  private gameTimer = 0;
  private kills = 0;
  private dashCharges = 2;
  private maxDashCharges = 2;
  private dashRechargeProgress = 0;

  // Enhancement tracking - unique icons with levels
  private enhancements: Map<string, HUDEnhancement> = new Map();
  private enhancementContainer!: Phaser.GameObjects.Container;

  constructor() {
    super(SCENES.HUD);
  }

  create(): void {
    // Reset all state on each create (Phaser reuses scene instances)
    this.currentHP = PLAYER_MAX_HP;
    this.maxHP = PLAYER_MAX_HP;
    this.currentXP = 0;
    this.xpToNext = 8;
    this.currentWave = 0;
    this.gameTimer = 0;
    this.kills = 0;
    this.dashCharges = 2;
    this.maxDashCharges = 2;
    this.enhancements = new Map();

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '24px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold',
    };

    // HP bar
    this.hpBar = this.add.graphics();

    // HP number
    this.hpText = this.add.text(196, GAME_HEIGHT - 34, '', {
      ...textStyle,
      fontSize: '22px',
      color: '#CCCCCC',
    }).setResolution(16);

    // XP bar
    this.xpBar = this.add.graphics();

    // XP text
    this.xpText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 8, '', {
      ...textStyle,
      fontSize: '18px',
      color: '#88AAFF',
    }).setOrigin(0.5).setResolution(16);

    // Level text
    this.levelText = this.add.text(GAME_WIDTH / 2, 4, 'Lv 1', {
      ...textStyle,
      fontSize: '26px',
      color: '#FFDD44',
    }).setOrigin(0.5, 0).setResolution(16);

    // Wave text
    this.waveText = this.add.text(8, 4, 'Wave 0', {
      ...textStyle,
      fontSize: '26px',
      color: '#88CCFF',
    }).setResolution(16);

    // Timer
    this.timerText = this.add.text(GAME_WIDTH - 8, 4, '0:00', {
      ...textStyle,
      fontSize: '26px',
      color: '#CCCCCC',
    }).setOrigin(1, 0).setResolution(16);

    // Kill count
    this.killText = this.add.text(GAME_WIDTH - 8, 32, 'Kills: 0', {
      ...textStyle,
      fontSize: '20px',
      color: '#AAAAAA',
    }).setOrigin(1, 0).setResolution(16);

    // Stats display (bottom right)
    this.statsText = this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 68, '', {
      ...textStyle,
      fontSize: '18px',
      color: '#88CC88',
      align: 'right',
    }).setOrigin(1, 0).setResolution(16);

    // Dash charges display (near the HP bar)
    this.dashGfx = this.add.graphics();
    this.dashText = this.add.text(8, GAME_HEIGHT - 70, 'Dash', {
      ...textStyle,
      fontSize: '20px',
      color: '#66CCFF',
    }).setResolution(16);
    this.drawDashCharges();

    // Enhancement icon container (top-right, below kill count)
    this.enhancementContainer = this.add.container(0, 0);

    this.drawHP();
    this.drawXP();

    // Events
    EventBus.on(EVENTS.PLAYER_HEALTH_CHANGED, (hp: number, max: number) => {
      this.currentHP = hp;
      this.maxHP = max;
      this.drawHP();
    });

    EventBus.on(EVENTS.XP_CHANGED, (xp: number, toNext: number) => {
      this.currentXP = xp;
      this.xpToNext = toNext;
      this.drawXP();
      this.xpText.setText(`${Math.floor(xp)}/${Math.floor(toNext)}`);
    });

    EventBus.on(EVENTS.LEVEL_UP, (level: number) => {
      this.levelText.setText(`Lv ${level}`);
      this.currentXP = 0;
      this.drawXP();
    });

    EventBus.on(EVENTS.WAVE_STARTED, (wave: number) => {
      this.currentWave = wave;
      this.waveText.setText(`Wave ${wave}`);
    });

    EventBus.on(EVENTS.ENEMY_KILLED, () => {
      this.kills++;
      this.killText.setText(`Kills: ${this.kills}`);
    });

    EventBus.on(EVENTS.STATS_CHANGED, () => {
      this.updateStatsDisplay();
    });

    EventBus.on(EVENTS.PLAYER_DASHED, (charges: number, maxCharges: number) => {
      this.dashCharges = charges;
      this.maxDashCharges = maxCharges;
      this.dashRechargeProgress = 0;
      this.drawDashCharges();
    });

    EventBus.on(EVENTS.PLAYER_DASH_RECHARGE_TICK, (progress: number, charges: number, maxCharges: number) => {
      this.dashRechargeProgress = progress;
      this.dashCharges = charges;
      this.maxDashCharges = maxCharges;
      this.drawDashCharges();
    });

    // Listen for enhancements picked to show icons
    EventBus.on(EVENTS.ENHANCEMENT_PICKED, (card: EnhancementCard) => {
      this.trackEnhancement(card);
    });
  }

  update(_time: number, delta: number): void {
    const gameScene = this.scene.get(SCENES.GAME) as any;
    if (gameScene?.isPaused) return;

    this.gameTimer += delta;
    const seconds = Math.floor(this.gameTimer / 1000);
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    this.timerText.setText(`${min}:${sec.toString().padStart(2, '0')}`);

    // Update stats every 500ms
    if (Math.floor(this.gameTimer / 500) !== Math.floor((this.gameTimer - delta) / 500)) {
      this.updateStatsDisplay();
    }
  }

  private updateStatsDisplay(): void {
    const gameScene = this.scene.get(SCENES.GAME) as any;
    if (!gameScene?.player) return;

    const p = gameScene.player;
    const mods = p.playerState.modifiers;
    const lines: string[] = [];

    if (mods.damageMultiplier > 1) lines.push(`DMG x${mods.damageMultiplier.toFixed(1)}`);
    if (mods.speedMultiplier > 1) lines.push(`SPD x${mods.speedMultiplier.toFixed(1)}`);
    if (mods.armor > 0) lines.push(`ARM ${mods.armor}`);
    if (mods.regenPerSecond > 0) lines.push(`RGN ${mods.regenPerSecond}/s`);
    if (mods.cooldownMultiplier < 1) lines.push(`CDR ${Math.round((1 - mods.cooldownMultiplier) * 100)}%`);
    if (mods.xpMultiplier > 1) lines.push(`XP x${mods.xpMultiplier.toFixed(1)}`);

    this.statsText.setText(lines.join('\n'));
  }

  private trackEnhancement(card: EnhancementCard): void {
    let key: string;
    let icon: string;
    let family: HUDFamily;

    switch (card.category) {
      case EnhancementCategory.NEW_WEAPON:
      case EnhancementCategory.WEAPON_UPGRADE:
        key = `weapon_${card.weaponId}`;
        icon = card.icon;
        family = 'weapon';
        break;
      case EnhancementCategory.NEW_ENCHANT:
      case EnhancementCategory.ENCHANT_UPGRADE:
        key = `enchant_${card.targetWeaponId}_${card.enchantId}`;
        icon = card.icon;
        family = 'enchant';
        break;
      case EnhancementCategory.JOB_SKILL:
        key = `skill_${card.jobSkillId}`;
        icon = card.icon;
        family = 'job';
        break;
      case EnhancementCategory.JOB_SELECTION:
        key = `job_${card.jobId}`;
        icon = card.icon;
        family = 'job';
        break;
      default:
        return;
    }

    const existing = this.enhancements.get(key);
    if (existing) {
      existing.level++;
    } else {
      this.enhancements.set(key, { key, icon, family, level: 1 });
    }

    this.redrawEnhancements();
  }

  private redrawEnhancements(): void {
    // Clear previous
    this.enhancementContainer.removeAll(true);

    const iconSize = 28;
    const gap = 6;
    const labelH = 14;
    const cellW = iconSize + gap;
    const cellH = iconSize + labelH + 2;

    const familyOrder: HUDFamily[] = ['job', 'weapon', 'enchant'];

    const sorted = [...this.enhancements.values()].sort((a, b) => {
      return familyOrder.indexOf(a.family) - familyOrder.indexOf(b.family);
    });

    // Layout from right to left, below kill count
    const startX = GAME_WIDTH - 8;
    const startY = 56;

    for (let i = 0; i < sorted.length; i++) {
      const enh = sorted[i];
      const x = startX - (i * cellW) - iconSize / 2;
      const y = startY + iconSize / 2;

      // Icon
      let iconKey = enh.icon;
      if (!this.textures.exists(iconKey)) {
        iconKey = 'icon_pulse_pistol';
      }
      const img = this.add.image(x, y, iconKey);
      img.setTint(FAMILY_COLORS[enh.family]);
      this.enhancementContainer.add(img);

      // "x3" label below the icon
      if (enh.level > 1) {
        const lvText = this.add.text(x, y + iconSize / 2 + 1, `x${enh.level}`, {
          fontSize: '18px',
          fontFamily: '"Trebuchet MS", Verdana, sans-serif',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 4,
        }).setOrigin(0.5, 0).setResolution(16);
        this.enhancementContainer.add(lvText);
      }
    }

    // Family count summary line (compact row above icons)
    const familyCounts: Partial<Record<HUDFamily, number>> = {};
    for (const enh of this.enhancements.values()) {
      familyCounts[enh.family] = (familyCounts[enh.family] ?? 0) + enh.level;
    }

    // Draw family summary dots with counts (only if multiple families)
    const activeFamilies = Object.keys(familyCounts) as HUDFamily[];
    if (activeFamilies.length > 0) {
      let dotX = GAME_WIDTH - 8;
      const dotY = startY + cellH + 2;
      for (const fam of familyOrder) {
        const count = familyCounts[fam];
        if (!count) continue;

        const colorNum = FAMILY_COLORS[fam];
        const colorHex = '#' + colorNum.toString(16).padStart(6, '0');

        const badge = this.add.text(dotX, dotY, `${count}`, {
          fontSize: '18px',
          fontFamily: '"Trebuchet MS", Verdana, sans-serif',
          color: colorHex,
          stroke: '#000000',
          strokeThickness: 4,
          fontStyle: 'bold',
        }).setOrigin(1, 0).setResolution(16);
        this.enhancementContainer.add(badge);
        dotX -= badge.width + 12;
      }
    }
  }

  private drawDashCharges(): void {
    this.dashGfx.clear();
    const startX = 8;
    const y = GAME_HEIGHT - 56;
    const circleRadius = 9;
    const gap = 24;

    for (let i = 0; i < this.maxDashCharges; i++) {
      const cx = startX + circleRadius + i * gap;
      if (i < this.dashCharges) {
        // Filled circle for available charge
        this.dashGfx.fillStyle(0x66CCFF);
        this.dashGfx.fillCircle(cx, y, circleRadius);
      } else if (i === this.dashCharges && this.dashRechargeProgress > 0) {
        // Cooldown fill: arc from top, clockwise
        this.dashGfx.fillStyle(0x66CCFF, 0.4);
        this.dashGfx.slice(cx, y, circleRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.dashRechargeProgress, false);
        this.dashGfx.fillPath();
        // Dim border
        this.dashGfx.lineStyle(1, 0x66CCFF, 0.6);
        this.dashGfx.strokeCircle(cx, y, circleRadius);
      } else {
        // Empty circle for used charge
        this.dashGfx.lineStyle(1, 0x336688);
        this.dashGfx.strokeCircle(cx, y, circleRadius);
      }
    }
  }

  private drawHP(): void {
    this.hpBar.clear();
    const barWidth = 180;
    const barHeight = 18;
    const x = 8, y = GAME_HEIGHT - 28;

    // Background
    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(x, y, barWidth, barHeight);

    // Health
    const ratio = Math.max(0, this.currentHP / this.maxHP);
    const color = ratio > 0.5 ? 0x44CC44 : ratio > 0.25 ? 0xCCCC44 : 0xCC4444;
    this.hpBar.fillStyle(color);
    this.hpBar.fillRect(x, y, barWidth * ratio, barHeight);

    // Border
    this.hpBar.lineStyle(2, 0x666666);
    this.hpBar.strokeRect(x, y, barWidth, barHeight);

    // HP text
    this.hpText.setText(`${Math.floor(this.currentHP)}/${Math.floor(this.maxHP)}`);
  }

  private drawXP(): void {
    this.xpBar.clear();
    const barWidth = GAME_WIDTH - 16;
    const barHeight = 14;
    const x = 8, y = GAME_HEIGHT - 12;

    // Background
    this.xpBar.fillStyle(0x222233);
    this.xpBar.fillRect(x, y, barWidth, barHeight);

    // XP fill
    const ratio = Math.min(1, this.currentXP / Math.max(1, this.xpToNext));
    this.xpBar.fillStyle(0x4488FF);
    this.xpBar.fillRect(x, y, barWidth * ratio, barHeight);
  }
}
