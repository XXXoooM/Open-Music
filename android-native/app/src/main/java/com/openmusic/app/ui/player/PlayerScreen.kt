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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
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
import com.openmusic.app.ui.components.LiquidBackdrop
import com.openmusic.app.ui.theme.*

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

    // Dynamically generate unique ambient colors based on the track name hash code
    val songHash = track?.title?.hashCode() ?: 0
    val primaryColor = remember(songHash) {
        val hues = listOf(NeonMint, Color(0xFF1E88E5), Color(0xFF8E24AA), Color(0xFFD81B60), Color(0xFF00ACC1))
        hues[Math.abs(songHash) % hues.size]
    }
    val secondaryColor = remember(songHash) {
        val hues = listOf(Color(0xFF00ACC1), Color(0xFF3949AB), Color(0xFF5E35B1), Color(0xFFE53935), Color(0xFFFFB300))
        hues[Math.abs(songHash + 1) % hues.size]
    }

    Box(modifier = modifier.fillMaxSize().background(RichBlack)) {
        // 1. Dynamic Liquid极光 Background
        LiquidBackdrop(
            primaryColor = primaryColor,
            secondaryColor = secondaryColor,
            modifier = Modifier.fillMaxSize()
        )
        
        // Deep overlay wash
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Black.copy(alpha = 0.35f),
                            RichBlack.copy(alpha = 0.75f),
                            RichBlack
                        )
                    )
                )
        )

        // 2. Main Page Layout
        Column(
            modifier = Modifier
                .fillMaxSize()
                .systemBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header Action Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onSearchClick,
                    modifier = Modifier.background(Color.Black.copy(0.25f), CircleShape)
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
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp
                )

                IconButton(
                    onClick = { showLyrics = !showLyrics },
                    modifier = Modifier.background(
                        if (showLyrics) SoftMint else Color.Black.copy(0.25f),
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

            // Center Viewport: Rounded Card or Depth Lyrics
            Box(
                modifier = Modifier
                    .weight(1.1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                if (showLyrics) {
                    LyricsPanel(viewModel = viewModel)
                } else {
                    FloatingAlbumArt(
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
                    // Track Title & Artist
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
fun FloatingAlbumArt(
    coverUrl: String,
    isPlaying: Boolean,
    modifier: Modifier = Modifier
) {
    // Smooth spring physics scaling
    val scale by animateFloatAsState(
        targetValue = if (isPlaying) 1.0f else 0.88f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "AlbumArtScale"
    )
    val cardShadowElevation by animateDpAsState(
        targetValue = if (isPlaying) 28.dp else 12.dp,
        animationSpec = tween(500),
        label = "CardShadow"
    )

    Card(
        shape = RoundedCornerShape(28.dp),
        modifier = modifier
            .size(260.dp)
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .shadow(
                elevation = cardShadowElevation,
                shape = RoundedCornerShape(28.dp),
                clip = false
            )
            .border(1.dp, Color.White.copy(0.12f), RoundedCornerShape(28.dp)),
        colors = CardDefaults.cardColors(containerColor = DeepCharcoal)
    ) {
        if (coverUrl.isNotEmpty()) {
            AsyncImage(
                model = coverUrl,
                contentDescription = "Cover",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        } else {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = null,
                    tint = TextInactive,
                    modifier = Modifier.size(64.dp)
                )
            }
        }
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
    
    // Smooth scrolling auto-alignment
    Box(modifier = modifier.fillMaxSize()) {
        BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
            val viewportHeightPx = with(LocalDensity.current) { maxHeight.toPx().toInt() }
            val centerOffset = -viewportHeightPx / 2

            LaunchedEffect(viewModel.currentLyricIndex) {
                if (viewModel.currentLyricIndex in viewModel.lyrics.indices) {
                    lazyListState.animateScrollToItem(
                        index = viewModel.currentLyricIndex,
                        scrollOffset = centerOffset + 100
                    )
                }
            }

            LazyColumn(
                state = lazyListState,
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(top = maxHeight / 2, bottom = maxHeight / 2),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(28.dp)
            ) {
                itemsIndexed(viewModel.lyrics) { index, line ->
                    val distance = Math.abs(index - viewModel.currentLyricIndex)
                    
                    // Focal-Depth computations for cinema rendering
                    val alpha = when (distance) {
                        0 -> 1.0f
                        1 -> 0.55f
                        2 -> 0.28f
                        else -> 0.12f
                    }
                    val scale = when (distance) {
                        0 -> 1.12f
                        1 -> 1.0f
                        2 -> 0.9f
                        else -> 0.82f
                    }
                    val fontSize = when (distance) {
                        0 -> 24.sp
                        1 -> 19.sp
                        2 -> 16.sp
                        else -> 14.sp
                    }
                    val fontWeight = if (distance == 0) FontWeight.Bold else FontWeight.Medium
                    val textColor = if (distance == 0) TextMain else TextInactive
                    
                    Text(
                        text = line.text,
                        color = textColor.copy(alpha = alpha),
                        fontSize = fontSize,
                        fontWeight = fontWeight,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 32.dp)
                            .graphicsLayer {
                                scaleX = scale
                                scaleY = scale
                            }
                            .clickable {
                                viewModel.seekTo((line.time * 1000).toLong())
                            }
                    )
                }
            }
        }

        // Fading gradients boundaries overlays
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
        // Slim, customized seek bar
        Slider(
            value = progress,
            onValueChange = { newProgress ->
                viewModel.seekTo((newProgress * duration).toLong())
            },
            colors = SliderDefaults.colors(
                thumbColor = NeonMint,
                activeTrackColor = NeonMint,
                inactiveTrackColor = Color.White.copy(alpha = 0.15f)
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

        // Actions Row
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

            // Glowing Play/Pause Circle Button
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(NeonMint, SoftMint)
                        )
                    )
                    .clickable { viewModel.togglePlayPause() }
                    .shadow(16.dp, CircleShape, clip = false),
                contentAlignment = Alignment.Center
            ) {
                if (viewModel.isPlaying) {
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
