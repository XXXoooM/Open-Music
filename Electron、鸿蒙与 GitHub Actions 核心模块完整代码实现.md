# Electron、鸿蒙与 GitHub Actions 核心模块完整代码实现

下面为你补充三个核心模块的**完整可落地、逐行可复用**代码实现，分别对应 **Electron 完整打包配置**、**鸿蒙 AVSession 音频会话对接**、**GitHub Actions 自动构建流水线**，均可直接复制到项目中使用。

---

## 一、Electron 端完整打包配置（可直接复用）

### 1\. 目录结构确认

```Plain Text
desktop/electron/
├── main.js          # 主进程代码（前文已提供）
├── package.json     # 依赖与打包配置（本部分内容）
└── assets/
    └── icon.png     # 应用图标（建议 512x512 PNG）
```

### 2\. 完整 package\.json 配置

```json
{
  "name": "open-music-desktop",
  "version": "1.0.0",
  "description": "Open Music 桌面端",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "devDependencies": {
    "electron": "^30.0.0",
    "electron-builder": "^24.13.3"
  },
  "build": {
    "appId": "com.openmusic.player",
    "productName": "Open Music",
    "directories": {
      "output": "../../dist/desktop"
    },
    "files": [
      "main.js",
      "../../web/**/*"
    ],
    "asar": true,
    "compression": "maximum",
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ],
      "icon": "assets/icon.png",
      "artifactName": "Open-Music-${version}-Windows-${arch}.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "assets/icon.png",
      "category": "public.app-category.music",
      "artifactName": "Open-Music-${version}-macOS-${arch}.${ext}"
    },
    "linux": {
      "target": ["deb", "AppImage"],
      "icon": "assets/icon.png",
      "category": "Audio",
      "artifactName": "Open-Music-${version}-Linux-${arch}.${ext}"
    }
  }
}
```

### 3\. 使用与避坑说明

1. 执行 `npm install` 安装依赖，`npm start` 本地调试，`npm run build:win` 打包对应平台

2. **路径说明**：配置中 `../../web/**/*` 会自动把项目根目录的 web 资源打进安装包，主进程中加载路径保持 `path.join(__dirname, '../../web/index.html')` 即可

3. Windows 打包需确保图标为 ico 格式，macOS 需 icns 格式，可使用在线工具转换

4. 打包产物默认输出到项目根目录 `dist/desktop/` 下

---

## 二、鸿蒙端 AVSession 音频会话完整实现

这是鸿蒙端实现**后台保活、控制中心显示、锁屏切歌**的核心代码，包含「Web → 原生」状态同步和「原生 → Web」控制回调的双向通信。

### 1\. 先补充权限配置（module\.json5）

在原有权限基础上，新增后台连续任务权限：

```json
"requestPermissions": [
  { "name": "ohos.permission.INTERNET" },
  { "name": "ohos.permission.AUDIO_INTERRUPTION" },
  { "name": "ohos.permission.KEEP_BACKGROUND_RUNNING" },
  { "name": "ohos.permission.BACKGROUND_CONTINUOUS_TASK" }
]
```

### 2\. Index\.ets 完整代码（含 AVSession \+ 双向通信）

