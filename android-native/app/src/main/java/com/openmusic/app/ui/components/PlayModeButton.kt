package com.openmusic.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.openmusic.app.ui.PlayMode
import com.openmusic.app.ui.theme.ComponentStyles

@Composable
fun PlayModeButton(
    playMode: PlayMode,
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    IconButton(onClick = onClick, modifier = modifier) {
        when (playMode) {
            PlayMode.LIST_LOOP -> {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "List Loop",
                    tint = color
                )
            }
            PlayMode.SINGLE_LOOP -> {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Single Loop",
                        tint = color
                    )
                    Text(
                        text = "1",
                        color = color,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.offset(y = (-0.5).dp)
                    )
                }
            }
            PlayMode.SHUFFLE -> {
                Canvas(modifier = Modifier.size(ComponentStyles.subActionIconSize)) {
                    val w = size.width
                    val h = size.height
                    val stroke = 2.dp.toPx()
                    
                    // Crossed Line 1
                    drawLine(color, Offset(0f, 0f), Offset(w, h), stroke)
                    // Crossed Line 2
                    drawLine(color, Offset(0f, h), Offset(w, 0f), stroke)
                    
                    // Arrow Head 1 (bottom right)
                    drawLine(color, Offset(w - 5.dp.toPx(), h), Offset(w, h), stroke)
                    drawLine(color, Offset(w, h - 5.dp.toPx()), Offset(w, h), stroke)
 
                    // Arrow Head 2 (top right)
                    drawLine(color, Offset(w - 5.dp.toPx(), 0f), Offset(w, 0f), stroke)
                    drawLine(color, Offset(w, 5.dp.toPx()), Offset(w, 0f), stroke)
                }
            }
        }
    }
}
