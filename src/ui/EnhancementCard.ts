import Phaser from 'phaser';
import { EnhancementCard as CardData } from '../types';
import { EnhancementCategory, Rarity, JobId, WeaponId } from '../constants';
import { RARITY_COLORS, RARITY_NAMES } from '../systems/EnhancementManager';
import { JOB_DEFS } from '../data/jobs';
import { WEAPON_DEFS } from '../data/weapons';

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

    const w = 260, h = 330;
    const rarityColor = RARITY_COLORS[card.rarity] ?? '#AAAAAA';
    const catColor = CATEGORY_COLORS[card.category] ?? '#FFFFFF';
    const isMalus = card.category === EnhancementCategory.MALUS_TRADE;
    const isAwakening = card.category === EnhancementCategory.JOB_AWAKENING;

    // Background with rarity-tinted color
    const bgTint = isAwakening ? 0x2E1828
      : isMalus ? 0x2E1818
      : card.rarity === Rarity.MYTHIC ? 0x2E0A0A
      : card.rarity === Rarity.LEGENDARY ? 0x2A2218
      : card.rarity === Rarity.EPIC ? 0x1E1A2E
      : card.rarity === Rarity.RARE ? 0x1A1E2E
      : 0x1A1A2E;
    this.bg = scene.add.rectangle(0, 0, w, h, bgTint);

    const borderColor = isAwakening ? 0xFF4488
      : isMalus ? 0xFF4444
      : Phaser.Display.Color.HexStringToColor(rarityColor).color;
    this.bg.setStrokeStyle(isAwakening ? 6 : 3, borderColor);
    this.container.add(this.bg);

    // Selection border
    this.border = scene.add.rectangle(0, 0, w + 8, h + 8);
    this.border.setStrokeStyle(3, 0xFFFFFF);
    this.border.setAlpha(0);
    this.container.add(this.border);

    // Rarity label
    const rarityLabel = scene.add.text(0, -144, RARITY_NAMES[card.rarity] ?? '', {
      fontSize: '20px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: rarityColor,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(16);
    this.container.add(rarityLabel);

    // Category-specific rendering
    if (isAwakening) {
      // Awakening card: special golden/pink styling
      const catLabel = scene.add.text(0, -116, 'AWAKENING', {
        fontSize: '22px',
        fontFamily: '"Trebuchet MS", Verdana, sans-serif',
        color: '#FF4488',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setResolution(16);
      this.container.add(catLabel);
    } else if (isMalus) {
      // Malus card: skull warning
      const catLabel = scene.add.text(0, -116, 'TRADE-OFF', {
        fontSize: '22px',
        fontFamily: '"Trebuchet MS", Verdana, sans-serif',
        color: '#FF4444',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setResolution(16);
      this.container.add(catLabel);
    } else if ((card.category === EnhancementCategory.JOB_SKILL || card.category === EnhancementCategory.MASTERY_SKILL) && card.jobId) {
      const jobDef = JOB_DEFS[card.jobId];
      if (jobDef) {
        if (scene.textures.exists(jobDef.icon)) {
          const jobIcon = scene.add.image(-60, -116, jobDef.icon);
          jobIcon.setScale(0.8);
          this.container.add(jobIcon);
        }
        const labelPrefix = card.category === EnhancementCategory.MASTERY_SKILL ? '[M] ' : '';
        const jobBadge = scene.add.text(0, -116, `${labelPrefix}${jobDef.name.toUpperCase()}`, {
          fontSize: '20px',
          fontFamily: '"Trebuchet MS", Verdana, sans-serif',
          color: jobDef.color,
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4,
        }).setOrigin(0.5).setResolution(16);
        this.container.add(jobBadge);
      }
    } else if (card.category === EnhancementCategory.JOB_SELECTION && card.jobId) {
      const jobDef = JOB_DEFS[card.jobId];
      if (jobDef) {
        this.bg.setStrokeStyle(6, Phaser.Display.Color.HexStringToColor(jobDef.color).color);
        const catLabel = scene.add.text(0, -116, 'NEW JOB', {
          fontSize: '22px',
          fontFamily: '"Trebuchet MS", Verdana, sans-serif',
          color: '#FFD700',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4,
        }).setOrigin(0.5).setResolution(16);
        this.container.add(catLabel);
      }
    } else {
      const catLabel = scene.add.text(0, -116, this.getCategoryLabel(card.category), {
        fontSize: '22px',
        fontFamily: '"Trebuchet MS", Verdana, sans-serif',
        color: catColor,
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setResolution(16);
      this.container.add(catLabel);
    }

    // Icon (if texture exists)
    if (card.icon && scene.textures.exists(card.icon)) {
      const icon = scene.add.image(0, -70, card.icon);
      icon.setScale(2);
      this.container.add(icon);
    }

    // Title
    const title = scene.add.text(0, -28, card.title, {
      fontSize: '24px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold',
      wordWrap: { width: w - 28 },
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(16);
    this.container.add(title);

    // Description - special handling per category
    if (card.bonusText && card.malusText) {
      // Any card with bonus + malus split (trade-offs, Titan's Grip, etc.)
      const bonusLabel = scene.add.text(0, 20, card.bonusText, {
        fontSize: '16px',
        fontFamily: '"Trebuchet MS", Verdana, sans-serif',
        color: '#44FF44',
        wordWrap: { width: w - 28 },
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setResolution(16);
      this.container.add(bonusLabel);

      const malusLabel = scene.add.text(0, 56, card.malusText, {
        fontSize: '16px',
        fontFamily: '"Trebuchet MS", Verdana, sans-serif',
        color: '#FF4444',
        wordWrap: { width: w - 28 },
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setResolution(16);
      this.container.add(malusLabel);
    } else if (card.category === EnhancementCategory.JOB_SELECTION && card.jobId) {
      // Job card: show description, weapon, and first skill
      const jobDef = JOB_DEFS[card.jobId];
      if (jobDef) {
        const desc = scene.add.text(0, 14, jobDef.description, {
          fontSize: '14px',
          fontFamily: '"Trebuchet MS", Verdana, sans-serif',
          color: '#BBBBBB',
          wordWrap: { width: w - 24 },
          align: 'center',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5, 0).setResolution(16);
        this.container.add(desc);

        // Find affinity weapon
        let weaponName = '';
        for (const wId of Object.values(WeaponId)) {
          const wDef = WEAPON_DEFS[wId];
          if (wDef.affinityJob === card.jobId) { weaponName = wDef.name; break; }
        }

        const weaponLabel = scene.add.text(0, 70, `Weapon: ${weaponName}`, {
          fontSize: '14px',
          fontFamily: '"Trebuchet MS", Verdana, sans-serif',
          color: '#FFAA44',
          wordWrap: { width: w - 24 },
          align: 'center',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5, 0).setResolution(16);
        this.container.add(weaponLabel);
      }
    } else {
      const desc = scene.add.text(0, 32, card.description, {
        fontSize: '16px',
        fontFamily: '"Trebuchet MS", Verdana, sans-serif',
        color: '#BBBBBB',
        wordWrap: { width: w - 28 },
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setResolution(16);
      this.container.add(desc);
    }

    // Key hint
    const keyHint = scene.add.text(0, 130, `[${index + 1}]`, {
      fontSize: '28px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#888888',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(16);
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
