/**
 * Open Music Native Player Proxy Implementation
 * Routes play controls to native shells (Capacitor Plugins, Tauri, HarmonyOS)
 * and translates incoming native events back into standardized front-end player events
 */
window.NativePlayer = class NativePlayer {
  constructor() {
    this._events = {};
    this._currentTime = 0;
    this._duration = 0;
    this._isPlaying = false;
    this._volume = 1.0;
    this._setupNativeListeners();
  }

  _setupNativeListeners() {
    // 1. Capacitor (Android/iOS) Custom Plugin Events
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      const AudioPlayer = window.Capacitor.Plugins.AudioPlayer;
      
      AudioPlayer.addListener('onTimeUpdate', (data) => {
        this._currentTime = data.currentTime;
        this._duration = data.duration;
        this._emit('timeupdate', {
          currentTime: data.currentTime,
          duration: data.duration
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
    }

    // 2. Tauri (Desktop) Events
    if (window.__TAURI__) {
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

  play(url) {
    this._isPlaying = true;
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AudioPlayer) {
      window.Capacitor.Plugins.AudioPlayer.play({ url });
    } else if (window.__TAURI__) {
      window.__TAURI__.invoke('play', { url });
    } else if (window.ohosNative) {
      window.ohosNative.play(url);
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

  getCurrentTime() {
    return this._currentTime;
  }

  getDuration() {
    return this._duration;
  }

  setVolume(vol) {
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

  // Exposed helper method for HarmonyOS/Electron shells to invoke JS callback events directly
  _triggerNativeEvent(event, data) {
    console.log(`[NativePlayer] Direct Native callback triggered: ${event}`, data);
    if (event === 'timeupdate') {
      this._currentTime = data.currentTime;
      this._duration = data.duration;
    } else if (event === 'ended') {
      this._isPlaying = false;
    }
    this._emit(event, data);
  }

  // Pub/Sub Events
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
};
