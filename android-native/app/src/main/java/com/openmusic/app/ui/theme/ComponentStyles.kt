package com.openmusic.app.ui.theme

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object ComponentStyles {
    // 1. Album Art Dimensions & Shapes
    val albumArtShape = RoundedCornerShape(32.dp)
    val albumArtSize = 290.dp
    
    val miniAlbumArtShape = RoundedCornerShape(8.dp)
    val miniAlbumArtSize = 54.dp

    // 2. Playback Control Sizes
    val playButtonSize = 72.dp
    val lyricPlayButtonSize = 56.dp
    val controlButtonSize = 36.dp
    val actionIconSize = 24.dp
    val subActionIconSize = 20.dp

    // 3. Shared Shapes
    val iconButtonShape = CircleShape
    val bottomSheetShape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp)

    // 4. Unified Typography Settings
    val titleFontSize = 24.sp
    val titleFontWeight = FontWeight.ExtraBold
    val artistFontSize = 16.sp
    val artistFontWeight = FontWeight.Medium

    // 5. Lyrics Screen Specific Typography
    val lyricActiveFontSize = 24.sp
    val lyricActiveFontWeight = FontWeight.Bold
    val lyricInactiveFontSize = 20.sp
    val lyricInactiveFontWeight = FontWeight.Medium

    // 6. Colors & Alphas
    val translucentBgColor = Color.Black.copy(alpha = 0.2f)
    val transparentControlsBg = Color.Black.copy(alpha = 0.35f)
    val faintSliderActiveColor = Color.White.copy(alpha = 0.35f)
    val faintSliderInactiveColor = Color.White.copy(alpha = 0.12f)
}
