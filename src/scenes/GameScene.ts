import Phaser from 'phaser';
import {
  SCENES, WORLD_WIDTH, WORLD_HEIGHT, EVENTS, MAX_ENEMIES,
  MAX_PROJECTILES, EnemyBehavior, EnemyType, DEPTHS, Rarity,
  JOB_SELECTION_LEVELS, PLAYER_MAX_JOBS, EnhancementCategory, SPRITE_SCALE,
} from '../constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { EnemyProjectile } from '../entities/EnemyProjectile';
import { Pickup } from '../entities/Pickup';
import { Chest } from '../entities/Chest';
import { WeaponManager } from '../systems/WeaponManager';
import { WaveManager } from '../systems/WaveManager';
import { CombatManager } from '../systems/CombatManager';
import { XPManager } from '../systems/XPManager';
import { PickupManager } from '../systems/PickupManager';
import { EnchantManager } from '../systems/EnchantManager';
import { EnhancementManager } from '../systems/EnhancementManager';
import { JobSkillManager } from '../systems/JobSkillManager';
import { PassiveManager } from '../systems/PassiveManager';
import { ElementManager } from '../systems/ElementManager';
import { SynergyManager } from '../systems/SynergyManager';
import { EventBus } from '../systems/EventBus';
import { DamageNumbers } from '../ui/DamageNumbers';
import { WaveBanner } from '../ui/WaveBanner';
import { SFXManager } from '../systems/SFXManager';
import { getMusicManager } from './TitleScene';
import { ENEMY_DEFS } from '../data/enemies';

const MAX_CHESTS = 8;
const CHEST_SPAWN_INTERVAL = 45000; // spawn a chest every 45s
const CHEST_RARITY_TABLE = [
  { rarity: Rarity.LEGENDARY, threshold: 0.02 },
  { rarity: Rarity.EPIC, threshold: 0.08 },
  { rarity: Rarity.RARE, threshold: 0.30 },
  { rarity: Rarity.COMMON, threshold: 1.0 },
];

export class GameScene extends Phaser.Scene {
  public player!: Player;
  public enemyGroup!: Phaser.Physics.Arcade.Group;
  public projectileGroup!: Phaser.Physics.Arcade.Group;
  public enemyProjectileGroup!: Phaser.Physics.Arcade.Group;
  public pickupGroup!: Phaser.Physics.Arcade.Group;
  public chestGroup!: Phaser.Physics.Arcade.Group;

  private weaponManager!: WeaponManager;
  private waveManager!: WaveManager;
  private combatManager!: CombatManager;
  private xpManager!: XPManager;
  private pickupManager!: PickupManager;
  private enchantManager!: EnchantManager;
  public enhancementManager!: EnhancementManager;
  private jobSkillManager!: JobSkillManager;
  private passiveManager!: PassiveManager;
  private elementManager!: ElementManager;
  private synergyManager!: SynergyManager;

  private damageNumbers!: DamageNumbers;
  private waveBanner!: WaveBanner;
  private sfxManager!: SFXManager;

  public isPaused = false;
  private instanceCounter = 0;
  private chestSpawnTimer = 0;
  private pendingStartJob: string | null = null;
  private isProcessingBomberExplosion = false;

  constructor() {
    super(SCENES.GAME);
  }

