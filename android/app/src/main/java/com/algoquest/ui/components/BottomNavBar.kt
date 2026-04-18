package com.algoquest.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.vector.ImageVector
import com.algoquest.ui.theme.AlgoGreen

data class BottomNavItem(
    val label: String,
    val icon: ImageVector,
    val route: String
)

val bottomNavItems = listOf(
    BottomNavItem("Home", Icons.Filled.Home, "home"),
    BottomNavItem("Learn", Icons.Filled.School, "topic_map"),
    BottomNavItem("Rank", Icons.Filled.EmojiEvents, "leaderboard"),
    BottomNavItem("Profile", Icons.Filled.Person, "profile")
)

@Composable
fun AlgoBottomNavBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        bottomNavItems.forEach { item ->
            val selected = currentRoute == item.route
            NavigationBarItem(
                selected = selected,
                onClick = { onNavigate(item.route) },
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = AlgoGreen,
                    selectedTextColor = AlgoGreen,
                    indicatorColor = AlgoGreen.copy(alpha = 0.12f)
                )
            )
        }
    }
}
