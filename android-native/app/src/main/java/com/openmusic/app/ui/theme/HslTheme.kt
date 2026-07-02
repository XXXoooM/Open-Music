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
    val softAccent: Color
)

@Composable
fun rememberHslPalette(targetHue: Float): HslColorPalette {
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
            background = Color.hsl(finalHue, 0.14f, 0.06f),
            primary = Color.hsl(finalHue, 0.85f, 0.65f),
            surface = Color.hsl(finalHue, 0.12f, 0.12f),
            textMain = Color.hsl(finalHue, 0.08f, 0.96f),
            textMuted = Color.hsl(finalHue, 0.06f, 0.62f),
            textInactive = Color.hsl(finalHue, 0.04f, 0.38f),
            softAccent = Color.hsl(finalHue, 0.40f, 0.20f)
        )
    }
}
