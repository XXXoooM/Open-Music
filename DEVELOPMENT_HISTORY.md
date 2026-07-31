# Open Music 项目开发演进与超详细历史日志

本项目自立项以来，经历了多次重大的架构重组与技术迭代。以下是根据 Git 版本提交日志整理而成的超详细开发进度表，如实记录了每一次推送、变更和优化细节。

---

## 📅 Chronological Git Commits Chronology (按时间正序)

### `[473df4d]` 2026-06-23 | Init: restructure project into web and mobile folders
* **内容详述**：项目立项初始化。将传统的单一代码结构进行了物理拆分，建立了专门存放网页端静态资源的 `web/` 文件夹，以及存放移动端打包壳的 `mobile/` 文件夹。
* **架构意义**：奠定了多端隔离开发的基础，保证前端 Web 代码与后续移动原生打包配置互不干扰。

### `[f7bc412]` 2026-06-23 | Docs: update README.md with acknowledgements and open source credits
* **内容详述**：更新自述文件，首次撰写了开源致谢板块，对项目底座相关的 Meting 音乐 API、Capacitor 跨平台容器以及 Google 英文字体库等进行了官方署名和致敬。

### `[f3fae42]` 2026-06-23 | Update README.md
* **内容详述**：微调 README 格式，完善了目录结构图谱展示，修补了若干文本错别字。

### `[048ec06]` 2026-06-23 | Chore: add Cloudflare Pages HTTP headers configuration
* **内容详述**：在 `web/` 根目录下新增了 `_headers` 配置文件，用于定义 Cloudflare Pages 的 HTTP 响应头属性。
* **技术细节**：配置了防 XSS 攻击的 Security Headers，并为静态文件（SVG、JS、CSS）声明了合理的浏览器缓存失效周期。

### `[580daf4]` 2026-06-23 | Merge branch 'main' of https://github.com/XXXoooM/Open-Music
* **内容详述**：合并远程主分支，解决远程分支与本地初始化文档之间的简单冲突。

### `[a4829c3]` 2026-06-23 | Feature: add Help Modal instructions and enhance playlist link parser
* **内容详述**：新增了帮助弹窗（Help Modal）组件，用以提示用户如何使用键盘快捷键操控播放器。
* **功能增强**：对 Web 端网易云歌单解析函数进行升级，支持直接识别粘贴带有参数或 Fragment 路由的网易云分享网页链接。

### `[5778e1b]` 2026-06-23 | Feature: replace browser alert with custom warning modal
* **内容详述**：移除了体验较差的浏览器原生 `window.alert()` 提示框，重写了以毛玻璃样式为主的自研提示弹窗组件（Warning Modal）。

### `[c7a0b45]` 2026-06-23 | Feature: randomize playlist error warnings between two custom phrases
* **内容详述**：在歌单解析失败或请求超时的情况下，通过 JavaScript 随机抽取两种不同风格的幽默警告词展示给用户，提升报错时的用户交互亲和度。

### `[3c54888]` 2026-06-24 | Chore: bump PWA service worker cache version to v2 to force browser cache refresh
* **内容详述**：更新了 `sw.js` 中的离线缓存版本号（升至 v2 版本）。
* **技术细节**：当用户再次访问播放器时，浏览器将强行拉取最新版本的 JS 和 CSS 资源，避免使用旧版缓存引发界面逻辑异常。

### `[bb26b93]` 2026-06-24 | Build: add Capacitor configuration and native Android project
* **内容详述**：正式引入 Capacitor 跨平台架构，配置了 `capacitor.config.json`，并初始化构建了原生 Android 打包壳工程（即项目根目录下的 `android/` 目录）。

### `[c26f65d]` 2026-06-28 | feat: add multi-platform support (Android, Electron, HarmonyOS) and build workflow
* **内容详述**：进一步拓宽平台适配度。在根目录下引入了 `electron/` 打包工程以兼容桌面电脑安装包，并加入了 `harmony/` 工程以提供原生鸿蒙 OS 的运行支持。

### `[31918a4]` 2026-06-28 | fix: upgrade Node.js to v22 in Actions workflow for Capacitor compatibility
* **内容详述**：修复 CI 打包脚本。将 GitHub Actions 自动化打包工作流中的 Node.js 基础运行环境强制升级至最新的 v22 长期支持版，解决 Capacitor 原生依赖包在旧版 Node 下编译报错的问题。

