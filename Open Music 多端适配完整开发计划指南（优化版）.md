# Open Music 多端适配完整开发计划指南（优化版）

# Open Music 多端适配完整开发计划指南（优化版）

本次优化在原有框架基础上，重点补充**落地级实操细节、各端踩坑避坑指南、统一原生桥接规范、自动化构建脚本、测试发布流程、故障排查手册**，进一步降低试错成本，让指南可直接作为开发执行手册使用，全程保留项目「纯原生、轻量化、无重型构建依赖」的核心定位。

---

## 一、项目概述

### 1\.1 改造背景

Open Music 原生为轻量化 Web 音乐播放器，已具备完整播放、歌词、歌单、PWA 能力，核心业务代码高度内聚于 `web/` 目录，无自研后端。本次改造通过「原生容器包裹 Web 核心」的模式，低成本实现全平台覆盖，核心业务逻辑 0 重写，仅补充原生能力与平台适配。

### 1\.2 改造目标

- **多端覆盖**：支持 Web 浏览器、安卓 APK、iOS IPA、Windows/macOS/Linux 桌面安装包、鸿蒙 HAP

- **代码复用**：`web/` 目录为唯一业务源码，各端复用率 ≥90%，维护一份代码全端同步

- **体验对齐**：各端保留毛玻璃视觉、歌词同步、歌单导入等核心体验，补充对应平台原生能力

- **渐进落地**：按成本从低到高分阶段推进，可快速产出可用版本，再逐步优化

### 1\.3 适用边界与收益

- 适用场景：个人自用、技术学习、小范围内部使用，不建议未经版权授权直接商用上架

- 核心收益：一套代码维护 5 个平台，功能迭代一次全端生效；改造成本仅为原生开发的 1/5\~1/3

- 不适用场景：对性能、原生交互有极致要求的专业级音乐应用

### 1\.4 核心原则

1. **业务与容器分离**：播放、歌词、歌单等业务逻辑只存在于 `web/` 目录，各端仅做容器封装、原生能力桥接

2. **最小侵入改造**：不重构前端代码、不引入前端框架与构建工具，仅补充环境检测与兼容逻辑

3. **基础设施先行**：优先解决 API 服务、构建同步等公共问题，再逐端落地

---

## 二、整体技术架构

### 2\.1 分层架构

采用「核心业务层 \+ 统一桥接层 \+ 容器适配层」三层架构，自上而下全复用，前端无需感知平台差异：

```Plaintext
┌─────────────────────────────────────────────────┐
│  容器适配层（各端独立，仅做壳与原生能力实现）        │
│  Web / Capacitor(安卓/iOS) / Electron/Tauri / ArkWeb(鸿蒙) │
├─────────────────────────────────────────────────┤
│  统一桥接层（前端封装，统一调用入口）                │
│  NativeBridge：环境检测、原生能力代理、事件回调      │
├─────────────────────────────────────────────────┤
│  核心业务层（唯一源码，全端复用）                    │
│  web/ 目录：HTML/CSS/JS + 播放逻辑 + 歌词 + 歌单 + PWA │
└─────────────────────────────────────────────────┘
```

### 2\.2 技术选型总览

|目标平台|容器方案|开发语言|最终产物|代码复用率|开发难度|
|---|---|---|---|---|---|
|Web 浏览器|原生 PWA|HTML/CSS/JS|静态资源文件|100%|极低|
|安卓|Capacitor 6|原生壳 \+ Web|APK / AAB|95%|低|
|iOS|Capacitor 6|原生壳 \+ Web|IPA|95%|中（需Mac环境）|
|PC 桌面|Electron 30 / Tauri 2|原生壳 \+ Web|exe / dmg / deb|95%|低|
|鸿蒙 HarmonyOS|ArkWeb 组件|ArkTS \+ Web|HAP|90%|中|

### 2\.3 改造后标准目录结构

