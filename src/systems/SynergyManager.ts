import Phaser from 'phaser';
import { EVENTS, DEPTHS, SPRITE_SCALE } from '../constants';
import { JOB_SYNERGIES, SKILL_SYNERGIES, JobSynergy, SkillSynergy, ComboSkillDef } from '../data/synergies';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from './EventBus';

interface ActiveComboSkill {
  synergyId: string;
  combo: ComboSkillDef;
  cooldownTimer: number;
  healOnHit: boolean;
  selfDamage: boolean;
  level: number; // 1-3
  dashTriggered: boolean; // fires on dash instead of auto-fire
}

// Per-level scaling for synergy combo skills
const SYNERGY_LEVEL_SCALING = [
  { damage: 1.0,  cooldown: 1.0,  radius: 1.0  },  // Lv1
  { damage: 1.35, cooldown: 0.85, radius: 1.10 },   // Lv2: +35% dmg, -15% cd, +10% radius
  { damage: 1.80, cooldown: 0.70, radius: 1.20 },   // Lv3: +80% dmg, -30% cd, +20% radius
  { damage: 2.30, cooldown: 0.60, radius: 1.30 },   // Lv4
  { damage: 2.85, cooldown: 0.50, radius: 1.40 },   // Lv5
  { damage: 3.50, cooldown: 0.40, radius: 1.50 },   // Lv6
];

