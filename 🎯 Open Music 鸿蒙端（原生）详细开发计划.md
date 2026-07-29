# 🎯 Open Music 鸿蒙端（原生）详细开发计划

以下是一份**可直接落地执行**的鸿蒙原生开发计划，包含 API 版本选型、完整架构设计、核心模块开发逻辑以及流程图。

---

## 一、API 版本选型

### 1.1 版本选择建议

| 配置项                   | 推荐值                 | 说明                                           |
| ------------------------ | ---------------------- | ---------------------------------------------- |
| **compileSdkVersion**    | `14` (HarmonyOS 5.0.2) | 使用最新 API 获得完整功能                      |
| **targetSdkVersion**     | `14`                   | 目标运行版本，与 compileSdkVersion 保持一致    |
| **compatibleSdkVersion** | `12` (HarmonyOS 5.0.0) | 最低兼容 API 12，覆盖 HarmonyOS 5.0 及以上设备 |

### 1.2 各 API 版本关键差异

| API 版本   | HarmonyOS 版本  | 关键特性                                                     |
| ---------- | --------------- | ------------------------------------------------------------ |
| **API 12** | HarmonyOS 5.0.0 | AVPlayer 基础能力、AVSession 基础支持、ServiceExtensionAbility |
| **API 13** | HarmonyOS 5.0.1 | Bug 修复，API 无明显变化                                     |
| **API 14** | HarmonyOS 5.0.2 | 增强音频焦点处理、后台任务稳定性提升                         |

> **建议**：使用 `compatibleSdkVersion: 12, targetSdkVersion: 14`，既保证兼容性，又能使用最新 API 特性。

---

## 二、项目架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UI Layer (ArkUI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  PlayerPage  │  │  PlaylistPage│  │    SettingsPage          │ │
│  │ (播放主界面)  │  │  (歌单列表)   │  │  (设置/主题预设)         │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬──────────────┘ │
│         │                 │                       │                │
│         └─────────────────┼───────────────────────┘                │
│                           ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              ViewModel / State Management                   │  │
│  │   (@State, @Prop, @StorageLink, @Provide/@Consume)         │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Service Layer (后台服务)                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │         AudioPlaybackService (ServiceExtensionAbility)     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │  │
│  │  │  AVPlayer   │  │  AVSession  │  │ BackgroundTasks Kit │ │  │
│  │  │ (播放引擎)   │  │ (媒体会话)   │  │ (长时任务)           │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Data Layer (数据层)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  API Client  │  │   Storage    │  │   Playlist Manager       │ │
│  │ (网络请求)    │  │ (Preferences)│  │   (歌单管理)              │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 三、核心模块开发逻辑

### 3.1 模块一：AVPlayer 播放引擎（最核心）

AVPlayer 是鸿蒙系统级播放器，支持本地和网络音频播放。播放全流程包含：**创建实例 → 设置回调 → 设置资源 → 播放控制 → 重置/销毁**。

#### 状态机流转图

```
┌────────┐    createAVPlayer()    ┌─────────────┐
│  idle  │ ─────────────────────▶ │ initialized │
└────────┘                        └──────┬──────┘
     ▲                                    │
     │                                    │ prepare()
     │                                    ▼
     │                              ┌─────────────┐
     │                              │  prepared   │
     │                              └──────┬──────┘
     │                                    │ play()
     │                                    ▼
     │    reset()                   ┌─────────────┐
     └──────────────────────────────│   playing   │
                                    └──────┬──────┘
                                           │ pause()
                                           ▼
                                    ┌─────────────┐
                                    │   paused    │
                                    └──────┬──────┘
                                           │ play()
                                           ▼
                                    ┌─────────────┐
                                    │   playing   │
                                    └──────┬──────┘
                                           │ 播放完成
                                           ▼
                                    ┌─────────────┐
                                    │  completed  │
                                    └──────┬──────┘
                                           │ stop()
                                           ▼
                                    ┌─────────────┐
                                    │   stopped   │
                                    └──────┬──────┘
                                           │ reset()
                                           ▼
                                    ┌─────────────┐
                                    │    idle     │ ──▶ release() ──▶ released
                                    └─────────────┘
```