```Plaintext
Open-Music/
├── web/                      # 唯一核心业务源码，全端共用（禁止各端私自修改）
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── manifest.json
│   └── sw.js
├── bridge/                   # 新增：统一桥接层脚本，前端原生能力统一入口
│   └── native-bridge.js
├── mobile/                   # Capacitor 移动端工程
│   ├── android/              # 安卓原生工程（已有）
│   └── ios/                  # iOS 原生工程（新增）
├── desktop/                  # PC桌面端工程（二选一）
│   ├── electron/             # Electron 方案
│   └── tauri/                # Tauri 方案
├── harmony/                  # 鸿蒙端工程
│   └── entry/src/main/resources/rawfile/web/  # 自动同步的web资源
├── scripts/                  # 新增：自动化脚本目录
│   ├── sync-assets.js        # web资源一键同步全端
│   └── build-all.js          # 全平台批量打包
├── capacitor.config.json     # Capacitor 全局配置（已有）
├── package.json              # 项目依赖与自动化脚本
└── README.md
```

---

## 三、前置准备与环境清单

### 3\.1 通用基础环境（必装）

|工具|版本要求|用途|
|---|---|---|
|Git|最新版|代码版本管理|
|Node\.js|18\.x LTS 及以上|运行 Capacitor、Electron、自动化脚本|
|Python 3|3\.8\+|本地启动 Web 静态服务调试|
|代码编辑器|VS Code 为主|前端与脚本开发|

### 3\.2 各端专属开发环境

|目标端|必备环境|可选环境|
|---|---|---|
|安卓|JDK 17、Android Studio、Android SDK 13\+|安卓真机测试设备|
|iOS|macOS 13\+、Xcode 15\+、Apple ID|Apple 开发者账号、iPhone 测试机|
|PC 桌面（Electron）|无额外依赖（Node 即可）|Windows \+ macOS 双系统打包机|
|PC 桌面（Tauri）|Rust 工具链、WebView2 运行时|Visual Studio Build Tools（Windows）|
|鸿蒙|DevEco Studio 5\.0\+、HarmonyOS SDK 10\+|鸿蒙真机测试设备、华为开发者账号|

### 3\.3 资源与账号准备

1. 服务器（可选）：用于部署私有 Meting API，建议 1核2G 配置即可

2. 域名与 HTTPS 证书（可选）：线上 Web 端部署必需

3. 开发者账号（上架用）：Apple 开发者账号、华为开发者账号、各安卓应用市场账号

4. 签名文件：安卓签名密钥、iOS 描述文件与证书、鸿蒙签名证书

---

## 四、分阶段开发计划（总 timeline）

按「基础设施 → 高优先级端 → 低优先级端 → 全端优化」顺序推进，单人开发预估总周期 12\~21 天，每个阶段设置明确的可验收里程碑。

### 阶段 0：项目准备与基础改造（1\~2 天）

**阶段目标**：统一代码基准，补齐公共基础设施，为多端开发铺路
**核心任务**：

1. 拉取原始项目代码，梳理 `web/` 目录逻辑，冻结业务层大改动

2. 前端新增统一桥接层 `native-bridge.js`，补充多端环境检测逻辑

3. 部署私有 Meting API 服务，替换前端公共镜像地址

4. 编写资源同步自动化脚本，实现 `web` 代码一键同步到所有端工程

5. 配置 `.gitignore`，排除各端构建产物、本地配置文件
**里程碑验收**：本地启动 Web 端功能正常，API 请求稳定，同步脚本可正常执行

### 阶段 1：移动端（安卓 \+ iOS）落地（3\~5 天）

**阶段目标**：复用现有 Capacitor 配置，产出可安装、可后台播放的双端安装包
**核心任务**：

1. 完善安卓原生工程：配置网络安全规则、音频前台服务、打包签名

2. 新增 iOS 原生工程：Capacitor 初始化、后台音频能力配置、开发证书配置

3. 接入核心原生插件：媒体会话、状态栏、本地存储、音频焦点

4. 前端桥接层适配：播放状态同步到系统锁屏、接收系统控制事件

5. 双端兼容性调试，生成测试包
**里程碑验收**：APK/IPA 可正常安装，歌单加载、播放、歌词功能正常，切后台可继续播放，锁屏可控制切歌

### 阶段 2：PC 桌面端落地（2\~4 天）

**阶段目标**：产出桌面端安装包，补充桌面端专属交互体验
**核心任务**：

1. 选定技术方案（Electron 快速落地 / Tauri 极致轻量）

2. 搭建桌面端工程，加载本地 `web` 目录资源，解决跨域问题

3. 实现基础能力：窗口大小控制、最小化到系统托盘、关闭不退出

4. 可选增强：全局多媒体快捷键、桌面歌词、文件关联

