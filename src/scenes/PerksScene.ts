import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../constants';
import { JOB_DEFS, JOB_SKILL_DEFS, MASTERY_SKILL_DEFS } from '../data/jobs';
import { WEAPON_DEFS } from '../data/weapons';
import { ENCHANT_DEFS } from '../data/enchants';
import { ELEMENT_DEFS } from '../data/elements';
import { JOB_SYNERGIES, SKILL_SYNERGIES } from '../data/synergies';
import { PlayerState } from '../types/player';
import { WeaponInstance } from '../types/weapons';

const PAD = 16;
const COL_GAP = 12;
const COL_W = Math.floor((GAME_WIDTH - PAD * 2 - COL_GAP) / 2);
const LEFT_X = PAD;
const RIGHT_X = PAD + COL_W + COL_GAP;
const SECTION_GAP = 20;

export class PerksScene extends Phaser.Scene {
  private scrollContainer!: Phaser.GameObjects.Container;
  private maskGfx!: Phaser.GameObjects.Graphics;
  private contentHeight = 0;
  private scrollY = 0;
  private maxScroll = 0;
  private topY = 0;
  private viewH = 0;

  constructor() {
    super(SCENES.PERKS);
  }

  create(): void {
    // Full dim bg
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);

    // Header
    this.add.text(GAME_WIDTH / 2, 14, 'PERKS', {
      fontSize: '28px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#FFAA44',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5, 0).setResolution(16);

    // Close hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, 'ESC to close  |  Scroll or Arrow keys to navigate', {
      fontSize: '14px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: '#555577',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5, 1).setResolution(16);

    // Scrollable area (between header and footer)
    this.topY = 46;
    const bottomY = GAME_HEIGHT - 28;
    this.viewH = bottomY - this.topY;

    this.scrollContainer = this.add.container(0, this.topY);

    // Geometry mask to clip scroll area - use make.graphics (not added to display list)
    this.maskGfx = this.make.graphics({ x: 0, y: 0 });
    this.maskGfx.fillStyle(0xffffff);
    this.maskGfx.fillRect(0, this.topY, GAME_WIDTH, this.viewH);
    this.scrollContainer.setMask(this.maskGfx.createGeometryMask());

    // Get player state
    const gameScene = this.scene.get(SCENES.GAME) as any;
    const state: PlayerState = gameScene.player.playerState;

    // Build content in two columns
    // Left column: Jobs + Skills (related content)
    // Right column: Weapons + Synergies + Stats + Trade-offs
    let leftY = 0;
    let rightY = 0;

    leftY = this.buildJobsSection(leftY, state, LEFT_X, COL_W);
    leftY += SECTION_GAP;
    leftY = this.buildSkillsSection(leftY, state, LEFT_X, COL_W);

    rightY = this.buildWeaponsSection(rightY, state, RIGHT_X, COL_W);
    rightY += SECTION_GAP;
    rightY = this.buildSynergiesSection(rightY, state, RIGHT_X, COL_W);
    rightY += SECTION_GAP;
    rightY = this.buildStatsSection(rightY, state, RIGHT_X, COL_W);

    if (state.takenMalus.length > 0) {
      rightY += SECTION_GAP;
      rightY = this.buildMalusSection(rightY, state, RIGHT_X, COL_W);
    }

    this.contentHeight = Math.max(leftY, rightY) + PAD;
    this.maxScroll = Math.max(0, this.contentHeight - this.viewH);
    this.scrollY = 0;

    // Input: scroll wheel
    this.input.on('wheel', (_p: any, _gx: any, _gy: any, _gz: any, _dx: number, dy: number) => {
      this.setScroll(this.scrollY + dy * 0.5);
    });

    // Arrow keys
    const kb = this.input.keyboard!;
    kb.on('keydown-UP', () => this.setScroll(this.scrollY - 40));
    kb.on('keydown-DOWN', () => this.setScroll(this.scrollY + 40));

    // Close
    kb.on('keydown-ESC', () => this.close());
    kb.on('keydown-P', () => this.close());
  }

  private setScroll(value: number): void {
    this.scrollY = Phaser.Math.Clamp(value, 0, this.maxScroll);
    this.scrollContainer.y = this.topY - this.scrollY;
  }

  private close(): void {
    this.scene.launch(SCENES.PAUSE);
    this.scene.stop();
  }

  // ─── Section Builders ──────────────────────────────────────────────

