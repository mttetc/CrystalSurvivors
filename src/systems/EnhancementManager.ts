import {
  EnhancementCategory, WeaponId, EnchantId, ElementId, EVENTS, Rarity,
  JobId, JobSkillId, JOB_SELECTION_LEVELS, PLAYER_MAX_WEAPONS, PLAYER_MAX_JOBS,
} from '../constants';
import { EnhancementCard, PlayerStatModifiers } from '../types';
import { CATEGORY_WEIGHTS, WEAPON_NAMES, ENCHANT_NAMES, STAT_BOOST_DEFS } from '../data/enhancements';
import { WEAPON_DEFS } from '../data/weapons';
import { JOB_DEFS, JOB_SKILL_DEFS } from '../data/jobs';
import { ELEMENT_DEFS } from '../data/elements';
import { MALUS_CARD_DEFS } from '../data/malus-cards';
import { RANGE_CARD_DEFS } from '../data/range-cards';
import { Player } from '../entities/Player';
import { EventBus } from './EventBus';

const ALL_WEAPON_IDS = Object.values(WeaponId);
const ALL_ENCHANT_IDS = Object.values(EnchantId);
const ALL_ELEMENT_IDS = Object.values(ElementId);
const ALL_JOB_IDS = Object.values(JobId);

// Weights for new categories (extend existing CATEGORY_WEIGHTS)
const EXTENDED_WEIGHTS: Record<string, number> = {
  ...CATEGORY_WEIGHTS,
  [EnhancementCategory.APPLY_ELEMENT]: 6,
  [EnhancementCategory.ELEMENT_UPGRADE]: 8,
  [EnhancementCategory.MALUS_TRADE]: 8,
};

// Level-scaled rarity rates
interface RarityBracket {
  minLevel: number;
  common: number;
  rare: number;
  epic: number;
  legendary: number;
}

const LEVELUP_RARITY_BRACKETS: RarityBracket[] = [
  { minLevel: 20, common: 0.45, rare: 0.30, epic: 0.18, legendary: 0.07 },
  { minLevel: 15, common: 0.55, rare: 0.28, epic: 0.13, legendary: 0.04 },
  { minLevel: 10, common: 0.65, rare: 0.25, epic: 0.08, legendary: 0.02 },
  { minLevel: 5,  common: 0.78, rare: 0.18, epic: 0.04, legendary: 0.00 },
  { minLevel: 1,  common: 0.92, rare: 0.08, epic: 0.00, legendary: 0.00 },
];

// Chest drops add bonuses on top of levelup rates
const CHEST_BONUS = { rare: 0.10, epic: 0.05, legendary: 0.02 };
// Elite drops are even better
const ELITE_BONUS = { rare: 0.15, epic: 0.10, legendary: 0.05 };

function getRarityRates(playerLevel: number, source: 'levelup' | 'chest' | 'elite'): { common: number; rare: number; epic: number; legendary: number } {
  let bracket = LEVELUP_RARITY_BRACKETS[LEVELUP_RARITY_BRACKETS.length - 1];
  for (const b of LEVELUP_RARITY_BRACKETS) {
    if (playerLevel >= b.minLevel) {
      bracket = b;
      break;
    }
  }

  let { common, rare, epic, legendary } = bracket;

  if (source === 'chest') {
    rare += CHEST_BONUS.rare;
    epic += CHEST_BONUS.epic;
    legendary += CHEST_BONUS.legendary;
    common = Math.max(0, 1 - rare - epic - legendary);
  } else if (source === 'elite') {
    rare += ELITE_BONUS.rare;
    epic += ELITE_BONUS.epic;
    legendary += ELITE_BONUS.legendary;
    common = Math.max(0, 1 - rare - epic - legendary);
  }

  return { common, rare, epic, legendary };
}