```typescript
import { webview } from '@kit.ArkWeb';
import window from '@ohos.window';
import { avSession } from '@kit.AVSessionKit';
import { abilityAccessCtrl, Permissions } from '@kit.AbilityKit';
import { backgroundTaskManager } from '@kit.BackgroundTaskKit';

@Entry
@Component
struct Index {
  private controller: webview.WebviewController = new webview.WebviewController();
  private avSessionObj: avSession.AVSession | null = null;
  private isPlaying: boolean = false;

  // 页面加载完成后初始化
  aboutToAppear() {
    this.initWindow();
    this.requestPermissions();
  }

  // 沉浸式状态栏配置
  private async initWindow() {
    try {
      const win = await window.getLastWindow(getContext(this));
      await win.setWindowLayoutFullScreen(true);
      await win.setWindowSystemBarProperties({
        statusBarColor: '#00000000',
        statusBarContentColor: window.SystemBarContentColor.LIGHT
      });
    } catch (e) {
      console.error('窗口初始化失败', e);
    }
  }

  // 申请后台权限
  private async requestPermissions() {
    const permissions: Permissions[] = [
      'ohos.permission.KEEP_BACKGROUND_RUNNING',
      'ohos.permission.BACKGROUND_CONTINUOUS_TASK'
    ];
    const atManager = abilityAccessCtrl.createAtManager();
    await atManager.requestPermissionsFromUser(getContext(this), permissions);
    this.initAVSession();
  }

  // 初始化音频会话
  private async initAVSession() {
    try {
      // 创建音频会话，类型为音乐
      this.avSessionObj = await avSession.createAVSession(getContext(this), 'music');
      // 激活会话
      await this.avSessionObj.activate();

      // 监听系统控制事件（锁屏/控制中心点击按钮）
      this.avSessionObj.on('play', () => {
        this.callWebMethod('player.play()');
        this.isPlaying = true;
        this.updatePlaybackState();
      });

      this.avSessionObj.on('pause', () => {
        this.callWebMethod('player.pause()');
        this.isPlaying = false;
        this.updatePlaybackState();
      });

      this.avSessionObj.on('skipToNext', () => {
        this.callWebMethod('player.next()');
      });

      this.avSessionObj.on('skipToPrevious', () => {
        this.callWebMethod('player.prev()');
      });

      // 启动后台连续任务，保证后台不被杀死
      await backgroundTaskManager.startBackgroundRunning(
        getContext(this),
        backgroundTaskManager.BackgroundMode.AUDIO_PLAYBACK,
        '正在播放音乐'
      );

    } catch (e) {
      console.error('AVSession初始化失败', e);
    }
  }

  // 供JS调用：更新歌曲元数据
  private updateMediaInfo(info: { title: string, artist: string, cover: string, duration: number }) {
    if (!this.avSessionObj) return;
    this.avSessionObj.setAVMetaData({
      title: info.title,
      artist: info.artist,
      album: 'Open Music',
      duration: info.duration
    });
  }

  // 更新播放状态
  private updatePlaybackState() {
    if (!this.avSessionObj) return;
    this.avSessionObj.setAVPlaybackState({
      state: this.isPlaying ? avSession.PlaybackState.PLAYING : avSession.PlaybackState.PAUSED
    });
  }

  // 原生调用Web端JS方法
  private callWebMethod(jsCode: string) {
    this.controller.runJavaScript(jsCode);
  }

  // 页面销毁时释放资源
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
        .mediaPlayGestureAccess(false)
        .backgroundColor('#121212')
        .width('100%')
        .height('100%')
        // 注册原生方法，供JS端调用
        .registerJavaScriptProxy({
          object: {
            updateMediaInfo: (infoStr: string) => {
              const info = JSON.parse(infoStr);
              this.updateMediaInfo(info);
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
```

### 3\. 前端桥接层鸿蒙适配补充

在 `native-bridge.js` 的 `updateMediaInfo` 和 `updatePlayState` 方法中，补充鸿蒙端调用逻辑：

```javascript
// 鸿蒙端同步媒体信息
if (this.env.isHarmony && window.ohosNative) {
  window.ohosNative.updateMediaInfo(JSON.stringify(info));
}

// 鸿蒙端同步播放状态
if (this.env.isHarmony && window.ohosNative) {
  window.ohosNative.updatePlayState(isPlaying);
}
```

### 4\. 关键避坑点

1. 必须先申请后台连续任务权限，再启动后台任务，否则会报错

2. Web 组件的 `registerJavaScriptProxy` 必须在 Web 组件属性中声明，不能在生命周期里动态注册

3. 前端调用原生方法时，复杂参数必须序列化为字符串传递，不能直接传对象

4. 页面退出时必须销毁 AVSession 并停止后台任务，避免系统资源泄漏

---

## 三、GitHub Actions 自动构建流水线

实现提交代码后**自动同步资源、构建安卓 APK、构建 Electron 桌面端、上传构建产物**，无需手动打包。

### 1\. 文件位置

在项目根目录创建：`.github/workflows/build.yml`

### 2\. 完整工作流配置

```yaml
name: 多端自动构建

on:
  push:
    branches: [ main ]
  workflow_dispatch: # 支持手动触发

jobs:
  # 任务1：构建安卓 APK
  build-android:
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 安装 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: 安装 JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: 安装项目依赖
        run: npm install

      - name: 同步 Web 资源到移动端
        run: |
          npm run sync
          npx cap sync android

      - name: 构建安卓 Debug APK
        working-directory: mobile/android
        run: ./gradlew assembleDebug

      - name: 上传安卓 APK 产物
        uses: actions/upload-artifact@v4
        with:
          name: Open-Music-Android-APK
          path: mobile/android/app/build/outputs/apk/debug/app-debug.apk

  # 任务2：构建 Windows 桌面端（Electron）
  build-desktop-windows:
    runs-on: windows-latest
    needs: build-android
    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 安装 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: 安装桌面端依赖
        working-directory: desktop/electron
        run: npm install

      - name: 构建 Windows 安装包
        working-directory: desktop/electron
        run: npm run build:win

      - name: 上传 Windows 产物
        uses: actions/upload-artifact@v4
        with:
          name: Open-Music-Windows
          path: dist/desktop/*.exe
```

### 3\. 使用说明

1. 将代码推送到 GitHub 仓库的 main 分支，会自动触发构建

2. 也可在仓库 Actions 页面手动点击运行工作流

3. 构建完成后，在 Actions 运行详情页可下载打包好的 APK 和 exe 安装包

4. 若需要正式签名包，可将签名密钥配置到 GitHub Secrets，在构建步骤中引入

---

需要我继续补充 **Tauri 完整打包配置**、**iOS 端后台音频配置细节**，或者 **Meting API 自建部署完整教程** 吗？

> （注：部分内容可能由 AI 生成）
