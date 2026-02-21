import { EVENTS } from '../constants';
import { Player } from '../entities/Player';
import { xpRequired } from '../data/balance';
import { EventBus } from './EventBus';

export class XPManager {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  public addXP(amount: number): void {
    const multiplied = Math.floor(amount * this.player.playerState.modifiers.xpMultiplier);

    // Double gem chance
    const finalAmount = Math.random() < this.player.playerState.modifiers.doubleGemChance
      ? multiplied * 2
      : multiplied;

    this.player.playerState.stats.xp += finalAmount;
    EventBus.emit(EVENTS.XP_CHANGED, this.player.playerState.stats.xp, this.player.playerState.stats.xpToNext);

    // Check level up
    while (this.player.playerState.stats.xp >= this.player.playerState.stats.xpToNext) {
      this.player.playerState.stats.xp -= this.player.playerState.stats.xpToNext;
      this.player.playerState.stats.level++;
      this.player.playerState.stats.xpToNext = xpRequired(this.player.playerState.stats.level);
      EventBus.emit(EVENTS.LEVEL_UP, this.player.playerState.stats.level);
    }
  }
}
