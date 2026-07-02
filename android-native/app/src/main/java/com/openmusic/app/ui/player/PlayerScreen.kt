package com.openmusic.app.ui.player

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.openmusic.app.R
import com.openmusic.app.data.Track
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.theme.*
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlayerScreen(
    viewModel: MainViewModel,
    onSearchClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val track = viewModel.playlist.getOrNull(viewModel.currentTrackIndex)
    var showLyrics by remember { mutableStateOf(false) }
    var showPlaylistDrawer by remember { mutableStateOf(false) }

    Box(modifier = modifier.fillMaxSize().background(RichBlack)) {
        // 1. Ambient High-Blur Artwork Background
        if (track != null && track.cover.isNotEmpty()) {
            AsyncImage(
                model = track.cover,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
                    .blur(50.dp)
            )
        }
        
        // Gradient overlay for ambient dark lighting
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Black.copy(alpha = 0.5f),
                            RichBlack.copy(alpha = 0.85f),
                            RichBlack
                        )
                    )
                )
        )

        // 2. Main Content Layout
        Column(
            modifier = Modifier
                .fillMaxSize()
                .systemBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onSearchClick) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = TextMain
                    )
                }
                
                Text(
                    text = "正在播放",
                    color = TextMuted,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )

                IconButton(onClick = { showLyrics = !showLyrics }) {
                    Icon(
                        imageVector = if (showLyrics) Icons.Default.List else Icons.Default.PlayArrow,
                        contentDescription = "Toggle Lyrics",
                        tint = if (showLyrics) NeonMint else TextMain
                    )
                }
            }

            Spacer(modifier = Modifier.weight(0.1f))

            // Body Content (Toggle between Vinyl and Lyrics)
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                if (showLyrics) {
                    LyricsPanel(viewModel = viewModel)
                } else {
                    VinylDisc(
                        coverUrl = track?.cover ?: "",
                        isPlaying = viewModel.isPlaying
                    )
                }
            }

            Spacer(modifier = Modifier.weight(0.1f))

            // Track details (Title & Artist)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = track?.title ?: "未在播放",
                    color = TextMain,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = track?.artist ?: "未知歌手",
                    color = TextMuted,
                    fontSize = 16.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Seekbar and Time markers
            PlaybackControls(
                viewModel = viewModel,
                onPlaylistClick = { showPlaylistDrawer = true }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Playlist Bottom Sheet Drawer
        if (showPlaylistDrawer) {
            ModalBottomSheet(
                onDismissRequest = { showPlaylistDrawer = false },
                containerColor = TranslucentCard,
                dragHandle = { BottomSheetDefaults.DragHandle(color = TextInactive) }
            ) {
                PlaylistDrawerContent(
                    viewModel = viewModel,
                    onTrackSelected = {
                        showPlaylistDrawer = false
                    }
                )
            }
        }
    }
}

@Composable
fun VinylDisc(
    coverUrl: String,
    isPlaying: Boolean,
    modifier: Modifier = Modifier
) {
    var rotationAngle by remember { mutableStateOf(0f) }

    // Smoothly rotates the vinyl disc when playing, freezes exactly where it is when paused
    LaunchedEffect(isPlaying) {
        while (isPlaying) {
            delay(16)
            rotationAngle = (rotationAngle + 0.4f) % 360f
        }
    }

    Box(
        modifier = modifier
            .size(280.dp)
            .rotate(rotationAngle)
            .clip(CircleShape)
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        // Outer Vinyl groves (fake styling using layered circles)
        Box(
            modifier = Modifier
                .fillMaxSize(0.98f)
                .clip(CircleShape)
                .background(Brush.radialGradient(colors = listOf(Color(0xFF222222), Color.Black)))
        )
        
        // Inner album cover cropped in a circle
        if (coverUrl.isNotEmpty()) {
            AsyncImage(
                model = coverUrl,
                contentDescription = "Cover",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize(0.6f)
                    .clip(CircleShape)
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize(0.6f)
                    .clip(CircleShape)
                    .background(CharcoalGray),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = null,
                    tint = TextInactive,
                    modifier = Modifier.size(48.dp)
                )
            }
        }
        
        // Center spindle hole
        Box(
            modifier = Modifier
                .fillMaxSize(0.08f)
                .clip(CircleShape)
                .background(RichBlack)
        )
    }
}

