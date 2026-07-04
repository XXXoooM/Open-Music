package com.openmusic.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
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
                Canvas(modifier = Modifier.size(20.dp)) {
                    val w = size.width
                    val h = size.height
                    val stroke = 1.8f.dp.toPx()
                    
                    // Loop rounded rectangle path
                    val repeatPath = Path().apply {
                        moveTo(w * 0.25f, h * 0.3f)
                        lineTo(w * 0.7f, h * 0.3f)
                        quadraticBezierTo(w * 0.82f, h * 0.3f, w * 0.82f, h * 0.45f)
                        lineTo(w * 0.82f, h * 0.55f)
                        quadraticBezierTo(w * 0.82f, h * 0.7f, w * 0.7f, h * 0.7f)
                        lineTo(w * 0.3f, h * 0.7f)
                        quadraticBezierTo(w * 0.18f, h * 0.7f, w * 0.18f, h * 0.55f)
                        lineTo(w * 0.18f, h * 0.45f)
                        quadraticBezierTo(w * 0.18f, h * 0.3f, w * 0.3f, h * 0.3f)
                    }
                    drawPath(
                        path = repeatPath,
                        color = color,
                        style = Stroke(width = stroke, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    )
                    
                    // Top Arrowhead (pointing right)
                    val arrowTop = Path().apply {
                        moveTo(w * 0.60f, h * 0.20f)
                        lineTo(w * 0.72f, h * 0.3f)
                        lineTo(w * 0.60f, h * 0.40f)
                    }
                    drawPath(
                        path = arrowTop,
                        color = color,
                        style = Stroke(width = stroke, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    )

                    // Bottom Arrowhead (pointing left)
                    val arrowBottom = Path().apply {
                        moveTo(w * 0.40f, h * 0.60f)
                        lineTo(w * 0.28f, h * 0.7f)
                        lineTo(w * 0.40f, h * 0.80f)
                    }
                    drawPath(
                        path = arrowBottom,
                        color = color,
                        style = Stroke(width = stroke, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    )
                }
            }
            PlayMode.SINGLE_LOOP -> {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.size(20.dp)) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val w = size.width
                        val h = size.height
                        val stroke = 1.8f.dp.toPx()
                        
                        val repeatPath = Path().apply {
                            moveTo(w * 0.25f, h * 0.3f)
                            lineTo(w * 0.7f, h * 0.3f)
                            quadraticBezierTo(w * 0.82f, h * 0.3f, w * 0.82f, h * 0.45f)
                            lineTo(w * 0.82f, h * 0.55f)
                            quadraticBezierTo(w * 0.82f, h * 0.7f, w * 0.7f, h * 0.7f)
                            lineTo(w * 0.3f, h * 0.7f)
                            quadraticBezierTo(w * 0.18f, h * 0.7f, w * 0.18f, h * 0.55f)
                            lineTo(w * 0.18f, h * 0.45f)
                            quadraticBezierTo(w * 0.18f, h * 0.3f, w * 0.3f, h * 0.3f)
                        }
                        drawPath(
                            path = repeatPath,
                            color = color,
                            style = Stroke(width = stroke, cap = StrokeCap.Round, join = StrokeJoin.Round)
                        )
                        
                        // Top Arrowhead (pointing right)
                        val arrowTop = Path().apply {
                            moveTo(w * 0.60f, h * 0.20f)
                            lineTo(w * 0.72f, h * 0.3f)
                            lineTo(w * 0.60f, h * 0.40f)
                        }
                        drawPath(
                            path = arrowTop,
                            color = color,
                            style = Stroke(width = stroke, cap = StrokeCap.Round, join = StrokeJoin.Round)
                        )

                        // Bottom Arrowhead (pointing left)
                        val arrowBottom = Path().apply {
                            moveTo(w * 0.40f, h * 0.60f)
                            lineTo(w * 0.28f, h * 0.7f)
                            lineTo(w * 0.40f, h * 0.80f)
                        }
                        drawPath(
                            path = arrowBottom,
                            color = color,
                            style = Stroke(width = stroke, cap = StrokeCap.Round, join = StrokeJoin.Round)
                        )
                    }
                    Text(
                        text = "1",
                        color = color,
                        fontSize = 8.5f.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            PlayMode.SHUFFLE -> {
                Canvas(modifier = Modifier.size(20.dp)) {
                    val w = size.width
                    val h = size.height
                    val stroke = 1.8f.dp.toPx()
                    
                    // Path 1: Bottom-left to top-right (crossing)
                    val path1 = Path().apply {
                        moveTo(w * 0.2f, h * 0.7f)
                        cubicTo(w * 0.45f, h * 0.7f, w * 0.55f, h * 0.3f, w * 0.8f, h * 0.3f)
                    }
                    drawPath(
                        path = path1,
                        color = color,
                        style = Stroke(width = stroke, cap = StrokeCap.Round)
                    )
                    // Arrowhead 1
                    val arrow1 = Path().apply {
                        moveTo(w * 0.66f, h * 0.20f)
                        lineTo(w * 0.82f, h * 0.3f)
                        lineTo(w * 0.66f, h * 0.40f)
                    }
                    drawPath(
                        path = arrow1,
                        color = color,
                        style = Stroke(width = stroke, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    )

                    // Path 2: Top-left to bottom-right (crossing)
                    val path2 = Path().apply {
                        moveTo(w * 0.2f, h * 0.3f)
                        cubicTo(w * 0.45f, h * 0.3f, w * 0.55f, h * 0.7f, w * 0.8f, h * 0.7f)
                    }
                    drawPath(
                        path = path2,
                        color = color,
                        style = Stroke(width = stroke, cap = StrokeCap.Round)
                    )
                    // Arrowhead 2
                    val arrow2 = Path().apply {
                        moveTo(w * 0.66f, h * 0.60f)
                        lineTo(w * 0.82f, h * 0.7f)
                        lineTo(w * 0.66f, h * 0.80f)
                    }
                    drawPath(
                        path = arrow2,
                        color = color,
                        style = Stroke(width = stroke, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    )
                }
            }
        }
    }
}
