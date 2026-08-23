明白了！既然核心播放引擎、认证和基础框架你已经跑通，现在需要的是**独立、可落地**的补充页面开发计划。

下面这份计划**不涉及底层重构**，完全基于你现有的 Zustand 状态和 Tauri 后端 API，专门针对 **歌词页**、**专辑详情页**、**艺人页**、**个人资料页**和**设置页**。你可以按顺序逐个实现，每个页面都配有核心代码逻辑和 UI 结构。

---

# 🧩 独立页面开发计划（React 19 + Tauri 2）

> **前置条件**：你的 `usePlayerStore` 已暴露 `currentTrack`、`currentTime`、`playTrack`；Rust 后端已有 `get_lyrics(id)`、`get_album(id)`、`get_artist(id)` 等代理命令。

---

## 1. 🎤 歌词页面（核心难点）

### 功能需求
- 获取当前歌曲的 LRC 时间轴歌词。
- 播放时**自动滚动**，当前行居中高亮。
- 支持手动拖拽滚动，2秒无操作后恢复自动跟踪。
- 无歌词时显示“暂无歌词”占位。

### 实现步骤

#### Step 1：Rust 后端代理（如果还没写）
```rust
// src-tauri/src/commands.rs
#[tauri::command]
async fn get_lyrics(track_id: String) -> Result<String, String> {
    // 调用 Apple Music / LRCLIB API
    let url = format!("https://api.music.apple.com/v1/catalog/us/songs/{}/lyrics", track_id);
    // ... reqwest 代理
}
```

#### Step 2：前端 API Hook
```ts
// src/api/lyrics.ts
export interface LyricsLine { time: number; text: string; }

export async function fetchLyrics(trackId: string): Promise<LyricsLine[]> {
  const raw = await invoke<string>('get_lyrics', { trackId });
  return parseLRC(raw); // 解析 [mm:ss.xx] 格式
}
```

#### Step 3：`useLyrics` Hook（含缓存）
```ts
// src/hooks/useLyrics.ts
import { useQuery } from '@tanstack/react-query';
import { fetchLyrics } from '@/api/lyrics';

export function useLyrics(trackId: string | null) {
  return useQuery({
    queryKey: ['lyrics', trackId],
    queryFn: () => fetchLyrics(trackId!),
    enabled: !!trackId,
    staleTime: 1000 * 60 * 60, // 1小时缓存
  });
}
```

