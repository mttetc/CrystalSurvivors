import {
  EnhancementCategory, WeaponId, EnchantId, ElementId, EVENTS, Rarity,
  JobId, JobSkillId, MasterySkillId, JOB_SELECTION_LEVELS, PLAYER_MAX_WEAPONS, PLAYER_MAX_JOBS,
} from '../constants';
import { EnhancementCard, PlayerStatModifiers } from '../types';
import { CATEGORY_WEIGHTS, WEAPON_NAMES, ENCHANT_NAMES, STAT_BOOST_DEFS } from '../data/enhancements';
import { WEAPON_DEFS } from '../data/weapons';
import { JOB_DEFS, JOB_SKILL_DEFS, MASTERY_SKILL_DEFS } from '../data/jobs';
import { ELEMENT_DEFS } from '../data/elements';
import { MALUS_CARD_DEFS } from '../data/malus-cards';
import { JOB_SYNERGIES, SKILL_SYNERGIES } from '../data/synergies';
import { RANGE_CARD_DEFS } from '../data/range-cards';
import { Player } from '../entities/Player';
import { EventBus } from './EventBus';

const ALL_WEAPON_IDS = Object.values(WeaponId);
const ALL_ENCHANT_IDS = Object.values(EnchantId);
const ALL_ELEMENT_IDS = Object.values(ElementId);
const ALL_JOB_IDS = Object.values(JobId);

// When these synergies are active, their combo skills replace these base skills
// Only for "active" type skills where the combo does the same thing but better
const SYNERGY_SUPERSEDES_SKILL: Record<string, string[]> = {
  // Skill synergies (triggered by having both component skills)
  'spirit_bomb':     [JobSkillId.CHI_BURST, JobSkillId.HADOUKEN],
  'bullet_storm':    [JobSkillId.MULTI_SHOT, JobSkillId.BARRAGE],
  'tornado_dive':    [JobSkillId.JUMP, JobSkillId.GUST],
  'spinning_death':  [JobSkillId.SACRED_ORBIT, JobSkillId.BLADE_STORM],
  'iaido_master':    [JobSkillId.BUSHIDO, JobSkillId.DUAL_STRIKE],
  'twilight':        [JobSkillId.HOLY, JobSkillId.DARKNESS],
  'inferno':         [JobSkillId.FIRE],
  'thunderstorm':    [JobSkillId.THUNDER],
  'tectonic_fury':   [JobSkillId.QUAKE],
  'absolute_zero':   [JobSkillId.BLIZZARD],
  'fire_god':        [JobSkillId.IFRIT],
  // Job synergies (triggered by having both jobs)
  'sky_hunter':       [JobSkillId.RAIN_OF_ARROWS],
  'iron_berserker':   [JobSkillId.WAR_CRY],
  // Skill synergies with active component skills
  'war_march':        [JobSkillId.WAR_CRY],       // War March combo > War Cry (active AoE stun)
  'holy_punch':       [JobSkillId.CONSECRATE],     // Holy Punch combo > Consecrate (active holy aura)
  'quicksand':        [JobSkillId.PITFALL],        // Quicksand combo > Pitfall (active damage trail)
};

// Weights for new categories (extend existing CATEGORY_WEIGHTS)
const EXTENDED_WEIGHTS: Record<string, number> = {
  ...CATEGORY_WEIGHTS,
  [EnhancementCategory.APPLY_ELEMENT]: 6,
  [EnhancementCategory.ELEMENT_UPGRADE]: 8,
  [EnhancementCategory.MALUS_TRADE]: 8,
  [EnhancementCategory.SYNERGY_UPGRADE]: 14,
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
  { minLevel: 30, common: 0.60, rare: 0.27, epic: 0.10, legendary: 0.03 },
  { minLevel: 25, common: 0.67, rare: 0.24, epic: 0.07, legendary: 0.02 },
  { minLevel: 20, common: 0.74, rare: 0.20, epic: 0.05, legendary: 0.01 },
  { minLevel: 15, common: 0.80, rare: 0.16, epic: 0.04, legendary: 0.00 },
  { minLevel: 10, common: 0.87, rare: 0.11, epic: 0.02, legendary: 0.00 },
  { minLevel: 5,  common: 0.93, rare: 0.06, epic: 0.01, legendary: 0.00 },
  { minLevel: 1,  common: 0.98, rare: 0.02, epic: 0.00, legendary: 0.00 },
];

