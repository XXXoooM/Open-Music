/**
 * Open Music - Web Music Player Core Logic
 * Author: Antigravity
 * Technology: ES6+, HTML5 Audio API, LRC Parsing, Dynamic String Hashing
 */

// API Configuration
let playlistId = '17910751956';
function getApiUrl() {
    return `https://api.qijieya.cn/meting/?server=netease&type=playlist&id=${playlistId}`;
}

// Curated Fallbacks (Used if API fails, rate-limits, or offline)
const FALLBACK_PLAYLIST = [
    {
        name: "你若成风",
        artist: "许嵩/莫诗旎",
        url: "https://api.qijieya.cn/meting/?server=netease&type=url&id=167929",
        pic: "https://api.qijieya.cn/meting/?server=netease&type=pic&id=109951172188951978",
        lrc: "https://api.qijieya.cn/meting/?server=netease&type=lrc&id=167929"
    },
    {
        name: "雅俗共赏",
        artist: "许嵩",
        url: "https://api.qijieya.cn/meting/?server=netease&type=url&id=411214279",
        pic: "https://api.qijieya.cn/meting/?server=netease&type=pic&id=3431575794705764",
        lrc: "https://api.qijieya.cn/meting/?server=netease&type=lrc&id=411214279"
    },
    {
        name: "走马",
        artist: "陈粒",
        url: "https://api.qijieya.cn/meting/?server=netease&type=url&id=30431367",
        pic: "https://api.qijieya.cn/meting/?server=netease&type=pic&id=7721870161993398",
        lrc: "https://api.qijieya.cn/meting/?server=netease&type=lrc&id=30431367"
    },
    {
        name: "美人鱼",
        artist: "林俊杰",
        url: "https://api.qijieya.cn/meting/?server=netease&type=url&id=108931",
        pic: "https://api.qijieya.cn/meting/?server=netease&type=pic&id=109951171891430447",
        lrc: "https://api.qijieya.cn/meting/?server=netease&type=lrc&id=108931"
    },
    {
        name: "情歌",
        artist: "梁静茹",
        url: "https://api.qijieya.cn/meting/?server=netease&type=url&id=254059",
        pic: "https://api.qijieya.cn/meting/?server=netease&type=pic&id=109951168163257789",
        lrc: "https://api.qijieya.cn/meting/?server=netease&type=lrc&id=254059"
    }
];

// App State
let playlist = [];
let filteredPlaylist = [];
let currentTrackIndex = 0;
let parsedLyrics = [];
let currentLyricIndex = -1;
let isPlaying = false;
let isMuted = false;
let previousVolume = 0.7;
let playMode = 'list-loop'; // 'list-loop', 'single-loop', 'shuffle'

// DOM Elements
const ambientBg = document.getElementById('ambient-bg');
const albumArt = document.getElementById('album-art');
const tonearm = document.getElementById('tonearm');
const vinylDisc = document.getElementById('vinyl-disc');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const progressHandle = document.getElementById('progress-handle');

// Control Buttons
const btnPlayPause = document.getElementById('btn-play-pause');
const svgPlay = document.getElementById('svg-play');
const svgPause = document.getElementById('svg-pause');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnShuffle = document.getElementById('btn-shuffle');
const btnRepeat = document.getElementById('btn-repeat');
const repeatBadge = document.getElementById('repeat-badge');

// Volume Controls
const btnMute = document.getElementById('btn-mute');
const volumeIcon = document.getElementById('volume-icon');
const volumeSliderContainer = document.getElementById('volume-slider-container');
const volumeSlider = document.getElementById('volume-slider');

// Lyrics & Playlist Sidebar
const lyricsContainer = document.getElementById('lyrics-container');
const lyricsWrapper = document.getElementById('lyrics-wrapper');
const lrcStatus = document.getElementById('lrc-status');
const playlistDrawer = document.getElementById('playlist-drawer');
const togglePlaylistBtn = document.getElementById('toggle-playlist');
const closePlaylistBtn = document.getElementById('close-playlist');
const trackListContainer = document.getElementById('track-list');
const searchInput = document.getElementById('playlist-search-input');
const clearSearchBtn = document.getElementById('clear-search');