  private buildJobsSection(y: number, state: PlayerState, colX: number, colW: number): number {
    y = this.addSectionHeader(y, 'JOBS', '#FFD700', colX, colW);
    y += 4;

    if (state.chosenJobs.length === 0) {
      y = this.addLine(y, 'No jobs selected yet', '#666688', '18px', colX, colW);
      return y;
    }

    for (const jobId of state.chosenJobs) {
      const job = JOB_DEFS[jobId];
      if (!job) continue;

      const passiveTier = state.passiveTiers[jobId] ?? 0;
      const stars = this.tierStars(passiveTier, 2);
      const awakened = state.isAwakened ? ' [AWAKENED]' : '';

      y = this.addIconLine(y, job.icon, `${job.name}  ${stars}${awakened}`, job.color, '18px', colX, colW);

      if (passiveTier > 0 && job.passive.tiers[passiveTier - 1]) {
        y = this.addLine(y, `  ${job.passive.name}: ${job.passive.tiers[passiveTier - 1].description}`, '#888888', '16px', colX, colW);
      }
    }

    return y;
  }

  private buildWeaponsSection(y: number, state: PlayerState, colX: number, colW: number): number {
    y = this.addSectionHeader(y, 'WEAPONS', '#FFAA44', colX, colW);
    y += 4;

    if (state.weapons.length === 0) {
      y = this.addLine(y, 'No weapons yet', '#666688', '18px', colX, colW);
      return y;
    }

    for (const w of state.weapons) {
      y = this.addWeaponLine(y, w, colX, colW);
    }

    return y;
  }

  private buildSkillsSection(y: number, state: PlayerState, colX: number, colW: number): number {
    y = this.addSectionHeader(y, 'SKILLS', '#44AAFF', colX, colW);
    y += 4;

    const hasAnySkill = Object.keys(state.jobSkillLevels).length > 0;
    if (!hasAnySkill) {
      y = this.addLine(y, 'No skills unlocked yet', '#666688', '18px', colX, colW);
      return y;
    }

    for (const jobId of state.chosenJobs) {
      const job = JOB_DEFS[jobId];
      if (!job) continue;

      const jobSkills = job.skills.filter(sid => state.jobSkillLevels[sid] > 0);
      const masterySkills = job.masterySkills.filter(sid => state.jobSkillLevels[sid] > 0);
      if (jobSkills.length === 0 && masterySkills.length === 0) continue;

      y = this.addIconLine(y, job.icon, job.name, job.color, '18px', colX, colW);

      for (const skillId of jobSkills) {
        const skillDef = JOB_SKILL_DEFS[skillId];
        if (!skillDef) continue;
        const level = state.jobSkillLevels[skillId] ?? 0;
        const pips = this.levelPips(level, 6);
        const desc = skillDef.levels[level - 1]?.description ?? '';
        y = this.addLine(y, `  ${skillDef.name} ${pips}`, '#CCCCEE', '16px', colX, colW);
        if (desc) {
          y = this.addLine(y, `    ${desc}`, '#777799', '14px', colX, colW);
        }
      }

      // Show mastery skills if any are unlocked
      for (const mSkillId of masterySkills) {
        const mDef = MASTERY_SKILL_DEFS[mSkillId];
        if (!mDef) continue;
        const mLevel = state.jobSkillLevels[mSkillId] ?? 0;
        const mPips = this.levelPips(mLevel, 6);
        const mDesc = mDef.levels[mLevel - 1]?.description ?? '';
        y = this.addLine(y, `  [M] ${mDef.name} ${mPips}`, '#FF88CC', '16px', colX, colW);
        if (mDesc) {
          y = this.addLine(y, `    ${mDesc}`, '#997788', '14px', colX, colW);
        }
      }
    }

    return y;
  }

  private buildSynergiesSection(y: number, state: PlayerState, colX: number, colW: number): number {
    y = this.addSectionHeader(y, 'SYNERGIES', '#DD44FF', colX, colW);
    y += 4;

    const active = state.activeSynergies;
    if (active.length === 0) {
      const msg = state.chosenJobs.length < 2
        ? 'Select a 2nd job to unlock synergies'
        : 'No synergy for your current job combo';
      y = this.addLine(y, msg, '#666688', '18px', colX, colW);
      return y;
    }

    for (const synId of active) {
      // Check job synergies
      const jobSyn = JOB_SYNERGIES.find(s => s.id === synId);
      if (jobSyn) {
        const job1 = JOB_DEFS[jobSyn.jobs[0]];
        const job2 = JOB_DEFS[jobSyn.jobs[1]];
        y = this.addLine(y, `${jobSyn.name}  (${job1?.name} + ${job2?.name})`, '#DD88FF', '18px', colX, colW);
        y = this.addLine(y, `  ${jobSyn.description}`, '#888888', '16px', colX, colW);
        y = this.addLine(y, `  Combo: ${jobSyn.comboSkill.name} - ${jobSyn.comboSkill.description}`, '#9966CC', '14px', colX, colW);
        continue;
      }
      // Check hidden skill synergies
      const skillSyn = SKILL_SYNERGIES.find(s => s.id === synId);
      if (skillSyn) {
        y = this.addLine(y, `[?] ${skillSyn.name}`, '#FFAA44', '18px', colX, colW);
        y = this.addLine(y, `  ${skillSyn.description}`, '#888888', '16px', colX, colW);
        if (skillSyn.comboSkill) {
          y = this.addLine(y, `  Combo: ${skillSyn.comboSkill.name} - ${skillSyn.comboSkill.description}`, '#AA7733', '14px', colX, colW);
        }
      }
    }

    return y;
  }

