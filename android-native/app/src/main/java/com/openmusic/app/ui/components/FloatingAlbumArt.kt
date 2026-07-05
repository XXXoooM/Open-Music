package com.openmusic.app.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
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
        shape = ComponentStyles.albumArtShape,
        modifier = modifier
            .size(ComponentStyles.albumArtSize)
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
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

            // 3. Subtle vertical gradient overlay simulating physical vinyl gloss reflections
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

            // 4. Subtle inner outline mimicking glass sheen
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
