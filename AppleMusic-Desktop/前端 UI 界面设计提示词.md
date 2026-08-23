以下是一份结合了 Apple 最新设计语言（Liquid Glass）和网上优秀开源项目参考的**前端 UI 界面提示词**，你可以直接发给 AI 协助你实现 UI 界面。

---

# 🎨 Apple Music Desktop —— 前端 UI 界面设计提示词

> **基于 Apple Liquid Glass 设计语言 + shadcn/ui + Motion 动画**


## 📌 一、设计参考来源

本提示词的设计规范综合了以下权威参考：

1. **Apple Human Interface Guidelines (2026)** —— Liquid Glass 设计语言的官方规范
2. **Apple Music iOS 27 设计更新** —— 艺术家页与专辑页的最新布局
3. **SoundCloud Desktop (Tauri)** —— Liquid Glass 在桌面端的落地实践
4. **nextjs-shadcn-music-player** —— React 19 + shadcn/ui + Framer Motion 的音乐播放器实现
5. **apple-music-js** —— React 实现的 Apple Music 风格 UI


## 🎯 二、整体设计目标

打造一款**深度致敬 Apple Music** 的桌面音乐播放器 UI，具备：

- **Liquid Glass 毛玻璃质感**——所有面板均为半透明“磨砂”层，背景氛围可穿透显示
- **内容优先的视觉层次**——UI 自适应内容，动态调整以支持用户焦点
- **沉浸式深色主题**——以专辑封面为视觉焦点，深色背景衬托内容
- **流畅的微交互动画**——所有交互伴随细腻的 Motion 动画


## 🏗️ 三、整体布局结构（三栏式 Apple 风格）

```
┌─────────────────────────────────────────────────────────────┐
│  🍎  ●  ●  ●    Apple Music Desktop         搜索 偏好 个人 │  ← 标题栏 (Traffic Light)
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  🎵 首页  │           主内容区                              │
│  搜索探索 │          (动态路由页面)                         │
│  歌词舞台 │                                                  │
│  偏好设置 │    ┌──────────────────────────────────────┐      │
│          │    │  当前页面内容                         │      │
│  ─────── │    │  (推荐/专辑/艺人/歌词/搜索/设置)     │      │
│  我的歌单 │    │                                      │      │
│  歌单1    │    └──────────────────────────────────────┘      │
│  歌单2    │                                                  │
│          │                                                  │
├──────────┴──────────────────────────────────────────────────┤
│  ◄  ►  ⏸  歌曲名 · 艺术家    ────●────────  ♥  🔊  ⏱   │  ← 播放控制栏
└─────────────────────────────────────────────────────────────┘
```

### 布局规范（参考 Apple HIG）

| 规范项       | 数值         | 说明                      |
| ------------ | ------------ | ------------------------- |
| 侧边栏宽度   | 240px        | 可折叠/展开               |
| 内容区内边距 | 24-32px      | 左右安全边距              |
| 组件间距     | 8px 网格系统 | 8pt 为基本单位            |
| 卡片圆角     | 12-16px      | 视层级而定                |
| 毛玻璃模糊   | 20-40px      | `backdrop-filter: blur()` |


## 🎨 四、视觉风格规范

### 1. Liquid Glass 毛玻璃系统

```css
/* 基础毛玻璃层 */
.glass {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 深色模式毛玻璃 */
.glass-dark {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* 大气光晕 —— 浮动在内容背后的径向渐变 */
.aura-orb {
  background: radial-gradient(ellipse at center, 
    var(--aura-color) 0%, 
    transparent 70%
  );
  filter: blur(60px);
  opacity: 0.4;
}
```

> 参考：Liquid Glass 的核心哲学是“没有表面是完全不透明的”，每个面板都是允许背景氛围透过的“磨砂”层

### 2. 色彩系统（Apple 官方规范）

| 变量                   | 浅色模式                | 深色模式                 | 用途               |
| ---------------------- | ----------------------- | ------------------------ | ------------------ |
| `--background`         | `#F5F5F7`               | `#0A0A0F`                | 主背景             |
| `--card`               | `rgba(255,255,255,0.6)` | `rgba(255,255,255,0.06)` | 卡片/面板          |
| `--primary`            | `#007AFF`               | `#007AFF`                | 主色调（Apple 蓝） |
| `--primary-foreground` | `#FFFFFF`               | `#FFFFFF`                | 主色上的文字       |
| `--foreground`         | `#1C1C1E`               | `#F5F5F7`                | 主要文字           |
| `--muted-foreground`   | `#8E8E93`               | `#8E8E93`                | 次要文字           |

