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
import com.openmusic.app.audio.PlaybackService
import com.openmusic.app.data.LyricLine
import com.openmusic.app.data.LyricParser
import com.openmusic.app.data.MetingRepository
import com.openmusic.app.data.SettingsManager
import com.openmusic.app.data.Track
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

class MainViewModel : ViewModel() {

    private val repository = MetingRepository()
    private var settingsManager: SettingsManager? = null

    // Controller future reference
    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var controller: MediaController? = null

    // UI States
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
    
    // Coroutine Jobs
    private var progressJob: Job? = null
    private var lyricsFetchJob: Job? = null

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
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isLoading = false
            }
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
                        .build()
                )
                .build()
        }

        mediaController.setMediaItems(mediaItems, currentTrackIndex.coerceAtLeast(0), 0L)
        mediaController.prepare()
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
        val currentTimeSec = currentPosition / 1000f
        var matchedIndex = -1
        for (i in lyrics.indices) {
            if (currentTimeSec >= lyrics[i].time) {
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

    override fun onCleared() {
        stopProgressTracker()
        lyricsFetchJob?.cancel()
        controllerFuture?.let {
            MediaController.releaseFuture(it)
        }
        super.onCleared()
    }
}
