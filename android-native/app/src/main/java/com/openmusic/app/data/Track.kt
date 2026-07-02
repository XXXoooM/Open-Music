package com.openmusic.app.data

import com.google.gson.annotations.SerializedName

data class Track(
    @SerializedName("title") val title: String = "",
    @SerializedName("author") val artist: String = "",
    @SerializedName("url") val url: String = "",
    @SerializedName("pic") val cover: String = "",
    @SerializedName("lrc") val lrc: String = ""
)