function rollRarity(playerLevel: number, source: 'levelup' | 'chest' | 'elite'): Rarity {
  const rates = getRarityRates(playerLevel, source);
  const roll = Math.random();
  if (roll < rates.legendary) return Rarity.LEGENDARY;
  if (roll < rates.legendary + rates.epic) return Rarity.EPIC;
  if (roll < rates.legendary + rates.epic + rates.rare) return Rarity.RARE;
  return Rarity.COMMON;
}

export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  [Rarity.COMMON]: 1.0,
  [Rarity.RARE]: 1.0,
  [Rarity.EPIC]: 1.5,
  [Rarity.LEGENDARY]: 2.0,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: '#AAAAAA',
  [Rarity.RARE]: '#4488FF',
  [Rarity.EPIC]: '#AA44FF',
  [Rarity.LEGENDARY]: '#FFAA00',
};

export const RARITY_NAMES: Record<Rarity, string> = {
  [Rarity.COMMON]: 'Common',
  [Rarity.RARE]: 'Rare',
  [Rarity.EPIC]: 'Epic',
  [Rarity.LEGENDARY]: 'Legendary',
};

export class EnhancementManager {
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  // ─── Main card generation ────────────────────────────────────────────

  public generateCards(count = 3, source: 'levelup' | 'chest' | 'elite' = 'levelup'): EnhancementCard[] {
    const pool: EnhancementCard[] = [];
    const playerLevel = this.player.playerState.stats.level;

    // Build weighted category pool
    const categories = this.getAvailableCategories();
    if (categories.length === 0) {
      return this.generateFallbackCards(count, playerLevel, source);
    }

    // Generate many candidates, pick best
    for (let i = 0; i < 50; i++) {
      const picked = this.weightedRandom(categories);
      const rarity = rollRarity(playerLevel, source);
      const card = this.generateCardForCategory(picked.category, rarity);
      if (card && !pool.some(c => c.title === card.title)) {
        pool.push(card);
      }
      if (pool.length >= count * 3) break;
    }

    // Shuffle and take
    this.shuffle(pool);
    const result = pool.slice(0, count);

    // Fallback if not enough cards
    if (result.length < count) {
      const fallback = this.generateFallbackCards(count - result.length, playerLevel, source);
      for (const fc of fallback) {
        if (!result.some(c => c.title === fc.title)) {
          result.push(fc);
        }
        if (result.length >= count) break;
      }
    }

    return result;
  }

  // ─── Job selection cards (special, called at JOB_SELECTION_LEVELS) ───

  public generateJobSelectionCards(): EnhancementCard[] {
    const state = this.player.playerState;
    const chosen = new Set(state.chosenJobs);
    const available = ALL_JOB_IDS.filter(id => !chosen.has(id));
    this.shuffle(available);

    const cards: EnhancementCard[] = [];

    // New job cards (2 if double down available, 3 if first pick)
    const canDoubleDown = state.chosenJobs.length >= 2 && !state.isDoubledDown;
    const newJobCount = canDoubleDown ? 2 : 3;
    const picked = available.slice(0, newJobCount);

    for (const jobId of picked) {
      const job = JOB_DEFS[jobId];
      const skillList = job.skills
        .map(sid => JOB_SKILL_DEFS[sid].name)
        .join(', ');
      cards.push({
        category: EnhancementCategory.JOB_SELECTION,
        title: job.name,
        description: `${job.description}. Skills: ${skillList}`,
        icon: job.icon,
        rarity: Rarity.EPIC,
        jobId,
      });
    }

    // Double Down card: lock to 2 jobs, get enhanced skills
    if (canDoubleDown) {
      const jobNames = state.chosenJobs.map(j => JOB_DEFS[j].name).join(' + ');
      cards.push({
        category: EnhancementCategory.JOB_DOUBLE_DOWN,
        title: 'DOUBLE DOWN',
        description: `Lock to ${jobNames}. Upgrade passives, +1 all skills, +1 weapon levels.`,
        icon: 'icon_double_down',
        rarity: Rarity.LEGENDARY,
      });
    }

    return cards;
  }

  // ─── Available categories ────────────────────────────────────────────

