package com.algoquest.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.text.*
import androidx.compose.ui.unit.sp
import com.algoquest.ui.theme.AlgoBlue
import com.algoquest.ui.theme.AlgoGreen
import com.algoquest.ui.theme.AlgoPurple
import kotlin.math.sin
import kotlin.random.Random

// ==================== Code Rain Background ====================

private data class CodeParticle(
    val x: Float,
    val initialY: Float,
    val speed: Float,
    val size: Float,
    val symbol: String,
    val color: Color,
    val alpha: Float,
    val rotation: Float,
    val rotationSpeed: Float
)

private val codeSymbols = listOf(
    "{", "}", "=>", "[]", "()", "//", "&&", "||",
    "if", "for", "fn", "let", "val", "int",
    "O(n)", "O(1)", "log", "map", "->", "::",
    "++", "--", "!=", "==", "<<", ">>",
    "#", "@", "0", "1", "null", "true"
)

private val particleColors = listOf(
    AlgoGreen.copy(alpha = 0.4f),
    AlgoBlue.copy(alpha = 0.3f),
    AlgoPurple.copy(alpha = 0.25f),
    Color.White.copy(alpha = 0.15f)
)

@Composable
fun CodeRainBackground(
    modifier: Modifier = Modifier,
    particleCount: Int = 40,
    speedMultiplier: Float = 1f
) {
    val particles = remember {
        List(particleCount) {
            CodeParticle(
                x = Random.nextFloat(),
                initialY = -Random.nextFloat(),
                speed = (0.15f + Random.nextFloat() * 0.35f) * speedMultiplier,
                size = 8f + Random.nextFloat() * 6f,
                symbol = codeSymbols.random(),
                color = particleColors.random(),
                alpha = 0.1f + Random.nextFloat() * 0.3f,
                rotation = Random.nextFloat() * 360f,
                rotationSpeed = (-1f + Random.nextFloat() * 2f) * 30f
            )
        }
    }

    val infiniteTransition = rememberInfiniteTransition(label = "code_rain")
    val progress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(8000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "code_rain_progress"
    )

    val textMeasurer = rememberTextMeasurer()

    Canvas(modifier = modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height

        particles.forEach { p ->
            val y = ((p.initialY + progress * p.speed * 2f) % 1.4f - 0.2f) * h
            val wobble = sin(progress * 3f * Math.PI.toFloat() + p.x * 10f) * 8f
            val x = p.x * w + wobble
            val rot = p.rotation + progress * p.rotationSpeed

            rotate(degrees = rot, pivot = Offset(x, y)) {
                drawText(
                    textMeasurer = textMeasurer,
                    text = p.symbol,
                    topLeft = Offset(x, y),
                    style = TextStyle(
                        color = p.color.copy(alpha = p.alpha),
                        fontSize = p.size.sp
                    )
                )
            }
        }
    }
}

// ==================== Floating Symbol Background ====================

private data class FloatingSymbol(
    val x: Float,
    val y: Float,
    val symbol: String,
    val size: Float,
    val color: Color,
    val driftSpeedX: Float,
    val driftSpeedY: Float,
    val alpha: Float
)

private val ambientSymbols = listOf(
    "\uD83C\uDF33", // tree
    "\uD83D\uDD17", // link (graph)
    "\u2194\uFE0F", // arrows
    "\uD83D\uDCCA", // chart
    "\u2B50", // star
    "\u26A1", // lightning
    "\uD83E\uDDE9", // puzzle
    "\uD83D\uDD0D"  // search
)

@Composable
fun FloatingSymbolBackground(
    modifier: Modifier = Modifier,
    symbolCount: Int = 12
) {
    val symbols = remember {
        List(symbolCount) {
            FloatingSymbol(
                x = Random.nextFloat(),
                y = Random.nextFloat(),
                symbol = ambientSymbols.random(),
                size = 14f + Random.nextFloat() * 10f,
                color = particleColors.random(),
                driftSpeedX = (-0.5f + Random.nextFloat()) * 0.3f,
                driftSpeedY = (-0.5f + Random.nextFloat()) * 0.2f,
                alpha = 0.06f + Random.nextFloat() * 0.1f
            )
        }
    }

    val infiniteTransition = rememberInfiniteTransition(label = "floating")
    val progress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(15000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "floating_progress"
    )

    val textMeasurer = rememberTextMeasurer()

    Canvas(modifier = modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height

        symbols.forEach { s ->
            val x = ((s.x + progress * s.driftSpeedX) % 1f) * w
            val y = ((s.y + progress * s.driftSpeedY) % 1f) * h
            val breathe = 0.7f + 0.3f * sin(progress * Math.PI.toFloat() * 2f + s.x * 5f)

            drawText(
                textMeasurer = textMeasurer,
                text = s.symbol,
                topLeft = Offset(x, y),
                style = TextStyle(
                    color = Color.White.copy(alpha = s.alpha * breathe),
                    fontSize = s.size.sp
                )
            )
        }
    }
}
