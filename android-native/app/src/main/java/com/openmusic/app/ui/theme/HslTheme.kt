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
                background = Color(0xFFFAF6EE),      // 象牙白 (Ivory White)
                primary = Color(0xFF1B4D3E),          // 森林绿 (Forest Green)
                surface = Color(0xFFF3ECE0),          // 温暖卡其象牙色作卡片表面层
                textMain = Color(0xFF1A261F),         // 深灰绿主文本，保证对比度极佳
                textMuted = Color(0xFF5A665D),         // 次要文本
                textInactive = Color(0xFF909C93),      // 禁用/未选中状态
                softAccent = Color(0xFFE6F2EA),       // 浅森林绿淡色调作按钮和背景指示器
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
