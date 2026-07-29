package com.openmusic.app.ui

import android.content.ComponentName
import android.content.Context
import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.ListenableFuture
import com.openmusic.app.audio.EqualizerManager
import com.openmusic.app.audio.PlaybackService
import com.openmusic.app.data.LyricLine
import com.openmusic.app.data.LyricParser
import com.openmusic.app.data.MetingRepository
import com.openmusic.app.data.SettingsManager
import com.openmusic.app.data.Track
import com.openmusic.app.data.CollectedPlaylist
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

enum class PlayMode {
    LIST_LOOP,
    SHUFFLE,
    SINGLE_LOOP
}

data class ImportedPlaylistInfo(
    val id: String,
    val firstTrackCover: String
)

class MainViewModel : ViewModel() {

    private val repository = MetingRepository()
    private val updateRepository = com.openmusic.app.data.UpdateRepository()
    private var settingsManager: SettingsManager? = null

    // Controller future reference
    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var controller: MediaController? = null

    // Update System States
    var updateInfo by mutableStateOf<com.openmusic.app.data.UpdateInfo?>(null)
        private set
    var downloadState by mutableStateOf<com.openmusic.app.data.DownloadState>(com.openmusic.app.data.DownloadState.Idle)
        private set
    var showUpdateDialog by mutableStateOf(false)
        private set
    var isCheckingUpdate by mutableStateOf(false)
        private set

    // UI States
    var collectedPlaylists by mutableStateOf<List<CollectedPlaylist>>(emptyList())
        private set

    var lastImportedPlaylistInfo by mutableStateOf<ImportedPlaylistInfo?>(null)

    var playMode by mutableStateOf(PlayMode.LIST_LOOP)
        private set

    var playlist by mutableStateOf<List<Track>>(emptyList())
        private set

    var currentTrackIndex by mutableStateOf(-1)
        private set

    var isPlaying by mutableStateOf(false)
        private set

    var currentPosition by mutableLongStateOf(0L)
        private set

    var duration by mutableLongStateOf(0L)
        private set

    var lyrics by mutableStateOf<List<LyricLine>>(emptyList())
        private set

    var currentLyricIndex by mutableStateOf(-1)
        private set

    var isLoading by mutableStateOf(false)
        private set

    var isSearching by mutableStateOf(false)
        private set

    var selectedRoute by mutableStateOf(MetingRepository.ApiRoute.QIJIEYA)
        private set

    var playlistIdInput by mutableStateOf("")

    var isHslThemeEnabled by mutableStateOf(true)
        private set
    
    // Sleep Timer States
    var sleepTimerRemaining by mutableLongStateOf(-1L) // -1 = inactive; ≥0 = remaining ms
        private set
    var sleepAfterCurrentTrack by mutableStateOf(false)
        private set

    // Equalizer States
    var eqPreset by mutableStateOf(EqualizerManager.currentPreset)
        private set
    var eqBandLevels by mutableStateOf(EqualizerManager.bandLevels.clone())
        private set

    // Coroutine Jobs
    private var progressJob: Job? = null
    private var lyricsFetchJob: Job? = null
    private var sleepTimerJob: Job? = null

