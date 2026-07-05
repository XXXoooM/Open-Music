package com.openmusic.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.theme.ComponentStyles
import com.openmusic.app.ui.theme.HslColorPalette

@Composable
fun PlaybackControls(
    viewModel: MainViewModel,
    palette: HslColorPalette,
    onPlaylistClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val position = viewModel.currentPosition
    val duration = viewModel.duration
    val progress = if (duration > 0) position.toFloat() / duration else 0f

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Slim seek bar
        Slider(
            value = progress,
            onValueChange = { newProgress ->
                viewModel.seekTo((newProgress * duration).toLong())
            },
            colors = SliderDefaults.colors(
                thumbColor = palette.primary,
                activeTrackColor = palette.primary.copy(alpha = 0.8f),
                inactiveTrackColor = palette.textInactive.copy(alpha = 0.25f)
            ),
            modifier = Modifier
                .fillMaxWidth()
                .height(24.dp)
        )
        
        // Time stamps
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = formatTime(position),
                color = palette.textMuted,
                fontSize = 12.sp
            )
            Text(
                text = formatTime(duration),
                color = palette.textMuted,
                fontSize = 12.sp
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Controller row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // 1. Play Mode Switcher (List Loop, Shuffle, Single Loop)
            PlayModeButton(
                playMode = viewModel.playMode,
                color = palette.textInactive,
                onClick = { viewModel.cyclePlayMode() }
            )

            IconButton(onClick = { viewModel.prevTrack() }) {
                SkipPreviousIcon(
                    color = palette.textMain,
                    modifier = Modifier.size(ComponentStyles.controlButtonSize)
                )
            }

            // 3. Central Play/Pause Action Button
            Box(
                modifier = Modifier
                    .size(ComponentStyles.playButtonSize)
                    .shadow(12.dp, CircleShape, clip = false)
                    .background(palette.primary, CircleShape)
                    .clickable { viewModel.togglePlayPause() },
                contentAlignment = Alignment.Center
            ) {
                if (viewModel.isPlaying) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.align(Alignment.Center)
                    ) {
                        Box(modifier = Modifier.size(width = 6.dp, height = 20.dp).background(palette.background, RoundedCornerShape(2.dp)))
                        Box(modifier = Modifier.size(width = 6.dp, height = 20.dp).background(palette.background, RoundedCornerShape(2.dp)))
                    }
                } else {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "Play",
                        tint = palette.background,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }

            IconButton(onClick = { viewModel.nextTrack() }) {
                SkipNextIcon(
                    color = palette.textMain,
                    modifier = Modifier.size(ComponentStyles.controlButtonSize)
                )
            }

            // 5. Drawer queue list trigger
            IconButton(onClick = onPlaylistClick) {
                QueueIcon(
                    color = palette.textMuted,
                    modifier = Modifier.size(ComponentStyles.subActionIconSize)
                )
            }
        }
    }
}

