package com.openmusic.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.interaction.DragInteraction
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
    useGlowEffect: Boolean = true,
    onBackgroundClick: (() -> Unit)? = null
) {
    val clickableModifier = if (onBackgroundClick != null) {
        Modifier.clickable(
            interactionSource = remember { MutableInteractionSource() },
            indication = null
        ) {
            onBackgroundClick()
        }
    } else Modifier

    if (viewModel.lyrics.isEmpty()) {
        Box(
            modifier = modifier.fillMaxSize().then(clickableModifier),
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

    // Only lock auto-scroll when the user actually drags the list (ignoring programmatic scroll animation)
    LaunchedEffect(lazyListState.interactionSource) {
        lazyListState.interactionSource.interactions.collect { interaction ->
            when (interaction) {
                is DragInteraction.Start -> {
                    lastUserInteractionTime = System.currentTimeMillis()
                }
                is DragInteraction.Stop -> {
                    lastUserInteractionTime = System.currentTimeMillis()
                }
                is DragInteraction.Cancel -> {
                    lastUserInteractionTime = System.currentTimeMillis()
                }
            }
        }
    }

    Box(modifier = modifier.fillMaxSize().then(clickableModifier)) {
        BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
            val density = LocalDensity.current

            // Center the active lyric line exactly in the middle of the screen
            LaunchedEffect(viewModel.currentLyricIndex) {
                val currentTime = System.currentTimeMillis()
                if (currentTime - lastUserInteractionTime > 3500) {
                    if (viewModel.currentLyricIndex in viewModel.lyrics.indices) {
                        // 24.dp is approximately half of the active lyric line height, centering it perfectly
                        val offsetPx = with(density) { 24.dp.toPx().toInt() }
                        lazyListState.animateScrollToItem(
                            index = viewModel.currentLyricIndex,
                            scrollOffset = offsetPx
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
                    
                    // Smooth, animated properties for individual lyrics using premium spring/tween specs
                    val lineScale by animateFloatAsState(
                        targetValue = if (isActive) 1.06f else 0.94f,
                        animationSpec = spring(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = Spring.StiffnessLow),
                        label = "lyric_scale"
                    )
                    val lineAlpha by animateFloatAsState(
                        targetValue = if (isActive) 1.0f else 0.60f,
                        animationSpec = tween(durationMillis = 350),
                        label = "lyric_alpha"
                    )
                    val lineOffsetY by animateFloatAsState(
                        targetValue = if (isActive) 0f else 4f,
                        animationSpec = spring(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = Spring.StiffnessLow),
                        label = "lyric_offset_y"
                    )
                    
                    // Smooth color and glow transitions (adaptive to HSL theme setting)
                    val textColor by animateColorAsState(
                        targetValue = if (isActive) {
                            palette.primary
                        } else {
                            palette.textMain.copy(alpha = 0.5f)
                        },
                        animationSpec = tween(durationMillis = 350),
                        label = "lyric_color"
                    )
                    val shadowColor by animateColorAsState(
                        targetValue = if (isActive && palette.isHslEnabled && useGlowEffect) {
                            palette.primary.copy(alpha = 0.40f)
                        } else {
                            Color.Transparent
                        },
                        animationSpec = tween(durationMillis = 350),
                        label = "lyric_shadow_color"
                    )

                    val fontSize = if (isActive) ComponentStyles.lyricActiveFontSize else ComponentStyles.lyricInactiveFontSize
                    val fontWeight = if (isActive) ComponentStyles.lyricActiveFontWeight else ComponentStyles.lyricInactiveFontWeight
                    
                    val textStyle = TextStyle(
                        color = textColor,
                        shadow = Shadow(
                            color = shadowColor,
                            offset = Offset(0f, 0f),
                            blurRadius = 20f
                        )
                    )

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
                                viewModel.seekTo(line.time) // time is now Long ms, no conversion needed
                                lastUserInteractionTime = 0L
                            }
                    )
                }
            }
        }

        // Top/Bottom multi-stop status bar fusion mask gradients
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp)
                .align(Alignment.TopCenter)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            palette.background.copy(alpha = 0.96f),
                            palette.background.copy(alpha = 0.70f),
                            palette.background.copy(alpha = 0.25f),
                            Color.Transparent
                        )
                    )
                )
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp)
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Transparent,
                            palette.background.copy(alpha = 0.30f),
                            palette.background.copy(alpha = 0.80f),
                            palette.background.copy(alpha = 0.96f)
                        )
                    )
                )
        )
    }
}
