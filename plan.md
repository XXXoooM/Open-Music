好的！下面是一份完整的、可直接保存为 `.md` 文件的 **React 19 + Tauri 2 苹果风音乐播放器开发计划**。你可以将以下内容复制，保存为 `plan.md` 或 `README.md`，按步骤执行。

---

```markdown
# 🎵 React 19 + Tauri 2 音乐播放器开发计划 (Apple 风格)

> 一份面向服务端数据流、基于 React 19 和 Tauri 2 的现代音乐播放器完整开发指南。

---

## 📌 项目概述

- **目标**：打造一款跨平台（Windows / macOS / Linux）音乐播放器，UI 风格类似 Apple Music，支持在线音乐服务（如 Apple Music、Spotify 等）的登录、搜索、播放、歌单管理。
- **核心理念**：利用 React 19 的新特性（`use`、Actions、Suspense）优雅处理异步数据流，结合 Tauri 2 的轻量后端（Rust）实现高性能音频播放和本地数据持久化。
- **最终交付**：一个可安装的桌面应用，体积小、启动快、界面精致。

---

## 🧩 技术栈一览

| 层级               | 技术选型                       | 版本      | 说明                                                         |
| ------------------ | ------------------------------ | --------- | ------------------------------------------------------------ |
| **桌面框架**       | Tauri                          | v2        | 轻量、安全、跨平台                                           |
| **前端框架**       | React                          | **19**    | 利用 `use` Hook、Actions 等新特性                            |
| **前端语言**       | TypeScript                     | v5        | 类型安全，提升代码质量                                       |
| **构建工具**       | Vite                           | v5        | 极速热更新，与 Tauri 集成良好                               |
| **UI 组件库**      | shadcn/ui                      | v4        | 无头组件，完美搭配 Tailwind，完全自定义样式                 |
| **样式方案**       | Tailwind CSS                   | v4        | 实用优先，支持 OKLCH 色彩，便于实现毛玻璃效果               |
| **状态管理**       | Zustand                        | v5        | 轻量级全局状态，用于播放器控制、UI 状态                     |
| **数据获取 & 缓存**| TanStack Query                 | v5        | 服务端状态管理，支持 Suspense，自动缓存与重试              |
| **路由**           | React Router                   | v6        | 管理歌单、搜索、设置等页面                                  |
| **类型安全桥接**   | tauri-specta                   | -         | 从 Rust 命令自动生成 TypeScript 类型                        |
| **后端语言**       | Rust                           | 最新稳定  | 音频引擎、API 代理、本地缓存                                |
| **音频解码**       | Symphonia                      | 0.5       | 纯 Rust 解码 MP3 / FLAC / AAC 等格式                        |
| **音频输出**       | cpal + rodio                   | 最新      | 低延迟音频输出                                              |
| **HTTP 客户端**    | reqwest                        | 0.12      | 异步下载音频流 / 调用 API                                  |
| **数据库**         | SQLite (via tauri-plugin-sql)  | -         | 存储歌单、收藏、播放历史等                                 |
| **包管理器**       | pnpm 或 bun                    | 最新      | 快速依赖安装                                               |

---

## 📁 项目结构

```
my-music-player/
├── src/
│   ├── api/                     # API 请求封装
│   │   ├── client.ts            # fetch / axios 实例
│   │   └── music-service.ts     # 与后端代理通信
│   ├── components/              # React 组件
│   │   ├── ui/                  # shadcn/ui 基础组件
│   │   ├── Player/              # 播放控制组件
│   │   │   ├── PlayerBar.tsx
│   │   │   ├── Progress.tsx
│   │   │   └── VolumeControl.tsx
│   │   ├── Sidebar/             # 侧边导航
│   │   ├── Playlist/            # 歌单相关
│   │   ├── Search/              # 搜索
│   │   └── Settings/            # 设置
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── usePlayer.ts         # 播放逻辑
│   │   ├── useAuth.ts           # 认证
│   │   └── useMediaSession.ts   # 系统媒体控件
│   ├── stores/                  # Zustand stores
│   │   ├── playerStore.ts
│   │   ├── settingsStore.ts
│   │   └── authStore.ts
│   ├── lib/                     # 工具库
│   │   ├── queryClient.ts       # TanStack Query 实例
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── styles/                  # 全局样式
│   │   ├── globals.css
│   │   └── fonts.css            # 自定义字体
│   ├── types/                   # TypeScript 类型定义
│   │   ├── track.d.ts
│   │   └── playlist.d.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── src-tauri/                   # Rust 后端
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs               # 插件注册
│   │   ├── commands.rs          # 暴露给前端的 Tauri 命令
│   │   ├── audio/               # 音频引擎
│   │   │   ├── mod.rs
│   │   │   ├── decoder.rs       # Symphonia 解码
│   │   │   └── player.rs        # cpal + rodio 输出
│   │   ├── proxy/               # API 代理（转发请求，隐藏密钥）
│   │   ├── db/                  # SQLite 操作
│   │   └── cache/               # 本地音频缓存
│   ├── Cargo.toml               # Rust 依赖
│   └── tauri.conf.json          # Tauri 配置（无边框、权限等）
├── public/                      # 静态资源（图标等）
├── package.json
├── pnpm-workspace.yaml
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── .env.example
```

---

## ⚙️ 环境准备

1. **安装 Node.js**（≥ v22）和 **pnpm**（或 bun）
2. **安装 Rust**（≥ 1.85.0）：[https://rustup.rs/](https://rustup.rs/)
3. **安装 Tauri CLI**（可选）：`cargo install tauri-cli`
4. **创建项目**（推荐直接使用社区模板，见后文）

---

## 🚀 快速启动（使用模板）

我推荐使用以下任一模板作为起点，它们已经集成了 React 19 + Tauri 2 的最佳实践：

| 模板 | 特点 | 克隆命令 |
|------|------|----------|
| **dannysmith/tauri-template** | 功能最全：全局快捷键、偏好设置、多窗口、自动更新等 | `git clone https://github.com/dannysmith/tauri-template.git` |
| **kvnxiao/tauri-tanstack-start-react-template** | 集成 TanStack Start，文件系统路由 | `git clone https://github.com/kvnxiao/tauri-tanstack-start-react-template.git` |
| **gannonh/tauri-app** | 内置 Vitest + Playwright 测试 | `git clone https://github.com/gannonh/tauri-app.git` |
| **plexify**（参考项目） | 音乐播放器完整实现，Plex 客户端 | `git clone https://github.com/tsm-1/plexify.git` |