> 当前项目主色为 `#FA2D48`（Apple Music 红），可根据偏好调整。

### 3. 字体系统

- **英文**：SF Pro Display（-apple-system, BlinkMacSystemFont）
- **中文**：PingFang SC
- **等宽/数字**：SF Mono（用于时间显示）

### 4. 图标

- 使用 **Lucide React** 作为主要图标库
- 导航图标使用 SF Symbols 风格的线性图标


## 📄 五、各页面 UI 详细规范

### 1. 标题栏（TitleBar）

- **无边框窗口**：`decorations: false`
- **左侧**：Traffic Light（红黄绿三色窗口控制按钮）
- **中间**：应用名称 / 当前视图标题
- **右侧**：搜索入口、偏好设置、个人资料头像（圆形，32px）

### 2. 侧边栏（Sidebar）

**样式**：
- 毛玻璃背景（`.glass`）
- 宽度 240px，左侧固定
- 分割线：`border-t border-white/5`

**导航项**：
```
🏠 首页
🔍 搜索探索
🎤 歌词舞台
⚙️ 偏好设置
────────────────
📁 我的歌单
   ├── 歌单名称 1
   ├── 歌单名称 2
   └── + 新建歌单
```

**交互**：
- 激活状态：左侧竖条高亮（`border-l-2 border-primary`）
- 悬停：背景 `bg-white/5`
- 歌单可拖拽排序

### 3. 首页推荐（`/`）

**布局**：
- 顶部：欢迎语 + 当前日期
- 今日推荐：横向滚动卡片（5-6 张）
- 热门歌单：网格布局（`grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`）
- 新歌速递：列表或卡片

**卡片设计**：
```tsx
<Card className="glass border-white/10 overflow-hidden transition-all hover:scale-[1.02]">
  <CardContent className="p-0">
    <img 
      src={cover} 
      className="aspect-square w-full object-cover" 
      alt={title}
    />
    <div className="p-3">
      <h4 className="truncate font-medium text-sm">{title}</h4>
      <p className="truncate text-xs text-muted-foreground">{artist}</p>
    </div>
  </CardContent>
</Card>
```

### 4. 搜索页（`/search`）

**布局**：
- 顶部：大号搜索框（`<Input>` + 搜索按钮）
- 热门搜索标签（横向滚动）
- 搜索结果：网格卡片（同首页）或列表

**搜索框样式**：
- 高度：48px
- 圆角：12px
- 毛玻璃背景
- 聚焦时：边框高亮 + 轻微放大

### 5. 专辑详情页（`/album/:id`）

**布局**（参考 iOS 27 设计）：
```
┌──────────────────────────────────────────────────┐
│  ┌──────┐  专辑名称                             │
│  │封面  │  艺术家名                             │
│  │(大)  │  发行年份 · 歌曲数 · 总时长           │
│  │      │  [▶ 播放全部]  [♥ 收藏]              │
│  └──────┘                                       │
├──────────────────────────────────────────────────┤
│  #  歌曲名                    时长    ♥         │
│  1  歌曲 1                    3:45   ♡         │
│  2  歌曲 2                    4:12   ♥         │
│  3  歌曲 3                    2:58   ♡         │
│  ...                                            │
└──────────────────────────────────────────────────┘
```

**设计要点**：
- 封面：`w-64 h-64 rounded-xl shadow-2xl`
- 歌曲列表：`<Table>` 组件，悬停行背景高亮
- 当前播放歌曲：声波脉冲指示器 + 主色文字

### 6. 艺人页（`/artist/:id`）

**布局**（参考 iOS 27 重新设计）：
```
┌──────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────┐       │
│  │  艺人头图（全宽，色彩向下渗透）      │       │
│  │                                      │       │
│  │      艺人名   ✓ 认证徽章             │       │
│  │      月度听众 · 每月                 │       │
│  │      [▶ 播放]  [♥ 关注]  [···]      │       │
│  └──────────────────────────────────────┘       │
│  ┌──────────────────────┐                       │
│  │  热门歌曲 (Featured)  │  ← 独立卡片          │
│  │  歌曲1 歌曲2 歌曲3    │                       │
│  └──────────────────────┘                       │
│  专辑                                          │
│  [封面] [封面] [封面] [封面]                    │
│  相似艺人                                      │
│  [头像] [头像] [头像]                          │
└──────────────────────────────────────────────────┘
```

**设计要点**：
- 艺人头图**向下渗透色彩**，影响全页色调
- 播放/关注按钮**前置**，无需滚动即可操作
- 热门歌曲独立成卡片，与全集区分

### 7. 歌词舞台页（`/lyrics`）

