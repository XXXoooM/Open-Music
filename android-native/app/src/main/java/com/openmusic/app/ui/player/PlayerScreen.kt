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
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import kotlinx.coroutines.launch
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.PlayMode
import com.openmusic.app.ui.components.LiquidBackdrop
import com.openmusic.app.ui.theme.HslColorPalette

@OptIn(ExperimentalMaterial3Api::class, androidx.compose.foundation.ExperimentalFoundationApi::class)
@Composable
fun PlayerScreen(
    viewModel: MainViewModel,
    palette: HslColorPalette,
    onMinimize: () -> Unit,
    modifier: Modifier = Modifier
) {
    val track = viewModel.playlist.getOrNull(viewModel.currentTrackIndex)
    val showPlaylistDrawer = remember { mutableStateOf(false) }
    val pagerState = rememberPagerState(pageCount = { 2 })
    val coroutineScope = rememberCoroutineScope()

    Box(modifier = modifier.fillMaxSize().background(palette.background)) {
        // 1. Dynamic HSL Liquid Backdrop
        LiquidBackdrop(
            primaryColor = palette.primary,
            secondaryColor = palette.softAccent,
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
                            palette.background.copy(alpha = 0.75f),
                            palette.background
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
            // Header Row (Minimize button on left, Lyrics toggle on right)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onMinimize,
                    modifier = Modifier.background(Color.Black.copy(0.2f), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Minimize Player",
                        tint = palette.textMain
                    )
                }

                val isLyricsActive = pagerState.currentPage == 1
                IconButton(
                    onClick = {
                        coroutineScope.launch {
                            pagerState.animateScrollToPage(if (isLyricsActive) 0 else 1)
                        }
                    },
                    modifier = Modifier.background(
                        if (isLyricsActive) palette.primary else Color.Black.copy(0.2f),
                        CircleShape
                    )
                ) {
                    Icon(
                        imageVector = if (isLyricsActive) Icons.Default.List else Icons.Default.PlayArrow,
                        contentDescription = "Toggle Lyrics",
                        tint = if (isLyricsActive) palette.background else palette.textMain
                    )
                }
            }

            // Swipeable Container for Album Art and Scrolling Lyrics
            HorizontalPager(
                state = pagerState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) { page ->
                if (page == 0) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        FloatingAlbumArt(
                            coverUrl = track?.cover ?: "",
                            isPlaying = viewModel.isPlaying,
                            palette = palette
                        )
                    }
                } else {
                    LyricsPanel(
                        viewModel = viewModel,
                        palette = palette,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }

            // Simple Page Indicator Dots
            Row(
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.padding(vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(if (pagerState.currentPage == 0) palette.primary else palette.textInactive.copy(alpha = 0.4f))
                )
                Spacer(modifier = Modifier.width(8.dp))
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(if (pagerState.currentPage == 1) palette.primary else palette.textInactive.copy(alpha = 0.4f))
                )
            }

            // Frosted Controls Panel Card (Completely Static and Consistent)
            Card(
                colors = CardDefaults.cardColors(containerColor = palette.surface.copy(alpha = 0.45f)),
                shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight()
                    .border(1.dp, palette.textInactive.copy(alpha = 0.08f), RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Track title & Artist
                    Text(
                        text = track?.title ?: "未在播放",
                        color = palette.textMain,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = track?.artist ?: "未知歌手",
                        color = palette.textMuted,
                        fontSize = 15.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    PlaybackControls(
                        viewModel = viewModel,
                        palette = palette,
                        onPlaylistClick = { showPlaylistDrawer.value = true }
                    )
                }
            }
        }

        // Playlist queue bottom sheet
        if (showPlaylistDrawer.value) {
            ModalBottomSheet(
                onDismissRequest = { showPlaylistDrawer.value = false },
                containerColor = palette.background,
                dragHandle = { BottomSheetDefaults.DragHandle(color = palette.textInactive) }
            ) {
                PlaylistDrawerContent(
                    viewModel = viewModel,
                    palette = palette,
                    onTrackSelected = {
                        showPlaylistDrawer.value = false
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
    palette: HslColorPalette,
    modifier: Modifier = Modifier
) {
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
        colors = CardDefaults.cardColors(containerColor = palette.surface)
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
                    tint = palette.textInactive,
                    modifier = Modifier.size(64.dp)
                )
            }
        }
    }
}

