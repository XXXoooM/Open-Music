import { avSession as AVSessionManager } from '@kit.AVSessionKit';
import { backgroundTaskManager } from '@kit.BackgroundTasksKit';
import { wantAgent } from '@kit.AbilityKit';
import { common } from '@kit.AbilityKit';
import { AudioPlayer } from './AudioPlayer';
import { Track } from '../model/Track';
import { getSongHashColor } from '../utils/ThemeHelper';
import { PreferencesHelper } from '../utils/PreferencesHelper';

export class PlaybackManager {
  private static instance: PlaybackManager | null = null;
  private audioPlayer: AudioPlayer = new AudioPlayer();
  private avSession: AVSessionManager.AVSession | null = null;
  private context: common.Context | null = null;
  private isBackgroundTaskActive: boolean = false;
  private trackIndex: number = 0;

  private constructor() {}

  static getInstance(): PlaybackManager {
    if (!PlaybackManager.instance) {
      PlaybackManager.instance = new PlaybackManager();
    }
    return PlaybackManager.instance;
  }

  // Initialize playback system, load preference states, and setup AVSession
  async init(context: common.Context): Promise<void> {
    if (this.context) return;
    this.context = context;

    // 1. Init Preferences KV store
    await PreferencesHelper.getInstance().init(context);

    // 2. Setup Audio Player
    await this.audioPlayer.create();

    // 3. Init AVSession & register hardware/system control callbacks
    await this.initAVSession();

    // 4. Setup AudioPlayer event connections
    this.setupPlayerEvents();

    // 5. Restore last play session from Preferences
    await this.restoreSession();
  }

  private async initAVSession(): Promise<void> {
    if (!this.context) return;
    try {
      this.avSession = await AVSessionManager.createAVSession(this.context, 'OpenMusic', 'audio');

      // Bind media controls from system notification & lockscreen
      this.avSession.on('play', () => {
        console.info('[AVSession] OnPlay received');
        this.play();
      });

      this.avSession.on('pause', () => {
        console.info('[AVSession] OnPause received');
        this.pause();
      });

      this.avSession.on('playNext', () => {
        console.info('[AVSession] OnPlayNext received');
        this.playNext();
      });

      this.avSession.on('playPrevious', () => {
        console.info('[AVSession] OnPlayPrevious received');
        this.playPrevious();
      });

      this.avSession.on('seek', (positionMs: number) => {
        console.info(`[AVSession] OnSeek received: ${positionMs}ms`);
        this.seek(Math.floor(positionMs / 1000));
      });

      await this.avSession.activate();
      console.info('[AVSession] Activated successfully');
    } catch (e) {
      console.error('[PlaybackManager] Failed to init AVSession', JSON.stringify(e));
    }
  }

  private setupPlayerEvents(): void {
    // 1. Play state changes
    this.audioPlayer.onStateChanged(async (isPlaying: boolean) => {
      AppStorage.setOrCreate('isPlaying', isPlaying);
      if (isPlaying) {
        await this.startBackgroundTask();
        this.updateAVSessionState(AVSessionManager.PlaybackState.PLAYBACK_STATE_PLAY);
      } else {
        this.updateAVSessionState(AVSessionManager.PlaybackState.PLAYBACK_STATE_PAUSE);
      }
    });

    // 2. Play progress changes
    this.audioPlayer.onTimeUpdate((timeInSeconds: number) => {
      AppStorage.setOrCreate('currentTime', timeInSeconds);
      this.updateAVSessionPosition(timeInSeconds * 1000);
    });

    // 3. Audio duration updates
    this.audioPlayer.onDurationUpdate((durationInSeconds: number) => {
      AppStorage.setOrCreate('duration', durationInSeconds);
      
      const track = AppStorage.get<Track>('currentTrack');
      if (track) {
        track.duration = durationInSeconds;
        AppStorage.setOrCreate('currentTrack', track);
        this.updateAVSessionMetadata(track);
      }
    });

    // 4. Playback auto-completed -> next song
    this.audioPlayer.onPlaybackCompleted(() => {
      console.info('[PlaybackManager] Track completed, auto skipping...');
      const mode = AppStorage.get<string>('playMode') || 'list';
      if (mode === 'single') {
        const track = AppStorage.get<Track>('currentTrack');
        if (track) {
          this.playTrack(track);
        }
      } else {
        this.playNext();
      }
    });
  }

  private async restoreSession(): Promise<void> {
    const savedMode = await PreferencesHelper.getInstance().getString('om-playmode', 'list');
    AppStorage.setOrCreate('playMode', savedMode);

    const cachedPlaylistStr = await PreferencesHelper.getInstance().getString('om-cachedplaylist', '[]');
    try {
      const playlist = JSON.parse(cachedPlaylistStr) as Track[];
      if (playlist && playlist.length > 0) {
        AppStorage.setOrCreate('playlist', playlist);
        const lastIdx = await PreferencesHelper.getInstance().getNumber('om-trackindex', 0);
        this.trackIndex = lastIdx >= 0 && lastIdx < playlist.length ? lastIdx : 0;
        AppStorage.setOrCreate('currentTrack', playlist[this.trackIndex]);
      }
    } catch (e) {
      console.error('[PlaybackManager] Failed to restore playlist cache', JSON.stringify(e));
    }
  }

