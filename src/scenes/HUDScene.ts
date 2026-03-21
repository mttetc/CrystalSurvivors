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

const FONT = 'NinjaFont, "Trebuchet MS", Verdana, sans-serif';

export class HUDScene extends Phaser.Scene {
  // HP bar
  private hpBarBgSprite!: Phaser.GameObjects.Image;
  private hpBarFill!: Phaser.GameObjects.Rectangle;
  private hpHeartIcon!: Phaser.GameObjects.Sprite;
  // XP bar
  private xpBarBg!: Phaser.GameObjects.Rectangle;
  private xpBarFill!: Phaser.GameObjects.Rectangle;

  private levelText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private xpText!: Phaser.GameObjects.Text;
  private dashText!: Phaser.GameObjects.Text;

  // Dash charge sprites
  private dashSprites: Phaser.GameObjects.Image[] = [];
  private dashFillSprites: Phaser.GameObjects.Image[] = [];

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
    // Reset all state on each create
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
      fontFamily: FONT,
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold',
    };

    // ─── HP Bar (themed) ──────────────────────────────────────────────
    const hpX = 8;
    const hpY = GAME_HEIGHT - 32;
    const hpBarWidth = 180;
    const hpBarHeight = 14;

    // Wooden background frame for HP
    if (this.textures.exists('ui_rect_bg_wood')) {
      this.hpBarBgSprite = this.add.image(hpX + hpBarWidth / 2, hpY + hpBarHeight / 2, 'ui_rect_bg_wood');
      this.hpBarBgSprite.setDisplaySize(hpBarWidth + 12, hpBarHeight + 10);
    } else {
      // Fallback
      this.add.rectangle(hpX + hpBarWidth / 2, hpY + hpBarHeight / 2, hpBarWidth, hpBarHeight, 0x333333);
    }

    // HP fill bar
    this.hpBarFill = this.add.rectangle(hpX + 2, hpY + hpBarHeight / 2, 0, hpBarHeight - 4, 0x44CC44).setOrigin(0, 0.5);

    // Heart icon before HP bar
    if (this.textures.exists('ui_hearts_sheet')) {
      this.hpHeartIcon = this.add.sprite(hpX - 4, hpY + hpBarHeight / 2, 'ui_hearts_sheet', 0);
      this.hpHeartIcon.setScale(1.2);
    }

    // HP number
    this.hpText = this.add.text(hpX + hpBarWidth + 16, hpY - 2, '', {
      ...textStyle,
      fontSize: '20px',
      color: '#CCCCCC',
    }).setResolution(2);

    // ─── XP Bar (themed) ──────────────────────────────────────────────
    const xpBarWidth = GAME_WIDTH - 16;
    const xpBarHeight = 12;
    const xpX = 8;
    const xpY = GAME_HEIGHT - 12;
    this.xpBarBg = this.add.rectangle(xpX + xpBarWidth / 2, xpY + xpBarHeight / 2, xpBarWidth, xpBarHeight, 0x1a1a33);
    this.xpBarBg.setStrokeStyle(1, 0x334466);
    this.xpBarFill = this.add.rectangle(xpX, xpY + xpBarHeight / 2, 0, xpBarHeight - 2, 0x4488FF).setOrigin(0, 0.5);

    // XP text
    this.xpText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 8, '', {
      ...textStyle,
      fontSize: '16px',
      color: '#88AAFF',
    }).setOrigin(0.5).setResolution(2);

    // ─── Top bar info (with panel backgrounds) ────────────────────────
    // Wave text (top left) with panel
    if (this.textures.exists('ui_panel_bg')) {
      const wavePanelBg = this.add.nineslice(80, 16, 'ui_panel_bg', undefined, 150, 28, 5, 5, 5, 5);
      wavePanelBg.setAlpha(0.7);
    }
    this.waveText = this.add.text(8, 4, 'Wave 0', {
      ...textStyle,
      fontSize: '24px',
      color: '#88CCFF',
    }).setResolution(2);

    // Level text (top center)
    this.levelText = this.add.text(GAME_WIDTH / 2, 4, 'Lv 1', {
      ...textStyle,
      fontSize: '24px',
      color: '#FFDD44',
    }).setOrigin(0.5, 0).setResolution(2);

    // Timer (top right)
    this.timerText = this.add.text(GAME_WIDTH - 8, 4, '0:00', {
      ...textStyle,
      fontSize: '24px',
      color: '#CCCCCC',
    }).setOrigin(1, 0).setResolution(2);

    // Kill count
    this.killText = this.add.text(GAME_WIDTH - 8, 30, 'Kills: 0', {
      ...textStyle,
      fontSize: '18px',
      color: '#AAAAAA',
    }).setOrigin(1, 0).setResolution(2);

    // Stats display (bottom right)
    this.statsText = this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 68, '', {
      ...textStyle,
      fontSize: '16px',
      color: '#88CC88',
      align: 'right',
    }).setOrigin(1, 0).setResolution(2);

    // ─── Dash charges (sphere-based) ──────────────────────────────────
    this.dashText = this.add.text(8, GAME_HEIGHT - 72, 'Dash', {
      ...textStyle,
      fontSize: '18px',
      color: '#66CCFF',
    }).setResolution(2);
    this.dashSprites = [];
    this.dashFillSprites = [];
    this.createDashChargeSprites();

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
      this.updateDashCharges();
    });

    EventBus.on(EVENTS.PLAYER_DASH_RECHARGE_TICK, (progress: number, charges: number, maxCharges: number) => {
      this.dashRechargeProgress = progress;
      this.dashCharges = charges;
      this.maxDashCharges = maxCharges;
      this.updateDashCharges();
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
    const startY = 54;

    for (let i = 0; i < sorted.length; i++) {
      const enh = sorted[i];
      const x = startX - (i * cellW) - iconSize / 2;
      const y = startY + iconSize / 2;

      // Inventory cell background for each icon
      if (this.textures.exists('ui_inv_cell')) {
        const cell = this.add.image(x, y, 'ui_inv_cell');
        cell.setDisplaySize(iconSize + 4, iconSize + 4);
        cell.setAlpha(0.6);
        this.enhancementContainer.add(cell);
      }

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
          fontSize: '16px',
          fontFamily: FONT,
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 4,
        }).setOrigin(0.5, 0).setResolution(2);
        this.enhancementContainer.add(lvText);
      }
    }

    // Family count summary line
    const familyCounts: Partial<Record<HUDFamily, number>> = {};
    for (const enh of this.enhancements.values()) {
      familyCounts[enh.family] = (familyCounts[enh.family] ?? 0) + enh.level;
    }

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
          fontSize: '16px',
          fontFamily: FONT,
          color: colorHex,
          stroke: '#000000',
          strokeThickness: 4,
          fontStyle: 'bold',
        }).setOrigin(1, 0).setResolution(2);
        this.enhancementContainer.add(badge);
        dotX -= badge.width + 12;
      }
    }
  }

  private createDashChargeSprites(): void {
    // Clean up old sprites
    for (const s of this.dashSprites) s.destroy();
    for (const s of this.dashFillSprites) s.destroy();
    this.dashSprites = [];
    this.dashFillSprites = [];

    // Position dots after "Dash" text with spacing
    const dashTextWidth = this.dashText.width;
    const startX = 8 + dashTextWidth + 12;
    const y = GAME_HEIGHT - 56;
    const gap = 24;

    // Use sphere receptacles for dash charges
    const hasSphere = this.textures.exists('ui_sphere_bg');

    for (let i = 0; i < this.maxDashCharges; i++) {
      const cx = startX + i * gap;

      if (hasSphere) {
        // Background sphere
        const bg = this.add.image(cx, y, 'ui_sphere_bg');
        bg.setDisplaySize(18, 18);
        bg.setAlpha(0.6);
        this.dashSprites.push(bg);

        // Fill sphere (mana color for dash)
        const fill = this.add.image(cx, y, 'ui_sphere_mana');
        fill.setDisplaySize(14, 14);
        this.dashFillSprites.push(fill);
      } else {
        // Fallback to circle sprites
        const tex = this.textures.exists('fx_circle_white') ? 'fx_circle_white' : 'fx_circle_spark';
        const border = this.add.image(cx, y, tex);
        border.setScale(18 / 32);
        border.setTint(0x336688);
        border.setAlpha(0.6);
        this.dashSprites.push(border);

        const fill = this.add.image(cx, y, tex);
        fill.setScale(18 / 32);
        fill.setTint(0x66CCFF);
        this.dashFillSprites.push(fill);
      }
    }
    this.updateDashCharges();
  }

  private updateDashCharges(): void {
    for (let i = 0; i < this.dashFillSprites.length; i++) {
      const fill = this.dashFillSprites[i];
      if (i < this.dashCharges) {
        fill.setAlpha(1);
        fill.setScale(fill.scaleX > 0 ? fill.scaleX : 1);
      } else if (i === this.dashCharges && this.dashRechargeProgress > 0) {
        fill.setAlpha(0.4);
        const baseScale = this.textures.exists('ui_sphere_mana') ? 1 : (14 / 32);
        fill.setScale(baseScale * this.dashRechargeProgress);
      } else {
        fill.setAlpha(0);
      }
    }
  }

  private drawHP(): void {
    const barWidth = 176;
    const ratio = Math.max(0, this.currentHP / this.maxHP);
    const color = ratio > 0.5 ? 0x44CC44 : ratio > 0.25 ? 0xCCCC44 : 0xCC4444;
    this.hpBarFill.width = barWidth * ratio;
    this.hpBarFill.setFillStyle(color);
    this.hpText.setText(`${Math.floor(this.currentHP)}/${Math.floor(this.maxHP)}`);

    // Update heart icon frame based on HP ratio (spritesheet: 0=full...4=empty)
    if (this.hpHeartIcon) {
      const frame = ratio > 0.75 ? 0 : ratio > 0.5 ? 1 : ratio > 0.25 ? 2 : ratio > 0 ? 3 : 4;
      this.hpHeartIcon.setFrame(frame);
    }
  }

  private drawXP(): void {
    const barWidth = GAME_WIDTH - 16;
    const ratio = Math.min(1, this.currentXP / Math.max(1, this.xpToNext));
    this.xpBarFill.width = barWidth * ratio;
  }
}