/**
 * Completely reconstructed Lyrics Page with individual line scaling,
 * fade animations, glowing text brushes, and auto-scrolling browse locks.
 */
@Composable
fun LyricsPanel(
    viewModel: MainViewModel,
    palette: HslColorPalette,
    modifier: Modifier = Modifier
) {
    if (viewModel.lyrics.isEmpty()) {
        Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "♫ 暂无歌词 / 纯音乐",
                color = palette.textInactive,
                fontSize = 18.sp,
                textAlign = TextAlign.Center
            )
        }
        return
    }

    val lazyListState = rememberLazyListState()
    var lastUserInteractionTime by remember { mutableStateOf(0L) }

    // Lock auto-scroll when user drags
    LaunchedEffect(lazyListState.isScrollInProgress) {
        if (lazyListState.isScrollInProgress) {
            lastUserInteractionTime = System.currentTimeMillis()
        }
    }

    Box(modifier = modifier.fillMaxSize()) {
        BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
            val density = LocalDensity.current
            val itemHeightPx = remember(density) { with(density) { 48.dp.toPx().toInt() } }
            val viewportHeightPx = remember(density, maxHeight) { with(density) { maxHeight.toPx().toInt() } }

            // Smart spring scroll center alignment (using mathematically positive offsets to center target item)
            LaunchedEffect(viewModel.currentLyricIndex) {
                val currentTime = System.currentTimeMillis()
                if (currentTime - lastUserInteractionTime > 3500) {
                    if (viewModel.currentLyricIndex in viewModel.lyrics.indices) {
                        val targetY = viewportHeightPx / 2 - itemHeightPx / 2
                        
                        val k = targetY / itemHeightPx
                        val firstVisibleIndex = (viewModel.currentLyricIndex - k - 1).coerceAtLeast(0)
                        val scrollOffset = ((viewModel.currentLyricIndex - firstVisibleIndex) * itemHeightPx - targetY).coerceAtLeast(0)
                        
                        lazyListState.animateScrollToItem(
                            index = firstVisibleIndex,
                            scrollOffset = scrollOffset
                        )
                    }
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
                    
                    // Smooth, animated properties for individual lyrics
                    val lineScale by animateFloatAsState(
                        targetValue = if (isActive) 1.15f else 0.90f,
                        animationSpec = spring(stiffness = Spring.StiffnessLow),
                        label = "LyricScale"
                    )
                    val lineAlpha by animateFloatAsState(
                        targetValue = if (isActive) 1.0f else 0.22f,
                        animationSpec = tween(500),
                        label = "LyricAlpha"
                    )
                    val lineOffsetY by animateFloatAsState(
                        targetValue = if (isActive) 0f else 4f,
                        animationSpec = spring(stiffness = Spring.StiffnessLow),
                        label = "LyricOffsetY"
                    )

                    val fontSize = if (isActive) 25.sp else 18.sp
                    val fontWeight = if (isActive) FontWeight.ExtraBold else FontWeight.Medium
                    
                    // Glowing text gradient brush for the active line
                    val textStyle = if (isActive) {
                        TextStyle(
                            brush = Brush.horizontalGradient(
                                colors = listOf(palette.primary, palette.textMain)
                            )
                        )
                    } else {
                        TextStyle(color = palette.textMain.copy(alpha = lineAlpha))
                    }

                    Text(
                        text = line.text,
                        style = textStyle,
                        fontSize = fontSize,
                        fontWeight = fontWeight,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 32.dp)
                            .graphicsLayer {
                                scaleX = lineScale
                                scaleY = lineScale
                                translationY = lineOffsetY
                            }
                            .clickable {
                                viewModel.seekTo((line.time * 1000).toLong())
                                lastUserInteractionTime = 0L // Instantly center on click
                            }
                    )
                }
            }
        }

        // Top/Bottom mask gradients
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp)
                .align(Alignment.TopCenter)
                .background(Brush.verticalGradient(listOf(palette.background.copy(0.9f), Color.Transparent)))
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(100.dp)
                .align(Alignment.BottomCenter)
                .background(Brush.verticalGradient(listOf(Color.Transparent, palette.background.copy(0.95f))))
        )
    }
}

