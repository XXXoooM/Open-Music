package com.openmusic.app.data

import java.util.regex.Pattern

object LyricParser {
    
    // Time regex handles [mm:ss.xx] and [mm:ss:xx] formats, accommodating various LRC dialects
    private val timePattern = Pattern.compile("\\[(\\d{2}):(\\d{2})[.:](\\d{2,3})\\]")

    fun parse(lrcText: String?): List<LyricLine> {
        if (lrcText.isNullOrEmpty()) return emptyList()
        
        val lyricLines = mutableListOf<LyricLine>()
        val lines = lrcText.split("\n")

        for (rawLine in lines) {
            val line = rawLine.trim()
            if (line.isEmpty()) continue

            val matcher = timePattern.matcher(line)
            val timeTags = mutableListOf<String>()
            var cleanLine = line

            // Extract all time tags and strip them from the line content
            while (matcher.find()) {
                val tag = matcher.group()
                timeTags.add(tag)
                cleanLine = cleanLine.replace(tag, "")
            }

            cleanLine = cleanLine.trim()

            // Parse each time tag and pair it with the line text
            for (tag in timeTags) {
                val tagMatcher = timePattern.matcher(tag)
                if (tagMatcher.matches()) {
                    val minutes = tagMatcher.group(1)?.toIntOrNull() ?: 0
                    val seconds = tagMatcher.group(2)?.toIntOrNull() ?: 0
                    val msStr = tagMatcher.group(3) ?: "00"
                    var milliseconds = msStr.toIntOrNull() ?: 0
                    
                    // Normalize two-digit milliseconds (e.g. .70 -> 700ms)
                    if (msStr.length == 2) {
                        milliseconds *= 10
                    }
                    
                    val time = minutes * 60f + seconds + milliseconds / 1000f
                    lyricLines.add(LyricLine(time, cleanLine.ifEmpty { "♫" }))
                }
            }
        }

        // Sort chronologically
        return lyricLines.sortedBy { it.time }
    }
}
