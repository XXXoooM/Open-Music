package com.openmusic.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.openmusic.app.ui.MainViewModel
import com.openmusic.app.ui.player.PlayerScreen
import com.openmusic.app.ui.search.SearchScreen
import com.openmusic.app.ui.theme.OpenMusicTheme

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Bind ViewModel with context to allow DataStore and MediaController integration
        viewModel.initialize(applicationContext)

        setContent {
            OpenMusicTheme {
                var currentScreen by remember { mutableStateOf("player") }

                if (currentScreen == "player") {
                    PlayerScreen(
                        viewModel = viewModel,
                        onSearchClick = { currentScreen = "search" },
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    SearchScreen(
                        viewModel = viewModel,
                        onBackClick = { currentScreen = "player" },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
}