// Chest drops add bonuses on top of levelup rates
const CHEST_BONUS = { rare: 0.04, epic: 0.02, legendary: 0.005 };
// Elite drops are even better
const ELITE_BONUS = { rare: 0.06, epic: 0.03, legendary: 0.01 };

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
  [Rarity.COMMON]: 0.5,
  [Rarity.RARE]: 0.8,
  [Rarity.EPIC]: 1.2,
  [Rarity.LEGENDARY]: 1.6,
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

    // New job cards (2 if awakening available, 3 if first pick)
    const canAwaken = state.chosenJobs.length >= 2 && !state.isAwakened;
    const newJobCount = canAwaken ? 2 : 3;
    const picked = available.slice(0, newJobCount);

    for (const jobId of picked) {
      const job = JOB_DEFS[jobId];
      cards.push({
        category: EnhancementCategory.JOB_SELECTION,
        title: job.name,
        description: job.description,
        icon: job.icon,
        rarity: Rarity.EPIC,
        jobId,
      });
    }

    // Awakening card: lock to 2 jobs, get awakened skills
    if (canAwaken) {
      const jobNames = state.chosenJobs.map(j => JOB_DEFS[j].name).join(' + ');
      cards.push({
        category: EnhancementCategory.JOB_AWAKENING,
        title: 'AWAKENING',
        description: `Awaken ${jobNames}. Upgrade passives, +1 unlocked skills, +1 weapon levels.`,
        icon: 'icon_awakening',
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
    if (this.getUpgradableMasterySkills().length > 0) {
      result.push({ category: EnhancementCategory.MASTERY_SKILL, weight: EXTENDED_WEIGHTS[EnhancementCategory.MASTERY_SKILL] ?? 18 });
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

    // Synergy skill upgrades
    if (this.getUpgradableSynergySkills().length > 0) {
      result.push({ category: EnhancementCategory.SYNERGY_UPGRADE, weight: EXTENDED_WEIGHTS[EnhancementCategory.SYNERGY_UPGRADE] });
    }

    // Stat boosts (includes range cards) are always available as filler
    result.push({ category: EnhancementCategory.STAT_BOOST, weight: EXTENDED_WEIGHTS[EnhancementCategory.STAT_BOOST] });

    return result;
  }

  // ─── Card generation per category ────────────────────────────────────

  private generateCardForCategory(cat: EnhancementCategory, rarity: Rarity): EnhancementCard | null {

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
      case EnhancementCategory.MASTERY_SKILL: {
        const mSkills = this.getUpgradableMasterySkills();
        if (mSkills.length === 0) return null;
        const mSkillId = mSkills[Math.floor(Math.random() * mSkills.length)];
        const mDef = MASTERY_SKILL_DEFS[mSkillId];
        const mCurrentLevel = this.player.playerState.jobSkillLevels[mSkillId] ?? 0;
        const mNextLevel = mDef.levels[mCurrentLevel];
        return {
          category: cat,
          title: `[M] ${mDef.name}`,
          description: mNextLevel.description,
          icon: `skill_${mSkillId}`,
          rarity,
          jobId: mDef.jobId,
          masterySkillId: mSkillId,
        };
      }
      case EnhancementCategory.NEW_WEAPON: {
        const weapons = this.getUnownedWeapons();
        if (weapons.length === 0) return null;
        const id = weapons[Math.floor(Math.random() * weapons.length)];
        const def = WEAPON_DEFS[id];
        const startLv = rarity === Rarity.LEGENDARY ? 4
          : rarity === Rarity.EPIC ? 3
          : rarity === Rarity.RARE ? 2 : 1;
        const lvText = startLv > 1 ? ` (Lv${startLv})` : '';
        return {
          category: cat,
          title: WEAPON_NAMES[id] + lvText,
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
        const upAmt = rarity >= Rarity.EPIC ? 2 : 1;
        const targetLv = Math.min(5, w.level + upAmt);
        return {
          category: cat,
          title: `${WEAPON_NAMES[id]} Lv${targetLv}`,
          description: upAmt > 1 ? `Upgrade +${upAmt} levels` : `Upgrade to level ${targetLv}`,
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
          description: `Apply ${ENCHANT_NAMES[eId]} to ${WEAPON_NAMES[wId]}`,
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
          description: `Upgrade ${ENCHANT_NAMES[w.enchant!]} on ${WEAPON_NAMES[wId]}`,
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
          const rMult = RARITY_MULTIPLIERS[rarity];
          const desc = rangeCard.descriptionFn ? rangeCard.descriptionFn(rMult) : rangeCard.description;
          const malusDesc = rangeCard.malusFn ? rangeCard.malusFn(rMult) : undefined;
          return {
            category: cat,
            title: rangeCard.name,
            description: malusDesc ? desc : desc,
            icon: 'stat_range',
            rarity,
            statBoostId: rangeCard.id,
            bonusText: malusDesc ? desc : undefined,
            malusText: malusDesc,
          };
        }
        const boost = STAT_BOOST_DEFS[Math.floor(Math.random() * STAT_BOOST_DEFS.length)];
        const rarityMult = RARITY_MULTIPLIERS[rarity];
        return {
          category: cat,
          title: boost.name,
          description: boost.descriptionFn ? boost.descriptionFn(rarityMult) : boost.description,
          icon: boost.icon,
          rarity,
          statBoostId: boost.id,
        };
      }
      case EnhancementCategory.SYNERGY_UPGRADE: {
        const upgradable = this.getUpgradableSynergySkills();
        if (upgradable.length === 0) return null;
        const pick = upgradable[Math.floor(Math.random() * upgradable.length)];
        const nextLv = (this.player.playerState.synergySkillLevels[pick.id] ?? 1) + 1;
        return {
          category: cat,
          title: `${pick.comboName} Lv${nextLv}`,
          description: `Upgrade ${pick.synergyName} combo skill`,
          icon: 'stat_damage',
          rarity,
          synergyId: pick.id,
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

      case EnhancementCategory.JOB_AWAKENING:
        // Handled by PassiveManager via GameScene
        EventBus.emit('awakening-chosen');
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

      case EnhancementCategory.MASTERY_SKILL:
        if (card.masterySkillId) {
          const mSkillId = card.masterySkillId;
          const mLevels = this.player.playerState.jobSkillLevels;
          const mCurrentLevel = mLevels[mSkillId] ?? 0;
          mLevels[mSkillId] = mCurrentLevel + 1;

          const mDef = MASTERY_SKILL_DEFS[mSkillId];
          const mLevelDef = mDef.levels[mCurrentLevel];
          if (mDef.type === 'modifier' && mLevelDef.apply) {
            mLevelDef.apply(this.player.playerState.modifiers);
          }

          EventBus.emit(EVENTS.JOB_SKILL_UPGRADED, mSkillId, mLevels[mSkillId]);
          EventBus.emit(EVENTS.STATS_CHANGED);
        }
        break;

      case EnhancementCategory.NEW_WEAPON:
        if (card.weaponId) {
          // Rarity determines starting level: Common=1, Rare=2, Epic=3, Legendary=4
          const startLevel = card.rarity === Rarity.LEGENDARY ? 4
            : card.rarity === Rarity.EPIC ? 3
            : card.rarity === Rarity.RARE ? 2 : 1;
          this.player.addWeapon(card.weaponId);
          for (let i = 1; i < startLevel; i++) {
            this.player.upgradeWeapon(card.weaponId);
          }
        }
        break;

      case EnhancementCategory.WEAPON_UPGRADE:
        if (card.weaponId) {
          // Rarity determines upgrade amount: Common/Rare=+1, Epic=+2, Legendary=+2
          const upgrades = card.rarity >= Rarity.EPIC ? 2 : 1;
          for (let i = 0; i < upgrades; i++) {
            this.player.upgradeWeapon(card.weaponId);
          }
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
            rangeCard.apply(this.player.playerState.modifiers, mult);
            EventBus.emit(EVENTS.STATS_CHANGED);
            break;
          }
          // Then regular stat boosts - apply with rarity multiplier
          const boost = STAT_BOOST_DEFS.find(b => b.id === card.statBoostId);
          if (boost) {
            boost.apply(this.player.playerState.modifiers, mult);
            EventBus.emit(EVENTS.STATS_CHANGED);
          }
        }
        break;

      case EnhancementCategory.SYNERGY_UPGRADE:
        if (card.synergyId) {
          EventBus.emit(EVENTS.SYNERGY_SKILL_UPGRADE, card.synergyId);
        }
        break;
    }

    EventBus.emit(EVENTS.ENHANCEMENT_PICKED, card);
  }

  // ─── Grant starting skills on job selection ──────────────────────────

  private grantJobStartingSkills(jobId: JobId): void {
    const job = JOB_DEFS[jobId];
    if (!job) return;

    const mods = this.player.playerState.modifiers;

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

  private getUpgradableSynergySkills(): { id: string; synergyName: string; comboName: string }[] {
    const levels = this.player.playerState.synergySkillLevels;
    const result: { id: string; synergyName: string; comboName: string }[] = [];
    for (const id of this.player.playerState.activeSynergies) {
      if ((levels[id] ?? 1) >= 6) continue;
      // Find synergy info
      const job = JOB_SYNERGIES.find(s => s.id === id);
      if (job?.comboSkill) {
        result.push({ id, synergyName: job.name, comboName: job.comboSkill.name });
        continue;
      }
      const skill = SKILL_SYNERGIES.find(s => s.id === id);
      if (skill?.comboSkill) {
        result.push({ id, synergyName: skill.name, comboName: skill.comboSkill.name });
      }
    }
    return result;
  }

  private getUpgradableWeapons(): WeaponId[] {
    return this.player.playerState.weapons
      .filter(w => w.level < 5)
      .map(w => w.id);
  }

  private getUpgradableJobSkills(): JobSkillId[] {
    // Build set of skills superseded by active synergies
    const superseded = new Set<string>();
    for (const synergyId of this.player.playerState.activeSynergies) {
      const replaced = SYNERGY_SUPERSEDES_SKILL[synergyId];
      if (replaced) replaced.forEach(s => superseded.add(s));
    }

    const result: JobSkillId[] = [];
    for (const jobId of this.player.playerState.chosenJobs) {
      const job = JOB_DEFS[jobId];
      for (const skillId of job.skills) {
        if (superseded.has(skillId)) continue;
        const level = this.player.playerState.jobSkillLevels[skillId] ?? 0;
        if (level < 6) {
          result.push(skillId);
        }
      }
    }
    return result;
  }

  private getUpgradableMasterySkills(): MasterySkillId[] {
    if (!this.player.playerState.isAwakened) return [];
    const result: MasterySkillId[] = [];
    for (const jobId of this.player.playerState.chosenJobs) {
      const job = JOB_DEFS[jobId];
      for (const skillId of job.masterySkills) {
        const level = this.player.playerState.jobSkillLevels[skillId] ?? 0;
        if (level < 6) {
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
        const card: EnhancementCard = {
          category: EnhancementCategory.WEAPON_UPGRADE,
          title: `${WEAPON_NAMES[id]} Lv${w.level + 1}`,
          description: `Upgrade to level ${w.level + 1}`,
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
