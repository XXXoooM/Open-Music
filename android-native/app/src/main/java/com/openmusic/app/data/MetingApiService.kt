package com.openmusic.app.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Url
import retrofit2.http.QueryMap

interface MetingApiService {
    
    // Dynamic @Url annotation allows hitting different API endpoints seamlessly
    @GET
    suspend fun getPlaylist(
        @Url url: String,
        @QueryMap options: Map<String, String>
    ): List<Track>

    companion object {
        private var instance: MetingApiService? = null

        fun getInstance(): MetingApiService {
            if (instance == null) {
                instance = Retrofit.Builder()
                    .baseUrl("https://localhost/") // Dummy baseUrl for dynamic @Url calls
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()
                    .create(MetingApiService::class.java)
            }
            return instance!!
        }
    }
}
