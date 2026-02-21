import { EVENTS, JobId } from '../constants';
import { Player } from '../entities/Player';
import { JOB_DEFS, JOB_SKILL_DEFS } from '../data/jobs';
import { WEAPON_DEFS } from '../data/weapons';
import { EventBus } from './EventBus';

export class PassiveManager {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  /**
   * Apply double down: upgrade both jobs' passives to next tier,
   * +1 all skill levels, +1 both weapon levels
   */
  public applyDoubleDown(): void {
    const state = this.player.playerState;
    const jobs = state.chosenJobs;

    // Mark as doubled down
    state.isDoubledDown = true;

    for (const jobId of jobs) {
      const job = JOB_DEFS[jobId];
      if (!job) continue;

      // Upgrade passive tier
      const currentTier = state.passiveTiers[jobId] ?? 0;
      const newTier = Math.min(currentTier + 1, 2); // max tier 2 (0-indexed tiers array: 0 and 1)
      state.passiveTiers[jobId] = newTier;

      // Apply passive tier effect
      const tierDef = job.passive.tiers[newTier - 1]; // tiers[0] = tier 1, tiers[1] = tier 2
      if (tierDef) {
        tierDef.apply(state.modifiers);
      }

      // +1 all skill levels for this job (cap 3)
      for (const skillId of job.skills) {
        const currentLevel = state.jobSkillLevels[skillId] ?? 0;
        if (currentLevel < 3) {
          state.jobSkillLevels[skillId] = currentLevel + 1;
          // Apply modifier if it's a modifier-type skill
          const skillDef = JOB_SKILL_DEFS[skillId];
          if (skillDef?.type === 'modifier' && skillDef.levels[currentLevel]?.apply) {
            skillDef.levels[currentLevel].apply!(state.modifiers);
          }
          EventBus.emit(EVENTS.JOB_SKILL_UPGRADED, skillId, state.jobSkillLevels[skillId]);
        }
      }

      // +1 weapon level for this job's affinity weapon (cap 5)
      const weapon = state.weapons.find(w => {
        return WEAPON_DEFS[w.id]?.affinityJob === jobId;
      });
      if (weapon && weapon.level < 5) {
        weapon.level++;
        EventBus.emit(EVENTS.WEAPON_UPGRADED, weapon.id, weapon.level);
      }
    }

    EventBus.emit(EVENTS.STATS_CHANGED);
  }

  /**
   * Apply mastery (second double down at level 17).
   * Same logic as double down but for tier 2.
   */
  public applyMastery(): void {
    // Reuse the same logic - it advances to the next tier
    this.applyDoubleDown();
  }

  public destroy(): void {
    // No listeners to clean up
  }
}
