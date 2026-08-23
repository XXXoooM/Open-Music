# 📋 详细开发计划：UI 规范化 + 动画系统升级

> **项目名称**：Apple Music Desktop (Tauri 2 + React 19)  
> **当前状态**：UI 纯手写 Tailwind，无第三方 UI/动画库，布局混乱  
> **目标**：引入 shadcn/ui 统一组件，使用 Motion (Framer Motion) 增强交互，实现 Apple 风格精致界面  
> **预计工期**：8-10 个工作日（分阶段推进）

---

## 🎯 一、总体策略

| 维度           | 选择                       | 原因                                                         |
| -------------- | -------------------------- | ------------------------------------------------------------ |
| **UI 组件库**  | **shadcn/ui**（主方案）    | 与 Tailwind v4 完美融合，渐进式引入，高度可定制，社区活跃    |
| **备选 UI 库** | Mantine / Darwin UI        | 若 shadcn 遇到不可克服问题，Mantine 提供全功能，Darwin UI 专攻 macOS 风格 |
| **动画引擎**   | **Motion (Framer Motion)** | React 动画事实标准，与 React 19 兼容，与 shadcn 集成良好     |

---

## 📅 二、分阶段实施计划

### 🧱 阶段 0：准备与环境验证（0.5 天）
- [ ] 备份当前 `globals.css` 中的自定义毛玻璃类（`.glass`、`backdrop-blur` 等）。
- [ ] 确认项目已安装 `class-variance-authority`、`clsx`、`tailwind-merge`、`lucide-react`（若无则安装）。
- [ ] 确保 `tailwind.config.js` 支持深色模式（`darkMode: "class"` 或 `"media"`），以便与 shadcn 主题切换兼容。

### 📦 阶段 1：安装与初始化 shadcn/ui（1 天）
**任务清单**：
1. 运行 `npx shadcn@latest init`，按提示选择：
   - 风格：默认（或“New York”）
   - 颜色：蓝色（匹配 Apple 蓝 `#007AFF`）
   - 是否使用 CSS 变量：是
2. 初始化后，将 `globals.css` 中备份的毛玻璃类重新加入（在 `@layer base` 外或内合适位置）。
3. 安装基础组件：`button`、`card`、`input`、`dialog`、`dropdown-menu`、`toast`、`progress`、`table`、`scroll-area`、`avatar`。
   ```bash
   npx shadcn@latest add button card input dialog dropdown-menu toast progress table scroll-area avatar
   ```
4. 在 `src/lib/utils.ts` 中保留 shadcn 生成的 `cn` 函数。

**验证**：在任意页面中使用 `<Button>` 和 `<Card>`，确保样式正常显示，深色模式可切换。

### 🏗️ 阶段 2：核心布局与基础组件替换（2 天）
**目标**：替换最混乱、最常用的组件，形成统一视觉基调。

| 优先级 | 原手写组件    | 替换为 shadcn 组件 | 涉及文件/区域                       |
| ------ | ------------- | ------------------ | ----------------------------------- |
| P0     | 自定义按钮    | `<Button>`         | 全局所有按钮                        |
| P0     | 散落卡片      | `<Card>`           | 首页推荐、歌单列表、专辑展示        |
| P0     | 输入框/搜索框 | `<Input>`          | 搜索页、设置页                      |
| P1     | 弹窗/模态框   | `<Dialog>`         | 播放列表编辑、登录弹窗、确认操作    |
| P1     | 下拉菜单      | `<DropdownMenu>`   | 设置菜单、歌单操作菜单              |
| P2     | 进度条        | `<Progress>`       | 播放控制栏（结合 playerStore 进度） |
| P2     | 表格列表      | `<Table>`          | 专辑详情页、歌单详情页的歌曲列表    |
| P3     | 头像          | `<Avatar>`         | 个人资料页                          |

**实施方法**：从 `src/routes/Home.tsx`（首页）开始，逐文件修改。每个文件只替换组件，不改变业务逻辑。