**布局**：
- 全屏沉浸式毛玻璃背景
- 歌词居中（`max-w-lg mx-auto text-center`）
- 当前行：放大 + 高亮（`scale-110 text-primary font-semibold`）
- 非当前行：渐隐（`opacity-40`）
- 背景：动态光晕（从专辑封面取色）

**歌词行动画**：
```tsx
<motion.p
  animate={{
    scale: i === activeIndex ? 1.08 : 1,
    color: i === activeIndex ? '#007AFF' : 'rgba(255,255,255,0.5)',
    fontWeight: i === activeIndex ? 600 : 400,
  }}
  transition={{ duration: 0.15 }}
>
  {line.text}
</motion.p>
```

### 8. 个人资料页（`/profile`）

**布局**：
- 顶部：圆形头像（80px）+ 用户名 + Apple ID 徽章
- Tab 切换：`<Tabs>`（收藏 / 历史）
- 收藏列表：歌曲卡片（带取消收藏按钮）
- 历史列表：最近 50 首（带时间戳）

### 9. 设置页（`/settings`）

**布局**：分组列表
- 通用：主题切换（Switch）、开机自启
- 音频：音量滑块、音质选择（Select）
- 缓存：缓存大小、清理按钮
- 关于：版本号、检查更新

### 10. 播放控制栏（全局底部）

**布局**：
```
┌────────────────────────────────────────────────────────────┐
│  [封面 48px]  歌曲名      ◄  ►  ⏸  ►►  ──●────  ♥  🔊  ⏱ │
│               艺术家名                   进度 3:45/4:12     │
└────────────────────────────────────────────────────────────┘
```

**设计要点**：
- 毛玻璃背景（`border-t border-white/5`）
- 高度：72px
- 进度条：`<Progress>` 组件 + 可拖拽
- 音量：`<Slider>` 组件（hover 时展开）


## 🎬 六、动画规范

基于 **Motion (Framer Motion)** 实现：

### 1. 微交互

| 元素   | 动画                | 参数                                                |
| ------ | ------------------- | --------------------------------------------------- |
| 按钮   | 悬停放大 / 点击缩小 | `whileHover: scale(1.05)` / `whileTap: scale(0.95)` |
| 卡片   | 悬停上浮            | `whileHover: { y: -4, scale: 1.01 }`                |
| 列表项 | 交错出现            | `staggerChildren: 0.06`                             |

### 2. 页面转场

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

### 3. 歌词同步

- 当前行：`scale` + `color` + `fontWeight` 平滑过渡（0.15s）
- 滚动：`scrollIntoView({ block: 'center', behavior: 'smooth' })`


## 🛠️ 七、技术实现规范

### 使用的库

| 类别    | 库                     | 版本 |
| ------- | ---------------------- | ---- |
| UI 组件 | shadcn/ui              | 最新 |
| 样式    | Tailwind CSS           | v4   |
| 动画    | Motion (Framer Motion) | 最新 |
| 状态    | Zustand                | v5   |
| 路由    | React Router           | v6   |
| 图标    | Lucide React           | 最新 |

### 组件导入规范

```tsx
// shadcn/ui 组件
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// 动画
import { motion, AnimatePresence } from "motion/react";

// 图标
import { Play, Pause, SkipForward, Heart } from "lucide-react";
```


## 📚 八、参考项目

| 项目                           | 技术栈                               | 可借鉴的 UI 设计         |
| ------------------------------ | ------------------------------------ | ------------------------ |
| **nextjs-shadcn-music-player** | React 19 + shadcn/ui + Framer Motion | 播放器整体布局、歌词显示 |
| **SoundCloud Desktop**         | Tauri + React + Liquid Glass         | 毛玻璃系统、大气光晕     |
| **apple-music-js**             | React + Redux                        | Apple Music 风格复刻     |
| **Spotify-2.0-Clone**          | React + Tailwind                     | 播放控制栏、卡片网格     |


## ✅ 九、交付要求

请根据以上规范，生成以下任一页面的完整 UI 代码：

1. **首页推荐**（`src/routes/Home.tsx`）
2. **专辑详情页**（`src/routes/AlbumPage.tsx`）
3. **歌词舞台页**（`src/routes/LyricsPage.tsx`）
4. **播放控制栏**（`src/components/Player/PlayerBar.tsx`）
5. **完整布局框架**（`App.tsx` + 侧边栏 + 标题栏）

请确保：
- 所有组件使用 shadcn/ui
- 毛玻璃效果使用 `.glass` 类
- 动画使用 Motion
- 深色/浅色模式自适应
- 与现有 Zustand stores 无缝集成


**开始吧！请告诉我你想先实现哪个页面。** 🚀