  private buildStatsSection(y: number, state: PlayerState, colX: number, colW: number): number {
    y = this.addSectionHeader(y, 'STAT MODIFIERS', '#44FF88', colX, colW);
    y += 4;

    const m = state.modifiers;
    const lines: { text: string; color: string }[] = [];

    if (m.maxHpBonus !== 0) lines.push({ text: `Max HP: +${m.maxHpBonus}`, color: '#44FF44' });
    if (m.armor !== 0) lines.push({ text: `Armor: +${m.armor}`, color: '#44FF44' });
    if (m.regenPerSecond !== 0) lines.push({ text: `Regen: +${m.regenPerSecond.toFixed(1)} HP/s`, color: '#44FF44' });
    if (m.damageMultiplier !== 1) lines.push({ text: `Damage: x${m.damageMultiplier.toFixed(2)}`, color: m.damageMultiplier >= 1 ? '#44FF44' : '#FF4444' });
    if (m.cooldownMultiplier !== 1) {
      const faster = m.cooldownMultiplier < 1;
      lines.push({ text: `Atk Speed: ${faster ? '+' : ''}${((1 - m.cooldownMultiplier) * 100).toFixed(0)}%`, color: faster ? '#44FF44' : '#FF4444' });
    }
    if (m.speedMultiplier !== 1) lines.push({ text: `Move Speed: x${m.speedMultiplier.toFixed(2)}`, color: '#44FF44' });
    if (m.pickupRadiusMultiplier !== 1) lines.push({ text: `Pickup: x${m.pickupRadiusMultiplier.toFixed(2)}`, color: '#44FF44' });
    if (m.xpMultiplier !== 1) lines.push({ text: `XP: x${m.xpMultiplier.toFixed(2)}`, color: '#44FF44' });
    if (m.critChance > 0) lines.push({ text: `Crit: +${(m.critChance * 100).toFixed(0)}%`, color: '#FFDD44' });
    if (m.critDamageBonus > 0) lines.push({ text: `Crit Dmg: +${(m.critDamageBonus * 100).toFixed(0)}%`, color: '#FFDD44' });
    if (m.dodgeChance > 0) lines.push({ text: `Dodge: +${(m.dodgeChance * 100).toFixed(0)}%`, color: '#88CCFF' });
    if (m.bonusPierce > 0) lines.push({ text: `Pierce: +${m.bonusPierce}`, color: '#44FF44' });
    if (m.bonusProjectiles > 0) lines.push({ text: `Bonus Proj: +${m.bonusProjectiles}`, color: '#44FF44' });
    if (m.bonusDashCharges > 0) lines.push({ text: `Dash: +${m.bonusDashCharges}`, color: '#88CCFF' });
    if (m.lifeStealPercent > 0) lines.push({ text: `Lifesteal: +${(m.lifeStealPercent * 100).toFixed(0)}%`, color: '#FF4488' });
    if (m.killHealAmount > 0) lines.push({ text: `Kill Heal: +${m.killHealAmount} HP`, color: '#44FF88' });
    if (m.burnChance > 0) lines.push({ text: `Burn: +${(m.burnChance * 100).toFixed(0)}%`, color: '#FF8844' });
    if (m.slowChance > 0) lines.push({ text: `Slow: +${(m.slowChance * 100).toFixed(0)}%`, color: '#88CCFF' });
    if (m.doubleGemChance > 0) lines.push({ text: `Double Gem: +${(m.doubleGemChance * 100).toFixed(0)}%`, color: '#44FF44' });
    if (m.rangeMultiplier !== 1) lines.push({ text: `Range: x${m.rangeMultiplier.toFixed(2)}`, color: '#44FF44' });
    if (m.meleeScaleMultiplier !== 1) lines.push({ text: `Melee Scale: x${m.meleeScaleMultiplier.toFixed(2)}`, color: '#44FF44' });
    if (m.projectileScaleMultiplier !== 1) lines.push({ text: `Proj Scale: x${m.projectileScaleMultiplier.toFixed(2)}`, color: '#44FF44' });
    if (m.aoeScaleMultiplier !== 1) lines.push({ text: `AoE Scale: x${m.aoeScaleMultiplier.toFixed(2)}`, color: '#44FF44' });
    if (m.healingMultiplier !== 1) lines.push({ text: `Healing: x${m.healingMultiplier.toFixed(2)}`, color: m.healingMultiplier < 1 ? '#FF4444' : '#44FF44' });
    if (m.meleeDamageMultiplier !== 1) lines.push({ text: `Melee Dmg: x${m.meleeDamageMultiplier.toFixed(2)}`, color: m.meleeDamageMultiplier < 1 ? '#FF4444' : '#44FF44' });
    if (m.projectileDamageMultiplier !== 1) lines.push({ text: `Proj Dmg: x${m.projectileDamageMultiplier.toFixed(2)}`, color: m.projectileDamageMultiplier < 1 ? '#FF4444' : '#44FF44' });

    if (lines.length === 0) {
      y = this.addLine(y, 'No modifiers active', '#666688', '18px', colX, colW);
      return y;
    }

    for (const line of lines) {
      y = this.addLine(y, line.text, line.color, '16px', colX, colW);
    }

    return y;
  }

