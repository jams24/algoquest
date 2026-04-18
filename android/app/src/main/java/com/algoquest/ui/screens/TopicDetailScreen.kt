package com.algoquest.ui.screens

import androidx.compose.foundation.background
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
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.algoquest.data.model.TopicDetail
import com.algoquest.data.repository.AlgoRepository
import com.algoquest.ui.components.DifficultyBadge
import com.algoquest.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TopicDetailViewModel @Inject constructor(
    private val repository: AlgoRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    private val slug: String = savedStateHandle["slug"] ?: ""
    private val _topic = MutableStateFlow<TopicDetail?>(null)
    val topic = _topic.asStateFlow()

    init {
        viewModelScope.launch {
            repository.getTopicProblems(slug).onSuccess { _topic.value = it }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopicDetailScreen(
    onNavigateToLesson: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: TopicDetailViewModel = hiltViewModel()
) {
    val topic by viewModel.topic.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(topic?.name ?: "Loading...", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") }
                }
            )
        }
    ) { padding ->
        topic?.let { t ->
            val topicColor = try {
                Color(android.graphics.Color.parseColor(t.color))
            } catch (e: Exception) { AlgoGreen }

            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Header
                item {
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = topicColor.copy(alpha = 0.1f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(t.icon, fontSize = 32.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(t.description, style = MaterialTheme.typography.bodyLarge)
                        }
                    }
                }

                // Problem list
                itemsIndexed(t.problems) { index, problem ->
                    val isLocked = problem.status == "LOCKED"
                    val isCompleted = problem.status == "COMPLETED"

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .alpha(if (isLocked) 0.5f else 1f)
                            .clickable(enabled = !isLocked) { onNavigateToLesson(problem.slug) },
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Number circle
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(
                                        when {
                                            isCompleted -> AlgoGreen
                                            isLocked -> Color.Gray.copy(alpha = 0.3f)
                                            else -> topicColor.copy(alpha = 0.2f)
                                        }
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                if (isCompleted) {
                                    Icon(Icons.Filled.Check, null, tint = Color.White, modifier = Modifier.size(20.dp))
                                } else if (isLocked) {
                                    Icon(Icons.Filled.Lock, null, tint = Color.Gray, modifier = Modifier.size(18.dp))
                                } else {
                                    Text("${index + 1}", fontWeight = FontWeight.Bold, color = topicColor)
                                }
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(problem.title, fontWeight = FontWeight.SemiBold)
                                Text(
                                    problem.pattern,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                )
                            }

                            DifficultyBadge(problem.difficulty)

                            // Stage progress dots
                            if (!isLocked && !isCompleted) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                                    repeat(4) { stage ->
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(
                                                    if (stage < problem.stage) topicColor
                                                    else topicColor.copy(alpha = 0.2f)
                                                )
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } ?: Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = AlgoGreen)
        }
    }
}
