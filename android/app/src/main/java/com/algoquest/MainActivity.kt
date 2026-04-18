package com.algoquest

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.datastore.preferences.core.edit
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.algoquest.data.remote.PrefsKeys
import com.algoquest.data.remote.dataStore
import com.algoquest.data.subscription.SubscriptionManager
import com.algoquest.navigation.AlgoNavGraph
import com.algoquest.navigation.Screen
import com.algoquest.ui.components.AlgoBottomNavBar
import com.algoquest.ui.components.bottomNavItems
import com.algoquest.ui.theme.AlgoQuestTheme
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject lateinit var subscriptionManager: SubscriptionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val hasToken = runBlocking {
            dataStore.data.map { it[PrefsKeys.ACCESS_TOKEN] != null }.first()
        }
        val seenOnboarding = runBlocking {
            dataStore.data.map { it[PrefsKeys.SEEN_ONBOARDING] != null }.first()
        }

        val startDest = when {
            !seenOnboarding -> Screen.Onboarding.route
            hasToken -> Screen.Home.route
            else -> Screen.Login.route
        }

        setContent {
            AlgoQuestTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                val showBottomNav = currentRoute in bottomNavItems.map { it.route }

                // Subscription state
                val subState by subscriptionManager.state.collectAsState()
                val isPro = subState.isPro

                // Mark onboarding as seen when navigating away
                LaunchedEffect(currentRoute) {
                    if (currentRoute != Screen.Onboarding.route && !seenOnboarding) {
                        dataStore.edit { it[PrefsKeys.SEEN_ONBOARDING] = "true" }
                    }
                }

                Scaffold(
                    bottomBar = {
                        if (showBottomNav) {
                            AlgoBottomNavBar(
                                currentRoute = currentRoute,
                                onNavigate = { route ->
                                    navController.navigate(route) {
                                        popUpTo(Screen.Home.route) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            )
                        }
                    }
                ) { innerPadding ->
                    Surface(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        AlgoNavGraph(
                            navController = navController,
                            isLoggedIn = hasToken,
                            startDestination = startDest
                        )
                    }
                }
            }
        }
    }
}