**注意事项**：
- 保留毛玻璃效果：在 shadcn 组件上追加 `className="glass"`，或在 `globals.css` 中覆盖组件默认样式（如 `--card-background: rgba(255,255,255,0.05);`）。
- 使用 `cn()` 合并类名，避免覆盖冲突。

### 🎨 阶段 3：主题统一与毛玻璃深度定制（1.5 天）
**目标**：使 shadcn 组件完全符合 Apple 风格，深浅色模式无缝切换。

**具体操作**：
1. 修改 `globals.css` 中的 CSS 变量，调整颜色值：
   - 主色（`--primary`）：`#007AFF`
   - 背景色（浅色）：`#F5F5F7` / 深色：`#000000`
   - 卡片背景（浅色）：`rgba(255,255,255,0.6)` / 深色：`rgba(255,255,255,0.08)`
2. 定义全局毛玻璃组件类：
   ```css
   @layer components {
     .glass {
       background: rgba(255, 255, 255, 0.08);
       backdrop-filter: blur(20px);
       -webkit-backdrop-filter: blur(20px);
       border: 1px solid rgba(255, 255, 255, 0.1);
     }
     .glass-dark {
       background: rgba(0, 0, 0, 0.3);
       border: 1px solid rgba(255, 255, 255, 0.05);
     }
   }
   ```
3. 将 shadcn 组件的 `Card`、`Dialog`、`DropdownMenu` 等默认背景替换为毛玻璃类（通过覆盖 CSS 变量或使用 `className` 包裹）。

**验证**：切换深色/浅色模式，所有组件背景应自动适配。

### 🌀 阶段 4：引入 Motion 动画引擎（1 天）
**任务**：
1. 安装：`pnpm add motion`
2. 创建 `src/lib/motion.ts`，统一导出常用动画变体（variants）和过渡配置，供全局复用。
   ```ts
   import { Variants } from "motion";

   export const fadeInUp: Variants = {
     initial: { opacity: 0, y: 20 },
     animate: { opacity: 1, y: 0 },
   };

   export const staggerContainer: Variants = {
     animate: { transition: { staggerChildren: 0.05 } },
   };
   ```
3. 在 `App.tsx` 中，用 `<AnimatePresence mode="wait">` 包裹路由出口，实现页面切换渐变动画。

### ✨ 阶段 5：微交互动画（2 天）
**目标**：为按钮、卡片、列表项添加精致动效，提升手感。

| 元素                | 动画效果                                       | 使用 Motion 特性                  |
| ------------------- | ---------------------------------------------- | --------------------------------- |
| 按钮                | 悬停放大（scale 1.05），点击缩小（scale 0.95） | `whileHover` / `whileTap`         |
| 卡片                | 悬停上浮（y -4）加阴影加深                     | `whileHover`                      |
| 列表项（歌曲/歌单） | 出现时从右侧滑入，交错延迟                     | `variants` + `staggerChildren`    |
| 播放进度条          | 平滑过渡                                       | `animate` 结合进度值变化          |
| 侧边栏折叠          | 宽度/透明度平滑变化                            | `AnimatePresence` +  `motion.div` |

**注意**：Motion 可以与 shadcn 组件无缝结合，只需将组件用 `motion.create()` 包装或直接使用 `motion.div` 作为容器。

### 🧪 阶段 6：歌词页滚动高亮动画（1.5 天）
**核心功能**：歌词滚动与播放进度同步，当前行居中并高亮。

**技术方案**：
- 使用 `motion.div` 包裹歌词行，根据当前播放时间动态设置 `animate` 属性（如 `color`、`fontSize`）。
- 滚动容器使用 `useRef`，配合 `scrollIntoView` 或 `scrollTo`，并添加平滑缓动。
- 使用 `useMotionValue` 和 `useTransform` 实现过渡。

**参考代码结构**：
```tsx
<motion.div
  animate={{ y: -activeIndex * lineHeight }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  {lyrics.map((line, i) => (
    <motion.p
      key={i}
      animate={{
        color: i === activeIndex ? "#007AFF" : "#888",
        scale: i === activeIndex ? 1.1 : 1,
      }}
    >
      {line.text}
    </motion.p>
  ))}
</motion.div>
```

