# Open Music 播放器引擎隔离指南

# Open Music 播放器引擎隔离与多端适配指南（分支）

> 🔒 **本指南目标**：将"播放器的实现"与"播放器的调用"彻底剥离。Web 端永远走 WebPlayer（保留 new Audio\(\)），原生端（Android/iOS/桌面）走 NativePlayer（调用 ExoPlayer/AVPlayer），两者在代码层面物理隔离，互不干扰。

---

## 一、核心架构思想（防火墙模式）

不要直接在 `app.js` 里写 `if (isApp) { ... } else { ... }`。

正确的做法是 **依赖倒置（Dependency Inversion）**：

- **app\.js**：只依赖一个抽象的 `player` 对象（接口）

- **入口文件（main\.js）**：根据当前运行环境，将 `WebPlayer` 或 `NativePlayer` 注入到 `app.js` 中

> ⚠️ **关键红线**：`app.js` 中绝对不能出现 `Capacitor`、`TAURI`、`ExoPlayer` 等原生专有名词。

---

## 二、项目目录结构调整

新增 `players/` 目录，将引擎与业务剥离：

```Plaintext
src/
├── players/
│   ├── index.js          # 导出工厂方法
│   ├── web-player.js     # 封装原来的 new Audio()
│   └── native-player.js  # 封装桥接调用（Capacitor/Tauri）
├── app.js                # 业务逻辑（不动大框架，仅替换调用方式）
├── native-bridge.js      # 环境检测与引擎注入
└── main.js               # 程序入口（决定加载哪个引擎）
```

---

## 三、定义统一的播放器接口（契约）

新建 `players/index.js`，定义所有播放器必须具备的方法：

```JavaScript
// 播放器必须实现的标准方法
export const PlayerInterface = {
    // 核心控制
    play: (url) => {},
    pause: () => {},
    stop: () => {},
    seek: (seconds) => {},

    // 状态获取
    getCurrentTime: () => 0,
    getDuration: () => 0,
    isPlaying: () => false,

    // 音量
    setVolume: (level) => {},
    getVolume: () => 1,

    // 事件监听（关键：让 app.js 能监听到 timeupdate 和 ended）
    on: (event, callback) => {},
    off: (event, callback) => {},

    // 加载新歌曲
    load: (track) => {},
};
```

---

## 四、封装现有的 Web 播放器（web\-player\.js）

这部分代码就是你原来的 `const audio = new Audio()` 及相关逻辑，只是用 Class 包起来：

```JavaScript
export class WebPlayer {
    constructor() {
        this.audio = new Audio();
        this._events = {};
        this._bindEvents();
    }

    _bindEvents() {
        this.audio.addEventListener('timeupdate', () => {
            this._emit('timeupdate', { 
                currentTime: this.audio.currentTime, 
                duration: this.audio.duration 
            });
        });

        this.audio.addEventListener('ended', () => this._emit('ended'));
        this.audio.addEventListener('error', () => this._emit('error'));
    }

    play(url) {
        if (url) this.audio.src = url;
        return this.audio.play();
    }

    pause() { this.audio.pause(); }

    seek(time) { this.audio.currentTime = time; }

    getCurrentTime() { return this.audio.currentTime; }

    getDuration() { return this.audio.duration || 0; }

    // 事件发布订阅（代替原生 addEventListener）
    on(event, callback) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    }

    _emit(event, data) {
        (this._events[event] || []).forEach(fn => fn(data));
    }
}
```

---

## 五、封装原生播放器代理（native\-player\.js）

**关键点**：这里不包含 ExoPlayer/AVPlayer 的具体实现，只负责通过桥接（Capacitor 插件或 Tauri invoke）调用原生层，并将原生层发回的事件转换为标准的 `on('timeupdate')` 格式。

```JavaScript
export class NativePlayer {
    constructor() {
        this._events = {};
        this._currentTime = 0;
        this._duration = 0;
        this._setupNativeListeners();
    }

    // 监听原生层通过桥接推送的事件
    _setupNativeListeners() {
        // Capacitor 插件监听方式示例
        if (window.Capacitor) {
            window.AudioPlayer.addListener('onProgress', (data) => {
                this._currentTime = data.currentTime;
                this._duration = data.duration;
                this._emit('timeupdate', { 
                    currentTime: data.currentTime, 
                    duration: data.duration 
                });
            });

            window.AudioPlayer.addListener('onEnded', () => this._emit('ended'));
        }

        // Tauri 监听方式示例
        if (window.__TAURI__) {
            window.__TAURI__.event.listen('player-progress', (data) => {
                this._emit('timeupdate', data.payload);
            });
        }
    }

    // ----- 实现统一接口 -----

    play(url) {
        if (window.Capacitor) {
            window.AudioPlayer.play({ url });
        } else if (window.__TAURI__) {
            window.__TAURI__.invoke('play', { url });
        }
    }

    pause() {
        if (window.Capacitor) window.AudioPlayer.pause();
        else if (window.__TAURI__) window.__TAURI__.invoke('pause');
    }

    seek(time) {
        if (window.Capacitor) window.AudioPlayer.seek({ time });
        else if (window.__TAURI__) window.__TAURI__.invoke('seek', { time });
    }

    getCurrentTime() { return this._currentTime; }

    getDuration() { return this._duration; }

    // 同样的 on/off 发布订阅
    on(event, callback) { /* 同 web-player */ }
    _emit(event, data) { /* 同 web-player */ }
}
```

