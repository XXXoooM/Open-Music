/**
 * Open Music Unified Native Bridge & Player Engine Factory
 * Bridges web app events with native shells (Android, iOS, Electron, HarmonyOS)
 */

/**
 * 1. Web Audio Player Implementation
 * Wraps HTML5 Audio element under the uniform player interface contract
 */
class WebPlayer {
  constructor() {
    this.audio = new Audio();
    this._events = {};
    this._bindEvents();
  }

  _bindEvents() {
    this.audio.addEventListener('timeupdate', () => {
      this._emit('timeupdate', {
        currentTime: this.audio.currentTime,
        duration: this.audio.duration || 0
      });
    });

    this.audio.addEventListener('ended', () => {
      this._emit('ended');
    });

    this.audio.addEventListener('error', (e) => {
      this._emit('error', e);
    });

    this.audio.addEventListener('durationchange', () => {
      this._emit('durationchange', {
        duration: this.audio.duration || 0
      });
    });
  }

  play(url) {
    if (url && this.audio.src !== url) {
      this.audio.src = url;
      this.audio.load();
    }
    return this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  seek(time) {
    this.audio.currentTime = time;
  }

  setPlaylist(playlist, index) {}
  setPlayMode(mode) {}
  setTrackIndex(index) {}

  getCurrentTime() {
    return this.audio.currentTime;
  }

  getDuration() {
    return this.audio.duration || 0;
  }

  setVolume(vol) {
    if (typeof vol !== 'number' || isNaN(vol) || !isFinite(vol)) {
      vol = 0.7;
    }
    vol = Math.max(0, Math.min(1, vol));
    this.audio.volume = vol;
  }

  getVolume() {
    return this.audio.volume;
  }

  isPlaying() {
    return !this.audio.paused;
  }

  on(event, callback) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(callback);
  }

  off(event, callback) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(fn => fn !== callback);
  }

  _emit(event, data) {
    if (this._events[event]) {
      this._events[event].forEach(fn => {
        try {
          fn(data);
        } catch (err) {
          console.error(`Error in event handler for ${event}:`, err);
        }
      });
    }
  }
}

/**
 * 2. Native Player Proxy Implementation
 * Routes play controls to native shells (Capacitor Plugins, Tauri, HarmonyOS)
 */
class NativePlayer {
  constructor() {
    this._events = {};
    this._currentTime = 0;
    this._duration = 0;
    this._isPlaying = false;
    this._volume = 1.0;
    this._currentUrl = null;
    this._setupNativeListeners();
  }

  _setupNativeListeners() {
    // Bind Capacitor custom player listeners with retry policy to accommodate async load timings
    const bindCapacitor = () => {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
        const AudioPlayer = window.Capacitor.Plugins.AudioPlayer;
        
        AudioPlayer.addListener('onTimeUpdate', (data) => {
          this._currentTime = data.currentTime;
          if (data.duration && data.duration > 0 && data.duration !== this._duration) {
            this._duration = data.duration;
            this._emit('durationchange', { duration: data.duration });
          } else if (data.duration && data.duration > 0) {
            this._duration = data.duration;
          }
          this._emit('timeupdate', {
            currentTime: data.currentTime,
            duration: this._duration
          });
        });

        AudioPlayer.addListener('onEnded', () => {
          this._isPlaying = false;
          this._emit('ended');
        });

        AudioPlayer.addListener('onError', (err) => {
          this._isPlaying = false;
          this._emit('error', err);
        });

        AudioPlayer.addListener('onStateChanged', (data) => {
          this._isPlaying = data.isPlaying;
        });

        AudioPlayer.addListener('onTrackChanged', (data) => {
          this._emit('trackchanged', { index: data.index });
        });

        console.log('[NativePlayer] Successfully bound Capacitor AudioPlayer listeners');
        return true;
      }
      return false;
    };

    if (!bindCapacitor()) {
      let retries = 0;
      const interval = setInterval(() => {
        retries++;
        if (bindCapacitor() || retries > 20) {
          clearInterval(interval);
        }
      }, 150);
    }

