package com.openmusic.app.ui.theme

import androidx.compose.animation.core.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
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
fun rememberHslPalette(hue: Float): HslColorPalette {
    // Animates the HSL hue smoothly over 1.2s to prevent color jumping when songs change
    val animatedHue by animateFloatAsState(
        targetValue = hue,
        animationSpec = tween(1200, easing = FastOutSlowInEasing),
        label = "HslHueAnimation"
    )
    
    return remember(animatedHue) {
        HslColorPalette(
            background = Color.hsl(animatedHue, 0.14f, 0.06f),
            primary = Color.hsl(animatedHue, 0.85f, 0.65f),
            surface = Color.hsl(animatedHue, 0.12f, 0.12f),
            textMain = Color.hsl(animatedHue, 0.08f, 0.96f),
            textMuted = Color.hsl(animatedHue, 0.06f, 0.62f),
            textInactive = Color.hsl(animatedHue, 0.04f, 0.38f),
            softAccent = Color.hsl(animatedHue, 0.40f, 0.20f)
        )
    }
}
