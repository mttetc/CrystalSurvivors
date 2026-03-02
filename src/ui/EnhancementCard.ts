import Phaser from 'phaser';
import { EnhancementCard as CardData } from '../types';
import { EnhancementCategory, Rarity, JobId, WeaponId } from '../constants';
import { RARITY_COLORS, RARITY_NAMES } from '../systems/EnhancementManager';
import { JOB_DEFS } from '../data/jobs';
import { WEAPON_DEFS } from '../data/weapons';

const FONT = 'NinjaFont, "Trebuchet MS", Verdana, sans-serif';

const CATEGORY_COLORS: Record<string, string> = {
  [EnhancementCategory.JOB_SELECTION]: '#FFD700',
  [EnhancementCategory.JOB_AWAKENING]: '#FF4488',
  [EnhancementCategory.JOB_SKILL]: '#44FF88',
  [EnhancementCategory.NEW_WEAPON]: '#FFAA44',
  [EnhancementCategory.WEAPON_UPGRADE]: '#44AAFF',
  [EnhancementCategory.NEW_ENCHANT]: '#DD44FF',
  [EnhancementCategory.ENCHANT_UPGRADE]: '#FF44AA',
  [EnhancementCategory.APPLY_ELEMENT]: '#44DDFF',
  [EnhancementCategory.ELEMENT_UPGRADE]: '#44FFDD',
  [EnhancementCategory.MALUS_TRADE]: '#FF4444',
  [EnhancementCategory.MASTERY_SKILL]: '#FF88CC',
  [EnhancementCategory.SYNERGY_UPGRADE]: '#DD88FF',
  [EnhancementCategory.STAT_BOOST]: '#88DDFF',
};

