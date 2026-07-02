# Open Music 开发演进与历史更新日志

本项目从一个极简的 Web 静态播放器，逐步经历了**多端混合封装、多核播放引擎分离、高性能 Native 桥接重构**，最终演进为**双轨并行（极简 Web 版 + 100% 纯原生 Kotlin Android 版）**的完整现代音乐播放器。

以下是自项目初始化以来，所有更新推送、合并及大大小小优化的完整历史日志。

---

## 📅 版本迭代历史

### 🚀 阶段 1：网页端起步与交互搭建 (Web Initialization)
* **RESTFUL 目录结构确立**：完成了 `web/` 与 `mobile/` 目录的物理隔离设计，保证高内聚低耦合。
* **暗黑毛玻璃美学设计**：编写了 `style.css`，确立了无边框、高斯模糊容器、亮色描边与霓虹渐变的暗黑磨砂美学系统。
* **基础交互逻辑实现**：
  - 编写了 `app.js`，基于 HTML5 Audio 实现歌曲播放与暂停。
  - 实现了 **LRC 毫秒级歌词解析器**，并开发了点击歌词跳转播放进度（Click-to-Seek）的高阶交互。
  - 实现了基于 DOM 元素的歌词居中滑动与高亮渐变。
* **体验微调与兜底**：
  - 新增了自定义错误警示弹窗（Modal），随机化错误句式，替换了浏览器原生 Alert。
  - 新增了应用帮助（Help）弹窗，介绍了空格键、方向键、L/S 快捷键等操作说明。
* **PWA 支持**：加入了 `manifest.json` 与 Service Worker 缓存脚本 `sw.js`，使网页版可离线运行且能被手机/桌面浏览器“直接添加安装”为本地应用。

---

### 📦 阶段 2：混合端封装与多端部署 (Hybrid Shell & CI/CD)
* **引入 Capacitor 原生桥接**：配置了 Capacitor 移动端环境，生成了初始的原生 Android 项目包。
* **多平台兼容配置**：加入了对 Electron 桌面壳、HarmonyOS 鸿蒙原生包装的适配文件与打包流程。
* **自动化流水线 (CI/CD)**：在 GitHub Actions 工作流中，将 Node.js 升级至 v22，JDK 升级至 21，修复了安卓自动化打包脚本的依赖冲突。

---

### ⚡ 阶段 3：多核播放引擎分离与 WebView 保活 (Player Engine Separation)
* **ExoPlayer 原生引擎接入**：
  - **核心修复**：由于 Android WebView 在进入后台时会挂起 JavaScript 音频线程，导致原有混合应用退回桌面即断音。
  - **播放分离重构**：在 Java 层引入了 Android **ExoPlayer 引擎**，将播放能力彻底从 WebView 提取至原生层，并通过 `AudioService.java` 管理后台服务生命周期。
  - **Java 方法修改**：将 `MainActivity.java` 中的 `onPause` 方法修饰符改为 `public`，防止 WebView 挂起时阻塞原生层。
* **原生桥接脚本 (`native-bridge.js`)**：
  - 编写了统一的数据交换通道，解决了相对路径脚本在不同 WebView 中的拦截加载问题。
  - 将 Service Worker 与 `native-bridge.js` 绑定，解决了缓存更新不及时导致的白屏 bug。
* **防奔溃与容错处理**：
  - 在 `AudioService` 原生层引入 `Handler(Looper.getMainLooper())` 机制，保证所有的 ExoPlayer 实例操作均在主线程执行，排除了多线程并发控制带来的闪退隐患。
  - 增强了 `localStorage` 的启动数据类型验证，防止了在无网/空值状态下产生 `NaN` 数据导致开机崩溃。

---

### 🌐 阶段 4：CORS 跨域绕过与 Meting 选线调优 (API Configuration)
* **跨域绕过**：在原生 Java 桥接层开启 `CapacitorHttp` 机制，强制把 WebView 的网络请求代理到原生 HTTP 客户端，完美绕过了浏览器的 CORS 跨域限制，使得本地调试和任何公共 Meting 接口均可正常请求。
* **多源路由切换**：
  - 在设置面板中加入了 API 接口线路切换选项（支持 **祈杰丫路线** 与 **Mikus 路线**）。
  - 对 API 获取的歌曲数据、封面和 LRC 歌词相对路径进行了智能补全（Normalize URL），使用接口 Origin 动态生成绝对地址，彻底修复了部分源歌曲播放失败的问题。
  - 为了避开 Cloudflare Worker 代理带来的延迟，将主选线默认重定向回高性能的 `api.qijieya.cn`。

