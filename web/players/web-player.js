/**
 * Open Music Web Audio Player Implementation
 * Wraps HTML5 Audio element under the uniform player interface contract
 */
window.WebPlayer = class WebPlayer {
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

  getCurrentTime() {
    return this.audio.currentTime;
  }

  getDuration() {
    return this.audio.duration || 0;
  }

  setVolume(vol) {
    this.audio.volume = vol;
  }

  getVolume() {
    return this.audio.volume;
  }

  isPlaying() {
    return !this.audio.paused;
  }

  // Event Subscription methods (Pub/Sub)
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
};
