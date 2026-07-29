package com.openmusic.app.data

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

class UpdateRepository {

    private val githubApiUrl = "https://api.github.com/repos/XXXoooM/Open-Music/releases/latest"
    private val defaultManifestUrl = "https://raw.githubusercontent.com/XXXoooM/Open-Music/Beta-v1.0/version.json"

    /**
     * Checks remote release using GitHub Releases API first, falling back to version.json.
     */
    suspend fun checkUpdate(manifestUrl: String = defaultManifestUrl): UpdateInfo? {
        return withContext(Dispatchers.IO) {
            // 1. Try GitHub Releases Latest API first for instant, zero-delay release detection
            val fromGithub = fetchFromGithubReleases()
            if (fromGithub != null) {
                return@withContext fromGithub
            }

            // 2. Fallback to raw version.json manifest with timestamp cache buster
            val cacheBusterUrl = if (manifestUrl.contains("?")) manifestUrl else "$manifestUrl?t=${System.currentTimeMillis()}"
            fetchFromManifestUrl(cacheBusterUrl)
        }
    }

    private fun fetchFromGithubReleases(): UpdateInfo? {
        try {
            val url = URL(githubApiUrl)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 8000
                readTimeout = 8000
                requestMethod = "GET"
                setRequestProperty("User-Agent", "OpenMusicApp")
                setRequestProperty("Accept", "application/vnd.github.v3+json")
            }

            if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                val jsonStr = connection.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(jsonStr)
                val tagName = json.optString("tag_name", "")
                val versionName = tagName.removePrefix("v").removePrefix("V")
                val versionCode = parseVersionCodeFromTag(tagName)
                val releaseNotes = json.optString("body", "")

                var apkUrl = ""
                val assets = json.optJSONArray("assets")
                if (assets != null) {
                    for (i in 0 until assets.length()) {
                        val asset = assets.getJSONObject(i)
                        val name = asset.optString("name", "")
                        val downloadUrl = asset.optString("browser_download_url", "")
                        if (name.endsWith(".apk", ignoreCase = true) || downloadUrl.endsWith(".apk", ignoreCase = true)) {
                            apkUrl = downloadUrl
                            break
                        }
                    }
                }

                if (apkUrl.isNotEmpty() && versionCode > 0) {
                    return UpdateInfo(
                        versionCode = versionCode,
                        versionName = versionName,
                        releaseNotes = releaseNotes,
                        apkUrl = apkUrl,
                        webBundleUrl = null,
                        isForceUpdate = false,
                        minSupportedVersion = 100
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return null
    }

    private fun fetchFromManifestUrl(manifestUrl: String): UpdateInfo? {
        try {
            val url = URL(manifestUrl)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 8000
                readTimeout = 8000
                requestMethod = "GET"
                setRequestProperty("User-Agent", "OpenMusicApp")
            }

            if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                val jsonStr = connection.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(jsonStr)
                return UpdateInfo(
                    versionCode = json.optInt("versionCode", 1),
                    versionName = json.optString("versionName", "1.0.0"),
                    releaseNotes = json.optString("releaseNotes", ""),
                    apkUrl = json.optString("apkUrl", ""),
                    webBundleUrl = if (json.has("webBundleUrl")) json.optString("webBundleUrl") else null,
                    isForceUpdate = json.optBoolean("isForceUpdate", false),
                    minSupportedVersion = json.optInt("minSupportedVersion", 1)
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return null
    }

    private fun parseVersionCodeFromTag(tag: String): Int {
        val clean = tag.removePrefix("v").removePrefix("V").trim()
        val parts = clean.split(".")
        if (parts.size >= 3) {
            val major = parts[0].toIntOrNull() ?: 1
            val minor = parts[1].toIntOrNull() ?: 0
            val patch = parts[2].toIntOrNull() ?: 0
            return major * 100 + minor * 10 + patch
        }
        return 1
    }

    /**
     * Downloads APK with real-time percentage and speed flow
     */
    fun downloadApk(context: Context, apkUrl: String): Flow<DownloadState> = flow {
        emit(DownloadState.Downloading(0, 0, 0, 0))

        try {
            val destinationFile = File(context.filesDir, "update_latest.apk")
            if (destinationFile.exists()) {
                destinationFile.delete()
            }

            val url = URL(apkUrl)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 12000
                readTimeout = 12000
                requestMethod = "GET"
                setRequestProperty("User-Agent", "OpenMusicApp")
            }

            if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                emit(DownloadState.Error("服务器响应异常: ${connection.responseCode}"))
                return@flow
            }

            val totalBytes = connection.contentLength.toLong()
            var bytesReadTotal = 0L
            var lastEmittedTime = System.currentTimeMillis()
            var bytesSinceLastEmit = 0L

            val inputStream: InputStream = connection.inputStream
            val outputStream = FileOutputStream(destinationFile)
            val buffer = ByteArray(8192)
            var bytesRead: Int

            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
                bytesReadTotal += bytesRead
                bytesSinceLastEmit += bytesRead

                val currentTime = System.currentTimeMillis()
                val timeDiff = currentTime - lastEmittedTime

                if (timeDiff >= 300 || bytesReadTotal == totalBytes) {
                    val progress = if (totalBytes > 0) ((bytesReadTotal * 100) / totalBytes).toInt() else 0
                    val speedKbps = if (timeDiff > 0) (bytesSinceLastEmit / 1024) * 1000 / timeDiff else 0

                    emit(DownloadState.Downloading(progress, bytesReadTotal, totalBytes, speedKbps))

                    lastEmittedTime = currentTime
                    bytesSinceLastEmit = 0L
                }
            }

            outputStream.flush()
            outputStream.close()
            inputStream.close()

            emit(DownloadState.Completed(destinationFile))
        } catch (e: Exception) {
            e.printStackTrace()
            emit(DownloadState.Error("下载中断: ${e.localizedMessage ?: "网络连接失败"}"))
        }
    }.flowOn(Dispatchers.IO)
}
