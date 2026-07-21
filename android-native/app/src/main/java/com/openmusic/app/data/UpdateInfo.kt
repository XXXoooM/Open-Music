package com.openmusic.app.data

data class UpdateInfo(
    val versionCode: Int = 1,
    val versionName: String = "1.0.0",
    val releaseNotes: String = "",
    val apkUrl: String = "",
    val webBundleUrl: String? = null,
    val isForceUpdate: Boolean = false,
    val minSupportedVersion: Int = 1
)

sealed class DownloadState {
    object Idle : DownloadState()
    data class Downloading(val progress: Int, val bytesRead: Long, val totalBytes: Long, val speedKbps: Long) : DownloadState()
    data class Completed(val apkFile: java.io.File) : DownloadState()
    data class Error(val message: String) : DownloadState()
}
