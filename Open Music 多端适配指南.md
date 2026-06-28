# Open Music 多端适配指南

# Open Music 多端适配指南：Android、iOS、桌面端（后台播放与状态栏控制）

## 一、概述

> 🎯 **本指南目标**：将 Open Music 从纯 Web 播放器升级为跨平台原生体验应用，重点解决 **后台播放** 和 **状态栏控制**。

### 1\.1 核心思路

前端 UI 完全复用，播放引擎下沉至原生层，通过桥接调用原生播放器：

- Android 用 ExoPlayer

- iOS 用 AVPlayer

- 桌面端用系统 API

### 1\.2 适用范围

- ✅ Android 端（重点实现）

- ✅ 桌面端（Windows/macOS）

- ⏳ iOS 端（可延后，架构预留）

- ⏳ 鸿蒙端（后续用 ArkUI 原生重构，本指南不涉及）

---

## 二、整体架构设计

### 2\.1 架构图

```Plaintext
Open Music 前端 UI
    (HTML / CSS / JS，完全复用现有代码)
              |
              v
    统一播放控制接口（Bridge）
  play() / pause() / seek() / setVolume() / getDuration()
     注册媒体信息（title, artist, cover）
              |
      +-------+-------+
      |       |       |
      v       v       v
  Android    iOS    桌面端（Tauri）
 ExoPlayer  AVPlayer  System Media Controls
 + Service  + Background + 系统托盘 / 快捷键
 + MediaSession + MPRemote
```

### 2\.2 架构分层说明

|层级|职责|技术实现|
|---|---|---|
|**前端层**|保持现有 app\.js 逻辑，移除对 new Audio\(\) 的直接操作，改为调用 window\.NativeBridge\.player 接口|HTML/CSS/JavaScript|
|**桥接层**|定义统一播放控制接口，屏蔽平台差异|native\-bridge\.js|
|**原生层**|各平台实现具体的播放器并暴露统一接口|Android/iOS: Capacitor 插件；桌面端: Tauri invoke|

### 2\.3 通信方式

- **Android/iOS**：通过 Capacitor 插件（自定义或使用社区插件）

- **桌面端**：通过 Tauri 的 invoke 调用 Rust 后端

---

## 三、工具链选择

|平台|打包框架|播放器实现|后台播放方案|
|---|---|---|---|
|Android|Capacitor 5\+|自定义插件，内部使用 ExoPlayer|Foreground Service \+ MediaSession|
|iOS|Capacitor 5\+|自定义插件，内部使用 AVPlayer|UIBackgroundModes \+ MPNowPlayingInfo|
|桌面端|Tauri 2\.0|Rust 调用系统 API（Windows/macOS）|系统媒体控件（无需特殊后台）|

> 💡 **为什么使用 ExoPlayer？**

> 它是 Android 官方推荐的高性能播放器，完美支持 HLS、DASH、后台音频和 MediaSession 集成。若用 HTML5 Audio，后台行为不稳定且难以控制缓冲区。

---

## 四、具体实施步骤

### 4\.1 创建 Capacitor 项目（移动端）

#### 4\.1\.1 初始化项目

```Bash
npm install @capacitor/core @capacitor/cli
npx cap init OpenMusic com.yourcompany.openmusic
npm install @capacitor/status-bar @capacitor/app
```

#### 4\.1\.2 状态栏控制

直接使用 Capacitor StatusBar 插件，无需额外开发。

```JavaScript
import { StatusBar } from '@capacitor/status-bar';

// 设置状态栏样式
StatusBar.setStyle({ style: 'dark' });

// 全屏沉浸模式（可选）
StatusBar.setOverlaysWebView({ overlay: true });
```

### 4\.2 Android 端：ExoPlayer 插件开发

#### 4\.2\.1 创建自定义插件

```Bash
npx cap plugin generate com.yourcompany.player
```

将插件命名为 `AudioPlayer`，插件结构如下：

