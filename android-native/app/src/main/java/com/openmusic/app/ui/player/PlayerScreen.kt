package com.openmusic.app.ui.player

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.BottomSheetDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.components.FloatingAlbumArt
import com.openmusic.app.ui.components.LiquidBackdrop
import com.openmusic.app.ui.components.LyricsPanel
import com.openmusic.app.ui.components.PlaybackControls
import com.openmusic.app.ui.components.LyricsPlaybackControls
import com.openmusic.app.ui.components.PlaylistDrawerContent
import com.openmusic.app.ui.theme.ComponentStyles
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
        if (palette.isHslEnabled) {
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
        }

        // 2. Swappable Pages
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize()
        ) { page ->
            if (page == 0) {
                // Page 0: Standard Album Cover View
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
                            .padding(horizontal = 20.dp, vertical = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = onMinimize,
                            modifier = Modifier.background(ComponentStyles.translucentBgColor, ComponentStyles.iconButtonShape)
                        ) {
                            Icon(
                                imageVector = Icons.Default.KeyboardArrowDown,
                                contentDescription = "Minimize Player",
                                tint = palette.textMain
                            )
                        }

                        IconButton(
                            onClick = {
                                coroutineScope.launch {
                                    pagerState.animateScrollToPage(1)
                                }
                            },
                            modifier = Modifier.background(ComponentStyles.translucentBgColor, ComponentStyles.iconButtonShape)
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Toggle Lyrics",
                                tint = palette.textMain
                            )
                        }
                    }

                    // Album Cover area
                    Box(
                        modifier = Modifier
                            .weight(1.1f)
                            .fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        FloatingAlbumArt(
                            coverUrl = track?.cover ?: "",
                            isPlaying = viewModel.isPlaying,
                            palette = palette
                        )
                    }

                    // Page Indicator Dots (Dynamic based on pagerState.currentPage)
                    Row(
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier.padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val activeDotColor = palette.primary
                        val inactiveDotColor = palette.textInactive.copy(alpha = 0.4f)
                        
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(ComponentStyles.iconButtonShape)
                                .background(if (pagerState.currentPage == 0) activeDotColor else inactiveDotColor)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(ComponentStyles.iconButtonShape)
                                .background(if (pagerState.currentPage == 1) activeDotColor else inactiveDotColor)
                        )
                    }

                    // Controls Panel (Vibrant Title & Artist & Vibrant Controls)
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .wrapContentHeight()
                            .padding(start = 32.dp, end = 32.dp, bottom = 40.dp, top = 12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = track?.title ?: "未在播放",
                            color = palette.textMain,
                            fontSize = ComponentStyles.titleFontSize,
                            fontWeight = ComponentStyles.titleFontWeight,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = track?.artist ?: "未知歌手",
                            color = palette.textMuted,
                            fontSize = ComponentStyles.artistFontSize,
                            fontWeight = ComponentStyles.artistFontWeight,
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
            } else {
                // Page 1: Completely Independent Lyrics Screen (Image 2 style)
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .systemBarsPadding(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Let lyrics fill the entire screen space
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        LyricsPanel(
                            viewModel = viewModel,
                            palette = palette,
                            modifier = Modifier.fillMaxSize(),
                            useGlowEffect = true,
                            onBackgroundClick = {
                                coroutineScope.launch {
                                    pagerState.animateScrollToPage(0)
                                }
                            }
                        )
                    }
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
