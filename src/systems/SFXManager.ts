import { EventBus } from './EventBus';
import { EVENTS } from '../constants';

/**
 * Procedural SFX manager using the Web Audio API.
 * Every sound is synthesised at runtime -- no external audio files needed.
 * Designed for a retro / 8-bit aesthetic with short, punchy sounds.
 */
export class SFXManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _volume = 0.4;
  private initialized = false;

  // Bound listener references so we can remove them on destroy
  private listeners: Array<{ event: string; fn: (...args: any[]) => void }> = [];
  private initHandler: (() => void) | null = null;

  constructor() {
    // AudioContext can only be created after a user gesture in most browsers.
    // We attach a one-shot handler to the first interaction.
    this.initHandler = () => this.initAudio();
    window.addEventListener('pointerdown', this.initHandler, { once: true });
    window.addEventListener('keydown', this.initHandler, { once: true });
  }

  // ── public API ──────────────────────────────────────────────────────

  /** Master volume 0-1 */
  get volume(): number {
    return this._volume;
  }

  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this._volume;
    }
  }

  /** Manually trigger the shoot sound (call from weapon fire code). */
  public playShoot(): void {
    this.shootSound();
  }

  /** Tear everything down. */
  public destroy(): void {
    // Remove EventBus listeners
    for (const { event, fn } of this.listeners) {
      EventBus.off(event, fn);
    }
    this.listeners = [];

    // Remove init handlers if audio was never started
    if (this.initHandler) {
      window.removeEventListener('pointerdown', this.initHandler);
      window.removeEventListener('keydown', this.initHandler);
      this.initHandler = null;
    }

    // Close AudioContext
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
    this.initialized = false;
  }

  // ── bootstrap ───────────────────────────────────────────────────────

  private initAudio(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this._volume;
    this.masterGain.connect(this.ctx.destination);

    this.bindEvents();
  }

  private bindEvents(): void {
    const bind = (event: string, fn: (...args: any[]) => void) => {
      EventBus.on(event, fn, this);
      this.listeners.push({ event, fn });
    };

    bind(EVENTS.ENEMY_HIT, () => this.enemyHitSound());
    bind(EVENTS.ENEMY_KILLED, () => this.enemyKilledSound());
    bind(EVENTS.PLAYER_DAMAGE_TAKEN, () => this.playerDamageSound());
    bind(EVENTS.LEVEL_UP, () => this.levelUpSound());
    bind(EVENTS.WAVE_STARTED, () => this.waveStartedSound());
    bind(EVENTS.BOSS_SPAWNED, () => this.bossSpawnedSound());
    bind(EVENTS.CHEST_COLLECTED, () => this.chestCollectedSound());
    bind(EVENTS.ENHANCEMENT_PICKED, () => this.enhancementPickedSound());
    bind(EVENTS.WEAPON_ADDED, () => this.weaponAddedSound());
    bind(EVENTS.ELITE_KILLED, () => this.eliteKilledSound());
  }

  // ── helpers ─────────────────────────────────────────────────────────

  private get now(): number {
    return this.ctx!.currentTime;
  }

  private get out(): GainNode {
    return this.masterGain!;
  }

  /** Create a gain node connected to master output. */
  private createGain(value = 1): GainNode {
    const g = this.ctx!.createGain();
    g.gain.value = value;
    g.connect(this.out);
    return g;
  }

  /** Create an oscillator, connect it to a target, start & stop it. */
  private osc(
    type: OscillatorType,
    freq: number,
    target: AudioNode,
    start: number,
    stop: number,
  ): OscillatorNode {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.connect(target);
    o.start(start);
    o.stop(stop);
    return o;
  }

  /** Generate a buffer of white noise. */
  private noiseBuffer(duration: number): AudioBuffer {
    const sr = this.ctx!.sampleRate;
    const len = Math.floor(sr * duration);
    const buf = this.ctx!.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  /** Play a noise burst through a gain envelope. */
  private noiseBurst(
    gain: GainNode,
    duration: number,
    start: number,
  ): AudioBufferSourceNode {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noiseBuffer(duration);
    src.connect(gain);
    src.start(start);
    src.stop(start + duration);
    return src;
  }

  // ── sound definitions ───────────────────────────────────────────────

  /** Short laser-like shoot blip. */
  private shootSound(): void {
    if (!this.ctx) return;
    const t = this.now;
    const g = this.createGain(0.15);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    const o = this.osc('square', 880, g, t, t + 0.08);
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(220, t + 0.08);
  }

  /** ENEMY_HIT -- short impact thud. */
  private enemyHitSound(): void {
    if (!this.ctx) return;
    const t = this.now;

    // Low-frequency thud
    const g = this.createGain(0.2);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    const o = this.osc('sine', 160, g, t, t + 0.06);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.06);

    // Tiny noise click
    const ng = this.createGain(0.08);
    ng.gain.setValueAtTime(0.08, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    this.noiseBurst(ng, 0.03, t);
  }

  /** ENEMY_KILLED -- crunchy splat. */
  private enemyKilledSound(): void {
    if (!this.ctx) return;
    const t = this.now;

    // Downward sweep
    const g1 = this.createGain(0.2);
    g1.gain.setValueAtTime(0.2, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    const o = this.osc('sawtooth', 300, g1, t, t + 0.12);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    // Noise crunch
    const ng = this.createGain(0.15);
    ng.gain.setValueAtTime(0.15, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    this.noiseBurst(ng, 0.1, t);
  }

  /** PLAYER_DAMAGE_TAKEN -- harsh buzz hit. */
  private playerDamageSound(): void {
    if (!this.ctx) return;
    const t = this.now;

    // Distorted square buzz
    const g = this.createGain(0.25);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    const o = this.osc('square', 120, g, t, t + 0.15);
    o.frequency.setValueAtTime(120, t);
    o.frequency.linearRampToValueAtTime(80, t + 0.15);

    // High noise overlay
    const ng = this.createGain(0.12);
    ng.gain.setValueAtTime(0.12, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    this.noiseBurst(ng, 0.1, t);
  }

  /** LEVEL_UP -- ascending triumphant chime (arpeggiated). */
  private levelUpSound(): void {
    if (!this.ctx) return;
    const t = this.now;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6

    notes.forEach((freq, i) => {
      const offset = i * 0.07;
      const g = this.createGain(0.18);
      g.gain.setValueAtTime(0.001, t + offset);
      g.gain.linearRampToValueAtTime(0.18, t + offset + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.2);
      this.osc('square', freq, g, t + offset, t + offset + 0.2);
    });
  }

  /** WAVE_STARTED -- alert drum/horn. */
  private waveStartedSound(): void {
    if (!this.ctx) return;
    const t = this.now;

    // Two short horn blasts
    for (let i = 0; i < 2; i++) {
      const offset = i * 0.12;
      const g = this.createGain(0.2);
      g.gain.setValueAtTime(0.001, t + offset);
      g.gain.linearRampToValueAtTime(0.2, t + offset + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);
      this.osc('sawtooth', 440, g, t + offset, t + offset + 0.1);
    }

    // Drum hit (noise)
    const ng = this.createGain(0.18);
    ng.gain.setValueAtTime(0.18, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    this.noiseBurst(ng, 0.15, t);

    // Sub thump
    const sg = this.createGain(0.2);
    sg.gain.setValueAtTime(0.2, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    const sub = this.osc('sine', 80, sg, t, t + 0.15);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.15);
  }

  /** BOSS_SPAWNED -- deep threatening horn. */
  private bossSpawnedSound(): void {
    if (!this.ctx) return;
    const t = this.now;

    // Deep horn sweep
    const g1 = this.createGain(0.25);
    g1.gain.setValueAtTime(0.001, t);
    g1.gain.linearRampToValueAtTime(0.25, t + 0.05);
    g1.gain.setValueAtTime(0.25, t + 0.25);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    const o1 = this.osc('sawtooth', 65, g1, t, t + 0.5);
    o1.frequency.setValueAtTime(65, t);
    o1.frequency.linearRampToValueAtTime(55, t + 0.5);

    // Sub layer
    const g2 = this.createGain(0.2);
    g2.gain.setValueAtTime(0.001, t);
    g2.gain.linearRampToValueAtTime(0.2, t + 0.05);
    g2.gain.setValueAtTime(0.2, t + 0.25);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    this.osc('sine', 40, g2, t, t + 0.5);

    // Rumble noise
    const ng = this.createGain(0.08);
    ng.gain.setValueAtTime(0.001, t);
    ng.gain.linearRampToValueAtTime(0.08, t + 0.05);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    this.noiseBurst(ng, 0.4, t);
  }

  /** CHEST_COLLECTED -- magical sparkle/unlock. */
  private chestCollectedSound(): void {
    if (!this.ctx) return;
    const t = this.now;

    // Quick ascending sparkle notes
    const notes = [1318.5, 1568, 1760, 2093]; // E6 G6 A6 C7
    notes.forEach((freq, i) => {
      const offset = i * 0.04;
      const g = this.createGain(0.12);
      g.gain.setValueAtTime(0.001, t + offset);
      g.gain.linearRampToValueAtTime(0.12, t + offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.12);
      this.osc('sine', freq, g, t + offset, t + offset + 0.12);
    });

    // Shimmer noise
    const ng = this.createGain(0.06);
    ng.gain.setValueAtTime(0.06, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    this.noiseBurst(ng, 0.18, t);
  }

  /** ENHANCEMENT_PICKED -- positive pickup blip. */
  private enhancementPickedSound(): void {
    if (!this.ctx) return;
    const t = this.now;

    // Two-note rising blip
    const g1 = this.createGain(0.15);
    g1.gain.setValueAtTime(0.15, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    this.osc('square', 660, g1, t, t + 0.08);

    const g2 = this.createGain(0.15);
    g2.gain.setValueAtTime(0.001, t + 0.06);
    g2.gain.linearRampToValueAtTime(0.15, t + 0.065);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    this.osc('square', 990, g2, t + 0.06, t + 0.14);
  }

  /** WEAPON_ADDED -- metallic equip clank. */
  private weaponAddedSound(): void {
    if (!this.ctx) return;
    const t = this.now;

    // Metallic ring (high sine with fast decay)
    const g1 = this.createGain(0.18);
    g1.gain.setValueAtTime(0.18, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    this.osc('triangle', 1200, g1, t, t + 0.15);

    // Impact body
    const g2 = this.createGain(0.2);
    g2.gain.setValueAtTime(0.2, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    const o2 = this.osc('square', 200, g2, t, t + 0.08);
    o2.frequency.exponentialRampToValueAtTime(100, t + 0.08);

    // Noise click
    const ng = this.createGain(0.1);
    ng.gain.setValueAtTime(0.1, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    this.noiseBurst(ng, 0.04, t);
  }

  /** ELITE_KILLED -- special death explosion. */
  private eliteKilledSound(): void {
    if (!this.ctx) return;
    const t = this.now;

    // Heavy explosion sweep
    const g1 = this.createGain(0.25);
    g1.gain.setValueAtTime(0.25, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    const o1 = this.osc('sawtooth', 400, g1, t, t + 0.25);
    o1.frequency.exponentialRampToValueAtTime(30, t + 0.25);

    // Sub boom
    const g2 = this.createGain(0.2);
    g2.gain.setValueAtTime(0.2, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    const o2 = this.osc('sine', 100, g2, t, t + 0.2);
    o2.frequency.exponentialRampToValueAtTime(20, t + 0.2);

    // Explosion noise
    const ng = this.createGain(0.2);
    ng.gain.setValueAtTime(0.2, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    this.noiseBurst(ng, 0.2, t);

    // Sparkle tail (reward feel)
    const notes = [880, 1100, 1320];
    notes.forEach((freq, i) => {
      const offset = 0.1 + i * 0.04;
      const g = this.createGain(0.07);
      g.gain.setValueAtTime(0.001, t + offset);
      g.gain.linearRampToValueAtTime(0.07, t + offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);
      this.osc('sine', freq, g, t + offset, t + offset + 0.1);
    });
  }
}
