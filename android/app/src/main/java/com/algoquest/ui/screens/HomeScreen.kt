package com.algoquest.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.algoquest.data.model.*
import com.algoquest.data.repository.AlgoRepository
import com.algoquest.ui.components.*
import com.algoquest.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: AlgoRepository
) : ViewModel() {
    private val _profile = MutableStateFlow<UserProfile?>(null)
    val profile = _profile.asStateFlow()

    private val _stats = MutableStateFlow<ProgressStats?>(null)
    val stats = _stats.asStateFlow()

    private val _dailyChallenge = MutableStateFlow<DailyChallenge?>(null)
    val dailyChallenge = _dailyChallenge.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    init { refresh() }

    fun refresh() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            val profileResult = repository.getProfile()
            profileResult.onSuccess { _profile.value = it }
            profileResult.onFailure { _error.value = "Couldn't connect to server. Check your internet." }
            repository.getStats().onSuccess { _stats.value = it }
            repository.getDailyChallenge().onSuccess { _dailyChallenge.value = it }
            _isLoading.value = false
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToTopicMap: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateToLeaderboard: () -> Unit,
    onNavigateToDaily: () -> Unit,
    onNavigateToLesson: (String) -> Unit,
    onNavigateToInterviewPrep: () -> Unit = {},
    onNavigateToSearch: () -> Unit = {},
    viewModel: HomeViewModel = hiltViewModel()
) {
    val profile by viewModel.profile.collectAsState()
    val stats by viewModel.stats.collectAsState()
    val daily by viewModel.dailyChallenge.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    // Staggered entrance animation
    var itemsVisible by remember { mutableStateOf(false) }
    LaunchedEffect(isLoading) {
        if (!isLoading) {
            delay(100)
            itemsVisible = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {},
                navigationIcon = {
                    IconButton(onClick = onNavigateToSearch) {
                        Icon(Icons.Filled.Search, "Search")
                    }
                },
                actions = {
                    profile?.let { HeartBar(hearts = it.hearts) }
                    Spacer(modifier = Modifier.width(12.dp))
                    StreakCounter(streak = profile?.streak ?: 0)
                    Spacer(modifier = Modifier.width(8.dp))
                }
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            // Ambient background
            AnimatedGradientBackground(alpha = 0.03f)

            if (isLoading && profile == null) {
                // Shimmer loading
                ShimmerLoadingScreen(cardCount = 4)
            } else {
                @OptIn(ExperimentalMaterial3Api::class)
                PullToRefreshBox(
                    isRefreshing = isLoading,
                    onRefresh = { viewModel.refresh() },
                    modifier = Modifier.fillMaxSize()
                ) {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        // Welcome + Level
                        item {
                            StaggeredItem(visible = itemsVisible, index = 0) {
                                profile?.let { user ->
                                    Column {
                                        Text(
                                            text = "Welcome back, ${user.username}!",
                                            style = MaterialTheme.typography.headlineMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        val xpForNext = (100 * Math.pow(1.15, (user.level - 1).toDouble())).toInt()
                                        val totalForCurrentLevel = (1 until user.level).sumOf { (100 * Math.pow(1.15, (it - 1).toDouble())).toInt() }
                                        val xpInCurrentLevel = user.xp - totalForCurrentLevel

                                        XpProgressBar(
                                            currentXp = xpInCurrentLevel.coerceAtLeast(0),
                                            xpForNextLevel = xpForNext,
                                            level = user.level
                                        )
                                    }
                                }
                            }
                        }

                        // Daily Challenge Card
                        item {
                            StaggeredItem(visible = itemsVisible, index = 1) {
                                daily?.let { challenge ->
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable { onNavigateToLesson(challenge.problem.slug) },
                                        shape = RoundedCornerShape(16.dp),
                                        colors = CardDefaults.cardColors(containerColor = AlgoPurple.copy(alpha = 0.1f))
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(16.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(48.dp)
                                                    .clip(CircleShape)
                                                    .background(AlgoPurple),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text("\u2B50", fontSize = 24.sp)
                                            }
                                            Spacer(modifier = Modifier.width(12.dp))
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(
                                                    "Daily Challenge",
                                                    style = MaterialTheme.typography.titleMedium,
                                                    fontWeight = FontWeight.Bold,
                                                    color = AlgoPurple
                                                )
                                                Text(
                                                    challenge.problem.title,
                                                    style = MaterialTheme.typography.bodyMedium
                                                )
                                            }
                                            if (challenge.completed) {
                                                Icon(Icons.Filled.CheckCircle, null, tint = AlgoGreen)
                                            } else {
                                                DifficultyBadge(challenge.problem.difficulty)
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Continue Learning Button
                        item {
                            StaggeredItem(visible = itemsVisible, index = 2) {
                                Button(
                                    onClick = onNavigateToTopicMap,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(56.dp),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
                                ) {
                                    Icon(Icons.Filled.PlayArrow, null, modifier = Modifier.size(24.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("CONTINUE LEARNING", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                }
                            }
                        }

                        // Stats Overview
                        item {
                            StaggeredItem(visible = itemsVisible, index = 3) {
                                stats?.let { s ->
                                    Card(
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(16.dp)
                                    ) {
                                        Column(modifier = Modifier.padding(16.dp)) {
                                            Text(
                                                "Your Progress",
                                                style = MaterialTheme.typography.titleMedium,
                                                fontWeight = FontWeight.Bold
                                            )
                                            Spacer(modifier = Modifier.height(12.dp))
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceEvenly
                                            ) {
                                                StatItem("Problems", "${s.completedProblems}/${s.totalProblems}", AlgoGreen)
                                                StatItem("Level", "${s.level}", AlgoOrange)
                                                StatItem("Streak", "${s.streak} days", AlgoYellow)
                                                StatItem("Rank", s.levelTitle, AlgoPurple)
                                            }

                                            Spacer(modifier = Modifier.height(16.dp))

                                            LinearProgressIndicator(
                                                progress = { s.percentage / 100f },
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .height(10.dp)
                                                    .clip(RoundedCornerShape(5.dp)),
                                                color = AlgoGreen,
                                                trackColor = AlgoGreen.copy(alpha = 0.1f),
                                            )
                                            Text(
                                                "${s.percentage}% Complete",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                                                modifier = Modifier.padding(top = 4.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // Daily Goal
                        item {
                            StaggeredItem(visible = itemsVisible, index = 4) {
                                profile?.let { user ->
                                    val goal = user.dailyGoal
                                    Card(
                                        shape = RoundedCornerShape(16.dp),
                                        colors = CardDefaults.cardColors(containerColor = AlgoYellow.copy(alpha = 0.08f))
                                    ) {
                                        Column(modifier = Modifier.padding(16.dp)) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text("\uD83C\uDFAF", fontSize = 20.sp)
                                                Spacer(modifier = Modifier.width(8.dp))
                                                Text("Daily Goal", fontWeight = FontWeight.Bold)
                                                Spacer(modifier = Modifier.weight(1f))
                                                Text(
                                                    when (goal) { 1 -> "Casual"; 3 -> "Regular"; 5 -> "Serious"; else -> "$goal/day" },
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = AlgoYellow
                                                )
                                            }
                                            Spacer(modifier = Modifier.height(8.dp))
                                            val progress = if (user.streak > 0) 1f else 0f
                                            LinearProgressIndicator(
                                                progress = { progress },
                                                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                                                color = AlgoYellow,
                                                trackColor = AlgoYellow.copy(alpha = 0.15f),
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                if (user.streak > 0) "Keep it up! \uD83D\uDD25 ${user.streak}-day streak"
                                                else "Complete a problem to start your streak!",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // Quick Actions
                        item {
                            StaggeredItem(visible = itemsVisible, index = 5) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    QuickActionCard(
                                        icon = "\uD83C\uDFC6",
                                        label = "Leaderboard",
                                        color = AlgoBlue,
                                        modifier = Modifier.weight(1f),
                                        onClick = onNavigateToLeaderboard
                                    )
                                    QuickActionCard(
                                        icon = "\uD83C\uDFAF",
                                        label = "Interview",
                                        color = AlgoRed,
                                        modifier = Modifier.weight(1f),
                                        onClick = onNavigateToInterviewPrep
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// Staggered entrance animation wrapper
@Composable
private fun StaggeredItem(
    visible: Boolean,
    index: Int,
    content: @Composable () -> Unit
) {
    var itemVisible by remember { mutableStateOf(false) }

    LaunchedEffect(visible) {
        if (visible) {
            delay(index * 80L)
            itemVisible = true
        }
    }

    AnimatedVisibility(
        visible = itemVisible,
        enter = fadeIn(tween(300)) + slideInVertically(tween(300)) { it / 4 }
    ) {
        content()
    }
}

@Composable
private fun StatItem(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontWeight = FontWeight.Bold, color = color, fontSize = 16.sp)
        Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
    }
}

@Composable
private fun QuickActionCard(icon: String, label: String, color: Color, modifier: Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f))
    ) {
        Column(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(icon, fontSize = 28.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(label, fontWeight = FontWeight.SemiBold, color = color)
        }
    }
}
