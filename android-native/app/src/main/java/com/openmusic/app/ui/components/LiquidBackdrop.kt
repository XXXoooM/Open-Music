package com.openmusic.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun LiquidBackdrop(
    primaryColor: Color,
    secondaryColor: Color,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "LiquidBackdrop")

    // Spot 1 coordinates oscillation
    val spot1XOffset by infiniteTransition.animateFloat(
        initialValue = -0.2f,
        targetValue = 0.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(16000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "Spot1X"
    )
    val spot1YOffset by infiniteTransition.animateFloat(
        initialValue = -0.1f,
        targetValue = 0.3f,
        animationSpec = infiniteRepeatable(
            animation = tween(20000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "Spot1Y"
    )

    // Spot 2 coordinates oscillation
    val spot2XOffset by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = -0.1f,
        animationSpec = infiniteRepeatable(
            animation = tween(22000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "Spot2X"
    )
    val spot2YOffset by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = -0.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(18000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "Spot2Y"
    )

    // Spot breathing size factor
    val scaleFactor by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(14000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "SpotScale"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .blur(80.dp)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height

            // Deep background canvas base
            drawRect(color = Color(0xFF06090C))

            // Primary Color Spot
            val center1 = Offset(
                x = width * (0.35f + spot1XOffset),
                y = height * (0.3f + spot1YOffset)
            )
            drawCircle(
                color = primaryColor.copy(alpha = 0.32f),
                radius = width * 0.55f * scaleFactor,
                center = center1
            )

            // Secondary Color Spot
            val center2 = Offset(
                x = width * (0.65f + spot2XOffset),
                y = height * (0.65f + spot2YOffset)
            )
            drawCircle(
                color = secondaryColor.copy(alpha = 0.28f),
                radius = width * 0.65f * (2f - scaleFactor),
                center = center2
            )

            // Deep overlay blend Spot
            val center3 = Offset(
                x = width * 0.5f,
                y = height * 0.85f
            )
            drawCircle(
                color = Color(0xFF1B2129).copy(alpha = 0.22f),
                radius = width * 0.45f,
                center = center3
            )
        }
    }
}
