package com.algoquest.data.remote

import com.algoquest.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ==================== Auth ====================
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/google")
    suspend fun googleAuth(@Body request: GoogleAuthRequest): Response<AuthResponse>

    @POST("auth/refresh")
    suspend fun refreshToken(@Body body: Map<String, String>): Response<TokenResponse>

    @GET("auth/me")
    suspend fun getProfile(): Response<UserProfile>

    @POST("auth/sync-subscription")
    suspend fun syncSubscription(@Body request: SyncSubscriptionRequest): Response<Unit>

    // ==================== Problems ====================
    @GET("problems/search/{query}")
    suspend fun searchProblems(@Path("query") query: String): Response<List<SearchResult>>

    @GET("problems/topics")
    suspend fun getTopics(): Response<List<Topic>>

    @GET("problems/topics/{slug}")
    suspend fun getTopicProblems(@Path("slug") slug: String): Response<TopicDetail>

    @GET("problems/{slug}")
    suspend fun getProblem(@Path("slug") slug: String): Response<Problem>

    // ==================== Progress ====================
    @POST("progress/submit")
    suspend fun submitProgress(@Body request: SubmitRequest): Response<SubmitResponse>

    @POST("progress/use-heart")
    suspend fun useHeart(): Response<HeartResponse>

    @GET("progress/stats")
    suspend fun getStats(): Response<ProgressStats>

    @GET("progress/reviews")
    suspend fun getReviews(): Response<List<ProblemBrief>>

    // ==================== Leaderboard ====================
    @GET("leaderboard/weekly")
    suspend fun getWeeklyLeaderboard(): Response<WeeklyLeaderboard>

    @GET("leaderboard/alltime")
    suspend fun getAllTimeLeaderboard(): Response<List<LeaderboardEntry>>

    // ==================== Daily ====================
    @GET("daily/today")
    suspend fun getDailyChallenge(): Response<DailyChallenge>

    // ==================== Gamification ====================
    @GET("gamification/achievements")
    suspend fun getAchievements(): Response<List<AchievementFull>>

    @PATCH("gamification/settings")
    suspend fun updateSettings(@Body settings: Map<String, Any>): Response<Map<String, Any>>
}
