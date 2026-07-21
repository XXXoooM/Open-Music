package com.openmusic.app.data

import java.net.URL

class MetingRepository {

    private val apiService = MetingApiService.getInstance()

    enum class ApiRoute(val baseUrl: String) {
        QIJIEYA("https://api.qijieya.cn/meting/"),
        MIKUS("https://meting.mikus.ink/api")
    }

    suspend fun fetchPlaylist(route: ApiRoute, playlistId: String): List<Track> {
        val queryMap = mutableMapOf<String, String>()
        queryMap["type"] = "playlist"
        queryMap["id"] = playlistId

        // Mikus endpoint requires server=netease
        if (route == ApiRoute.MIKUS) {
            queryMap["server"] = "netease"
        }

        val rawList = apiService.getPlaylist(route.baseUrl, queryMap)

        // Normalize relative URLs to absolute HTTP/HTTPS links
        return rawList.map { track ->
            track.copy(
                url = normalizeUrl(route.baseUrl, track.url),
                cover = normalizeUrl(route.baseUrl, track.cover),
                lrc = normalizeUrl(route.baseUrl, track.lrc)
            )
        }
    }

    private fun normalizeUrl(baseUrl: String, path: String?): String {
        if (path.isNullOrEmpty()) return ""
        
        // Force upgrade HTTP to HTTPS for secure audio/image delivery
        var normalized = path
        if (normalized.startsWith("http://")) {
            normalized = "https://" + normalized.substring(7)
        }
        
        if (normalized.startsWith("https://")) {
            return normalized
        }
        return try {
            val apiUri = URL(baseUrl)
            val origin = "${apiUri.protocol}://${apiUri.host}"
            if (path.startsWith("/")) {
                origin + path
            } else {
                // If it's a relative path without leading slash, append directly to base
                if (baseUrl.endsWith("/") || path.startsWith("?")) {
                    baseUrl + path
                } else {
                    "$baseUrl/$path"
                }
            }
        } catch (e: Exception) {
            baseUrl + path
        }
    }
}