/* ==========================================================================
   Initialization & API Fetching
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initEventListeners();
    initKeyboardShortcuts();
    fetchPlaylist();
    registerServiceWorker();
});

// Load configuration state from LocalStorage
function loadSettings() {
    const savedPlaylistId = localStorage.getItem('om-playlistid');
    if (savedPlaylistId !== null) {
        playlistId = savedPlaylistId;
    }

    const savedVolume = localStorage.getItem('om-volume');
    if (savedVolume !== null) {
        window.player.setVolume(parseFloat(savedVolume));
        volumeSlider.style.width = `${parseFloat(savedVolume) * 100}%`;
    } else {
        window.player.setVolume(0.7);
        volumeSlider.style.width = '70%';
    }

    const savedPlayMode = localStorage.getItem('om-playmode');
    if (savedPlayMode !== null) {
        playMode = savedPlayMode;
    }
    updatePlayModeUI();

    const savedTrackIndex = localStorage.getItem('om-trackindex');
    if (savedTrackIndex !== null) {
        currentTrackIndex = parseInt(savedTrackIndex, 10);
    }
}

// Fetch playlist data
// Fetch playlist data
async function fetchPlaylist() {
    try {
        lrcStatus.textContent = '载入歌曲列表中...';
        const response = await fetch(getApiUrl());
        if (!response.ok) throw new Error('API server returned error code');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            playlist = data;
            // Cache the successfully loaded playlist ID
            localStorage.setItem('om-playlistid', playlistId);
        } else {
            throw new Error('API returned empty playlist');
        }
    } catch (err) {
        console.warn('Playlist fetch failed:', err);
        showCustomAlert(getRandomPlaylistErrorMessage());
        
        // Restore previous valid playlist ID
        const lastValidId = localStorage.getItem('om-playlistid') || '17910751956';
        playlistId = lastValidId;
        
        // Refetch the restored valid playlist
        try {
            const restoreResponse = await fetch(getApiUrl());
            if (restoreResponse.ok) {
                const restoreData = await restoreResponse.json();
                if (Array.isArray(restoreData) && restoreData.length > 0) {
                    playlist = restoreData;
                    filteredPlaylist = [...playlist];
                    renderPlaylist();
                    return;
                }
            }
        } catch (restoreErr) {
            console.warn('Restoring last playlist failed, using fallback:', restoreErr);
        }
        
        // Ultimate fallback
        playlist = FALLBACK_PLAYLIST;
        playlistId = '17910751956';
        localStorage.setItem('om-playlistid', '17910751956');
    } finally {
        filteredPlaylist = [...playlist];
        if (currentTrackIndex >= playlist.length) {
            currentTrackIndex = 0;
            localStorage.setItem('om-trackindex', 0);
        }
        renderPlaylist();
        if (playlist.length > 0) {
            loadTrack(currentTrackIndex, false);
        } else {
            // Empty state UI updates
            songTitle.textContent = '无歌曲';
            songArtist.textContent = '请配置有效歌单';
            albumArt.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23222"/></svg>';
            ambientBg.style.backgroundImage = 'none';
            renderNoLyrics();
        }
    }
}

/* ==========================================================================
   Track Loading & Audio Engine
   ========================================================================== */
function loadTrack(index, shouldPlay = true) {
    if (playlist.length === 0) return;

    // Reset state
    currentTrackIndex = index;
    localStorage.setItem('om-trackindex', currentTrackIndex);
    
    const track = playlist[index];

    // Update Song Metadata UI
    songTitle.textContent = track.name;
    songTitle.title = track.name;
    songArtist.textContent = track.artist;
    
    // Smoothly load album artwork (fallback to custom gradient circle if broken)
    albumArt.src = track.pic || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23222"/></svg>';
    
    // Set dynamic blurred background
    if (track.pic) {
        ambientBg.style.backgroundImage = `url('${track.pic}')`;
    } else {
        ambientBg.style.backgroundImage = 'none';
    }

    // Generate dynamic accent colors matching the song's identity
    applyDynamicTheme(track.name, track.artist);

    // Reset Progress Bar
    progressBar.style.width = '0%';
    currentTimeEl.textContent = '00:00';
    totalDurationEl.textContent = '00:00';

    // Fetch and sync lyrics
    loadLyrics(track.lrc);

    // Update Playlist selection highlight
    updatePlaylistHighlight();

    if (typeof NativeBridge !== 'undefined') {
        NativeBridge.updateMediaInfo({
            title: track.name,
            artist: track.artist,
            cover: track.pic,
            duration: window.player.getDuration() || 0
        });
    }

    if (shouldPlay) {
        playAudio();
    } else {
        pauseAudio();
    }
}

