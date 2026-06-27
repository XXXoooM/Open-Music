import { webview } from '@kit.ArkWeb';
import { window } from '@kit.ArkUI';
import { avSession } from '@kit.AVSessionKit';
import { abilityAccessCtrl, Permissions } from '@kit.AbilityKit';
import { backgroundTaskManager } from '@kit.BackgroundTaskKit';

@Entry
@Component
struct Index {
  private controller: webview.WebviewController = new webview.WebviewController();
  private avSessionObj: avSession.AVSession | null = null;
  private isPlaying: boolean = false;

  aboutToAppear() {
    this.initWindow();
    this.requestPermissions();
  }

  // Configure immersive status bar (clear background, light content colors)
  private async initWindow() {
    try {
      const win = await window.getLastWindow(getContext(this));
      await win.setWindowLayoutFullScreen(true);
      await win.setWindowSystemBarProperties({
        statusBarColor: '#00000000',
        statusBarContentColor: window.SystemBarContentColor.LIGHT
      });
    } catch (e) {
      console.error('Window initialization failed', e);
    }
  }

  // Request continuous background running permission
  private async requestPermissions() {
    const permissions: Permissions[] = [
      'ohos.permission.KEEP_BACKGROUND_RUNNING',
      'ohos.permission.BACKGROUND_CONTINUOUS_TASK'
    ];
    const atManager = abilityAccessCtrl.createAtManager();
    await atManager.requestPermissionsFromUser(getContext(this), permissions);
    this.initAVSession();
  }

  // Initialize System Audio AVSession & Continuous Task
  private async initAVSession() {
    try {
      this.avSessionObj = await avSession.createAVSession(getContext(this), 'music', 'OpenMusicSession');
      await this.avSessionObj.activate();

      // Listen to control actions from OS Lockscreen / Control Panel
      this.avSessionObj.on('play', () => {
        this.callWebMethod('window.player.play()');
        this.isPlaying = true;
        this.updatePlaybackState();
      });

      this.avSessionObj.on('pause', () => {
        this.callWebMethod('window.player.pause()');
        this.isPlaying = false;
        this.updatePlaybackState();
      });

      this.avSessionObj.on('skipToNext', () => {
        this.callWebMethod('window.player.next()');
      });

      this.avSessionObj.on('skipToPrevious', () => {
        this.callWebMethod('window.player.prev()');
      });

      // Keep running in the background for continuous audio playback
      await backgroundTaskManager.startBackgroundRunning(
        getContext(this),
        backgroundTaskManager.BackgroundMode.AUDIO_PLAYBACK,
        '正在播放音乐'
      );
    } catch (e) {
      console.error('AVSession initialization failed', e);
    }
  }

  // Call JavaScript function inside WebView
  private callWebMethod(jsCode: string) {
    this.controller.runJavaScript(jsCode);
  }

  // Sync song information to AVSession
  private updateMediaInfo(info: { title: string, artist: string, cover: string, duration: number }) {
    if (!this.avSessionObj) return;
    this.avSessionObj.setAVMetaData({
      title: info.title,
      artist: info.artist,
      album: 'Open Music',
      duration: info.duration
    });
  }

  // Sync playback state to AVSession
  private updatePlaybackState() {
    if (!this.avSessionObj) return;
    this.avSessionObj.setAVPlaybackState({
      state: this.isPlaying ? avSession.PlaybackState.PLAYING : avSession.PlaybackState.PAUSED
    });
  }

  aboutToDisappear() {
    if (this.avSessionObj) {
      this.avSessionObj.deactivate();
      this.avSessionObj.destroy();
    }
    backgroundTaskManager.stopBackgroundRunning(getContext(this));
  }

  build() {
    Column() {
      Web({ src: $rawfile('web/index.html'), controller: this.controller })
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .databaseAccess(true)
        .mediaPlayGestureAccess(false) // Allow audio to play without user gestures
        .backgroundColor('#121212')
        .width('100%')
        .height('100%')
        // Expose JavaScript proxy object
        .registerJavaScriptProxy({
          object: {
            updateMediaInfo: (infoStr: string) => {
              try {
                const info = JSON.parse(infoStr);
                this.updateMediaInfo(info);
              } catch (e) {
                console.error('Failed to parse MediaInfo JSON', e);
              }
            },
            updatePlayState: (playing: boolean) => {
              this.isPlaying = playing;
              this.updatePlaybackState();
            }
          },
          name: 'ohosNative',
          methodList: ['updateMediaInfo', 'updatePlayState']
        })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#121212')
  }
}
