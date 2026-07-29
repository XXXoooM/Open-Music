# Open Music 播放器应用改进计划

已为你整理好完整的 Markdown 格式文档。其中附录的 4 个 Android 官方参考链接均为境外站点，当前网络环境无法直接获取内容，文档中已保留原链接并补充了说明，你可通过合规方式后续查阅。

```markdown
# Open Music 播放器应用改进计划

> 基于对项目源码的全面审核，本文档梳理了 **Critical（致命）**、**Major（重大）** 和 **Minor（优化）** 三个级别的改进方向，并给出了具体的修复建议与优先级。

---

## 📋 目录

1. [Critical — 必须立即修复](#critical--必须立即修复)
2. [Major — 严重影响体验或架构规范](#major--严重影响体验或架构规范)
3. [Minor — 代码质量与可维护性](#minor--代码质量与可维护性)
4. [长期架构演进](#长期架构演进)
5. [优先级排序与实施路线图](#优先级排序与实施路线图)
6. [附录：参考资源](#附录参考资源)

---

## 🚨 Critical — 必须立即修复

### 1. 歌词页点击事件被拦截
**文件**：`PlayerScreen.kt`  
**问题**：歌词页（HorizontalPager 第 2 页）整个 `Column` 添加了 `.clickable`，导致 `LyricsPanel` 中每行歌词的点击（跳转播放）完全失效。  
**影响**：用户无法通过点击歌词定位到对应时间点，核心交互功能缺失。  
**修复方案**：移除 `Column` 的 `.clickable`，在顶部增加独立的返回按钮（如 `IconButton`），或使用双击手势返回封面页。

---

### 2. 后台播放无前台通知（违反 Android 规范）
**文件**：`PlaybackService.kt`  
**问题**：未调用 `startForeground`，也未创建 `MediaNotification`。Android 8.0+ 后台服务会快速被系统杀死，且用户无法从通知栏控制播放。  
**影响**：切到后台后播放随时中断，应用不合规。  
**修复方案**：在 `onCreate` 中构建 `MediaNotification` 并调用 `startForeground`。

---

### 3. 状态栏颜色与动态主题不一致
**文件**：`Theme.kt`  
**问题**：`OpenMusicTheme` 中状态栏颜色固定为 `DarkColorScheme.background`，未跟随 `HslColorPalette.background`。  
**影响**：切换 HSL 主题后，状态栏与 App 背景色脱节，视觉突兀。  
**修复方案**：将 `palette` 传入 `OpenMusicTheme`，在 `SideEffect` 中动态设置 `window.statusBarColor`。

---

### 4. 缺少 `BackHandler` 导入及自定义实现冗余
**文件**：`MainActivity.kt`  
**问题**：手动实现的 `BackHandler` 未导入 `LocalOnBackPressedDispatcherOwner`，且存在编译风险。  
**影响**：无法正常处理返回键，可能导致应用无响应或无法退出 Player 页。  
**修复方案**：直接使用 `androidx.activity.compose.BackHandler`（需添加依赖），替换自定义实现。

---

## ⚠️ Major — 严重影响体验或架构规范

### 5. 歌词页缺失播放控制栏
**文件**：`PlayerScreen.kt`  
**问题**：切换到歌词页后，用户无法暂停/切歌/拖动进度条，必须返回封面页操作。  
**影响**：交互割裂，用户需反复切换页面，体验不佳。  
**修复方案**：在歌词页底部添加 `LyricsPlaybackControls`（已实现但未使用），或复用 `PlaybackControls`。

---

### 6. 页面指示点（dots）不动态更新
**文件**：`PlayerScreen.kt`  
**问题**：两个圆点始终固定颜色（第一个高亮），未根据 `pagerState.currentPage` 变化。  
**影响**：用户无法得知当前所在页面，暗示性 UI 失效。  
**修复方案**：使用 `if (pagerState.currentPage == 0) palette.primary else ...` 动态着色。

---

### 7. 未遵循“状态管理”规范
**文件**：`MainViewModel.kt`  
**问题**：使用 `mutableStateOf` 暴露状态，未使用 `StateFlow` + `collectAsStateWithLifecycle()`。  
**影响**：后台时 UI 持续重组，浪费资源；且不符合团队约定的“StateFlow 统一管理”规范。  
**修复方案**：将 `playlist`、`currentTrackIndex` 等改为 `StateFlow`，在 UI 中安全收集。

---

### 8. 未使用依赖注入（Hilt）
**影响范围**：全项目  
**问题**：手动在 `MainViewModel` 中实例化 `SettingsManager` 和 `MetingRepository`，难以测试和模块替换。  
**影响**：违背架构分层原则，耦合度高。  
**修复方案**：引入 Hilt，将 `SettingsManager`、`Repository`、`PlaybackService` 等通过构造函数注入。

---

### 9. 时间类型使用 `Float` 存在精度风险
**文件**：`LyricLine.kt`、`LyricParser.kt`  
**问题**：`time` 使用 `Float` 表示秒，在 UI 中乘以 1000 转为毫秒，浮点运算可能产生误差，导致跳转不准。  
**影响**：歌词点击跳转位置可能偏移几毫秒至几十毫秒。  
**修复方案**：改为 `Long` 存储毫秒值，解析时直接计算毫秒。

---

### 10. “清除缓存”功能未实现
**文件**：`SettingsScreen.kt`  
**问题**：点击“清除应用缓存”仅弹出 Toast，未真正清理 Coil、OkHttp 或歌词缓存。  
**影响**：功能形同虚设，用户无法释放存储空间。  
**修复方案**：调用 `Coil` 的 `ImageLoader.evictFromMemory()` 和 `evictFromDisk()`，以及清除临时文件目录。

---

### 11. 播放模式未持久化
**文件**：`MainViewModel.kt`  
**问题**：`playMode` 仅在内存中，应用重启后恢复默认 `LIST_LOOP`。  
**影响**：用户偏好丢失，每次需重新设置。  
**修复方案**：在 `SettingsManager` 中添加 `KEY_PLAY_MODE`，并在模式切换时保存/恢复。

---

## 🧹 Minor — 代码质量与可维护性

| 问题描述 | 涉及文件 | 优化建议 |
|----------|----------|----------|
| 魔法数字（3500ms、48.dp、24.dp 等） | `LyricsPanel.kt` | 提取到 `ComponentStyles` 或单独常量对象，提高可维护性 |
| 缺少 `@Preview` 注解 | 所有 `@Composable` 组件 | 为每个可组合项添加 `@Preview`，加速 UI 开发 |
| 歌词滚动公式可能不准确 | `LyricsPanel.kt` | 使用 `LazyListState.layoutInfo` 直接计算当前中心项，替代手动公式，更可靠 |
| MediaController 释放时机 | `MainViewModel.onCleared()` | 已实现释放逻辑，建议在 `onCleared` 前取消所有协程，避免内存泄漏 |
| 权限未在代码中动态请求 | `AndroidManifest.xml`（未提供） | 需动态请求 `READ_MEDIA_AUDIO`（Android 13+）或 `READ_EXTERNAL_STORAGE`（旧版）及 `POST_NOTIFICATIONS` |
| 网络请求无超时/重试机制 | `MetingRepository.kt` | 在 OkHttp 客户端添加 `connectTimeout`、`readTimeout` 和重试拦截器，增强稳定性 |
| HSL 颜色动画中的累积误差 | `HslTheme.kt` | 当前实现可接受，可考虑使用 `Animatable` 直接驱动 hue，避免 `LaunchedEffect` 累积 |
| 一行多时间标签处理逻辑 | `LyricParser.kt` | 逻辑正确，建议补充注释说明处理规则，便于后续维护 |
| Shuffle 图标语义不明 | `PlayModeButton.kt` | 可替换为 `Icons.Shuffle` 或更直观的图标，降低用户认知成本 |
| MiniPlayer 可能被底部导航遮挡 | `MainActivity.kt` | 在 `Box` 中调整子元素顺序，确保 MiniPlayer 渲染在顶层 |

---

## 🏗️ 长期架构演进

- **引入 Hilt 依赖注入**：统一管理 `SettingsManager`、`MetingRepository`、`ExoPlayer`、`MediaSession` 等核心实例，提升可测试性与模块解耦能力。
- **迁移至 StateFlow/SharedFlow**：将 ViewModel 中所有 `mutableStateOf` 替换为 `StateFlow`，并结合 `repeatOnLifecycle` 优化 UI 生命周期与更新性能。
- **模块化拆分**：按功能领域（播放引擎、数据层、UI 层）拆分为独立 Gradle 模块，支撑多人协作与后续功能扩展。
- **完善单元测试**：为核心业务逻辑（歌词解析、播放模式切换、状态计算）编写单元测试，保障核心功能稳定性。
- **性能监控与优化**：集成 `Compose Compiler Metrics` 和 `Benchmark` 工具，持续优化组件重组频率与动画性能。

---

## 📌 优先级排序与实施路线图

| 阶段 | 任务清单 | 预估工时 |
|------|----------|----------|
| **Phase 1（紧急修复）** | ① 修复歌词页点击拦截<br>② 补充前台播放通知<br>③ 同步状态栏动态颜色<br>④ 替换官方 BackHandler 实现 | 1 天 |
| **Phase 2（体验优化）** | ⑤ 歌词页新增播放控制栏<br>⑥ 实现动态页面指示点<br>⑦ 播放模式持久化存储 | 1 天 |
| **Phase 3（架构升级）** | ⑧ 状态管理迁移至 StateFlow<br>⑨ 项目引入 Hilt 依赖注入<br>⑩ 时间类型统一替换为 Long | 2~3 天 |
| **Phase 4（完善细节）** | ⑪ 实现真实缓存清理能力<br>⑫ 补充组件预览与常量提取<br>⑬ 添加动态权限与网络超时配置 | 1 天 |
| **Phase 5（测试与发布）** | ⑭ 核心逻辑单元测试覆盖<br>⑮ 打包测试与遗留问题修复 | 1~2 天 |

---

## 📎 附录：参考资源

> 以下均为 Android 官方境外站点文档，当前网络环境可能无法直接访问。
- [Media3 官方文档](https://developer.android.com/media/media3)
- [Jetpack Compose 状态管理](https://developer.android.com/jetpack/compose/state)
- [Hilt 依赖注入指南](https://developer.android.com/training/dependency-injection/hilt-android)
- [Android 后台播放最佳实践](https://developer.android.com/guide/topics/media/media3/exoplayer/background)

---

> 本改进计划将根据项目进展持续更新。如有疑问，请参考各文件中的代码注释或联系技术负责人。
```

> （注：部分内容可能由 AI 生成）
