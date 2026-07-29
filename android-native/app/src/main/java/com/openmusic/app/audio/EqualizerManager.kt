package com.openmusic.app.audio

import android.media.audiofx.Equalizer
import android.util.Log

/**
 * EqualizerManager — Singleton wrapper around Android's native [Equalizer] AudioFX API.
 *
 * Lifecycle:
 *  - [initialize] is called from [PlaybackService.onCreate] with ExoPlayer's audioSessionId.
 *  - [release] is called from [PlaybackService.onDestroy].
 *
 * All public methods are safe to call before [initialize] (they no-op gracefully).
 * All operations are wrapped in try-catch to prevent crashes on devices with limited AudioFX support.
 *
 * Frequency bands (approximate center frequencies at 44.1kHz sample rate):
 *  Band 0 —  60 Hz  (Sub-bass)
 *  Band 1 — 230 Hz  (Bass)
 *  Band 2 — 910 Hz  (Mid)
 *  Band 3 — 3.6 kHz (Presence)
 *  Band 4 —  14 kHz (Brilliance)
 */
object EqualizerManager {

    private const val TAG = "EqualizerManager"

    // Millibel range — most Android Equalizer implementations support ±1500 mB
    const val BAND_MIN_MB = -1000  // -10 dB in milliBels
    const val BAND_MAX_MB = 1000   // +10 dB in milliBels
    const val NUM_BANDS = 5

    /** Human-readable center frequency labels for the 5 bands. */
    val BAND_LABELS = listOf("60 Hz", "230 Hz", "910 Hz", "3.6K", "14K")

    /**
     * Predefined EQ presets. Each entry maps a display name to an array of
     * 5 band levels in milliBels (-1000 to +1000).
     */
    val PRESETS: Map<String, IntArray> = linkedMapOf(
        "默认"    to intArrayOf(0, 0, 0, 0, 0),
        "流行"    to intArrayOf(100, 200, 0, 100, 200),
        "古典"    to intArrayOf(400, 200, -200, 200, 400),
        "电子"    to intArrayOf(400, 300, 0, 300, 400),
        "人声增强" to intArrayOf(-200, 0, 400, 300, -100),
        "低音增强" to intArrayOf(600, 400, 0, 0, 0),
    )

    private var equalizer: Equalizer? = null

    /** Current preset name. Updated by [applyPreset] or [setBandLevel]. */
    var currentPreset: String = "默认"
        private set

    /** Current levels for each band (milliBels). Updated by [applyPreset] or [setBandLevel]. */
    val bandLevels: IntArray = IntArray(NUM_BANDS) { 0 }

    /** Whether the Equalizer hardware was successfully initialized on this device. */
    var isSupported: Boolean = false
        private set

    /**
     * Initializes the Equalizer with the given [audioSessionId].
     * Safe to call multiple times; re-initializes if called again.
     */
    fun initialize(audioSessionId: Int) {
        release() // Release any previous instance
        try {
            val eq = Equalizer(0, audioSessionId)
            eq.enabled = true
            equalizer = eq
            isSupported = true
            Log.d(TAG, "Equalizer initialized. Bands: ${eq.numberOfBands}, Range: ${eq.bandLevelRange.contentToString()}")
            // Re-apply current state in case service was restarted
            applyBandLevels()
        } catch (e: Exception) {
            Log.w(TAG, "Equalizer not supported on this device: ${e.message}")
            isSupported = false
        }
    }

    /**
     * Applies one of the named [PRESETS] by name.
     * Updates [currentPreset] and [bandLevels], then pushes all band levels to hardware.
     */
    fun applyPreset(presetName: String) {
        val levels = PRESETS[presetName] ?: return
        currentPreset = presetName
        levels.copyInto(bandLevels)
        applyBandLevels()
    }

    /**
     * Sets a single EQ band level in milliBels.
     * Clamps the value to [BAND_MIN_MB]..[BAND_MAX_MB].
     * Sets [currentPreset] to "自定义" to reflect manual adjustment.
     */
    fun setBandLevel(band: Int, levelMb: Int) {
        if (band !in 0 until NUM_BANDS) return
        bandLevels[band] = levelMb.coerceIn(BAND_MIN_MB, BAND_MAX_MB)
        currentPreset = "自定义"
        try {
            equalizer?.setBandLevel(band.toShort(), bandLevels[band].toShort())
        } catch (e: Exception) {
            Log.w(TAG, "Failed to set band $band: ${e.message}")
        }
    }

    /**
     * Pushes all current [bandLevels] values to the hardware Equalizer.
     */
    private fun applyBandLevels() {
        val eq = equalizer ?: return
        try {
            for (i in 0 until NUM_BANDS) {
                eq.setBandLevel(i.toShort(), bandLevels[i].toShort())
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to apply band levels: ${e.message}")
        }
    }

    /**
     * Releases the Equalizer hardware resource.
     * Called automatically from [PlaybackService.onDestroy].
     */
    fun release() {
        try {
            equalizer?.release()
        } catch (e: Exception) {
            Log.w(TAG, "Error releasing equalizer: ${e.message}")
        } finally {
            equalizer = null
            isSupported = false
        }
    }
}