    // 2. Tauri (Desktop) Events
    if (window.__TAURI__ && window.__TAURI__.event) {
      window.__TAURI__.event.listen('player-progress', (event) => {
        const data = event.payload;
        this._currentTime = data.currentTime;
        this._duration = data.duration;
        this._emit('timeupdate', data);
      });

      window.__TAURI__.event.listen('player-ended', () => {
        this._isPlaying = false;
        this._emit('ended');
      });
    }
  }

  async requestNotificationPermission() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      try {
        const AP = window.Capacitor.Plugins.AudioPlayer;
        if (typeof AP.checkPermissions === 'function') {
          const check = await AP.checkPermissions();
          if (check.notifications !== 'granted') {
            await AP.requestPermissions({ permissions: ['notifications'] });
          }
        }
      } catch (e) {
        console.warn('Failed to request notification permission:', e);
      }
    }
  }

  play(url) {
    this._isPlaying = true;
    this.requestNotificationPermission();
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      if (url && url === this._currentUrl) {
        window.Capacitor.Plugins.AudioPlayer.play({ url: null });
      } else {
        this._currentUrl = url;
        window.Capacitor.Plugins.AudioPlayer.play({ url });
      }
    } else if (window.__TAURI__) {
      if (url && url === this._currentUrl) {
        window.__TAURI__.invoke('play', { url: null });
      } else {
        this._currentUrl = url;
        window.__TAURI__.invoke('play', { url });
      }
    } else if (window.ohosNative) {
      if (url && url === this._currentUrl) {
        window.ohosNative.play(null);
      } else {
        this._currentUrl = url;
        window.ohosNative.play(url);
      }
    }
  }

  pause() {
    this._isPlaying = false;
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      window.Capacitor.Plugins.AudioPlayer.pause();
    } else if (window.__TAURI__) {
      window.__TAURI__.invoke('pause');
    } else if (window.ohosNative) {
      window.ohosNative.pause();
    }
  }

  seek(time) {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      window.Capacitor.Plugins.AudioPlayer.seek({ time });
    } else if (window.__TAURI__) {
      window.__TAURI__.invoke('seek', { time });
    } else if (window.ohosNative) {
      window.ohosNative.seek(time);
    }
  }

  setPlaylist(playlist, index) {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      const formattedList = playlist.map(track => ({
        url: track.url,
        title: track.name || track.title || '未知歌名',
        artist: track.artist || track.author || '未知歌手',
        cover: track.pic || ''
      }));
      window.Capacitor.Plugins.AudioPlayer.setPlaylist({ playlist: formattedList, index });
    }
  }

  setPlayMode(mode) {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      window.Capacitor.Plugins.AudioPlayer.setPlayMode({ mode });
    }
  }

  setTrackIndex(index) {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      window.Capacitor.Plugins.AudioPlayer.setTrackIndex({ index });
    }
  }

  getCurrentTime() {
    return this._currentTime;
  }

  getDuration() {
    return this._duration;
  }

  setVolume(vol) {
    if (typeof vol !== 'number' || isNaN(vol) || !isFinite(vol)) {
      vol = 0.7;
    }
    vol = Math.max(0, Math.min(1, vol));
    this._volume = vol;
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      window.Capacitor.Plugins.AudioPlayer.setVolume({ volume: vol });
    } else if (window.__TAURI__) {
      window.__TAURI__.invoke('set_volume', { volume: vol });
    } else if (window.ohosNative) {
      window.ohosNative.setVolume(vol);
    }
  }

  getVolume() {
    return this._volume;
  }

  isPlaying() {
    return this._isPlaying;
  }

  _triggerNativeEvent(event, data) {
    console.log(`[NativePlayer] Direct Native callback: ${event}`, data);
    if (event === 'timeupdate') {
      this._currentTime = data.currentTime;
      this._duration = data.duration;
    } else if (event === 'ended') {
      this._isPlaying = false;
    }
    this._emit(event, data);
  }

  on(event, callback) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(callback);
  }

  off(event, callback) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(fn => fn !== callback);
  }

  _emit(event, data) {
    if (this._events[event]) {
      this._events[event].forEach(fn => {
        try {
          fn(data);
        } catch (err) {
          console.error(`Error in native player handler for ${event}:`, err);
        }
      });
    }
  }
}

/**
 * 3. Unified Native Bridge Object
 */