```Plaintext
android/src/main/java/com/yourcompany/player/AudioPlayerPlugin.java
```

#### 4\.2\.2 核心代码（ExoPlayer \+ 前台服务）

**依赖（build\.gradle）：**

```Plaintext
implementation 'com.google.android.exoplayer:exoplayer:2.19.1'
implementation 'androidx.media:media:1.6.0'
```

**插件主类（节选）：**

```Java
public class AudioPlayerPlugin extends Plugin {
    private ExoPlayer player;
    private MediaSessionCompat mediaSession;
    private ServiceConnection serviceConnection;

    @PluginMethod
    public void play(PluginCall call) {
        String url = call.getString("url");
        
        // 启动前台服务
        startForegroundService();
        
        // 初始化 ExoPlayer
        if (player == null) {
            player = new ExoPlayer.Builder(getContext()).build();
            
            // 设置 MediaSource
            MediaItem mediaItem = MediaItem.fromUri(url);
            player.setMediaItem(mediaItem);
            player.prepare();
            
            // 绑定 MediaSession
            mediaSession = new MediaSessionCompat(getContext(), "OpenMusic");
            mediaSession.setCallback(new MediaSessionCompat.Callback() {
                @Override
                public void onPlay() { player.play(); }
                
                @Override
                public void onPause() { player.pause(); }
                
                @Override
                public void onStop() { player.stop(); }
                // ...
            });
            mediaSession.setActive(true);
            player.setMediaSession(mediaSession);
        }
        
        player.play();
        call.resolve();
    }

    private void startForegroundService() {
        Intent serviceIntent = new Intent(getContext(), AudioService.class);
        getContext().startForegroundService(serviceIntent);
    }
    
    // 其他方法: pause, seek, setVolume, getCurrentPosition, getDuration...
}
```

#### 4\.2\.3 前台服务（AudioService\.java）

```Java
public class AudioService extends Service {
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // 创建通知渠道（Android 8+）
        NotificationChannel channel = new NotificationChannel("audio", "Audio", NotificationManager.IMPORTANCE_LOW);
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        manager.createNotificationChannel(channel);
        
        Notification notification = new NotificationCompat.Builder(this, "audio")
                .setContentTitle("Open Music")
                .setContentText("Playing music")
                .setSmallIcon(R.drawable.ic_music_note)
                .build();
        
        startForeground(1, notification);
        return START_STICKY;
    }
    // ...
}
```

#### 4\.2\.4 插件注册

在 `MainActivity` 中注册插件，或在 `capacitor.config.json` 中声明。

### 4\.3 iOS 端：AVPlayer 插件（可延后）

> ⏳ 若暂缓开发，可先跳过，但架构预留。

需实现：

- AVPlayer 初始化及控制

- MPNowPlayingInfoCenter 处理远程控制

- UIApplication 后台音频设置（Info\.plist 添加 UIBackgroundModes → audio）

代码模式与 Android 类似，使用 Swift 编写。

### 4\.4 桌面端：Tauri \+ 系统媒体控制

#### 4\.4\.1 初始化 Tauri

```Bash
npm install --save-dev @tauri-apps/cli
npx tauri init
```

#### 4\.4\.2 Rust 后端播放器（使用系统 API）

在 `src-tauri/src/main.rs` 中使用 `tauri::Manager` 和系统库：

- **Windows**：使用 `windows-rs` 调用 `Windows.Media.Playback` 命名空间

- **macOS**：使用 `mpnowplaying` 相关框架（通过 `objc` 或 `mediaplayer` crate）

> 💡 **简化方案**：仍可借助 Web Audio，但集成系统媒体控件需要额外 Rust 代码。

**实现媒体控件同步（以 Windows 为例）：**

```Rust
use windows::Media::Playback::MediaPlayer;
use windows::Media::Playback::MediaPlaybackItem;
use windows::Foundation::Uri;

#[tauri::command]
fn play(url: String) {
    let player = MediaPlayer::new().unwrap();
    let uri = Uri::CreateUri(&url).unwrap();
    let item = MediaPlaybackItem::Create(uri).unwrap();
    player.Source(&item).unwrap();
    player.Play().unwrap();
    
    // 设置 SystemMediaTransportControls 的元数据
}
```

