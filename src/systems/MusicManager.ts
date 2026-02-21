/**
 * Procedural music manager using the Web Audio API.
 * All music is synthesised at runtime -- no external audio files needed.
 * Produces dark, minor-key loops for a Vampire Survivors-like game.
 */
export class MusicManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _volume = 0.25;
  private initialized = false;
  private initHandler: (() => void) | null = null;

  // Scheduling state
  private schedulerTimer: number | null = null;
  private activeNodes: AudioNode[] = [];
  private currentTrack: 'title' | 'game' | null = null;
  private pendingTrack: 'title' | 'game' | null = null;
  private scheduleAheadTime = 0.2; // seconds to look ahead when scheduling
  private loopIntervalMs = 80; // ms between scheduler calls

  // Title music state
  private titleNextChordTime = 0;
  private titleChordIndex = 0;

  // Game music state
  private gameNextStepTime = 0;
  private gameStepIndex = 0;
  private gameBPM = 140;

  constructor() {
    this.initHandler = () => this.initAudio();
    window.addEventListener('pointerdown', this.initHandler, { once: true });
    window.addEventListener('keydown', this.initHandler, { once: true });
  }

  // ── Public API ──────────────────────────────────────────────────────

  get volume(): number {
    return this._volume;
  }

  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.05);
    }
  }

  public playTitleMusic(): void {
    this.pendingTrack = 'title';
    if (this.initialized) {
      this.startTrack('title');
    }
  }

  public playGameMusic(): void {
    this.pendingTrack = 'game';
    if (this.initialized) {
      this.startTrack('game');
    }
  }

  public stopMusic(): void {
    this.pendingTrack = null;
    this.stopScheduler();
    this.disconnectAll();
    this.currentTrack = null;
  }

  public destroy(): void {
    this.stopMusic();

    if (this.initHandler) {
      window.removeEventListener('pointerdown', this.initHandler);
      window.removeEventListener('keydown', this.initHandler);
      this.initHandler = null;
    }

    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
    this.initialized = false;
  }

  // ── Bootstrap ───────────────────────────────────────────────────────

  private initAudio(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this._volume;
    this.masterGain.connect(this.ctx.destination);

    // If a track was requested before audio was available, start it now
    if (this.pendingTrack) {
      this.startTrack(this.pendingTrack);
    }
  }

  // ── Track management ────────────────────────────────────────────────

  private startTrack(track: 'title' | 'game'): void {
    if (this.currentTrack === track) return;

    this.stopScheduler();
    this.disconnectAll();
    this.currentTrack = track;
    this.pendingTrack = track;

    if (!this.ctx || !this.masterGain) return;

    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (track === 'title') {
      this.titleNextChordTime = this.ctx.currentTime + 0.05;
      this.titleChordIndex = 0;
      this.startScheduler(() => this.scheduleTitleMusic());
    } else {
      this.gameNextStepTime = this.ctx.currentTime + 0.05;
      this.gameStepIndex = 0;
      this.startScheduler(() => this.scheduleGameMusic());
    }
  }

  // ── Scheduler ───────────────────────────────────────────────────────

  private startScheduler(callback: () => void): void {
    this.stopScheduler();
    const tick = (): void => {
      callback();
      this.schedulerTimer = window.setTimeout(tick, this.loopIntervalMs);
    };
    tick();
  }

  private stopScheduler(): void {
    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private disconnectAll(): void {
    for (const node of this.activeNodes) {
      try {
        node.disconnect();
      } catch {
        // already disconnected
      }
    }
    this.activeNodes = [];
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  private get out(): GainNode {
    return this.masterGain!;
  }

  private createGain(value: number, target?: AudioNode): GainNode {
    const g = this.ctx!.createGain();
    g.gain.value = value;
    g.connect(target ?? this.out);
    this.activeNodes.push(g);
    return g;
  }

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
    this.activeNodes.push(o);
    return o;
  }

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
    this.activeNodes.push(src);
    return src;
  }

  // ── Title Music: Dark ambient drone with evolving pad chords ────────
  //
  // Key of A minor. Slow chord changes (4s each).
  // Layers: sub drone, detuned pad, eerie high harmonics, noise wash.
  //
  // Chord progression (Am - Dm - Em - F):
  //   Am = A2(110), C3(130.81), E3(164.81)
  //   Dm = D3(146.83), F3(174.61), A3(220)
  //   Em = E3(164.81), G3(196), B3(246.94)
  //   F  = F3(174.61), A3(220), C4(261.63)

  private readonly titleChords: number[][] = [
    [110, 130.81, 164.81],     // Am
    [146.83, 174.61, 220],     // Dm
    [164.81, 196, 246.94],     // Em
    [174.61, 220, 261.63],     // F
  ];
  private readonly titleChordDuration = 4.0; // seconds per chord

  private scheduleTitleMusic(): void {
    if (!this.ctx || this.currentTrack !== 'title') return;

    const now = this.ctx.currentTime;
    while (this.titleNextChordTime < now + this.scheduleAheadTime) {
      this.scheduleTitleChord(this.titleNextChordTime);
      this.titleNextChordTime += this.titleChordDuration;
      this.titleChordIndex = (this.titleChordIndex + 1) % this.titleChords.length;
    }
  }

  private scheduleTitleChord(time: number): void {
    const chord = this.titleChords[this.titleChordIndex];
    const dur = this.titleChordDuration;
    const fadeIn = 1.2;
    const fadeOut = 1.2;

    // Sub drone on root
    const subGain = this.createGain(0);
    subGain.gain.setValueAtTime(0.001, time);
    subGain.gain.exponentialRampToValueAtTime(0.18, time + fadeIn);
    subGain.gain.setValueAtTime(0.18, time + dur - fadeOut);
    subGain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    this.osc('sine', chord[0], subGain, time, time + dur);

    // Detuned pad voices (2 oscillators per note, slightly detuned)
    for (const freq of chord) {
      const padGain = this.createGain(0);
      padGain.gain.setValueAtTime(0.001, time);
      padGain.gain.exponentialRampToValueAtTime(0.06, time + fadeIn);
      padGain.gain.setValueAtTime(0.06, time + dur - fadeOut);
      padGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      // Voice 1: slightly sharp
      this.osc('triangle', freq * 1.003, padGain, time, time + dur);
      // Voice 2: slightly flat
      this.osc('triangle', freq * 0.997, padGain, time, time + dur);
    }

    // Eerie high harmonic (6th harmonic of root, very quiet)
    const highFreq = chord[0] * 6;
    const highGain = this.createGain(0);
    highGain.gain.setValueAtTime(0.001, time);
    highGain.gain.exponentialRampToValueAtTime(0.02, time + fadeIn * 1.5);
    highGain.gain.setValueAtTime(0.02, time + dur - fadeOut);
    highGain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    this.osc('sine', highFreq, highGain, time, time + dur);
    // Slightly detuned twin for shimmer
    this.osc('sine', highFreq * 1.005, highGain, time, time + dur);

    // Slow noise wash for texture (low-pass filtered)
    const noiseGain = this.createGain(0);
    noiseGain.gain.setValueAtTime(0.001, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.02, time + fadeIn);
    noiseGain.gain.setValueAtTime(0.02, time + dur - fadeOut);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;
    filter.connect(noiseGain);
    this.activeNodes.push(filter);

    const noiseSrc = this.ctx!.createBufferSource();
    noiseSrc.buffer = this.noiseBuffer(dur);
    noiseSrc.connect(filter);
    noiseSrc.start(time);
    noiseSrc.stop(time + dur);
    this.activeNodes.push(noiseSrc);
  }

  // ── Game Music: Action loop with drums, bass, and melody ────────────
  //
  // 140 BPM, 16th-note grid. Key of A minor.
  // Pattern length: 32 steps (2 bars of 4/4 in 16ths) => loops every ~3.43s
  //
  // Layers:
  //   - Kick drum (sine thump)
  //   - Hi-hat (filtered noise burst)
  //   - Snare (noise + sine)
  //   - Bass line (square wave, root-note patterns)
  //   - Melody (sawtooth, simple riff)

  private readonly gameStepsPerLoop = 32;
  private get gameStepDuration(): number {
    return 60 / this.gameBPM / 4; // duration of one 16th note
  }

  // Kick on beats 1 and 3 of each bar, plus a fill variation
  private readonly kickPattern = [
    1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
    1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0,
  ];

  // Hi-hat on every even 16th
  private readonly hihatPattern = [
    1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
    1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1,
  ];

  // Snare on beats 2 and 4 (steps 4, 12, 20, 28)
  private readonly snarePattern = [
    0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  ];

  // Bass notes (Hz). A minor pentatonic riff. 0 = rest.
  // A2=110, C3=130.81, D3=146.83, E3=164.81, G3=196
  private readonly bassPattern: number[] = [
    110, 0, 0, 0, 0, 0, 110, 0, 130.81, 0, 0, 0, 0, 0, 110, 0,
    146.83, 0, 0, 0, 0, 0, 130.81, 0, 110, 0, 0, 0, 0, 0, 196, 0,
  ];

  // Melody notes (Hz). Higher register. 0 = rest.
  // A4=440, C5=523.25, D5=587.33, E5=659.25, G5=783.99
  private readonly melodyPattern: number[] = [
    440, 0, 0, 523.25, 0, 0, 587.33, 0, 523.25, 0, 440, 0, 0, 0, 0, 0,
    659.25, 0, 0, 523.25, 0, 587.33, 0, 0, 523.25, 0, 440, 0, 0, 0, 783.99, 0,
  ];

  private scheduleGameMusic(): void {
    if (!this.ctx || this.currentTrack !== 'game') return;

    const now = this.ctx.currentTime;
    while (this.gameNextStepTime < now + this.scheduleAheadTime) {
      this.scheduleGameStep(this.gameNextStepTime, this.gameStepIndex);
      this.gameNextStepTime += this.gameStepDuration;
      this.gameStepIndex = (this.gameStepIndex + 1) % this.gameStepsPerLoop;
    }
  }

  private scheduleGameStep(time: number, step: number): void {
    const stepDur = this.gameStepDuration;

    // Kick
    if (this.kickPattern[step]) {
      const kGain = this.createGain(0);
      kGain.gain.setValueAtTime(0.3, time);
      kGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      const kOsc = this.osc('sine', 150, kGain, time, time + 0.15);
      kOsc.frequency.setValueAtTime(150, time);
      kOsc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    }

    // Hi-hat (high-pass filtered noise)
    if (this.hihatPattern[step]) {
      const hhGain = this.createGain(0);
      const hhVol = step % 4 === 0 ? 0.08 : 0.05;
      hhGain.gain.setValueAtTime(hhVol, time);
      hhGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      const hhFilter = this.ctx!.createBiquadFilter();
      hhFilter.type = 'highpass';
      hhFilter.frequency.value = 7000;
      hhFilter.connect(hhGain);
      this.activeNodes.push(hhFilter);

      const hhSrc = this.ctx!.createBufferSource();
      hhSrc.buffer = this.noiseBuffer(0.04);
      hhSrc.connect(hhFilter);
      hhSrc.start(time);
      hhSrc.stop(time + 0.04);
      this.activeNodes.push(hhSrc);
    }

    // Snare
    if (this.snarePattern[step]) {
      // Noise body
      const snGain = this.createGain(0);
      snGain.gain.setValueAtTime(0.15, time);
      snGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      this.noiseBurst(snGain, 0.12, time);

      // Tonal body
      const snToneGain = this.createGain(0);
      snToneGain.gain.setValueAtTime(0.12, time);
      snToneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
      const snOsc = this.osc('triangle', 200, snToneGain, time, time + 0.06);
      snOsc.frequency.exponentialRampToValueAtTime(100, time + 0.06);
    }

    // Bass (square wave)
    const bassFreq = this.bassPattern[step];
    if (bassFreq) {
      const bGain = this.createGain(0);
      bGain.gain.setValueAtTime(0.001, time);
      bGain.gain.linearRampToValueAtTime(0.14, time + 0.01);
      bGain.gain.setValueAtTime(0.14, time + stepDur * 0.6);
      bGain.gain.exponentialRampToValueAtTime(0.001, time + stepDur * 1.8);

      this.osc('square', bassFreq, bGain, time, time + stepDur * 1.8);
    }

    // Melody (sawtooth)
    const melodyFreq = this.melodyPattern[step];
    if (melodyFreq) {
      const mGain = this.createGain(0);
      mGain.gain.setValueAtTime(0.001, time);
      mGain.gain.linearRampToValueAtTime(0.07, time + 0.01);
      mGain.gain.setValueAtTime(0.07, time + stepDur * 0.5);
      mGain.gain.exponentialRampToValueAtTime(0.001, time + stepDur * 1.5);

      this.osc('sawtooth', melodyFreq, mGain, time, time + stepDur * 1.5);
    }
  }
}