function playAudio() {
    isPlaying = true;
    const track = playlist[currentTrackIndex];
    const playPromise = window.player.play(track ? track.url : null);
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(e => {
            console.log('Play triggered action blocked by browser autoplay policy:', e);
            isPlaying = false;
            pauseAudio();
        });
    }
    
    svgPlay.classList.add('hidden');
    svgPause.classList.remove('hidden');
    
    // Pivot tonearm to disk & spin
    tonearm.classList.add('playing');
    vinylDisc.classList.add('playing');
    document.querySelector('.app-container').classList.remove('paused-eq');

    if (typeof NativeBridge !== 'undefined') {
        NativeBridge.updatePlayState(true);
    }
}

function pauseAudio() {
    isPlaying = false;
    window.player.pause();
    
    svgPause.classList.add('hidden');
    svgPlay.classList.remove('hidden');
    
    // Pivot tonearm away & pause rotation
    tonearm.classList.remove('playing');
    vinylDisc.classList.remove('playing');
    document.querySelector('.app-container').classList.add('paused-eq');

    if (typeof NativeBridge !== 'undefined') {
        NativeBridge.updatePlayState(false);
    }
}

/* ==========================================================================
   Dynamic Color Hashing
   ========================================================================== */
function applyDynamicTheme(title, artist) {
    const hashColors = getSongHashColor(title, artist);
    document.documentElement.style.setProperty('--accent-color', hashColors.primary);
    document.documentElement.style.setProperty('--accent-color-rgb', hashColors.rgb);
}

function getSongHashColor(title, artist) {
    let hash = 0;
    const str = title + artist;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate hue from 0 to 360, saturation 85%, lightness 55% for clean neon accents
    const hue = Math.abs(hash) % 360;
    return {
        primary: `hsl(${hue}, 85%, 55%)`,
        rgb: hslToRgbString(hue, 85, 55)
    };
}

function hslToRgbString(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    const r = Math.round(255 * f(0));
    const g = Math.round(255 * f(8));
    const b = Math.round(255 * f(4));
    return `${r}, ${g}, ${b}`;
}

/* ==========================================================================
   Lyrics Synchronizer Engine (LRC Parser)
   ========================================================================== */
async function loadLyrics(lrcUrl) {
    lyricsWrapper.innerHTML = '<div class="lyric-line placeholder">歌词载入中...</div>';
    lrcStatus.textContent = '';
    parsedLyrics = [];
    currentLyricIndex = -1;

    if (!lrcUrl) {
        renderNoLyrics();
        return;
    }

    try {
        const res = await fetch(lrcUrl);
        if (!res.ok) throw new Error('Lyrics response error');
        const text = await res.text();
        
        parsedLyrics = parseLRC(text);
        
        if (parsedLyrics.length > 0) {
            renderLyrics();
        } else {
            renderNoLyrics();
        }
    } catch (e) {
        console.warn('Could not parse lyrics from API:', e);
        renderNoLyrics();
    }
}

function parseLRC(lrcText) {
    const lines = lrcText.split('\n');
    const lyrics = [];
    // Timestamp format matches: [00:12.34] or [00:12:34] or [00:12.345]
    const timeRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/g;

    for (const line of lines) {
        const matches = [...line.matchAll(timeRegex)];
        if (matches.length === 0) continue;

        // Clean out timestamp headers to extract raw lyric texts
        const text = line.replace(/\[\d{2}:\d{2}[.:]\d{2,3}\]/g, '').trim();
        
        // Skip metadata headers like [by:xxx] or [ar:xxx]
        if (line.match(/\[(ti|ar|al|by|offset):/i)) continue;

        for (const match of matches) {
            const min = parseInt(match[1], 10);
            const sec = parseInt(match[2], 10);
            const ms = parseInt(match[3], 10);
            const msMultiplier = match[3].length === 2 ? 10 : 1;
            const time = min * 60 + sec + (ms * msMultiplier) / 1000;
            
            lyrics.push({ time, text: text || '♫' });
        }
    }

    // Sort lyrics Chronologically
    return lyrics.sort((a, b) => a.time - b.time);
}

function renderLyrics() {
    lyricsWrapper.innerHTML = '';
    
    parsedLyrics.forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'lyric-line';
        div.dataset.index = index;
        div.textContent = line.text;
        
        // Click/Tap lyric line to seek directly
        div.addEventListener('click', () => {
            window.player.seek(line.time);
            playAudio();
            syncLyrics(true);
        });
        
        lyricsWrapper.appendChild(div);
    });
}