#### Step 4：歌词滚动组件（核心逻辑）
```tsx
// src/components/Lyrics/LyricsView.tsx
import { useRef, useEffect, useState } from 'react';
import { useLyrics } from '@/hooks/useLyrics';
import { usePlayerStore } from '@/stores/playerStore';

export function LyricsView() {
  const { currentTrack, currentTime } = usePlayerStore();
  const { data: lyrics, isLoading } = useLyrics(currentTrack?.id ?? null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 计算当前行索引
  const activeIndex = lyrics?.reduce((acc, line, idx) => {
    if (line.time <= currentTime) return idx;
    return acc;
  }, -1) ?? -1;

  // 自动滚动（用户停止交互2秒后恢复）
  useEffect(() => {
    if (isUserScrolling) return;
    if (activeIndex >= 0 && containerRef.current) {
      const children = containerRef.current.children;
      const target = children[activeIndex] as HTMLElement;
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeIndex, isUserScrolling]);

  const handleScroll = () => {
    setIsUserScrolling(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsUserScrolling(false), 2000);
  };

  if (isLoading) return <div className="flex h-full items-center justify-center">加载歌词...</div>;
  if (!lyrics?.length) return <div className="flex h-full items-center justify-center text-muted-foreground">暂无歌词</div>;

  return (
    <div 
      ref={containerRef} 
      onScroll={handleScroll}
      className="h-full overflow-y-auto py-12 scroll-smooth"
    >
      <div className="mx-auto max-w-lg space-y-1 text-center">
        {lyrics.map((line, i) => (
          <p
            key={i}
            className={`transition-all duration-300 ${
              i === activeIndex 
                ? 'text-primary text-xl font-semibold scale-105' 
                : 'text-muted-foreground text-base opacity-60'
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
```

#### Step 5：路由挂载
```tsx
// src/routes/NowPlaying.tsx (或作为 Overlay 模态)
<Route path="/lyrics" element={<LyricsView />} />
```
> **建议**：歌词页通常作为播放器下方的二级视图，或点击专辑封面后弹出的全屏模态。根据你的设计接入即可。

---

## 2. 💿 专辑详情页 (`/album/:id`)

### 功能
- 展示大封面、专辑名、艺人、发行年份、歌曲数。
- 歌曲列表（带序号、时长），点击歌曲切换播放。

### 实现
```tsx
// src/routes/AlbumPage.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@/stores/playerStore';

export function AlbumPage() {
  const { id } = useParams();
  const { playTrack, currentTrack } = usePlayerStore();
  
  const { data: album } = useQuery({
    queryKey: ['album', id],
    queryFn: () => invoke('get_album', { id }),
  });

  if (!album) return <div>加载中...</div>;

  return (
    <div className="p-8">
      <div className="flex gap-8">
        <img src={album.cover} className="h-64 w-64 rounded-lg shadow-2xl" />
        <div>
          <p className="text-sm text-muted-foreground">专辑</p>
          <h1 className="text-5xl font-bold">{album.name}</h1>
          <p className="text-xl text-muted-foreground">{album.artist}</p>
          <p>{album.releaseDate} · {album.trackCount} 首</p>
          <button 
            onClick={() => playTrack(album.tracks[0])}
            className="mt-4 rounded-full bg-primary px-8 py-2 text-white"
          >
            播放全部
          </button>
        </div>
      </div>
      <div className="mt-8">
        {album.tracks.map((track, i) => (
          <div 
            key={track.id} 
            onClick={() => playTrack(track)}
            className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 hover:bg-accent ${
              currentTrack?.id === track.id ? 'bg-accent text-primary' : ''
            }`}
          >
            <span className="w-8 text-muted-foreground">{i + 1}</span>
            <span className="flex-1">{track.name}</span>
            <span>{track.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. 🧑‍🎤 艺人页 (`/artist/:id`)

### 功能
- 头部：艺人头图、名字、月度听众数（或简介）。
- 热门歌曲 Top 5（带播放热键）。
- 全部专辑列表（网格卡片）。

### 核心代码片段
```tsx
// src/routes/ArtistPage.tsx (精简结构)
<div className="p-8">
  <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600">
    <img src={artist.hero} className="h-full w-full object-cover opacity-40" />
    <div className="absolute bottom-8 left-8">
      <h1 className="text-6xl font-bold text-white">{artist.name}</h1>
      <p className="text-white/80">{artist.monthlyListeners} 月听众</p>
    </div>
  </div>
  
  <h2 className="mt-8 text-2xl font-bold">热门歌曲</h2>
  {artist.topTracks.map(track => <TrackRow key={track.id} track={track} />)}
  
  <h2 className="mt-8 text-2xl font-bold">专辑</h2>
  <div className="grid grid-cols-5 gap-4">
    {artist.albums.map(album => <AlbumCard key={album.id} album={album} />)}
  </div>
</div>
```

---

## 4. 👤 个人资料页 (`/profile`)

### 功能
- 用户头像、昵称、绑定邮箱。
- **我的收藏**（Tab1）：歌曲列表（带红心取消功能）。
- **播放历史**（Tab2）：最近播放的 50 首，带时间戳。
- 退出登录按钮。

### 本地存储（SQLite 集成）
在 Rust 端新增两个命令：
```rust
#[tauri::command]
fn get_favorites() -> Result<Vec<Track>, String> { /* 查 SQLite */ }

#[tauri::command]
fn toggle_favorite(track_id: String) -> Result<bool, String> { /* 插入或删除 */ }

#[tauri::command]
fn get_history(limit: usize) -> Result<Vec<HistoryItem>, String> { /* 查播放记录 */ }
```
前端用 `useQuery` 拉取，用 `useMutation` 更新收藏，配合 `queryClient.invalidateQueries` 刷新列表。

---

## 5. ⚙️ 设置页 (`/settings`)

### 功能分组
- **通用**：深色/浅色/跟随系统（Zustand `settingsStore`）、启动时自动播放。
- **音频**：音量（Slider）、音质选择（低/中/高，存 Store）。
- **缓存**：当前缓存大小（调用 Rust `get_cache_size`）、一键清理（`clear_cache`）。
- **关于**：应用版本、检查更新（`tauri-plugin-updater`）。

### 表单示例（使用 shadcn/ui 的 Switch 和 Slider）
```tsx
const { theme, setTheme } = useSettingsStore();
return (
  <div className="space-y-6 p-8">
    <div className="flex items-center justify-between">
      <label>深色模式</label>
      <Switch checked={theme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
    </div>
    <div className="flex items-center justify-between">
      <label>缓存大小：{cacheSize} MB</label>
      <Button onClick={clearCache}>清理缓存</Button>
    </div>
  </div>
);
```

---

## 🗺️ 路由汇总（全部补全）

在你的 `App.tsx` 中确保以下路由全部注册：

```tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/playlist/:id" element={<PlaylistPage />} />
  <Route path="/album/:id" element={<AlbumPage />} />
  <Route path="/artist/:id" element={<ArtistPage />} />
  <Route path="/lyrics" element={<LyricsView />} />          {/* 新增 */}
  <Route path="/search" element={<SearchPage />} />
  <Route path="/profile" element={<ProfilePage />} />        {/* 新增 */}
  <Route path="/settings" element={<SettingsPage />} />      {/* 新增 */}
</Routes>
```

---

## ✅ 实施建议（按优先级排序）

1. **先做歌词页**——这是音乐播放器“苹果味”的灵魂，投入产出比最高，用户感知最强。
2. **再做专辑 & 艺人页**——完善浏览体验，让用户能点进去探索。
3. **最后做资料和设置**——属于收尾打磨，不依赖其他模块。

每个页面独立开发，互不阻塞。你可以先把 `LyricsView` 组件写完挂上，跑通滚动效果，再继续下一个。

---

如果你需要我把其中**任意一个页面**（比如歌词页）的完整 `tsx` 文件（含样式、Loading 骨架、错误边界）一次性全部写出来，或者帮你调优滚动卡顿的问题，随时告诉我，我接着往下细化！🎵