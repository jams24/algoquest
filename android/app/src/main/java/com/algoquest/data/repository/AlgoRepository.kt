package com.algoquest.data.repository

import android.content.Context
import androidx.datastore.preferences.core.edit
import com.algoquest.data.local.CachedProblem
import com.algoquest.data.local.CachedTopic
import com.algoquest.data.local.ProblemDao
import com.algoquest.data.local.TopicDao
import com.algoquest.data.model.*
import com.algoquest.data.remote.ApiService
import com.algoquest.data.remote.PrefsKeys
import com.algoquest.data.remote.dataStore
import com.algoquest.data.subscription.SubscriptionManager
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AlgoRepository @Inject constructor(
    private val api: ApiService,
    private val topicDao: TopicDao,
    private val problemDao: ProblemDao,
    private val subscriptionManager: SubscriptionManager,
    @ApplicationContext private val context: Context
) {
    private val gson = Gson()

    // ==================== Auth ====================
    suspend fun register(email: String, username: String, password: String): Result<AuthResponse> {
        return try {
            val response = api.register(RegisterRequest(email, username, password))
            if (response.isSuccessful) {
                val body = response.body()!!
                saveTokens(body.accessToken, body.refreshToken, body.user.id)
                subscriptionManager.loginUser(body.user.id)
                Result.success(body)
            } else {
                Result.failure(Exception("Registration failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful) {
                val body = response.body()!!
                saveTokens(body.accessToken, body.refreshToken, body.user.id)
                subscriptionManager.loginUser(body.user.id)
                Result.success(body)
            } else {
                Result.failure(Exception("Invalid credentials"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun googleAuth(idToken: String): Result<AuthResponse> {
        return try {
            val response = api.googleAuth(GoogleAuthRequest(idToken))
            if (response.isSuccessful) {
                val body = response.body()!!
                saveTokens(body.accessToken, body.refreshToken, body.user.id)
                subscriptionManager.loginUser(body.user.id)
                Result.success(body)
            } else {
                Result.failure(Exception("Google sign-in failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProfile(): Result<UserProfile> = apiCall { api.getProfile() }

    suspend fun logout() {
        subscriptionManager.logoutUser()
        context.dataStore.edit { it.clear() }
    }

    // ==================== Topics (with offline cache) ====================
    suspend fun getTopics(): Result<List<Topic>> {
        // Try network first
        val networkResult = apiCall { api.getTopics() }
        if (networkResult.isSuccess) {
            // Cache to Room
            val topics = networkResult.getOrNull() ?: emptyList()
            try {
                topicDao.insertAll(topics.map {
                    CachedTopic(it.id, it.name, it.slug, it.description, it.icon,
                        it.color, it.order, it.totalProblems, it.completedProblems, it.isUnlocked)
                })
            } catch (_: Exception) { }
            return networkResult
        }

        // Fallback to cache
        return try {
            val cached = topicDao.getAllTopics()
            if (cached.isNotEmpty()) {
                Result.success(cached.map {
                    Topic(it.id, it.name, it.slug, it.description, it.icon,
                        it.color, it.order, it.totalProblems, it.completedProblems, it.isUnlocked)
                })
            } else {
                networkResult // Return original error
            }
        } catch (e: Exception) {
            networkResult
        }
    }

    suspend fun searchProblems(query: String): Result<List<SearchResult>> = apiCall { api.searchProblems(query) }

    suspend fun getTopicProblems(slug: String): Result<TopicDetail> = apiCall { api.getTopicProblems(slug) }

    // ==================== Problems (with offline cache) ====================
    suspend fun getProblem(slug: String): Result<Problem> {
        // Try network first
        val networkResult = apiCall { api.getProblem(slug) }
        if (networkResult.isSuccess) {
            // Cache to Room
            val problem = networkResult.getOrNull()
            if (problem != null) {
                try {
                    problemDao.insert(CachedProblem(slug, gson.toJson(problem)))
                } catch (_: Exception) { }
            }
            return networkResult
        }

        // Fallback to cache
        return try {
            val cached = problemDao.getProblem(slug)
            if (cached != null) {
                val problem = gson.fromJson(cached.jsonData, Problem::class.java)
                Result.success(problem)
            } else {
                networkResult
            }
        } catch (e: Exception) {
            networkResult
        }
    }

    // ==================== Progress ====================
    suspend fun submitProgress(problemId: String, stage: Int, score: Int, perfect: Boolean): Result<SubmitResponse> =
        apiCall { api.submitProgress(SubmitRequest(problemId, stage, score, perfect)) }

    suspend fun useHeart(): Result<HeartResponse> = apiCall { api.useHeart() }

    suspend fun getStats(): Result<ProgressStats> = apiCall { api.getStats() }

    suspend fun getReviews(): Result<List<ProblemBrief>> = apiCall { api.getReviews() }

    // ==================== Leaderboard ====================
    suspend fun getWeeklyLeaderboard(): Result<WeeklyLeaderboard> = apiCall { api.getWeeklyLeaderboard() }

    // ==================== Daily ====================
    suspend fun getDailyChallenge(): Result<DailyChallenge> = apiCall { api.getDailyChallenge() }

    // ==================== Gamification ====================
    suspend fun getAchievements(): Result<List<AchievementFull>> = apiCall { api.getAchievements() }

    // ==================== Helpers ====================
    private suspend fun <T> apiCall(call: suspend () -> retrofit2.Response<T>): Result<T> {
        return try {
            val response = call()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("API error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun saveTokens(accessToken: String, refreshToken: String, userId: String) {
        context.dataStore.edit { prefs ->
            prefs[PrefsKeys.ACCESS_TOKEN] = accessToken
            prefs[PrefsKeys.REFRESH_TOKEN] = refreshToken
            prefs[PrefsKeys.USER_ID] = userId
        }
    }
}