  private getAvailableCategories(): { category: EnhancementCategory; weight: number }[] {
    const result: { category: EnhancementCategory; weight: number }[] = [];

    if (this.getUpgradableJobSkills().length > 0) {
      result.push({ category: EnhancementCategory.JOB_SKILL, weight: EXTENDED_WEIGHTS[EnhancementCategory.JOB_SKILL] });
    }
    if (this.getUnownedWeapons().length > 0) {
      result.push({ category: EnhancementCategory.NEW_WEAPON, weight: EXTENDED_WEIGHTS[EnhancementCategory.NEW_WEAPON] });
    }
    if (this.getUpgradableWeapons().length > 0) {
      result.push({ category: EnhancementCategory.WEAPON_UPGRADE, weight: EXTENDED_WEIGHTS[EnhancementCategory.WEAPON_UPGRADE] });
    }
    if (this.getUnenchantedWeapons().length > 0) {
      result.push({ category: EnhancementCategory.NEW_ENCHANT, weight: EXTENDED_WEIGHTS[EnhancementCategory.NEW_ENCHANT] });
    }
    if (this.getUpgradableEnchants().length > 0) {
      result.push({ category: EnhancementCategory.ENCHANT_UPGRADE, weight: EXTENDED_WEIGHTS[EnhancementCategory.ENCHANT_UPGRADE] });
    }

    // Element: apply element to un-elemented weapons
    if (this.getUnelementedWeapons().length > 0) {
      result.push({ category: EnhancementCategory.APPLY_ELEMENT, weight: EXTENDED_WEIGHTS[EnhancementCategory.APPLY_ELEMENT] });
    }
    // Element upgrade: upgrade existing elements
    if (this.getUpgradableElements().length > 0) {
      result.push({ category: EnhancementCategory.ELEMENT_UPGRADE, weight: EXTENDED_WEIGHTS[EnhancementCategory.ELEMENT_UPGRADE] });
    }

    // Malus trade-off cards (only if player level >= 5)
    if (this.player.playerState.stats.level >= 5 && this.getAvailableMalus().length > 0) {
      result.push({ category: EnhancementCategory.MALUS_TRADE, weight: EXTENDED_WEIGHTS[EnhancementCategory.MALUS_TRADE] });
    }

    // Stat boosts (includes range cards) are always available as filler
    result.push({ category: EnhancementCategory.STAT_BOOST, weight: EXTENDED_WEIGHTS[EnhancementCategory.STAT_BOOST] });

    return result;
  }

  // ─── Card generation per category ────────────────────────────────────