function renderNoLyrics() {
    lyricsWrapper.innerHTML = `
        <div class="lyric-line placeholder">纯音乐 / 暂无歌词</div>
        <div class="lyric-line placeholder">让优美的旋律伴你度过时光</div>
    `;
    lrcStatus.textContent = '暂无歌词';
}

function syncLyrics(forceScroll = false) {
    if (parsedLyrics.length === 0) return;

    const currentTime = window.player.getCurrentTime();
    let newIndex = -1;

    for (let i = 0; i < parsedLyrics.length; i++) {
        if (currentTime >= parsedLyrics[i].time) {
            newIndex = i;
        } else {
            break;
        }
    }

    if (newIndex !== currentLyricIndex || forceScroll) {
        // Remove active class from previous lyric line
        const oldActive = lyricsWrapper.querySelector('.lyric-line.active');
        if (oldActive) oldActive.classList.remove('active');

        currentLyricIndex = newIndex;

        if (currentLyricIndex !== -1) {
            const activeLine = lyricsWrapper.querySelector(`.lyric-line[data-index="${currentLyricIndex}"]`);
            if (activeLine) {
                activeLine.classList.add('active');
                
                // Center-align the active lyric line with scroll animation
                activeLine.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }
}

/* ==========================================================================
   Playlist Renderer & Search Box Filter
   ========================================================================== */
function renderPlaylist() {
    trackListContainer.innerHTML = '';

    if (filteredPlaylist.length === 0) {
        trackListContainer.innerHTML = '<div style="text-align: center; color: var(--text-inactive); padding-top: 40px; font-size: 0.9rem;">没有找到匹配的歌曲</div>';
        return;
    }

    filteredPlaylist.forEach((track, displayIndex) => {
        // Find index in original master playlist
        const masterIndex = playlist.findIndex(t => t.url === track.url);

        const item = document.createElement('div');
        item.className = 'track-item';
        if (masterIndex === currentTrackIndex) {
            item.classList.add('active');
        }
        item.dataset.index = masterIndex;

        item.innerHTML = `
            <!-- Equalizer bar graph (visible when active) -->
            <div class="equalizer">
                <div class="equalizer-bar"></div>
                <div class="equalizer-bar"></div>
                <div class="equalizer-bar"></div>
                <div class="equalizer-bar"></div>
            </div>
            <div class="track-number">${displayIndex + 1}</div>
            <img class="track-thumb" src="${track.pic}" alt="Thumbnail" loading="lazy">
            <div class="track-detail">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
        `;

        item.addEventListener('click', () => {
            loadTrack(masterIndex, true);
            // On mobile viewports, automatically close the playlist drawer on selection
            if (window.innerWidth <= 960) {
                playlistDrawer.classList.remove('open');
            }
        });

        trackListContainer.appendChild(item);
    });
}

function updatePlaylistHighlight() {
    const items = trackListContainer.querySelectorAll('.track-item');
    items.forEach(item => {
        const index = parseInt(item.dataset.index, 10);
        if (index === currentTrackIndex) {
            item.classList.add('active');
            
            // Adjust numbering container layout
            const numEl = item.querySelector('.track-number');
            if (numEl) numEl.style.display = 'none';
        } else {
            item.classList.remove('active');
            const numEl = item.querySelector('.track-number');
            if (numEl) numEl.style.display = 'block';
        }
    });
}

// Search Filter Logic
function filterPlaylist(query) {
    query = query.trim().toLowerCase();
    
    if (query) {
        clearSearchBtn.classList.remove('hidden');
        filteredPlaylist = playlist.filter(track => 
            track.name.toLowerCase().includes(query) || 
            track.artist.toLowerCase().includes(query)
        );
    } else {
        clearSearchBtn.classList.add('hidden');
        filteredPlaylist = [...playlist];
    }
    
    renderPlaylist();
}

/* ==========================================================================
   Playback Controls & Event Listeners
   ========================================================================== */
function initEventListeners() {
    // Audio engine event bindings using uniform player interface
    window.player.on('timeupdate', () => {
        updateProgress();
        syncLyrics();
    });

    window.player.on('durationchange', (data) => {
        totalDurationEl.textContent = formatTime(data.duration);
        if (typeof NativeBridge !== 'undefined' && playlist[currentTrackIndex]) {
            const track = playlist[currentTrackIndex];
            NativeBridge.updateMediaInfo({
                title: track.name,
                artist: track.artist,
                cover: track.pic,
                duration: data.duration || 0
            });
        }
    });

    window.player.on('ended', () => {
        handleTrackEnded();
    });

    window.player.on('error', (e) => {
        console.error('Audio playback error details:', e);
        lrcStatus.textContent = '播放失败，正在自动跳到下一首...';
        // Auto skip to next track after 2 seconds
        setTimeout(() => {
            handleNextTrack();
        }, 2000);
    });

    // Control buttons events
    btnPlayPause.addEventListener('click', () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    });

    btnPrev.addEventListener('click', handlePrevTrack);
    btnNext.addEventListener('click', handleNextTrack);

    btnShuffle.addEventListener('click', () => {
        if (playMode === 'shuffle') {
            playMode = 'list-loop';
        } else {
            playMode = 'shuffle';
        }
        localStorage.setItem('om-playmode', playMode);
        updatePlayModeUI();
    });

    btnRepeat.addEventListener('click', () => {
        if (playMode === 'list-loop') {
            playMode = 'single-loop';
        } else if (playMode === 'single-loop') {
            // cycle to shuffle, or back to list loop
            playMode = 'list-loop';
        } else {
            playMode = 'single-loop';
        }
        localStorage.setItem('om-playmode', playMode);
        updatePlayModeUI();
    });

    // Seek Drag Control
    progressContainer.addEventListener('mousedown', startSeekDrag);
    progressContainer.addEventListener('touchstart', startSeekDrag, { passive: true });

    // Playlist Drawer toggling
    togglePlaylistBtn.addEventListener('click', () => {
        playlistDrawer.classList.toggle('open');
    });

    closePlaylistBtn.addEventListener('click', () => {
        playlistDrawer.classList.remove('open');
    });

    // Close drawer when clicking outside card or inside lyrics panel
    document.addEventListener('click', (e) => {
        if (!playlistDrawer.contains(e.target) && 
            !togglePlaylistBtn.contains(e.target) && 
            playlistDrawer.classList.contains('open')) {
            playlistDrawer.classList.remove('open');
        }
    });

    // Search bar event listeners
    searchInput.addEventListener('input', (e) => {
        filterPlaylist(e.target.value);
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterPlaylist('');
        searchInput.focus();
    });

    // Volume Panel Actions
    btnMute.addEventListener('click', toggleMute);
    volumeSliderContainer.addEventListener('mousedown', startVolumeDrag);
    volumeSliderContainer.addEventListener('touchstart', startVolumeDrag, { passive: true });

    // Playlist custom config panel handlers
    const btnPlaylistSettings = document.getElementById('btn-playlist-settings');
    const playlistSettingsPanel = document.getElementById('playlist-settings-panel');
    const inputPlaylistId = document.getElementById('input-playlist-id');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const btnResetPlaylist = document.getElementById('btn-reset-playlist');

    btnPlaylistSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        playlistSettingsPanel.classList.toggle('hidden');
        if (!playlistSettingsPanel.classList.contains('hidden')) {
            inputPlaylistId.value = playlistId === '17910751956' ? '' : playlistId;
            inputPlaylistId.focus();
        }
    });

    // Stop propagation so clicking settings panel doesn't close the drawer
    playlistSettingsPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    btnSaveSettings.addEventListener('click', () => {
        const rawInput = inputPlaylistId.value.trim();
        if (rawInput) {
            const parsedId = parsePlaylistId(rawInput);
            if (parsedId) {
                playlistId = parsedId;
                currentTrackIndex = 0;
                localStorage.setItem('om-trackindex', 0);
                fetchPlaylist();
                playlistSettingsPanel.classList.add('hidden');
            } else {
                showCustomAlert(getRandomPlaylistErrorMessage() + '\n请检查输入的是否为数字 ID 或有效的网易云歌单分享链接！');
            }
        }
    });

    btnResetPlaylist.addEventListener('click', () => {
        playlistId = '17910751956';
        inputPlaylistId.value = '';
        localStorage.removeItem('om-playlistid');
        currentTrackIndex = 0;
        localStorage.setItem('om-trackindex', 0);
        fetchPlaylist();
        playlistSettingsPanel.classList.add('hidden');
    });

    // Help Modal Event Bindings
    const btnHelp = document.getElementById('btn-help');
    const helpModal = document.getElementById('help-modal');
    const closeHelpModal = document.getElementById('close-help-modal');

    if (btnHelp && helpModal && closeHelpModal) {
        btnHelp.addEventListener('click', (e) => {
            e.stopPropagation();
            helpModal.classList.remove('hidden');
        });

        closeHelpModal.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });

        // Close when clicking outside of modal card
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.add('hidden');
            }
        });
    }

    // Alert Modal Event Bindings
    const alertModal = document.getElementById('alert-modal');
    const closeAlertModal = document.getElementById('close-alert-modal');

    if (alertModal && closeAlertModal) {
        closeAlertModal.addEventListener('click', () => {
            alertModal.classList.add('hidden');
        });

        // Close when clicking outside of modal card
        alertModal.addEventListener('click', (e) => {
            if (e.target === alertModal) {
                alertModal.classList.add('hidden');
            }
        });
    }
}