5. 配置打包参数，生成多平台安装包
**里程碑验收**：各系统安装包可正常安装运行，窗口缩放无错位，最小化后台播放正常

### 阶段 3：鸿蒙端落地（3\~5 天）

**阶段目标**：实现鸿蒙原生安装包，基础功能全量可用，支持后台播放
**核心任务**：

1. DevEco Studio 创建鸿蒙 ArkTS 项目，配置基础权限

2. 导入 `web` 目录资源，通过 ArkWeb 加载本地页面，解决路径适配问题

3. 适配沉浸式状态栏、横竖屏、折叠屏分屏

4. 对接鸿蒙 AVSession 音频会话，实现控制中心、锁屏控制、后台保活

5. 签名打包生成 HAP 测试包
**里程碑验收**：鸿蒙设备可正常安装，功能全量可用，切后台播放不中断

### 阶段 4：全端统一优化与发布（3\~5 天）

**阶段目标**：统一各端体验，修复边界问题，完成正式版本发布
**核心任务**：

1. 全端 UI 适配：不同尺寸屏幕、暗黑模式、安全区域、异形屏适配

2. 音频体验统一：后台保活、音频焦点、锁屏信息全端对齐

3. 性能优化：启动速度、包体积、内存占用优化

4. 各端正式签名打包，生成发布版本

5. 编写完整的开发、打包、使用文档
**里程碑验收**：全端通过功能、体验、性能验收标准，输出正式发布包与文档

---

## 五、各端详细实施方案（含避坑指南）

### 5\.1 Web 端（基础优化）

项目原生已具备，仅需做少量优化即可达到生产可用。

1. **响应式适配**：在 `style.css` 中补充 3 个断点：

    - 移动端（\<768px）：单列布局，歌词区域放大，控制栏底部固定

    - 平板（768px\~1200px）：双列布局，均衡分配歌单与歌词区域

    - 桌面大屏（\>1200px）：固定最大宽度，居中展示，优化毛玻璃弥散效果

2. **PWA 能力保留**：保留 `manifest.json` 与 `sw.js`，支持浏览器「安装为应用」

3. **兼容性修复**：

    - Safari 浏览器音频自动播放限制：首次用户交互后再触发播放

    - 跨域处理：线上部署配置 CORS 头，本地调试用 Python 服务器无跨域

4. **部署方式**：任意静态服务器（Nginx、Vercel、Netlify）直接托管 `web` 目录

### 5\.2 安卓 / iOS 端（Capacitor 方案）

项目已预置 Capacitor 配置与安卓工程，直接复用扩展即可。

#### 基础实施步骤

1. **依赖与工程初始化**

```Bash
# 根目录安装核心依赖（项目已配置则跳过）
npm install @capacitor/core @capacitor/cli @capacitor/android

# 新增 iOS 工程
npm install @capacitor/ios
npx cap add ios
```

2. **核心配置（capacitor\.config\.json）**

```JSON
{
  "appId": "com.openmusic.player",
  "appName": "Open Music",
  "webDir": "web",
  "server": {
    "androidScheme": "https",
    "iosScheme": "https",
    "cleartext": true
  },
  "plugins": {
    "StatusBar": {
      "style": "dark",
      "overlay": true
    }
  }
}
```

3. **代码同步命令**

```Bash
npx cap sync   # web代码变更后执行，自动同步到安卓/iOS工程
npx cap open android   # 打开Android Studio
npx cap open ios       # 打开Xcode
```

4. **核心原生插件清单**

|能力|插件包名|作用|
|---|---|---|
|后台播放\+锁屏控制|`@capacitor-community/media-session`|对接系统媒体会话，支持锁屏切歌、显示封面|
|状态栏适配|`@capacitor/status-bar`|沉浸式状态栏、暗黑模式适配|
|本地存储|`@capacitor/preferences`|替代 localStorage，数据持久化更稳定|
|音频焦点|`@capacitor-community/audio-focus`|处理来电、其他APP音频冲突|

#### 打包签名

- **安卓**：Android Studio 打开工程，在 `Build → Generate Signed Bundle/APK` 中创建签名密钥，生成签名 APK/AAB

- **iOS**：Xcode 打开工程，配置 Team 与签名证书，选择真机设备，`Product → Archive` 打包导出 IPA

#### 常见坑点与避坑方案

