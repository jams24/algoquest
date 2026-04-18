package com.algoquest.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 20.dp,
    borderAlpha: Float = 0.2f,
    backgroundAlpha: Float = 0.08f,
    glowColor: Color = Color.White,
    content: @Composable ColumnScope.() -> Unit
) {
    val shape = RoundedCornerShape(cornerRadius)
    val isDark = MaterialTheme.colorScheme.background.luminance() < 0.5f

    val surfaceColor = if (isDark) {
        Color.White.copy(alpha = backgroundAlpha)
    } else {
        Color.White.copy(alpha = 0.7f)
    }

    val borderBrush = Brush.linearGradient(
        colors = listOf(
            glowColor.copy(alpha = borderAlpha),
            glowColor.copy(alpha = borderAlpha * 0.3f),
            Color.Transparent,
            glowColor.copy(alpha = borderAlpha * 0.5f)
        )
    )

    Box(
        modifier = modifier
            .clip(shape)
            .background(surfaceColor)
            .border(width = 1.dp, brush = borderBrush, shape = shape)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            content = content
        )
    }
}

@Composable
fun GlassSurface(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 16.dp,
    backgroundAlpha: Float = 0.06f,
    content: @Composable BoxScope.() -> Unit
) {
    val shape = RoundedCornerShape(cornerRadius)
    val isDark = MaterialTheme.colorScheme.background.luminance() < 0.5f

    val surfaceColor = if (isDark) {
        Color.White.copy(alpha = backgroundAlpha)
    } else {
        Color.White.copy(alpha = 0.85f)
    }

    Box(
        modifier = modifier
            .clip(shape)
            .background(surfaceColor),
        content = content
    )
}

// Extension to check luminance for dark theme detection
private fun Color.luminance(): Float {
    return 0.299f * red + 0.587f * green + 0.114f * blue
}
