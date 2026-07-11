package com.openmusic.app.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.openmusic.app.ui.theme.ComponentStyles
import com.openmusic.app.ui.theme.HslColorPalette

@Composable
fun FloatingAlbumArt(
    coverUrl: String,
    isPlaying: Boolean,
    palette: HslColorPalette,
    modifier: Modifier = Modifier
) {
    val targetScale = if (isPlaying) 1.0f else 0.88f
    val animatedScale by animateFloatAsState(
        targetValue = targetScale,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "AlbumArtScale"
    )
    
    val infiniteTransition = rememberInfiniteTransition(label = "AlbumArtBreathing")
    
    // Slow organic breathing pulse scale
    val breathingScale by infiniteTransition.animateFloat(
        initialValue = 0.97f,
        targetValue = 1.03f,
        animationSpec = infiniteRepeatable(
            animation = tween(5000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "BreathingScale"
    )
    
    // Breathing shadow glow opacity
    val breathingGlow by infiniteTransition.animateFloat(
        initialValue = 0.18f,
        targetValue = 0.48f,
        animationSpec = infiniteRepeatable(
            animation = tween(5000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "BreathingGlow"
    )

    val finalScale = if (isPlaying) animatedScale * breathingScale else animatedScale
    val glowOpacity = if (isPlaying) breathingGlow else 0f
    
    val cardShadowElevation by animateDpAsState(
        targetValue = if (isPlaying) 32.dp else 12.dp,
        animationSpec = tween(500),
        label = "CardShadow"
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier
            .size(ComponentStyles.albumArtSize + 40.dp) // padding allowance for glow
    ) {
        // Neon Glow Backdrop (Breathing and glowing dynamically in primary accent color)
        if (isPlaying) {
            Box(
                modifier = Modifier
                    .size(ComponentStyles.albumArtSize - 8.dp)
                    .graphicsLayer {
                        scaleX = finalScale * 1.04f
                        scaleY = finalScale * 1.04f
                    }
                    .shadow(
                        elevation = 36.dp,
                        shape = ComponentStyles.albumArtShape,
                        clip = false,
                        ambientColor = palette.primary,
                        spotColor = palette.primary
                    )
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                palette.primary.copy(alpha = glowOpacity),
                                Color.Transparent
                            )
                        ),
                        shape = ComponentStyles.albumArtShape
                    )
            )
        }

        // Main Album Art Card
        Card(
            shape = ComponentStyles.albumArtShape,
            modifier = Modifier
                .size(ComponentStyles.albumArtSize)
                .graphicsLayer {
                    scaleX = finalScale
                    scaleY = finalScale
                }
                .shadow(
                    elevation = cardShadowElevation,
                    shape = ComponentStyles.albumArtShape,
                    clip = false
                ),
            colors = CardDefaults.cardColors(containerColor = palette.surface)
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
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
                            modifier = Modifier.size(48.dp)
                        )
                    }
                }

                // Subtle vertical gradient overlay simulating physical vinyl gloss reflections
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Transparent,
                                    Color.Black.copy(alpha = 0.5f),
                                    Color.Transparent
                                ),
                                startY = 0.3f,
                                endY = Float.POSITIVE_INFINITY
                            )
                        )
                )

                // Subtle inner outline mimicking glass sheen
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .border(
                            0.5.dp,
                            Color.White.copy(alpha = 0.15f),
                            ComponentStyles.albumArtShape
                        )
                )
            }
        }
    }
}
