package com.algoquest.data.remote

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import okhttp3.OkHttpClient
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

val Context.dataStore by preferencesDataStore(name = "algoquest_prefs")

object PrefsKeys {
    val ACCESS_TOKEN = stringPreferencesKey("access_token")
    val REFRESH_TOKEN = stringPreferencesKey("refresh_token")
    val USER_ID = stringPreferencesKey("user_id")
    val SEEN_ONBOARDING = stringPreferencesKey("seen_onboarding")
    val ONBOARDING_EXPERIENCE = stringPreferencesKey("onboarding_experience")
    val ONBOARDING_GOAL = stringPreferencesKey("onboarding_goal")
    val ONBOARDING_DAILY_GOAL = stringPreferencesKey("onboarding_daily_goal")
}

/**
 * Adds the auth token to every request and auto-refreshes on 401.
 */
class AuthInterceptor(private val context: Context) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = runBlocking {
            context.dataStore.data.map { it[PrefsKeys.ACCESS_TOKEN] }.first()
        }

        val request = if (token != null) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }

        val response = chain.proceed(request)

        // If we got 401, try to refresh the token and retry
        if (response.code == 401 && token != null) {
            response.close()

            val newToken = tryRefreshToken()
            if (newToken != null) {
                // Retry with new token
                val newRequest = chain.request().newBuilder()
                    .addHeader("Authorization", "Bearer $newToken")
                    .build()
                return chain.proceed(newRequest)
            } else {
                // Refresh failed — clear tokens (forces re-login)
                runBlocking {
                    context.dataStore.edit { it.clear() }
                }
            }
        }

        return response
    }

    private fun tryRefreshToken(): String? {
        return try {
            val refreshToken = runBlocking {
                context.dataStore.data.map { it[PrefsKeys.REFRESH_TOKEN] }.first()
            } ?: return null

            // Build refresh request manually (can't use Retrofit here — would be circular)
            val baseUrl = com.algoquest.BuildConfig.API_BASE_URL
            val json = JSONObject().put("refreshToken", refreshToken).toString()
            val body = json.toRequestBody("application/json".toMediaType())

            val client = OkHttpClient()
            val request = Request.Builder()
                .url("${baseUrl}auth/refresh")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string() ?: return null
                val jsonResponse = JSONObject(responseBody)
                val newAccessToken = jsonResponse.getString("accessToken")
                val newRefreshToken = jsonResponse.getString("refreshToken")

                // Save new tokens
                runBlocking {
                    context.dataStore.edit { prefs ->
                        prefs[PrefsKeys.ACCESS_TOKEN] = newAccessToken
                        prefs[PrefsKeys.REFRESH_TOKEN] = newRefreshToken
                    }
                }

                newAccessToken
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
}
