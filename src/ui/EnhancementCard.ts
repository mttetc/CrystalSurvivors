import Phaser from 'phaser';
import { EnhancementCard as CardData } from '../types';
import { EnhancementCategory, Rarity, JobId } from '../constants';
import { RARITY_COLORS, RARITY_NAMES } from '../systems/EnhancementManager';
import { JOB_DEFS } from '../data/jobs';

const CATEGORY_COLORS: Record<string, string> = {
  [EnhancementCategory.JOB_SELECTION]: '#FFD700',
  [EnhancementCategory.JOB_DOUBLE_DOWN]: '#FF4488',
  [EnhancementCategory.JOB_SKILL]: '#44FF88',
  [EnhancementCategory.NEW_WEAPON]: '#FFAA44',
  [EnhancementCategory.WEAPON_UPGRADE]: '#44AAFF',
  [EnhancementCategory.NEW_ENCHANT]: '#DD44FF',
  [EnhancementCategory.ENCHANT_UPGRADE]: '#FF44AA',
  [EnhancementCategory.APPLY_ELEMENT]: '#44DDFF',
  [EnhancementCategory.ELEMENT_UPGRADE]: '#44FFDD',
  [EnhancementCategory.MALUS_TRADE]: '#FF4444',
};

export class EnhancementCardUI {
  public container: Phaser.GameObjects.Container;
  public card: CardData;
  private bg: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, card: CardData, index: number) {
    this.card = card;
    this.container = scene.add.container(x, y);

    const w = 130, h = 165;
    const rarityColor = RARITY_COLORS[card.rarity] ?? '#AAAAAA';
    const catColor = CATEGORY_COLORS[card.category] ?? '#FFFFFF';
    const isMalus = card.category === EnhancementCategory.MALUS_TRADE;
    const isDoubleDown = card.category === EnhancementCategory.JOB_DOUBLE_DOWN;

    // Background with rarity-tinted color
    const bgTint = isDoubleDown ? 0x2E1828
      : isMalus ? 0x2E1818
      : card.rarity === Rarity.LEGENDARY ? 0x2A2218
      : card.rarity === Rarity.EPIC ? 0x1E1A2E
      : card.rarity === Rarity.RARE ? 0x1A1E2E
      : 0x1A1A2E;
    this.bg = scene.add.rectangle(0, 0, w, h, bgTint);

    const borderColor = isDoubleDown ? 0xFF4488
      : isMalus ? 0xFF4444
      : Phaser.Display.Color.HexStringToColor(rarityColor).color;
    this.bg.setStrokeStyle(isDoubleDown ? 3 : 2, borderColor);
    this.container.add(this.bg);

    // Selection border
    this.border = scene.add.rectangle(0, 0, w + 4, h + 4);
    this.border.setStrokeStyle(2, 0xFFFFFF);
    this.border.setAlpha(0);
    this.container.add(this.border);

    // Rarity label
    const rarityLabel = scene.add.text(0, -72, RARITY_NAMES[card.rarity] ?? '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: rarityColor,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setResolution(8);
    this.container.add(rarityLabel);

    // Category-specific rendering
    if (isDoubleDown) {
      // Double Down card: special golden/pink styling
      const catLabel = scene.add.text(0, -58, 'DOUBLE DOWN', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#FF4488',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setResolution(8);
      this.container.add(catLabel);
    } else if (isMalus) {
      // Malus card: skull warning
      const catLabel = scene.add.text(0, -58, 'TRADE-OFF', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#FF4444',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setResolution(8);
      this.container.add(catLabel);
    } else if (card.category === EnhancementCategory.JOB_SKILL && card.jobId) {
      const jobDef = JOB_DEFS[card.jobId];
      if (jobDef) {
        if (scene.textures.exists(jobDef.icon)) {
          const jobIcon = scene.add.image(-30, -58, jobDef.icon);
          jobIcon.setScale(0.8);
          this.container.add(jobIcon);
        }
        const jobBadge = scene.add.text(0, -58, jobDef.name.toUpperCase(), {
          fontSize: '10px',
          fontFamily: 'monospace',
          color: jobDef.color,
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5).setResolution(8);
        this.container.add(jobBadge);
      }
    } else if (card.category === EnhancementCategory.JOB_SELECTION && card.jobId) {
      const jobDef = JOB_DEFS[card.jobId];
      if (jobDef) {
        this.bg.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(jobDef.color).color);
        const catLabel = scene.add.text(0, -58, 'NEW JOB', {
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#FFD700',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5).setResolution(8);
        this.container.add(catLabel);
      }
    } else {
      const catLabel = scene.add.text(0, -58, this.getCategoryLabel(card.category), {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: catColor,
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setResolution(8);
      this.container.add(catLabel);
    }

    // Icon (if texture exists)
    if (card.icon && scene.textures.exists(card.icon)) {
      const icon = scene.add.image(0, -35, card.icon);
      icon.setScale(2);
      this.container.add(icon);
    }

    // Title
    const title = scene.add.text(0, -14, card.title, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      wordWrap: { width: w - 14 },
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setResolution(8);
    this.container.add(title);

    // Description - special handling for malus cards (green bonus / red malus)
    if (isMalus && card.bonusText && card.malusText) {
      const bonusLabel = scene.add.text(0, 10, card.bonusText, {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#44FF44',
        wordWrap: { width: w - 14 },
        align: 'center',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0.5).setResolution(8);
      this.container.add(bonusLabel);

      const malusLabel = scene.add.text(0, 30, card.malusText, {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#FF4444',
        wordWrap: { width: w - 14 },
        align: 'center',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0.5).setResolution(8);
      this.container.add(malusLabel);
    } else {
      const desc = scene.add.text(0, 16, card.description, {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#BBBBBB',
        wordWrap: { width: w - 14 },
        align: 'center',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0.5).setResolution(8);
      this.container.add(desc);
    }

    // Key hint
    const keyHint = scene.add.text(0, 65, `[${index + 1}]`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#888888',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setResolution(8);
    this.container.add(keyHint);

    // Interactive
    this.bg.setInteractive({ useHandCursor: true });
    this.bg.on('pointerover', () => this.border.setAlpha(1));
    this.bg.on('pointerout', () => this.border.setAlpha(0));
  }

  public setSelected(selected: boolean): void {
    this.border.setAlpha(selected ? 1 : 0);
    const rarityBg = this.card.rarity === Rarity.LEGENDARY ? 0x3A3228
      : this.card.rarity === Rarity.EPIC ? 0x2E2A3E
      : this.card.rarity === Rarity.RARE ? 0x2A2E3E
      : 0x2A2A4E;
    this.bg.setFillStyle(selected ? rarityBg : (this.bg.fillColor));
  }

  private getCategoryLabel(cat: string): string {
    switch (cat) {
      case EnhancementCategory.JOB_SELECTION: return 'NEW JOB';
      case EnhancementCategory.JOB_DOUBLE_DOWN: return 'DOUBLE DOWN';
      case EnhancementCategory.JOB_SKILL: return 'JOB SKILL';
      case EnhancementCategory.NEW_WEAPON: return 'NEW WEAPON';
      case EnhancementCategory.WEAPON_UPGRADE: return 'UPGRADE';
      case EnhancementCategory.NEW_ENCHANT: return 'ENCHANT';
      case EnhancementCategory.ENCHANT_UPGRADE: return 'ENCHANT UP';
      case EnhancementCategory.APPLY_ELEMENT: return 'ELEMENT';
      case EnhancementCategory.ELEMENT_UPGRADE: return 'ELEM. UP';
      case EnhancementCategory.MALUS_TRADE: return 'TRADE-OFF';
      default: return '';
    }
  }

  public destroy(): void {
    this.container.destroy();
  }
}
