package com.openmusic.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.theme.HslColorPalette
import java.util.concurrent.TimeUnit

/**
 * Sleep Timer Dialog — lets the user schedule automatic playback stop.
 *
 * Options:
 *  - Fixed durations: 15 / 30 / 45 / 60 minutes
 *  - "当前曲结束后停止" (stop after current track)
 *  - "取消定时" (cancel any active timer)
 *
 * Shows a live countdown when a timer is active.
 */
@Composable
fun SleepTimerDialog(
    viewModel: MainViewModel,
    palette: HslColorPalette,
    onDismiss: () -> Unit
) {
    val isTimerActive = viewModel.sleepTimerRemaining >= 0L
    val isAfterTrackActive = viewModel.sleepAfterCurrentTrack

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = palette.surface,
            tonalElevation = 8.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Title
                Text(
                    text = "🌙 睡眠定时器",
                    color = palette.textMain,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 6.dp)
                )

                // Countdown display
                if (isTimerActive) {
                    val remaining = viewModel.sleepTimerRemaining
                    val minutes = TimeUnit.MILLISECONDS.toMinutes(remaining)
                    val seconds = TimeUnit.MILLISECONDS.toSeconds(remaining) % 60
                    Text(
                        text = "剩余 %02d:%02d".format(minutes, seconds),
                        color = palette.primary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                } else if (isAfterTrackActive) {
                    Text(
                        text = "当前曲结束后将停止播放",
                        color = palette.primary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                } else {
                    Text(
                        text = "选择一个时长，到时自动停止播放",
                        color = palette.textMuted,
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                }

                HorizontalDivider(
                    color = palette.textInactive.copy(alpha = 0.1f),
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // Duration grid: 2 columns × 2 rows
                val durations = listOf(
                    "15 分钟" to 15 * 60 * 1000L,
                    "30 分钟" to 30 * 60 * 1000L,
                    "45 分钟" to 45 * 60 * 1000L,
                    "60 分钟" to 60 * 60 * 1000L,
                )

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    durations.chunked(2).forEach { rowItems ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            rowItems.forEach { (label, ms) ->
                                val isSelected = isTimerActive && viewModel.sleepTimerRemaining.let {
                                    // Rough match: selected if the initial duration bracket matches
                                    val minutesLeft = TimeUnit.MILLISECONDS.toMinutes(it)
                                    val minutesTarget = TimeUnit.MILLISECONDS.toMinutes(ms)
                                    minutesLeft in (minutesTarget - 1)..minutesTarget
                                }
                                SleepTimerOption(
                                    label = label,
                                    isSelected = isSelected,
                                    palette = palette,
                                    modifier = Modifier.weight(1f),
                                    onClick = {
                                        viewModel.setSleepTimer(ms)
                                        onDismiss()
                                    }
                                )
                            }
                        }
                    }

                    // "After current track" option — full width
                    SleepTimerOption(
                        label = "当前曲结束后停止",
                        isSelected = isAfterTrackActive,
                        palette = palette,
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            viewModel.setSleepAfterCurrentTrack()
                            onDismiss()
                        }
                    )

                    // Cancel button
                    if (isTimerActive || isAfterTrackActive) {
                        OutlinedButton(
                            onClick = {
                                viewModel.cancelSleepTimer()
                                onDismiss()
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = palette.textMuted
                            ),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp, palette.textInactive.copy(alpha = 0.3f)
                            )
                        ) {
                            Text("取消定时", fontSize = 14.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SleepTimerOption(
    label: String,
    isSelected: Boolean,
    palette: HslColorPalette,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val bgColor by animateColorAsState(
        targetValue = if (isSelected) palette.softAccent.copy(alpha = 0.25f) else Color.Transparent,
        animationSpec = tween(200),
        label = "sleep_option_bg"
    )
    val borderColor by animateColorAsState(
        targetValue = if (isSelected) palette.primary else palette.textInactive.copy(alpha = 0.2f),
        animationSpec = tween(200),
        label = "sleep_option_border"
    )
    val textColor by animateColorAsState(
        targetValue = if (isSelected) palette.primary else palette.textMain,
        animationSpec = tween(200),
        label = "sleep_option_text"
    )

    Box(
        modifier = modifier
            .height(48.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .border(1.5.dp, borderColor, RoundedCornerShape(12.dp))
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = 14.sp,
            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
        )
    }
}