**启动步骤**：
​```bash
cd your-project
pnpm install          # 或 bun install
pnpm tauri dev        # 启动开发模式
pnpm tauri build      # 打包生产版本
```

---

## 📅 分阶段开发计划

### 阶段一：基础框架与苹果风格 UI（1-2 周）

- [ ] **无边框窗口**：配置 `tauri.conf.json` 中 `windows.decorations: false`，实现自定义标题栏（红黄绿三色按钮）。
- [ ] **毛玻璃效果**：使用 `window-vibrancy` 插件（macOS 和 Windows 亚克力），配合 CSS `backdrop-filter` 实现内容区毛玻璃。
- [ ] **字体**：内嵌 `SF Pro Display` 和 `PingFang SC`（woff2），通过 `@font-face` 引入。
- [ ] **图标**：使用 Lucide React 或从系统获取 SF Symbols（via `tauri-plugin-system-symbols`）。
- [ ] **暗色模式**：使用 Tailwind 的 `dark:` 前缀和 `next-themes`（或 Zustand 存储主题偏好）。
- [ ] **路由**：配置 React Router，页面包括：首页（推荐）、歌单、搜索、设置。

**参考**：`dannysmith/tauri-template` 已包含窗口定制和主题切换。

---

### 阶段二：数据层与认证（2 周）

- [ ] **TanStack Query** 配置：创建 `QueryClient`，设置缓存策略。
- [ ] **API 代理**（Rust）：使用 `reqwest` 转发前端请求到音乐服务（如 Apple Music API），避免 CORS 和暴露密钥。
- [ ] **用户认证**：实现 OAuth 流程或用户名密码登录，保存 Token 到 `tauri-plugin-store`。
- [ ] **获取歌单**：调用 API 获取用户歌单，使用 `useQuery` 缓存并展示。

**关键 React 19 特性**：
- 使用 `use` Hook 结合 Suspense 处理数据加载。
- 使用 `useActionState` 处理登录表单提交。

---

### 阶段三：音频播放引擎（2-3 周）

- [ ] **Rust 音频模块**：
  - 集成 `Symphonia` 解码网络音频流（MP3/AAC）。
  - 使用 `cpal` 输出音频到系统设备。
  - 实现 `play_stream(url)`、`pause()`、`seek(position)` 等 Tauri 命令。
