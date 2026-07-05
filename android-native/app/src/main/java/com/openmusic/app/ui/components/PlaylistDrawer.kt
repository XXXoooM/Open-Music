package com.openmusic.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.Card
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.theme.HslColorPalette

@Composable
fun PlaylistDrawerContent(
    viewModel: MainViewModel,
    palette: HslColorPalette,
    onTrackSelected: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxHeight(0.6f)
            .fillMaxWidth()
            .padding(20.dp)
    ) {
        Text(
            text = "播放队列 (${viewModel.playlist.size} 首)",
            color = palette.textMain,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            itemsIndexed(viewModel.playlist) { index, track ->
                val isActive = index == viewModel.currentTrackIndex
                
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isActive) palette.softAccent.copy(alpha = 0.35f) else Color.Transparent)
                        .clickable {
                            viewModel.selectTrack(index)
                            onTrackSelected()
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