@Composable
fun LyricsPlaybackControls(
    viewModel: MainViewModel,
    onPlaylistClick: () -> Unit,
    onLyricsIconClick: () -> Unit, // Returns user back to Album Art page
    modifier: Modifier = Modifier
) {
    val position = viewModel.currentPosition
    val duration = viewModel.duration
    val progress = if (duration > 0) position.toFloat() / duration else 0f

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Ultra-thin seek bar (Faint Slider track)
        Slider(
            value = progress,
            onValueChange = { newProgress ->
                viewModel.seekTo((newProgress * duration).toLong())
            },
            colors = SliderDefaults.colors(
                thumbColor = Color.White.copy(0.4f),
                activeTrackColor = ComponentStyles.faintSliderActiveColor,
                inactiveTrackColor = ComponentStyles.faintSliderInactiveColor
            ),
            modifier = Modifier.fillMaxWidth().height(16.dp)
        )
        
        // Faint Time stamps
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = formatTime(position),
                color = Color.White.copy(0.35f),
                fontSize = 11.sp
            )
            Text(
                text = formatTime(duration),
                color = Color.White.copy(0.35f),
                fontSize = 11.sp
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Faint transparent controller row matching Image 2
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            PlayModeButton(
                playMode = viewModel.playMode,
                color = Color.White.copy(alpha = 0.45f),
                onClick = { viewModel.cyclePlayMode() }
            )

            IconButton(onClick = { viewModel.prevTrack() }) {
                SkipPreviousIcon(
                    color = Color.White.copy(0.7f),
                    modifier = Modifier.size(ComponentStyles.controlButtonSize)
                )
            }

            // Central Play/Pause Action Button with Dark Semi-Transparent Circle
            Box(
                modifier = Modifier
                    .size(ComponentStyles.lyricPlayButtonSize)
                    .background(ComponentStyles.transparentControlsBg, CircleShape)
                    .clickable { viewModel.togglePlayPause() },
                contentAlignment = Alignment.Center
            ) {
                if (viewModel.isPlaying) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.align(Alignment.Center)
                    ) {
                        Box(modifier = Modifier.size(width = 4.dp, height = 16.dp).background(Color.White.copy(0.85f), RoundedCornerShape(1.dp)))
                        Box(modifier = Modifier.size(width = 4.dp, height = 16.dp).background(Color.White.copy(0.85f), RoundedCornerShape(1.dp)))
                    }
                } else {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "Play",
                        tint = Color.White.copy(0.85f),
                        modifier = Modifier.size(28.dp)
                    )
                }
            }

            IconButton(onClick = { viewModel.nextTrack() }) {
                SkipNextIcon(
                    color = Color.White.copy(0.7f),
                    modifier = Modifier.size(ComponentStyles.controlButtonSize)
                )
            }

            IconButton(onClick = onPlaylistClick) {
                QueueIcon(
                    color = Color.White.copy(0.45f),
                    modifier = Modifier.size(ComponentStyles.subActionIconSize)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Bottom-most Volume / Lyrics Toggle Row matching Image 2
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { /* Volume Action or indicator */ }) {
                val iconColor = Color.White.copy(0.35f)
                Canvas(modifier = Modifier.size(ComponentStyles.subActionIconSize)) {
                    val w = size.width
                    val h = size.height
                    val strokePx = 2.dp.toPx()
                    
                    val speakerPath = Path().apply {
                        moveTo(w * 0.25f, h * 0.35f)
                        lineTo(w * 0.45f, h * 0.35f)
                        lineTo(w * 0.65f, h * 0.15f)
                        lineTo(w * 0.65f, h * 0.85f)
                        lineTo(w * 0.45f, h * 0.65f)
                        lineTo(w * 0.25f, h * 0.65f)
                        close()
                    }
                    drawPath(speakerPath, iconColor)
                    
                    drawArc(
                        color = iconColor,
                        startAngle = -45f,
                        sweepAngle = 90f,
                        useCenter = false,
                        topLeft = Offset(w * 0.35f, h * 0.25f),
                        size = Size(w * 0.5f, h * 0.5f),
                        style = Stroke(width = strokePx)
                    )
                }
            }

            IconButton(onClick = onLyricsIconClick) {
                Icon(
                    // List loop/lyrics icon to toggle back
                    imageVector = Icons.Default.List,
                    contentDescription = "Toggle back to cover",
                    tint = Color.White.copy(0.35f),
                    modifier = Modifier.size(ComponentStyles.subActionIconSize)
                )
            }
        }
    }
}

@Composable
fun SkipPreviousIcon(color: Color, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val barWidth = 2.dp.toPx()
        
        // Draw the vertical bar on the left
        drawRect(
            color = color,
            topLeft = Offset(w * 0.22f, h * 0.25f),
            size = Size(barWidth, h * 0.5f)
        )
        
        // Draw the triangle pointing left
        val trianglePath = Path().apply {
            moveTo(w * 0.72f, h * 0.25f)
            lineTo(w * 0.32f, h * 0.5f)
            lineTo(w * 0.72f, h * 0.75f)
            close()
        }
        drawPath(trianglePath, color)
    }
}

@Composable
fun SkipNextIcon(color: Color, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val barWidth = 2.dp.toPx()
        
        // Draw the triangle pointing right
        val trianglePath = Path().apply {
            moveTo(w * 0.28f, h * 0.25f)
            lineTo(w * 0.68f, h * 0.5f)
            lineTo(w * 0.28f, h * 0.75f)
            close()
        }
        drawPath(trianglePath, color)
        
        // Draw the vertical bar on the right
        drawRect(
            color = color,
            topLeft = Offset(w * 0.78f - barWidth, h * 0.25f),
            size = Size(barWidth, h * 0.5f)
        )
    }
}

@Composable
fun QueueIcon(color: Color, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val stroke = 1.8.dp.toPx()
        
        // Line 1
        drawLine(color, Offset(w * 0.2f, h * 0.3f), Offset(w * 0.8f, h * 0.3f), stroke, cap = StrokeCap.Round)
        // Line 2
        drawLine(color, Offset(w * 0.2f, h * 0.5f), Offset(w * 0.8f, h * 0.5f), stroke, cap = StrokeCap.Round)
        // Line 3
        drawLine(color, Offset(w * 0.2f, h * 0.7f), Offset(w * 0.55f, h * 0.7f), stroke, cap = StrokeCap.Round)
        
        // Play triangle
        val trianglePath = Path().apply {
            moveTo(w * 0.70f, h * 0.60f)
            lineTo(w * 0.70f, h * 0.80f)
            lineTo(w * 0.85f, h * 0.70f)
            close()
        }
        drawPath(trianglePath, color)
    }
}

fun formatTime(ms: Long): String {
    val totalSec = ms / 1000
    val min = totalSec / 60
    val sec = totalSec % 60
    return String.format("%02d:%02d", min, sec)
}
