# Open Music - 移动端打包与构建指南

我们采用了**H5 网页端与移动原生端隔离**的设计架构：
* **`web/` 目录**：包含所有的播放器逻辑、界面与 PWA 离线缓存服务。
* **`mobile/` 目录**：用于配置跨平台移动构建容器（Capacitor 或 Cordova），用于将 `web/` 下的代码编译打包为 Android (`.apk`) 或 iOS (`.ipa`) 原生应用。

## 推荐的打包方案：Capacitor

[Capacitor](https://capacitorjs.com/) 是目前最先进、轻量的跨平台打包工具。它可以直接将一个静态网页文件夹包装成原生移动项目。

### 1. 初始化移动端包装环境

在根目录下，安装 Capacitor 相关依赖：
```bash
npm init -y
npm install @capacitor/core @capacitor/cli
```

### 2. 初始化 Capacitor 配置文件
初始化并设置 App 名称、包名（如 `com.openmusic.app`）以及网页资源目录（指向我们的 `web` 文件夹）：
```bash
npx cap init "Open Music" "com.openmusic.app" --web-dir=web
```
该命令会在项目根目录下生成 `capacitor.config.json`，配置项指向 `web` 目录。

### 3. 添加原生平台支持

根据需要安装 Android 或 iOS 平台：

#### Android 端
```bash
npm install @capacitor/android
npx cap add android
```
这会在 `android/`（或 `mobile/android`）下生成一个标准的 Android Studio 工程。

#### iOS 端
```bash
npm install @capacitor/ios
npx cap add ios
```
这会在 `ios/`（或 `mobile/ios`）下生成一个标准的 Xcode 工程。

### 4. 同步 Web 代码至移动端

当您修改了 `web/` 目录下的 HTML/CSS/JS 代码后，运行以下命令将其同步到原生 App 的包中：
```bash
npx cap sync
```

### 5. 编译与运行

* 打开 Android Studio 编译 APK：
  ```bash
  npx cap open android
  ```
* 打开 Xcode 编译 iOS App：
  ```bash
  npx cap open ios
  ```