1. **安卓 HTTP 请求被拦截**：安卓 9\+ 默认禁止明文流量，API 为 HTTP 时，需在安卓工程添加 `network_security_config.xml` 放开域名，或直接使用 HTTPS

2. **安卓后台播放被杀死**：必须搭配前台服务 \+ 通知栏，仅 MediaSession 不足以保活；插件会自动创建前台通知

3. **iOS 后台播放失效**：Xcode 中进入 `Signing & Capabilities`，添加 `Background Modes`，勾选 `Audio, AirPlay, and Picture in Picture`

4. **iOS 静音键导致无声**：需配置 AVAudioSession 类别为 `playback`，忽略静音开关

5. **音频自动播放失败**：WebView 默认禁止自动播放，需在原生层配置 `setMediaPlaybackRequiresUserGesture(false)`

### 5\.3 PC 桌面端（双方案可选）

#### 方案 A：Electron（快速落地优先，推荐新手）

生态成熟、插件丰富、兼容性好，缺点是包体积较大（100MB\+）。

1. **工程初始化**

```Bash
mkdir -p desktop/electron && cd desktop/electron
npm init -y
npm install electron electron-builder --save-dev
```

2. **主进程核心代码（main\.js）**

```JavaScript
const { app, BrowserWindow, globalShortcut, Tray, Menu } = require('electron')
const path = require('path')

let mainWin = null
let tray = null

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    backgroundColor: '#121212',
    titleBarStyle: 'default',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // 解决本地文件请求API的跨域问题
    }
  })

  // 加载本地web页面
  mainWin.loadFile(path.join(__dirname, '../../web/index.html'))

  // 关闭窗口时最小化到托盘，不退出
  mainWin.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault()
      mainWin.hide()
    }
  })
}

function createTray() {
  // 创建系统托盘图标与菜单
  tray = new Tray(path.join(__dirname, 'tray-icon.png'))
  const menu = Menu.buildFromTemplate([
    { label: '显示主界面', click: () => mainWin.show() },
    { label: '退出', click: () => { app.isQuiting = true; app.quit() } }
  ])
  tray.setContextMenu(menu)
  tray.on('double-click', () => mainWin.show())
}

app.whenReady().then(() => {
  createWindow()
  createTray()
  // 注册全局多媒体快捷键
  globalShortcut.register('MediaPlayPause', () => {
    mainWin.webContents.executeJavaScript('player.togglePlay()')
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

3. **打包配置（package\.json）**
配置 `electron-builder` 字段，指定产物格式、图标、打包目录，执行 `npm run build` 即可生成 exe/dmg/deb 安装包。

#### 方案 B：Tauri（轻量性能优先，推荐追求极致体验）

基于 Rust \+ 系统原生 WebView，包体积可压缩至 5\~10MB，内存占用低，缺点是生态略小。

1. **环境准备**：按官方文档安装 Rust 工具链与系统依赖

2. **工程初始化**：创建 Tauri 项目，配置前端目录为 `../../web`

3. **核心能力**：通过 Tauri 官方插件实现窗口控制、全局快捷键、系统托盘

4. **打包**：执行 `npm run tauri build` 生成对应平台原生安装包

#### 常见坑点与避坑方案

1. **本地加载 HTML 跨域**：请求第三方 API 会触发 CORS，Electron 可关闭 `webSecurity`，Tauri 可配置请求代理

2. **全局快捷键冲突**：应用失焦时正常生效，但需避免与系统、其他软件快捷键冲突

3. **Windows 托盘图标模糊**：使用多尺寸 ico 格式图标，适配不同 DPI 屏幕

4. **macOS 关闭窗口退出**：需重写关闭事件，隐藏窗口而非退出，保持后台播放

### 5\.4 鸿蒙端（ArkWeb 原生容器方案）

采用鸿蒙原生 Web 组件加载本地静态资源，几乎无需修改前端核心代码。

#### 基础实施步骤

1. **创建项目**：DevEco Studio 新建 Stage 模型 ArkTS 项目，API 版本选择 10\+

2. **导入前端资源**：将整个 `web/` 目录拷贝至 `entry/src/main/resources/rawfile/web/`

3. **主页面核心代码（Index\.ets）**

```TypeScript
import { webview } from '@kit.ArkWeb';
import window from '@ohos.window';