#### 完整实现代码

**文件**: `entry/src/main/ets/playback/AudioPlayer.ets`

```typescript
import { media } from '@kit.MediaKit';
import { audio } from '@kit.AudioKit';
import { BusinessError } from '@kit.BasicServicesKit';

export class AudioPlayer {
  private avPlayer: media.AVPlayer | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // 1. 创建实例
  async create(): Promise<void> {
    this.avPlayer = await media.createAVPlayer();
    this.setupCallbacks();
  }

  // 2. 设置回调监听（必须）
  private setupCallbacks(): void {
    if (!this.avPlayer) return;

    // 2.1 状态机变化回调（核心）
    this.avPlayer.on('stateChange', async (state: string, reason: media.StateChangeReason) => {
      console.info(`[AVPlayer] state: ${state}`);
      
      switch (state) {
        case 'initialized':
          // 设置播放源后触发 → 调用 prepare
          await this.avPlayer?.prepare();
          break;

        case 'prepared':
          // prepare 完成 → 设置音频焦点模式 → 开始播放
          if (this.avPlayer) {
            this.avPlayer.audioInterruptMode = audio.InterruptMode.SHARE_MODE;
          }
          await this.avPlayer?.play();
          this.emit('playbackStarted');
          break;

        case 'playing':
          this.emit('stateChanged', { isPlaying: true });
          break;

        case 'paused':
          this.emit('stateChanged', { isPlaying: false });
          break;

        case 'completed':
          // 播放结束 → 触发下一首
          this.emit('playbackCompleted');
          break;

        case 'stopped':
          await this.avPlayer?.reset();
          break;

        case 'idle':
          this.avPlayer?.release();
          this.avPlayer = null;
          break;
      }
    });

    // 2.2 错误回调（必须）
    this.avPlayer.on('error', (err: BusinessError) => {
      console.error(`[AVPlayer] Error: ${err.code} - ${err.message}`);
      this.avPlayer?.reset();
      this.emit('error', err);
    });

    // 2.3 进度更新回调（用于 UI 进度条）
    this.avPlayer.on('timeUpdate', (time: number) => {
      this.emit('timeUpdate', { currentTime: time });
    });

    // 2.4 时长更新回调
    this.avPlayer.on('durationUpdate', (duration: number) => {
      this.emit('durationUpdate', { duration });
    });

    // 2.5 Seek 完成回调
    this.avPlayer.on('seekDone', (seekTime: number) => {
      this.emit('seekDone', { seekTime });
    });
  }

  // 3. 设置播放源（网络音频）
  async setUrl(url: string): Promise<void> {
    if (!this.avPlayer) await this.create();
    if (this.avPlayer) {
      this.avPlayer.url = url;  // 赋值即触发 initialized 状态
    }
  }

  // 4. 播放控制
  async play(): Promise<void> {
    await this.avPlayer?.play();
  }

  async pause(): Promise<void> {
    await this.avPlayer?.pause();
  }

  async seek(time: number): Promise<void> {
    await this.avPlayer?.seek(time);
  }

  async stop(): Promise<void> {
    await this.avPlayer?.stop();
  }

  setVolume(volume: number): void {
    if (this.avPlayer) {
      this.avPlayer.setVolume(volume);
    }
  }

  getCurrentTime(): number {
    return this.avPlayer?.currentTime ?? 0;
  }

  getDuration(): number {
    return this.avPlayer?.duration ?? 0;
  }

  getState(): string {
    return this.avPlayer?.state ?? 'idle';
  }

  // 5. 事件订阅（供 UI 层使用）
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  // 6. 释放资源
  release(): void {
    this.avPlayer?.release();
    this.avPlayer = null;
  }
}
```

---

### 3.2 模块二：后台服务（ServiceExtensionAbility）

后台服务是应用退至后台后继续运行的关键。需要**同时满足两个条件**：申请长时任务 + 接入 AVSession。