/* ==========================================================================
   Progress Updates & Seeking Logic
   ========================================================================== */
function updateProgress() {
    const duration = window.player.getDuration();
    if (duration) {
        const currentTime = window.player.getCurrentTime();
        const percent = (currentTime / duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
    }
}

function startSeekDrag(e) {
    const handleDrag = (event) => {
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const rect = progressContainer.getBoundingClientRect();
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        progressBar.style.width = `${percentage * 100}%`;
        const duration = window.player.getDuration() || 0;
        currentTimeEl.textContent = formatTime(percentage * duration);
    };

    const stopDrag = (event) => {
        const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
        const rect = progressContainer.getBoundingClientRect();
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        const duration = window.player.getDuration();
        if (duration) {
            window.player.seek(percentage * duration);
        }
        
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', handleDrag);
        document.removeEventListener('touchend', stopDrag);
    };

    // Calculate initial position on click down
    handleDrag(e);

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', handleDrag, { passive: true });
    document.addEventListener('touchend', stopDrag);
}

/* ==========================================================================
   Volume Control Engine
   ========================================================================== */
function toggleMute() {
    if (isMuted) {
        isMuted = false;
        window.player.setVolume(previousVolume);
        volumeSlider.style.width = `${previousVolume * 100}%`;
        volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        localStorage.setItem('om-volume', previousVolume);
    } else {
        isMuted = true;
        previousVolume = window.player.getVolume();
        window.player.setVolume(0);
        volumeSlider.style.width = '0%';
        volumeIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        localStorage.setItem('om-volume', 0);
    }
}

function startVolumeDrag(e) {
    const handleDrag = (event) => {
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const rect = volumeSliderContainer.getBoundingClientRect();
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        window.player.setVolume(percentage);
        volumeSlider.style.width = `${percentage * 100}%`;
        
        if (percentage > 0) {
            isMuted = false;
            previousVolume = percentage;
            volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        } else {
            isMuted = true;
            volumeIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        }
        localStorage.setItem('om-volume', percentage);
    };

    const stopDrag = () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', handleDrag);
        document.removeEventListener('touchend', stopDrag);
    };

    handleDrag(e);

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', handleDrag, { passive: true });
    document.addEventListener('touchend', stopDrag);
}

