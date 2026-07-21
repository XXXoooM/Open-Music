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
                background = Color(0xFFFAFAFC),      // 极简纯白 (Pure Crisp Snow White)
                primary = Color(0xFF2563EB),          // 宝蓝色 (Royal Sapphire Blue)
                surface = Color(0xFFF1F5F9),          // 浅蓝灰明亮表面层
                textMain = Color(0xFF0F172A),         // 深石墨黑主文本，对比度极佳
                textMuted = Color(0xFF64748B),         // 灰蓝色次要文本
                textInactive = Color(0xFF94A3B8),      // 未选中/禁用状态
                softAccent = Color(0xFFEFF6FF),       // 淡蓝高亮底色作按钮和背景指示器
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