### 🧼 阶段 7：清理与优化（0.5 天）
- 移除未使用的手写样式类。
- 确保所有组件在浅色/深色模式下均可读。
- 运行 `pnpm tauri build` 测试生产环境样式正确性。
- 性能检查：使用 React DevTools 查看组件渲染次数，必要时使用 `React.memo`。

---

## 🧩 三、与现有架构的集成要点

| 现有模块           | 集成方式                                                     |
| ------------------ | ------------------------------------------------------------ |
| **Zustand Stores** | shadcn 组件不依赖状态，直接传入 `playerStore` 的状态和方法，例如 `<Button onClick={playerStore.togglePlay}>` |
| **TanStack Query** | 将 `isLoading` 映射到 shadcn 的 `Button` 的 `disabled` 或自定义加载动画（可用 Motion 的 `<motion.div>` 制作骨架屏） |
| **React Router**   | 使用 `<Link>` 或 `useNavigate`，与 shadcn 的 `<Button asChild>` 结合可制作导航按钮 |
| **主题切换**       | shadcn 支持 CSS 类切换（`dark` 类），与 `themeStore` 联动，在根元素添加或移除 `dark` 类即可 |

---

## ⚠️ 四、风险与应对

| 风险                        | 概率 | 应对措施                                                     |
| --------------------------- | ---- | ------------------------------------------------------------ |
| shadcn 初始化覆盖自定义样式 | 高   | 提前备份 `globals.css`，初始化后逐步合并                     |
| 组件替换导致布局错位        | 中   | 使用 `cn()` 合并类名，保持原有布局结构不变                   |
| 动画性能问题（大量列表）    | 低   | 使用 `layoutId` 或 `useReducedMotion` 来降级                 |
| 第三方库包体积增加          | 低   | 使用按需加载（shadcn 本身就是按需的），Motion 支持 tree-shaking |

---

## 🧭 五、备选方案触发条件

- **Mantine**：如果 shadcn 不能满足复杂表格/图表需求，或需要大量内置 Hooks，可切换。
- **Darwin UI**：如果需要更纯粹的 macOS 风格且不愿自定义样式，可考虑，但社区较小。
- **react-spring**：如果对物理动画有偏好，可作为 Motion 的替代。
- **GSAP**：如果未来有复杂时间轴动画，可集成，但初期不建议。

---

## 📝 六、提示词（用于 AI 协作）

将下面的提示词复制粘贴给 AI 助手（如 Claude 3.5 Sonnet、ChatGPT-4o 等），即可按计划逐步获得代码实现。

---

```markdown
# 🧠 提示词：UI 规范化和动画系统实施助手

## 你的角色
你是一位资深 React 前端架构师，精通 shadcn/ui、Tailwind CSS v4、Motion (Framer Motion) 以及 React 19 的最佳实践。我的项目是一个基于 Tauri 2 + React 19 的桌面音乐播放器，当前 UI 纯手写 Tailwind，比较混乱，未使用任何第三方 UI 库。我需要你协助我按照以下计划逐步引入 shadcn/ui 和 Motion 动画库，并完成组件替换和动画集成。

## 项目约束
- **已安装**：React 19, TypeScript, Tailwind CSS v4, Zustand, TanStack Query, React Router v6, Lucide React。
- **未安装**：任何 UI 库（如 shadcn、Mantine 等）和动画库（如 Framer Motion）。
- **现有状态管理**：`playerStore`、`playlistStore`、`settingsStore`、`authStore`、`historyStore`、`themeStore`，均使用 Zustand。
- **路由**：已配置 `/`、`/album/:id`、`/artist/:id`、`/lyrics`、`/profile`、`/settings`、`/search`、`/playlist-detail`。
- **主题切换**：`themeStore` 控制 `dark` 类应用于 html 元素。

## 实施计划（分阶段执行）
请严格按照以下阶段顺序，每完成一个阶段并验证通过后再继续下一个阶段。

### 阶段 0：准备
- 检查 `tailwind.config.js` 是否配置 `darkMode: "class"`（若未配置，请提供配置内容）。
- 检查 `src/lib/utils.ts` 是否存在（若无，请创建并提供 `cn` 函数）。
- 提示我备份 `globals.css` 中的自定义毛玻璃类。

### 阶段 1：初始化 shadcn/ui
- 提供完整的 `npx shadcn@latest init` 交互选项（风格、颜色、CSS 变量等）。
- 初始化后，提供修改后的 `globals.css` 片段，保留原有毛玻璃类（如 `.glass`）并确保不与 shadcn 冲突。
- 安装以下组件：`button`, `card`, `input`, `dialog`, `dropdown-menu`, `toast`, `progress`, `table`, `scroll-area`, `avatar`。
- 给出每个组件的安装命令。

### 阶段 2：核心组件替换
对于我指定的页面（例如首页 `Home.tsx`），请：
- 识别原手写组件（如 `<div className="...">` 按钮、卡片）。
- 提供替换后的完整组件代码，使用 shadcn 组件，并保留原有业务逻辑（如点击事件、数据绑定）。
- 确保毛玻璃效果通过添加 `className="glass"` 或修改 CSS 变量保留。
- 显示替换前后代码对比，说明改动。

### 阶段 3：主题定制
- 提供修改后的 `globals.css` 中的 CSS 变量值，使其近似 Apple 风格（主色 `#007AFF`，背景色浅色 `#F5F5F7`，深色 `#000000` 等）。
- 提供 `.glass` 和 `.glass-dark` 类的定义。
- 确保深色模式切换与 `themeStore` 联动：即 html 元素添加/移除 `dark` 类。