/* ==========================================================================
   Navigation & Playback Mode Handlers
   ========================================================================== */
function handleTrackEnded() {
    if (playMode === 'single-loop') {
        window.player.seek(0);
        playAudio();
    } else {
        handleNextTrack();
    }
}

function handleNextTrack() {
    if (playlist.length === 0) return;

    let nextIndex = currentTrackIndex;
    
    if (playMode === 'shuffle') {
        nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
        nextIndex = (currentTrackIndex + 1) % playlist.length;
    }
    
    loadTrack(nextIndex, true);
}

function handlePrevTrack() {
    if (playlist.length === 0) return;

    let prevIndex = currentTrackIndex;
    
    if (playMode === 'shuffle') {
        prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
        prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    }
    
    loadTrack(prevIndex, true);
}

function updatePlayModeUI() {
    // Reset active styling
    btnShuffle.classList.remove('active');
    btnRepeat.classList.remove('active');
    repeatBadge.classList.add('hidden');

    if (playMode === 'shuffle') {
        btnShuffle.classList.add('active');
    } else if (playMode === 'single-loop') {
        btnRepeat.classList.add('active');
        repeatBadge.classList.remove('hidden');
    } else if (playMode === 'list-loop') {
        btnRepeat.classList.add('active');
    }
}

