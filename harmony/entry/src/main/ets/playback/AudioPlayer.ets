import { media } from '@kit.MediaKit';
import { audio } from '@kit.AudioKit';
import { BusinessError } from '@kit.BasicServicesKit';

export class AudioPlayer {
  private avPlayer: media.AVPlayer | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private currentUrl: string = '';

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
          // prepare must be called in initialized state
          await this.avPlayer?.prepare();
          break;
        case 'prepared':
          // Set interruption mode for background audio sharing
          if (this.avPlayer) {
            this.avPlayer.audioInterruptMode = audio.InterruptMode.SHARE_MODE;
          }
          await this.avPlayer?.play();
          break;
        case 'playing':
          this.emit('stateChanged', true);
          break;
        case 'paused':
          this.emit('stateChanged', false);
          break;
        case 'completed':
          this.emit('playbackCompleted');
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
      this.emit('error', err);
    });

    // Time values in AVPlayer are in milliseconds; convert to seconds for consistent UI binding
    this.avPlayer.on('timeUpdate', (time: number) => {
      this.emit('timeUpdate', Math.floor(time / 1000));
    });

    this.avPlayer.on('durationUpdate', (duration: number) => {
      this.emit('durationUpdate', Math.floor(duration / 1000));
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
      this.avPlayer.url = url; // Setting URL triggers initialized state change
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

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
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
    this.listeners.clear();
  }
}