  private generateCardForCategory(cat: EnhancementCategory, rarity: Rarity): EnhancementCard | null {
    const rarityTag = rarity !== Rarity.COMMON ? ` [${RARITY_NAMES[rarity]}]` : '';

    switch (cat) {
      case EnhancementCategory.JOB_SKILL: {
        const skills = this.getUpgradableJobSkills();
        if (skills.length === 0) return null;
        const skillId = skills[Math.floor(Math.random() * skills.length)];
        const def = JOB_SKILL_DEFS[skillId];
        const currentLevel = this.player.playerState.jobSkillLevels[skillId] ?? 0;
        const nextLevel = def.levels[currentLevel];
        return {
          category: cat,
          title: def.name,
          description: nextLevel.description,
          icon: `skill_${skillId}`,
          rarity,
          jobId: def.jobId,
          jobSkillId: skillId,
        };
      }
      case EnhancementCategory.NEW_WEAPON: {
        const weapons = this.getUnownedWeapons();
        if (weapons.length === 0) return null;
        const id = weapons[Math.floor(Math.random() * weapons.length)];
        const def = WEAPON_DEFS[id];
        return {
          category: cat,
          title: WEAPON_NAMES[id],
          description: def.description,
          icon: `icon_${id}`,
          rarity,
          weaponId: id,
        };
      }
      case EnhancementCategory.WEAPON_UPGRADE: {
        const weapons = this.getUpgradableWeapons();
        if (weapons.length === 0) return null;
        const id = weapons[Math.floor(Math.random() * weapons.length)];
        const w = this.player.getWeapon(id)!;
        return {
          category: cat,
          title: `${WEAPON_NAMES[id]} Lv${w.level + 1}`,
          description: `Upgrade to level ${w.level + 1}${rarityTag}`,
          icon: `icon_${id}`,
          rarity,
          weaponId: id,
        };
      }
      case EnhancementCategory.NEW_ENCHANT: {
        const weapons = this.getUnenchantedWeapons();
        if (weapons.length === 0) return null;
        const wId = weapons[Math.floor(Math.random() * weapons.length)];
        const eId = ALL_ENCHANT_IDS[Math.floor(Math.random() * ALL_ENCHANT_IDS.length)];
        return {
          category: cat,
          title: `${ENCHANT_NAMES[eId]}`,
          description: `Apply ${ENCHANT_NAMES[eId]} to ${WEAPON_NAMES[wId]}${rarityTag}`,
          icon: `icon_${wId}`,
          rarity,
          enchantId: eId,
          targetWeaponId: wId,
        };
      }
      case EnhancementCategory.ENCHANT_UPGRADE: {
        const weapons = this.getUpgradableEnchants();
        if (weapons.length === 0) return null;
        const wId = weapons[Math.floor(Math.random() * weapons.length)];
        const w = this.player.getWeapon(wId)!;
        return {
          category: cat,
          title: `${ENCHANT_NAMES[w.enchant!]} T${w.enchantTier + 1}`,
          description: `Upgrade ${ENCHANT_NAMES[w.enchant!]} on ${WEAPON_NAMES[wId]}${rarityTag}`,
          icon: `icon_${wId}`,
          rarity,
          enchantId: w.enchant!,
          targetWeaponId: wId,
        };
      }
      case EnhancementCategory.APPLY_ELEMENT: {
        const weapons = this.getUnelementedWeapons();
        if (weapons.length === 0) return null;
        const wId = weapons[Math.floor(Math.random() * weapons.length)];
        const eId = ALL_ELEMENT_IDS[Math.floor(Math.random() * ALL_ELEMENT_IDS.length)];
        const elemDef = ELEMENT_DEFS[eId];
        return {
          category: cat,
          title: `${elemDef.name} Element`,
          description: `Apply ${elemDef.name} to ${WEAPON_NAMES[wId]}: ${elemDef.description}`,
          icon: `icon_${wId}`,
          rarity,
          elementId: eId,
          targetWeaponId: wId,
        };
      }
      case EnhancementCategory.ELEMENT_UPGRADE: {
        const options = this.getUpgradableElements();
        if (options.length === 0) return null;
        const opt = options[Math.floor(Math.random() * options.length)];
        const upgradeDef = ELEMENT_DEFS[opt.elementId].upgrades.find(u => u.id === opt.upgradeId);
        if (!upgradeDef) return null;
        return {
          category: cat,
          title: upgradeDef.name,
          description: `${upgradeDef.description} (${WEAPON_NAMES[opt.weaponId]})`,
          icon: `icon_${opt.weaponId}`,
          rarity,
          elementId: opt.elementId,
          elementUpgradeId: opt.upgradeId,
          targetWeaponId: opt.weaponId,
        };
      }
      case EnhancementCategory.MALUS_TRADE: {
        const available = this.getAvailableMalus();
        if (available.length === 0) return null;
        const malus = available[Math.floor(Math.random() * available.length)];
        return {
          category: cat,
          title: malus.name,
          description: `${malus.bonusText} / ${malus.malusText}`,
          icon: 'icon_malus',
          rarity: malus.rarity,
          malusCardId: malus.id,
          bonusText: malus.bonusText,
          malusText: malus.malusText,
        };
      }
      case EnhancementCategory.STAT_BOOST: {
        // Mix in range cards with stat boosts (20% chance for range card)
        if (Math.random() < 0.20 && RANGE_CARD_DEFS.length > 0) {
          const rangeCard = RANGE_CARD_DEFS[Math.floor(Math.random() * RANGE_CARD_DEFS.length)];
          return {
            category: cat,
            title: rangeCard.name,
            description: rangeCard.description,
            icon: 'stat_range',
            rarity,
            statBoostId: rangeCard.id,
          };
        }
        const boost = STAT_BOOST_DEFS[Math.floor(Math.random() * STAT_BOOST_DEFS.length)];
        return {
          category: cat,
          title: boost.name,
          description: boost.description,
          icon: boost.icon,
          rarity,
          statBoostId: boost.id,
        };
      }
      default:
        return null;
    }
  }