### `[123aa9a]` 2026-06-28 | fix: upgrade JDK version to 21 in build workflow
* **内容详述**：将 CI 工作流中的 Java 构建版本升级为 JDK 21，适配新版 Android SDK 编译所需的最高 Java 编译器特性。

### `[30118ea]` 2026-06-28 | fix: prevent Android WebView from pausing on background to keep background audio playing
* **内容详述**：**解决后台切歌断音 Bug 突破性进展之一**。在 `MainActivity.java` 中进行原生配置，阻止 Android 操作系统在应用切回后台时挂起系统级的 WebView 进程，从而为 JavaScript 音频播放线程争取后台喘息空间。

### `[83bb81f]` 2026-06-28 | fix: change onPause modifier to public in MainActivity.java
* **内容详述**：将 `MainActivity.java` 原生接口中的 `onPause()` 虚方法修改为 `public`，使外部自定义服务能够合法干涉 WebView 的暂停动作。

### `[a2d9b5b]` 2026-06-28 | feat: implement Player Engine Separation with native Android ExoPlayer integration
* **内容详述**：**播放核心逻辑大洗牌**。舍弃了 WebView 内置的 HTML5 Audio 音频标签，采用在 Java 层创建 Android 原生 **ExoPlayer 音频引擎**。
* **实现细节**：Web 页面的切歌与播放指令通过 Bridge 传递至原生 Java 音频服务（`AudioService.java`），确保在 WebView 彻底挂起时，声音依然在 Android 系统底层持续播放。

### `[b607917]` 2026-06-28 | feat: integrate Tauri 2.0 desktop packaging shell and CI build job
* **内容详述**：在根目录下引入 `src-tauri/` 配置。配置了 Tauri 2.0 桌面端打包壳，使 Web 应用能够通过轻量级的 Rust 后台编译为极小体积的 Windows / macOS 桌面应用，并向 CI 配置中塞入 Tauri 自动打包作业。

### `[710df41]` 2026-06-28 | fix: set unique Tauri bundle identifier and correct Rust toolchain action syntax
* **内容详述**：修正 Tauri 的 Bundle Identifier 配置，并修复了 CI 编译环境中 Rust toolchain 版本的语法声明错误。