export class SynergyManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemyGroup: Phaser.Physics.Arcade.Group;
  private activeSkills: ActiveComboSkill[] = [];

  constructor(scene: Phaser.Scene, player: Player, enemyGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.player = player;
    this.enemyGroup = enemyGroup;
    EventBus.on(EVENTS.JOB_CHOSEN, this.checkJobSynergies, this);
    EventBus.on(EVENTS.JOB_SKILL_UPGRADED, this.checkSkillSynergies, this);
    EventBus.on(EVENTS.PLAYER_DASHED, this.onPlayerDashed, this);
    EventBus.on(EVENTS.SYNERGY_SKILL_UPGRADE, (synergyId: string) => this.upgradeSynergySkill(synergyId));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // JOB SYNERGIES
  // ═══════════════════════════════════════════════════════════════════════

  public checkJobSynergies(): void {
    const jobs = new Set(this.player.playerState.chosenJobs);
    const active = this.player.playerState.activeSynergies;

    for (const synergy of JOB_SYNERGIES) {
      if (active.includes(synergy.id)) continue;
      const [jobA, jobB] = synergy.jobs;
      if (jobs.has(jobA) && jobs.has(jobB)) {
        this.activateJobSynergy(synergy);
      }
    }
  }

  private activateJobSynergy(synergy: JobSynergy): void {
    this.player.playerState.activeSynergies.push(synergy.id);
    synergy.apply(this.player.playerState.modifiers);
    EventBus.emit(EVENTS.STATS_CHANGED);

    // Register combo skill at level 1
    if (synergy.comboSkill) {
      this.player.playerState.synergySkillLevels[synergy.id] = 1;
      const healIds = new Set(['holy_knight', 'apothecary', 'chorus_healer', 'sacred_archer', 'holy_fist', 'ghost_healer']);
      const dashTriggeredIds = new Set(['chrono_assassin']);
      this.activeSkills.push({
        synergyId: synergy.id,
        combo: synergy.comboSkill,
        cooldownTimer: synergy.comboSkill.cooldown * 0.5,
        healOnHit: healIds.has(synergy.id),
        selfDamage: synergy.id === 'blood_warrior',
        dashTriggered: dashTriggeredIds.has(synergy.id),
        level: 1,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SKILL SYNERGIES (hidden)
  // ═══════════════════════════════════════════════════════════════════════

  private checkSkillSynergies = (): void => {
    const skillLevels = this.player.playerState.jobSkillLevels;
    const active = this.player.playerState.activeSynergies;

    for (const synergy of SKILL_SYNERGIES) {
      if (active.includes(synergy.id)) continue;
      const [skillA, skillB] = synergy.skills;
      if ((skillLevels[skillA] ?? 0) > 0 && (skillLevels[skillB] ?? 0) > 0) {
        this.activateSkillSynergy(synergy);
      }
    }
  };

  private activateSkillSynergy(synergy: SkillSynergy): void {
    this.player.playerState.activeSynergies.push(synergy.id);
    synergy.apply(this.player.playerState.modifiers);
    EventBus.emit(EVENTS.STATS_CHANGED);

    // Register combo skill if it has one, at level 1
    if (synergy.comboSkill) {
      this.player.playerState.synergySkillLevels[synergy.id] = 1;
      this.activeSkills.push({
        synergyId: synergy.id,
        combo: synergy.comboSkill,
        cooldownTimer: synergy.comboSkill.cooldown * 0.5,
        healOnHit: false,
        selfDamage: false,
        dashTriggered: false,
        level: 1,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SYNERGY SKILL UPGRADE
  // ═══════════════════════════════════════════════════════════════════════

  /** Get synergy IDs that have combo skills below max level (6) */
  public getUpgradableSynergies(): string[] {
    const levels = this.player.playerState.synergySkillLevels;
    return this.activeSkills
      .filter(s => (levels[s.synergyId] ?? 1) < 6)
      .map(s => s.synergyId);
  }

  /** Upgrade a synergy combo skill by 1 level */
  public upgradeSynergySkill(synergyId: string): void {
    const levels = this.player.playerState.synergySkillLevels;
    const current = levels[synergyId] ?? 1;
    if (current >= 6) return;
    levels[synergyId] = current + 1;

    // Update the active skill's level
    const skill = this.activeSkills.find(s => s.synergyId === synergyId);
    if (skill) {
      skill.level = levels[synergyId];
    }
  }

  /** Find the synergy name/combo for a given synergyId */
  public getSynergyInfo(synergyId: string): { name: string; comboName: string; level: number } | null {
    const levels = this.player.playerState.synergySkillLevels;
    const job = JOB_SYNERGIES.find(s => s.id === synergyId);
    if (job?.comboSkill) {
      return { name: job.name, comboName: job.comboSkill.name, level: levels[synergyId] ?? 1 };
    }
    const skill = SKILL_SYNERGIES.find(s => s.id === synergyId);
    if (skill?.comboSkill) {
      return { name: skill.name, comboName: skill.comboSkill.name, level: levels[synergyId] ?? 1 };
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DASH COOLDOWN RESET (Chrono Assassin)
  // ═══════════════════════════════════════════════════════════════════════

  private onPlayerDashed = (): void => {
    if (!this.player.playerState.activeSynergies.includes('chrono_assassin')) return;

    // Reset all weapon cooldowns
    EventBus.emit(EVENTS.RESET_WEAPON_COOLDOWNS);

    // Reset all synergy combo skill cooldowns (except dash-triggered ones)
    for (const skill of this.activeSkills) {
      if (!skill.dashTriggered) skill.cooldownTimer = 0;
    }

    // Blink Strike: teleport to nearest enemy + slash
    const blinkSkill = this.activeSkills.find(s => s.synergyId === 'chrono_assassin');
    if (blinkSkill) {
      this.fireBlinkStrike(blinkSkill);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════════════════

  public update(_time: number, delta: number): void {
    for (const skill of this.activeSkills) {
      if (skill.dashTriggered) continue; // fired on dash, not auto
      skill.cooldownTimer -= delta;
      if (skill.cooldownTimer <= 0) {
        const lvlScale = SYNERGY_LEVEL_SCALING[Math.min(skill.level, 3) - 1];
        skill.cooldownTimer = skill.combo.cooldown * lvlScale.cooldown * this.player.getEffectiveCooldownMultiplier();
        this.fireComboSkill(skill);
      }
    }
  }

  private fireComboSkill(skill: ActiveComboSkill): void {
    const combo = skill.combo;
    const px = this.player.x;
    const py = this.player.y;
    const lvl = Math.min(skill.level, 6);
    const scaling = SYNERGY_LEVEL_SCALING[lvl - 1];
    const radius = combo.radius * scaling.radius * this.player.playerState.modifiers.rangeMultiplier;
    const damage = Math.floor(combo.damage * scaling.damage * this.player.getEffectiveDamageMultiplier());

    // Self-damage (Blood Warrior)
    if (skill.selfDamage) {
      const hpCost = Math.floor(this.player.playerState.stats.currentHP * 0.05);
      this.player.takeDamage(hpCost);
    }

    const enemies = this.enemyGroup.getChildren() as Enemy[];
    const healOnHit = skill.healOnHit;

    // Each visualType handler applies UNIQUE damage mechanics + visuals
    const vt = combo.visualType ?? 'ring';
    let hitCount = 0;
    switch (vt) {
      case 'rain':        hitCount = this.fireArrowRain(px, py, radius, damage, combo.color, enemies); break;
      case 'nova':        hitCount = this.fireNova(px, py, radius, damage, combo.color, enemies); break;
      case 'field':       this.fireField(px, py, radius, damage, combo.color, enemies, healOnHit); return;
      case 'slash':       hitCount = this.fireSlash(px, py, radius, damage, combo.color, enemies); break;
      case 'clones':      hitCount = this.fireClones(px, py, radius, damage, combo.color, enemies); break;
      case 'bolts':       hitCount = this.fireBolts(px, py, radius, damage, combo.color, enemies); break;
      case 'heal_burst':  hitCount = this.fireHealBurst(px, py, radius, damage, combo.color, enemies); break;
      case 'summon':      this.fireSummon(px, py, radius, damage, combo.color, enemies, healOnHit); return;
      case 'toxic_cloud': this.fireToxicCloud(px, py, radius, damage, combo.color, enemies, healOnHit); return;
      case 'shadow_arrow': hitCount = this.fireShadowArrow(px, py, radius, damage, combo.color, enemies); break;
      default:            hitCount = this.fireGenericRing(px, py, radius, damage, combo.color, enemies); break;
    }

    // Heal on hit (instant-damage types)
    if (healOnHit && hitCount > 0) {
      this.player.heal(10);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VISUAL EFFECTS
  // ═══════════════════════════════════════════════════════════════════════

  /** Arrow rain: random impact zones within radius, each zone has small AoE */
  private fireArrowRain(cx: number, cy: number, radius: number, damage: number, color: number, enemies: Enemy[]): number {
    const arrowCount = 8;
    const impactRadius = 30;
    const fallHeight = 120 * SPRITE_SCALE;
    const hitEnemies = new Set<Enemy>();

    // Target zone indicator
    const zone = this.scene.add.graphics();
    zone.setDepth(DEPTHS.EFFECTS - 2);
    zone.fillStyle(color, 0.08);
    zone.fillCircle(cx, cy, radius);
    zone.lineStyle(1, color, 0.3);
    zone.strokeCircle(cx, cy, radius);
    this.scene.tweens.add({
      targets: zone, alpha: 0, duration: 800, ease: 'Linear',
      onComplete: () => zone.destroy(),
    });

    for (let i = 0; i < arrowCount; i++) {
      const delay = i * 100 + Math.random() * 60;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius * 0.9;
      const landX = cx + Math.cos(angle) * dist;
      const landY = cy + Math.sin(angle) * dist;
      const startX = landX + (Math.random() - 0.5) * 20 * SPRITE_SCALE;
      const startY = landY - fallHeight;

      this.scene.time.delayedCall(delay, () => {
        // Damage enemies in this impact zone
        for (const enemy of enemies) {
          if (!enemy.active) continue;
          const d = Phaser.Math.Distance.Between(landX, landY, enemy.x, enemy.y);
          if (d <= impactRadius) {
            enemy.takeDamage(damage);
            EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
            hitEnemies.add(enemy);
          }
        }

        const arrow = this.scene.add.graphics();
        arrow.setDepth(DEPTHS.EFFECTS);
        const len = 10 * SPRITE_SCALE;
        const dx = landX - startX;
        const dy = landY - startY;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / d;
        const ny = dy / d;

        arrow.lineStyle(2, color, 0.9);
        arrow.beginPath();
        arrow.moveTo(0, 0);
        arrow.lineTo(nx * len, ny * len);
        arrow.strokePath();
        arrow.fillStyle(0xFFFFFF, 0.9);
        arrow.fillTriangle(
          nx * len, ny * len,
          nx * len - ny * 3 - nx * 4, ny * len + nx * 3 - ny * 4,
          nx * len + ny * 3 - nx * 4, ny * len - nx * 3 - ny * 4,
        );
        arrow.setPosition(startX, startY);

        this.scene.tweens.add({
          targets: arrow, x: landX, y: landY,
          duration: 120 + Math.random() * 60, ease: 'Quad.easeIn',
          onComplete: () => {
            arrow.destroy();
            const impact = this.scene.add.graphics();
            impact.setDepth(DEPTHS.EFFECTS);
            impact.fillStyle(color, 0.6);
            impact.fillCircle(landX, landY, impactRadius);
            impact.fillStyle(0xFFFFFF, 0.4);
            impact.fillCircle(landX, landY, impactRadius * 0.5);
            this.scene.tweens.add({
              targets: impact, alpha: 0, duration: 200,
              onComplete: () => impact.destroy(),
            });
          },
        });
      });
    }

    return hitEnemies.size;
  }

  /** Nova: instant AoE burst with damage falloff at edges + knockback */
  private fireNova(cx: number, cy: number, radius: number, damage: number, color: number, enemies: Enemy[]): number {
    let hitCount = 0;

    // Damage with falloff + knockback
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(cx, cy, enemy.x, enemy.y);
      if (dist <= radius) {
        const falloff = 1 - (dist / radius) * 0.4;
        const finalDmg = Math.floor(damage * falloff);
        enemy.takeDamage(finalDmg);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, finalDmg);
        hitCount++;

        // Knockback outward
        const angle = Math.atan2(enemy.y - cy, enemy.x - cx);
        const knockback = 40 * (1 - dist / radius);
        const body = enemy.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(
            body.velocity.x + Math.cos(angle) * knockback * 10,
            body.velocity.y + Math.sin(angle) * knockback * 10,
          );
        }
      }
    }

    // Visual: central flash
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS);
    gfx.fillStyle(0xFFFFFF, 0.8);
    gfx.fillCircle(cx, cy, 6 * SPRITE_SCALE);
    this.scene.tweens.add({
      targets: gfx, alpha: 0, duration: 150,
      onComplete: () => gfx.destroy(),
    });

    // Expanding ring
    const ring = this.scene.add.graphics();
    ring.setDepth(DEPTHS.EFFECTS);
    let progress = 0;
    const expandDuration = 250;
    this.scene.time.addEvent({
      delay: 16,
      repeat: Math.floor(expandDuration / 16),
      callback: () => {
        progress += 16 / expandDuration;
        const r = radius * Math.min(1, progress);
        const a = 1 - progress;
        ring.clear();
        ring.lineStyle(4, color, a);
        ring.strokeCircle(cx, cy, r);
        ring.fillStyle(color, a * 0.2);
        ring.fillCircle(cx, cy, r);
        if (progress >= 1) ring.destroy();
      },
    });

    // Debris particles
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.3;
      const p = this.scene.add.graphics();
      p.setDepth(DEPTHS.EFFECTS);
      p.fillStyle(color, 0.8);
      p.fillRect(-2, -2, 4, 4);
      p.setPosition(cx, cy);
      this.scene.tweens.add({
        targets: p,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        alpha: 0,
        duration: 300 + Math.random() * 100,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy(),
      });
    }

    return hitCount;
  }

  /** Field: persistent ground zone dealing 25% damage per tick over 3s (150% total) */
  private fireField(cx: number, cy: number, radius: number, damage: number, color: number, enemies: Enemy[], healOnHit: boolean): void {
    const tickCount = 6;
    const tickInterval = 500;
    const tickDamage = Math.floor(damage * 0.25);
    let ticks = 0;

    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS - 1);

    // Grow animation
    let progress = 0;
    const growDuration = 200;
    this.scene.time.addEvent({
      delay: 16,
      repeat: Math.floor(growDuration / 16),
      callback: () => {
        progress += 16 / growDuration;
        const r = radius * Math.min(1, progress);
        gfx.clear();
        gfx.fillStyle(color, 0.25);
        gfx.fillCircle(cx, cy, r);
        gfx.lineStyle(2, color, 0.5);
        gfx.strokeCircle(cx, cy, r);
      },
    });

    // Damage ticks every 500ms
    this.scene.time.addEvent({
      delay: tickInterval,
      repeat: tickCount - 1,
      callback: () => {
        ticks++;
        const currentEnemies = this.enemyGroup.getChildren() as Enemy[];
        let tickHits = 0;
        for (const enemy of currentEnemies) {
          if (!enemy.active) continue;
          const dist = Phaser.Math.Distance.Between(cx, cy, enemy.x, enemy.y);
          if (dist <= radius) {
            enemy.takeDamage(tickDamage);
            EventBus.emit(EVENTS.ENEMY_HIT, enemy, tickDamage);
            tickHits++;
          }
        }
        if (healOnHit && tickHits > 0) {
          this.player.heal(10);
        }

        // Pulse visual on each tick
        const pulse = this.scene.add.graphics();
        pulse.setDepth(DEPTHS.EFFECTS);
        pulse.lineStyle(2, 0xFFFFFF, 0.4);
        pulse.strokeCircle(cx, cy, radius * 0.5);
        this.scene.tweens.add({
          targets: pulse, alpha: 0, duration: 300,
          onComplete: () => pulse.destroy(),
        });

        // Fade out on last tick
        if (ticks >= tickCount) {
          this.scene.tweens.add({
            targets: gfx, alpha: 0, duration: 500, ease: 'Quad.easeIn',
            onComplete: () => gfx.destroy(),
          });
        }
      },
    });
  }

  /** Toxic cloud: persistent 4s poison cloud, enemies inside get poisoned (DoT over 4 ticks) */
  private fireToxicCloud(cx: number, cy: number, radius: number, damage: number, color: number, _enemies: Enemy[], healOnHit: boolean): void {
    const cloudDuration = 4000;
    const tickInterval = 1000;
    const tickDamage = Math.floor(damage * 0.3);

    // Base toxic zone circle
    const zone = this.scene.add.graphics();
    zone.setDepth(DEPTHS.EFFECTS - 1);
    zone.fillStyle(color, 0.2);
    zone.fillCircle(cx, cy, radius);
    zone.lineStyle(1, color, 0.3);
    zone.strokeCircle(cx, cy, radius);

    // Damage ticks every 1s for 4s
    let ticks = 0;
    this.scene.time.addEvent({
      delay: tickInterval,
      repeat: Math.floor(cloudDuration / tickInterval) - 1,
      callback: () => {
        ticks++;
        const currentEnemies = this.enemyGroup.getChildren() as Enemy[];
        let tickHits = 0;
        for (const enemy of currentEnemies) {
          if (!enemy.active) continue;
          const dist = Phaser.Math.Distance.Between(cx, cy, enemy.x, enemy.y);
          if (dist <= radius) {
            enemy.takeDamage(tickDamage);
            EventBus.emit(EVENTS.ENEMY_HIT, enemy, tickDamage);
            tickHits++;
          }
        }
        if (healOnHit && tickHits > 0) {
          this.player.heal(10);
        }

        // Spawn smoke puffs per tick
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * radius * 0.8;
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          const puff = this.scene.add.graphics();
          puff.setDepth(DEPTHS.EFFECTS);
          puff.setBlendMode(Phaser.BlendModes.ADD);
          const puffSize = 8 + Math.random() * 12;
          puff.fillStyle(color, 0.4);
          puff.fillCircle(0, 0, puffSize);
          puff.fillStyle(0xCCDD88, 0.2);
          puff.fillCircle(0, 0, puffSize * 0.5);
          puff.setPosition(px, py);
          this.scene.tweens.add({
            targets: puff,
            x: px + (Math.random() - 0.5) * 20,
            y: py - 8 - Math.random() * 12,
            scaleX: 1.5, scaleY: 1.5,
            alpha: 0,
            duration: 800 + Math.random() * 400,
            ease: 'Quad.easeOut',
            onComplete: () => puff.destroy(),
          });
        }
      },
    });

    // Fade out the base zone after duration
    this.scene.tweens.add({
      targets: zone,
      alpha: 0,
      duration: cloudDuration,
      ease: 'Quad.easeIn',
      onComplete: () => zone.destroy(),
    });
  }

  /** Ring: expanding ring that hits enemies as it passes through them (delayed by distance) */
  private fireGenericRing(cx: number, cy: number, radius: number, damage: number, color: number, enemies: Enemy[]): number {
    const expandDuration = 300;
    let hitCount = 0;

    // Enemies get hit when the ring reaches them (based on distance)
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(cx, cy, enemy.x, enemy.y);
      if (dist <= radius && dist >= radius * 0.2) {
        const delay = (dist / radius) * expandDuration;
        hitCount++;
        this.scene.time.delayedCall(delay, () => {
          if (enemy.active) {
            enemy.takeDamage(damage);
            EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
          }
        });
      }
    }

    // Visual: expanding ring
    const gfx = this.scene.add.graphics();
    gfx.setDepth(DEPTHS.EFFECTS);
    let progress = 0;
    this.scene.time.addEvent({
      delay: 16,
      repeat: Math.floor(expandDuration / 16),
      callback: () => {
        progress += 16 / expandDuration;
        const currentRadius = radius * Math.min(1, progress);
        const alpha = 1 - progress;
        gfx.clear();
        gfx.lineStyle(3, color, alpha * 0.8);
        gfx.strokeCircle(cx, cy, currentRadius);
        gfx.fillStyle(color, alpha * 0.15);
        gfx.fillCircle(cx, cy, currentRadius);
        if (progress >= 1) gfx.destroy();
      },
    });

    return hitCount;
  }

  /** Slash: 120° directional cone in player facing direction, 1.5x damage */
  private fireSlash(cx: number, cy: number, radius: number, damage: number, color: number, enemies: Enemy[]): number {
    const coneHalfAngle = Math.PI / 3; // 60° each side = 120° total
    const slashDamage = Math.floor(damage * 1.5);
    let hitCount = 0;

    // Determine facing direction from player velocity or last movement
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let facingAngle = 0;
    if (body && (Math.abs(body.velocity.x) > 1 || Math.abs(body.velocity.y) > 1)) {
      facingAngle = Math.atan2(body.velocity.y, body.velocity.x);
    } else {
      // Default: aim toward nearest enemy
      let nearest: Enemy | null = null;
      let nearestDist = Infinity;
      for (const e of enemies) {
        if (!e.active) continue;
        const d = Phaser.Math.Distance.Between(cx, cy, e.x, e.y);
        if (d < nearestDist) { nearestDist = d; nearest = e; }
      }
      if (nearest) facingAngle = Math.atan2(nearest.y - cy, nearest.x - cx);
    }

    // Damage enemies in cone
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(cx, cy, enemy.x, enemy.y);
      if (dist > radius) continue;
      const angleToEnemy = Math.atan2(enemy.y - cy, enemy.x - cx);
      let angleDiff = angleToEnemy - facingAngle;
      // Normalize to [-PI, PI]
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      if (Math.abs(angleDiff) <= coneHalfAngle) {
        enemy.takeDamage(slashDamage);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, slashDamage);
        hitCount++;
      }
    }

    // Visual: blade arc in facing direction
    const slashCount = 3;
    for (let i = 0; i < slashCount; i++) {
      const arcOffset = (i - 1) * 0.3;
      const startAngle = facingAngle - coneHalfAngle + arcOffset;
      const endAngle = facingAngle + coneHalfAngle + arcOffset;
      const delay = i * 80;

      this.scene.time.delayedCall(delay, () => {
        const trail = this.scene.add.graphics();
        trail.setDepth(DEPTHS.EFFECTS);
        trail.fillStyle(color, 0.5);
        trail.slice(cx, cy, radius, startAngle, endAngle, false);
        trail.fillPath();
        trail.fillStyle(0xFFFFFF, 0.3);
        trail.slice(cx, cy, radius * 0.95, startAngle + 0.1, endAngle - 0.1, false);
        trail.fillPath();
        trail.lineStyle(3, 0xFFFFFF, 0.8);
        trail.beginPath();
        trail.moveTo(cx, cy);
        trail.lineTo(cx + Math.cos(endAngle) * radius, cy + Math.sin(endAngle) * radius);
        trail.strokePath();
        this.scene.tweens.add({
          targets: trail, alpha: 0, duration: 250, ease: 'Quad.easeOut',
          onComplete: () => trail.destroy(),
        });

        for (let s = 0; s < 3; s++) {
          const sparkAngle = endAngle + (Math.random() - 0.5) * 0.4;
          const sparkDist = radius * (0.8 + Math.random() * 0.3);
          const sx = cx + Math.cos(sparkAngle) * sparkDist;
          const sy = cy + Math.sin(sparkAngle) * sparkDist;
          const spark = this.scene.add.graphics();
          spark.setDepth(DEPTHS.EFFECTS + 1);
          spark.fillStyle(0xFFFFFF, 0.9);
          spark.fillRect(-1, -1, 2, 2);
          spark.setPosition(sx, sy);
          this.scene.tweens.add({
            targets: spark,
            x: sx + Math.cos(sparkAngle) * 15, y: sy + Math.sin(sparkAngle) * 15,
            alpha: 0, duration: 150, ease: 'Quad.easeOut',
            onComplete: () => spark.destroy(),
          });
        }
      });
    }

    return hitCount;
  }

  /** Clones: shadow clone dashes toward nearest enemies, line collision damage */
  private fireClones(cx: number, cy: number, radius: number, damage: number, color: number, enemies: Enemy[]): number {
    const cloneCount = 3 + Math.floor(Math.random() * 2); // 3-4
    const lineWidth = 20; // collision width of each dash line
    const hitEnemies = new Set<Enemy>();

    // Pick targets: nearest enemies or random directions
    const activeEnemies = enemies
      .filter(e => e.active)
      .sort((a, b) =>
        Phaser.Math.Distance.Between(cx, cy, a.x, a.y) -
        Phaser.Math.Distance.Between(cx, cy, b.x, b.y)
      );
    const targets: { x: number; y: number }[] = [];
    for (let i = 0; i < cloneCount; i++) {
      if (activeEnemies[i]) {
        targets.push({ x: activeEnemies[i].x, y: activeEnemies[i].y });
      } else {
        const angle = (Math.PI * 2 / cloneCount) * i + Math.random() * 0.5;
        targets.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
      }
    }

    // Damage check: enemies along each dash line
    for (const t of targets) {
      const angle = Math.atan2(t.y - cy, t.x - cx);
      const endX = cx + Math.cos(angle) * radius;
      const endY = cy + Math.sin(angle) * radius;
      const dx = endX - cx;
      const dy = endY - cy;
      const lineLen = Math.sqrt(dx * dx + dy * dy) || 1;

      for (const enemy of enemies) {
        if (!enemy.active) continue;
        // Point-to-line-segment distance
        const ex = enemy.x - cx;
        const ey = enemy.y - cy;
        const t2 = Math.max(0, Math.min(1, (ex * dx + ey * dy) / (lineLen * lineLen)));
        const closestX = dx * t2;
        const closestY = dy * t2;
        const distToLine = Math.sqrt((ex - closestX) ** 2 + (ey - closestY) ** 2);
        if (distToLine <= lineWidth) {
          if (!hitEnemies.has(enemy)) {
            enemy.takeDamage(damage);
            EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
            hitEnemies.add(enemy);
          }
        }
      }
    }

    // Visual: clone dashes
    for (let i = 0; i < cloneCount; i++) {
      const t = targets[i];
      const delay = i * 100;
      this.scene.time.delayedCall(delay, () => {
        const angle = Math.atan2(t.y - cy, t.x - cx);
        const endX = cx + Math.cos(angle) * radius;
        const endY = cy + Math.sin(angle) * radius;

        const clone = this.scene.add.graphics();
        clone.setDepth(DEPTHS.EFFECTS + 1);
        clone.fillStyle(color, 0.7);
        clone.fillCircle(0, -8, 4);
        clone.fillRect(-3, -4, 6, 12);
        clone.lineStyle(2, 0xFFFFFF, 0.8);
        clone.beginPath();
        clone.moveTo(3, -2);
        clone.lineTo(10, -8);
        clone.strokePath();
        clone.setPosition(cx, cy);
        clone.setRotation(angle + Math.PI / 2);

        const trail = this.scene.add.graphics();
        trail.setDepth(DEPTHS.EFFECTS);
        this.scene.tweens.add({
          targets: clone, x: endX, y: endY,
          duration: 150, ease: 'Quad.easeIn',
          onUpdate: () => {
            trail.fillStyle(color, 0.25);
            trail.fillCircle(clone.x, clone.y, 6);
          },
          onComplete: () => {
            const slashGfx = this.scene.add.graphics();
            slashGfx.setDepth(DEPTHS.EFFECTS);
            slashGfx.lineStyle(3, 0xFFFFFF, 0.8);
            const perpAngle = angle + Math.PI / 2;
            const slashLen = 15;
            slashGfx.beginPath();
            slashGfx.moveTo(endX + Math.cos(perpAngle) * slashLen, endY + Math.sin(perpAngle) * slashLen);
            slashGfx.lineTo(endX - Math.cos(perpAngle) * slashLen, endY - Math.sin(perpAngle) * slashLen);
            slashGfx.strokePath();
            this.scene.tweens.add({
              targets: slashGfx, alpha: 0, duration: 300,
              onComplete: () => slashGfx.destroy(),
            });
            clone.destroy();
            this.scene.tweens.add({
              targets: trail, alpha: 0, duration: 200,
              onComplete: () => trail.destroy(),
            });
          },
        });
      });
    }

    return hitEnemies.size;
  }

  /** Bolts: chain lightning - hit nearest, chain up to 8 bounces, 85% per bounce */
  private fireBolts(cx: number, cy: number, radius: number, damage: number, color: number, enemies: Enemy[]): number {
    const maxBounces = 8;
    const chainRange = 100;
    const decayRate = 0.85;

    // Find nearest enemy in radius as first target
    const inRange = enemies.filter(e => e.active && Phaser.Math.Distance.Between(cx, cy, e.x, e.y) <= radius);
    if (inRange.length === 0) {
      // Fallback to nova if no enemies
      return this.fireNova(cx, cy, radius, damage, color, enemies);
    }
    inRange.sort((a, b) => Phaser.Math.Distance.Between(cx, cy, a.x, a.y) - Phaser.Math.Distance.Between(cx, cy, b.x, b.y));

    // Build chain: each bounce finds next nearest unhit enemy within chainRange
    const chain: Enemy[] = [];
    const hit = new Set<Enemy>();
    let current = inRange[0];
    chain.push(current);
    hit.add(current);

    for (let bounce = 1; bounce < maxBounces; bounce++) {
      let nextEnemy: Enemy | null = null;
      let nextDist = Infinity;
      for (const e of enemies) {
        if (!e.active || hit.has(e)) continue;
        const d = Phaser.Math.Distance.Between(current.x, current.y, e.x, e.y);
        if (d <= chainRange && d < nextDist) {
          nextDist = d;
          nextEnemy = e;
        }
      }
      if (!nextEnemy) break;
      chain.push(nextEnemy);
      hit.add(nextEnemy);
      current = nextEnemy;
    }

    // Apply damage with decay
    let currentDamage = damage;
    for (let i = 0; i < chain.length; i++) {
      const dmg = Math.floor(currentDamage);
      chain[i].takeDamage(dmg);
      EventBus.emit(EVENTS.ENEMY_HIT, chain[i], dmg);
      currentDamage *= decayRate;
    }

    // Visual: lightning bolts between chain targets
    let prevX = cx;
    let prevY = cy;
    for (let i = 0; i < chain.length; i++) {
      const e = chain[i];
      const delay = i * 60;
      const fromX = prevX;
      const fromY = prevY;
      prevX = e.x;
      prevY = e.y;

      this.scene.time.delayedCall(delay, () => {
        const gfx = this.scene.add.graphics();
        gfx.setDepth(DEPTHS.EFFECTS);
        const segments = 5;
        const pts = [{ x: fromX, y: fromY }];
        const dx = e.x - fromX;
        const dy = e.y - fromY;
        for (let s = 1; s < segments; s++) {
          const t = s / segments;
          pts.push({
            x: fromX + dx * t + (Math.random() - 0.5) * 12,
            y: fromY + dy * t + (Math.random() - 0.5) * 12,
          });
        }
        pts.push({ x: e.x, y: e.y });
        gfx.lineStyle(3, 0xFFFFFF, 0.9);
        gfx.beginPath();
        gfx.moveTo(pts[0].x, pts[0].y);
        for (const p of pts) gfx.lineTo(p.x, p.y);
        gfx.strokePath();
        gfx.lineStyle(5, color, 0.4);
        gfx.beginPath();
        gfx.moveTo(pts[0].x, pts[0].y);
        for (const p of pts) gfx.lineTo(p.x, p.y);
        gfx.strokePath();
        gfx.fillStyle(0xFFFFFF, 0.7);
        gfx.fillCircle(e.x, e.y, 6);
        gfx.fillStyle(color, 0.4);
        gfx.fillCircle(e.x, e.y, 10);
        this.scene.tweens.add({
          targets: gfx, alpha: 0, duration: 250,
          onComplete: () => gfx.destroy(),
        });
      });
    }

    return chain.length;
  }

  /** Heal burst: AoE damage like nova + heal player for 10 + 5% of damage dealt */
  private fireHealBurst(cx: number, cy: number, radius: number, damage: number, color: number, enemies: Enemy[]): number {
    let hitCount = 0;
    let totalDamageDealt = 0;

    // Damage enemies in radius (like nova)
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(cx, cy, enemy.x, enemy.y);
      if (dist <= radius) {
        enemy.takeDamage(damage);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        hitCount++;
        totalDamageDealt += damage;
      }
    }

    // Heal player: base 10 + 5% of total damage dealt
    const healAmount = 10 + Math.floor(totalDamageDealt * 0.05);
    this.player.heal(healAmount);

    // Visual: central healing flash
    const flash = this.scene.add.graphics();
    flash.setDepth(DEPTHS.EFFECTS);
    flash.fillStyle(0xFFFFFF, 0.7);
    flash.fillCircle(cx, cy, 10);
    flash.fillStyle(color, 0.5);
    flash.fillCircle(cx, cy, 18);
    this.scene.tweens.add({
      targets: flash, alpha: 0, duration: 300,
      onComplete: () => flash.destroy(),
    });

    // Expanding heal ring
    const ring = this.scene.add.graphics();
    ring.setDepth(DEPTHS.EFFECTS);
    let progress = 0;
    this.scene.time.addEvent({
      delay: 16, repeat: 20,
      callback: () => {
        progress += 0.05;
        const r = radius * progress;
        ring.clear();
        ring.lineStyle(2, color, 1 - progress);
        ring.strokeCircle(cx, cy, r);
        ring.fillStyle(color, (1 - progress) * 0.1);
        ring.fillCircle(cx, cy, r);
        if (progress >= 1) ring.destroy();
      },
    });

    // Rising heal particles (green plus signs on player)
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 15;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const delay = Math.random() * 200;
      this.scene.time.delayedCall(delay, () => {
        const particle = this.scene.add.graphics();
        particle.setDepth(DEPTHS.EFFECTS + 1);
        particle.fillStyle(0x44FF44, 0.8);
        particle.fillRect(-1, -4, 2, 8);
        particle.fillRect(-4, -1, 8, 2);
        particle.setPosition(px, py);
        this.scene.tweens.add({
          targets: particle, y: py - 20, alpha: 0,
          duration: 500 + Math.random() * 300, ease: 'Quad.easeOut',
          onComplete: () => particle.destroy(),
        });
      });
    }

    return hitCount;
  }

  /** Summon: 3 homing spirit orbs that seek different nearby enemies, deal damage on contact */
  private fireSummon(cx: number, cy: number, radius: number, damage: number, color: number, enemies: Enemy[], healOnHit: boolean): void {
    const spiritCount = 3;
    const orbLifetime = 2000;
    const orbSpeed = 3;

    // Central summoning circle visual
    const circle = this.scene.add.graphics();
    circle.setDepth(DEPTHS.EFFECTS - 1);
    circle.lineStyle(2, color, 0.6);
    circle.strokeCircle(cx, cy, 20);
    circle.lineStyle(1, color, 0.3);
    circle.strokeCircle(cx, cy, 30);
    this.scene.tweens.add({
      targets: circle, alpha: 0, duration: 600,
      onComplete: () => circle.destroy(),
    });

    // Pick different targets for each orb
    const activeEnemies = enemies
      .filter(e => e.active && Phaser.Math.Distance.Between(cx, cy, e.x, e.y) <= radius * 2)
      .sort((a, b) =>
        Phaser.Math.Distance.Between(cx, cy, a.x, a.y) -
        Phaser.Math.Distance.Between(cx, cy, b.x, b.y)
      );

    for (let i = 0; i < spiritCount; i++) {
      const delay = i * 150;
      this.scene.time.delayedCall(delay, () => {
        const spirit = this.scene.add.graphics();
        spirit.setDepth(DEPTHS.EFFECTS + 1);
        spirit.fillStyle(color, 0.6);
        spirit.fillCircle(0, 0, 8);
        spirit.fillStyle(0xFFFFFF, 0.4);
        spirit.fillCircle(0, -2, 3);
        spirit.lineStyle(2, color, 0.4);
        spirit.beginPath();
        spirit.moveTo(0, 8);
        spirit.lineTo(-3, 14);
        spirit.moveTo(0, 8);
        spirit.lineTo(3, 14);
        spirit.strokePath();
        spirit.setPosition(cx, cy);

        const trail = this.scene.add.graphics();
        trail.setDepth(DEPTHS.EFFECTS);

        let hasHit = false;
        let elapsed = 0;

        // Homing update loop
        const homingEvent = this.scene.time.addEvent({
          delay: 16,
          loop: true,
          callback: () => {
            elapsed += 16;
            if (hasHit || elapsed > orbLifetime) {
              spirit.destroy();
              this.scene.tweens.add({
                targets: trail, alpha: 0, duration: 300,
                onComplete: () => trail.destroy(),
              });
              homingEvent.destroy();
              return;
            }

            // Find target: prefer assigned enemy, fallback to nearest
            let target = activeEnemies[i % activeEnemies.length];
            if (!target || !target.active) {
              const currentEnemies = this.enemyGroup.getChildren() as Enemy[];
              let nearest: Enemy | null = null;
              let nearestDist = Infinity;
              for (const e of currentEnemies) {
                if (!e.active) continue;
                const d = Phaser.Math.Distance.Between(spirit.x, spirit.y, e.x, e.y);
                if (d < nearestDist) { nearestDist = d; nearest = e; }
              }
              target = nearest!;
            }

            if (target && target.active) {
              // Home toward target
              const angle = Math.atan2(target.y - spirit.y, target.x - spirit.x);
              spirit.x += Math.cos(angle) * orbSpeed;
              spirit.y += Math.sin(angle) * orbSpeed;

              // Trail
              trail.fillStyle(color, 0.15);
              trail.fillCircle(spirit.x, spirit.y, 5);

              // Check collision
              const dist = Phaser.Math.Distance.Between(spirit.x, spirit.y, target.x, target.y);
              if (dist < 15) {
                hasHit = true;
                target.takeDamage(damage);
                EventBus.emit(EVENTS.ENEMY_HIT, target, damage);
                if (healOnHit) this.player.heal(10);

                // Burst on impact
                const burst = this.scene.add.graphics();
                burst.setDepth(DEPTHS.EFFECTS);
                burst.fillStyle(color, 0.5);
                burst.fillCircle(target.x, target.y, 12);
                burst.fillStyle(0xFFFFFF, 0.3);
                burst.fillCircle(target.x, target.y, 6);
                this.scene.tweens.add({
                  targets: burst, alpha: 0, duration: 200,
                  onComplete: () => burst.destroy(),
                });
              }
            } else {
              // No target, drift outward
              const angle = (Math.PI * 2 / spiritCount) * i;
              spirit.x += Math.cos(angle) * orbSpeed * 0.5;
              spirit.y += Math.sin(angle) * orbSpeed * 0.5;
              trail.fillStyle(color, 0.15);
              trail.fillCircle(spirit.x, spirit.y, 5);
            }
          },
        });
      });
    }
  }

  /** Shadow arrow: large dark arrow projectile in facing direction, fears hit enemies */
  private fireShadowArrow(cx: number, cy: number, _radius: number, damage: number, color: number, enemies: Enemy[]): number {
    const travelDist = 300 * SPRITE_SCALE;
    const hitWidth = 40;
    const fearDuration = 2500;
    const hitEnemies = new Set<Enemy>();

    // Determine facing direction from player velocity
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let angle = 0;
    if (body && (Math.abs(body.velocity.x) > 1 || Math.abs(body.velocity.y) > 1)) {
      angle = Math.atan2(body.velocity.y, body.velocity.x);
    } else {
      // Aim at nearest enemy
      let nearest: Enemy | null = null;
      let nearestDist = Infinity;
      for (const e of enemies) {
        if (!e.active) continue;
        const d = Phaser.Math.Distance.Between(cx, cy, e.x, e.y);
        if (d < nearestDist) { nearestDist = d; nearest = e; }
      }
      if (nearest) angle = Math.atan2(nearest.y - cy, nearest.x - cx);
    }

    const endX = cx + Math.cos(angle) * travelDist;
    const endY = cy + Math.sin(angle) * travelDist;
    const dx = endX - cx;
    const dy = endY - cy;
    const lineLen = Math.sqrt(dx * dx + dy * dy) || 1;

    // Check all enemies along the arrow's path
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const ex = enemy.x - cx;
      const ey = enemy.y - cy;
      const t = Math.max(0, Math.min(1, (ex * dx + ey * dy) / (lineLen * lineLen)));
      const closestX = dx * t;
      const closestY = dy * t;
      const distToLine = Math.sqrt((ex - closestX) ** 2 + (ey - closestY) ** 2);
      if (distToLine <= hitWidth) {
        enemy.takeDamage(damage);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, damage);
        // Apply fear: flee from impact point
        const impactX = cx + closestX;
        const impactY = cy + closestY;
        enemy.applyFear(impactX, impactY, fearDuration);
        hitEnemies.add(enemy);
      }
    }

    // Visual: large dark arrow graphic with shadow trail
    const arrow = this.scene.add.graphics();
    arrow.setDepth(DEPTHS.EFFECTS + 1);

    // Arrow head (large triangle)
    const headLen = 16 * SPRITE_SCALE;
    const headWidth = 8 * SPRITE_SCALE;
    arrow.fillStyle(color, 0.9);
    arrow.beginPath();
    arrow.moveTo(headLen, 0);
    arrow.lineTo(-headLen * 0.3, -headWidth);
    arrow.lineTo(-headLen * 0.3, headWidth);
    arrow.closePath();
    arrow.fillPath();
    // Arrow shaft
    arrow.fillStyle(0x220011, 0.8);
    arrow.fillRect(-headLen * 0.3, -headWidth * 0.3, -headLen * 0.8, headWidth * 0.6);
    // Glow outline
    arrow.lineStyle(2, 0xFF0066, 0.6);
    arrow.beginPath();
    arrow.moveTo(headLen, 0);
    arrow.lineTo(-headLen * 0.3, -headWidth);
    arrow.lineTo(-headLen * 0.3, headWidth);
    arrow.closePath();
    arrow.strokePath();

    arrow.setPosition(cx, cy);
    arrow.setRotation(angle);

    const trail = this.scene.add.graphics();
    trail.setDepth(DEPTHS.EFFECTS);

    // Animate the arrow flying
    this.scene.tweens.add({
      targets: arrow,
      x: endX,
      y: endY,
      duration: 250,
      ease: 'Quad.easeIn',
      onUpdate: () => {
        // Shadow trail particles
        trail.fillStyle(color, 0.2);
        trail.fillCircle(arrow.x + (Math.random() - 0.5) * 10, arrow.y + (Math.random() - 0.5) * 10, 6 + Math.random() * 4);
        trail.fillStyle(0x330022, 0.15);
        trail.fillCircle(arrow.x + (Math.random() - 0.5) * 15, arrow.y + (Math.random() - 0.5) * 15, 8 + Math.random() * 5);
      },
      onComplete: () => {
        // Impact burst at end
        const burst = this.scene.add.graphics();
        burst.setDepth(DEPTHS.EFFECTS);
        burst.fillStyle(color, 0.5);
        burst.fillCircle(endX, endY, 25);
        burst.fillStyle(0xFF0066, 0.3);
        burst.fillCircle(endX, endY, 15);
        this.scene.tweens.add({
          targets: burst, alpha: 0, duration: 400,
          onComplete: () => burst.destroy(),
        });
        arrow.destroy();
        this.scene.tweens.add({
          targets: trail, alpha: 0, duration: 500,
          onComplete: () => trail.destroy(),
        });
      },
    });

    return hitEnemies.size;
  }

  /** Blink Strike: teleport to nearest enemy, slash, then return invuln */
  private fireBlinkStrike(skill: ActiveComboSkill): void {
    const combo = skill.combo;
    const lvl = Math.min(skill.level, 6);
    const scaling = SYNERGY_LEVEL_SCALING[lvl - 1];
    const blinkRange = combo.radius * scaling.radius * this.player.playerState.modifiers.rangeMultiplier;
    const damage = Math.floor(combo.damage * scaling.damage * this.player.getEffectiveDamageMultiplier());
    const px = this.player.x;
    const py = this.player.y;

    const enemies = this.enemyGroup.getChildren() as Enemy[];
    let nearest: Enemy | null = null;
    let nearestDist = Infinity;
    for (const e of enemies) {
      if (!e.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, e.x, e.y);
      if (d < nearestDist && d <= blinkRange) {
        nearestDist = d;
        nearest = e;
      }
    }

    if (!nearest) return; // No enemy in range, just the CD reset from dash

    const targetX = nearest.x;
    const targetY = nearest.y;

    // Afterimage at start position
    const afterimage = this.scene.add.graphics();
    afterimage.setDepth(DEPTHS.EFFECTS);
    afterimage.fillStyle(combo.color, 0.5);
    afterimage.fillCircle(px, py, 8);
    this.scene.tweens.add({
      targets: afterimage, alpha: 0, duration: 300,
      onComplete: () => afterimage.destroy(),
    });

    // Teleport line trail from old position to target
    const trail = this.scene.add.graphics();
    trail.setDepth(DEPTHS.EFFECTS);
    trail.lineStyle(3, combo.color, 0.6);
    trail.lineBetween(px, py, targetX, targetY);
    trail.lineStyle(1, 0xFFFFFF, 0.3);
    trail.lineBetween(px, py, targetX, targetY);
    this.scene.tweens.add({
      targets: trail, alpha: 0, duration: 250,
      onComplete: () => trail.destroy(),
    });

    // Teleport player behind the target (offset away from original position)
    const angle = Math.atan2(targetY - py, targetX - px);
    const behindX = targetX + Math.cos(angle) * 20;
    const behindY = targetY + Math.sin(angle) * 20;
    this.player.setPosition(behindX, behindY);
    this.player.setVelocity(0, 0);

    // End the dash immediately since we teleported
    this.player.isDashing = false;

    // Deal damage to target + nearby enemies (small AoE slash)
    const slashRadius = 50;
    let hitCount = 0;
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(targetX, targetY, enemy.x, enemy.y);
      if (d <= slashRadius) {
        const falloff = enemy === nearest ? 1.0 : 0.6;
        const finalDmg = Math.floor(damage * falloff);
        enemy.takeDamage(finalDmg);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, finalDmg);
        hitCount++;
      }
    }

    // Slash visual at arrival
    const slash = this.scene.add.graphics();
    slash.setDepth(DEPTHS.EFFECTS + 1);
    // X-slash mark
    slash.lineStyle(3, 0xFFFFFF, 0.9);
    slash.lineBetween(targetX - 15, targetY - 15, targetX + 15, targetY + 15);
    slash.lineBetween(targetX + 15, targetY - 15, targetX - 15, targetY + 15);
    slash.lineStyle(2, combo.color, 0.6);
    slash.lineBetween(targetX - 16, targetY - 14, targetX + 16, targetY + 16);
    slash.lineBetween(targetX + 16, targetY - 14, targetX - 16, targetY + 16);
    this.scene.tweens.add({
      targets: slash, alpha: 0, duration: 300, ease: 'Quad.easeOut',
      onComplete: () => slash.destroy(),
    });

    // Arrival burst
    const burst = this.scene.add.graphics();
    burst.setDepth(DEPTHS.EFFECTS);
    burst.fillStyle(combo.color, 0.4);
    burst.fillCircle(behindX, behindY, 15);
    burst.fillStyle(0xFFFFFF, 0.3);
    burst.fillCircle(behindX, behindY, 8);
    this.scene.tweens.add({
      targets: burst, alpha: 0, duration: 200,
      onComplete: () => burst.destroy(),
    });
  }

  public destroy(): void {
    EventBus.off(EVENTS.JOB_CHOSEN, this.checkJobSynergies, this);
    EventBus.off(EVENTS.JOB_SKILL_UPGRADED, this.checkSkillSynergies, this);
    this.activeSkills = [];
  }
}