    fun initialize(context: Context) {
        if (settingsManager != null) return // Already initialized
        val manager = SettingsManager(context)
        settingsManager = manager

        viewModelScope.launch {
            // Restore saved settings
            selectedRoute = try {
                MetingRepository.ApiRoute.valueOf(manager.selectedRouteFlow.first())
            } catch (e: Exception) {
                MetingRepository.ApiRoute.QIJIEYA
            }
            playlistIdInput = manager.playlistIdFlow.first()
            playlist = manager.playlistFlow.first()
            currentTrackIndex = manager.currentTrackIndexFlow.first()
            isHslThemeEnabled = manager.hslThemeEnabledFlow.first()
            playMode = try {
                PlayMode.valueOf(manager.playModeFlow.first())
            } catch (e: Exception) {
                PlayMode.LIST_LOOP
            }
            collectedPlaylists = manager.collectedPlaylistsFlow.first()

            // Restore EQ settings and apply to hardware
            val savedPreset = manager.eqPresetFlow.first()
            val savedLevels = manager.eqBandLevelsFlow.first()
            if (savedPreset == "自定义") {
                savedLevels.forEachIndexed { band, level ->
                    EqualizerManager.setBandLevel(band, level)
                }
            } else {
                EqualizerManager.applyPreset(savedPreset)
            }
            eqPreset = EqualizerManager.currentPreset
            eqBandLevels = EqualizerManager.bandLevels.clone()

            if (playlist.isEmpty() && playlistIdInput.isNotEmpty()) {
                loadPlaylist(playlistIdInput)
            }

            // Initialize Media3 Controller
            val sessionToken = SessionToken(context, ComponentName(context, PlaybackService::class.java))
            controllerFuture = MediaController.Builder(context, sessionToken).buildAsync()
            controllerFuture?.addListener({
                controllerFuture?.let { future ->
                    if (future.isDone) {
                        try {
                            setupController(future.get())
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                }
            }, ContextCompat.getMainExecutor(context))
        }
    }

    private fun setupController(mediaController: MediaController) {
        controller = mediaController
        isPlaying = mediaController.isPlaying
        currentPosition = mediaController.currentPosition
        duration = mediaController.duration

        // Check if there is an active item already playing in service
        val currentMediaItem = mediaController.currentMediaItem
        if (currentMediaItem != null) {
            val playingUrl = currentMediaItem.mediaId
            val matchedIndex = playlist.indexOfFirst { it.url == playingUrl }
            if (matchedIndex != -1) {
                currentTrackIndex = matchedIndex
                loadLyricsForCurrentTrack()
            }
        } else if (playlist.isNotEmpty() && currentTrackIndex in playlist.indices) {
            // Sync current playlist items to MediaSession if empty
            syncPlaylistToController(playImmediately = false)
        }

        applyPlayModeToController()

        // Register Player listeners for automated sync
        mediaController.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(isPlayingChanged: Boolean) {
                isPlaying = isPlayingChanged
                if (isPlayingChanged) {
                    startProgressTracker()
                } else {
                    stopProgressTracker()
                }
            }

            override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                super.onMediaItemTransition(mediaItem, reason)
                val newIndex = mediaController.currentMediaItemIndex
                if (newIndex in playlist.indices) {
                    currentTrackIndex = newIndex
                    loadLyricsForCurrentTrack()
                    viewModelScope.launch {
                        settingsManager?.saveCurrentTrackIndex(newIndex)
                    }
                }
                // Sleep after current track: pause when the next track begins
                if (sleepAfterCurrentTrack) {
                    controller?.pause()
                    sleepAfterCurrentTrack = false
                }
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                duration = mediaController.duration
                if (playbackState == Player.STATE_ENDED) {
                    isPlaying = false
                }
            }
        })