  // Set current playlist and start playing a track
  async setPlaylist(tracks: Track[], startIndex: number = 0): Promise<void> {
    if (!tracks || tracks.length === 0) return;
    this.trackIndex = startIndex >= 0 && startIndex < tracks.length ? startIndex : 0;
    
    AppStorage.setOrCreate('playlist', tracks);
    await PreferencesHelper.getInstance().putString('om-cachedplaylist', JSON.stringify(tracks));
    
    const track = tracks[this.trackIndex];
    await this.playTrack(track);
  }

  // Load and play a specific track
  async playTrack(track: Track): Promise<void> {
    if (!track) return;
    
    // 1. Set values in AppStorage
    AppStorage.setOrCreate('currentTrack', track);
    
    // 2. Set HSL Theme Hue dynamically from the song details
    const hue = getSongHashColor(track.title, track.artist);
    AppStorage.setOrCreate('themeHue', hue);

    // 3. Update index preference
    await PreferencesHelper.getInstance().putNumber('om-trackindex', this.trackIndex);

    // 4. Update AVSession details
    await this.updateAVSessionMetadata(track);

    // 5. Send play command to AVPlayer
    await this.audioPlayer.setUrl(track.url);
  }

  async play(): Promise<void> {
    await this.audioPlayer.play();
  }

  async pause(): Promise<void> {
    await this.audioPlayer.pause();
    await this.stopBackgroundTask();
  }

  async seek(seconds: number): Promise<void> {
    await this.audioPlayer.seek(seconds);
  }

  setVolume(volume: number): void {
    this.audioPlayer.setVolume(volume);
  }

  async playNext(): Promise<void> {
    const playlist = AppStorage.get<Track[]>('playlist') || [];
    if (playlist.length === 0) return;

    const mode = AppStorage.get<string>('playMode') || 'list';
    if (mode === 'random') {
      this.trackIndex = Math.floor(Math.random() * playlist.length);
    } else {
      this.trackIndex = (this.trackIndex + 1) % playlist.length;
    }

    const nextTrack = playlist[this.trackIndex];
    await this.playTrack(nextTrack);
  }

  async playPrevious(): Promise<void> {
    const playlist = AppStorage.get<Track[]>('playlist') || [];
    if (playlist.length === 0) return;

    const mode = AppStorage.get<string>('playMode') || 'list';
    if (mode === 'random') {
      this.trackIndex = Math.floor(Math.random() * playlist.length);
    } else {
      this.trackIndex = (this.trackIndex - 1 + playlist.length) % playlist.length;
    }

    const prevTrack = playlist[this.trackIndex];
    await this.playTrack(prevTrack);
  }

  async setPlayMode(mode: 'list' | 'single' | 'random'): Promise<void> {
    AppStorage.setOrCreate('playMode', mode);
    await PreferencesHelper.getInstance().putString('om-playmode', mode);
  }

  // ========== System Background Task Management ==========
  private async startBackgroundTask(): Promise<void> {
    if (this.isBackgroundTaskActive || !this.context) return;

    try {
      const info: wantAgent.WantAgentInfo = {
        wants: [{ bundleName: this.context.applicationInfo.name, abilityName: 'EntryAbility' }],
        actionType: wantAgent.OperationType.START_ABILITY,
        requestCode: 0,
        actionFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG]
      };
      
      const agent = await wantAgent.getWantAgent(info);
      await backgroundTaskManager.startBackgroundRunning(
        this.context,
        backgroundTaskManager.BackgroundMode.AUDIO_PLAYBACK,
        agent
      );
      this.isBackgroundTaskActive = true;
      console.info('[PlaybackManager] Background task registered successfully');
    } catch (e) {
      console.error('[PlaybackManager] Failed to register background task', JSON.stringify(e));
    }
  }

  private async stopBackgroundTask(): Promise<void> {
    if (!this.isBackgroundTaskActive || !this.context) return;
    try {
      await backgroundTaskManager.stopBackgroundRunning(this.context);
      this.isBackgroundTaskActive = false;
      console.info('[PlaybackManager] Background task stopped');
    } catch (e) {
      console.error('[PlaybackManager] Failed to stop background task', JSON.stringify(e));
    }
  }

  // ========== AVSession State Synchronizers ==========
  private async updateAVSessionMetadata(track: Track): Promise<void> {
    if (!this.avSession) return;
    try {
      await this.avSession.setAVMetadata({
        assetId: track.id,
        title: track.title,
        artist: track.artist,
        mediaImage: track.cover,
        duration: track.duration * 1000 // In milliseconds
      });
    } catch (e) {
      console.error('[PlaybackManager] Failed to update AVSession metadata', JSON.stringify(e));
    }
  }

  private async updateAVSessionState(state: AVSessionManager.PlaybackState): Promise<void> {
    if (!this.avSession) return;
    try {
      await this.avSession.setAVPlaybackState({
        state: state,
        speed: 1.0
      });
    } catch (e) {
      console.error('[PlaybackManager] Failed to update AVSession state', JSON.stringify(e));
    }
  }

  private async updateAVSessionPosition(positionMs: number): Promise<void> {
    if (!this.avSession) return;
    try {
      await this.avSession.setAVPlaybackState({
        position: {
          elapsedTime: positionMs,
          updateTime: Date.now()
        }
      });
    } catch (e) {
      // ignore rapid updates failure log spam
    }
  }

  // Clean up all hooks and terminate AVSession on application exit
  async release(): Promise<void> {
    await this.stopBackgroundTask();
    this.audioPlayer.release();
    if (this.avSession) {
      await this.avSession.deactivate();
      await this.avSession.destroy();
      this.avSession = null;
    }
    this.context = null;
  }
}
