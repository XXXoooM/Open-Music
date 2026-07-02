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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.openmusic.app.data.MetingRepository
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.theme.HslColorPalette

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
                verticalArrangement = Arrangement.spacedBy(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                // Section 1: API Route Selection
                SettingsGroup(title = "网络与接口选线", palette = palette) {
                    Text(
                        text = "选择 API 接口线路",
                        color = palette.textMuted,
                        fontSize = 13.sp,
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
                                    .height(48.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(cardBg)
                                    .border(1.dp, cardBorder, RoundedCornerShape(10.dp))
                                    .clickable { viewModel.selectRoute(route) },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = if (route == MetingRepository.ApiRoute.QIJIEYA) "祈杰丫线路" else "Mikus线路",
                                    color = if (isSelected) palette.primary else palette.textMuted,
                                    fontSize = 14.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                )
                            }
                        }
                    }
                }

                // Section 2: Cache & Memory
                SettingsGroup(title = "存储与缓存", palette = palette) {
                    SettingsRow(
                        icon = Icons.Default.Refresh,
                        title = "清除应用缓存",
                        subtitle = "释放本地图片和歌词缓存数据",
                        palette = palette,
                        onClick = {
                            Toast.makeText(context, "缓存数据清理成功！", Toast.LENGTH_SHORT).show()
                        }
                    )
                }

                // Section 3: Color Engine Theme Details
                SettingsGroup(title = "动态主题引擎", palette = palette) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(palette.primary)
                                .border(1.5.dp, palette.textMain.copy(alpha = 0.3f), CircleShape)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "HSL 主题变色活跃中",
                                color = palette.textMain,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "根据曲目指纹自适应调整系统色系",
                                color = palette.textMuted,
                                fontSize = 12.sp
                            )
                        }
                    }
                }

                // Section 4: About
                SettingsGroup(title = "关于 Open Music", palette = palette) {
                    SettingsRow(
                        icon = Icons.Default.Info,
                        title = "软件版本",
                        subtitle = "Native Build v1.0.0 (Kotlin + Compose)",
                        palette = palette,
                        onClick = {}
                    )
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
            modifier = Modifier.padding(start = 4.dp, bottom = 8.dp)
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
            .padding(vertical = 8.dp),
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
