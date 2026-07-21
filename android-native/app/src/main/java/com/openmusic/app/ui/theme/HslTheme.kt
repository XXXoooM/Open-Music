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
    return remember(targetHue, isHslEnabled) {
        if (!isHslEnabled) {
            HslColorPalette(
                background = Color(0xFF0F0E17),      // 曜石深黑 (Obsidian Dark)
                primary = Color(0xFF8B5CF6),          // 电光紫/极光紫 (Electric Cyber Violet)
                surface = Color(0xFF1A1926),          // 曜石深灰表面层
                textMain = Color(0xFFF5F5FA),         // 纯净高亮白主文本
                textMuted = Color(0xFFA0A0B2),         // 冷石灰次要文本
                textInactive = Color(0xFF555468),      // 禁用/未选中状态
                softAccent = Color(0xFF2C224E),       // 紫罗兰深色调作按钮和背景指示器
                isHslEnabled = false
            )
        } else {
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
}
