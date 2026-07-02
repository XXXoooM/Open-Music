package com.openmusic.app.ui.search

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.openmusic.app.data.MetingRepository
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.components.LiquidBackdrop
import com.openmusic.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    viewModel: MainViewModel,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var inputVal by remember { mutableStateOf(viewModel.playlistIdInput) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(RichBlack)
    ) {
        // 1. Dynamic Liquid Backgound
        LiquidBackdrop(
            primaryColor = NeonMint,
            secondaryColor = Color(0xFF1E88E5), // Premium Slate Blue
            modifier = Modifier.fillMaxSize()
        )
        
        // Deep overlay wash
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Black.copy(alpha = 0.45f),
                            RichBlack.copy(alpha = 0.82f),
                            RichBlack
                        )
                    )
                )
        )

        // 2. Content Layout
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .systemBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 32.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier.background(Color.Black.copy(0.25f), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = TextMain
                    )
                }
                
                Text(
                    text = "导入歌单",
                    color = TextMain,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(start = 12.dp)
                )
            }

            // 1. Endpoint Route Selector
            Text(
                text = "选择 API 接口线路",
                color = TextMuted,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 28.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                MetingRepository.ApiRoute.entries.forEach { route ->
                    val isSelected = viewModel.selectedRoute == route
                    val bgColor = if (isSelected) SoftMint.copy(alpha = 0.15f) else TranslucentCard
                    val borderColor = if (isSelected) NeonMint else CharcoalGray
                    
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(bgColor)
                            .border(
                                width = 1.5.dp,
                                color = borderColor,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .clickable { viewModel.selectRoute(route) },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (route == MetingRepository.ApiRoute.QIJIEYA) "祈杰丫线路" else "Mikus线路",
                            color = if (isSelected) NeonMint else TextMuted,
                            fontSize = 14.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }

            // 2. Playlist Input Section
            Text(
                text = "输入歌单 ID 或粘贴分享链接",
                color = TextMuted,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
            )

            OutlinedTextField(
                value = inputVal,
                onValueChange = { inputVal = it },
                placeholder = { Text("例如：3779629 或粘贴网页链接", color = TextInactive) },
                singleLine = true,
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Link icon",
                        tint = TextInactive
                    )
                },
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = TextMain,
                    unfocusedTextColor = TextMain,
                    focusedBorderColor = NeonMint,
                    unfocusedBorderColor = CharcoalGray,
                    focusedContainerColor = TranslucentCard,
                    unfocusedContainerColor = TranslucentCard
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 28.dp)
            )

            // 3. Load Action Button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(NeonMint, NeonMint.copy(alpha = 0.85f))
                        )
                    )
                    .clickable(enabled = !viewModel.isLoading) {
                        val parsedId = extractPlaylistId(inputVal)
                        viewModel.loadPlaylist(parsedId)
                    },
                contentAlignment = Alignment.Center
            ) {
                if (viewModel.isLoading) {
                    CircularProgressIndicator(
                        color = RichBlack,
                        modifier = Modifier.size(24.dp)
                    )
                } else {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = null,
                            tint = RichBlack
                        )
                        Text(
                            text = "解析并载入歌单",
                            color = RichBlack,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            // 4. Currently Loaded Playlist status
            if (viewModel.playlist.isNotEmpty()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = TranslucentCard),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color.White.copy(0.1f), RoundedCornerShape(16.dp))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "当前已载入歌单",
                                color = TextMuted,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "歌单 ID: ${viewModel.playlistIdInput}",
                                color = TextMain,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "共包含 ${viewModel.playlist.size} 首歌曲",
                                color = TextInactive,
                                fontSize = 13.sp
                            )
                        }
                        
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(SoftMint)
                                .clickable { onBackClick() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Play",
                                tint = NeonMint,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * High-performance URL parser that extracts the query parameter "id"
 * from standard web urls and fragment urls (e.g. /#/discover/toplist?id=3779629)
 */
fun extractPlaylistId(input: String): String {
    val trimmed = input.trim()
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return try {
            val uri = Uri.parse(trimmed)
            
            // Check fragment query parameters (e.g. /#/discover/toplist?id=3779629)
            val fragment = uri.fragment
            if (!fragment.isNullOrEmpty() && fragment.contains("id=")) {
                val idParam = fragment.split("&", "?").find { it.startsWith("id=") || it.contains("?id=") }
                if (idParam != null) {
                    val cleanParam = if (idParam.contains("?")) idParam.split("?")[1] else idParam
                    return cleanParam.split("=").getOrNull(1) ?: trimmed
                }
            }
            
            // Check standard query parameters (e.g. ?id=12345)
            val queryId = uri.getQueryParameter("id")
            if (!queryId.isNullOrEmpty()) {
                return queryId
            }
            
            // Check path-based ID (e.g. music.163.com/playlist/12345)
            val pathSegments = uri.pathSegments
            val playlistIndex = pathSegments.indexOf("playlist")
            if (playlistIndex != -1 && playlistIndex + 1 < pathSegments.size) {
                return pathSegments[playlistIndex + 1]
            }
            
            trimmed
        } catch (e: Exception) {
            trimmed
        }
    }
    return trimmed
}
