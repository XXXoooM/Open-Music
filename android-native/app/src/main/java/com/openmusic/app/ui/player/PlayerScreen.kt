package com.openmusic.app.ui.player

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
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
        // 1. Ambient Dynamic Blur Background
        if (track != null && track.cover.isNotEmpty()) {
            AsyncImage(
                model = track.cover,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
                    .blur(60.dp)
            )
        }
        
        // Evolving dark ambient wash overlay
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Black.copy(alpha = 0.55f),
                            RichBlack.copy(alpha = 0.85f),
                            RichBlack
                        )
                    )
                )
        )

        // 2. Layout Structure
        Column(
            modifier = Modifier
                .fillMaxSize()
                .systemBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header actions row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onSearchClick,
                    modifier = Modifier.background(Color.Black.copy(0.2f), CircleShape)
                ) {
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
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp
                )

                IconButton(
                    onClick = { showLyrics = !showLyrics },
                    modifier = Modifier.background(
                        if (showLyrics) SoftMint else Color.Black.copy(0.2f),
                        CircleShape
                    )
                ) {
                    Icon(
                        imageVector = if (showLyrics) Icons.Default.List else Icons.Default.PlayArrow,
                        contentDescription = "Toggle Lyrics",
                        tint = if (showLyrics) NeonMint else TextMain
                    )
                }
            }

            Spacer(modifier = Modifier.weight(0.1f))

            // Central view port (Vinyl record or Lyrics sheet)
            Box(
                modifier = Modifier
                    .weight(1.1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                if (showLyrics) {
                    LyricsPanel(viewModel = viewModel)
                } else {
                    VinylDiscContainer(
                        coverUrl = track?.cover ?: "",
                        isPlaying = viewModel.isPlaying
                    )
                }
            }

            Spacer(modifier = Modifier.weight(0.1f))

            // Frosted-Glass Controls Panel Card at bottom
            Card(
                colors = CardDefaults.cardColors(containerColor = TranslucentCard),
                shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Track Title & Artist Info
                    Text(
                        text = track?.title ?: "未在播放",
                        color = TextMain,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = track?.artist ?: "未知歌手",
                        color = TextMuted,
                        fontSize = 15.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(28.dp))

                    // Player Progress Timeline and Actions
                    PlaybackControls(
                        viewModel = viewModel,
                        onPlaylistClick = { showPlaylistDrawer = true }
                    )
                }
            }
        }

        // Playlist Bottom Sheet Drawer
        if (showPlaylistDrawer) {
            ModalBottomSheet(
                onDismissRequest = { showPlaylistDrawer = false },
                containerColor = TranslucentBackground,
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
fun VinylDiscContainer(
    coverUrl: String,
    isPlaying: Boolean,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(320.dp),
        contentAlignment = Alignment.Center
    ) {
        // 1. Vinyl Record
        VinylDisc(
            coverUrl = coverUrl,
            isPlaying = isPlaying,
            modifier = Modifier.align(Alignment.Center)
        )

        // 2. Pivot Stylus Needle placed at top right
        PlaybackNeedle(
            isPlaying = isPlaying,
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(x = 100.dp, y = (-20).dp)
        )
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
            rotationAngle = (rotationAngle + 0.35f) % 360f
        }
    }

    Box(
        modifier = modifier
            .size(270.dp)
            .rotate(rotationAngle)
            .clip(CircleShape)
            .background(Color(0xFF0F0F0F))
            .border(4.dp, Color.Black.copy(0.3f), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        // Outer Vinyl groves (concentric circle shadows)
        Box(
            modifier = Modifier
                .fillMaxSize(0.97f)
                .clip(CircleShape)
                .background(Brush.radialGradient(colors = listOf(Color(0xFF262626), Color.Black)))
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
fun PlaybackNeedle(
    isPlaying: Boolean,
    modifier: Modifier = Modifier
) {
    // Spring physics rotation animation (swings onto the vinyl when playing, away when paused)
    val needleAngle by animateFloatAsState(
        targetValue = if (isPlaying) 14f else -14f,
        animationSpec = spring(
            dampingRatio = 0.8f,
            stiffness = 120f
        ),
        label = "NeedleAngle"
    )

    Box(
        modifier = modifier
            .width(100.dp)
            .height(160.dp),
        contentAlignment = Alignment.TopCenter
    ) {
        // Rotating stylus arm
        Box(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    rotationZ = needleAngle
                    transformOrigin = androidx.compose.ui.graphics.TransformOrigin(0.5f, 0.15f)
                }
        ) {
            // Metallic silver arm shaft
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .fillMaxHeight(0.7f)
                    .align(Alignment.TopCenter)
                    .offset(y = 12.dp)
                    .background(
                        Brush.verticalGradient(listOf(Color.White, Color.Gray)),
                        RoundedCornerShape(2.dp)
                    )
            )
            // Stylus head cartridge
            Box(
                modifier = Modifier
                    .size(width = 14.dp, height = 24.dp)
                    .align(Alignment.BottomCenter)
                    .offset(y = (-20).dp)
                    .background(Color(0xFF282C34), RoundedCornerShape(4.dp))
                    .border(1.dp, Color.Gray, RoundedCornerShape(4.dp))
            )
        }

        // Pivot base cap (Golden accent)
        Box(
            modifier = Modifier
                .size(28.dp)
                .background(
                    Brush.radialGradient(listOf(Color(0xFFFFD700), Color(0xFFC5A000))),
                    CircleShape
                )
                .border(2.dp, Color.Black.copy(0.4f), CircleShape)
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
    Box(modifier = modifier.fillMaxSize()) {
        BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
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
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                itemsIndexed(viewModel.lyrics) { index, line ->
                    val isActive = index == viewModel.currentLyricIndex
                    val textColor = if (isActive) TextMain else TextInactive
                    val fontWeight = if (isActive) FontWeight.Bold else FontWeight.Medium
                    
                    Text(
                        text = line.text,
                        color = textColor,
                        fontSize = if (isActive) 19.sp else 16.sp,
                        fontWeight = fontWeight,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 28.dp)
                            .clickable {
                                viewModel.seekTo((line.time * 1000).toLong())
                            }
                    )
                }
            }
        }

        // Ambient top and bottom high-blur gradients to fade lyrics boundaries beautifully
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp)
                .align(Alignment.TopCenter)
                .background(Brush.verticalGradient(listOf(RichBlack.copy(0.9f), Color.Transparent)))
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp)
                .align(Alignment.BottomCenter)
                .background(Brush.verticalGradient(listOf(Color.Transparent, RichBlack.copy(0.9f))))
        )
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
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Timeline progress bar
        Slider(
            value = progress,
            onValueChange = { newProgress ->
                viewModel.seekTo((newProgress * duration).toLong())
            },
            colors = SliderDefaults.colors(
                thumbColor = NeonMint,
                activeTrackColor = NeonMint,
                inactiveTrackColor = TextInactive.copy(alpha = 0.3f)
            ),
            modifier = Modifier.fillMaxWidth()
        )
        
        // Time labels
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
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

        Spacer(modifier = Modifier.height(24.dp))

        // Controller buttons row
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
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = "Previous",
                    tint = TextMain,
                    modifier = Modifier.size(36.dp).rotate(180f)
                )
            }

            // Custom Vector Play/Pause Action Button
            Box(
                modifier = Modifier
                    .size(68.dp)
                    .clip(CircleShape)
                    .background(NeonMint)
                    .clickable { viewModel.togglePlayPause() }
                    .border(2.dp, Color.White.copy(0.15f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                if (viewModel.isPlaying) {
                    // Custom drawn twin bars for premium Pause representation
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.align(Alignment.Center)
                    ) {
                        Box(modifier = Modifier.size(width = 6.dp, height = 22.dp).background(RichBlack, RoundedCornerShape(2.dp)))
                        Box(modifier = Modifier.size(width = 6.dp, height = 22.dp).background(RichBlack, RoundedCornerShape(2.dp)))
                    }
                } else {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "Play",
                        tint = RichBlack,
                        modifier = Modifier.size(38.dp)
                    )
                }
            }

            IconButton(onClick = { viewModel.nextTrack() }) {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
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
            .padding(20.dp)
    ) {
        Text(
            text = "当前播放队列 (${viewModel.playlist.size} 首)",
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
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isActive) SoftMint else Color.Transparent)
                        .clickable {
                            viewModel.selectTrack(index)
                            onTrackSelected()
                        }
                        .padding(horizontal = 16.dp, vertical = 14.dp),
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
                        Spacer(modifier = Modifier.height(2.dp))
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
