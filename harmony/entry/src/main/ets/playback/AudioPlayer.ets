import { media } from '@kit.MediaKit';
import { audio } from '@kit.AudioKit';
import { BusinessError } from '@kit.BasicServicesKit';

export class AudioPlayer {
  private avPlayer: media.AVPlayer | null = null;
  private currentUrl: string = '';

  // Explicit type-safe callback fields
  private onStateChangedCallback: ((isPlaying: boolean) => void) | null = null;
  private onTimeUpdateCallback: ((timeInSeconds: number) => void) | null = null;
  private onDurationUpdateCallback: ((durationInSeconds: number) => void) | null = null;
  private onPlaybackCompletedCallback: (() => void) | null = null;
  private onErrorCallback: ((err: BusinessError) => void) | null = null;

  async create(): Promise<void> {
    if (this.avPlayer) return;
    this.avPlayer = await media.createAVPlayer();
    this.setupCallbacks();
  }

  private setupCallbacks(): void {
    if (!this.avPlayer) return;

    this.avPlayer.on('stateChange', async (state: string) => {
      console.info(`[AVPlayer] stateChange -> ${state}`);
      switch (state) {
        case 'initialized':
          await this.avPlayer?.prepare();
          break;
        case 'prepared':
          if (this.avPlayer) {
            this.avPlayer.audioInterruptMode = audio.InterruptMode.SHARE_MODE;
          }
          await this.avPlayer?.play();
          break;
        case 'playing':
          if (this.onStateChangedCallback) {
            this.onStateChangedCallback(true);
          }
          break;
        case 'paused':
          if (this.onStateChangedCallback) {
            this.onStateChangedCallback(false);
          }
          break;
        case 'completed':
          if (this.onPlaybackCompletedCallback) {
            this.onPlaybackCompletedCallback();
          }
          break;
        case 'stopped':
          await this.avPlayer?.reset();
          break;
        case 'idle':
          break;
        default:
          break;
      }
    });

    this.avPlayer.on('error', (err: BusinessError) => {
      console.error(`[AVPlayer] Error: ${err.code} - ${err.message}`);
      this.avPlayer?.reset();
      if (this.onErrorCallback) {
        this.onErrorCallback(err);
      }
    });

    this.avPlayer.on('timeUpdate', (time: number) => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(Math.floor(time / 1000));
      }
    });

    this.avPlayer.on('durationUpdate', (duration: number) => {
      if (this.onDurationUpdateCallback) {
        this.onDurationUpdateCallback(Math.floor(duration / 1000));
      }
    });
  }

  async setUrl(url: string): Promise<void> {
    this.currentUrl = url;
    if (!this.avPlayer) {
      await this.create();
    }
    if (this.avPlayer) {
      const state = this.avPlayer.state;
      if (state !== 'idle') {
        await this.avPlayer.reset();
      }
      this.avPlayer.url = url;
    }
  }

  async play(): Promise<void> {
    if (this.avPlayer && (this.avPlayer.state === 'prepared' || this.avPlayer.state === 'paused' || this.avPlayer.state === 'completed')) {
      await this.avPlayer.play();
    }
  }

  async pause(): Promise<void> {
    if (this.avPlayer && this.avPlayer.state === 'playing') {
      await this.avPlayer.pause();
    }
  }

  async seek(timeInSeconds: number): Promise<void> {
    if (this.avPlayer && (this.avPlayer.state === 'prepared' || this.avPlayer.state === 'playing' || this.avPlayer.state === 'paused' || this.avPlayer.state === 'completed')) {
      await this.avPlayer.seek(timeInSeconds * 1000);
    }
  }

  async stop(): Promise<void> {
    if (this.avPlayer && (this.avPlayer.state === 'prepared' || this.avPlayer.state === 'playing' || this.avPlayer.state === 'paused' || this.avPlayer.state === 'completed')) {
      await this.avPlayer.stop();
    }
  }

  setVolume(volume: number): void {
    if (this.avPlayer) {
      this.avPlayer.setVolume(volume);
    }
  }

  getCurrentTime(): number {
    return this.avPlayer ? Math.floor(this.avPlayer.currentTime / 1000) : 0;
  }

  getDuration(): number {
    return this.avPlayer ? Math.floor(this.avPlayer.duration / 1000) : 0;
  }

  getState(): string {
    return this.avPlayer ? this.avPlayer.state : 'idle';
  }

  // Strong-typed callback registrations
  onStateChanged(callback: (isPlaying: boolean) => void): void {
    this.onStateChangedCallback = callback;
  }

  onTimeUpdate(callback: (timeInSeconds: number) => void): void {
    this.onTimeUpdateCallback = callback;
  }

  onDurationUpdate(callback: (durationInSeconds: number) => void): void {
    this.onDurationUpdateCallback = callback;
  }

  onPlaybackCompleted(callback: () => void): void {
    this.onPlaybackCompletedCallback = callback;
  }

  onError(callback: (err: BusinessError) => void): void {
    this.onErrorCallback = callback;
  }

  release(): void {
    if (this.avPlayer) {
      this.avPlayer.off('stateChange');
      this.avPlayer.off('error');
      this.avPlayer.off('timeUpdate');
      this.avPlayer.off('durationUpdate');
      this.avPlayer.release();
      this.avPlayer = null;
    }
    this.onStateChangedCallback = null;
    this.onTimeUpdateCallback = null;
    this.onDurationUpdateCallback = null;
    this.onPlaybackCompletedCallback = null;
    this.onErrorCallback = null;
  }
}
