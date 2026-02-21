import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES, Rarity } from '../constants';
import { EnhancementCardUI } from '../ui/EnhancementCard';
import { EnhancementCard } from '../types';
import { RARITY_COLORS } from '../systems/EnhancementManager';

export class LevelUpScene extends Phaser.Scene {
  private cards: EnhancementCardUI[] = [];
  private selectedIndex = 0;
  private picked = false;

  constructor() {
    super(SCENES.LEVEL_UP);
  }

  create(data?: { source?: string; chestRarity?: Rarity }): void {
    this.picked = false;
    this.cards = [];
    this.selectedIndex = 0;

    const source = data?.source ?? 'levelup';
    const isChest = source === 'chest';
    const isJobSelection = source === 'job_selection';

    // Dim background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65);

    // Title
    const titleText = isJobSelection ? 'CHOOSE YOUR JOB' : isChest ? 'CHEST OPENED!' : 'LEVEL UP!';
    const titleColor = isJobSelection ? '#FFD700' : isChest ? (RARITY_COLORS[data?.chestRarity ?? Rarity.COMMON]) : '#FFDD44';
    this.add.text(GAME_WIDTH / 2, 12, titleText, {
      fontSize: isJobSelection ? '18px' : '16px',
      fontFamily: 'monospace',
      color: titleColor,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(8);

    const subtitleText = isJobSelection ? 'Select a job to specialize in' : 'Choose an Enhancement';
    this.add.text(GAME_WIDTH / 2, 30, subtitleText, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#AAAAAA',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setResolution(8);

    // Get game scene's enhancement manager
    const gameScene = this.scene.get(SCENES.GAME) as any;
    if (!gameScene || !gameScene.enhancementManager) {
      this.cleanup();
      return;
    }

    const enhancementManager = gameScene.enhancementManager;
    let cardData: EnhancementCard[];
    try {
      if (isJobSelection) {
        cardData = enhancementManager.generateJobSelectionCards();
      } else {
        const cardSource = isChest ? 'chest' : source === 'elite' ? 'elite' : 'levelup';
        cardData = enhancementManager.generateCards(3, cardSource);
      }
    } catch (e) {
      console.error('Failed to generate cards:', e);
      this.cleanup();
      return;
    }

    if (!cardData || cardData.length === 0) {
      this.cleanup();
      return;
    }

    // Create card UIs - bigger spacing for bigger cards
    const cardSpacing = isJobSelection ? 155 : 145;
    const startX = GAME_WIDTH / 2 - (cardData.length - 1) * cardSpacing / 2;

    for (let i = 0; i < cardData.length; i++) {
      const card = new EnhancementCardUI(
        this,
        startX + i * cardSpacing,
        GAME_HEIGHT / 2 + 18,
        cardData[i],
        i,
      );
      this.cards.push(card);

      // Click to select
      const bg = card.container.getAt(0) as Phaser.GameObjects.Rectangle;
      if (bg) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => this.pickCard(i, enhancementManager));
      }
    }

    this.updateSelection();

    // Keyboard controls
    const kb = this.input.keyboard!;
    kb.on('keydown-ONE', () => this.pickCard(0, enhancementManager));
    kb.on('keydown-TWO', () => this.pickCard(1, enhancementManager));
    kb.on('keydown-THREE', () => this.pickCard(2, enhancementManager));

    kb.on('keydown-LEFT', () => {
      if (this.picked) return;
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.updateSelection();
    });
    kb.on('keydown-RIGHT', () => {
      if (this.picked) return;
      this.selectedIndex = Math.min(this.cards.length - 1, this.selectedIndex + 1);
      this.updateSelection();
    });
    kb.on('keydown-ENTER', () => this.pickCard(this.selectedIndex, enhancementManager));
  }

  private updateSelection(): void {
    this.cards.forEach((card, i) => card.setSelected(i === this.selectedIndex));
  }

  private pickCard(index: number, enhancementManager: any): void {
    if (this.picked) return;
    if (index < 0 || index >= this.cards.length) return;
    this.picked = true;

    try {
      enhancementManager.applyCard(this.cards[index].card);
    } catch (e) {
      console.error('Failed to apply card:', e);
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.cards.forEach(c => c.destroy());
    this.cards = [];

    const gameScene = this.scene.get(SCENES.GAME) as any;
    if (gameScene && gameScene.resumeGame) {
      gameScene.resumeGame();
    }
    this.scene.stop();
  }
}