  create(): void {
    // Clean up stale overlays from previous run (safety net)
    this.scene.stop(SCENES.LEVEL_UP);

    // Clean up stale EventBus listeners from previous run (safety net)
    EventBus.removeAllListeners();

    // Register shutdown handler (Phaser doesn't auto-call shutdown() method)
    this.events.once('shutdown', this.onShutdown, this);

    // World bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Tiled ground using grass tileset
    this.tileGround();

    // Player at center
    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    // Apply starting class from character selection
    const data = this.scene.settings.data as any;
    if (data?.startingJobId) {
      // Set player texture
      if (data.playerTexture && this.textures.exists(data.playerTexture)) {
        this.player.setTexture(data.playerTexture, 0);
      }
      // Record the job and grant starting skills (done after enhancementManager is created)
      this.pendingStartJob = data.startingJobId;
    }

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBackgroundColor('#3a7a2a');
    this.cameras.main.setZoom(1.5);

    // Groups
    this.enemyGroup = this.physics.add.group({
      classType: Enemy,
      maxSize: MAX_ENEMIES,
      runChildUpdate: false,
    });
    for (let i = 0; i < MAX_ENEMIES; i++) {
      const enemy = new Enemy(this, -100, -100);
      (enemy as any).__instanceId = this.instanceCounter++;
      enemy.body!.enable = false;
      this.enemyGroup.add(enemy);
    }

    this.projectileGroup = this.physics.add.group({
      classType: Projectile,
      maxSize: MAX_PROJECTILES,
      runChildUpdate: false,
    });
    for (let i = 0; i < MAX_PROJECTILES; i++) {
      const p = new Projectile(this, -100, -100);
      p.body!.enable = false;
      this.projectileGroup.add(p);
    }

    Projectile.enemyGroup = this.enemyGroup;

    this.enemyProjectileGroup = this.physics.add.group({
      classType: EnemyProjectile,
      maxSize: 50,
      runChildUpdate: false,
    });
    for (let i = 0; i < 50; i++) {
      const p = new EnemyProjectile(this, -100, -100);
      p.body!.enable = false;
      this.enemyProjectileGroup.add(p);
    }

    this.pickupGroup = this.physics.add.group({
      classType: Pickup,
      maxSize: 300,
      runChildUpdate: false,
    });
    for (let i = 0; i < 300; i++) {
      const p = new Pickup(this, -100, -100);
      p.body!.enable = false;
      this.pickupGroup.add(p);
    }

    // Chest group
    this.chestGroup = this.physics.add.group({
      classType: Chest,
      maxSize: MAX_CHESTS,
      runChildUpdate: false,
    });
    for (let i = 0; i < MAX_CHESTS; i++) {
      const c = new Chest(this, -100, -100);
      c.body!.enable = false;
      this.chestGroup.add(c);
    }

    // Systems
    this.xpManager = new XPManager(this.player);
    this.weaponManager = new WeaponManager(this, this.player, this.projectileGroup);
    this.waveManager = new WaveManager(this, this.player, this.enemyGroup);
    this.combatManager = new CombatManager(this);
    this.pickupManager = new PickupManager(this, this.player, this.pickupGroup, this.xpManager);
    this.enchantManager = new EnchantManager(this, this.player, this.enemyGroup);
    this.enhancementManager = new EnhancementManager(this.player);
    this.jobSkillManager = new JobSkillManager(this, this.player, this.enemyGroup, this.projectileGroup);
    this.passiveManager = new PassiveManager(this.player);
    this.elementManager = new ElementManager(this, this.player, this.enemyGroup);
    this.synergyManager = new SynergyManager(this, this.player, this.enemyGroup);

    // Apply starting class (must happen after enhancementManager is created)
    if (this.pendingStartJob) {
      const card: any = {
        category: EnhancementCategory.JOB_SELECTION,
        jobId: this.pendingStartJob,
        title: '',
        description: '',
        icon: '',
        rarity: Rarity.COMMON,
      };
      this.enhancementManager.applyCard(card);
      this.pendingStartJob = null;
    }

    // Setup collisions
    this.combatManager.setupCollisions(
      this.player,
      this.enemyGroup,
      this.projectileGroup,
      this.enemyProjectileGroup,
    );

    // Chest collection overlap
    this.physics.add.overlap(
      this.player,
      this.chestGroup,
      (_playerObj, chestObj) => {
        const chest = chestObj as Chest;
        if (!chest.active || chest.isOpened) return;
        this.onChestCollected(chest);
      },
    );

    // SFX
    this.sfxManager = new SFXManager();
    this.sfxManager.setScene(this);

    // Switch to game music
    getMusicManager(this).playGameMusic();

    // UI
    this.damageNumbers = new DamageNumbers(this);
    this.waveBanner = new WaveBanner(this);

    // Scatter environment decorations
    this.scatterDecorations();

    // Events
    EventBus.on(EVENTS.LEVEL_UP, this.onLevelUp, this);
    EventBus.on(EVENTS.PLAYER_DIED, this.onPlayerDied, this);
    EventBus.on(EVENTS.GAME_WON, this.onGameWon, this);
    EventBus.on(EVENTS.ENEMY_HIT, this.onEnemyHit, this);
    EventBus.on(EVENTS.PLAYER_DAMAGE_TAKEN, this.onPlayerDamageTaken, this);
    EventBus.on(EVENTS.ENEMY_KILLED, this.onEnemyKilled, this);
    EventBus.on(EVENTS.ELITE_KILLED, this.onEliteKilled, this);
    EventBus.on(EVENTS.CRIT_HIT, this.onCritHit, this);
    EventBus.on(EVENTS.ENCHANT_DAMAGE, this.onEnchantDamage, this);
    EventBus.on(EVENTS.BOSS_SPAWNED, () => getMusicManager(this).playBossMusic());

    EventBus.on(EVENTS.PLAYER_COUNTER, (damage: number, radius: number) => {
      const enemies = this.enemyGroup.getChildren() as Enemy[];
      for (const e of enemies) {
        if (!e.active) continue;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
        if (d <= radius) {
          e.takeDamage(damage);
          EventBus.emit(EVENTS.ENEMY_HIT, e, damage);
        }
      }
    });

    EventBus.on(EVENTS.SWARM_INCOMING, () => {
      this.waveBanner.show('SWARM INCOMING!', '#FF4444');
    });

    // Awakening: PassiveManager handles the actual upgrades
    EventBus.on('awakening-chosen', () => {
      this.passiveManager.applyAwakening();
    });

    // Pause key
    this.input.keyboard!.on('keydown-ESC', () => {
      if (!this.isPaused) {
        this.pauseGame();
        this.scene.launch(SCENES.PAUSE);
      }
    });

    // Launch HUD
    this.scene.launch(SCENES.HUD);

    // Start waves
    this.waveManager.start();
    this.chestSpawnTimer = 30000; // first chest after 30s

    // Spawn initial chests (just 2)
    for (let i = 0; i < 2; i++) {
      this.spawnChestAtRandom();
    }
  }

