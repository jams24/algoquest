package com.algoquest.data.model

import com.google.gson.annotations.SerializedName

// ==================== Auth ====================
data class RegisterRequest(val email: String, val username: String, val password: String)
data class SyncSubscriptionRequest(val isPro: Boolean, val expirationDate: String?, val productId: String?)

class SubscriptionRequiredException : Exception("Subscription required")
data class LoginRequest(val email: String, val password: String)
data class GoogleAuthRequest(val idToken: String)
data class AuthResponse(
    val user: UserProfile,
    val accessToken: String,
    val refreshToken: String
)
data class TokenResponse(val accessToken: String, val refreshToken: String)

// ==================== User ====================
data class UserProfile(
    val id: String,
    val email: String,
    val username: String,
    val xp: Int,
    val level: Int,
    val hearts: Int,
    val heartsUpdatedAt: String? = null,
    val streak: Int,
    val bestStreak: Int = 0,
    val lastActiveDate: String? = null,
    val streakFreezes: Int = 0,
    val league: String = "BRONZE",
    val weeklyXp: Int = 0,
    val dailyGoal: Int = 3,
    val preferredLang: String = "python",
    val avatarUrl: String? = null,
    val authProvider: String = "email",
    // Subscription fields from backend
    val subscriptionStatus: String = "trial",
    val subscriptionExpiresAt: String? = null,
    val isPro: Boolean = false,
    val isTrialActive: Boolean = false,
    val trialDaysRemaining: Int = 3
)

// ==================== Topics & Problems ====================
data class Topic(
    val id: String,
    val name: String,
    val slug: String,
    val description: String,
    val icon: String,
    val color: String,
    val order: Int,
    val totalProblems: Int,
    val completedProblems: Int,
    val isUnlocked: Boolean
)

data class TopicDetail(
    val id: String,
    val name: String,
    val slug: String,
    val description: String,
    val icon: String,
    val color: String,
    val order: Int,
    val problems: List<ProblemSummary>
)

data class ProblemSummary(
    val id: String,
    val title: String,
    val slug: String,
    val difficulty: String,
    val order: Int,
    val pattern: String,
    val status: String,
    val score: Int,
    val bestScore: Int,
    val stage: Int
)

data class Problem(
    val id: String,
    val title: String,
    val slug: String,
    val difficulty: String,
    val order: Int,
    val story: String,
    val visualSteps: List<VisualStep>,
    val pattern: String,
    val patternExplanation: String,
    val solutions: Map<String, Solution>,
    val complexity: Complexity,
    val memoryTrick: String,
    val quiz: List<QuizQuestion>,
    val hints: List<String>,
    val commonMistakes: List<String>,
    val topic: TopicBrief,
    val userProgress: UserProgressBrief?
)

data class TopicBrief(val name: String, val slug: String, val color: String)

data class VisualStep(val step: Int, val description: String, val diagram: String)

data class Solution(val code: String, val lineExplanations: List<String>)

data class Complexity(val time: String, val space: String, val simpleExplanation: String)

data class QuizQuestion(
    val type: String,
    val question: String,
    val options: List<String>? = null,
    val correct: Int? = null,
    val correctOrder: List<Int>? = null,
    val answer: String? = null,
    val explanation: String
)

data class UserProgressBrief(
    val status: String,
    val score: Int,
    val bestScore: Int,
    val stage: Int,
    val attempts: Int
)

// ==================== Progress ====================
data class SubmitRequest(
    val problemId: String,
    val stage: Int,
    val score: Int,
    val perfect: Boolean
)

data class SubmitResponse(
    val xpEarned: Int,
    val streakBonus: Int,
    val totalXp: Int,
    val level: Int,
    val leveledUp: Boolean,
    val levelTitle: String,
    val streak: Int,
    val hearts: Int,
    val unlockedProblem: UnlockedProblem?,
    val newAchievements: List<Achievement>
)

data class UnlockedProblem(val id: String, val title: String, val slug: String)

data class HeartResponse(val hearts: Int)

data class SearchResult(
    val id: String,
    val title: String,
    val slug: String,
    val difficulty: String,
    val pattern: String,
    val order: Int,
    val topic: TopicBrief
)

data class ProgressStats(
    val totalProblems: Int,
    val completedProblems: Int,
    val percentage: Int,
    val level: Int,
    val levelTitle: String,
    val xp: Int,
    val streak: Int,
    val bestStreak: Int,
    val topics: List<TopicStat>,
    val difficultyStats: DifficultyStats
)

data class TopicStat(val name: String, val slug: String, val total: Int, val completed: Int)
data class DifficultyStats(val easy: DifficultyStat, val medium: DifficultyStat, val hard: DifficultyStat)
data class DifficultyStat(val total: Int, val completed: Int)

// ==================== Gamification ====================
data class Achievement(val name: String, val description: String, val icon: String)

data class AchievementFull(
    val id: String,
    val name: String,
    val description: String,
    val icon: String,
    val unlocked: Boolean,
    val unlockedAt: String?
)

data class LeaderboardEntry(
    val rank: Int,
    val username: String,
    val weeklyXp: Int? = null,
    val xp: Int? = null,
    val level: Int,
    val isMe: Boolean = false
)

data class WeeklyLeaderboard(
    val league: String,
    val myRank: Int?,
    val myWeeklyXp: Int,
    val leaderboard: List<LeaderboardEntry>
)

data class DailyChallenge(
    val date: String,
    val problem: ProblemBrief,
    val completed: Boolean,
    val bonusXp: Int
)

data class ProblemBrief(
    val id: String,
    val title: String,
    val slug: String,
    val difficulty: String,
    val pattern: String,
    val story: String,
    val topic: TopicBrief
)