const NativeBridge = {
  env: {
    isWeb: false,
    isCapacitor: false,
    isElectron: false,
    isHarmony: false
  },

  init() {
    // Detect Capacitor (Android/iOS)
    this.env.isCapacitor = !!window.Capacitor;
    
    // Detect HarmonyOS JSBridge proxy
    this.env.isHarmony = typeof window.ohosNative !== 'undefined';

    // Detect Electron
    if (this.env.isCapacitor && window.Capacitor.getPlatform() === 'electron') {
      this.env.isElectron = true;
    } else if (navigator.userAgent.includes('Electron')) {
      this.env.isElectron = true;
    }

    // Default to Web if not in any native container
    this.env.isWeb = !this.env.isCapacitor && !this.env.isHarmony;

    console.log('[NativeBridge] Initialized in environment:', this.env);

    // Initialize player engine based on environment
    // Capacitor (Android/iOS) and HarmonyOS require native players (ExoPlayer/AVPlayer/AVSession)
    // to prevent background activity restrictions on mobile.
    // Web, Electron, and Tauri run standard HTML5 Audio with native MediaSession support.
    const needsNativePlayer = (this.env.isCapacitor && !this.env.isElectron) || this.env.isHarmony;
    if (needsNativePlayer) {
      window.playerEngine = new NativePlayer();
    } else {
      window.playerEngine = new WebPlayer();
    }

    // Disable Service Worker in native containers to avoid offline caching bugs/conflicts
    if (!this.env.isWeb && navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }

    // Bind standard Web Media Session action handlers
    if (navigator.mediaSession) {
      navigator.mediaSession.setActionHandler('play', () => {
        console.log('[NativeBridge] MediaSession action: play');
        if (window.player && typeof window.player.play === 'function') {
          window.player.play();
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        console.log('[NativeBridge] MediaSession action: pause');
        if (window.player && typeof window.player.pause === 'function') {
          window.player.pause();
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        console.log('[NativeBridge] MediaSession action: previoustrack');
        if (window.player && typeof window.player.prev === 'function') {
          window.player.prev();
        }
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        console.log('[NativeBridge] MediaSession action: nexttrack');
        if (window.player && typeof window.player.next === 'function') {
          window.player.next();
        }
      });
    }

    // Auto-check for Tauri desktop updates after launch
    if (this.env.isTauri || window.__TAURI__ || window.__TAURI_INTERNALS__) {
      setTimeout(() => {
        this.checkDesktopUpdate(false);
      }, 3000);
    }
  },

  /**
   * Sync playback metadata (title, artist, album art cover, duration) to the system
   */
  updateMediaInfo(info) {
    console.log('[NativeBridge] Update Media Info:', info);

    // 1. Web Standard Media Session (supported natively by Android WebView and iOS WKWebView)
    if (navigator.mediaSession && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: info.title,
        artist: info.artist,
        album: 'Open Music',
        artwork: [
          { src: info.cover || '', sizes: '512x512', type: 'image/png' }
        ]
      });
    }

    // 2. Capacitor Custom Plugin notification metadata sync
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      window.Capacitor.Plugins.AudioPlayer.updateMetadata({
        title: info.title,
        artist: info.artist,
        cover: info.cover
      });
    }

    // 3. HarmonyOS native proxy
    if (this.env.isHarmony && window.ohosNative) {
      window.ohosNative.updateMediaInfo(JSON.stringify({
        title: info.title,
        artist: info.artist,
        cover: info.cover,
        duration: info.duration
      }));
    }
  },

  /**
   * Sync playing/paused status to the system
   */
  updatePlayState(isPlaying) {
    console.log('[NativeBridge] Update Play State:', isPlaying);

    if (navigator.mediaSession) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }

    if (this.env.isHarmony && window.ohosNative) {
      window.ohosNative.updatePlayState(isPlaying);
    }
  },

  /**
   * Tauri Desktop Auto-Updater Check
   */
  async checkDesktopUpdate(isManual = false) {
    if (!window.__TAURI__ && !window.__TAURI_INTERNALS__) return;
    try {
      console.log('[NativeBridge] Checking for Tauri desktop updates...');
      const { check } = await import('@tauri-apps/plugin-updater');
      const { relaunch } = await import('@tauri-apps/plugin-process');

      const update = await check();
      if (update && update.available) {
        console.log(`[NativeBridge] Found new version ${update.version}`);
        const confirmed = confirm(`发现新版本 v${update.version}！\n\n更新说明:\n${update.body || '包含最新性能优化与修复'}\n\n是否立即下载升级？`);
        if (confirmed) {
          alert('正在后台下载新版本，下载完成后将自动重启应用...');
          await update.downloadAndInstall();
          await relaunch();
        }
      } else if (isManual) {
        alert('当前已是最新桌面版本！');
      }
    } catch (e) {
      console.warn('[NativeBridge] Desktop update check failed:', e);
      if (isManual) {
        alert('检查更新失败，请检查网络连接或稍后再试。');
      }
    }
  }
};

// Initialize immediately so that window.player is ready before subsequent scripts (app.js) run
NativeBridge.init();