/* ==========================================================================
   Helper Utilities
   ========================================================================== */
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

/* ==========================================================================
   PWA & Keyboard Shortcuts Registrations
   ========================================================================== */
function registerServiceWorker() {
    const isNative = !!(window.Capacitor || window.__TAURI__ || window.ohosNative || navigator.userAgent.includes('Electron'));
    if (!isNative && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('PWA Service Worker registration successful. Scope:', reg.scope))
                .catch(err => console.warn('PWA Service Worker registration failed:', err));
        });
    }
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Bypass shortcuts if the user is typing inside input boxes
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (playlist.length === 0) return;
                if (isPlaying) {
                    pauseAudio();
                } else {
                    playAudio();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (playlist.length === 0) return;
                const durationRight = window.player.getDuration() || 0;
                const timeRight = window.player.getCurrentTime() || 0;
                window.player.seek(Math.min(durationRight, timeRight + 5));
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (playlist.length === 0) return;
                const timeLeft = window.player.getCurrentTime() || 0;
                window.player.seek(Math.max(0, timeLeft - 5));
                break;
            case 'ArrowUp':
                e.preventDefault();
                const volUp = Math.min(1, window.player.getVolume() + 0.05);
                window.player.setVolume(volUp);
                volumeSlider.style.width = `${volUp * 100}%`;
                localStorage.setItem('om-volume', volUp);
                if (isMuted && volUp > 0) {
                    isMuted = false;
                    volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                const volDown = Math.max(0, window.player.getVolume() - 0.05);
                window.player.setVolume(volDown);
                volumeSlider.style.width = `${volDown * 100}%`;
                localStorage.setItem('om-volume', volDown);
                break;
            case 'KeyM':
                toggleMute();
                break;
            case 'KeyL':
                // Toggle loop mode
                if (playMode === 'list-loop') {
                    playMode = 'single-loop';
                } else if (playMode === 'single-loop') {
                    playMode = 'list-loop';
                }
                localStorage.setItem('om-playmode', playMode);
                updatePlayModeUI();
                break;
            case 'KeyS':
                // Toggle shuffle mode
                if (playMode === 'shuffle') {
                    playMode = 'list-loop';
                } else {
                    playMode = 'shuffle';
                }
                localStorage.setItem('om-playmode', playMode);
                updatePlayModeUI();
                break;
        }
    });
}

function parsePlaylistId(input) {
    input = input.trim();
    // 1. Matches id=xxxx query parameter from sharing links
    const urlMatch = input.match(/[?&]id=(\d+)/);
    if (urlMatch) {
        return urlMatch[1];
    }
    // 2. Matches raw numeric strings
    const pureNumberMatch = input.match(/^\d+$/);
    if (pureNumberMatch) {
        return input;
    }
    return null;
}

function showCustomAlert(message) {
    const alertModal = document.getElementById('alert-modal');
    const alertMessage = document.getElementById('alert-message');
    if (alertModal && alertMessage) {
        alertMessage.innerHTML = message.replace(/\n/g, '<br>');
        alertModal.classList.remove('hidden');
    }
}

function getRandomPlaylistErrorMessage() {
    const messages = [
        '哦哦，你的歌单也太小众了吧~',
        '哦哦，你的歌单走丢了~'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

// Expose global player controls for native shells
window.player = {
    play: playAudio,
    pause: pauseAudio,
    next: handleNextTrack,
    prev: handlePrevTrack
};
