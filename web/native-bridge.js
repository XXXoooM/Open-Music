/**
 * Open Music Unified Native Bridge
 * Bridges web app events with native shells (Android, iOS, Electron, HarmonyOS)
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
    const isNativeContainer = this.env.isCapacitor || this.env.isHarmony || !!window.__TAURI__;
    if (isNativeContainer && window.NativePlayer) {
      window.player = new window.NativePlayer();
    } else if (window.WebPlayer) {
      window.player = new window.WebPlayer();
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

    // 2. HarmonyOS native proxy
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
  }
};

// Initialize immediately so that window.player is ready before subsequent scripts (app.js) run
NativeBridge.init();
