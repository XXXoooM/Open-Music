# Open Music - 开放式音乐

一个开放式的音乐客户端项目，结合了**高阶毛玻璃暗黑视觉风格的 PWA Web 应用**以及**100% 纯原生现代 Kotlin Android 客户端**。支持从网易云等分享链接一键解析导入，并且完美支持多端多包运行（Web、Android 原生、Android 混合壳、Tauri/Electron 桌面端、鸿蒙端等）。

---

## 📂 项目目录结构全图 (Root Directories & Files)

为了保持项目高内聚、低耦合，我们对不同的打包目标及原生重写目录进行了物理隔离。以下为本项目的完整目录及文件布局：

```text
├── .github/              # GitHub Actions 自动化工作流配置 (打包、CI)
├── android/              # Capacitor 混合移动端 Android 原生壳工程
├── android-native/       # 100% 纯原生 Android 客户端代码 (Kotlin / Jetpack Compose / Media3)
│   ├── app/              # 纯原生 Android 源代码及资源文件
│   │   └── src/main/java/com/openmusic/app/
│   │       ├── audio/    # Media3 PlaybackService 音频服务及后台锁屏对接
│   │       ├── data/     # MetingRepository 数据仓储与 DataStore 配置
│   │       └── ui/       # MainViewModel 及 Compose 页面布局主题
│   ├── build.gradle.kts  # Gradle 依赖构建脚本
│   └── settings.gradle.kts # Gradle 项目插件仓库配置
├── capacitor.config.json # Capacitor 核心配置文件 (Web 与原生容器桥接配置)
├── electron/             # Electron 桌面包装工程 (Web 代码打包成桌面安装包)
├── harmony/              # HarmonyOS 鸿蒙原生包装工程
├── mobile/               # 移动端包装文档目录 (包含 Capacitor 原生配置与教程)
├── package.json          # Node.js 依赖及构建指令脚本
├── package-lock.json     # Node.js 锁定的依赖版本树
├── scripts/              # 本地编译、打包及多端构建辅助脚本
├── src-tauri/            # Tauri 2.0 桌面端包装壳配置及 Rust 依赖代码
├── web/                  # 网页前端核心代码 (HTML / CSS / JS / PWA 配置文件)
│   ├── _headers          # Cloudflare Pages 的 HTTP 响应头配置 (用于缓存与防跨站)
│   ├── index.html        # 网页版主页面及 inline SVG 矢量图标
│   ├── style.css         # 毛玻璃暗黑视觉样式系统与动效定义
│   ├── app.js            # Web 端核心音频逻辑、歌词同步解析及歌单解析脚本
│   ├── native-bridge.js  # 原生桥接层脚本 (抹平 Web 与各类原生壳的 API 差异)
│   ├── manifest.json     # PWA 应用配置清单 (应用图标、显示模式)
│   └── sw.js             # Service Worker 离线存储与缓存控制文件
├── DEVELOPMENT_HISTORY.md # 项目详细迭代开发与更新历史记录
└── README.md             # 本项目自述文件
```

---

## ⚡ 核心功能与多端适配

### 1. 网页 / 混合包装端功能 (Web & PWA & Hybrid Shell)
* **网易云 API 接入**：动态解析获取歌单，并本地缓存您的歌单及音量偏好。
* **自定义歌单导入**：在列表设置面板中，输入任意网易云公开歌单 ID 或直接贴入网页分享 URL 即可载入。
* **精确歌词同步**：支持 LRC 毫秒级歌词同步、视觉毛玻璃遮罩高亮，并支持 **点击歌词跳转播放进度（Click-to-Seek）**。
* **键盘快捷键操控**：
  * 空格键 `Space`：播放/暂停 交互切换。
  * 方向左右键 `← / →`：快退/快进 5 秒时间。
  * 方向上下键 `↑ / ↓`：增加/降低 音量大小。
  * `M` 键：静音状态一键切换。
  * `L` 键：单曲循环与列表循环模式切换。
  * `S` 键：随机播放模式一键切换。
* **PWA 应用安装**：在浏览器打开时，可直接“添加到主屏幕”，生成桌面图标以 Standalone 无地址栏的独立 App 形式运行。

