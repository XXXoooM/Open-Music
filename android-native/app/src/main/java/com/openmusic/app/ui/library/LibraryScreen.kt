package com.openmusic.app.ui.library

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.theme.HslColorPalette
import coil.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale
import com.openmusic.app.data.CollectedPlaylist
import com.openmusic.app.ui.components.EqualizerAnimation

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryScreen(
    viewModel: MainViewModel,
    palette: HslColorPalette,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var showImportDialog by remember { mutableStateOf(false) }
    var showCustomCollectDialog by remember { mutableStateOf(false) }
    var customPlaylistName by remember { mutableStateOf("") }

    val importedInfo = viewModel.lastImportedPlaylistInfo

    LaunchedEffect(importedInfo, viewModel.collectedPlaylists) {
        if (importedInfo != null && viewModel.collectedPlaylists.any { it.id == importedInfo.id }) {
            viewModel.lastImportedPlaylistInfo = null
        }
    }
    
    val filteredPlaylist = remember(viewModel.playlist, searchQuery) {
        viewModel.playlist.filter {
            it.title.contains(searchQuery, ignoreCase = true) ||
            it.artist.contains(searchQuery, ignoreCase = true)
        }
    }

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
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "音乐馆",
                    color = palette.textMain,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold
                )

                // Import Button
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(palette.primary)
                        .clickable { showImportDialog = true },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Import",
                        tint = palette.background,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            // Minimalist Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("搜索本地歌曲、歌手...", color = palette.textInactive) },
                singleLine = true,
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = palette.textMuted
                    )
                },
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = palette.textMain,
                    unfocusedTextColor = palette.textMain,
                    focusedBorderColor = palette.primary,
                    unfocusedBorderColor = palette.textInactive.copy(alpha = 0.2f),
                    focusedContainerColor = palette.surface.copy(alpha = 0.6f),
                    unfocusedContainerColor = palette.surface.copy(alpha = 0.4f)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            )


            // Tracks List
            if (filteredPlaylist.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = if (searchQuery.isEmpty()) "空空如也，点击右上角导入歌单 ♫" else "没有找到符合搜索条件的歌曲",
                        color = palette.textInactive,
                        fontSize = 14.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(bottom = 80.dp), // Leaves spacing for MiniPlayer
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    itemsIndexed(filteredPlaylist) { index, track ->
                        val originalIndex = viewModel.playlist.indexOf(track)
                        val isActive = originalIndex == viewModel.currentTrackIndex
                        
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isActive) palette.softAccent.copy(alpha = 0.35f) else Color.Transparent)
                                .clickable {
                                    if (originalIndex != -1) {
                                        viewModel.selectTrack(originalIndex)
                                    }
                                }
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Left indicator column: Equalizer for active track, Index Number for inactive tracks
                            Box(
                                modifier = Modifier.width(28.dp).padding(end = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                if (isActive) {
                                    if (viewModel.isPlaying) {
                                        EqualizerAnimation(color = palette.primary)
                                    } else {
                                        // Static 4-bar equalizer wave when paused
                                        Row(
                                            modifier = Modifier.width(20.dp).height(14.dp),
                                            horizontalArrangement = Arrangement.spacedBy(2.dp),
                                            verticalAlignment = Alignment.Bottom
                                        ) {
                                            Box(modifier = Modifier.weight(1f).fillMaxHeight(0.35f).background(palette.primary, RoundedCornerShape(1.dp)))
                                            Box(modifier = Modifier.weight(1f).fillMaxHeight(0.75f).background(palette.primary, RoundedCornerShape(1.dp)))
                                            Box(modifier = Modifier.weight(1f).fillMaxHeight(0.50f).background(palette.primary, RoundedCornerShape(1.dp)))
                                            Box(modifier = Modifier.weight(1f).fillMaxHeight(0.20f).background(palette.primary, RoundedCornerShape(1.dp)))
                                        }
                                    }
                                } else {
                                    Text(
                                        text = "${index + 1}",
                                        color = palette.textInactive,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            // Cover Art Card (Clean perfect square)
                            Card(
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.size(44.dp)
                            ) {
                                if (track.cover.isNotEmpty()) {
                                    AsyncImage(
                                        model = track.cover,
                                        contentDescription = null,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .background(palette.textInactive.copy(alpha = 0.3f))
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(12.dp))

                            // Title and Artist Column
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = track.title,
                                    color = if (isActive) palette.primary else palette.textMain,
                                    fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 15.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = track.artist,
                                    color = if (isActive) palette.primary.copy(alpha = 0.7f) else palette.textMuted,
                                    fontSize = 12.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }
            }
        }

        // Frosted Glass Import Dialog
        if (showImportDialog) {
            var importInput by remember { mutableStateOf("") }
            
            AlertDialog(
                onDismissRequest = { showImportDialog = false },
                containerColor = palette.surface,
                title = {
                    Text(
                        text = "导入歌单",
                        color = palette.textMain,
                        fontWeight = FontWeight.Bold
                    )
                },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(
                            text = "请输入歌单 ID 或网易云分享网页链接：",
                            color = palette.textMuted,
                            fontSize = 13.sp
                        )
                        OutlinedTextField(
                            value = importInput,
                            onValueChange = { importInput = it },
                            placeholder = { Text("粘贴链接或输入ID", color = palette.textInactive) },
                            singleLine = true,
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Share,
                                    contentDescription = null,
                                    tint = palette.textInactive
                                )
                            },
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = palette.textMain,
                                unfocusedTextColor = palette.textMain,
                                focusedBorderColor = palette.primary,
                                unfocusedBorderColor = palette.textInactive.copy(alpha = 0.2f)
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val parsedId = extractPlaylistId(importInput)
                            if (parsedId.isNotEmpty()) {
                                viewModel.loadPlaylist(parsedId)
                                showImportDialog = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = palette.primary)
                    ) {
                        Text("解析导入", color = palette.background, fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(
                        onClick = { showImportDialog = false }
                    ) {
                        Text("取消", color = palette.textMuted)
                    }
                }
            )
        }

        // Dialog 1: Ask whether to collect this imported playlist
        if (importedInfo != null && !showCustomCollectDialog) {
            AlertDialog(
                onDismissRequest = { viewModel.lastImportedPlaylistInfo = null },
                containerColor = palette.surface,
                title = {
                    Text(
                        text = "收藏歌单",
                        color = palette.textMain,
                        fontWeight = FontWeight.Bold
                    )
                },
                text = {
                    Text(
                        text = "是否要将此导入的歌单加入收藏？",
                        color = palette.textMuted,
                        fontSize = 14.sp
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            customPlaylistName = "新歌单 " + importedInfo.id
                            showCustomCollectDialog = true
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = palette.primary)
                    ) {
                        Text("是", color = palette.background, fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(
                        onClick = { viewModel.lastImportedPlaylistInfo = null }
                    ) {
                        Text("否", color = palette.textMuted)
                    }
                }
            )
        }

        // Dialog 2: Custom details dialog for inputting playlist name and viewing ID & cover
        if (importedInfo != null && showCustomCollectDialog) {
            AlertDialog(
                onDismissRequest = {
                    showCustomCollectDialog = false
                    viewModel.lastImportedPlaylistInfo = null
                },
                containerColor = palette.surface,
                title = {
                    Text(
                        text = "新建收藏歌单",
                        color = palette.textMain,
                        fontWeight = FontWeight.Bold
                    )
                },
                text = {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        // Display Cover Art and ID
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Card(
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.size(64.dp)
                            ) {
                                if (importedInfo.firstTrackCover.isNotEmpty()) {
                                    AsyncImage(
                                        model = importedInfo.firstTrackCover,
                                        contentDescription = null,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .background(palette.textInactive.copy(alpha = 0.3f))
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text(
                                    text = "歌单 ID",
                                    color = palette.textMuted,
                                    fontSize = 12.sp
                                )
                                Text(
                                    text = importedInfo.id,
                                    color = palette.textMain,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        // Input field for playlist name
                        OutlinedTextField(
                            value = customPlaylistName,
                            onValueChange = { customPlaylistName = it },
                            label = { Text("歌单名称", color = palette.textInactive) },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = palette.textMain,
                                unfocusedTextColor = palette.textMain,
                                focusedBorderColor = palette.primary,
                                unfocusedBorderColor = palette.textInactive.copy(alpha = 0.2f)
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            if (customPlaylistName.trim().isNotEmpty()) {
                                viewModel.collectPlaylist(
                                    id = importedInfo.id,
                                    name = customPlaylistName.trim(),
                                    cover = importedInfo.firstTrackCover
                                )
                            }
                            showCustomCollectDialog = false
                            viewModel.lastImportedPlaylistInfo = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = palette.primary)
                    ) {
                        Text("确定", color = palette.background, fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(
                        onClick = {
                            showCustomCollectDialog = false
                            viewModel.lastImportedPlaylistInfo = null
                        }
                    ) {
                        Text("取消", color = palette.textMuted)
                    }
                }
            )
        }
    }
}



/**
 * High-performance URL parser that extracts the query parameter "id"
 * from standard web urls and fragment urls (e.g. /#/discover/toplist?id=3779629)
 */
fun extractPlaylistId(input: String): String {
    val trimmed = input.trim()
    
    // 1. Check if it's a raw numeric string
    if (trimmed.matches(Regex("^\\d+$"))) {
        return trimmed
    }
    
    // 2. Matches id=xxxx query parameter (works for normal queries and hash parameters like toplist?id=xxxx)
    val queryRegex = Regex("[?&]id=(\\d+)")
    val queryMatch = queryRegex.find(trimmed)
    if (queryMatch != null) {
        return queryMatch.groupValues[1]
    }
    
    // 3. Matches /playlist/xxxx or /toplist/xxxx or /album/xxxx in path
    val pathRegex = Regex("/(playlist|toplist|album)/(\\d+)")
    val pathMatch = pathRegex.find(trimmed)
    if (pathMatch != null) {
        return pathMatch.groupValues[2]
    }
    
    // 4. Fallback: match any sequence of 5 to 15 digits in the string (Netease IDs are typically 9-11 digits)
    val fallbackRegex = Regex("\\b(\\d{5,15})\\b")
    val fallbackMatch = fallbackRegex.find(trimmed)
    if (fallbackMatch != null) {
        return fallbackMatch.groupValues[1]
    }
    
    return trimmed
}