  // ─── Apply card ──────────────────────────────────────────────────────

  public applyCard(card: EnhancementCard): void {
    const mult = RARITY_MULTIPLIERS[card.rarity];

    switch (card.category) {
      case EnhancementCategory.JOB_SELECTION:
        if (card.jobId) {
          this.player.playerState.chosenJobs.push(card.jobId);
          this.grantJobStartingSkills(card.jobId);
          EventBus.emit(EVENTS.JOB_CHOSEN, card.jobId);
        }
        break;

      case EnhancementCategory.JOB_DOUBLE_DOWN:
        // Handled by PassiveManager via GameScene
        EventBus.emit('double-down-chosen');
        break;

      case EnhancementCategory.JOB_SKILL:
        if (card.jobSkillId) {
          const skillId = card.jobSkillId;
          const levels = this.player.playerState.jobSkillLevels;
          const currentLevel = levels[skillId] ?? 0;
          levels[skillId] = currentLevel + 1;

          const def = JOB_SKILL_DEFS[skillId];
          const levelDef = def.levels[currentLevel];
          if (def.type === 'modifier' && levelDef.apply) {
            levelDef.apply(this.player.playerState.modifiers);
          }

          EventBus.emit(EVENTS.JOB_SKILL_UPGRADED, skillId, levels[skillId]);
          EventBus.emit(EVENTS.STATS_CHANGED);
        }
        break;

      case EnhancementCategory.NEW_WEAPON:
        if (card.weaponId) {
          this.player.addWeapon(card.weaponId);
        }
        break;

      case EnhancementCategory.WEAPON_UPGRADE:
        if (card.weaponId) {
          this.player.upgradeWeapon(card.weaponId);
        }
        break;

      case EnhancementCategory.NEW_ENCHANT:
        if (card.enchantId && card.targetWeaponId) {
          const weapon = this.player.getWeapon(card.targetWeaponId);
          if (weapon) {
            weapon.enchant = card.enchantId;
            weapon.enchantTier = Math.min(3, Math.max(1, Math.floor(mult)));
            EventBus.emit(EVENTS.ENCHANT_APPLIED, card.targetWeaponId, card.enchantId);
          }
        }
        break;

      case EnhancementCategory.ENCHANT_UPGRADE:
        if (card.targetWeaponId) {
          const weapon = this.player.getWeapon(card.targetWeaponId);
          if (weapon && weapon.enchantTier < 3) {
            weapon.enchantTier = Math.min(3, weapon.enchantTier + Math.max(1, Math.floor(mult)));
            EventBus.emit(EVENTS.ENCHANT_UPGRADED, card.targetWeaponId, weapon.enchant, weapon.enchantTier);
          }
        }
        break;

      case EnhancementCategory.APPLY_ELEMENT:
        if (card.elementId && card.targetWeaponId) {
          const weapon = this.player.getWeapon(card.targetWeaponId);
          if (weapon && !weapon.element) {
            weapon.element = card.elementId;
            weapon.elementUpgrades = [];
          }
        }
        break;

      case EnhancementCategory.ELEMENT_UPGRADE:
        if (card.elementUpgradeId && card.targetWeaponId) {
          const weapon = this.player.getWeapon(card.targetWeaponId);
          if (weapon && weapon.element && !weapon.elementUpgrades.includes(card.elementUpgradeId)) {
            weapon.elementUpgrades.push(card.elementUpgradeId);
          }
        }
        break;

      case EnhancementCategory.MALUS_TRADE:
        if (card.malusCardId) {
          const malus = MALUS_CARD_DEFS.find(m => m.id === card.malusCardId);
          if (malus) {
            malus.apply(this.player.playerState.modifiers);
            this.player.playerState.takenMalus.push(card.malusCardId);
            EventBus.emit(EVENTS.STATS_CHANGED);
          }
        }
        break;

      case EnhancementCategory.STAT_BOOST:
        if (card.statBoostId) {
          // Check range cards first
          const rangeCard = RANGE_CARD_DEFS.find(r => r.id === card.statBoostId);
          if (rangeCard) {
            rangeCard.apply(this.player.playerState.modifiers);
            EventBus.emit(EVENTS.STATS_CHANGED);
            break;
          }
          // Then regular stat boosts
          const boost = STAT_BOOST_DEFS.find(b => b.id === card.statBoostId);
          if (boost) {
            boost.apply(this.player.playerState.modifiers);
            EventBus.emit(EVENTS.STATS_CHANGED);
          }
        }
        break;
    }

    EventBus.emit(EVENTS.ENHANCEMENT_PICKED, card);
  }

