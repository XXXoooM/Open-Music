package com.openmusic.app.ui.settings

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.OptIn
import coil.annotation.ExperimentalCoilApi
import com.openmusic.app.data.MetingRepository
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.theme.HslColorPalette
import coil.imageLoader

@OptIn(ExperimentalCoilApi::class)
@Composable
fun SettingsScreen(
    viewModel: MainViewModel,
    palette: HslColorPalette,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(palette.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp)
                .systemBarsPadding()
        ) {
            // Header
            Text(
                text = "设置",
                color = palette.textMain,
                fontSize = 28.sp,
                fontWeight = FontWeight.ExtraBold,
                modifier = Modifier.padding(vertical = 16.dp)
            )

            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                // Section 1: API Route Selection (网络与接口选线)
                SettingsGroup(title = "网络选线", palette = palette) {
                    Text(
                        text = "当前支持两条 API 通道。线路二更加稳定，推荐使用。",
                        color = palette.textMuted,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                    
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        MetingRepository.ApiRoute.entries.forEach { route ->
                            val isSelected = viewModel.selectedRoute == route
                            val cardBg = if (isSelected) palette.softAccent.copy(alpha = 0.25f) else Color.Transparent
                            val cardBorder = if (isSelected) palette.primary else palette.textInactive.copy(alpha = 0.15f)
                            
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(60.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(cardBg)
                                    .border(1.5.dp, cardBorder, RoundedCornerShape(12.dp))
                                    .clickable { viewModel.selectRoute(route) },
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center
                                ) {
                                    Text(
                                        text = if (route == MetingRepository.ApiRoute.QIJIEYA) "线路一" else "线路二",
                                        color = if (isSelected) palette.primary else palette.textMain,
                                        fontSize = 14.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = if (route == MetingRepository.ApiRoute.QIJIEYA) "qijieya (偶尔负载)" else "mikus (稳定)",
                                        color = if (isSelected) palette.primary.copy(alpha = 0.8f) else palette.textMuted,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Normal
                                    )
                                }
                            }
                        }
                    }
                }

                // Section 2: Personalization Module (个性化与主题)
                SettingsGroup(title = "个性化设置", palette = palette) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = null,
                            tint = palette.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "HSL 动态变色主题",
                                color = palette.textMain,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = if (viewModel.isHslThemeEnabled) "界面色调跟随播放曲目自动流动" else "已切换为极简纯白与皇家蓝主题",
                                color = palette.textMuted,
                                fontSize = 12.sp
                            )
                        }
                        Switch(
                            checked = viewModel.isHslThemeEnabled,
                            onCheckedChange = { viewModel.toggleHslTheme(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = palette.primary,
                                checkedTrackColor = palette.primary.copy(alpha = 0.35f),
                                uncheckedThumbColor = palette.textInactive,
                                uncheckedTrackColor = palette.textInactive.copy(alpha = 0.2f)
                            )
                        )
                    }
                }

                // Section 3: Cache & Memory (存储与缓存)
                SettingsGroup(title = "存储与缓存", palette = palette) {
                    SettingsRow(
                        icon = Icons.Default.Refresh,
                        title = "清除应用缓存",
                        subtitle = "释放本地图片和歌词缓存数据",
                        palette = palette,
                        onClick = {
                            try {
                                context.imageLoader.diskCache?.clear()
                                context.imageLoader.memoryCache?.clear()
                                Toast.makeText(context, "缓存数据清理成功！", Toast.LENGTH_SHORT).show()
                            } catch (e: Exception) {
                                e.printStackTrace()
                                Toast.makeText(context, "缓存清理失败，请重试", Toast.LENGTH_SHORT).show()
                            }
                        }
                    )
                }

                // Section 4: About & Disclaimers (关于与免责声明)
                SettingsGroup(title = "关于 Open Music", palette = palette) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "软件版本", color = palette.textMuted, fontSize = 13.sp)
                            Text(text = "Native Beta v1.0", color = palette.textMain, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "作者团队", color = palette.textMuted, fontSize = 13.sp)
                            Text(text = "Open Music Team", color = palette.textMain, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                        
                        HorizontalDivider(
                            color = palette.textInactive.copy(alpha = 0.15f),
                            thickness = 1.dp,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )

                        Text(
                            text = "【免责声明】",
                            color = palette.primary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "本软件是一款开源研究与交流项目。应用内所有音频、歌词、图片、歌单等数据均直接请求自第三方公开 API 接口。本软件本身不存储、不上传、不传播任何版权音频。若您喜欢，请支持正版音乐。若有侵权事宜，请联系作者进行排查。",
                            color = palette.textMuted,
                            fontSize = 11.sp,
                            lineHeight = 16.sp,
                            textAlign = TextAlign.Justify
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsGroup(
    title: String,
    palette: HslColorPalette,
    content: @Composable ColumnScope.() -> Unit
) {
    Column {
        Text(
            text = title,
            color = palette.textInactive,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 4.dp, bottom = 6.dp)
        )
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = palette.surface.copy(alpha = 0.4f)),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, palette.textInactive.copy(alpha = 0.08f), RoundedCornerShape(16.dp))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                content()
            }
        }
    }
}

@Composable
fun SettingsRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    palette: HslColorPalette,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = palette.primary,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(
                text = title,
                color = palette.textMain,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = subtitle,
                color = palette.textMuted,
                fontSize = 12.sp
            )
        }
    }
}