### 2. 纯原生 Android 客户端功能 (100% Native Kotlin)
* **高性能音频引擎 (Jetpack Media3)**：底层使用原生 ExoPlayer 进行音频渲染与缓存，支持完整的后台保活和自动锁屏音频焦点。
* **状态栏“灵动岛 / 音乐胶囊”同步**：与系统 MediaSession 进行实时双向通信，原生支持小米 HyperOS 焦点通知、OPPO ColorOS 流体云和 vivo OriginOS 原子通知的状态栏小胶囊播放控制。
* **极奢 HSL 调色板引擎**：根据歌曲 Hash 动态调配 UI 背景与高亮，切歌时应用主色调会在 1.2 秒内以 FastOutSlowIn 物理曲线平滑过渡，并采用最短弧度插值算法排除了颜色跳转闪烁。
* **影院焦深歌词滚动**：歌词滚动字重和透明度会根据与当前高亮行的物理距离做 3D 悬浮和缩放淡出。内置手动拖阅锁定机制，浏览歌词 3.5 秒后才会回弹。
* **原生播放模式切换**：支持列表循环、随机播放、单曲循环，模式状态与安卓系统锁屏及通知栏完全同步。
* **Mikus / 祈杰丫 接口兼容**：通过 Gson 别名（`alternate`）注解，完美兼容不同 Meting API 选线返回的数据结构，确保歌单列表与封面完美解析。

---

## 🛠️ 本地开发运行

### 1. 网页前端开发 (Web)
1. 确保您的电脑已安装 Python（或任意静态服务器）。
2. 在项目根目录下，启动本地静态服务器：
   ```bash
   python -m http.server 8000 --directory web
   ```
3. 打开浏览器，访问 **[http://localhost:8000](http://localhost:8000)**。

### 2. 纯原生 Android 客户端编译 (Native Android)
1. 打开 **Android Studio** (建议 Ladybug/Koala 或更新版本)。
2. 选择 **Open** 并指向 `android-native` 目录。
3. 等待 Gradle Sync 完成。
4. 连接真机或模拟器，点击 **Run** (或在终端执行 `.\gradlew.bat installDebug`) 编译并安装。

---

## 📜 项目历史更新日志

关于本项目从立项到如今的所有开发迭代明细、各项功能大大小小的优化与提交记录，请查阅独立的：
* **[DEVELOPMENT_HISTORY.md](file:///c:/Users/34377/Documents/Gemini%203.0/Open%20Music/DEVELOPMENT_HISTORY.md)** (包含每一个 commit 节点的超详细版本演进历史)

---

## 💖 致谢

本项目得以高效地开发，离不开以下优秀开源项目、字体及 API 服务的支持，特此致谢：

### 1. 开源库与框架
* **[Meting](https://github.com/metowolf/Meting)** (Author: [@metowolf](https://github.com/metowolf))：非常感谢作者提供如此强大且优雅的音乐 API 统一框架，使得我们可以方便地获取歌单、音频流链接及歌词数据。
* **[Capacitor](https://github.com/ionic-team/capacitor)** (Author: Ionic Team)：跨平台的原生容器桥梁，使得我们将 `web` 代码转化为原生 iOS/Android App 的构想得以低成本落地。

### 2. 公共数据及服务器镜像
* **[Meting API Mirror Server](https://api.qijieya.cn/)**：感谢公有网络镜像服务器提供者提供的 Meting 托管解析服务，保证了播放器能流畅请求网易云音乐的数据。
* **[网易云音乐 (NetEase Cloud Music)](https://music.163.com/)**：感谢网易云音乐平台丰富的音乐版权与歌词库支持，让该项目有优质的试听数据源。

### 3. 字体与设计元素
* **[Google Fonts - Inter](https://fonts.google.com/specimen/Inter)** (Author: Rasmus Andersson)：极佳的屏幕阅读无衬线字体，广泛用于播放器中的文本信息和滚动歌词。
* **[Google Fonts - Outfit](https://fonts.google.com/specimen/Outfit)** (Author: Outfit)：时尚的几何无衬线字体，用于播放器的标题和 Logo 设计。
* **[Material Design Icons](https://github.com/google/material-design-icons)**：部分控制按钮的设计参考了 Google Material 图标库，我们在代码中进行了 inline SVG 的手写精简重构。

---

## ⚠️ 免责声明 (Important Disclaimer)

> [!IMPORTANT]
> **请在使用本项目前仔细阅读以下条款：**
> 1. **学术研究性质**：本项目（Open Music）是一个开源的第三方网易云音乐播放器客户端，仅用于学术研究与个人学习，不得用于任何商业用途。
> 2. **数据无托管**：本项目本身不托管、存储、缓存或传播任何受版权保护保持的音视频资源，所有的音乐播放链接、歌词数据以及专辑封面均通过第三方公有 API 接口（如 Meting API）动态解析并获取。
> 3. **接口责任归属**：开发者与项目贡献者不对第三方接口的有效性、合法性或可用性做任何明示或暗示的保证。用户在使用自定义解析线路（如 `qijieya.cn` 或 `mikus.ink`）时，应自行承担相应责任，并自觉遵守当地法律法规。
> 4. **版权声明**：项目中请求的音乐、歌词、专辑封面等所有媒体资源的版权均归属于其原始版权所有者或相关音乐平台。若您认为本项目有任何侵权行为，请联系我们进行处理。

---

## ⚖️ 开源许可证 (License)

本项目采用 **[MIT License](https://opensource.org/licenses/MIT)** 许可证开源。
