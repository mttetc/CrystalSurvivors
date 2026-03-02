/**
 * Music manager using Phaser-loaded audio files from Ninja Adventure.
 * Replaces procedural synthesis with real .ogg tracks.
 */
export class MusicManager {
  private scene: Phaser.Scene | null = null;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private currentTrack: string | null = null;
  private _volume = 0.25;

  constructor() {}

  /** Bind to a scene so we can access its sound manager */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  public playTitleMusic(): void {
    this.playTrack('music_title');
  }

  public playGameMusic(): void {
    this.playTrack('music_game');
  }

  public playBossMusic(): void {
    this.playTrack('music_boss');
  }

  public playGameOverMusic(): void {
    this.playTrack('music_gameover');
  }

  private playTrack(key: string): void {
    if (!this.scene) return;
    if (this.currentTrack === key) return;

    // Stop current music
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
    }

    this.currentTrack = key;

    // Check if audio key exists
    if (!this.scene.cache.audio.exists(key)) return;

    this.currentMusic = this.scene.sound.add(key, {
      volume: this._volume,
      loop: true,
    });
    this.currentMusic.play();
  }

  public stop(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
    }
    this.currentTrack = null;
  }

  public get volume(): number {
    return this._volume;
  }

  public set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.currentMusic && 'setVolume' in this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this._volume);
    }
  }

  public destroy(): void {
    this.stop();
    this.scene = null;
  }
}
