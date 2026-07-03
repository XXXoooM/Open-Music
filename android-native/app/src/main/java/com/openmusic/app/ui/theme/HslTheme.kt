package com.openmusic.app.ui.theme

import androidx.compose.animation.core.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color

data class HslColorPalette(
    val background: Color,
    val primary: Color,
    val surface: Color,
    val textMain: Color,
    val textMuted: Color,
    val textInactive: Color,
    val softAccent: Color,
    val isHslEnabled: Boolean = true
)

@Composable
fun rememberHslPalette(targetHue: Float, isHslEnabled: Boolean): HslColorPalette {
    if (!isHslEnabled) {
        return remember {
            HslColorPalette(
                background = Color(0xFFF9FAFB), // Clean off-white background
                primary = Color(0xFF1E88E5),    // Clean blue accent
                surface = Color(0xFFFFFFFF),    // Clean white surface
                textMain = Color(0xFF1F2937),   // Dark gray main text
                textMuted = Color(0xFF4B5563),  // Muted gray text
                textInactive = Color(0xFF9CA3AF),// Inactive gray text
                softAccent = Color(0xFFE3F2FD), // Soft blue tint
                isHslEnabled = false
            )
        }
    }

    // Keep track of the last known hue to calculate the shortest path
    var lastHue by remember { mutableStateOf(targetHue) }
    var accumulatedHue by remember { mutableStateOf(targetHue) }

    LaunchedEffect(targetHue) {
        val diff = (targetHue - lastHue) % 360f
        val shortestDiff = when {
            diff > 180f -> diff - 360f
            diff < -180f -> diff + 360f
            else -> diff
        }
        accumulatedHue += shortestDiff
        lastHue = targetHue
    }

    // Smoothly animate the accumulated hue value
    val animatedHue by animateFloatAsState(
        targetValue = accumulatedHue,
        animationSpec = tween(1200, easing = FastOutSlowInEasing),
        label = "HslHueAnimation"
    )

    // Normalize back to the [0..360] range for HSL color processing
    val finalHue = remember(animatedHue) {
        var h = animatedHue % 360f
        if (h < 0) h += 360f
        h
    }

    return remember(finalHue) {
        HslColorPalette(
            background = Color.hsl(finalHue, 0.18f, 0.04f),
            primary = Color.hsl(finalHue, 0.92f, 0.68f),
            surface = Color.hsl(finalHue, 0.15f, 0.10f),
            textMain = Color.hsl(finalHue, 0.08f, 0.96f),
            textMuted = Color.hsl(finalHue, 0.06f, 0.62f),
            textInactive = Color.hsl(finalHue, 0.04f, 0.38f),
            softAccent = Color.hsl(finalHue, 0.40f, 0.20f),
            isHslEnabled = true
        )
    }
}
