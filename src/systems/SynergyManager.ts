import Phaser from 'phaser';
import { EVENTS, DEPTHS, SPRITE_SCALE } from '../constants';
import { JOB_SYNERGIES, SKILL_SYNERGIES, JobSynergy, SkillSynergy, ComboSkillDef } from '../data/synergies';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EventBus } from './EventBus';
import { spawnFX, spawnCircleZone, spawnFlash, spawnRing, spawnLine, spawnParticleBurst, spawnProjectileFX, playSlashFX, playImpactFX } from '../weapons/fxHelper';

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

    // Target zone indicator (capped size)
    spawnCircleZone(this.scene, cx, cy, Math.min(radius, 64 * SPRITE_SCALE), color, 0.1, 800);

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

        // Arrow projectile sprite from sky to landing point
        spawnProjectileFX(this.scene, startX, startY, landX, landY, 'arrow', {
          scale: SPRITE_SCALE,
          tint: color,
          duration: 120 + Math.random() * 60,
          onComplete: () => {
            playImpactFX(this.scene, landX, landY, 0, 'fx_explosion', impactRadius / 20, color, 200);
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

    // Visual: central explosion FX (not just a ring)
    playImpactFX(this.scene, cx, cy, 0, 'fx_explosion', SPRITE_SCALE * 1.5, color, 350);
    spawnFlash(this.scene, cx, cy, 8 * SPRITE_SCALE, 0xFFFFFF, 120);

    // Secondary impact bursts at random positions around the center
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.5;
      const dist = 20 * SPRITE_SCALE + Math.random() * 20 * SPRITE_SCALE;
      const ix = cx + Math.cos(angle) * dist;
      const iy = cy + Math.sin(angle) * dist;
      this.scene.time.delayedCall(i * 50, () => {
        playImpactFX(this.scene, ix, iy, Math.random() * Math.PI * 2, 'fx_explosion', SPRITE_SCALE, color, 250);
      });
    }

    // Small expanding ring (secondary, subtle)
    spawnRing(this.scene, cx, cy, 10, radius * 0.5, color, 250, 0.4);

    // Debris particles
    spawnParticleBurst(this.scene, cx, cy, 10, color, 50, 300);

    return hitCount;
  }

  /** Field: persistent ground zone dealing 25% damage per tick over 3s (150% total) */
  private fireField(cx: number, cy: number, radius: number, damage: number, color: number, enemies: Enemy[], healOnHit: boolean): void {
    const tickCount = 6;
    const tickInterval = 500;
    const tickDamage = Math.floor(damage * 0.25);
    let ticks = 0;

    // Persistent zone sprite (use white circle to avoid pixelation at large sizes)
    const tex = this.scene.textures.exists('fx_circle_white') ? 'fx_circle_white' : 'fx_circle_spark';
    const gfx = this.scene.add.sprite(cx, cy, tex, 0);
    gfx.setDepth(DEPTHS.EFFECTS - 1);
    gfx.setTint(color);
    gfx.setAlpha(0.15);
    gfx.setScale(0);

    // Cap the zone size so it doesn't look pixelated
    const maxZoneScale = SPRITE_SCALE * 4;
    const targetScale = Math.min(maxZoneScale, (radius * 2) / 32);
    this.scene.tweens.add({
      targets: gfx,
      scaleX: targetScale,
      scaleY: targetScale,
      duration: 200,
      ease: 'Quad.easeOut',
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
        spawnRing(this.scene, cx, cy, radius * 0.3, radius * 0.6, 0xFFFFFF, 300, 0.4);

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

    // Base toxic zone sprite (capped scale to avoid pixelation)
    const tex = this.scene.textures.exists('fx_circle_white') ? 'fx_circle_white' : 'fx_circle_spark';
    const zone = this.scene.add.sprite(cx, cy, tex, 0);
    zone.setDepth(DEPTHS.EFFECTS - 1);
    zone.setTint(color);
    zone.setAlpha(0.15);
    const maxZoneScale = SPRITE_SCALE * 4;
    zone.setScale(Math.min(maxZoneScale, (radius * 2) / 32));

    // Layered plant FX on top of the base zone for richer toxic visuals
    spawnFX(this.scene, cx, cy, 'fx_plant', {
      scale: Math.min(maxZoneScale * 0.8, (radius * 2) / 40),
      tint: 0x44FF00,
      alpha: 0.25,
      duration: cloudDuration,
      depth: DEPTHS.EFFECTS,
      blendMode: Phaser.BlendModes.ADD,
    });

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
          const puffSize = 8 + Math.random() * 12;
          spawnFX(this.scene, px, py, 'fx_smoke_circular', {
            scale: puffSize / 8,
            tint: color,
            alpha: 0.4,
            duration: 800 + Math.random() * 400,
            blendMode: Phaser.BlendModes.ADD,
            scaleEnd: puffSize / 8 * 1.5,
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

  /** Ring: expanding energy wave that hits enemies as it passes through them */
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

    // Visual: central flash + expanding ring
    spawnFlash(this.scene, cx, cy, 6 * SPRITE_SCALE, 0xFFFFFF, 120);
    spawnRing(this.scene, cx, cy, 5, radius * 0.5, color, 300, 0.6);

    // Spark particles along the ring edge
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const edgeDist = radius * 0.4;
      const sx = cx + Math.cos(angle) * edgeDist;
      const sy = cy + Math.sin(angle) * edgeDist;
      this.scene.time.delayedCall(i * 30, () => {
        spawnFX(this.scene, sx, sy, 'fx_spark', {
          scale: SPRITE_SCALE * 0.5,
          tint: color,
          duration: 200,
          scaleEnd: SPRITE_SCALE * 0.2,
          blendMode: Phaser.BlendModes.ADD,
        });
      });
    }

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
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      if (Math.abs(angleDiff) <= coneHalfAngle) {
        enemy.takeDamage(slashDamage);
        EventBus.emit(EVENTS.ENEMY_HIT, enemy, slashDamage);
        hitCount++;
      }
    }

    // Visual: fan of blade slashes moving outward in the cone
    const slashTextures = ['fx_slash_curved', 'fx_slash_double_curved', 'fx_circular_slash'];
    const slashScale = SPRITE_SCALE * 2.5; // crisp, not pixelated
    const slashCount = 3;

    for (let i = 0; i < slashCount; i++) {
      const arcOffset = (i - 1) * 0.4;
      const slashAngle = facingAngle + arcOffset;
      const dist = 16 * SPRITE_SCALE + i * 12 * SPRITE_SCALE; // stagger outward
      const sx = cx + Math.cos(slashAngle) * dist;
      const sy = cy + Math.sin(slashAngle) * dist;
      const delay = i * 60;
      const tex = slashTextures[i % slashTextures.length];

      this.scene.time.delayedCall(delay, () => {
        playSlashFX(this.scene, sx, sy, slashAngle, tex, slashScale, color, 200);
        spawnParticleBurst(this.scene, sx, sy, 3, color, 25, 180);
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

        // Clone figure sprite — use player's ninja sprite for a real shadow clone
        const playerTexKey = this.player.texture.key || 'player_ninja';
        const texKey = this.scene.textures.exists(playerTexKey) ? playerTexKey : 'player_ninja';
        const clone = this.scene.add.sprite(cx, cy, texKey, 0);
        clone.setDepth(DEPTHS.EFFECTS + 1);
        clone.setTint(color);
        clone.setAlpha(0.6);
        clone.setScale(SPRITE_SCALE);

        // Tween clone from start to end, spawning trail sprites each update
        this.scene.tweens.add({
          targets: clone, x: endX, y: endY,
          duration: 150, ease: 'Quad.easeIn',
          onUpdate: () => {
            // Trail: small smoke sprite at each position along the path
            spawnFX(this.scene, clone.x, clone.y, 'fx_smoke_circular', {
              scale: 0.4,
              tint: color,
              alpha: 0.25,
              duration: 200,
              scaleEnd: 0.1,
            });
          },
          onComplete: () => {
            // Slash at end of dash
            playSlashFX(this.scene, endX, endY, angle + Math.PI / 2, 'fx_cut', SPRITE_SCALE, 0xFFFFFF, 300);
            clone.destroy();
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

    // Main electric burst at origin
    playImpactFX(this.scene, cx, cy, 0, 'fx_thunder', SPRITE_SCALE * 1.2, 0xFFDD44, 350);

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
        // Lightning line from previous point to this enemy
        spawnLine(this.scene, fromX, fromY, e.x, e.y, color, 250, 0.8);
        // Flash at impact point
        spawnFlash(this.scene, e.x, e.y, 10, color, 250);
        // Thunder impact at each chain target
        playImpactFX(this.scene, e.x, e.y, 0, 'fx_thunder', SPRITE_SCALE, 0xFFDD44, 200);
        // Spark particles at each hit
        spawnFX(this.scene, e.x, e.y, 'fx_spark', {
          scale: SPRITE_SCALE * 0.6,
          tint: 0xFFDD44,
          duration: 200,
          blendMode: Phaser.BlendModes.ADD,
          scaleEnd: SPRITE_SCALE * 0.2,
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

    // Visual: central healing flash + magic FX
    spawnFlash(this.scene, cx, cy, 8 * SPRITE_SCALE, color, 300);
    playImpactFX(this.scene, cx, cy, 0, 'fx_shield_yellow', SPRITE_SCALE * 1.5, color, 350);

    // Subtle expanding ring (not full radius)
    spawnRing(this.scene, cx, cy, 5, radius * 0.4, color, 320, 0.5);

    // Rising heal particles (spark sprites floating upward)
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 15;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const delay = Math.random() * 200;
      this.scene.time.delayedCall(delay, () => {
        const particle = spawnFX(this.scene, px, py, 'fx_spark', {
          scale: 0.4,
          tint: 0x44FF44,
          duration: 500 + Math.random() * 300,
          depth: DEPTHS.EFFECTS + 1,
          fadeOut: false, // we'll handle fade in the y tween
        });
        // Tween upward with fade
        this.scene.tweens.add({
          targets: particle, y: py - 20, alpha: 0,
          duration: 500 + Math.random() * 300, ease: 'Quad.easeOut',
        });
      });
    }

    // Rising green plant particles for divine blessing flavor
    for (let i = 0; i < 4; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      const pDist = Math.random() * 20;
      const plantX = cx + Math.cos(pAngle) * pDist;
      const plantY = cy + Math.sin(pAngle) * pDist;
      const pDelay = 50 + Math.random() * 250;
      this.scene.time.delayedCall(pDelay, () => {
        const plantFx = spawnFX(this.scene, plantX, plantY, 'fx_plant', {
          scale: SPRITE_SCALE * 0.4,
          tint: 0x44FF88,
          alpha: 0.6,
          duration: 600 + Math.random() * 300,
          depth: DEPTHS.EFFECTS + 1,
          blendMode: Phaser.BlendModes.ADD,
          fadeOut: false,
        });
        this.scene.tweens.add({
          targets: plantFx, y: plantY - 25 * SPRITE_SCALE, alpha: 0,
          duration: 600 + Math.random() * 300, ease: 'Quad.easeOut',
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
    spawnRing(this.scene, cx, cy, 20, 30, color, 600, 0.6);

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
        // Spirit orb sprite (persistent, not auto-destroyed)
        const spiritTex = this.scene.textures.exists('fx_spirit_blue') ? 'fx_spirit_blue' : (this.scene.textures.exists('fx_spirit') ? 'fx_spirit' : 'fx_circle_spark');
        const spirit = this.scene.add.sprite(cx, cy, spiritTex, 0);
        spirit.setDepth(DEPTHS.EFFECTS + 1);
        spirit.setTint(color);
        spirit.setAlpha(0.7);
        spirit.setScale(SPRITE_SCALE * 0.4);

        let hasHit = false;
        let elapsed = 0;
        let trailTimer = 0;

        // Homing update loop
        const homingEvent = this.scene.time.addEvent({
          delay: 16,
          loop: true,
          callback: () => {
            elapsed += 16;
            trailTimer += 16;
            if (hasHit || elapsed > orbLifetime) {
              spirit.destroy();
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

              // Trail: spawn a small smoke sprite every few frames
              if (trailTimer >= 48) {
                trailTimer = 0;
                spawnFX(this.scene, spirit.x, spirit.y, 'fx_smoke_circular', {
                  scale: 0.3,
                  tint: color,
                  alpha: 0.15,
                  duration: 300,
                  scaleEnd: 0.1,
                });
              }

              // Check collision
              const dist = Phaser.Math.Distance.Between(spirit.x, spirit.y, target.x, target.y);
              if (dist < 15) {
                hasHit = true;
                target.takeDamage(damage);
                EventBus.emit(EVENTS.ENEMY_HIT, target, damage);
                if (healOnHit) this.player.heal(10);

                // Burst on impact
                spawnFlash(this.scene, target.x, target.y, 12, color, 200);
              }
            } else {
              // No target, drift outward
              const angle = (Math.PI * 2 / spiritCount) * i;
              spirit.x += Math.cos(angle) * orbSpeed * 0.5;
              spirit.y += Math.sin(angle) * orbSpeed * 0.5;
              if (trailTimer >= 48) {
                trailTimer = 0;
                spawnFX(this.scene, spirit.x, spirit.y, 'fx_smoke_circular', {
                  scale: 0.3,
                  tint: color,
                  alpha: 0.15,
                  duration: 300,
                  scaleEnd: 0.1,
                });
              }
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

    // Visual: large dark kunai projectile with shadow trail
    // Spawn the main projectile sprite
    const arrowTex = this.scene.textures.exists('kunai') ? 'kunai' : 'fx_spark';
    const arrow = this.scene.add.sprite(cx, cy, arrowTex, 0);
    arrow.setDepth(DEPTHS.EFFECTS + 1);
    arrow.setScale(SPRITE_SCALE * 2);
    arrow.setTint(color);
    arrow.setRotation(angle);

    // Animate the arrow flying, spawning trail sprites along the way
    this.scene.tweens.add({
      targets: arrow,
      x: endX,
      y: endY,
      duration: 250,
      ease: 'Quad.easeIn',
      onUpdate: () => {
        // Shadow trail particles (smoke sprites along the path)
        spawnFX(this.scene, arrow.x + (Math.random() - 0.5) * 10, arrow.y + (Math.random() - 0.5) * 10, 'fx_smoke_circular', {
          scale: 0.5 + Math.random() * 0.3,
          tint: color,
          alpha: 0.2,
          duration: 300,
          scaleEnd: 0.1,
        });
      },
      onComplete: () => {
        // Impact burst at end
        spawnFlash(this.scene, endX, endY, 25, color, 400);
        playImpactFX(this.scene, endX, endY, 0, 'fx_explosion', SPRITE_SCALE, color, 300);
        arrow.destroy();
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

    // Afterimage at start position (spirit sprite)
    spawnFX(this.scene, px, py, 'fx_spirit', {
      scale: SPRITE_SCALE * 0.5,
      tint: combo.color,
      alpha: 0.5,
      duration: 300,
    });

    // Teleport line trail from old position to target
    spawnLine(this.scene, px, py, targetX, targetY, combo.color, 250, 0.6);

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

    // Slash visual at arrival (X-slash: two crossed slashes)
    playSlashFX(this.scene, targetX, targetY, Math.PI / 4, 'fx_cut', SPRITE_SCALE, 0xFFFFFF, 300);
    playSlashFX(this.scene, targetX, targetY, -Math.PI / 4, 'fx_cut', SPRITE_SCALE, combo.color, 300);

    // Arrival burst
    spawnFlash(this.scene, behindX, behindY, 15, combo.color, 200);
  }

  public destroy(): void {
    EventBus.off(EVENTS.JOB_CHOSEN, this.checkJobSynergies, this);
    EventBus.off(EVENTS.JOB_SKILL_UPGRADED, this.checkSkillSynergies, this);
    this.activeSkills = [];
  }
}
