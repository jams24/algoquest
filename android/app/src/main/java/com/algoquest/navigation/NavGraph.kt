package com.algoquest.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.algoquest.ui.screens.*

sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object Register : Screen("register")
    data object Home : Screen("home")
    data object TopicMap : Screen("topic_map")
    data object TopicDetail : Screen("topic/{slug}") {
        fun createRoute(slug: String) = "topic/$slug"
    }
    data object Lesson : Screen("lesson/{slug}") {
        fun createRoute(slug: String) = "lesson/$slug"
    }
    data object Quiz : Screen("quiz/{slug}") {
        fun createRoute(slug: String) = "quiz/$slug"
    }
    data object Profile : Screen("profile")
    data object Leaderboard : Screen("leaderboard")
    data object Achievements : Screen("achievements")
    data object Settings : Screen("settings")
    data object InterviewPrep : Screen("interview_prep")
    data object Onboarding : Screen("onboarding")
    data object Review : Screen("review")
    data object Search : Screen("search")
}

// Smooth slide transitions
private val enterSlideLeft = slideInHorizontally(tween(300)) { it } + fadeIn(tween(300))
private val exitSlideLeft = slideOutHorizontally(tween(300)) { -it / 3 } + fadeOut(tween(150))
private val enterSlideRight = slideInHorizontally(tween(300)) { -it } + fadeIn(tween(300))
private val exitSlideRight = slideOutHorizontally(tween(300)) { it } + fadeOut(tween(150))

// Fade for tab switches
private val enterFade = fadeIn(tween(200))
private val exitFade = fadeOut(tween(200))

@Composable
fun AlgoNavGraph(navController: NavHostController, isLoggedIn: Boolean, startDestination: String? = null) {
    NavHost(
        navController = navController,
        startDestination = startDestination ?: if (isLoggedIn) Screen.Home.route else Screen.Login.route,
        enterTransition = { enterSlideLeft },
        exitTransition = { exitSlideLeft },
        popEnterTransition = { enterSlideRight },
        popExitTransition = { exitSlideRight }
    ) {
        // Auth screens — fade transition
        composable(
            Screen.Login.route,
            enterTransition = { enterFade },
            exitTransition = { exitFade }
        ) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = { navController.navigate(Screen.Register.route) }
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                onRegisterSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = { navController.popBackStack() }
            )
        }

        // Main tabs — fade
        composable(
            Screen.Home.route,
            enterTransition = { enterFade },
            exitTransition = { exitFade }
        ) {
            HomeScreen(
                onNavigateToTopicMap = { navController.navigate(Screen.TopicMap.route) },
                onNavigateToProfile = { navController.navigate(Screen.Profile.route) },
                onNavigateToLeaderboard = { navController.navigate(Screen.Leaderboard.route) },
                onNavigateToDaily = { },
                onNavigateToLesson = { slug -> navController.navigate(Screen.Lesson.createRoute(slug)) },
                onNavigateToInterviewPrep = { navController.navigate(Screen.InterviewPrep.route) },
                onNavigateToSearch = { navController.navigate(Screen.Search.route) }
            )
        }

        composable(
            Screen.TopicMap.route,
            enterTransition = { enterFade },
            exitTransition = { exitFade }
        ) {
            TopicMapScreen(
                onNavigateToTopic = { slug -> navController.navigate(Screen.TopicDetail.createRoute(slug)) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            Screen.TopicDetail.route,
            arguments = listOf(navArgument("slug") { type = NavType.StringType })
        ) {
            TopicDetailScreen(
                onNavigateToLesson = { slug -> navController.navigate(Screen.Lesson.createRoute(slug)) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            Screen.Lesson.route,
            arguments = listOf(navArgument("slug") { type = NavType.StringType })
        ) {
            LessonScreen(
                onNavigateToQuiz = { slug -> navController.navigate(Screen.Quiz.createRoute(slug)) },
                onBack = { navController.popBackStack() }
            )
        }

        // Quiz — slide up
        composable(
            Screen.Quiz.route,
            arguments = listOf(navArgument("slug") { type = NavType.StringType }),
            enterTransition = { slideInVertically(tween(300)) { it } + fadeIn(tween(300)) },
            exitTransition = { slideOutVertically(tween(300)) { it } + fadeOut(tween(200)) },
            popExitTransition = { slideOutVertically(tween(300)) { it } + fadeOut(tween(200)) }
        ) {
            QuizScreen(
                onComplete = { navController.popBackStack(Screen.Home.route, false) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            Screen.Profile.route,
            enterTransition = { enterFade },
            exitTransition = { exitFade }
        ) {
            ProfileScreen(
                onNavigateToAchievements = { navController.navigate(Screen.Achievements.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) },
                onBack = { navController.popBackStack() },
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(
            Screen.Leaderboard.route,
            enterTransition = { enterFade },
            exitTransition = { exitFade }
        ) {
            LeaderboardScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.Achievements.route) {
            AchievementsScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.Settings.route) {
            SettingsScreen(onBack = { navController.popBackStack() })
        }

        // Interview prep — slide up
        composable(
            Screen.InterviewPrep.route,
            enterTransition = { slideInVertically(tween(300)) { it } + fadeIn(tween(300)) },
            popExitTransition = { slideOutVertically(tween(300)) { it } + fadeOut(tween(200)) }
        ) {
            InterviewPrepScreen(
                onBack = { navController.popBackStack() },
                onNavigateToLesson = { slug -> navController.navigate(Screen.Lesson.createRoute(slug)) }
            )
        }

        // Onboarding — now with two callbacks
        composable(
            Screen.Onboarding.route,
            enterTransition = { enterFade },
            exitTransition = { exitFade }
        ) {
            OnboardingScreen(
                onComplete = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Onboarding.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Onboarding.route) { inclusive = true }
                    }
                }
            )
        }

        // Review screen
        composable(Screen.Review.route) {
            ReviewScreen(
                onNavigateToLesson = { slug -> navController.navigate(Screen.Lesson.createRoute(slug)) },
                onBack = { navController.popBackStack() }
            )
        }

        // Search screen
        composable(Screen.Search.route) {
            SearchScreen(
                onNavigateToLesson = { slug -> navController.navigate(Screen.Lesson.createRoute(slug)) },
                onBack = { navController.popBackStack() }
            )
        }
    }
}