@Entry
@Component
struct Index {
  controller: webview.WebviewController = new webview.WebviewController();

  aboutToAppear() {
    // 沉浸式状态栏
    window.getLastWindow(getContext(this)).then(win => {
      win.setWindowLayoutFullScreen(true);
      win.setWindowSystemBarProperties({ statusBarColor: '#00000000' });
    });
  }

  build() {
    Column() {
      Web({ src: $rawfile('web/index.html'), controller: this.controller })
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .databaseAccess(true)
        .mediaPlayGestureAccess(false) // 允许音频自动播放
        .backgroundColor('#121212')
        .width('100%')
        .height('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#121212')
  }
}
```

4. **权限配置（module\.json5）**

```JSON
"requestPermissions": [
  { "name": "ohos.permission.INTERNET" },
  { "name": "ohos.permission.AUDIO_INTERRUPTION" },
  { "name": "ohos.permission.KEEP_BACKGROUND_RUNNING" }
]
```

5. **进阶：对接 AVSession 音频会话**
引入 `@kit.AVSessionKit`，播放状态变更时同步给系统，实现控制中心显示、锁屏控制、后台保活。

#### 打包发布

DevEco Studio 中 `Build → Build HAP(s)/APP(s)`，配置签名证书后生成 HAP 安装包，可上架华为应用市场。

#### 常见坑点与避坑方案

1. **本地资源路径错误**：rawfile 目录下的资源，HTML 内的相对路径要以 `index.html` 为基准，JS/CSS/图片路径不能写错

2. **后台播放被终止**：必须申请连续任务权限 \+ 对接 AVSession，仅靠 WebView 无法后台保活

3. **音频自动播放不生效**：除了 `mediaPlayGestureAccess(false)`，还需确保应用获得音频焦点

4. **输入框被键盘遮挡**：配置窗口软键盘模式为 `adjustResize`，自动上推页面

---

## 六、统一原生能力桥接规范

新增前端统一桥接层，封装所有原生能力调用，业务代码只调用统一接口，无需判断平台，大幅提升可维护性。

### 6\.1 桥接层代码实现（bridge/native\-bridge\.js）

```JavaScript
/**
 * Open Music 多端统一原生桥接层
 * 业务层统一调用此对象方法，内部自动适配当前平台
 */
const NativeBridge = {
  // 环境检测
  env: {
    isWeb: false,
    isCapacitor: false,
    isDesktop: false,
    isHarmony: false
  },

  // 初始化：自动识别环境
  init() {
    this.env.isCapacitor = !!window.Capacitor;
    this.env.isDesktop = !!window.electron || !!window.__TAURI__;
    this.env.isHarmony = !!window.ohos;
    this.env.isWeb = !this.env.isCapacitor && !this.env.isDesktop && !this.env.isHarmony;

    // 非Web环境禁用Service Worker，避免缓存冲突
    if (!this.env.isWeb && navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
    }
  },

  /**
   * 更新媒体会话信息（同步到系统锁屏/控制中心）
   * @param {Object} info - 歌曲信息：title, artist, cover, duration
   */
  updateMediaInfo(info) {
    if (this.env.isCapacitor) {
      // Capacitor 媒体会话插件调用
      if (window.MediaSession) {
        window.MediaSession.updateMetadata({
          title: info.title,
          artist: info.artist,
          artwork: [{ src: info.cover }]
        });
      }
    } else if (this.env.isHarmony) {
      // 鸿蒙端通过JSBridge通知原生层更新AVSession
      window.ohos.callNative('updateMediaInfo', JSON.stringify(info));
    }
    // Web端自动使用浏览器Media Session API
    if (navigator.mediaSession) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: info.title,
        artist: info.artist,
        artwork: [{ src: info.cover }]
      });
    }
  },

  /**
   * 更新播放状态
   * @param {Boolean} isPlaying - 是否正在播放
   */
  updatePlayState(isPlaying) {
    if (navigator.mediaSession) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
    // 其他平台同理，内部自行适配
  }
};

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => NativeBridge.init());
```

### 6\.2 业务层使用方式

在 `app.js` 的播放逻辑中直接调用，无需判断平台：

```JavaScript
// 歌曲切换时，同步到系统媒体会话
function onSongChange(song) {
  NativeBridge.updateMediaInfo({
    title: song.name,
    artist: song.artist,
    cover: song.cover,
    duration: song.duration
  });
}