#### 服务生命周期流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                    AudioPlaybackService                        │
├─────────────────────────────────────────────────────────────────┤
│  onCreate()                                                    │
│    ├── 初始化 AudioPlayer                                      │
│    ├── 初始化 AVSession                                        │
│    └── 创建通知渠道                                             │
├─────────────────────────────────────────────────────────────────┤
│  onStartCommand()                                              │
│    └── 返回 START_STICKY（被杀死后自动重启）                    │
├─────────────────────────────────────────────────────────────────┤
│  onBackground() → 申请长时任务（播放时）                        │
│  onForeground() → 取消长时任务（停止播放时）                    │
├─────────────────────────────────────────────────────────────────┤
│  onDestroy()                                                   │
│    ├── 释放 AVPlayer                                           │
│    ├── 注销 AVSession                                          │
│    └── 取消长时任务                                             │
└─────────────────────────────────────────────────────────────────┘
```

#### 完整实现代码

**文件**: `entry/src/main/ets/playback/AudioPlaybackService.ets`

```typescript
import { ServiceExtensionAbility } from '@kit.AbilityKit';
import { backgroundTaskManager } from '@kit.BackgroundTasksKit';
import { avSession as AVSessionManager } from '@kit.AVSessionKit';
import { notificationManager } from '@kit.NotificationKit';
import { AudioPlayer } from './AudioPlayer';
import { BusinessError } from '@kit.BasicServicesKit';

export default class AudioPlaybackService extends ServiceExtensionAbility {
  private audioPlayer: AudioPlayer = new AudioPlayer();
  private avSession: AVSessionManager.AVSession | null = null;
  private isBackgroundTaskActive: boolean = false;

  async onCreate() {
    console.info('[Service] onCreate');
    
    // 1. 初始化音频播放器
    await this.audioPlayer.create();
    
    // 2. 初始化 AVSession
    await this.initAVSession();
    
    // 3. 创建通知渠道
    this.createNotificationChannel();
  }

  // ========== AVSession 初始化 ==========
  private async initAVSession(): Promise<void> {
    try {
      // 创建 AVSession（类型为 audio）
      this.avSession = await AVSessionManager.createAVSession(
        this.context,
        'OpenMusic',
        'audio'  // 音频类型
      );
      
      // 设置元数据（歌曲信息）
      await this.avSession.setAVMetadata({
        title: 'Open Music',
        artist: '未知歌手',
        album: 'Open Music',
        duration: 0,
      });
      
      // 设置播放状态
      await this.avSession.setAVPlaybackState({
        state: AVSessionManager.PlaybackState.PAUSED,
        position: 0,
        speed: 1.0,
      });
      
      // 注册控制命令回调
      this.avSession.on('play', () => {
        console.info('[AVSession] play command');
        this.audioPlayer.play();
        this.updateAVSessionState(AVSessionManager.PlaybackState.PLAYING);
      });
      
      this.avSession.on('pause', () => {
        console.info('[AVSession] pause command');
        this.audioPlayer.pause();
        this.updateAVSessionState(AVSessionManager.PlaybackState.PAUSED);
      });
      
      this.avSession.on('next', () => {
        console.info('[AVSession] next command');
        // 触发下一首（通过事件通知 UI）
        this.audioPlayer.emit('nextTrack');
      });
      
      this.avSession.on('previous', () => {
        console.info('[AVSession] previous command');
        this.audioPlayer.emit('prevTrack');
      });
      
      this.avSession.on('seek', (time: number) => {
        console.info(`[AVSession] seek to ${time}`);
        this.audioPlayer.seek(time);
        this.updateAVSessionPosition(time);
      });
      
      // 激活会话
      await this.avSession.activate();
      console.info('[AVSession] activated');
      
    } catch (err) {
      const error = err as BusinessError;
      console.error(`[AVSession] init failed: ${error.code} - ${error.message}`);
    }
  }

  // 更新 AVSession 播放状态
  private async updateAVSessionState(state: AVSessionManager.PlaybackState): Promise<void> {
    try {
      await this.avSession?.setAVPlaybackState({
        state: state,
        position: this.audioPlayer.getCurrentTime(),
        speed: 1.0,
      });
    } catch (err) {
      console.error('[AVSession] update state failed:', err);
    }
  }