@Composable
fun PlaybackControls(
    viewModel: MainViewModel,
    palette: HslColorPalette,
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
        // Slim seek bar
        Slider(
            value = progress,
            onValueChange = { newProgress ->
                viewModel.seekTo((newProgress * duration).toLong())
            },
            colors = SliderDefaults.colors(
                thumbColor = palette.primary,
                activeTrackColor = palette.primary,
                inactiveTrackColor = palette.textInactive.copy(alpha = 0.2f)
            ),
            modifier = Modifier.fillMaxWidth()
        )
        
        // Time stamps
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = formatTime(position),
                color = palette.textMuted,
                fontSize = 12.sp
            )
            Text(
                text = formatTime(duration),
                color = palette.textMuted,
                fontSize = 12.sp
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Controller row (Glow dot removed, Play Mode button added)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // 1. Play Mode Switcher (List Loop, Shuffle, Single Loop)
            PlayModeButton(
                playMode = viewModel.playMode,
                color = palette.textInactive,
                onClick = { viewModel.cyclePlayMode() }
            )

            IconButton(onClick = { viewModel.prevTrack() }) {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = "Previous",
                    tint = palette.textMain,
                    modifier = Modifier.size(36.dp).rotate(180f)
                )
            }

            // 3. Central Play/Pause Action Button
            Box(
                modifier = Modifier
                    .size(68.dp)
                    .shadow(12.dp, CircleShape, clip = false)
                    .background(palette.primary, CircleShape)
                    .clickable { viewModel.togglePlayPause() },
                contentAlignment = Alignment.Center
            ) {
                if (viewModel.isPlaying) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.align(Alignment.Center)
                    ) {
                        Box(modifier = Modifier.size(width = 6.dp, height = 20.dp).background(palette.background, RoundedCornerShape(2.dp)))
                        Box(modifier = Modifier.size(width = 6.dp, height = 20.dp).background(palette.background, RoundedCornerShape(2.dp)))
                    }
                } else {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "Play",
                        tint = palette.background,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }

            IconButton(onClick = { viewModel.nextTrack() }) {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = "Next",
                    tint = palette.textMain,
                    modifier = Modifier.size(36.dp)
                )
            }

            // 5. Drawer Drawer Queue list
            IconButton(
                onClick = onPlaylistClick
            ) {
                Icon(
                    imageVector = Icons.Default.List,
                    contentDescription = "Playlist",
                    tint = palette.textMuted
                )
            }
        }
    }
}

/**
 * Custom vector button drawing for play modes
 */
@Composable
fun PlayModeButton(
    playMode: PlayMode,
    color: Color,
    onClick: () -> Unit
) {
    IconButton(onClick = onClick) {
        when (playMode) {
            PlayMode.LIST_LOOP -> {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "List Loop",
                    tint = color
                )
            }
            PlayMode.SINGLE_LOOP -> {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Single Loop",
                        tint = color
                    )
                    Text(
                        text = "1",
                        color = color,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.offset(y = (-0.5).dp)
                    )
                }
            }
            PlayMode.SHUFFLE -> {
                // Vector drawn crossed-arrow Shuffle Icon
                androidx.compose.foundation.Canvas(modifier = Modifier.size(20.dp)) {
                    val w = size.width
                    val h = size.height
                    val stroke = 2.dp.toPx()
                    
                    // Crossed Line 1
                    drawLine(color, Offset(0f, 0f), Offset(w, h), stroke)
                    // Crossed Line 2
                    drawLine(color, Offset(0f, h), Offset(w, 0f), stroke)
                    
                    // Arrow Head 1 (bottom right)
                    drawLine(color, Offset(w - 5.dp.toPx(), h), Offset(w, h), stroke)
                    drawLine(color, Offset(w, h - 5.dp.toPx()), Offset(w, h), stroke)

                    // Arrow Head 2 (top right)
                    drawLine(color, Offset(w - 5.dp.toPx(), 0f), Offset(w, 0f), stroke)
                    drawLine(color, Offset(w, 5.dp.toPx()), Offset(w, 0f), stroke)
                }
            }
        }
    }
}

@Composable
fun PlaylistDrawerContent(
    viewModel: MainViewModel,
    palette: HslColorPalette,
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
            text = "播放队列 (${viewModel.playlist.size} 首)",
            color = palette.textMain,
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
                        .background(if (isActive) palette.softAccent.copy(alpha = 0.35f) else Color.Transparent)
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
                            color = if (isActive) palette.primary else palette.textMain,
                            fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = track.artist,
                            color = if (isActive) palette.primary.copy(alpha = 0.7f) else palette.textMuted,
                            fontSize = 12.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                    if (isActive) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Playing",
                            tint = palette.primary
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
