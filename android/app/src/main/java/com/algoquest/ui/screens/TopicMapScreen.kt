package com.algoquest.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.algoquest.data.model.Topic
import com.algoquest.data.repository.AlgoRepository
import com.algoquest.ui.components.TopicProgressRing
import com.algoquest.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TopicMapViewModel @Inject constructor(
    private val repository: AlgoRepository
) : ViewModel() {
    private val _topics = MutableStateFlow<List<Topic>>(emptyList())
    val topics = _topics.asStateFlow()
    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    init {
        viewModelScope.launch {
            repository.getTopics()
                .onSuccess { _topics.value = it }
            _isLoading.value = false
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopicMapScreen(
    onNavigateToTopic: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: TopicMapViewModel = hiltViewModel()
) {
    val topics by viewModel.topics.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Learning Path", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = AlgoGreen)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Loading your path...", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                }
            }
        } else if (topics.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("\uD83D\uDE1E", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Couldn't load topics", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = { /* retry */ }, colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)) {
                        Text("Retry")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(0.dp)
            ) {
                itemsIndexed(topics) { index, topic ->
                    val topicColor = try {
                        Color(android.graphics.Color.parseColor(topic.color))
                    } catch (e: Exception) {
                        AlgoGreen
                    }

                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = when {
                            index % 3 == 0 -> Alignment.Start
                            index % 3 == 1 -> Alignment.CenterHorizontally
                            else -> Alignment.End
                        }
                    ) {
                        // Connector line (except for first item)
                        if (index > 0) {
                            Box(
                                modifier = Modifier
                                    .width(3.dp)
                                    .height(24.dp)
                                    .background(
                                        if (topic.isUnlocked) topicColor.copy(alpha = 0.3f)
                                        else Color.Gray.copy(alpha = 0.2f)
                                    )
                                    .align(Alignment.CenterHorizontally)
                            )
                        }

                        // Topic node
                        TopicNode(
                            topic = topic,
                            color = topicColor,
                            onClick = { if (topic.isUnlocked) onNavigateToTopic(topic.slug) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun TopicNode(topic: Topic, color: Color, onClick: () -> Unit) {
    val isLocked = !topic.isUnlocked
    val isCompleted = topic.completedProblems == topic.totalProblems && topic.totalProblems > 0
    val isInProgress = !isLocked && !isCompleted && topic.completedProblems > 0

    // Pulse animation for active/in-progress topics
    val infiniteTransition = rememberInfiniteTransition(label = "node_pulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.6f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    val borderWidth = if (isInProgress) 3.dp else 0.dp
    val borderColor = if (isInProgress) color.copy(alpha = pulseAlpha) else Color.Transparent

    Card(
        modifier = Modifier
            .width(280.dp)
            .alpha(if (isLocked) 0.4f else 1f)
            .then(if (borderWidth > 0.dp) Modifier.border(borderWidth, borderColor, RoundedCornerShape(20.dp)) else Modifier)
            .clickable(enabled = !isLocked, onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = when {
                isCompleted -> color.copy(alpha = 0.12f)
                isInProgress -> MaterialTheme.colorScheme.surface
                else -> MaterialTheme.colorScheme.surface
            }
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isLocked) 0.dp else if (isInProgress) 6.dp else 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon circle with crown for completed
            Box(contentAlignment = Alignment.Center) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(
                            when {
                                isLocked -> Color.Gray.copy(alpha = 0.15f)
                                isCompleted -> color.copy(alpha = 0.2f)
                                else -> color.copy(alpha = 0.15f)
                            }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    if (isLocked) {
                        Icon(Icons.Filled.Lock, null, tint = Color.Gray, modifier = Modifier.size(24.dp))
                    } else if (isCompleted) {
                        Text("\uD83D\uDC51", fontSize = 28.sp) // Crown!
                    } else {
                        Text(topic.icon, fontSize = 28.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = topic.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (isLocked) Color.Gray else MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "${topic.completedProblems}/${topic.totalProblems} problems",
                    style = MaterialTheme.typography.bodySmall,
                    color = if (isLocked) Color.Gray else color
                )
            }

            if (!isLocked) {
                TopicProgressRing(
                    completed = topic.completedProblems,
                    total = topic.totalProblems,
                    color = color
                )
            }
        }
    }
}
