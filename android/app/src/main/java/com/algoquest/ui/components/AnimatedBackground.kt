package com.algoquest.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import com.algoquest.ui.theme.AlgoBlue
import com.algoquest.ui.theme.AlgoGreen
import com.algoquest.ui.theme.AlgoPurple
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun AnimatedGradientBackground(
    modifier: Modifier = Modifier,
    alpha: Float = 0.06f
) {
    val infiniteTransition = rememberInfiniteTransition(label = "gradient_bg")
    val angle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(10000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "gradient_angle"
    )

    val colorShift by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(6000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "color_shift"
    )

    Canvas(modifier = modifier.fillMaxSize()) {
        val centerX = size.width / 2
        val centerY = size.height / 2
        val radius = size.maxDimension

        val rad = Math.toRadians(angle.toDouble()).toFloat()
        val startX = centerX + cos(rad) * radius
        val startY = centerY + sin(rad) * radius
        val endX = centerX - cos(rad) * radius
        val endY = centerY - sin(rad) * radius

        val color1 = lerp(AlgoGreen, AlgoBlue, colorShift)
        val color2 = lerp(AlgoBlue, AlgoPurple, colorShift)
        val color3 = lerp(AlgoPurple, AlgoGreen, colorShift)

        drawRect(
            brush = Brush.linearGradient(
                colors = listOf(
                    color1.copy(alpha = alpha),
                    color2.copy(alpha = alpha * 0.6f),
                    color3.copy(alpha = alpha * 0.3f),
                    Color.Transparent
                ),
                start = Offset(startX, startY),
                end = Offset(endX, endY)
            ),
            size = size
        )
    }
}

@Composable
fun OnboardingBackground(
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.08f)
        CodeRainBackground(
            particleCount = 30,
            speedMultiplier = 0.7f
        )
    }
}

// Color lerp helper
private fun lerp(start: Color, end: Color, fraction: Float): Color {
    return Color(
        red = start.red + (end.red - start.red) * fraction,
        green = start.green + (end.green - start.green) * fraction,
        blue = start.blue + (end.blue - start.blue) * fraction,
        alpha = start.alpha + (end.alpha - start.alpha) * fraction
    )
}