  // ─── Grant starting skills on job selection ──────────────────────────

  private grantJobStartingSkills(jobId: JobId): void {
    const job = JOB_DEFS[jobId];
    if (!job) return;

    const levels = this.player.playerState.jobSkillLevels;
    const mods = this.player.playerState.modifiers;

    // Grant first skill at level 1 (the "signature" skill)
    const firstSkill = job.skills[0];
    if (firstSkill && (levels[firstSkill] ?? 0) === 0) {
      levels[firstSkill] = 1;
      const def = JOB_SKILL_DEFS[firstSkill];
      if (def?.type === 'modifier' && def.levels[0]?.apply) {
        def.levels[0].apply(mods);
      }
      EventBus.emit(EVENTS.JOB_SKILL_UPGRADED, firstSkill, 1);
    }

    // Grant tier 1 passive on job pick
    const state = this.player.playerState;
    if (!state.passiveTiers[jobId]) {
      state.passiveTiers[jobId] = 1;
      const tier = job.passive?.tiers?.[0];
      if (tier) {
        tier.apply(mods);
      }
    }

    // Grant the job's affinity weapon
    const affinityWeapon = this.getAffinityWeapon(jobId);
    if (affinityWeapon) {
      this.player.addWeapon(affinityWeapon);
    }

    EventBus.emit(EVENTS.STATS_CHANGED);
  }

