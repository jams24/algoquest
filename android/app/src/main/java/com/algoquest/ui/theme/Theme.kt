package com.algoquest.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Duolingo-inspired bright, friendly colors
val AlgoGreen = Color(0xFF58CC02)        // Primary green (like Duolingo)
val AlgoGreenDark = Color(0xFF4CAF50)
val AlgoBlue = Color(0xFF1CB0F6)         // Secondary blue
val AlgoOrange = Color(0xFFFF9600)       // XP / rewards
val AlgoRed = Color(0xFFFF4B4B)          // Hearts / errors
val AlgoPurple = Color(0xFFA560E8)       // Premium / special
val AlgoYellow = Color(0xFFFFC800)       // Streak fire
val AlgoGold = Color(0xFFFFD700)         // Achievements

val AlgoBgLight = Color(0xFFF7F7F7)
val AlgoBgDark = Color(0xFF1A1A2E)
val AlgoSurface = Color(0xFFFFFFFF)
val AlgoSurfaceDark = Color(0xFF232340)
val AlgoCardLight = Color(0xFFFFFFFF)
val AlgoCardDark = Color(0xFF2D2D4A)

// Difficulty colors
val EasyColor = Color(0xFF58CC02)
val MediumColor = Color(0xFFFFB800)
val HardColor = Color(0xFFFF4B4B)

private val LightColorScheme = lightColorScheme(
    primary = AlgoGreen,
    onPrimary = Color.White,
    secondary = AlgoBlue,
    onSecondary = Color.White,
    tertiary = AlgoOrange,
    background = AlgoBgLight,
    surface = AlgoSurface,
    onBackground = Color(0xFF1A1A2E),
    onSurface = Color(0xFF1A1A2E),
    error = AlgoRed,
    onError = Color.White,
)

private val DarkColorScheme = darkColorScheme(
    primary = AlgoGreen,
    onPrimary = Color.White,
    secondary = AlgoBlue,
    onSecondary = Color.White,
    tertiary = AlgoOrange,
    background = AlgoBgDark,
    surface = AlgoSurfaceDark,
    onBackground = Color.White,
    onSurface = Color.White,
    error = AlgoRed,
    onError = Color.White,
)

@Composable
fun AlgoQuestTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AlgoQuestTypography,
        content = content
    )
}
