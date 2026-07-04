package com.openmusic.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.library.LibraryScreen
import com.openmusic.app.ui.favorites.FavoritesScreen
import com.openmusic.app.ui.player.PlayerScreen
import com.openmusic.app.ui.settings.SettingsScreen
import com.openmusic.app.ui.theme.HslColorPalette
import com.openmusic.app.ui.theme.OpenMusicTheme
import androidx.activity.compose.BackHandler
import com.openmusic.app.ui.theme.rememberHslPalette

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize viewModel binding
        viewModel.initialize(applicationContext)

        // Request POST_NOTIFICATIONS runtime permission on Android 13+
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 101)
        }

        setContent {
            val track = viewModel.playlist.getOrNull(viewModel.currentTrackIndex)
            val songHash = track?.title?.hashCode() ?: 0
            val targetHue = remember(songHash) { (Math.abs(songHash) % 360).toFloat() }
            val palette = rememberHslPalette(targetHue, viewModel.isHslThemeEnabled)

            OpenMusicTheme(
                statusBarColor = palette.background,
                isLightStatusBars = !palette.isHslEnabled
            ) {

                var activeTab by remember { mutableStateOf("library") }

                Scaffold(
                    bottomBar = {
                        AnimatedVisibility(
                            visible = activeTab != "player",
                            enter = slideInVertically { it },
                            exit = slideOutVertically { it }
                        ) {
                            BottomNavBar(
                                activeTab = activeTab,
                                palette = palette,
                                onTabSelected = { activeTab = it }
                            )
                        }
                    },
                    containerColor = palette.background
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(bottom = if (activeTab != "player") innerPadding.calculateBottomPadding() else 0.dp)
                    ) {
                        // Display Active screen
                        when (activeTab) {
                            "library" -> {
                                LibraryScreen(
                                    viewModel = viewModel,
                                    palette = palette,
                                    modifier = Modifier.fillMaxSize()
                                )
                            }
                            "favorites" -> {
                                FavoritesScreen(
                                    viewModel = viewModel,
                                    palette = palette,
                                    onPlaylistSelected = { activeTab = "library" },
                                    modifier = Modifier.fillMaxSize()
                                )
                            }
                            "settings" -> {
                                SettingsScreen(
                                    viewModel = viewModel,
                                    palette = palette,
                                    modifier = Modifier.fillMaxSize()
                                )
                            }
                            "player" -> {
                                PlayerScreen(
                                    viewModel = viewModel,
                                    palette = palette,
                                    onMinimize = { activeTab = "library" },
                                    modifier = Modifier.fillMaxSize()
                                )
                                // Handle back button from Player to go back to Library/Settings
                                BackHandler {
                                    activeTab = "library"
                                }
                            }
                        }

                        // Floating MiniPlayer bar shown when Player page is folded
                        if (activeTab != "player" && track != null) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.BottomCenter)
                                    .padding(bottom = 8.dp)
                            ) {
                                MiniPlayer(
                                    viewModel = viewModel,
                                    palette = palette,
                                    onClick = { activeTab = "player" }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}


@Composable
fun MiniPlayer(
    viewModel: MainViewModel,
    palette: HslColorPalette,
    onClick: () -> Unit
) {
    val track = viewModel.playlist.getOrNull(viewModel.currentTrackIndex) ?: return

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = palette.surface.copy(alpha = 0.85f)),
        modifier = Modifier
            .fillMaxWidth()
            .height(64.dp)
            .padding(horizontal = 16.dp)
            .border(1.dp, palette.primary.copy(alpha = 0.12f), RoundedCornerShape(16.dp))
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Album Art Thumbnail
            Card(
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.size(40.dp),
                border = androidx.compose.foundation.BorderStroke(0.5.dp, Color.White.copy(0.1f))
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
                            .background(palette.textInactive)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Track Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = track.title,
                    color = palette.textMain,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = track.artist,
                    color = palette.textMuted,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
            
            // Play/Pause Action
            IconButton(
                onClick = { viewModel.togglePlayPause() },
                modifier = Modifier.size(36.dp)
            ) {
                if (viewModel.isPlaying) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.size(18.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(modifier = Modifier.width(5.dp).fillMaxHeight().background(palette.primary, RoundedCornerShape(1.5.dp)))
                        Box(modifier = Modifier.width(5.dp).fillMaxHeight().background(palette.primary, RoundedCornerShape(1.5.dp)))
                    }
                } else {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null,
                        tint = palette.primary,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun BottomNavBar(
    activeTab: String,
    palette: HslColorPalette,
    onTabSelected: (String) -> Unit
) {
    NavigationBar(
        containerColor = palette.surface.copy(alpha = 0.95f),
        modifier = Modifier.height(72.dp)
    ) {
        NavigationBarItem(
            selected = activeTab == "library",
            onClick = { onTabSelected("library") },
            icon = { Icon(Icons.Default.Menu, contentDescription = "Library") },
            label = { Text("音乐馆", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = palette.primary,
                selectedTextColor = palette.primary,
                indicatorColor = palette.softAccent.copy(alpha = 0.35f),
                unselectedIconColor = palette.textInactive,
                unselectedTextColor = palette.textInactive
            )
        )

        NavigationBarItem(
            selected = activeTab == "favorites",
            onClick = { onTabSelected("favorites") },
            icon = { Icon(Icons.Default.Favorite, contentDescription = "Favorites") },
            label = { Text("收藏", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = palette.primary,
                selectedTextColor = palette.primary,
                indicatorColor = palette.softAccent.copy(alpha = 0.35f),
                unselectedIconColor = palette.textInactive,
                unselectedTextColor = palette.textInactive
            )
        )
        
        NavigationBarItem(
            selected = activeTab == "settings",
            onClick = { onTabSelected("settings") },
            icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
            label = { Text("设置", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = palette.primary,
                selectedTextColor = palette.primary,
                indicatorColor = palette.softAccent.copy(alpha = 0.35f),
                unselectedIconColor = palette.textInactive,
                unselectedTextColor = palette.textInactive
            )
        )
    }
}
