package com.openmusic.app.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
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
                background = Color(0xFF0A0B10),      // 固定深色背景
                primary = Color(0xFF00E5FF),          // 固定青色强调
                surface = Color(0xFF1A1C28),
                textMain = Color(0xFFFFFFFF),
                textMuted = Color(0xFFB0B0B0),
                textInactive = Color(0xFF606060),
                softAccent = Color(0xFF1A2A3A),
                isHslEnabled = false
            )
        }
    }

    // 直接使用 targetHue，无动画、无累加、无最短路径
    return remember(targetHue) {
        val hue = targetHue.coerceIn(0f, 360f)
        HslColorPalette(
            background = Color.hsl(hue, 0.18f, 0.04f),
            primary = Color.hsl(hue, 0.92f, 0.68f),
            surface = Color.hsl(hue, 0.15f, 0.10f),
            textMain = Color.hsl(hue, 0.08f, 0.96f),
            textMuted = Color.hsl(hue, 0.06f, 0.62f),
            textInactive = Color.hsl(hue, 0.04f, 0.38f),
            softAccent = Color.hsl(hue, 0.40f, 0.20f),
            isHslEnabled = true
        )
    }
}
