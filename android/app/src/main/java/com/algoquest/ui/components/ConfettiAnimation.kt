package com.algoquest.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import kotlin.math.sin
import kotlin.random.Random

data class ConfettiParticle(
    val x: Float,
    val initialY: Float,
    val speed: Float,
    val size: Float,
    val color: Color,
    val wobbleSpeed: Float,
    val wobbleAmount: Float
)

@Composable
fun ConfettiAnimation(
    isPlaying: Boolean,
    modifier: Modifier = Modifier
) {
    if (!isPlaying) return

    val colors = listOf(
        Color(0xFF58CC02), // green
        Color(0xFF1CB0F6), // blue
        Color(0xFFFF9600), // orange
        Color(0xFFFFC800), // yellow
        Color(0xFFA560E8), // purple
        Color(0xFFFF4B4B), // red
        Color(0xFFFFD700), // gold
    )

    val particles = remember {
        List(60) {
            ConfettiParticle(
                x = Random.nextFloat(),
                initialY = -Random.nextFloat() * 0.3f,
                speed = 0.3f + Random.nextFloat() * 0.7f,
                size = 4f + Random.nextFloat() * 8f,
                color = colors.random(),
                wobbleSpeed = 1f + Random.nextFloat() * 3f,
                wobbleAmount = 10f + Random.nextFloat() * 20f
            )
        }
    }

    val infiniteTransition = rememberInfiniteTransition(label = "confetti")
    val progress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "confetti_progress"
    )

    Canvas(modifier = modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height

        particles.forEach { p ->
            val y = ((p.initialY + progress * p.speed) % 1.2f) * h
            val wobble = sin(progress * p.wobbleSpeed * Math.PI.toFloat() * 2) * p.wobbleAmount
            val x = p.x * w + wobble

            drawCircle(
                color = p.color,
                radius = p.size,
                center = Offset(x, y)
            )
        }
    }
}
