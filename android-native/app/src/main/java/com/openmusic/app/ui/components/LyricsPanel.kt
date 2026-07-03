package com.openmusic.app.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.theme.ComponentStyles
import com.openmusic.app.ui.theme.HslColorPalette

@Composable
fun LyricsPanel(
    viewModel: MainViewModel,
    palette: HslColorPalette,
    modifier: Modifier = Modifier,
    useGlowEffect: Boolean = true
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
            val spacingPx = remember(density) { with(density) { 24.dp.toPx().toInt() } }
            val slotHeightPx = itemHeightPx + spacingPx
            val viewportHeightPx = remember(density, maxHeight) { with(density) { maxHeight.toPx().toInt() } }

            // Smart spring scroll center alignment (Precisely calculated with slot height + spacing)
            LaunchedEffect(viewModel.currentLyricIndex) {
                val currentTime = System.currentTimeMillis()
                if (currentTime - lastUserInteractionTime > 3500) {
                    if (viewModel.currentLyricIndex in viewModel.lyrics.indices) {
                        val targetY = viewportHeightPx / 2 - itemHeightPx / 2
                        
                        val k = targetY / slotHeightPx
                        val firstVisibleIndex = (viewModel.currentLyricIndex - k - 1).coerceAtLeast(0)
                        val scrollOffset = ((viewModel.currentLyricIndex - firstVisibleIndex) * slotHeightPx - targetY).coerceAtLeast(0)
                        
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
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                itemsIndexed(viewModel.lyrics) { index, line ->
                    val isActive = index == viewModel.currentLyricIndex
                    
                    // Smooth, animated properties for individual lyrics (Upgraded contrast scale/alpha)
                    val lineScale by animateFloatAsState(
                        targetValue = if (isActive) 1.20f else 0.85f,
                        animationSpec = spring(stiffness = Spring.StiffnessLow),
                        label = "LyricScale"
                    )
                    val lineAlpha by animateFloatAsState(
                        targetValue = if (isActive) 1.0f else 0.30f,
                        animationSpec = tween(500),
                        label = "LyricAlpha"
                    )
                    val lineOffsetY by animateFloatAsState(
                        targetValue = if (isActive) 0f else 4f,
                        animationSpec = spring(stiffness = Spring.StiffnessLow),
                        label = "LyricOffsetY"
                    )

                    val fontSize = if (isActive) ComponentStyles.lyricActiveFontSize else ComponentStyles.lyricInactiveFontSize
                    val fontWeight = if (isActive) ComponentStyles.lyricActiveFontWeight else ComponentStyles.lyricInactiveFontWeight
                    
                    val textStyle = if (isActive) {
                        if (useGlowEffect) {
                            TextStyle(
                                color = Color.White,
                                shadow = Shadow(
                                    color = Color.White.copy(alpha = 0.8f),
                                    offset = Offset(0f, 0f),
                                    blurRadius = 14f
                                )
                            )
                        } else {
                            TextStyle(
                                brush = Brush.horizontalGradient(
                                    colors = listOf(palette.primary, palette.textMain)
                                )
                            )
                        }
                    } else {
                        TextStyle(color = palette.textInactive.copy(alpha = 0.6f))
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
                                alpha = if (isActive) 1f else lineAlpha
                            }
                            .clickable {
                                viewModel.seekTo((line.time * 1000).toLong())
                                lastUserInteractionTime = 0L
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
                .height(120.dp)
                .align(Alignment.BottomCenter)
                .background(Brush.verticalGradient(listOf(Color.Transparent, palette.background.copy(0.95f))))
        )
    }
}
