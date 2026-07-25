package com.algoquest.ui.screens

import androidx.compose.animation.*
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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.algoquest.data.model.*
import com.algoquest.data.repository.AlgoRepository
import com.algoquest.data.subscription.SubscriptionManager
import com.algoquest.ui.theme.*
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialog
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialogOptions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// ─── TRACKS LIST ─────────────────────────────────────────────────────────────

@HiltViewModel
class DesignTracksViewModel @Inject constructor(
    private val repository: AlgoRepository
) : ViewModel() {
    private val _tracks = MutableStateFlow<List<DesignTrackSummary>>(emptyList())
    val tracks = _tracks.asStateFlow()
    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    init {
        viewModelScope.launch {
            repository.getDesignTracks().onSuccess { _tracks.value = it }
            _isLoading.value = false
        }
    }

    fun reload() {
        _isLoading.value = true
        viewModelScope.launch {
            repository.getDesignTracks().onSuccess { _tracks.value = it }
            _isLoading.value = false
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DesignTracksScreen(
    onNavigateToTrack: (String) -> Unit,
    viewModel: DesignTracksViewModel = hiltViewModel()
) {
    val tracks by viewModel.tracks.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("System Design", fontWeight = FontWeight.ExtraBold)
                        Text("8 tracks · 64 lessons", style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    }
                }
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = AlgoBlue)
                    Spacer(Modifier.height(12.dp))
                    Text("Loading tracks...", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                }
            }
        } else if (tracks.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                    Text("🏗️", fontSize = 56.sp)
                    Spacer(Modifier.height(12.dp))
                    Text("No tracks found", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    Text("Check your connection and try again.", textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = { viewModel.reload() },
                        colors = ButtonDefaults.buttonColors(containerColor = AlgoBlue)) {
                        Text("Retry")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Hero header
                item {
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = AlgoBlue.copy(alpha = 0.12f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("🏗️", fontSize = 40.sp)
                            Spacer(Modifier.width(12.dp))
                            Column {
                                Text("Master System Design", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                                Text("From fundamentals to FAANG-level interviews", fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                        }
                    }
                    Spacer(Modifier.height(4.dp))
                }

                itemsIndexed(tracks) { _, track ->
                    DesignTrackCard(track = track, onClick = {
                        if (track.isUnlocked) onNavigateToTrack(track.slug)
                    })
                }

                item { Spacer(Modifier.height(16.dp)) }
            }
        }
    }
}

@Composable
private fun DesignTrackCard(track: DesignTrackSummary, onClick: () -> Unit) {
    val trackColor = try { Color(android.graphics.Color.parseColor(track.color)) } catch (_: Exception) { AlgoBlue }
    val isLocked = !track.isUnlocked
    val isCompleted = track.completedLessons == track.totalLessons && track.totalLessons > 0
    val progress = if (track.totalLessons > 0) track.completedLessons.toFloat() / track.totalLessons else 0f

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .alpha(if (isLocked) 0.45f else 1f)
            .clickable(enabled = !isLocked, onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isLocked) 0.dp else 3.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Icon
                Box(
                    modifier = Modifier.size(52.dp).clip(RoundedCornerShape(14.dp))
                        .background(trackColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    if (isLocked) Icon(Icons.Filled.Lock, null, tint = Color.Gray, modifier = Modifier.size(22.dp))
                    else Text(track.icon, fontSize = 26.sp)
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(track.name, fontWeight = FontWeight.Bold, fontSize = 16.sp,
                            modifier = Modifier.weight(1f))
                        // Level badge
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = trackColor.copy(alpha = 0.15f)
                        ) {
                            Text(track.level.uppercase(), modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                fontSize = 10.sp, fontWeight = FontWeight.Bold, color = trackColor)
                        }
                    }
                    Text(track.description, style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        maxLines = 2)
                }
                if (!isLocked) {
                    Spacer(Modifier.width(8.dp))
                    if (isCompleted) {
                        Text("✅", fontSize = 24.sp)
                    } else {
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, null,
                            tint = trackColor, modifier = Modifier.size(20.dp))
                    }
                }
            }

            if (!isLocked) {
                Spacer(Modifier.height(12.dp))
                // Progress bar
                Row(verticalAlignment = Alignment.CenterVertically) {
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier.weight(1f).height(6.dp).clip(RoundedCornerShape(3.dp)),
                        color = trackColor,
                        trackColor = trackColor.copy(alpha = 0.1f)
                    )
                    Spacer(Modifier.width(8.dp))
                    Text("${track.completedLessons}/${track.totalLessons}",
                        fontSize = 12.sp, color = trackColor, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ─── TRACK DETAIL (Lessons List) ─────────────────────────────────────────────

@HiltViewModel
class DesignTrackViewModel @Inject constructor(
    private val repository: AlgoRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    private val slug: String = savedStateHandle["slug"] ?: ""
    private val _track = MutableStateFlow<DesignTrackDetail?>(null)
    val track = _track.asStateFlow()
    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    init {
        viewModelScope.launch {
            repository.getDesignTrack(slug).onSuccess { _track.value = it }
            _isLoading.value = false
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DesignTrackScreen(
    onNavigateToLesson: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: DesignTrackViewModel = hiltViewModel()
) {
    val track by viewModel.track.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(track?.name ?: "Track", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") } }
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AlgoBlue)
            }
        } else if (track == null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Track not found")
            }
        } else {
            val t = track!!
            val trackColor = try { Color(android.graphics.Color.parseColor(t.color)) } catch (_: Exception) { AlgoBlue }
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Track header
                item {
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = trackColor.copy(alpha = 0.1f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(t.icon, fontSize = 36.sp)
                            Spacer(Modifier.width(12.dp))
                            Column {
                                Text(t.name, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                                Text(t.description, style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                                Spacer(Modifier.height(4.dp))
                                Text("${t.lessons.size} lessons · ${t.level.uppercase()} level",
                                    fontSize = 12.sp, color = trackColor, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    Spacer(Modifier.height(4.dp))
                }

                itemsIndexed(t.lessons) { index, lesson ->
                    DesignLessonCard(
                        lesson = lesson,
                        index = index,
                        trackColor = trackColor,
                        onClick = { if (lesson.status != "LOCKED") onNavigateToLesson(lesson.slug) }
                    )
                }
                item { Spacer(Modifier.height(16.dp)) }
            }
        }
    }
}

@Composable
private fun DesignLessonCard(
    lesson: DesignLessonSummary,
    index: Int,
    trackColor: Color,
    onClick: () -> Unit
) {
    val isLocked = lesson.status == "LOCKED"
    val isCompleted = lesson.status == "COMPLETED"
    val isInProgress = lesson.status == "IN_PROGRESS"

    Card(
        modifier = Modifier.fillMaxWidth()
            .alpha(if (isLocked) 0.4f else 1f)
            .clickable(enabled = !isLocked, onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isLocked) 0.dp else 2.dp),
        colors = CardDefaults.cardColors(
            containerColor = when {
                isCompleted -> trackColor.copy(alpha = 0.08f)
                else -> MaterialTheme.colorScheme.surface
            }
        )
    ) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            // Step number / status circle
            Box(
                modifier = Modifier.size(40.dp).clip(CircleShape)
                    .background(
                        when {
                            isCompleted -> trackColor.copy(alpha = 0.2f)
                            isInProgress -> trackColor.copy(alpha = 0.12f)
                            isLocked -> Color.Gray.copy(alpha = 0.1f)
                            else -> trackColor.copy(alpha = 0.1f)
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                when {
                    isLocked -> Icon(Icons.Filled.Lock, null, tint = Color.Gray, modifier = Modifier.size(18.dp))
                    isCompleted -> Text("✅", fontSize = 18.sp)
                    else -> Text("${index + 1}", fontWeight = FontWeight.Bold, color = trackColor, fontSize = 16.sp)
                }
            }

            Spacer(Modifier.width(12.dp))

            Column(Modifier.weight(1f)) {
                Text(lesson.title, fontWeight = FontWeight.SemiBold, fontSize = 15.sp,
                    color = if (isLocked) Color.Gray else MaterialTheme.colorScheme.onSurface)
                if (isInProgress) {
                    Spacer(Modifier.height(2.dp))
                    Text("Stage ${lesson.stage}/5 · In progress",
                        fontSize = 12.sp, color = trackColor)
                } else if (isCompleted) {
                    Spacer(Modifier.height(2.dp))
                    Text("Completed", fontSize = 12.sp, color = trackColor)
                }
            }

            if (!isLocked) {
                Icon(Icons.AutoMirrored.Filled.ArrowForward, null,
                    tint = if (isCompleted) trackColor else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f),
                    modifier = Modifier.size(18.dp))
            }
        }
    }
}

// ─── LESSON SCREEN ────────────────────────────────────────────────────────────

@HiltViewModel
class DesignLessonViewModel @Inject constructor(
    private val repository: AlgoRepository,
    val subscriptionManager: SubscriptionManager,
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    private val slug: String = savedStateHandle["slug"] ?: ""
    private val _lesson = MutableStateFlow<DesignLesson?>(null)
    val lesson = _lesson.asStateFlow()
    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()
    private val _isError = MutableStateFlow(false)
    val isError = _isError.asStateFlow()
    private val _needsSubscription = MutableStateFlow(false)
    val needsSubscription = _needsSubscription.asStateFlow()
    private val _stage = MutableStateFlow(0)  // 0-4 (5 stages)
    val stage = _stage.asStateFlow()
    private val _quizIndex = MutableStateFlow(0)
    val quizIndex = _quizIndex.asStateFlow()
    private val _selectedAnswer = MutableStateFlow<Int?>(null)
    val selectedAnswer = _selectedAnswer.asStateFlow()
    private val _showExplanation = MutableStateFlow(false)
    val showExplanation = _showExplanation.asStateFlow()
    private val _score = MutableStateFlow(0)
    val score = _score.asStateFlow()
    private val _isComplete = MutableStateFlow(false)
    val isComplete = _isComplete.asStateFlow()
    private val _xpEarned = MutableStateFlow(0)
    val xpEarned = _xpEarned.asStateFlow()

    init { loadLesson() }

    fun loadLesson() {
        viewModelScope.launch {
            _isLoading.value = true
            _isError.value = false
            _needsSubscription.value = false
            repository.getDesignLesson(slug)
                .onSuccess {
                    _lesson.value = it
                    // Resume from saved stage
                    val savedStage = it.userProgress?.stage ?: 0
                    _stage.value = savedStage.coerceIn(0, 4)
                }
                .onFailure { error ->
                    if (error is SubscriptionRequiredException) _needsSubscription.value = true
                    else _isError.value = true
                }
            _isLoading.value = false
        }
    }

    fun nextStage() {
        val lesson = _lesson.value ?: return
        val nextStage = (_stage.value + 1).coerceAtMost(4)
        _stage.value = nextStage
        // Submit progress for current stage
        viewModelScope.launch {
            repository.submitDesignLessonProgress(
                slug = lesson.slug,
                stage = nextStage,
                score = _score.value,
                completed = false
            )
        }
    }

    fun selectAnswer(index: Int) {
        if (_showExplanation.value) return
        _selectedAnswer.value = index
    }

    fun confirmAnswer() {
        val lesson = _lesson.value ?: return
        val qi = _quizIndex.value
        if (qi >= lesson.quiz.size) return
        val q = lesson.quiz[qi]
        _showExplanation.value = true
        if (_selectedAnswer.value == q.correct) {
            _score.value += 20 // 20 pts per correct quiz answer
        }
    }

    fun nextQuestion() {
        val lesson = _lesson.value ?: return
        val qi = _quizIndex.value + 1
        if (qi >= lesson.quiz.size) {
            // Quiz done — complete the lesson
            viewModelScope.launch {
                val result = repository.submitDesignLessonProgress(
                    slug = lesson.slug, stage = 4, score = _score.value, completed = true
                )
                result.onSuccess { _xpEarned.value = it.xpEarned }
                _isComplete.value = true
            }
        } else {
            _quizIndex.value = qi
            _selectedAnswer.value = null
            _showExplanation.value = false
        }
    }

    fun resetSubscriptionGate() { _needsSubscription.value = false }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DesignLessonScreen(
    onBack: () -> Unit,
    viewModel: DesignLessonViewModel = hiltViewModel()
) {
    val lesson by viewModel.lesson.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val isError by viewModel.isError.collectAsState()
    val needsSubscription by viewModel.needsSubscription.collectAsState()
    val stage by viewModel.stage.collectAsState()
    val quizIndex by viewModel.quizIndex.collectAsState()
    val selectedAnswer by viewModel.selectedAnswer.collectAsState()
    val showExplanation by viewModel.showExplanation.collectAsState()
    val score by viewModel.score.collectAsState()
    val isComplete by viewModel.isComplete.collectAsState()
    val xpEarned by viewModel.xpEarned.collectAsState()

    if (needsSubscription) {
        PaywallDialog(
            PaywallDialogOptions.Builder()
                .setDismissRequest {
                    viewModel.subscriptionManager.refreshSubscriptionStatus()
                    viewModel.resetSubscriptionGate()
                }
                .build()
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(lesson?.title ?: "Lesson", fontWeight = FontWeight.Bold, maxLines = 1) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") } },
                actions = {
                    if (lesson != null) {
                        // Stage indicator
                        Text("${stage + 1}/5", modifier = Modifier.padding(end = 16.dp),
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    }
                }
            )
        }
    ) { padding ->
        when {
            isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AlgoBlue)
            }
            isError -> Box(Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("😕", fontSize = 48.sp)
                    Spacer(Modifier.height(12.dp))
                    Text("Couldn't load lesson", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = { viewModel.loadLesson() },
                        colors = ButtonDefaults.buttonColors(containerColor = AlgoBlue)) {
                        Text("Retry")
                    }
                }
            }
            isComplete -> {
                // Completion screen
                Column(
                    modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("🎉", fontSize = 72.sp)
                    Spacer(Modifier.height(16.dp))
                    Text("Lesson Complete!", style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.ExtraBold, color = AlgoGreen)
                    Spacer(Modifier.height(8.dp))
                    Text(lesson?.title ?: "", textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    Spacer(Modifier.height(24.dp))
                    Card(shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = AlgoGreen.copy(alpha = 0.1f))) {
                        Column(Modifier.padding(24.dp).fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("$score", fontSize = 48.sp, fontWeight = FontWeight.ExtraBold, color = AlgoGreen)
                            Text("points scored", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            if (xpEarned > 0) {
                                Spacer(Modifier.height(12.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text("⚡", fontSize = 20.sp)
                                    Spacer(Modifier.width(4.dp))
                                    Text("+$xpEarned XP", fontWeight = FontWeight.Bold,
                                        color = AlgoOrange, fontSize = 18.sp)
                                }
                            }
                        }
                    }
                    Spacer(Modifier.height(32.dp))
                    Button(
                        onClick = onBack,
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
                    ) { Text("BACK TO TRACK", fontWeight = FontWeight.Bold) }
                }
            }
            lesson != null -> {
                val l = lesson!!
                val trackColor = try { Color(android.graphics.Color.parseColor(l.track.color)) } catch (_: Exception) { AlgoBlue }

                Column(Modifier.fillMaxSize().padding(padding)) {
                    // Stage progress bar
                    LinearProgressIndicator(
                        progress = { (stage + 1) / 5f },
                        modifier = Modifier.fillMaxWidth().height(4.dp),
                        color = trackColor,
                        trackColor = trackColor.copy(alpha = 0.1f)
                    )

                    // Stage tabs
                    val stageLabels = listOf("Overview", "Analogy", "Diagram", "Trade-offs", "Quiz")
                    ScrollableTabRow(
                        selectedTabIndex = stage,
                        containerColor = MaterialTheme.colorScheme.surface,
                        edgePadding = 16.dp
                    ) {
                        stageLabels.forEachIndexed { i, label ->
                            Tab(
                                selected = stage == i,
                                onClick = { /* read-only */ },
                                text = { Text(label, fontSize = 13.sp,
                                    fontWeight = if (stage == i) FontWeight.Bold else FontWeight.Normal) }
                            )
                        }
                    }

                    // Stage content
                    AnimatedContent(
                        targetState = stage,
                        transitionSpec = {
                            if (targetState > initialState) {
                                (slideInHorizontally { it } + fadeIn()) togetherWith
                                        (slideOutHorizontally { -it } + fadeOut())
                            } else {
                                (slideInHorizontally { -it } + fadeIn()) togetherWith
                                        (slideOutHorizontally { it } + fadeOut())
                            }
                        },
                        label = "stage"
                    ) { currentStage ->
                        when (currentStage) {
                            0 -> OverviewStage(lesson = l, trackColor = trackColor, onNext = { viewModel.nextStage() })
                            1 -> AnalogyStage(lesson = l, trackColor = trackColor, onNext = { viewModel.nextStage() })
                            2 -> DiagramStage(lesson = l, trackColor = trackColor, onNext = { viewModel.nextStage() })
                            3 -> TradeoffsStage(lesson = l, trackColor = trackColor, onNext = { viewModel.nextStage() })
                            4 -> QuizStage(
                                lesson = l,
                                quizIndex = quizIndex,
                                selectedAnswer = selectedAnswer,
                                showExplanation = showExplanation,
                                onSelectAnswer = { viewModel.selectAnswer(it) },
                                onConfirm = { viewModel.confirmAnswer() },
                                onNext = { viewModel.nextQuestion() }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StageScaffold(
    title: String,
    icon: String,
    trackColor: Color,
    onNext: () -> Unit,
    buttonLabel: String = "Continue",
    content: @Composable ColumnScope.() -> Unit
) {
    Column(Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(icon, fontSize = 28.sp)
                    Spacer(Modifier.width(8.dp))
                    Text(title, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
                }
            }
            item { Column(verticalArrangement = Arrangement.spacedBy(12.dp)) { content() } }
        }
        // Next button
        Box(Modifier.padding(16.dp)) {
            Button(
                onClick = onNext,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = trackColor)
            ) {
                Text(buttonLabel, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(Modifier.width(8.dp))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, null, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
private fun OverviewStage(lesson: DesignLesson, trackColor: Color, onNext: () -> Unit) {
    StageScaffold("Overview", "📖", trackColor, onNext) {
        // Summary card
        Card(shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = trackColor.copy(alpha = 0.08f))) {
            Column(Modifier.padding(16.dp)) {
                Text("Summary", fontWeight = FontWeight.Bold, color = trackColor)
                Spacer(Modifier.height(8.dp))
                Text(lesson.summary, style = MaterialTheme.typography.bodyLarge, lineHeight = 24.sp)
            }
        }
        // Key points preview
        if (lesson.keyPoints.isNotEmpty()) {
            Card(shape = RoundedCornerShape(16.dp)) {
                Column(Modifier.padding(16.dp)) {
                    Text("⚡ Key Takeaways", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    lesson.keyPoints.take(3).forEach { point ->
                        Row(Modifier.padding(vertical = 3.dp)) {
                            Text("•", color = trackColor, fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(end = 6.dp, top = 2.dp))
                            Text(point, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AnalogyStage(lesson: DesignLesson, trackColor: Color, onNext: () -> Unit) {
    StageScaffold("Analogy", "🧠", trackColor, onNext) {
        Card(shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = AlgoOrange.copy(alpha = 0.08f))) {
            Column(Modifier.padding(16.dp)) {
                Text("Real-World Analogy", fontWeight = FontWeight.Bold, color = AlgoOrange)
                Spacer(Modifier.height(8.dp))
                Text(lesson.analogy, style = MaterialTheme.typography.bodyLarge, lineHeight = 24.sp)
            }
        }
    }
}

@Composable
private fun DiagramStage(lesson: DesignLesson, trackColor: Color, onNext: () -> Unit) {
    var currentStep by remember { mutableIntStateOf(0) }
    StageScaffold("Architecture", "🏗️", trackColor, onNext) {
        // ASCII diagram
        Card(shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0D1117))) {
            Column(Modifier.padding(16.dp)) {
                Text("System Diagram", fontWeight = FontWeight.Bold, color = Color(0xFF79C0FF),
                    fontSize = 13.sp)
                Spacer(Modifier.height(8.dp))
                Text(lesson.diagram,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = Color(0xFFE6EDF3),
                    lineHeight = 16.sp)
            }
        }
        // Diagram steps
        if (lesson.diagramSteps.isNotEmpty()) {
            Card(shape = RoundedCornerShape(16.dp)) {
                Column(Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Step-by-Step", fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                        Text("${currentStep + 1}/${lesson.diagramSteps.size}",
                            fontSize = 12.sp, color = trackColor)
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(lesson.diagramSteps[currentStep],
                        style = MaterialTheme.typography.bodyMedium, lineHeight = 22.sp)
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (currentStep > 0) {
                            OutlinedButton(onClick = { currentStep-- }, modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp)) {
                                Text("Previous")
                            }
                        }
                        if (currentStep < lesson.diagramSteps.size - 1) {
                            Button(onClick = { currentStep++ }, modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = trackColor)) {
                                Text("Next Step")
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TradeoffsStage(lesson: DesignLesson, trackColor: Color, onNext: () -> Unit) {
    StageScaffold("Trade-offs", "⚖️", trackColor, onNext) {
        // Tradeoffs table
        if (lesson.tradeoffs.isNotEmpty()) {
            Card(shape = RoundedCornerShape(16.dp)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Trade-offs", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    lesson.tradeoffs.forEach { tradeoff ->
                        Row(Modifier.padding(vertical = 4.dp)) {
                            Column(Modifier.weight(1f)) {
                                Row {
                                    Text("✅ ", fontSize = 14.sp)
                                    Text(tradeoff.pro, style = MaterialTheme.typography.bodyMedium,
                                        color = AlgoGreen)
                                }
                            }
                            Spacer(Modifier.width(8.dp))
                            Column(Modifier.weight(1f)) {
                                Row {
                                    Text("❌ ", fontSize = 14.sp)
                                    Text(tradeoff.con, style = MaterialTheme.typography.bodyMedium,
                                        color = AlgoRed)
                                }
                            }
                        }
                        HorizontalDivider(Modifier.padding(vertical = 4.dp), color = MaterialTheme.colorScheme.outlineVariant)
                    }
                }
            }
        }
        // When to use / not use
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            if (lesson.whenToUse.isNotEmpty()) {
                Card(Modifier.weight(1f), shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = AlgoGreen.copy(alpha = 0.08f))) {
                    Column(Modifier.padding(12.dp)) {
                        Text("✅ Use When", fontWeight = FontWeight.Bold, color = AlgoGreen, fontSize = 13.sp)
                        Spacer(Modifier.height(6.dp))
                        lesson.whenToUse.forEach {
                            Text("• $it", fontSize = 12.sp,
                                modifier = Modifier.padding(vertical = 2.dp))
                        }
                    }
                }
            }
            if (lesson.whenNotToUse.isNotEmpty()) {
                Card(Modifier.weight(1f), shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = AlgoRed.copy(alpha = 0.08f))) {
                    Column(Modifier.padding(12.dp)) {
                        Text("❌ Avoid When", fontWeight = FontWeight.Bold, color = AlgoRed, fontSize = 13.sp)
                        Spacer(Modifier.height(6.dp))
                        lesson.whenNotToUse.forEach {
                            Text("• $it", fontSize = 12.sp,
                                modifier = Modifier.padding(vertical = 2.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun QuizStage(
    lesson: DesignLesson,
    quizIndex: Int,
    selectedAnswer: Int?,
    showExplanation: Boolean,
    onSelectAnswer: (Int) -> Unit,
    onConfirm: () -> Unit,
    onNext: () -> Unit
) {
    if (lesson.quiz.isEmpty()) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No quiz available for this lesson.")
        }
        return
    }
    val q = lesson.quiz.getOrNull(quizIndex) ?: return
    val isCorrect = selectedAnswer == q.correct

    Column(Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("🧪", fontSize = 28.sp)
                    Spacer(Modifier.width(8.dp))
                    Text("Quiz", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
                    Spacer(Modifier.weight(1f))
                    Text("${quizIndex + 1}/${lesson.quiz.size}",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                }
            }
            item {
                Card(shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = AlgoBlue.copy(alpha = 0.08f))) {
                    Text(q.question, Modifier.padding(16.dp),
                        style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold,
                        lineHeight = 24.sp)
                }
            }
            itemsIndexed(q.options) { i, option ->
                val bgColor = when {
                    !showExplanation && selectedAnswer == i -> AlgoBlue.copy(alpha = 0.15f)
                    showExplanation && i == q.correct -> AlgoGreen.copy(alpha = 0.15f)
                    showExplanation && selectedAnswer == i && !isCorrect -> AlgoRed.copy(alpha = 0.15f)
                    else -> MaterialTheme.colorScheme.surface
                }
                val borderColor = when {
                    !showExplanation && selectedAnswer == i -> AlgoBlue
                    showExplanation && i == q.correct -> AlgoGreen
                    showExplanation && selectedAnswer == i && !isCorrect -> AlgoRed
                    else -> Color.Transparent
                }
                Card(
                    modifier = Modifier.fillMaxWidth()
                        .border(2.dp, borderColor, RoundedCornerShape(14.dp))
                        .clickable(enabled = !showExplanation) { onSelectAnswer(i) },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = bgColor)
                ) {
                    Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(('A' + i).toString(), fontWeight = FontWeight.Bold,
                            color = borderColor.takeIf { it != Color.Transparent }
                                ?: MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                            modifier = Modifier.padding(end = 10.dp))
                        Text(option, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                        if (showExplanation) {
                            if (i == q.correct) Text("✅", fontSize = 16.sp)
                            else if (selectedAnswer == i) Text("❌", fontSize = 16.sp)
                        }
                    }
                }
            }
            if (showExplanation) {
                item {
                    Card(shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isCorrect) AlgoGreen.copy(alpha = 0.1f) else AlgoOrange.copy(alpha = 0.1f)
                        )) {
                        Column(Modifier.padding(14.dp)) {
                            Text(if (isCorrect) "✅ Correct!" else "💡 Explanation",
                                fontWeight = FontWeight.Bold,
                                color = if (isCorrect) AlgoGreen else AlgoOrange)
                            Spacer(Modifier.height(4.dp))
                            Text(q.explanation, style = MaterialTheme.typography.bodyMedium, lineHeight = 22.sp)
                        }
                    }
                }
            }
        }
        // Action button
        Box(Modifier.padding(16.dp)) {
            when {
                selectedAnswer == null -> {
                    Button(
                        onClick = {}, enabled = false,
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) { Text("Select an answer") }
                }
                !showExplanation -> {
                    Button(
                        onClick = onConfirm,
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AlgoBlue)
                    ) { Text("CHECK ANSWER", fontWeight = FontWeight.Bold) }
                }
                else -> {
                    val isLast = quizIndex >= lesson.quiz.size - 1
                    Button(
                        onClick = onNext,
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isLast) AlgoGreen else AlgoBlue
                        )
                    ) {
                        Text(if (isLast) "FINISH LESSON 🎉" else "NEXT QUESTION",
                            fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