- [ ] **流式播放**：Rust 端边下载边解码，避免等待完整文件。
- [ ] **前端播放控制**：
  - 创建 `usePlayer` Hook，调用 Tauri 命令。
  - 实现播放/暂停、进度条拖动、音量控制。
  - 使用 Zustand 存储当前播放状态（曲目、进度、播放模式）。
- [ ] **播放列表队列**：支持顺序、循环、随机播放模式。

**参考**：`plexify` 项目中的音频模块实现。

---

### 阶段四：搜索与发现（1-2 周）

- [ ] **搜索功能**：
  - 使用 React 19 `useActionState` 处理搜索表单。
  - 调用 API 搜索歌曲/歌手/专辑。
  - 展示搜索结果，支持点击播放或加入歌单。
- [ ] **推荐/热门歌单**：展示平台推荐内容。

---

### 阶段五：本地持久化与优化（2 周）

- [ ] **SQLite 数据库**：
  - 存储用户收藏的歌曲、本地歌单、播放历史。
  - 实现离线模式（缓存已播放的音频数据）。
- [ ] **系统媒体控件**：使用 `tauri-plugin-media` 或 `navigator.mediaSession` 支持键盘媒体键。
- [ ] **全局快捷键**：`tauri-plugin-global-shortcut` 实现播放/暂停等快捷键。
- [ ] **性能优化**：
  - 使用 `React.memo`、`useMemo` 避免不必要的重渲染。
  - 配置 TanStack Query 的 `staleTime` 减少网络请求。
- [ ] **自动更新**：集成 `tauri-plugin-updater`。

---

### 阶段六：测试与打包（1 周）

- [ ] **单元测试**：Vitest 测试组件和 Hooks。
- [ ] **端到端测试**：Playwright 模拟用户操作。
- [ ] **打包**：运行 `pnpm tauri build` 生成各平台安装包。
- [ ] **签名与分发**：Windows 使用 SignTool，macOS 使用 Developer ID。

---

## 🔧 核心功能实现要点

### 1. React 19 数据流模式

```tsx
// 使用 use 读取 Promise
import { use } from 'react';

function PlaylistPage({ playlistId }) {
  const playlist = use(fetchPlaylist(playlistId));
  return <PlaylistView data={playlist} />;
}

// 使用 useActionState 处理表单
import { useActionState } from 'react';

async function searchAction(prev, formData) {
  const q = formData.get('q');
  return await api.search(q);
}

function SearchBar() {
  const [results, action, isPending] = useActionState(searchAction, []);
  return (
    <form action={action}>
      <input name="q" />
      <button disabled={isPending}>搜索</button>
      {results && <Results data={results} />}
    </form>
  );
}
```

### 2. 播放器状态管理 (Zustand)

```ts
import { create } from 'zustand';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0-1
  volume: number;
  queue: Track[];
  play: (track: Track) => void;
  toggle: () => void;
  setProgress: (value: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  queue: [],
  play: (track) => set({ currentTrack: track, isPlaying: true }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setProgress: (value) => set({ progress: value }),
}));
```

### 3. Rust 音频流处理（简化示例）

```rust
// src-tauri/src/audio/player.rs
use symphonia::core::formats::FormatReader;
use rodio::{OutputStream, Sink};

pub struct AudioPlayer {
    sink: Sink,
    // ...
}

impl AudioPlayer {
    pub fn play_stream(&mut self, url: &str) -> Result<(), Error> {
        let response = reqwest::blocking::get(url)?;
        let stream = response.bytes();
        // 使用 symphonia 解码，然后喂给 rodio sink
        // ...
        Ok(())
    }
}
```

---

## 📚 第三方库与插件清单

| 类别           | 库/插件                                    | 用途                       |
| -------------- | ------------------------------------------ | -------------------------- |
| **Tauri 插件** | `tauri-plugin-sql`                         | SQLite 操作                |
|                | `tauri-plugin-store`                       | 配置持久化                 |
|                | `tauri-plugin-shell`                       | 打开外部链接               |
|                | `tauri-plugin-fs`                          | 文件系统读写               |
|                | `tauri-plugin-dialog`                      | 文件/文件夹选择对话框      |
|                | `tauri-plugin-media`                       | 系统媒体键控制             |
|                | `tauri-plugin-global-shortcut`             | 全局快捷键                 |
|                | `tauri-plugin-updater`                     | 自动更新                   |
|                | `tauri-plugin-system-symbols`              | 获取系统图标（SF Symbols） |
| **Rust 依赖**  | `symphonia`                                | 音频解码                   |
|                | `cpal` / `rodio`                           | 音频输出                   |
|                | `reqwest`                                  | HTTP 客户端                |
|                | `tokio`                                    | 异步运行时                 |
|                | `serde` / `serde_json`                     | 序列化                     |
| **前端依赖**   | `@tanstack/react-query`                    | 数据获取与缓存             |
|                | `zustand`                                  | 状态管理                   |
|                | `react-router-dom`                         | 路由                       |
|                | `tailwindcss` / `postcss` / `autoprefixer` | 样式                       |
|                | `lucide-react`                             | 图标库                     |
|                | `clsx` / `tailwind-merge`                  | 类名合并                   |
|                | `react-hook-form`                          | 表单处理（可选）           |