  private getAffinityWeapon(jobId: JobId): WeaponId | null {
    for (const wId of ALL_WEAPON_IDS) {
      const def = WEAPON_DEFS[wId];
      if (def.affinityJob === jobId) return wId;
    }
    return null;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────

  private getUnownedWeapons(): WeaponId[] {
    const owned = new Set(this.player.playerState.weapons.map(w => w.id));
    if (this.player.playerState.weapons.length >= PLAYER_MAX_WEAPONS) return [];
    return ALL_WEAPON_IDS.filter(id => !owned.has(id));
  }

  private getUpgradableWeapons(): WeaponId[] {
    return this.player.playerState.weapons
      .filter(w => w.level < 5)
      .map(w => w.id);
  }

  private getUpgradableJobSkills(): JobSkillId[] {
    const result: JobSkillId[] = [];
    for (const jobId of this.player.playerState.chosenJobs) {
      const job = JOB_DEFS[jobId];
      for (const skillId of job.skills) {
        const level = this.player.playerState.jobSkillLevels[skillId] ?? 0;
        if (level < 3) {
          result.push(skillId);
        }
      }
    }
    return result;
  }

  private getUnenchantedWeapons(): WeaponId[] {
    return this.player.playerState.weapons
      .filter(w => w.enchant === null)
      .map(w => w.id);
  }

  private getUpgradableEnchants(): WeaponId[] {
    return this.player.playerState.weapons
      .filter(w => w.enchant !== null && w.enchantTier < 3)
      .map(w => w.id);
  }

  private getUnelementedWeapons(): WeaponId[] {
    return this.player.playerState.weapons
      .filter(w => w.element === null)
      .map(w => w.id);
  }

  private getUpgradableElements(): { weaponId: WeaponId; elementId: ElementId; upgradeId: string }[] {
    const result: { weaponId: WeaponId; elementId: ElementId; upgradeId: string }[] = [];
    for (const w of this.player.playerState.weapons) {
      if (!w.element) continue;
      const elemDef = ELEMENT_DEFS[w.element];
      for (const upgrade of elemDef.upgrades) {
        if (!w.elementUpgrades.includes(upgrade.id)) {
          result.push({ weaponId: w.id, elementId: w.element, upgradeId: upgrade.id });
        }
      }
    }
    return result;
  }

  private getAvailableMalus(): typeof MALUS_CARD_DEFS {
    const taken = new Set(this.player.playerState.takenMalus);
    return MALUS_CARD_DEFS.filter(m => !taken.has(m.id));
  }

  // ─── Fallback generation ─────────────────────────────────────────────

  private generateFallbackCards(count: number, playerLevel: number, source: 'levelup' | 'chest' | 'elite'): EnhancementCard[] {
    const result: EnhancementCard[] = [];

    // Try job skill cards first
    const skills = this.getUpgradableJobSkills();
    if (skills.length > 0) {
      this.shuffle(skills);
      for (const skillId of skills) {
        if (result.length >= count) break;
        const rarity = rollRarity(playerLevel, source);
        const def = JOB_SKILL_DEFS[skillId];
        const currentLevel = this.player.playerState.jobSkillLevels[skillId] ?? 0;
        const nextLevel = def.levels[currentLevel];
        const card: EnhancementCard = {
          category: EnhancementCategory.JOB_SKILL,
          title: def.name,
          description: nextLevel.description,
          icon: `skill_${skillId}`,
          rarity,
          jobId: def.jobId,
          jobSkillId: skillId,
        };
        if (!result.some(c => c.title === card.title)) {
          result.push(card);
        }
      }
      if (result.length >= count) return result.slice(0, count);
    }

    // Fall back to weapon upgrade cards
    const upgradable = this.getUpgradableWeapons();
    if (upgradable.length > 0) {
      this.shuffle(upgradable);
      for (const id of upgradable) {
        if (result.length >= count) break;
        const rarity = rollRarity(playerLevel, source);
        const w = this.player.getWeapon(id)!;
        const rarityTag = rarity !== Rarity.COMMON ? ` [${RARITY_NAMES[rarity]}]` : '';
        const card: EnhancementCard = {
          category: EnhancementCategory.WEAPON_UPGRADE,
          title: `${WEAPON_NAMES[id]} Lv${w.level + 1}`,
          description: `Upgrade to level ${w.level + 1}${rarityTag}`,
          icon: `icon_${id}`,
          rarity,
          weaponId: id,
        };
        if (!result.some(c => c.title === card.title)) {
          result.push(card);
        }
      }
    }

    // Final fallback: stat boosts (always available)
    while (result.length < count) {
      const rarity = rollRarity(playerLevel, source);
      const boost = STAT_BOOST_DEFS[Math.floor(Math.random() * STAT_BOOST_DEFS.length)];
      const card: EnhancementCard = {
        category: EnhancementCategory.STAT_BOOST,
        title: boost.name,
        description: boost.description,
        icon: boost.icon,
        rarity,
        statBoostId: boost.id,
      };
      if (!result.some(c => c.title === card.title)) {
        result.push(card);
      } else {
        result.push(card);
      }
    }

    return result.slice(0, count);
  }

  // ─── Utility ─────────────────────────────────────────────────────────

  private weightedRandom<T extends { weight: number }>(items: T[]): T {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let roll = Math.random() * total;
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }

  private shuffle<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