  // 更新 AVSession 播放位置
  private async updateAVSessionPosition(position: number): Promise<void> {
    try {
      const currentState = await this.avSession?.getAVPlaybackState();
      await this.avSession?.setAVPlaybackState({
        state: currentState?.state || AVSessionManager.PlaybackState.PAUSED,
        position: position,
        speed: 1.0,
      });
    } catch (err) {
      console.error('[AVSession] update position failed:', err);
    }
  }

  // 更新歌曲元数据（切歌时调用）
  async updateMetadata(title: string, artist: string, coverUrl?: string): Promise<void> {
    try {
      await this.avSession?.setAVMetadata({
        title: title,
        artist: artist,
        album: 'Open Music',
        // 封面图可通过 coverUrl 加载后设置
      });
    } catch (err) {
      console.error('[AVSession] update metadata failed:', err);
    }
  }

  // ========== 长时任务（后台播放）==========
  private async startBackgroundTask(): Promise<void> {
    if (this.isBackgroundTaskActive) return;
    
    try {
      // 申请长时任务，类型为 AUDIO_PLAYBACK
      await backgroundTaskManager.startBackgroundRunning(
        this.context,
        backgroundTaskManager.BackgroundMode.AUDIO_PLAYBACK,
        // 通知内容（系统会在通知栏显示）
        {
          title: 'Open Music',
          text: '正在播放音乐',
        }
      );
      this.isBackgroundTaskActive = true;
      console.info('[BackgroundTask] started');
    } catch (err) {
      const error = err as BusinessError;
      console.error(`[BackgroundTask] start failed: ${error.code} - ${error.message}`);
    }
  }

  private async stopBackgroundTask(): Promise<void> {
    if (!this.isBackgroundTaskActive) return;
    
    try {
      await backgroundTaskManager.stopBackgroundRunning(this.context);
      this.isBackgroundTaskActive = false;
      console.info('[BackgroundTask] stopped');
    } catch (err) {
      console.error('[BackgroundTask] stop failed:', err);
    }
  }

  // ========== 通知渠道 ==========
  private createNotificationChannel(): void {
    // 创建通知渠道（Android 类似）
    // 鸿蒙使用 NotificationManager 创建渠道
  }

  // ========== 生命周期 ==========
  async onStartCommand(intent: any, flags: number, startId: number): Promise<void> {
    console.info('[Service] onStartCommand');
    // 返回 START_STICKY 确保服务被杀死后自动重启
  }

  // 应用退到后台时调用
  async onBackground(): Promise<void> {
    console.info('[Service] onBackground');
    // 如果正在播放，申请长时任务
    if (this.audioPlayer.getState() === 'playing') {
      await this.startBackgroundTask();
    }
  }

  // 应用回到前台时调用
  async onForeground(): Promise<void> {
    console.info('[Service] onForeground');
    // 取消长时任务（前台不需要）
    await this.stopBackgroundTask();
  }

  async onDestroy(): Promise<void> {
    console.info('[Service] onDestroy');
    await this.stopBackgroundTask();
    this.audioPlayer.release();
    this.avSession?.deactivate();
    this.avSession?.destroy();
    super.onDestroy();
  }
}
```

---

### 3.3 模块三：UI 页面开发（ArkUI）

#### 播放主界面布局

```typescript
// entry/src/main/ets/pages/PlayerPage.ets
import { AudioPlayer } from '../playback/AudioPlayer';
import { router } from '@kit.AbilityKit';

@Entry
@Component
struct PlayerPage {
  @State currentTime: number = 0;
  @State duration: number = 0;
  @State isPlaying: boolean = false;
  @State currentTrack: Track = { title: '加载中...', artist: '请稍候', cover: '' };
  @State accentColor: string = '#00E5FF';
  private audioPlayer: AudioPlayer = new AudioPlayer();

  aboutToAppear() {
    // 绑定播放器事件
    this.audioPlayer.on('timeUpdate', (data: { currentTime: number }) => {
      this.currentTime = data.currentTime;
    });
    this.audioPlayer.on('durationUpdate', (data: { duration: number }) => {
      this.duration = data.duration;
    });
    this.audioPlayer.on('stateChanged', (data: { isPlaying: boolean }) => {
      this.isPlaying = data.isPlaying;
    });
  }

