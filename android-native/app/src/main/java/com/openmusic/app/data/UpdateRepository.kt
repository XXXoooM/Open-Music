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

    // Default release manifest URL endpoint (GitHub Releases / OSS Endpoint)
    private val defaultManifestUrl = "https://raw.githubusercontent.com/XXXoooM/Open-Music/main/version.json"

    /**
     * Checks remote version.json manifest
     */
    suspend fun checkUpdate(manifestUrl: String = defaultManifestUrl): UpdateInfo? {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL(manifestUrl)
                val connection = (url.openConnection() as HttpURLConnection).apply {
                    connectTimeout = 8000
                    readTimeout = 8000
                    requestMethod = "GET"
                }

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    val jsonStr = connection.inputStream.bufferedReader().use { it.readText() }
                    val json = JSONObject(jsonStr)
                    UpdateInfo(
                        versionCode = json.optInt("versionCode", 1),
                        versionName = json.optString("versionName", "1.0.0"),
                        releaseNotes = json.optString("releaseNotes", ""),
                        apkUrl = json.optString("apkUrl", ""),
                        webBundleUrl = json.optString("webBundleUrl", null),
                        isForceUpdate = json.optBoolean("isForceUpdate", false),
                        minSupportedVersion = json.optInt("minSupportedVersion", 1)
                    )
                } else {
                    null
                }
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
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