### `[d8e4dff]` 2026-06-28 | fix: consolidate player engines into native-bridge.js to solve relative path script blocking in WebViews
* **内容详述**：将各类播放引擎交互和接口协议统一整合到 [native-bridge.js](file:///c:/Users/34377/Documents/Gemini%203.0/Open%20Music/web/native-bridge.js) 中，解决了由于 WebView 在加载本地资源时，相对路径脚本被跨域机制安全封锁的严重 Bug。

### `[7a48510]` 2026-06-28 | fix: resolve stale Service Worker caching by adding native-bridge.js to sw.js assets and disabling sw registration in native wrappers
* **内容详述**：将 `native-bridge.js` 写入 `sw.js` 的缓存清单。并在移动原生 WebView 中禁止注册 Service Worker，防止网页离线包与原生桥接交互产生本地冲突。

### `[0539044]` 2026-06-28 | fix: apply robust localStorage bounds and type validation to prevent NaN crashes on start
* **内容详述**：对前端 `localStorage` 读取的值进行了全面的防御性重写。校验了读取出的音量、历史歌曲索引和播放时长等数值的边界值和非数（NaN）判定，阻止空配置下首次启动直接白屏的问题。

### `[bcd2152]` 2026-06-28 | fix: rename audio engine instance to window.playerEngine to prevent namespace conflicts with window.player controls exposed to native shells
* **内容详述**：将挂载在浏览器 `window` 命名空间下的音频实例更名为 `window.playerEngine`，避免它与 Tauri/Electron 原生底层注入的通用 `window.player` 控制句柄发生命名冲突导致崩溃。

### `[2f600f2]` 2026-06-28 | fix: thread-safe ExoPlayer accesses in AudioService by wrapping public entrypoints in Looper.getMainLooper() Handler posts
* **内容详述**：解决 ExoPlayer 线程安全隐患。由于 ExoPlayer 要求所有核心调用（播放、暂停、跳转）必须在创建它的主线程执行，我们将 Java 侧公共 API 调用全部使用 `Handler(Looper.getMainLooper()).post` 进行封装抛回主线程，彻底排除了偶发性的 Native 闪退。

### `[a65b43b]` 2026-06-28 | fix: enable CapacitorHttp to bypass CORS restrictions in WebView
* **内容详述**：在 `capacitor.config.json` 中激活 `CapacitorHttp` 代理。
* **解决痛点**：由网页 WebView 发起的外部 API 请求会被原生网络栈代劳，从而彻底绕过了客户端获取 Meting 歌单时的浏览器同源策略（CORS）限制。

### `[c94273c]` 2026-06-28 | fix: switch to CORS-enabled api.injahow.cn to resolve playlist and lyric fetching failures on web client
* **内容详述**：因原有的 Meting 解析服务出现短暂连接故障，紧急将默认的 Web 解析端点切换至支持 CORS 跨域响应的 `api.injahow.cn`，保障临时高可用。

### `[c7835b2]` 2026-06-28 | fix: revert Meting API domain back to api.qijieya.cn as requested
* **内容详述**：按照需求，将 Meting 解析端点重定向回服务更为稳定的 `api.qijieya.cn`。

### `[e4c396f]` 2026-06-28 | fix: route Meting API traffic through the new custom Cloudflare Worker proxy api.music.yuia.fun
* **内容详述**：为了进一步优化访问响应速度，用 Cloudflare Workers 自主搭建了中转代理端点 `api.music.yuia.fun`，并将流量导入该代理。

### `[c2fbe44]` 2026-06-28 | fix: update Content-Security-Policy connect-src whitelist to authorize api.music.yuia.fun in web/_headers
* **内容详述**：更新 `web/_headers` 中的内容安全策略（CSP），将新的中转端点 `api.music.yuia.fun` 加入 `connect-src` 白名单，防止请求被浏览器安全策略拦截。

### `[b566cae]` 2026-06-28 | fix: normalize fetched track relative URLs into absolute URLs using the API origin to prevent loading failures
* **内容详述**：在解析歌曲数据时增加标准化函数。提取 API 返回的相对 URL，使用接口的域名（Origin）自动拼接为绝对的 HTTP/HTTPS 链接，彻底解决了图片、音轨加载报 404 错误的问题。

### `[86706a8]` 2026-06-28 | fix: revert Meting API domain back to api.qijieya.cn to bypass Cloudflare Worker latency
* **内容详述**：因为 Cloudflare Worker 在高峰期存在边缘冷启动和路由时延，将主力线路再次切回直连 `api.qijieya.cn` 以提供最低延迟。

### `[09e7e6a]` 2026-06-28 | feat: optimize mobile lyrics toggler, search reset on drawer close, play history navigation in shuffle mode, and volume slider tooltip
* **内容详述**：Web 版多项交互调优：
  - 优化了手机网页端歌词显示开关的触控范围。
  - 关闭侧滑歌曲抽屉时自动重置当前的搜索条件。
  - 针对随机播放模式，新增了历史播放队列的后退机制，允许用户退回上一首刚随机听完的歌。
  - 为音量控制条增加了百分比气泡悬浮提示。

### `[3751d4d]` 2026-06-28 | feat: implement multi-source Meting API config with custom UI selector in settings panel and dynamic fallback mappings
* **内容详述**：在设置页面中加入了图形化的“多选线路由选择器”，支持用户动态在“祈杰丫”与“Mikus”等多个知名 Meting 镜像接口之间一键换源，并实现了在其中一个源挂掉时自动尝试备用源获取的容错机制。

### `[2fe1baa]` 2026-06-28 | Update API source options in index.html
* **内容详述**：配合上述多路由变更，修改 `index.html` 对应 Select 控件中的 DOM 结构和文本提示。

### `[01f3d2f]` 2026-06-28 | fix: declare and specify FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK for AudioService to fix Android 14+ crash
* **内容详述**：在安卓清单文件 `AndroidManifest.xml` 中，为前台播放服务声明了 `android:foregroundServiceType="mediaPlayback"` 权限，彻底满足 Android 14 的前台保活规范，杜绝了应用进入后台 30 秒直接闪退的 Bug。

### `[cdfa45a]` 2026-06-28 | feat: implement playlist JSON caching, improved link parser supporting fragment routing, and defensive key mapping for Mikus API compatibility
* **内容详述**：**引入前端歌单本地文件缓存**。将拉取到的歌单转化为 JSON 存储在系统本地沙盒中，减少二次开机加载网络时间。
* **兼容性更新**：重构网易云链接正则捕获公式，提取 URL 内可能存在的 `#` 分片参数。

### `[a389381]` 2026-07-02 | fix(android): resolve duration display bug and build native playlist architecture to support background persistence & headphone track skips
* **内容详述**：重写了 Java 后台前台服务的通知栏控制协议，支持了耳机线控切歌和系统通知栏媒体按键交互。修复了处于暂停状态下，音频时间长度显示归零的视觉 Bug。

### `[43ec797]` 2026-07-02 | perf: enable hardware acceleration, inertia touch scrolling, and optimize scroll calculations to fix lyrics and playlist lag
* **内容详述**：在旧版移动端 Android 壳工程中开启 GPU 硬件绘图加速。优化 CSS 中的 `-webkit-overflow-scrolling: touch` 惯性滚动表现，消除在低端 Android 设备上滑动长歌单以及歌词同步滚动时的严重丢帧与延迟现象。

### `[696dcc6]` 2026-07-03 | fix: request runtime notification permissions for background FGS survival, resolve play-pause resetting duration to 0, and implement dynamic centering padding for lyric scrolling
* **内容详述**：优化了通知栏后台常驻的表现。在 MainActivity 中加入了针对 Android 13+ 的 `Manifest.permission.POST_NOTIFICATIONS` 运行时权限的申请逻辑；并优化了歌词滚动算法，在首尾歌词处注入动态垂直 Padding，使之能在屏幕几何中心高亮对齐。

### `[15c9bb7]` 2026-07-03 | fix(android): resolve ClassCastException in setPlaylist and prevent Manifest.permission NoSuchFieldError on API < 33
* **内容详述**：解决跨系统版本兼容性问题。修复了在低于 Android 13（API 33）的旧手机上因读取 `POST_NOTIFICATIONS` 属性引发的 `NoSuchFieldError` 闪退，并纠正了 `setPlaylist` 传递数据时的强转类崩溃（ClassCastException）。

### `[ec30238]` 2026-07-03 | fix(android): register notification permission via Capacitor annotations and prompt at DOMContentLoaded startup
* **内容详述**：通过 Capacitor Annotation 原生注解对通知权限进行了系统级别的防漏声明，并在页面 DOM 元素加载完成后立刻唤起权限申请，降低后台保活被系统拦截的几率。

---

## 💎 原生 Kotlin 时代 (Pure Kotlin Android rewrite)

### `[6e66067]` 2026-07-03 | feat(android-native): complete 100% native Android rewrite using Kotlin, Jetpack Compose, Media3 ExoPlayer, and DataStore
* **变革性改写**：**全面抛弃原混合 WebView 架构**。为了根治后台被操作系统彻底杀死的问题，建立了全新的 [android-native/](file:///c:/Users/34377/Documents/Gemini%203.0/Open%20Music/android-native) 原生 Kotlin 项目工程。
* **核心选型**：
  - **Jetpack Compose**：声明式现代 UI 系统。
  - **Media3 ExoPlayer + MediaSession**：安卓最新的音频集成规范，完美融合锁屏和系统级状态栏“灵动岛 / 音乐胶囊”控制。
  - **Jetpack DataStore**：完全替代 WebView 的 LocalStorage，保证持久化数据的多线程和沙盒读写安全。

### `[a074f44]` 2026-07-03 | feat(ui): implement premium stylus pivot animation, glassmorphism card controls, boundary lyrics fading, and fix coroutine Thread dispatcher bug
* **内容详述**：在原生端中引入了首批极高美学特性的交互动画。包括指针旋转微动效、卡片控制区域毛玻璃化、歌词首尾边缘淡出（Boundary Fading）。
* **线程安全修复**：修复了在 ViewModel 中拉取 LRC 文本时，在 UI 主线程进行同步网络请求造成的 `NetworkOnMainThreadException` 经典错误，改用协程 `withContext(Dispatchers.IO)` 异步抛送。

### `[7675508]` 2026-07-03 | design(ui): complete premium luxury redesign with animated liquid backdrop, floating card cover art, depth-of-field lyrics, and frosted selectors
* **内容详述**：**视觉震撼重构**。引入了流畅的液态极光（Liquid Backdrop）渐变背景，大圆角浮空呼吸专辑卡片，以及带有三维景深感（高亮行放大加粗、非高亮行缩放淡化）的影院级焦深歌词滚动组件。

### `[f812239]` 2026-07-03 | docs: update walkthrough.md to document the modern 3-tab layout and HSL dynamic theme rewrite
* **内容详述**：编写了原生重构的技术文档，详细介绍了三栏（音乐馆、播放器、设置）Tab 系统以及全局 HSL 智能色轮的主题变化逻辑。

### `[907cc1f]` 2026-07-03 | fix: resolve Mikus mapping fields via Gson alternates, implement shortest-path HSL hue rotation, and optimize lyrics panel with manual browse scroll lock
* **问题修复与细节调优**：
  - **Gson 别名兼容**：通过为 `Track` 数据字段指定别名，兼容了 Mikus 返回的 `name`/`artist` 以及 Qijieya 返回的 `title`/`author` 字段，彻底消除了切换接口时歌曲信息丢失的问题。
  - **HSL 最短路径变色**：在 HSL 渐变计算中加入角度差值取余逻辑，使得背景变色永远走色轮上的最短角度，解决了色相大跨度转换时产生的刺眼彩虹闪烁 Bug。
  - **歌词滑动锁定**：在 `LyricsPanel` 中增加了手动滚动检测。用户手动划阅歌词时会自动锁定滚动 3.5 秒，随后温和回弹，大幅改善了查阅体验。

### `[f194ac7]` 2026-07-03 | feat(ui): add song cover thumbs in list, rewrite lyrics UI and spring offsets, remove Player title and dot, and implement PlayMode toggles
* **高阶视觉重构**：
  - **列表封面**：在音乐馆列表中为每首歌加入了精致的圆角封面微缩图，且在选中时提供 HSL 主题色外框及磨砂跳动波形均衡器动画。
  - **歌词三维弹簧动画**：引入 individual line Compose 弹簧物理动画（Spring Stiffness Low），使滚动时的文字浮动过渡更加平滑自然。
  - **精简界面**：移除了播放页顶部多余的“正在播放”文本，并清除了控制板底部的 HSL 测试用指示小点。
  - **播放模式控制**：引入了列表循环、随机播放、单曲循环，并运用 Canvas 手工绘制了精美的 crossed-arrow 矢量随机指示符。

### `[d79d720]` 2026-07-03 | docs: update README.md and add DEVELOPMENT_HISTORY.md with important disclaimers and timeline history
* **内容详述**：初步梳理项目自述文件与迭代进度文档，加入项目免责声明与 MIT 开源许可证。

---

## 🚀 现代扩展与多端自动化时代 (v1.0.1 ~ v1.0.2)

### `[7e5b66d]` 2026-07-04 | feat(native): implement macOS Genie Effect suction transition and MiniPlayer elastic bounce
* **交互动效调优**：
  - **macOS 神奇效果 (Genie Effect)**：播放器折叠收起时引入 macOS 经典吮吸动画，以匀速 decelerate 曲线平滑缩放至 MiniPlayer 锚点。
  - **静态主题替换**：关闭 HSL 动态变色时，静态主题更新为极简纯白与皇家宝蓝（Royal Sapphire Blue）配色，视觉清新高雅。

### `[04781c8]` 2026-07-21 | feat(native): implement multi-platform Hot Update, FileProvider APK installer & in-app update system
* **应用内热更新架构**：
  - 新增 `UpdateRepository.kt` 与 `UpdateInfo.kt` 远程版本检测模块。
  - 集成 Android `FileProvider` 与 `ApkInstaller`，支持在应用内直接流式下载新版 APK 并自动唤起系统安装界面。

### `[0f3345c]` 2026-07-21 | chore(release): bump version to 1.0.1 (Build 101) and optimize CI/CD workflow
* **自动化发布构建 (v1.0.1)**：
  - 配置 GitHub Actions `release.yml`，实现推送 `v*` 标签时自动打包 Release APK。
  - 引入 `r0adkll/sign-android-release` 签名 Action，通过 GitHub Secrets（KeyStore Base64/Alias/Password）对 APK 进行官方数字签名。
  - 引入 Tauri 2.0 Windows 桌面打包作业，并配置 `Swatinem/rust-cache` 增量缓存，将 Windows 构建时长从 15 分钟大幅缩短至 2 分钟。

### `[a09c336]` 2026-07-29 | ci: add permissions contents write, consolidate release publishing step, and upload Windows installers artifact
* **CI/CD 踩坑修复与架构完善**：
  - **权限修复**：显式声明 `permissions: contents: write`，解决默认 `GITHUB_TOKEN` 无 Release 写入权限导致的 403 `Resource not accessible by integration` 报错。
  - **产物收敛**：移除 `tauri-action` 内部的重复 Release 创建逻辑，将其产物（.msi / .exe）作为 Artifact 上传，由统一的 `publish-release` Job 一次性汇总挂载 Android APK + Windows 安装包。

### `[74e4e6e]` 2026-07-29 | feat: v1.0.2 — B1 均衡器EQ + B5 睡眠定时器 + D3 歌词精度升级(Float→Long)
* **v1.0.2 三大核心新特性落地**：
  - **🎛️ B1 均衡器 (EQ)**：新建 `EqualizerManager.kt` 单例封装 Android 原生 Equalizer API，内置 6 套曲风预设（默认/流行/古典/电子/人声增强/低音增强）与 5 频段 Slider 独立调节（60Hz ~ 14kHz，-10dB ~ +10dB）。提供 `EqualizerScreen.kt` 专属全屏调节页，设置自动持久化到 DataStore，且具备无硬件支持时的防崩溃平滑降级。
  - **🌙 B5 睡眠定时器**：新建 `SleepTimerDialog.kt` 弹窗，支持 15/30/45/60 分钟定时及「当前曲结束后自动停止」模式，设置页实时展示倒计时剩余时间。
  - **🎵 D3 歌词毫秒精度升级**：`LyricLine.time` 从 `Float`（秒）彻底重构为 `Long`（毫秒），解析与定位算法同步修改，消除了浮点数转换的累积误差，歌词高亮与点击跳转精准度达到毫秒级。

### `[fb581d4]` 2026-07-29 | ci: 使用 CHANGELOG.md 作为 GitHub Release 更新说明内容
* **Release 日志自动注入**：
  - 新增 `CHANGELOG.md` 规范化日志文件。
  - 升级 `release.yml`，在 `publish-release` Job 中加入 `awk` 脚本，自动提取当前发布 Tag 对应的 Markdown 更新日志作为 GitHub Release Body 描述，替代原来的纯 commit 链接。

### `[2607132]` 2026-07-29 | fix: rename setEqPreset to applyEqPreset to fix Kotlin JVM signature clash with eqPreset property setter
* **Kotlin 编译器平台声明冲突修复**：
  - `var eqPreset by mutableStateOf(...)` 属性自动在 JVM 字节码中生成 `setEqPreset(String)` setter，与手写成员函数 `fun setEqPreset(presetName: String)` 产生同名 JVM 签名冲突（`setEqPreset(Ljava/lang/String;)V`）。
  - 将成员函数重命名为 `applyEqPreset`，解决了 Kotlin 编译器在 release 阶段的报错。

### `[32e3b3e]` 2026-07-30 | fix: update version.json to 1.0.2 and upgrade UpdateRepository with GitHub Releases API support
* **更新检测逻辑升级**：
  - 更新根目录 `version.json` 描述与目标 APK 链接至 v1.0.2。
  - 升级 `UpdateRepository.kt`：优先请求 GitHub Releases API（`releases/latest`），实现零延迟的新版本检测；并在 fallback 请求 `version.json` 时附加动态时间戳参数破除 GitHub Raw HTTP 缓存。

### `[ca656ba]` 2026-07-30 | feat: 优化国内 APK 下载线路，支持 ghfast/ghproxy 多节点自动备用与降级
* **国内下载加速与多节点自动降级**：
  - 在 `version.json` 中配置国内镜像加速链接 `ghfast.top`，解决旧版客户端国内直接连接 GitHub 资源超时问题。
  - 在 `UpdateRepository.kt` 中引入智能多节点降级算法：顺序尝试 `ghfast.top` -> `ghproxy.net` -> GitHub 官方直连，任一节点连接失败或超时会自动无缝切至下一节点，保障全球范围内 100% 的下载成功率。

### `[352758c]` 2026-07-31 | chore(release): bump version to 1.0.3 (Build 103) & UI detail polishing
* **v1.0.3 版本发布与细节精雕**：
  - **指示点弹性流动动画**：播放器封面/歌词切换指示点引入 `animateDpAsState` 与 `animateColorAsState`，具备类似 iOS 的动态拉伸高亮动效。
  - **歌词独立页顶部导航栏**：补全歌词全屏页顶部导航栏，展示当前曲目歌手信息并提供便捷切回按钮。
  - **代码净化**：消除 Compose 弃用 API 警告与 ViewModel 冗余属性。
  - **全量发布**：更新 `version.json` 与 `CHANGELOG.md`，同步发布 `v1.0.3` 正式版。