---

## 六、工厂方法与环境注入（main\.js / native\-bridge\.js）

这里是**唯一的"隔离墙"**。只有在这里判断环境，决定实例化哪个类。

```JavaScript
// native-bridge.js 或 main.js
import { WebPlayer } from './players/web-player.js';

async function initPlayer() {
    // 1. 检测是否为原生环境（Capacitor 或 Tauri）
    const isNative = !!(window.Capacitor || window.__TAURI__);

    if (isNative) {
        // 动态导入（关键！Web 打包时不会加载此文件）
        const { NativePlayer } = await import('./players/native-player.js');
        return new NativePlayer();
    } else {
        // 纯 Web 环境：永远使用原来的 HTML5 Audio
        return new WebPlayer();
    }
}

// 将 player 注入到全局，供 app.js 使用
window.player = await initPlayer();
```

> 💡 **为什么用动态导入？**

> 这样 Web 打包时，`native-player.js` 不会被打进 bundle，Web 端完全感知不到原生代码的存在，真正做到"零入侵"。

---

## 七、修改 app\.js（业务层）

只需要改两处，其他逻辑（歌词、UI、主题）完全不变：

|原来（强耦合）|修改后（弱耦合）|
|---|---|
|`const audio = new Audio();`|删除（由外部注入）|
|`audio.play()`|`window.player.play()`|
|`audio.pause()`|`window.player.pause()`|
|`audio.addEventListener('timeupdate', fn)`|`window.player.on('timeupdate', fn)`|
|`audio.currentTime`|`window.player.getCurrentTime()`|
|`audio.duration`|`window.player.getDuration()`|

### 修改示例

**事件监听：**

```JavaScript
// 原来
audio.addEventListener('timeupdate', updateProgress);

// 改为（使用你注入的 player）
window.player.on('timeupdate', (data) => {
    // data 包含 { currentTime, duration }
    updateProgress(data);
});
```

**播放函数：**

```JavaScript
// 原来
function playAudio() {
    audio.play();
}

// 改为
function playAudio() {
    window.player.play();
}
```

---

## 八、Web 端安全保障（零入侵验证）

为了确保 Web 端绝对安全，你可以做以下验证：

### 1\. 依赖检查

在 `native-player.js` 顶部加入环境守卫，如果不在原生环境直接抛出明确错误（但不会被 Web 执行到）：

```JavaScript
// native-player.js 顶部
if (!window.Capacitor && !window.__TAURI__) {
    throw new Error('NativePlayer should only run in native environment');
}
```

### 2\. 构建配置（Vite/Webpack）

确保 `native-player.js` 里引入的 `window.AudioPlayer` 或 `window.__TAURI__` 被标记为外部依赖（external），避免 Web 打包时报错。

**Vite 配置示例：**

```JavaScript
// vite.config.js
export default {
    build: {
        rollupOptions: {
            external: [
                // 标记原生桥接为外部依赖
            ]
        }
    }
}
```

### 3\. 单元测试

在 Web 端打开控制台，输入 `console.log(window.player)`，确认显示的是 `WebPlayer` 实例，而不是 `NativePlayer`。

---

## 九、总结：隔离带来的收益

|维度|Web 端|Android/iOS/桌面端|
|---|---|---|
|**播放引擎**|`new Audio()`（保留）|ExoPlayer/AVPlayer/系统API|
|**后台播放**|不支持（浏览器限制）|完美支持|
|**状态栏控制**|不支持|完美支持|
|**app\.js 改动**|极小（仅替换变量名）|极小（仅替换变量名）|
|**新增代码量**|0（纯 Web 打包不会引入原生文件）|新增 NativePlayer 及原生插件|

---

## ⚠️ 最后的重要提示

**Web 端和原生端共用同一份 ****`app.js`****、****`index.html`**** 和 ****`style.css`****。**

原生端只需要在 `main.js` 启动时将 `NativePlayer` 注入，Web 端启动时将 `WebPlayer` 注入。两者的 UI 交互、歌词同步、进度条渲染 **100% 复用**。

这份分支指南可以独立实施，不需要改动现有的 Web 发布流程。你的网站依然可以照常部署，原生 App 只是像"插件"一样挂载到同一套 UI 上。**安全、干净、互不影响。**

> （注：部分内容可能由 AI 生成）