---

### 📱 阶段 5：后台存活调优与通知栏适配 (FGS & Background Tuning)
* **Android 14+ FGS 适配**：在 `AndroidManifest.xml` 中为 `AudioService` 显式声明并添加了 `foregroundServiceType="mediaPlayback"` 权限，修复了应用在 Android 14 设备上进入后台被系统立即杀死的 FATAL 闪退 Bug。
* **通知栏进度与切歌跳过**：
  - 重写了通知栏绑定逻辑，将 Android 媒体控制器锁屏面板切歌（Skipping）和耳机线控按钮与 ExoPlayer 原生事件进行双向绑定。
  - 修复了切歌和暂停时进度条在 0 处跳跃的 Durations Bug。
* **性能与滑动流畅度优化**：
  - 开启了 WebView 的 GPU 硬件加速，优化了列表触控惯性滚动（Inertial Scrolling）和歌词滚动偏移像素计算，彻底解决了滑动不流畅和卡顿的问题。
  - 优化了运行时动态通知权限的申请逻辑，通过 Capacitor 原生注解，在网页就绪时主动拉起通知框。

---

### 💎 阶段 6：100% 纯原生 Kotlin Android 应用开发 (Native Kotlin Overhaul)
* **全新 Kotlin 重构**：
  - 抛弃了原有 Capacitor Web 混合架构，在 [android-native/](file:///c:/Users/34377/Documents/Gemini%203.0/Open%20Music/android-native) 目录下从零构建了 **100% 原生 Kotlin 移动客户端**。
  - 全面使用 **Jetpack Compose 声明式 UI 架构** 与 **Jetpack Media3 (ExoPlayer + MediaSession)**。
  - 实现了在小米 HyperOS、OPPO ColorOS 等机型上原生状态栏拉起“音乐胶囊 / 灵动岛”控制器的能力。
* **本地沙盒持久化**：使用 **Jetpack DataStore** 替代 LocalStorage，在沙盒中序列化保存用户歌单列表、选线状态和最后听歌进度。
* **HSL 最短路径动态变色引擎**：
  - 开发了 [HslTheme.kt](file:///c:/Users/34377/Documents/Gemini%203.0/Open%20Music/android-native/app/src/main/java/com/openmusic/app/ui/theme/HslTheme.kt) 色彩主题变换系统，根据歌曲 Hash 动态调配 UI 背景与高亮。
  - 实现了 **最短路径圆环角度插值算法**，消除了切歌变色时颜色在大范围内跳转闪烁（彩虹闪烁）的 HSL 严重视觉缺陷。
* **三栏主导航框架与全局 MiniPlayer**：
  - 主页划分为：**音乐馆**（歌单列表）、**播放器**、**设置**三个 Tab。
  - 音乐馆歌曲列表加入了**圆角封面缩略图**，并为正在播放的歌曲旁开发了**实时跳动波形的 HSL 均衡器动画**。
  - 在非播放页底部，悬浮展示带有毛玻璃效果的 MiniPlayer 袖珍播放卡片。
* **影院焦深歌词与滑动锁定**：
  - 重构了歌词滚动算法，通过 `graphicsLayer` 绑定了每个 Lyric 独立一行的 Y轴弹簧与 Scale 动效。
  - 实现了**滑动锁定机制**：用户滑动浏览歌词时，自动挂起定位 3.5 秒，点击任意行立即 seek 播放并解锁回弹。
* **多接口数据兼容**：在 `Track` 类中使用 Gson 的别名（`alternate`）注解，同时兼容了 Qijieya 接口（`title`/`author`）与标准 Meting 接口（`name`/`artist`），彻底解决了 Mikus 线路导入歌曲无标题/歌手的陈年 Bug。