#### 4\.4\.3 前端调用 Tauri 命令

在 `app.js` 中通过 `invoke` 调用 Rust 函数：

```JavaScript
const { invoke } = window.__TAURI__;

await invoke('play', { url: track.url });
```

### 4\.5 前端改造要点

#### 4\.5\.1 移除 HTML5 Audio 依赖

- 删除 `audio` 元素及其事件监听

- 将所有播放控制函数（`playAudio`、`pauseAudio`、`loadTrack` 等）改为调用桥接对象

#### 4\.5\.2 统一桥接接口

在 `native-bridge.js` 中定义标准接口：

```JavaScript
const NativeBridge = {
    player: {
        play: (url) => {
            if (window.Capacitor) {
                // 调用 Capacitor 插件
                return AudioPlayer.play({ url });
            } else if (window.__TAURI__) {
                // 调用 Tauri 命令
                return invoke('play', { url });
            } else {
                // 纯 Web 降级（保留原有 audio 逻辑）
                return webAudio.play(url);
            }
        },
        pause: () => { /* ... */ },
        seek: (time) => { /* ... */ },
        setVolume: (vol) => { /* ... */ },
        
        // 事件监听回调（进度更新、播放结束等）
        onTimeUpdate: (callback) => { /* 注册原生事件 */ }
    },
    
    updateMediaInfo: (info) => {
        // 同步到原生媒体控件（锁屏/通知栏）
        if (window.Capacitor) {
            AudioPlayer.updateMetadata(info);
        } else if (window.__TAURI__) {
            invoke('update_metadata', { title: info.title, artist: info.artist });
        }
    }
};
```

#### 4\.5\.3 进度更新机制

原生播放器会通过事件（如 `onPositionChanged`）主动推送当前播放位置，前端监听这些事件并更新进度条。

---

## 五、权限与配置

### 5\.1 Android（AndroidManifest\.xml）

```XML
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />

<service android:name=".AudioService"
         android:enabled="true"
         android:exported="false">
    <intent-filter>
        <action android:name="android.media.browse.MediaBrowserService" />
    </intent-filter>
</service>
```

### 5\.2 iOS（Info\.plist）

```XML
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

### 5\.3 桌面端

桌面端无需额外权限。

---

## 六、开发顺序建议（按优先级）

1. **Android 端**：重点投入，验证后台播放和状态栏体验

2. **桌面端（Windows/macOS）**：利用 Tauri 快速打包，提升生产力场景

3. **iOS 端**：延后至鸿蒙端之后（用户明确）

4. **鸿蒙端**：后续用 ArkUI 原生重构（本指南不涉及）

---

## 七、代码复用率评估

|技术栈|复用率|说明|
|---|---|---|
|HTML/CSS|**100% 复用**|界面完全复用 Web 版|
|JavaScript 业务逻辑|**约 80% 复用**|仅播放控制部分需适配桥接|
|新增代码|各平台原生插件|约 500\-1000 行 Java/Kotlin/Swift/Rust|

---

## 八、总结

> ✅ **本指南提供了清晰的技术路径：**

- ✅ **后台播放**：通过 Android Foreground Service 和 iOS Background Modes 实现

- ✅ **状态栏控制**：使用 Capacitor StatusBar 插件

- ✅ **高性能播放**：Android 采用 ExoPlayer，iOS 采用 AVPlayer，桌面端采用系统 API

- ✅ **UI 完全保留**：用户界面体验与 Web 版一致

### 后续工作

1. 优先完成 Android 插件开发

2. 然后桌面端集成

3. iOS 与鸿蒙暂缓

如有疑问，可进一步探讨每个环节的细节。

> （注：部分内容可能由 AI 生成）