  private buildMalusSection(y: number, state: PlayerState, colX: number, colW: number): number {
    y = this.addSectionHeader(y, 'TRADE-OFFS', '#FF4444', colX, colW);
    y += 4;

    for (const malusId of state.takenMalus) {
      y = this.addLine(y, `- ${malusId.replace(/_/g, ' ')}`, '#FF6666', '16px', colX, colW);
    }

    return y;
  }

  // ─── Helpers ───────────────────────────────────────────────────────

  private addSectionHeader(y: number, title: string, color: string, colX: number, colW: number): number {
    const line = this.add.rectangle(colX + colW / 2, y + 2, colW, 1, Phaser.Display.Color.HexStringToColor(color).color, 0.3);
    this.scrollContainer.add(line);

    const text = this.add.text(colX, y + 6, title, {
      fontSize: '22px',
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setResolution(16);
    this.scrollContainer.add(text);

    return y + 32;
  }

  private addIconLine(y: number, iconKey: string, content: string, color: string, fontSize: string, colX: number, colW: number): number {
    const iconOffset = 20;
    if (this.textures.exists(iconKey)) {
      const icon = this.add.image(colX + 8, y + 8, iconKey);
      icon.setScale(1);
      icon.setOrigin(0.5, 0.5);
      this.scrollContainer.add(icon);
    }
    const text = this.add.text(colX + iconOffset, y, content, {
      fontSize: fontSize,
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
      wordWrap: { width: colW - iconOffset },
    }).setResolution(16);
    this.scrollContainer.add(text);
    return y + Math.max(text.height, 16) + 2;
  }

  private addLine(y: number, content: string, color: string, fontSize: string, colX: number, colW: number): number {
    const text = this.add.text(colX, y, content, {
      fontSize: fontSize,
      fontFamily: '"Trebuchet MS", Verdana, sans-serif',
      color: color,
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: colW },
    }).setResolution(16);
    this.scrollContainer.add(text);
    return y + text.height + 2;
  }

  private addWeaponLine(y: number, w: WeaponInstance, colX: number, colW: number): number {
    const def = WEAPON_DEFS[w.id];
    if (!def) return y;

    let label = `${def.name} Lv${w.level}`;

    if (w.enchant) {
      const enchDef = ENCHANT_DEFS[w.enchant];
      if (enchDef) label += `  [${enchDef.name} T${w.enchantTier}]`;
    }

    if (w.element) {
      const elDef = ELEMENT_DEFS[w.element];
      if (elDef) {
        label += `  {${elDef.name}}`;
        if (w.elementUpgrades.length > 0) label += ` +${w.elementUpgrades.length}`;
      }
    }

    const affinityColor = def.affinityJob ? JOB_DEFS[def.affinityJob]?.color ?? '#FFAA44' : '#FFAA44';
    y = this.addLine(y, label, affinityColor, '16px', colX, colW);

    const pips = this.levelPips(w.level, 5);
    y = this.addLine(y, `  ${pips}`, '#888888', '14px', colX, colW);

    return y;
  }

  private tierStars(tier: number, max: number): string {
    let s = '';
    for (let i = 0; i < max; i++) s += i < tier ? '\u2605' : '\u2606';
    return s;
  }

  private levelPips(level: number, max: number): string {
    let s = '';
    for (let i = 0; i < max; i++) s += i < level ? '\u25CF' : '\u25CB';
    return s;
  }
}
