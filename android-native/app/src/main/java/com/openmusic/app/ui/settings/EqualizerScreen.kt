package com.openmusic.app.ui.settings

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.openmusic.app.audio.EqualizerManager
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.theme.HslColorPalette

/**
 * EqualizerScreen — Full-page EQ editor.
 *
 * Layout:
 *  - Top bar with back arrow and title
 *  - Preset pill row (scrollable, 6 presets)
 *  - 5 vertical sliders representing frequency bands (-10dB to +10dB)
 *  - dB value labels above each slider
 *  - "重置默认" button at the bottom
 *  - Device unsupported banner (shown when Equalizer API unavailable)
 */
@Composable
fun EqualizerScreen(
    viewModel: MainViewModel,
    palette: HslColorPalette,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isSupported = EqualizerManager.isSupported

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(palette.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .systemBarsPadding()
        ) {
            // ── Top Bar ──
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "返回",
                        tint = palette.textMain
                    )
                }
                Text(
                    text = "均衡器 (EQ)",
                    color = palette.textMain,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(start = 8.dp)
                )
                Spacer(modifier = Modifier.weight(1f))
                // Active preset badge
                Text(
                    text = viewModel.eqPreset,
                    color = palette.primary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(end = 16.dp)
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                // ── Device unsupported warning ──
                if (!isSupported) {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = palette.primary.copy(alpha = 0.1f)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "⚠️ 当前设备不支持硬件均衡器，EQ 调节将不会生效。部分系统 ROM 会接管音效处理。",
                            color = palette.primary,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(14.dp),
                            lineHeight = 20.sp
                        )
                    }
                }

                // ── Preset Pills ──
                Text(
                    text = "音效预设",
                    color = palette.textInactive,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    EqualizerManager.PRESETS.keys.chunked(3).forEach { rowPresets ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            rowPresets.forEach { presetName ->
                                EqPresetChip(
                                    label = presetName,
                                    isSelected = viewModel.eqPreset == presetName,
                                    palette = palette,
                                    modifier = Modifier.weight(1f),
                                    onClick = { viewModel.setEqPreset(presetName) }
                                )
                            }
                            // Fill remaining slots in last row
                            repeat(3 - rowPresets.size) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }

                // ── Band Sliders ──
                Text(
                    text = "频段调节",
                    color = palette.textInactive,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )

                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = palette.surface.copy(alpha = 0.4f)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, palette.textInactive.copy(alpha = 0.08f), RoundedCornerShape(20.dp))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        // dB scale header
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            EqualizerManager.BAND_LABELS.forEachIndexed { i, label ->
                                val levelMb = viewModel.eqBandLevels.getOrElse(i) { 0 }
                                val db = levelMb / 100f
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    // dB value
                                    Text(
                                        text = if (db >= 0) "+%.1f".format(db) else "%.1f".format(db),
                                        color = if (levelMb != 0) palette.primary else palette.textMuted,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Sliders row
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            EqualizerManager.BAND_LABELS.forEachIndexed { band, label ->
                                val levelMb = viewModel.eqBandLevels.getOrElse(band) { 0 }
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center,
                                    modifier = Modifier
                                        .weight(1f)
                                        .fillMaxHeight()
                                ) {
                                    // Vertical slider achieved via graphicsLayer rotation
                                    Slider(
                                        value = levelMb.toFloat(),
                                        onValueChange = { newVal ->
                                            viewModel.setEqBandLevel(band, newVal.toInt())
                                        },
                                        valueRange = EqualizerManager.BAND_MIN_MB.toFloat()..EqualizerManager.BAND_MAX_MB.toFloat(),
                                        steps = 19, // 20 steps from -10 to +10 dB
                                        colors = SliderDefaults.colors(
                                            thumbColor = palette.primary,
                                            activeTrackColor = palette.primary,
                                            inactiveTrackColor = palette.textInactive.copy(alpha = 0.25f)
                                        ),
                                        modifier = Modifier
                                            .graphicsLayer {
                                                rotationZ = -90f
                                            }
                                            .width(160.dp)
                                    )
                                }
                            }
                        }

                        // Band frequency labels
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            EqualizerManager.BAND_LABELS.forEach { label ->
                                Text(
                                    text = label,
                                    color = palette.textMuted,
                                    fontSize = 10.sp,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }
                }

                // ── Reset Button ──
                OutlinedButton(
                    onClick = { viewModel.setEqPreset("默认") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = palette.textMuted),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp, palette.textInactive.copy(alpha = 0.25f)
                    )
                ) {
                    Text("重置为默认", fontSize = 14.sp)
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
private fun EqPresetChip(
    label: String,
    isSelected: Boolean,
    palette: HslColorPalette,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val bgColor by animateColorAsState(
        targetValue = if (isSelected) palette.softAccent.copy(alpha = 0.25f) else Color.Transparent,
        animationSpec = tween(200),
        label = "eq_chip_bg"
    )
    val borderColor by animateColorAsState(
        targetValue = if (isSelected) palette.primary else palette.textInactive.copy(alpha = 0.2f),
        animationSpec = tween(200),
        label = "eq_chip_border"
    )
    val textColor by animateColorAsState(
        targetValue = if (isSelected) palette.primary else palette.textMain,
        animationSpec = tween(200),
        label = "eq_chip_text"
    )

    Box(
        modifier = modifier
            .height(44.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(bgColor)
            .border(1.5.dp, borderColor, RoundedCornerShape(10.dp))
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = 13.sp,
            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
            textAlign = TextAlign.Center
        )
    }
}
