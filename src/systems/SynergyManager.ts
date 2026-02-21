import { EVENTS, JobId } from '../constants';
import { JOB_SYNERGIES, JobSynergy } from '../data/synergies';
import { Player } from '../entities/Player';
import { EventBus } from './EventBus';

/**
 * Detects job synergies when jobs are chosen and applies their bonuses.
 */
export class SynergyManager {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
    EventBus.on(EVENTS.JOB_CHOSEN, this.checkSynergies, this);
  }

  /** Check all possible synergies against current jobs */
  public checkSynergies(): void {
    const jobs = new Set(this.player.playerState.chosenJobs);
    const active = this.player.playerState.activeSynergies;

    for (const synergy of JOB_SYNERGIES) {
      if (active.includes(synergy.id)) continue; // already active
      const [jobA, jobB] = synergy.jobs;
      if (jobs.has(jobA) && jobs.has(jobB)) {
        this.activateSynergy(synergy);
      }
    }
  }

  private activateSynergy(synergy: JobSynergy): void {
    this.player.playerState.activeSynergies.push(synergy.id);
    synergy.apply(this.player.playerState.modifiers);
    EventBus.emit(EVENTS.STATS_CHANGED);
  }

  public destroy(): void {
    EventBus.off(EVENTS.JOB_CHOSEN, this.checkSynergies, this);
  }
}