---

## 🔤 字体与图标配置

### 字体（SF Pro + PingFang SC）

将 woff2 格式字体放入 `src/assets/fonts/`，在 `styles/fonts.css` 中定义：

```css
@font-face {
  font-family: 'SF Pro Display';
  font-weight: 400;
  src: url('../assets/fonts/SF-Pro-Display-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'SF Pro Display';
  font-weight: 600;
  src: url('../assets/fonts/SF-Pro-Display-Semibold.woff2') format('woff2');
}
@font-face {
  font-family: 'PingFang SC';
  font-weight: 400;
  src: url('../assets/fonts/PingFangSC-Regular.woff2') format('woff2');
}
/* ... 其他字重 */
```

全局应用：

```css
body {
  font-family: 'SF Pro Display', 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### 图标

- 推荐使用 **Lucide React**：`import { Play, Pause, SkipForward } from 'lucide-react'`
- 如需 macOS 原生 SF Symbols，使用 `tauri-plugin-system-symbols` 获取 SVG 路径。

---

## 📖 参考项目与资源

| 项目                                                         | 技术栈                  | 特点                             |
| ------------------------------------------------------------ | ----------------------- | -------------------------------- |
| **[plexify](https://github.com/tsm-1/plexify)**              | Tauri 2 + React 19      | Plex 客户端，音频播放完整实现    |
| **[Audion](https://github.com/sagami121/Audion)**            | Tauri + React           | Windows 本地播放器，支持均衡器   |
| **[Nuclear](https://github.com/nukeop/nuclear)**             | Tauri + React           | 成熟的大型音乐播放器，支持多服务 |
| **[Feishin](https://github.com/jeffvli/feishin)**            | Tauri + React + Zustand | 现代设计，支持 Navidrome         |
| **[dannysmith/tauri-template](https://github.com/dannysmith/tauri-template)** | Tauri v2 + React        | 功能最全的模板                   |

**文档链接**：
- [Tauri 官方文档](https://tauri.app/)
- [React 19 新特性](https://react.dev/blog/2024/12/05/react-19)
- [TanStack Query 文档](https://tanstack.com/query)
- [shadcn/ui 文档](https://ui.shadcn.com/)

---

## ❓ 常见问题与解决方案

**Q1: 透明窗口下 `backdrop-filter` 不生效？**  
A: 使用 `window-vibrancy` 插件实现系统级模糊，不要仅依赖 CSS。

**Q2: 如何处理音频流缓存？**  
A: 在 Rust 端使用 `reqwest` 下载到临时文件，然后解码播放，或使用内存缓存。

**Q3: 如何保证音频播放的实时性？**  
A: 使用 `cpal` 的低延迟模式，并采用双缓冲策略。

**Q4: React 19 的 `use` Hook 与 TanStack Query 如何配合？**  
A: 可以将 `useQuery` 的 `data` 作为 `use` 的参数，或直接使用 `useSuspenseQuery`。

**Q5: 如何在 Windows 上实现毛玻璃（亚克力）效果？**  
A: `window-vibrancy` 的 `apply_blur` 函数在 Windows 10/11 上工作良好。

---

## ✅ 总结

这份计划为你提供了一条从零开始构建 React 19 + Tauri 2 音乐播放器的清晰路径。核心优势在于：

- 利用 **React 19 新特性** 优雅处理服务端数据流。
- 结合 **Tauri 2** 实现轻量、高性能的桌面应用。
- 使用 **shadcn/ui + Tailwind** 打造完全可控的苹果风格 UI。

**开始行动**：选择一个模板克隆，安装依赖，立即进入开发模式。祝编码愉快！

---

*最后更新：2026-08-23*
```

---

你可以将上述全部内容复制到一个新文件中，命名为 `plan.md`，即可开始你的开发之旅。如果需要我补充任何具体细节（如代码示例、配置片段等），随时告诉我！ 🚀
```