  build() {
    Column() {
      // 1. 顶部标题栏
      this.buildHeader()
      
      // 2. 黑胶唱片区域
      this.buildVinylDisc()
      
      // 3. 歌曲信息
      this.buildSongInfo()
      
      // 4. 进度条
      this.buildProgressBar()
      
      // 5. 控制按钮
      this.buildControls()
      
      // 6. 音量控制
      this.buildVolumeControl()
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#0A0B10')
  }

  @Builder
  buildVinylDisc() {
    Stack() {
      // 黑胶唱片
      Image($r('app.media.vinyl_disc'))
        .width(250)
        .height(250)
        .borderRadius(125)
        .rotate({ angle: this.isPlaying ? this.rotationAngle : 0 })
        .animation({ duration: 20000, curve: Curve.Linear, iterations: -1 })
      
      // 专辑封面（居中）
      Image(this.currentTrack.cover || $r('app.media.default_cover'))
        .width(140)
        .height(140)
        .borderRadius(70)
        .objectFit(ImageFit.Cover)
    }
    .width('100%')
    .height(280)
    .margin({ top: 20 })
  }

  @Builder
  buildProgressBar() {
    Row() {
      Text(this.formatTime(this.currentTime))
        .fontSize(12)
        .fontColor('#999')
      
      Slider({
        value: this.currentTime,
        min: 0,
        max: this.duration || 1,
        step: 1
      })
        .layoutWeight(1)
        .trackColor('#333')
        .trackThickness(4)
        .selectedColor(this.accentColor)
        .blockColor(this.accentColor)
        .onChange((value: number) => {
          this.audioPlayer.seek(value);
        })
      
      Text(this.formatTime(this.duration))
        .fontSize(12)
        .fontColor('#999')
    }
    .width('90%')
    .margin({ top: 10 })
  }

  @Builder
  buildControls() {
    Row() {
      // 上一首
      this.buildControlButton($r('app.media.ic_prev'), () => {
        this.audioPlayer.emit('prevTrack');
      })
      
      // 播放/暂停（核心按钮）
      Button() {
        Image(this.isPlaying ? $r('app.media.ic_pause') : $r('app.media.ic_play'))
          .width(30)
          .height(30)
          .fillColor('#000')
      }
      .width(68)
      .height(68)
      .borderRadius(34)
      .backgroundColor('#FFFFFF')
      .onClick(() => {
        if (this.isPlaying) {
          this.audioPlayer.pause();
        } else {
          this.audioPlayer.play();
        }
      })
      .margin({ left: 20, right: 20 })
      
      // 下一首
      this.buildControlButton($r('app.media.ic_next'), () => {
        this.audioPlayer.emit('nextTrack');
      })
    }
    .width('100%')
    .justifyContent(FlexAlign.Center)
    .margin({ top: 20 })
  }

  @Builder
  buildControlButton(icon: Resource, action: () => void) {
    Image(icon)
      .width(36)
      .height(36)
      .fillColor('#CCCCCC')
      .onClick(action)
  }

  // 工具方法
  private formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
}
```

---

### 3.4 模块四：动态主题色（HSL）

与 Web/Android 端保持完全一致的算法，无动画、哈希直接取模。

```typescript
// entry/src/main/ets/utils/ThemeHelper.ets

// 计算色相（与 Web/Android 完全一致）
export function getSongHashColor(title: string, artist: string): number {
  let hash = 0;
  const str = title + artist;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;  // 直接取模，无累加
}

// HSL → Color 转换
export function hslToColor(hue: number, saturation: number, lightness: number): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// 生成完整调色板
export interface HslPalette {
  background: string;
  primary: string;
  surface: string;
  textMain: string;
  textMuted: string;
  textInactive: string;
  softAccent: string;
}

export function generatePalette(hue: number): HslPalette {
  return {
    background: `hsl(${hue}, 18%, 4%)`,
    primary: `hsl(${hue}, 92%, 68%)`,
    surface: `hsl(${hue}, 15%, 10%)`,
    textMain: `hsl(${hue}, 8%, 96%)`,
    textMuted: `hsl(${hue}, 6%, 62%)`,
    textInactive: `hsl(${hue}, 4%, 38%)`,
    softAccent: `hsl(${hue}, 40%, 20%)`,
  };
}
```

---

## 四、完整开发流程图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         第一阶段：环境搭建（0.5天）                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. 安装 DevEco Studio                                                      │
│  2. 创建 Empty Ability 项目                                                │
│  3. 配置 module.json5: compatibleSdkVersion: 12, targetSdkVersion: 14     │
│  4. 申请权限: ohos.permission.KEEP_BACKGROUND_RUNNING                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      第二阶段：核心播放器（2-3天）                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. 创建 AudioPlayer 类（封装 AVPlayer）                                   │
│     ├── createAVPlayer() → 创建实例                                        │
│     ├── setupCallbacks() → 注册状态机/错误/进度回调                        │
│     ├── setUrl() → 设置播放源，触发 initialized                            │
│     ├── play/pause/seek/stop/setVolume → 播放控制                          │
│     └── 状态机: idle → initialized → prepared → playing → paused → ...    │
│  2. 单元测试：播放本地/网络音频                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      第三阶段：后台服务（1-2天）                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. 创建 AudioPlaybackService (ServiceExtensionAbility)                   │
│     ├── onCreate(): 初始化 AudioPlayer + AVSession + 通知渠道              │
│     ├── onBackground(): startBackgroundRunning(AUDIO_PLAYBACK)            │
│     ├── onForeground(): stopBackgroundRunning()                           │
│     └── onDestroy(): 释放所有资源                                          │
│  2. AVSession 集成                                                         │
│     ├── createAVSession('audio') → 创建会话                               │
│     ├── setAVMetadata(title, artist, duration) → 设置歌曲信息              │
│     ├── setAVPlaybackState(playing/paused) → 同步播放状态                  │
│     └── on('play'/'pause'/'next'/'seek') → 注册控制命令                    │
│  3. 声明 service: module.json5 中添加 ServiceExtensionAbility              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        第四阶段：UI开发（2-3天）                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. PlayerPage（播放主界面）                                               │
│     ├── 黑胶唱片 + 专辑封面 (旋转动画)                                     │
│     ├── 歌曲信息 (标题/歌手)                                               │
│     ├── 进度条 (Slider + timeUpdate 事件绑定)                              │
│     ├── 控制按钮 (播放/暂停/上一首/下一首)                                 │
│     └── 音量控制                                                           │
│  2. PlaylistPage（歌单列表）                                               │
│     ├── List + ListItem 渲染歌单                                           │
│     ├── 搜索过滤                                                           │
│     └── 当前播放高亮 + 微均衡器动画                                        │
│  3. SettingsPage（设置页面）                                               │
│     ├── HSL 开关                                                           │
│     └── 主题预设色块网格 (5列)                                             │
│  4. 动态主题色集成                                                         │
│     └── 切歌时计算色相 → 更新全局主题色                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      第五阶段：数据层（1天）                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. API Client（网络请求）                                                 │
│     ├── 使用 @ohos/axios 或 http 模块                                     │
│     ├── 支持多 API 源故障转移 (qijieya / mikus)                            │
│     └── 请求歌单/歌词/封面/音频URL                                         │
│  2. Storage（数据持久化）                                                  │
│     ├── Preferences: 歌单ID、音量、播放模式、主题预设                      │
│     └── 歌单数据缓存 (可选)                                                │
│  3. Playlist Manager                                                       │
│     ├── 歌单加载/切换                                                      │
│     ├── 歌曲搜索过滤                                                       │
│     └── 播放历史                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        第六阶段：测试（贯穿全程）                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. 模拟器测试: UI 布局、播放控制、主题切换                                │
│  2. 真机测试: 后台播放、锁屏控制、通知栏媒体控制                           │
│  3. 异常场景: 网络断开、音频加载失败、后台被系统回收                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 五、关键配置清单

### 5.1 `module.json5` 核心配置

```json
{
  "module": {
    "name": "entry",
    "type": "entry",
    "srcEntry": "./ets/entryability/EntryAbility.ets",
    "description": "$string:module_desc",
    "mainElement": "EntryAbility",
    "deviceTypes": ["phone", "tablet"],
    "deliveryWithInstall": true,
    "installationFree": false,
    "pages": "$profile:main_pages",
    
    // ========== 权限配置 ==========
    "requestPermissions": [
      {
        "name": "ohos.permission.INTERNET",
        "reason": "$string:internet_reason",
        "usedScene": {
          "abilities": ["EntryAbility"],
          "when": "inuse"
        }
      },
      {
        "name": "ohos.permission.KEEP_BACKGROUND_RUNNING",
        "reason": "$string:background_task_reason",
        "usedScene": {
          "abilities": ["AudioPlaybackService"],
          "when": "always"
        }
      }
    ],
    
    // ========== Ability 配置 ==========
    "abilities": [
      {
        "name": "EntryAbility",
        "srcEntry": "./ets/entryability/EntryAbility.ets",
        "description": "$string:EntryAbility_desc",
        "icon": "$media:app_icon",
        "label": "$string:EntryAbility_label",
        "startWindowIcon": "$media:startIcon",
        "startWindowBackground": "$color:start_window_background",
        "exported": true,
        "skills": [
          {
            "entities": ["entity.system.home"],
            "actions": ["action.system.home"]
          }
        ]
      }
    ],
    
    // ========== ServiceExtensionAbility 配置 ==========
    "extensionAbilities": [
      {
        "name": "AudioPlaybackService",
        "srcEntry": "./ets/playback/AudioPlaybackService.ets",
        "description": "$string:AudioPlaybackService_desc",
        "icon": "$media:app_icon",
        "label": "$string:AudioPlaybackService_label",
        "type": "service",
        "exported": false
      }
    ]
  }
}
```

### 5.2 图标配置规范

鸿蒙应用图标必须分为**前景图**和**背景图**两层，尺寸必须为 **1024×1024px**。

| 配置项     | 要求                         |
| ---------- | ---------------------------- |
| **尺寸**   | 1024×1024px                  |
| **格式**   | PNG（推荐）                  |
| **分层**   | 必须分前景层和背景层         |
| **圆角**   | 不允许自行裁剪，系统自动处理 |
| **内间距** | 不允许添加                   |

在 DevEco Studio 中通过 `右键项目 → New → Image Asset` 生成多分辨率图标。

---

## 六、常见问题与解决方案

| 问题                  | 原因                                   | 解决方案                                                     |
| --------------------- | -------------------------------------- | ------------------------------------------------------------ |
| **后台播放被暂停**    | 未申请长时任务                         | 添加 `KEEP_BACKGROUND_RUNNING` 权限，播放时调用 `startBackgroundRunning` |
| **锁屏不显示控制**    | 未接入 AVSession                       | 创建 AVSession 并 `activate()`                               |
| **通知栏曲目不更新**  | 切歌时未更新 AVMetadata                | 调用 `setAVMetadata()` 更新                                  |
| **播控按钮无响应**    | 未注册控制命令回调                     | 注册 `on('play')`、`on('pause')` 等事件                      |
| **AVPlayer 状态异常** | 未正确处理状态机                       | 严格按照 `idle→initialized→prepared→playing` 流程            |
| **应用被系统杀死**    | `onStartCommand` 未返回 `START_STICKY` | 返回 `START_STICKY` 确保自动重启                             |

---

## 七、参考资源

| 模块             | 推荐文档                                                     |
| ---------------- | ------------------------------------------------------------ |
| **AVPlayer**     | [使用AVPlayer播放音频](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/using-avplayer-for-playback-V5) |
| **AVSession**    | [应用接入AVSession场景介绍](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/avsession-access-scene-V5) |
| **长时任务**     | [长时任务开发指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V14/continuous-task-V14) |
| **音乐应用示例** | [一多开发实例（音乐）](https://developer.huawei.com/consumer/cn/doc/best-practices-V14/multi-music-app-overview-V14) |
| **开源参考**     | [ChiikaMusic-HarmonyOS](https://github.com/RoxyXu151/ChiikaMusic-HarmonyOS-ArkUI) |

---

这份计划涵盖了从环境搭建到上线的完整流程，按此推进预计 **1-2 周**可完成鸿蒙端开发。如有具体模块需要进一步展开，随时可以深入讨论。