// 播放状态变更时同步
function togglePlay() {
  // ...原有播放逻辑
  NativeBridge.updatePlayState(audio.paused ? false : true);
}
```

---

## 七、全端通用核心优化

### 7\.1 资源同步自动化

编写跨平台 Node\.js 同步脚本，替代手动拷贝，Windows/macOS/Linux 通用，修改 web 代码后一键同步全端。

`scripts/sync-assets.js` 核心逻辑：

```JavaScript
const fs = require('fs-extra');
const path = require('path');

const webDir = path.join(__dirname, '../web');
const targets = [
  path.join(__dirname, '../mobile/android/app/src/main/assets/public'),
  path.join(__dirname, '../mobile/ios/App/App/public'),
  path.join(__dirname, '../desktop/electron/web'),
  path.join(__dirname, '../harmony/entry/src/main/resources/rawfile/web')
];

async function syncAll() {
  for (const target of targets) {
    await fs.emptyDir(target);
    await fs.copy(webDir, target);
    console.log(`同步完成: ${target}`);
  }
  console.log('✅ 所有端资源同步完成');
}

syncAll();
```

在 `package.json` 中配置脚本：

```JSON
{
  "scripts": {
    "sync": "node scripts/sync-assets.js",
    "sync:build": "npm run sync && npx cap sync"
  }
}
```

使用时执行 `npm run sync` 即可完成全端资源同步。

### 7\.2 自建 Meting API 服务

公共镜像稳定性不可控，多端部署后建议自建后端，作为全端统一数据源。

- 一键部署命令：

```Bash
docker run -d --name meting -p 3000:3000 --restart=always metowolf/meting
```

- 前端修改：在 `app.js` 中将 API 基础地址替换为你的服务器地址

- 优化建议：配置 CDN 加速、请求缓存、备用接口列表，提升可用性

### 7\.3 统一音频体验优化

1. **后台保活**：各端对接系统音频会话框架，保证切后台后播放不被系统终止

2. **音频焦点**：处理来电、通知、其他 APP 播放音乐时自动暂停/降低音量，结束后恢复

3. **锁屏控制**：全端统一展示歌曲信息、封面，支持上一曲/下一曲/播放暂停

4. **耳机线控**：适配有线/蓝牙耳机的播放控制、插拔暂停

### 7\.4 性能与包体积优化

- **Web 端**：压缩图片、精简 SVG 图标、开启 Gzip 压缩

- **移动端**：移除无用原生权限、清理未使用插件、开启资源混淆

- **桌面端**：Electron 开启 asar 打包、Tauri 开启 UPX 压缩

- **通用**：歌词、歌单数据本地缓存，减少重复网络请求

---

## 八、测试与发布流程

### 8\.1 测试要点

|测试类型|测试内容|
|---|---|
|功能测试|歌单导入、播放控制、歌词同步、播放模式、本地存储、快捷键全量验证|
|兼容性测试|不同系统版本、不同屏幕尺寸、异形屏、折叠屏适配测试|
|稳定性测试|长时间播放、切换歌曲、前后台切换、网络波动下的崩溃率测试|
|专项测试|后台播放时长、锁屏控制、音频焦点处理、包体积与内存占用|

### 8\.2 各端发布流程

1. **Web 端**：静态资源上传服务器 → 配置 Nginx → 验证线上功能 → 更新 PWA 缓存版本

2. **安卓端**：生成签名 APK/AAB → 真机测试 → 上传应用市场 / 分发安装包

3. **iOS 端**：Archive 打包 → 上传 App Store Connect → TestFlight 测试 → 正式发布

4. **桌面端**：生成各平台安装包 → 病毒扫描 → 发布到下载页 / GitHub Release

5. **鸿蒙端**：生成签名 HAP → 真机测试 → 上传华为应用市场 / 本地分发

### 8\.3 简易 CI/CD 方案（可选）

使用 GitHub Actions 实现：

- 提交代码后自动执行资源同步

- 自动构建安卓 APK、桌面端安装包

- 自动上传构建产物到 Release 页面

---

## 九、风险评估与应对方案

|风险类型|具体描述|应对方案|
|---|---|---|
|服务稳定性|公共 Meting 镜像失效、音源接口变更|1\. 优先自建私有 Meting 服务；2\. 前端配置多备用接口，故障自动切换；3\. 支持本地歌单导入，降级离线使用|
|合规上架风险|音乐版权问题导致应用商店审核不通过|1\. 明确项目仅用于个人学习，不用于商业发布；2\. 上架需自行获取版权授权；3\. 个人使用建议本地打包，不公开发布|
|音频后台播放|移动端/鸿蒙切后台后播放被系统终止|1\. 安卓：前台服务 \+ MediaSession；2\. iOS：后台音频模式 \+ AVAudioSession；3\. 鸿蒙：连续任务 \+ AVSession|
|平台兼容性|不同系统 WebView 渲染差异、样式错位|1\. 统一使用系统最新 WebView；2\. 针对 Safari、鸿蒙 Web 内核做专项样式适配；3\. 保留降级样式方案|
|包体积过大|Electron、Capacitor 包体积偏大|1\. 桌面端可选 Tauri 方案；2\. 移动端清理无用资源、开启压缩；3\. 移除非必要插件与权限|

---

## 十、验收标准

### 10\.1 功能验收（全端必过）

1. 歌单导入：输入网易云公开歌单 ID 可正常加载歌曲列表与封面

2. 播放控制：播放/暂停、切歌、进度拖动、音量调节功能正常

3. 歌词同步：LRC 歌词毫秒级同步、点击歌词跳转进度正常

4. 播放模式：单曲循环、列表循环、随机播放切换正常，状态持久化

5. 本地存储：刷新/重启应用后，歌单、音量、偏好设置完整保留

6. 视觉效果：毛玻璃风格、渐变主色调渲染正常，无明显错位

### 10\.2 体验验收

- 移动端：无布局错位、状态栏不遮挡内容、后台可连续播放 ≥30 分钟、锁屏可控制

- 桌面端：窗口缩放无变形、最小化到托盘后台播放正常、全局快捷键生效

- 鸿蒙端：适配系统导航栏、无白屏、切后台音频不中断、控制中心可控制

- 全端：操作无明显卡顿、播放无频繁断流、歌词同步误差 ≤200ms

### 10\.3 性能验收

- 启动速度：冷启动首屏加载 ≤ 2s

- 包体积：移动端 ≤ 30MB，桌面端 Tauri ≤ 15MB / Electron ≤ 120MB

- 内存占用：播放状态下内存占用稳定，无持续增长泄漏

- 功耗：移动端连续播放 1 小时耗电 ≤ 10%

---

## 十一、常见故障排查手册

### 白屏无法加载

1. 检查 web 资源路径是否正确，文件是否完整同步

2. 打开开发者工具，查看控制台报错信息

3. 检查是否存在跨域、资源加载失败问题

4. 移动端/鸿蒙端检查网络权限是否开启

### 音频无法播放

1. 检查 API 服务是否可用，直接访问接口确认返回数据正常

2. 检查是否触发浏览器/系统自动播放限制，首次播放需用户交互

3. 检查音频链接是否有效，是否存在域名封禁

4. 移动端检查系统媒体音量、静音开关状态

### 切后台播放暂停

1. 检查是否配置了后台音频权限与音频会话

2. 安卓检查前台服务通知是否正常显示

3. iOS 检查 Background Modes 是否勾选

4. 鸿蒙检查连续任务权限与 AVSession 是否对接

### 歌词不同步

1. 检查 LRC 歌词格式是否标准，是否存在时间戳错误

2. 检查音频加载延迟，调整歌词偏移补偿

3. 排查是否因音频缓冲导致进度计算偏差

---

## 十二、后续迭代方向（可选扩展）

1. **多音源扩展**：在 Meting 基础上扩展 QQ 音乐、酷狗等多平台音源支持

2. **本地音乐导入**：支持读取本地音频文件，实现本地音乐播放

3. **播放记录云同步**：对接轻量后端，实现多端播放进度、歌单同步

4. **歌词翻译与双语显示**：支持翻译歌词、逐字歌词效果

5. **主题自定义**：支持切换不同配色主题、调整毛玻璃透明度

6. **桌面歌词**：桌面端、移动端悬浮歌词显示

---

需要我针对其中某一部分（比如鸿蒙 AVSession 对接、Electron 打包配置、GitHub Actions 自动构建）输出更细化的逐行代码实现吗？

> （注：部分内容可能由 AI 生成）