        if (isPlaying) {
            startProgressTracker()
        }
    }

    fun loadPlaylist(playlistId: String) {
        isLoading = true
        isSearching = false
        viewModelScope.launch {
            try {
                val tracks = repository.fetchPlaylist(selectedRoute, playlistId)
                if (tracks.isNotEmpty()) {
                    playlist = tracks
                    currentTrackIndex = 0
                    
                    // Persist state
                    settingsManager?.savePlaylist(tracks)
                    settingsManager?.savePlaylistId(playlistId)
                    settingsManager?.saveCurrentTrackIndex(0)
                    
                    syncPlaylistToController(playImmediately = true)

                    // Trigger playlist collection prompt only if not already collected
                    if (collectedPlaylists.none { it.id == playlistId }) {
                        lastImportedPlaylistInfo = ImportedPlaylistInfo(
                            id = playlistId,
                            firstTrackCover = tracks.firstOrNull()?.cover ?: ""
                        )
                    } else {
                        lastImportedPlaylistInfo = null
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isLoading = false
            }
        }
    }

    fun collectPlaylist(id: String, name: String, cover: String) {
        val newPlaylist = CollectedPlaylist(id, name, cover)
        if (collectedPlaylists.none { it.id == id }) {
            val updated = collectedPlaylists + newPlaylist
            collectedPlaylists = updated
            viewModelScope.launch {
                settingsManager?.saveCollectedPlaylists(updated)
            }
        }
    }

    fun removeCollectedPlaylist(id: String) {
        val updated = collectedPlaylists.filterNot { it.id == id }
        collectedPlaylists = updated
        viewModelScope.launch {
            settingsManager?.saveCollectedPlaylists(updated)
        }
    }

    private fun syncPlaylistToController(playImmediately: Boolean) {
        val mediaController = controller ?: return
        val mediaItems = playlist.map { track ->
            MediaItem.Builder()
                .setUri(track.url)
                .setMediaId(track.url) // Use url as unique mediaId
                .setMediaMetadata(
                    MediaMetadata.Builder()
                        .setTitle(track.title)
                        .setArtist(track.artist)
                        .setArtworkUri(Uri.parse(track.cover))
                        .setAlbumTitle("Open Music")
                        .setMediaType(MediaMetadata.MEDIA_TYPE_MUSIC)
                        .build()
                )
                .build()
        }

        mediaController.setMediaItems(mediaItems, currentTrackIndex.coerceAtLeast(0), 0L)
        mediaController.prepare()
        applyPlayModeToController()
        if (playImmediately) {
            mediaController.play()
        }
    }

    fun selectTrack(index: Int) {
        val mediaController = controller ?: return
        if (index in playlist.indices) {
            mediaController.seekTo(index, 0L)
            mediaController.play()
        }
    }

    fun togglePlayPause() {
        val mediaController = controller ?: return
        if (mediaController.isPlaying) {
            mediaController.pause()
        } else {
            mediaController.play()
        }
    }

    fun cyclePlayMode() {
        val nextMode = when (playMode) {
            PlayMode.LIST_LOOP -> PlayMode.SHUFFLE
            PlayMode.SHUFFLE -> PlayMode.SINGLE_LOOP
            PlayMode.SINGLE_LOOP -> PlayMode.LIST_LOOP
        }
        playMode = nextMode
        applyPlayModeToController()
        viewModelScope.launch {
            settingsManager?.savePlayMode(nextMode.name)
        }
    }

    fun applyPlayModeToController() {
        val ctrl = controller ?: return
        when (playMode) {
            PlayMode.LIST_LOOP -> {
                ctrl.repeatMode = Player.REPEAT_MODE_ALL
                ctrl.shuffleModeEnabled = false
            }
            PlayMode.SHUFFLE -> {
                ctrl.repeatMode = Player.REPEAT_MODE_ALL
                ctrl.shuffleModeEnabled = true
            }
            PlayMode.SINGLE_LOOP -> {
                ctrl.repeatMode = Player.REPEAT_MODE_ONE
                ctrl.shuffleModeEnabled = false
            }
        }
    }

    fun nextTrack() {
        val mediaController = controller ?: return
        if (mediaController.hasNextMediaItem()) {
            mediaController.seekToNext()
        } else {
            // Loop back to beginning
            mediaController.seekToDefaultPosition(0)
        }
        mediaController.play()
    }

    fun prevTrack() {
        val mediaController = controller ?: return
        if (mediaController.hasPreviousMediaItem()) {
            mediaController.seekToPrevious()
        } else {
            // Loop to end
            mediaController.seekToDefaultPosition(playlist.size - 1)
        }
        mediaController.play()
    }

    fun seekTo(positionMs: Long) {
        controller?.seekTo(positionMs)
        currentPosition = positionMs
        updateLyricIndex()
    }

    fun selectRoute(route: MetingRepository.ApiRoute) {
        selectedRoute = route
        viewModelScope.launch {
            settingsManager?.saveSelectedRoute(route.name)
        }
    }

    fun toggleHslTheme(enabled: Boolean) {
        isHslThemeEnabled = enabled
        viewModelScope.launch {
            settingsManager?.saveHslThemeEnabled(enabled)
        }
    }

    private fun startProgressTracker() {
        progressJob?.cancel()
        progressJob = viewModelScope.launch {
            while (isPlaying) {
                controller?.let {
                    currentPosition = it.currentPosition
                    duration = it.duration
                    updateLyricIndex()
                }
                delay(200) // High frequency 200ms updates for precise lyric synchronization
            }
        }
    }

    private fun stopProgressTracker() {
        progressJob?.cancel()
        progressJob = null
    }

    private fun updateLyricIndex() {
        if (lyrics.isEmpty()) {
            currentLyricIndex = -1
            return
        }
        // Both currentPosition and lyrics[i].time are now Long milliseconds — no conversion needed
        var matchedIndex = -1
        for (i in lyrics.indices) {
            if (currentPosition >= lyrics[i].time) {
                matchedIndex = i
            } else {
                break
            }
        }
        currentLyricIndex = matchedIndex
    }

    private fun loadLyricsForCurrentTrack() {
        lyricsFetchJob?.cancel()
        lyrics = emptyList()
        currentLyricIndex = -1
        
        val track = playlist.getOrNull(currentTrackIndex) ?: return
        val lrcUrl = track.lrc
        if (lrcUrl.isEmpty()) return

        lyricsFetchJob = viewModelScope.launch {
            try {
                val lrcText = fetchLyricText(lrcUrl)
                lyrics = LyricParser.parse(lrcText)
                updateLyricIndex()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private suspend fun fetchLyricText(url: String): String {
        return kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
            val client = OkHttpClient()
            val request = Request.Builder().url(url).build()
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) throw IOException("Unexpected code $response")
                response.body?.string() ?: ""
            }
        }
    }

    /**
     * Checks remote version manifest for new updates
     */
    fun checkForUpdates(context: Context, isManual: Boolean = false) {
        if (isCheckingUpdate) return
        isCheckingUpdate = true

        viewModelScope.launch {
            try {
                val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
                val currentVersionCode = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                    packageInfo.longVersionCode.toInt()
                } else {
                    @Suppress("DEPRECATION")
                    packageInfo.versionCode
                }

                val remoteInfo = updateRepository.checkUpdate()
                if (remoteInfo != null && remoteInfo.versionCode > currentVersionCode) {
                    updateInfo = remoteInfo
                    showUpdateDialog = true
                } else if (isManual) {
                    android.widget.Toast.makeText(context, "当前已是最新版本 (v${packageInfo.versionName})", android.widget.Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                if (isManual) {
                    android.widget.Toast.makeText(context, "检查更新失败，请检查网络", android.widget.Toast.LENGTH_SHORT).show()
                }
            } finally {
                isCheckingUpdate = false
            }
        }
    }

    /**
     * Starts background APK streaming download
     */
    fun startApkDownload(context: Context) {
        val info = updateInfo ?: return
        if (info.apkUrl.isBlank()) return

        viewModelScope.launch {
            updateRepository.downloadApk(context, info.apkUrl).collect { state ->
                downloadState = state
            }
        }
    }

    fun dismissUpdateDialog() {
        showUpdateDialog = false
    }

    // --- Equalizer ---

    /**
     * Applies a named EQ preset (e.g. "流行", "电子") to the hardware and persists the choice.
     */
    fun applyEqPreset(presetName: String) {
        EqualizerManager.applyPreset(presetName)
        eqPreset = EqualizerManager.currentPreset
        eqBandLevels = EqualizerManager.bandLevels.clone()
        viewModelScope.launch {
            settingsManager?.saveEqPreset(presetName)
            settingsManager?.saveEqBandLevels(EqualizerManager.bandLevels)
        }
    }

    /**
     * Sets a single EQ [band] level in milliBels and persists the change.
     * Automatically sets preset to "自定义".
     */
    fun setEqBandLevel(band: Int, levelMb: Int) {
        EqualizerManager.setBandLevel(band, levelMb)
        eqPreset = EqualizerManager.currentPreset
        eqBandLevels = EqualizerManager.bandLevels.clone()
        viewModelScope.launch {
            settingsManager?.saveEqPreset(EqualizerManager.currentPreset)
            settingsManager?.saveEqBandLevels(EqualizerManager.bandLevels)
        }
    }

    // --- Sleep Timer ---

    /**
     * Starts a countdown sleep timer. When the timer expires, playback is paused.
     * @param durationMs Duration in milliseconds until playback stops.
     */
    fun setSleepTimer(durationMs: Long) {
        cancelSleepTimer()
        sleepAfterCurrentTrack = false
        sleepTimerRemaining = durationMs
        sleepTimerJob = viewModelScope.launch {
            while (sleepTimerRemaining > 0) {
                delay(1000)
                sleepTimerRemaining = (sleepTimerRemaining - 1000L).coerceAtLeast(0L)
            }
            controller?.pause()
            sleepTimerRemaining = -1L
        }
    }

    /**
     * Schedules playback to stop after the currently playing track finishes.
     */
    fun setSleepAfterCurrentTrack() {
        cancelSleepTimer()
        sleepAfterCurrentTrack = true
    }

    /**
     * Cancels any active sleep timer or sleep-after-track schedule.
     */
    fun cancelSleepTimer() {
        sleepTimerJob?.cancel()
        sleepTimerJob = null
        sleepTimerRemaining = -1L
        sleepAfterCurrentTrack = false
    }

    override fun onCleared() {
        stopProgressTracker()
        lyricsFetchJob?.cancel()
        sleepTimerJob?.cancel()
        controllerFuture?.let {
            MediaController.releaseFuture(it)
        }
        super.onCleared()
    }
}
