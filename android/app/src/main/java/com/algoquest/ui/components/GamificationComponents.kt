package com.algoquest.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.algoquest.ui.theme.*
import kotlin.math.sin
import kotlin.random.Random

// ==================== Heart Bar ====================
@Composable
fun HeartBar(hearts: Int, maxHearts: Int = 5) {
    var prevHearts by remember { mutableIntStateOf(hearts) }
    val bounceScale by animateFloatAsState(
        targetValue = if (hearts != prevHearts) 1.3f else 1f,
        animationSpec = spring(dampingRatio = 0.3f, stiffness = 600f),
        label = "heart_bounce",
        finishedListener = { prevHearts = hearts }
    )

    LaunchedEffect(hearts) {
        if (hearts != prevHearts) {
            prevHearts = hearts
        }
    }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        // Pulse when low
        val heartColor = if (hearts <= 1) {
            val infiniteTransition = rememberInfiniteTransition(label = "heart_pulse")
            val alpha by infiniteTransition.animateFloat(
                initialValue = 0.5f, targetValue = 1f,
                animationSpec = infiniteRepeatable(tween(500), RepeatMode.Reverse),
                label = "heart_alpha"
            )
            AlgoRed.copy(alpha = alpha)
        } else AlgoRed

        Icon(
            Icons.Filled.Favorite,
            contentDescription = "Hearts",
            tint = heartColor,
            modifier = Modifier.size(20.dp).scale(bounceScale)
        )
        Text(
            text = "$hearts",
            style = MaterialTheme.typography.titleMedium,
            color = heartColor,
            fontWeight = FontWeight.Bold
        )
    }
}

// ==================== XP Progress Bar ====================
@Composable
fun XpProgressBar(
    currentXp: Int,
    xpForNextLevel: Int,
    level: Int,
    modifier: Modifier = Modifier
) {
    val progress = if (xpForNextLevel > 0) currentXp.toFloat() / xpForNextLevel else 0f
    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(1000, easing = FastOutSlowInEasing),
        label = "xp_progress"
    )

    // Glow color for the bar
    val glowColor = AlgoOrange.copy(alpha = 0.3f)

    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(AlgoOrange),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "$level",
                        color = Color.White,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 12.sp
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Level $level",
                    style = MaterialTheme.typography.labelLarge,
                    color = AlgoOrange
                )
            }
            Text(
                text = "$currentXp / $xpForNextLevel XP",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp))
                .drawBehind {
                    // Glow effect behind progress
                    val barWidth = size.width * animatedProgress
                    drawRoundRect(
                        color = glowColor,
                        size = size.copy(width = barWidth + 8f),
                        blendMode = BlendMode.Screen
                    )
                }
        ) {
            LinearProgressIndicator(
                progress = { animatedProgress },
                modifier = Modifier.fillMaxSize(),
                color = AlgoOrange,
                trackColor = AlgoOrange.copy(alpha = 0.15f),
            )
        }
    }
}

// ==================== Streak Counter ====================
@Composable
fun StreakCounter(streak: Int) {
    val infiniteTransition = rememberInfiniteTransition(label = "streak_pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (streak > 0) 1.1f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800),
            repeatMode = RepeatMode.Reverse
        ),
        label = "streak_scale"
    )

    Box {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = if (streak > 0) "\uD83D\uDD25" else "\u2744\uFE0F",
                fontSize = (20 * scale).sp
            )
            Text(
                text = "$streak",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = if (streak > 0) AlgoYellow else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
            )
        }

        // Mini fire particles when streak > 3
        if (streak > 3) {
            val particleProgress by infiniteTransition.animateFloat(
                initialValue = 0f,
                targetValue = 1f,
                animationSpec = infiniteRepeatable(tween(2000, easing = LinearEasing), RepeatMode.Restart),
                label = "fire_particles"
            )

            Canvas(modifier = Modifier.size(36.dp).align(Alignment.Center)) {
                val particles = 5
                repeat(particles) { i ->
                    val phase = (particleProgress + i * 0.2f) % 1f
                    val x = center.x + sin(phase * Math.PI.toFloat() * 2 + i) * 8f
                    val y = center.y - phase * 20f
                    val alpha = (1f - phase) * 0.6f
                    val particleSize = (1f - phase) * 3f

                    drawCircle(
                        color = if (i % 2 == 0) AlgoYellow.copy(alpha = alpha) else AlgoOrange.copy(alpha = alpha),
                        radius = particleSize,
                        center = Offset(x, y)
                    )
                }
            }
        }
    }
}

// ==================== Code Block ====================
@Composable
fun CodeBlock(
    code: String,
    language: String,
    lineExplanations: List<String> = emptyList(),
    highlightedLine: Int? = null,
    onLineClick: ((Int) -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val lines = code.split("\n")
    val languageColor = when (language) {
        "python" -> Color(0xFF3572A5)
        "java" -> Color(0xFFB07219)
        "cpp" -> Color(0xFF00599C)
        else -> MaterialTheme.colorScheme.primary
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E1E2E)
        )
    ) {
        Column {
            // Language tab
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(languageColor.copy(alpha = 0.2f))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(languageColor)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = language.uppercase(),
                    color = languageColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp
                )
            }

            // Code
            Column(modifier = Modifier.padding(12.dp)) {
                lines.forEachIndexed { index, line ->
                    val bgColor = when {
                        highlightedLine == index -> AlgoGreen.copy(alpha = 0.15f)
                        else -> Color.Transparent
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(bgColor, RoundedCornerShape(4.dp))
                            .padding(vertical = 1.dp, horizontal = 4.dp)
                    ) {
                        // Line number
                        Text(
                            text = "${index + 1}",
                            color = Color.Gray.copy(alpha = 0.4f),
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            modifier = Modifier.width(24.dp),
                            textAlign = TextAlign.End
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        // Code line
                        Text(
                            text = line,
                            color = Color(0xFFCDD6F4),
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp,
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        }
    }
}

// ==================== Difficulty Badge ====================
@Composable
fun DifficultyBadge(difficulty: String) {
    val (color, label) = when (difficulty.uppercase()) {
        "EASY" -> EasyColor to "Easy"
        "MEDIUM" -> MediumColor to "Medium"
        "HARD" -> HardColor to "Hard"
        else -> Color.Gray to difficulty
    }

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = color.copy(alpha = 0.15f)
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            color = color,
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp
        )
    }
}

// ==================== Animated Checkmark ====================
@Composable
fun AnimatedCheckmark(visible: Boolean) {
    val scale by animateFloatAsState(
        targetValue = if (visible) 1f else 0f,
        animationSpec = spring(dampingRatio = 0.5f, stiffness = 300f),
        label = "check_scale"
    )

    if (scale > 0f) {
        Box(
            modifier = Modifier
                .size((48 * scale).dp)
                .clip(CircleShape)
                .background(AlgoGreen),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                Icons.Filled.Check,
                contentDescription = "Correct",
                tint = Color.White,
                modifier = Modifier.size((32 * scale).dp)
            )
        }
    }
}

// ==================== Topic Progress Ring ====================
@Composable
fun TopicProgressRing(
    completed: Int,
    total: Int,
    color: Color,
    modifier: Modifier = Modifier
) {
    val progress = if (total > 0) completed.toFloat() / total else 0f

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        CircularProgressIndicator(
            progress = { progress },
            modifier = Modifier.size(48.dp),
            color = color,
            trackColor = color.copy(alpha = 0.15f),
            strokeWidth = 4.dp,
        )
        Text(
            text = "$completed/$total",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
    }
}
