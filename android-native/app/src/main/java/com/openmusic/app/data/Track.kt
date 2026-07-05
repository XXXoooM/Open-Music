package com.openmusic.app.data

import com.google.gson.annotations.SerializedName

data class Track(
    @SerializedName("id") val id: String = "",
    @SerializedName(value = "title", alternate = ["name"]) val title: String = "",
    @SerializedName(value = "author", alternate = ["artist"]) val artist: String = "",
    @SerializedName("url") val url: String = "",
    @SerializedName("pic") val cover: String = "",
    @SerializedName("lrc") val lrc: String = ""
)

data class CollectedPlaylist(
    @SerializedName("id") val id: String = "",
    @SerializedName("name") val name: String = "",
    @SerializedName("cover") val cover: String = ""
)