@Composable
fun LyricsPanel(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    if (viewModel.lyrics.isEmpty()) {
        Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "♫ 暂无歌词 / 纯音乐",
                color = TextInactive,
                fontSize = 18.sp,
                textAlign = TextAlign.Center
            )
        }
        return
    }

    val lazyListState = rememberLazyListState()
    
    // Pixel-perfect auto-scrolling centering mathematics using BoxWithConstraints
    BoxWithConstraints(modifier = modifier.fillMaxSize()) {
        val viewportHeightPx = with(LocalDensity.current) { maxHeight.toPx().toInt() }
        val centerOffset = -viewportHeightPx / 2

        LaunchedEffect(viewModel.currentLyricIndex) {
            if (viewModel.currentLyricIndex in viewModel.lyrics.indices) {
                // Instantly smooth scrolls the active line to the exact center
                lazyListState.animateScrollToItem(
                    index = viewModel.currentLyricIndex,
                    scrollOffset = centerOffset + 120
                )
            }
        }

        LazyColumn(
            state = lazyListState,
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(top = maxHeight / 2, bottom = maxHeight / 2),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            itemsIndexed(viewModel.lyrics) { index, line ->
                val isActive = index == viewModel.currentLyricIndex
                val textColor = if (isActive) TextMain else TextInactive
                val scale = if (isActive) 1.08f else 1.0f
                val fontWeight = if (isActive) FontWeight.Bold else FontWeight.Medium
                
                Text(
                    text = line.text,
                    color = textColor,
                    fontSize = if (isActive) 19.sp else 16.sp,
                    fontWeight = fontWeight,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                        .clickable {
                            // Tap on a line to seek directly to that time
                            viewModel.seekTo((line.time * 1000).toLong())
                        }
                )
            }
        }
    }
}

@Composable
fun PlaybackControls(
    viewModel: MainViewModel,
    onPlaylistClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val position = viewModel.currentPosition
    val duration = viewModel.duration
    val progress = if (duration > 0) position.toFloat() / duration else 0f

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Timeline slider
        Slider(
            value = progress,
            onValueChange = { newProgress ->
                viewModel.seekTo((newProgress * duration).toLong())
            },
            colors = SliderDefaults.colors(
                thumbColor = NeonMint,
                activeTrackColor = NeonMint,
                inactiveTrackColor = TextInactive.copy(alpha = 0.5f)
            ),
            modifier = Modifier.fillMaxWidth()
        )
        
        // Time labels
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = formatTime(position),
                color = TextMuted,
                fontSize = 12.sp
            )
            Text(
                text = formatTime(duration),
                color = TextMuted,
                fontSize = 12.sp
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Audio controller buttons row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = {}) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Shuffle",
                    tint = TextInactive
                )
            }

            IconButton(onClick = { viewModel.prevTrack() }) {
                Icon(
                    imageVector = Icons.Default.PlayArrow, // Replace with Prev icon later
                    contentDescription = "Previous",
                    tint = TextMain,
                    modifier = Modifier.size(36.dp).rotate(180f)
                )
            }

            // Big Play/Pause Button
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(NeonMint)
                    .clickable { viewModel.togglePlayPause() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (viewModel.isPlaying) Icons.Default.Close else Icons.Default.PlayArrow,
                    contentDescription = "Play/Pause",
                    tint = RichBlack,
                    modifier = Modifier.size(32.dp)
                )
            }

            IconButton(onClick = { viewModel.nextTrack() }) {
                Icon(
                    imageVector = Icons.Default.PlayArrow, // Replace with Next icon
                    contentDescription = "Next",
                    tint = TextMain,
                    modifier = Modifier.size(36.dp)
                )
            }

            IconButton(onClick = onPlaylistClick) {
                Icon(
                    imageVector = Icons.Default.Menu,
                    contentDescription = "Queue list",
                    tint = TextMuted
                )
            }
        }
    }
}

@Composable
fun PlaylistDrawerContent(
    viewModel: MainViewModel,
    onTrackSelected: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxHeight(0.6f)
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = "播放队列 (${viewModel.playlist.size} 首)",
            color = TextMain,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            itemsIndexed(viewModel.playlist) { index, track ->
                val isActive = index == viewModel.currentTrackIndex
                
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isActive) SoftMint else Color.Transparent)
                        .clickable {
                            viewModel.selectTrack(index)
                            onTrackSelected()
                        }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = track.title,
                            color = if (isActive) NeonMint else TextMain,
                            fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = track.artist,
                            color = TextMuted,
                            fontSize = 12.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                    if (isActive) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Playing",
                            tint = NeonMint
                        )
                    }
                }
            }
        }
    }
}

private fun formatTime(ms: Long): String {
    val totalSec = ms / 1000
    val min = totalSec / 60
    val sec = totalSec % 60
    return String.format("%02d:%02d", min, sec)
}
