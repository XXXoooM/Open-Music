# Open Music - 开放式音乐

一个大道至简、拥有高端毛玻璃视觉风格的轻量级 Web 音乐播放器。支持 PWA（渐进式网页应用），可在移动端及桌面端直接“安装”为独立的本地 App 运行。

同时，项目在最新版本中已经完成了 **100% 纯原生 Android 客户端重构**，提供了极致流畅的原生系统播放和灵动岛胶囊状态同步体验。

---

## 📂 目录结构隔离说明

为了保持项目的高内聚低耦合，我们对网页端、混合移动包装端以及全新的纯原生端进行了目录层面的物理隔离：

```text
├── android-native/       # 100% 原生 Android 客户端代码 (Kotlin / Jetpack Compose / Media3)
│   ├── app/              # 纯原生 Android 源代码及资源文件
│   ├── build.gradle.kts  # Gradle 依赖构建脚本
│   └── settings.gradle.kts # Gradle 项目插件仓库配置
├── web/                  # 网页前端代码 (HTML / CSS / JS / PWA 配置文件)
│   ├── index.html        # 主页面与 SVG 矢量图标
│   ├── style.css         # 暗黑毛玻璃样式系统与动效
│   ├── app.js            # 音频控制、歌词同步解析、歌单导入与快捷键逻辑
│   ├── manifest.json     # PWA 应用参数清单
│   └── sw.js             # 离线缓存 Service Worker
├── mobile/               # 移动端混合包装目录（Capacitor 编译包）
│   └── README.md         # 使用 Capacitor 将 web 目录编译为 APK / IPA 的打包教程
├── DEVELOPMENT_HISTORY.md # 项目详细迭代开发与更新历史记录
└── README.md             # 本项目自述文件
```

---

## ⚡ 核心功能

### 1. 网页 / 混合包装端功能 (Web & PWA)
* **网易云 API 接入**：动态解析获取歌单，并本地缓存您的歌单及音量偏好。
* **自定义歌单导入**：在列表设置面板中，输入任意网易云公开歌单 ID 即可载入您专属的歌曲。
* **精确歌词同步**：支持 LRC 毫秒级歌词同步、视觉毛玻璃遮罩高亮，并支持 **点击歌词跳转播放进度（Click-to-Seek）**。
* **原生 HSL 智能取色**：不依赖任何第三方库，根据歌名与歌手字指纹哈希计算出最契合的霓虹渐变主色调，渲染环境光效。
* **PWA 应用安装**：在浏览器打开时，可直接“添加到主屏幕”，生成桌面图标以 Standalone 无地址栏的独立 App 形式运行。

### 2. 纯原生 Android 客户端功能 (100% Native)
* **高性能音频引擎 (Jetpack Media3)**：底层使用原生 ExoPlayer 进行音频渲染与缓存，支持完整的后台保活和自动锁屏音频焦点（如来电自动暂停、微信语音挂起）。
* **状态栏“灵动岛 / 音乐胶囊”同步**：与系统 MediaSession 进行实时双向通信，原生支持小米 HyperOS 焦点通知、OPPO ColorOS 流体云和 vivo OriginOS 原子通知的状态栏小胶囊播放控制。
* **极奢 HSL 调色板引擎**：所有界面和高亮元素均使用动态 HslPalette 驱动，切歌时应用主色调会在 1.2 秒内以 FastOutSlowIn 物理曲线平滑过渡，并采用最短弧度插值算法排除了颜色跳转闪烁。
* **影院焦深歌词滚动**：歌词滚动字重和透明度会根据与当前高亮行的物理距离（Focal Distance）做 3D 悬浮和缩放淡出。内置手动拖阅锁定机制，浏览歌词 3.5 秒后才会回弹。
* **支持播放模式切换**：完美集成列表循环、随机播放、单曲循环。模式状态与安卓系统锁屏及通知栏波浪条完全同步。

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
* **[DEVELOPMENT_HISTORY.md](file:///c:/Users/34377/Documents/Gemini%203.0/Open%20Music/DEVELOPMENT_HISTORY.md)** (开发演进与更新历史日志)

---

## ⚠️ 免责声明 (Important Disclaimer)

> [!IMPORTANT]
> **请在使用本项目前仔细阅读以下条款：**
> 1. **学术研究性质**：本项目（Open Music）是一个开源的第三方网易云音乐播放器客户端，仅用于学术研究与个人学习，不得用于任何商业用途。
> 2. **数据无托管**：本项目本身不托管、存储、缓存或传播任何受版权保护的音视频资源，所有的音乐播放链接、歌词数据以及专辑封面均通过第三方公有 API 接口（如 Meting API）动态解析并获取。
> 3. **接口责任归属**：开发者与项目贡献者不对第三方接口的有效性、合法性或可用性做任何明示或暗示的保证。用户在使用自定义解析线路（如 `qijieya.cn` 或 `mikus.ink`）时，应自行承担相应责任，并自觉遵守当地法律法规。
> 4. **版权声明**：项目中请求的音乐、歌词、专辑封面等所有媒体资源的版权均归属于其原始版权所有者或相关音乐平台。若您认为本项目有任何侵权行为，请联系我们进行处理。

---

## ⚖️ 开源许可证 (License)

本项目采用 **[MIT License](https://opensource.org/licenses/MIT)** 许可证开源。