  update(time: number, delta: number): void {
    if (this.isPaused) return;

    this.player.update(time, delta);
    this.waveManager.update(time, delta);
    this.weaponManager.update(time, delta, this.enemyGroup);
    this.jobSkillManager.update(time, delta);
    this.pickupManager.update(time, delta);
    this.synergyManager.update(time, delta);

    // Periodic chest spawning
    this.chestSpawnTimer -= delta;
    if (this.chestSpawnTimer <= 0) {
      this.chestSpawnTimer = CHEST_SPAWN_INTERVAL;
      this.spawnChestAtRandom();
    }

    // Update enemies (behaviors)
    const enemies = this.enemyGroup.getChildren() as Enemy[];
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      enemy.update(time, delta);
      this.updateEnemyBehavior(enemy, delta);
    }

    // Update projectiles
    const projectiles = this.projectileGroup.getChildren() as Projectile[];
    for (const proj of projectiles) {
      if (proj.active) proj.update(time, delta);
    }

    const enemyProjectiles = this.enemyProjectileGroup.getChildren() as EnemyProjectile[];
    for (const proj of enemyProjectiles) {
      if (proj.active) proj.update(time, delta);
    }

    // Damage numbers
    this.damageNumbers.update(time, delta);
  }

  private updateEnemyBehavior(enemy: Enemy, delta: number): void {
    const px = this.player.x;
    const py = this.player.y;

    switch (enemy.def.behavior) {
      case EnemyBehavior.CHASE:
        enemy.moveToward(px, py);
        break;

      case EnemyBehavior.BURST_CHARGE: {
        enemy.addBehaviorTimer(delta);
        if (enemy.getIsCharging()) {
          if (enemy.updateCharge(delta)) {
            enemy.setVelocity(0, 0);
          }
        } else if (enemy.getBehaviorTimer() > 2000) {
          enemy.resetBehaviorTimer();
          enemy.startCharge();
          enemy.chargeToward(px, py, enemy.def.chargeSpeed ?? 200);
        } else {
          enemy.moveToward(px, py);
        }
        break;
      }

      case EnemyBehavior.RANGED: {
        const dist = enemy.def.keepDistance ?? 120;
        enemy.keepDistanceFrom(px, py, dist);
        if (enemy.canShoot(delta, 2000)) {
          this.fireEnemyProjectile(enemy, px, py);
        }
        break;
      }

      case EnemyBehavior.SPLIT:
        enemy.moveToward(px, py);
        break;

      case EnemyBehavior.SWARM:
        enemy.moveToward(px, py);
        break;

      case EnemyBehavior.SUMMON: {
        const dist = enemy.def.keepDistance ?? 100;
        enemy.keepDistanceFrom(px, py, dist);
        if (enemy.canSummon(delta)) {
          for (let i = 0; i < 2; i++) {
            this.waveManager.spawnEnemy(
              EnemyType.SHAMBLER,
              enemy.x + (Math.random() - 0.5) * 30,
              enemy.y + (Math.random() - 0.5) * 30,
            );
          }
        }
        break;
      }

      case EnemyBehavior.BOSS_GOREHOUND: {
        enemy.addBehaviorTimer(delta);
        if (enemy.getIsCharging()) {
          if (enemy.updateCharge(delta)) {
            enemy.setVelocity(0, 0);
          }
        } else if (enemy.getBehaviorTimer() > 3000) {
          enemy.resetBehaviorTimer();
          enemy.startCharge();
          enemy.chargeToward(px, py, enemy.def.chargeSpeed ?? 180);
          // screen shake removed
        } else {
          enemy.moveToward(px, py);
        }
        if (enemy.canSummon(delta)) {
          for (let i = 0; i < 3; i++) {
            this.waveManager.spawnEnemy(
              EnemyType.SWARMER,
              enemy.x + (Math.random() - 0.5) * 50,
              enemy.y + (Math.random() - 0.5) * 50,
            );
          }
        }
        break;
      }

      case EnemyBehavior.BOSS_HIVEMIND: {
        enemy.addBehaviorTimer(delta);
        const phase = this.getHivemindPhase(enemy);

        if (phase === 1) {
          enemy.moveToward(px, py);
          if (enemy.canShoot(delta, 1500)) {
            this.fireHivemindRing(enemy);
          }
        } else if (phase === 2) {
          enemy.keepDistanceFrom(px, py, 150);
          if (enemy.canSummon(delta)) {
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              this.waveManager.spawnEnemy(
                EnemyType.SWARMER,
                enemy.x + Math.cos(angle) * 40,
                enemy.y + Math.sin(angle) * 40,
              );
            }
          }
        } else {
          enemy.moveToward(px, py);
          if (enemy.canShoot(delta, 800)) {
            this.fireEnemyProjectile(enemy, px, py, 'big_energyball');
          }
          if (enemy.canSummon(delta)) {
            for (let i = 0; i < 4; i++) {
              this.waveManager.spawnEnemy(
                EnemyType.SHAMBLER,
                enemy.x + (Math.random() - 0.5) * 60,
                enemy.y + (Math.random() - 0.5) * 60,
              );
            }
          }
        }
        break;
      }

      case EnemyBehavior.PHASE: {
        enemy.moveToward(px, py);
        // Toggle visibility every 2s
        enemy.addBehaviorTimer(delta);
        const phaseTime = enemy.getBehaviorTimer() % 4000;
        if (phaseTime < 2000) {
          enemy.setAlpha(1);
          enemy.body!.enable = true;
        } else {
          enemy.setAlpha(0.2);
          enemy.body!.enable = false; // invulnerable when invisible
        }
        break;
      }

      case EnemyBehavior.SUICIDE:
        enemy.moveToward(px, py);
        break;

      case EnemyBehavior.SHIELD:
        enemy.moveToward(px, py);
        break;

      case EnemyBehavior.LEAP: {
        enemy.addBehaviorTimer(delta);
        if (enemy.getIsCharging()) {
          if (enemy.updateCharge(delta)) {
            enemy.setVelocity(0, 0);
          }
        } else if (enemy.getBehaviorTimer() > 3000) {
          enemy.resetBehaviorTimer();
          enemy.startCharge();
          enemy.chargeToward(px, py, enemy.def.chargeSpeed ?? 200);
        } else {
          enemy.moveToward(px, py);
        }
        break;
      }
    }
  }

  private getHivemindPhase(enemy: Enemy): number {
    const hpPercent = enemy.currentHP / enemy.maxHP;
    if (hpPercent > 0.66) return 1;
    if (hpPercent > 0.33) return 2;
    return 3;
  }

  private fireEnemyProjectile(enemy: Enemy, tx: number, ty: number, texture = 'shuriken'): void {
    const proj = this.enemyProjectileGroup.getFirstDead(false) as EnemyProjectile | null;
    if (!proj) return;

    const dx = tx - enemy.x;
    const dy = ty - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = enemy.def.projectileSpeed ?? 150;

    proj.body!.enable = true;
    proj.fire(
      enemy.x, enemy.y,
      (dx / dist) * speed,
      (dy / dist) * speed,
      enemy.scaledDamage,
      texture,
    );
  }

  private fireHivemindRing(enemy: Enemy): void {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const proj = this.enemyProjectileGroup.getFirstDead(false) as EnemyProjectile | null;
      if (!proj) break;

      const speed = 100;
      proj.body!.enable = true;
      proj.fire(
        enemy.x, enemy.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        enemy.scaledDamage,
        'big_energyball',
      );
    }
  }

  // ─── Chest Spawning ──────────────────────────────────────────────
  private spawnChestAtRandom(): void {
    const chest = this.chestGroup.getFirstDead(false) as Chest | null;
    if (!chest) return;

    // Spawn near player but not too close
    const angle = Math.random() * Math.PI * 2;
    const dist = 150 + Math.random() * 300;
    const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 50, WORLD_WIDTH - 50);
    const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 50, WORLD_HEIGHT - 50);

    const rarity = this.rollChestRarity();
    chest.body!.enable = true;
    chest.spawn(x, y, rarity);
  }

  private spawnChestAt(x: number, y: number, rarity?: Rarity): void {
    const chest = this.chestGroup.getFirstDead(false) as Chest | null;
    if (!chest) return;
    chest.body!.enable = true;
    chest.spawn(x, y, rarity ?? this.rollChestRarity());
  }

  private rollChestRarity(): Rarity {
    const roll = Math.random();
    for (const { rarity, threshold } of CHEST_RARITY_TABLE) {
      if (roll < threshold) return rarity;
    }
    return Rarity.COMMON;
  }

  private onChestCollected(chest: Chest): void {
    chest.open();
    EventBus.emit(EVENTS.CHEST_COLLECTED, chest.chestRarity);

    // Pause and show enhancement cards from chest (better rarity)
    this.pauseGame();
    this.scene.launch(SCENES.LEVEL_UP, { source: 'chest', chestRarity: chest.chestRarity });
  }

  // ─── Event Handlers ───────────────────────────────────────────────
  private onLevelUp(level: number): void {
    this.pauseGame();
    const state = this.player.playerState;
    const isJobLevel = JOB_SELECTION_LEVELS.includes(level);

    // If awakened, no more job selections at levels 11/17
    const needsJobSelection = isJobLevel
      && !state.isAwakened
      && state.chosenJobs.length < PLAYER_MAX_JOBS;

    // At level 17 when already awakened, apply mastery
    if (isJobLevel && state.isAwakened && level >= 17) {
      this.passiveManager.applyMastery();
    }

    this.scene.launch(SCENES.LEVEL_UP, {
      source: needsJobSelection ? 'job_selection' : 'levelup'
    });
  }

  private onPlayerDied(): void {
    getMusicManager(this).playGameOverMusic();
    this.time.delayedCall(1000, () => {
      this.scene.stop(SCENES.HUD);
      this.scene.start(SCENES.GAME_OVER, {
        victory: false,
        stats: this.player.playerState.stats,
        wave: this.waveManager.getCurrentWave(),
        weaponCount: this.player.playerState.weapons.length,
      });
    });
  }

  private onGameWon(): void {
    getMusicManager(this).stop();
    this.time.delayedCall(2000, () => {
      this.scene.stop(SCENES.HUD);
      this.scene.start(SCENES.GAME_OVER, {
        victory: true,
        stats: this.player.playerState.stats,
        wave: this.waveManager.getCurrentWave(),
        weaponCount: this.player.playerState.weapons.length,
      });
    });
  }

  private onEnemyHit(enemy: Enemy, damage: number): void {
    this.damageNumbers.spawn(enemy.x, enemy.y, damage, '#FFFFFF');
  }

  private onEnemyKilled(type: EnemyType, x: number, y: number): void {
    this.player.playerState.stats.kills++;

    // Bloodlust: heal on kill
    const killHeal = this.player.playerState.modifiers.killHealAmount;
    if (killHeal > 0) this.player.heal(killHeal);

    if (type === EnemyType.BOMBER && !this.isProcessingBomberExplosion) {
      // Bomber explosion AoE - guard prevents infinite recursion when chain-killing Bombers
      this.isProcessingBomberExplosion = true;
      const enemies = this.enemyGroup.getChildren() as Enemy[];
      for (const e of enemies) {
        if (!e.active) continue;
        const d = Phaser.Math.Distance.Between(x, y, e.x, e.y);
        if (d <= 30 * SPRITE_SCALE) e.takeDamage(15);
      }
      // Also damage player if close
      const playerDist = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
      if (playerDist <= 30 * SPRITE_SCALE) this.player.takeDamage(15);

      // Visual explosion — sprite-based
      const explTex = this.textures.exists('fx_explosion') ? 'fx_explosion' : 'fx_circle_spark';
      const explSprite = this.add.sprite(x, y, explTex, 0);
      explSprite.setDepth(DEPTHS.EFFECTS);
      explSprite.setScale((30 * SPRITE_SCALE * 2) / 40);
      explSprite.setTint(0xFF4400);
      explSprite.setAlpha(0.8);
      explSprite.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: explSprite, alpha: 0, scaleX: explSprite.scaleX * 1.3, scaleY: explSprite.scaleY * 1.3, duration: 300, onComplete: () => explSprite.destroy() });
      this.isProcessingBomberExplosion = false;
    }

    this.handleSplitterDeath(type, x, y);

    // Boss guaranteed loot
    const def = ENEMY_DEFS[type];
    if (def && def.isBoss) {
      const bossRarity = type === EnemyType.HIVEMIND ? Rarity.LEGENDARY : Rarity.EPIC;
      this.spawnChestAt(x, y, bossRarity);
    }
  }

  private onEliteKilled(_type: EnemyType, x: number, y: number): void {
    // Elite enemies always drop a chest with better rarity
    const roll = Math.random();
    const rarity = roll < 0.15 ? Rarity.LEGENDARY
      : roll < 0.45 ? Rarity.EPIC
      : roll < 0.80 ? Rarity.RARE
      : Rarity.COMMON;
    this.spawnChestAt(x, y, rarity);
  }

  private onCritHit(enemy: Enemy, totalDamage: number): void {
    this.damageNumbers.spawnCrit(enemy.x, enemy.y, totalDamage);
  }

  private onEnchantDamage(x: number, y: number, damage: number, color: string): void {
    this.damageNumbers.spawn(x, y, damage, color);
  }

  private onPlayerDamageTaken(damage: number): void {
    this.damageNumbers.spawn(this.player.x, this.player.y - 10, damage, '#FF4444');
    // screen shake removed
  }

  // ─── Pause / Resume ───────────────────────────────────────────────
  public pauseGame(): void {
    this.isPaused = true;
    this.physics?.pause();
    this.waveManager?.pause();
  }

  public resumeGame(): void {
    this.isPaused = false;
    this.physics?.resume();
    this.waveManager?.resume();
  }

  // ─── Splitter death handling ──────────────────────────────────────
  private handleSplitterDeath(type: EnemyType, x: number, y: number): void {
    if (type !== EnemyType.SPLITTER) return;
    const splitDef = ENEMY_DEFS[EnemyType.SPLITTER];
    const splitCount = splitDef.splitCount ?? 2;
    const splitType = splitDef.splitType ?? EnemyType.SWARMER;

    for (let i = 0; i < splitCount; i++) {
      this.waveManager.spawnEnemy(
        splitType,
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
      );
    }
  }

  // ─── Ground Tiling ─────────────────────────────────────────────────
  private tileGround(): void {
    // Build landscape using individual tiles from TilesetField (5 cols × 15 rows)
    // Green grass block: rows 3-5 → solid center at (col 1, row 4) = frame 21
    // Dark grass block: rows 6-8 → solid center at (col 1, row 7) = frame 36
    // Grass center variants: frame 28, 29 (row 5 cols 3,4)
    const TILE = 16;
    const S = SPRITE_SCALE;
    const scaledTile = TILE * S;
    const tilesX = Math.ceil(WORLD_WIDTH / scaledTile);
    const tilesY = Math.ceil(WORLD_HEIGHT / scaledTile);

    // Grass tile indices from TilesetField (5 cols per row)
    const grassSolid = [21, 21, 21, 21, 21, 36, 28, 29]; // mostly green, some dark/variant

    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        const wx = tx * scaledTile + scaledTile / 2;
        const wy = ty * scaledTile + scaledTile / 2;
        const tileIdx = grassSolid[Math.floor(Math.random() * grassSolid.length)];
        this.add.image(wx, wy, 'tileset_field', tileIdx)
          .setScale(S)
          .setDepth(DEPTHS.GROUND);
      }
    }

    // Dirt paths crossing the map (using orange/sandy tiles: row 1 center = frame 6)
    const dirtTile = 6;
    const pathCount = 4;
    for (let p = 0; p < pathCount; p++) {
      const isHoriz = p % 2 === 0;
      const pos = 200 + Math.floor(Math.random() * (isHoriz ? WORLD_HEIGHT - 400 : WORLD_WIDTH - 400));
      const length = isHoriz ? tilesX : tilesY;
      const pathWidth = 2 + Math.floor(Math.random() * 2); // 2-3 tiles wide
      for (let i = 0; i < length; i++) {
        for (let w = 0; w < pathWidth; w++) {
          const wx = isHoriz
            ? i * scaledTile + scaledTile / 2
            : pos + w * scaledTile + scaledTile / 2;
          const wy = isHoriz
            ? pos + w * scaledTile + scaledTile / 2
            : i * scaledTile + scaledTile / 2;
          if (wx < WORLD_WIDTH && wy < WORLD_HEIGHT) {
            this.add.image(wx, wy, 'tileset_field', dirtTile)
              .setScale(S)
              .setDepth(DEPTHS.GROUND + 0.1);
          }
        }
      }
    }
  }

  // ─── Environment Decorations ──────────────────────────────────────
  private scatterDecorations(): void {
    const S = SPRITE_SCALE;

    // Scatter trees from TilesetNature (various tree tiles)
    // Trees in TilesetNature are multi-tile (2x2 or 3x3). Use large single-tile elements.
    // Small bushes: around row 5-6 of nature tileset. Single rocks: row 8-9.
    // Nature tileset is 24 cols × 21 rows
    const treeTiles = [0, 1, 2, 3, 4, 5]; // Top row: tree tops
    const rockTiles = [168, 169, 192, 193]; // ~row 7-8: rocks
    const bushTiles = [120, 121, 122, 144, 145]; // ~row 5-6: bushes/plants

    // Large trees (using 2x2 tile clusters from nature tileset)
    for (let i = 0; i < 40; i++) {
      const x = 100 + Math.random() * (WORLD_WIDTH - 200);
      const y = 100 + Math.random() * (WORLD_HEIGHT - 200);
      const tileIdx = treeTiles[Math.floor(Math.random() * treeTiles.length)];
      this.add.image(x, y, 'tileset_nature', tileIdx)
        .setScale(S * 2)
        .setDepth(DEPTHS.GROUND + 2);
    }

    // Rocks
    for (let i = 0; i < 30; i++) {
      const x = 50 + Math.random() * (WORLD_WIDTH - 100);
      const y = 50 + Math.random() * (WORLD_HEIGHT - 100);
      const tileIdx = rockTiles[Math.floor(Math.random() * rockTiles.length)];
      this.add.image(x, y, 'tileset_nature', tileIdx)
        .setScale(S * 1.5)
        .setDepth(DEPTHS.GROUND + 1);
    }

    // Small bushes from tileset
    for (let i = 0; i < 50; i++) {
      const x = 50 + Math.random() * (WORLD_WIDTH - 100);
      const y = 50 + Math.random() * (WORLD_HEIGHT - 100);
      const tileIdx = bushTiles[Math.floor(Math.random() * bushTiles.length)];
      this.add.image(x, y, 'tileset_nature', tileIdx)
        .setScale(S)
        .setDepth(DEPTHS.GROUND + 1);
    }

    // Flowers and bushes from environment PNGs
    if (this.textures.exists('env_bush')) {
      for (let i = 0; i < 40; i++) {
        const x = 50 + Math.random() * (WORLD_WIDTH - 100);
        const y = 50 + Math.random() * (WORLD_HEIGHT - 100);
        this.add.image(x, y, 'env_bush')
          .setScale(1.5)
          .setDepth(DEPTHS.GROUND + 1)
          .setAlpha(0.8 + Math.random() * 0.2);
      }
    }
    if (this.textures.exists('env_flowers')) {
      for (let i = 0; i < 35; i++) {
        const x = 50 + Math.random() * (WORLD_WIDTH - 100);
        const y = 50 + Math.random() * (WORLD_HEIGHT - 100);
        this.add.image(x, y, 'env_flowers')
          .setDepth(DEPTHS.GROUND + 1)
          .setAlpha(0.7 + Math.random() * 0.3);
      }
    }
  }

  private onShutdown(): void {
    this.waveBanner.destroy();
    this.pickupManager.destroy();
    this.enchantManager.destroy();
    this.weaponManager.destroy();
    this.jobSkillManager.destroy();
    this.passiveManager.destroy();
    this.elementManager.destroy();
    this.synergyManager.destroy();
    this.sfxManager.destroy();
    EventBus.removeAllListeners();
  }
}