### 阶段 4：安装 Motion 动画库
- 提供安装命令：`pnpm add motion`。
- 创建 `src/lib/motion.ts`，导出常用的 variants（如 `fadeInUp`、`staggerContainer`）和过渡配置。
- 在 `App.tsx` 中集成 `AnimatePresence` 实现页面切换动画，提供代码示例。

### 阶段 5：添加微交互
对以下组件逐一提供动画实现：
1. **按钮**：悬停放大，点击缩小。
2. **卡片**：悬停上浮。
3. **列表项（歌曲/歌单）**：出现时从右侧滑入，交错延迟。
4. **进度条**：平滑过渡。

### 阶段 6：歌词页滚动高亮动画
- 提供 `LyricsPage.tsx` 的完整代码，使用 Motion 实现：
  - 歌词随播放进度滚动（使用 `scrollIntoView` 或 `motion.div` 的 `animate` 属性）。
  - 当前行高亮（颜色、字体大小变化）。
  - 动画平滑，性能良好。

### 阶段 7：清理与优化
- 提供检查清单，确保未使用的 CSS 类和组件被移除。
- 建议使用 `React.memo` 优化列表组件。

## 交互规范
- 每次回答时，先说明当前阶段，然后提供代码片段。
- 每个代码块请标注文件路径（如 `src/routes/Home.tsx`）。
- 提供必要的解释，说明改动原因和潜在影响。
- 在我确认阶段完成后，再进入下一阶段。

## 开始条件
我已在项目根目录，准备执行安装命令。请先提供阶段 0 的检查项和阶段 1 的初始化命令，我们开始推进。
```

---

## 🚀 七、执行建议

1. **先读计划，再问 AI**：确保你已理解整体思路，然后复制提示词给 AI，逐步获取代码。
2. **从最乱的页面开始**：比如首页或搜索页，替换后立即看到效果，增强信心。
3. **不要一次性替换所有页面**：每次替换 1-2 个文件，验证无误后再继续。
4. **善用 Git**：每完成一个阶段提交一次，方便回滚。

---

## ✅ 预期成果

- **视觉统一**：所有按钮、卡片、输入框等具有一致的圆角、阴影、字体和毛玻璃质感。
- **交互精致**：悬停、点击、页面切换都有流畅的动画反馈，提升用户体验。
- **代码可维护**：使用 shadcn 标准组件，减少自定义 CSS，样式集中管理。
- **性能良好**：动画采用 GPU 加速，不会造成明显卡顿。

祝你实施顺利！如果在某个阶段卡住，可随时在对话中粘贴错误信息，我会帮你排查。🎵