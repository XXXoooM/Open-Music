# Open Music - 开放式音乐

一个大道至简、拥有高端毛玻璃视觉风格的轻量级 Web 音乐播放器。支持 PWA（渐进式网页应用），可在移动端及桌面端直接“安装”为独立的本地 App 运行。

---

## 📂 目录结构隔离说明

为了保持项目的高内聚低耦合，我们对网页端和移动原生包装端进行了目录层面的物理隔离：

```text
├── web/                  # 网页前端代码 (HTML / CSS / JS / PWA 配置文件)
│   ├── index.html        # 主页面与 SVG 矢量图标
│   ├── style.css         # 暗黑毛玻璃样式系统与动效
│   ├── app.js            # 音频控制、歌词同步解析、歌单导入与快捷键逻辑
│   ├── manifest.json     # PWA 应用参数清单
│   └── sw.js             # 离线缓存 Service Worker
├── mobile/               # 移动端打包目录
│   └── README.md         # 使用 Capacitor 将 web 目录编译为 APK / IPA 的打包教程
└── README.md             # 本项目自述文件
```

---

## ⚡ 核心功能

* **网易云 API 接入**：动态解析获取歌单，并本地缓存您的歌单及音量偏好。
* **自定义歌单导入**：在列表设置面板中，输入任意网易云公开歌单 ID 即可载入您专属的歌曲。
* **精确歌词同步**：支持 LRC 毫秒级歌词同步、视觉毛玻璃遮罩高亮，并支持 **点击歌词跳转播放进度（Click-to-Seek）**。
* **原生 HSL 智能取色**：不依赖任何第三方库，根据歌名与歌手哈希计算出最契合的霓虹渐变主色调，渲染环境光效。
* **极简键盘快捷键**：
  * 空格键 `Space`：播放/暂停
  * 方向左右键 `← / →`：快退/快进 5s
  * 方向上下键 `↑ / ↓`：增减音量
  * `M` 键：静音切换
  * `L` 键：单曲/列表循环模式切换
  * `S` 键：随机播放模式切换
* **PWA 应用安装**：在浏览器打开时，可直接“添加到主屏幕”，生成桌面图标以 Standalone 无地址栏的独立 App 形式运行。

---

## 🛠️ 本地运行开发

1. 确保您的电脑已安装 Python（或任意静态服务器）。
2. 在项目根目录下，启动本地静态服务器：
   ```bash
   python -m http.server 8000 --directory web
   ```
3. 打开浏览器，访问 **[http://localhost:8000](http://localhost:8000)**。

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
* **[Material Design Icons](https://github.com/google/material-design-icons)**：部分控制按钮的矢量设计灵感来源于 Google Material 图标库，我们在代码中进行了 inline SVG 的手写精简重构。
