package com.openmusic.app.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
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
    // Smooth, responsive spring scaling between playing (1.0) and paused (0.88)
    val targetScale = if (isPlaying) 1.0f else 0.88f
    val animatedScale by animateFloatAsState(
        targetValue = targetScale,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessMediumLow
        ),
        label = "AlbumArtScale"
    )
    
    val cardShadowElevation by animateDpAsState(
        targetValue = if (isPlaying) 28.dp else 10.dp,
        animationSpec = tween(300),
        label = "CardShadow"
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.size(ComponentStyles.albumArtSize + 20.dp)
    ) {
        // Main Album Art Card
        Card(
            shape = ComponentStyles.albumArtShape,
            modifier = Modifier
                .size(ComponentStyles.albumArtSize)
                .graphicsLayer {
                    scaleX = animatedScale
                    scaleY = animatedScale
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

                // Subtle inner outline mimicking glass sheen (Adaptive to theme)
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .border(
                            0.5.dp,
                            palette.textMain.copy(alpha = 0.12f),
                            ComponentStyles.albumArtShape
                        )
                )
            }
        }
    }
}
