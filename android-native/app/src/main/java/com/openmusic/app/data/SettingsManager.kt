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
        preferences[KEY_PLAYLIST_ID] ?: "17910751956"
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
}