export class EnhancementCardUI {
  public container: Phaser.GameObjects.Container;
  public card: CardData;
  private bg: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, card: CardData, index: number) {
    this.card = card;
    this.container = scene.add.container(x, y);

    const w = 300, h = 400;
    const rarityColor = RARITY_COLORS[card.rarity] ?? '#AAAAAA';
    const catColor = CATEGORY_COLORS[card.category] ?? '#FFFFFF';
    const isMalus = card.category === EnhancementCategory.MALUS_TRADE;
    const isAwakening = card.category === EnhancementCategory.JOB_AWAKENING;

    // Nine-patch panel background (with rarity tint fallback)
    const hasPanel = scene.textures.exists('ui_panel');
    if (hasPanel) {
      const panel = scene.add.nineslice(0, 0, 'ui_panel', undefined, w, h, 5, 5, 5, 5);
      panel.setAlpha(0.92);
      this.container.add(panel);
    }

    // Background with rarity-tinted color
    const bgTint = isAwakening ? 0x2E1828
      : isMalus ? 0x2E1818
      : card.rarity === Rarity.MYTHIC ? 0x2E0A0A
      : card.rarity === Rarity.LEGENDARY ? 0x2A2218
      : card.rarity === Rarity.EPIC ? 0x1E1A2E
      : card.rarity === Rarity.RARE ? 0x1A1E2E
      : 0x1A1A2E;
    this.bg = scene.add.rectangle(0, 0, w - 8, h - 8, bgTint);

    const borderColor = isAwakening ? 0xFF4488
      : isMalus ? 0xFF4444
      : Phaser.Display.Color.HexStringToColor(rarityColor).color;
    this.bg.setStrokeStyle(isAwakening ? 4 : 2, borderColor);
    this.container.add(this.bg);

    // Selection border
    this.border = scene.add.rectangle(0, 0, w + 8, h + 8);
    this.border.setStrokeStyle(3, 0xFFFFFF);
    this.border.setAlpha(0);
    this.container.add(this.border);

    // Rarity label
    const rarityLabel = scene.add.text(0, -178, RARITY_NAMES[card.rarity] ?? '', {
      fontSize: '20px',
      fontFamily: FONT,
      color: rarityColor,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2);
    this.container.add(rarityLabel);

    // Category-specific rendering
    if (isAwakening) {
      const catLabel = scene.add.text(0, -148, 'AWAKENING', {
        fontSize: '22px',
        fontFamily: FONT,
        color: '#FF4488',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setResolution(2);
      this.container.add(catLabel);
    } else if (isMalus) {
      const catLabel = scene.add.text(0, -148, 'TRADE-OFF', {
        fontSize: '22px',
        fontFamily: FONT,
        color: '#FF4444',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setResolution(2);
      this.container.add(catLabel);
    } else if ((card.category === EnhancementCategory.JOB_SKILL || card.category === EnhancementCategory.MASTERY_SKILL) && card.jobId) {
      const jobDef = JOB_DEFS[card.jobId];
      if (jobDef) {
        if (scene.textures.exists(jobDef.icon)) {
          const jobIcon = scene.add.image(-60, -148, jobDef.icon);
          jobIcon.setScale(0.8);
          this.container.add(jobIcon);
        }
        const labelPrefix = card.category === EnhancementCategory.MASTERY_SKILL ? '[M] ' : '';
        const jobBadge = scene.add.text(0, -148, `${labelPrefix}${jobDef.name.toUpperCase()}`, {
          fontSize: '20px',
          fontFamily: FONT,
          color: jobDef.color,
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2);
        this.container.add(jobBadge);
      }
    } else if (card.category === EnhancementCategory.JOB_SELECTION && card.jobId) {
      const jobDef = JOB_DEFS[card.jobId];
      if (jobDef) {
        this.bg.setStrokeStyle(4, Phaser.Display.Color.HexStringToColor(jobDef.color).color);
        const catLabel = scene.add.text(0, -148, 'NEW JOB', {
          fontSize: '22px',
          fontFamily: FONT,
          color: '#FFD700',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2);
        this.container.add(catLabel);
      }
    } else {
      const catLabel = scene.add.text(0, -148, this.getCategoryLabel(card.category), {
        fontSize: '22px',
        fontFamily: FONT,
        color: catColor,
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setResolution(2);
      this.container.add(catLabel);
    }

    // Icon with inventory cell background
    if (card.icon && scene.textures.exists(card.icon)) {
      if (scene.textures.exists('ui_inv_cell')) {
        const cellBg = scene.add.image(0, -96, 'ui_inv_cell');
        cellBg.setDisplaySize(48, 48);
        cellBg.setAlpha(0.5);
        this.container.add(cellBg);
      }
      const icon = scene.add.image(0, -96, card.icon);
      icon.setScale(2.5);
      this.container.add(icon);
    }

    // Title
    const title = scene.add.text(0, -48, card.title, {
      fontSize: '24px',
      fontFamily: FONT,
      color: '#FFFFFF',
      fontStyle: 'bold',
      wordWrap: { width: w - 32 },
      align: 'center',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2);
    this.container.add(title);

    // Description
    if (card.bonusText && card.malusText) {
      const bonusLabel = scene.add.text(0, 4, card.bonusText, {
        fontSize: '16px',
        fontFamily: FONT,
        color: '#44FF44',
        wordWrap: { width: w - 32 },
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setResolution(2);
      this.container.add(bonusLabel);

      const malusLabel = scene.add.text(0, 46, card.malusText, {
        fontSize: '16px',
        fontFamily: FONT,
        color: '#FF4444',
        wordWrap: { width: w - 32 },
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setResolution(2);
      this.container.add(malusLabel);
    } else if (card.category === EnhancementCategory.JOB_SELECTION && card.jobId) {
      const jobDef = JOB_DEFS[card.jobId];
      if (jobDef) {
        const desc = scene.add.text(0, -2, jobDef.description, {
          fontSize: '15px',
          fontFamily: FONT,
          color: '#BBBBBB',
          wordWrap: { width: w - 28 },
          align: 'center',
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5, 0).setResolution(2);
        this.container.add(desc);

        let weaponName = '';
        for (const wId of Object.values(WeaponId)) {
          const wDef = WEAPON_DEFS[wId];
          if (wDef.affinityJob === card.jobId) { weaponName = wDef.name; break; }
        }

        const weaponLabel = scene.add.text(0, 60, `Weapon: ${weaponName}`, {
          fontSize: '15px',
          fontFamily: FONT,
          color: '#FFAA44',
          wordWrap: { width: w - 28 },
          align: 'center',
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5, 0).setResolution(2);
        this.container.add(weaponLabel);
      }
    } else {
      const desc = scene.add.text(0, 16, card.description, {
        fontSize: '16px',
        fontFamily: FONT,
        color: '#BBBBBB',
        wordWrap: { width: w - 32 },
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setResolution(2);
      this.container.add(desc);
    }

    // Key hint with choice box
    if (scene.textures.exists('ui_choice_box')) {
      const choiceBg = scene.add.image(0, 162, 'ui_choice_box');
      choiceBg.setDisplaySize(46, 30);
      choiceBg.setAlpha(0.7);
      this.container.add(choiceBg);
    }

    const keyHint = scene.add.text(0, 162, `[${index + 1}]`, {
      fontSize: '26px',
      fontFamily: FONT,
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2);
    this.container.add(keyHint);

    // Interactive
    this.bg.setInteractive({ useHandCursor: true });
    this.bg.on('pointerover', () => this.border.setAlpha(1));
    this.bg.on('pointerout', () => this.border.setAlpha(0));
  }

  public setSelected(selected: boolean): void {
    this.border.setAlpha(selected ? 1 : 0);
    const rarityBg = this.card.rarity === Rarity.MYTHIC ? 0x3E1A1A
      : this.card.rarity === Rarity.LEGENDARY ? 0x3A3228
      : this.card.rarity === Rarity.EPIC ? 0x2E2A3E
      : this.card.rarity === Rarity.RARE ? 0x2A2E3E
      : 0x2A2A4E;
    this.bg.setFillStyle(selected ? rarityBg : (this.bg.fillColor));
  }

  private getCategoryLabel(cat: string): string {
    switch (cat) {
      case EnhancementCategory.JOB_SELECTION: return 'NEW JOB';
      case EnhancementCategory.JOB_AWAKENING: return 'AWAKENING';
      case EnhancementCategory.JOB_SKILL: return 'JOB SKILL';
      case EnhancementCategory.NEW_WEAPON: return 'NEW WEAPON';
      case EnhancementCategory.WEAPON_UPGRADE: return 'UPGRADE';
      case EnhancementCategory.NEW_ENCHANT: return 'ENCHANT';
      case EnhancementCategory.ENCHANT_UPGRADE: return 'ENCHANT UP';
      case EnhancementCategory.APPLY_ELEMENT: return 'ELEMENT';
      case EnhancementCategory.ELEMENT_UPGRADE: return 'ELEM. UP';
      case EnhancementCategory.MALUS_TRADE: return 'TRADE-OFF';
      case EnhancementCategory.MASTERY_SKILL: return 'MASTERY';
      case EnhancementCategory.SYNERGY_UPGRADE: return 'SYNERGY';
      case EnhancementCategory.STAT_BOOST: return 'STAT';
      default: return '';
    }
  }

  public destroy(): void {
    this.container.destroy();
  }
}
