package com.openmusic.app.data

data class LyricLine(
    val time: Long, // Time offset in milliseconds (Long for precision, eliminates Float rounding errors)
    val text: String
)
