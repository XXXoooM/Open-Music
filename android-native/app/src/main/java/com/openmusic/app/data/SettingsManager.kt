package com.openmusic.app.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "open_music_settings")

class SettingsManager(private val context: Context) {

    private val gson = Gson()

    companion object {
        val KEY_PLAYLIST_JSON = stringPreferencesKey("playlist_json")
        val KEY_CURRENT_TRACK_INDEX = intPreferencesKey("current_track_index")
        val KEY_SELECTED_ROUTE = stringPreferencesKey("selected_route")
        val KEY_PLAYLIST_ID = stringPreferencesKey("playlist_id")
        val KEY_HSL_THEME_ENABLED = booleanPreferencesKey("hsl_theme_enabled")
        val KEY_PLAY_MODE = stringPreferencesKey("play_mode")
        val KEY_COLLECTED_PLAYLISTS_JSON = stringPreferencesKey("collected_playlists_json")
        val KEY_EQ_PRESET = stringPreferencesKey("eq_preset")
        val KEY_EQ_BAND_LEVELS = stringPreferencesKey("eq_band_levels") // JSON array of 5 ints
    }

    // Read streams mapped directly to clean Kotlin data flows
    val playlistFlow: Flow<List<Track>> = context.dataStore.data.map { preferences ->
        val json = preferences[KEY_PLAYLIST_JSON] ?: ""
        if (json.isEmpty()) emptyList() else {
            try {
                val type = object : TypeToken<List<Track>>() {}.type
                gson.fromJson(json, type)
            } catch (e: Exception) {
                emptyList()
            }
        }
    }

    val currentTrackIndexFlow: Flow<Int> = context.dataStore.data.map { preferences ->
        preferences[KEY_CURRENT_TRACK_INDEX] ?: 0
    }

    val selectedRouteFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_SELECTED_ROUTE] ?: MetingRepository.ApiRoute.QIJIEYA.name
    }

    val playlistIdFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_PLAYLIST_ID] ?: "3778678"
    }

    val hslThemeEnabledFlow: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[KEY_HSL_THEME_ENABLED] ?: true
    }

    // Write functions utilizing flow edits
    suspend fun savePlaylist(playlist: List<Track>) {
        val json = gson.toJson(playlist)
        context.dataStore.edit { preferences ->
            preferences[KEY_PLAYLIST_JSON] = json
        }
    }

    suspend fun saveCurrentTrackIndex(index: Int) {
        context.dataStore.edit { preferences ->
            preferences[KEY_CURRENT_TRACK_INDEX] = index
        }
    }

    suspend fun saveSelectedRoute(route: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_SELECTED_ROUTE] = route
        }
    }

    suspend fun savePlaylistId(id: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_PLAYLIST_ID] = id
        }
    }

    val playModeFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_PLAY_MODE] ?: "LIST_LOOP"
    }

    suspend fun saveHslThemeEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[KEY_HSL_THEME_ENABLED] = enabled
        }
    }

    suspend fun savePlayMode(mode: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_PLAY_MODE] = mode
        }
    }

    val collectedPlaylistsFlow: Flow<List<CollectedPlaylist>> = context.dataStore.data.map { preferences ->
        val json = preferences[KEY_COLLECTED_PLAYLISTS_JSON] ?: ""
        if (json.isEmpty()) emptyList() else {
            try {
                val type = object : com.google.gson.reflect.TypeToken<List<CollectedPlaylist>>() {}.type
                gson.fromJson<List<CollectedPlaylist>>(json, type) ?: emptyList()
            } catch (e: Exception) {
                emptyList()
            }
        }
    }

    suspend fun saveCollectedPlaylists(playlists: List<CollectedPlaylist>) {
        context.dataStore.edit { preferences ->
            preferences[KEY_COLLECTED_PLAYLISTS_JSON] = gson.toJson(playlists)
        }
    }

    val eqPresetFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_EQ_PRESET] ?: "默认"
    }

    val eqBandLevelsFlow: Flow<IntArray> = context.dataStore.data.map { preferences ->
        val json = preferences[KEY_EQ_BAND_LEVELS] ?: ""
        if (json.isEmpty()) IntArray(5) { 0 } else {
            try {
                val type = object : TypeToken<IntArray>() {}.type
                gson.fromJson(json, type) ?: IntArray(5) { 0 }
            } catch (e: Exception) {
                IntArray(5) { 0 }
            }
        }
    }

    suspend fun saveEqPreset(preset: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_EQ_PRESET] = preset
        }
    }

    suspend fun saveEqBandLevels(levels: IntArray) {
        context.dataStore.edit { preferences ->
            preferences[KEY_EQ_BAND_LEVELS] = gson.toJson(levels)
        }
    }
}
