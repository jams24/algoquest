package com.algoquest.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.algoquest.data.model.*
import com.algoquest.data.repository.AlgoRepository
import com.algoquest.data.subscription.SubscriptionManager
import com.algoquest.ui.components.*
import com.algoquest.ui.theme.*
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialog
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialogOptions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class InterviewState(
    val isStarted: Boolean = false,
    val problem: Problem? = null,
    val selectedLang: String = "python",
    val timeRemaining: Int = 0,    // seconds
    val timeTotal: Int = 0,
    val isFinished: Boolean = false,
    val showSolution: Boolean = false,
    val difficulty: String = ""
)

@HiltViewModel
class InterviewPrepViewModel @Inject constructor(
    private val repository: AlgoRepository,
    val subscriptionManager: SubscriptionManager
) : ViewModel() {
    private val _state = MutableStateFlow(InterviewState())
    val state = _state.asStateFlow()
    private val _needsSubscription = MutableStateFlow(false)
    val needsSubscription = _needsSubscription.asStateFlow()
    private var timerJob: Job? = null

    fun startInterview(difficulty: String) {
        viewModelScope.launch {
            // Get a random problem from completed topics
            val topics = repository.getTopics().getOrNull() ?: return@launch
            val unlockedSlugs = topics.filter { it.isUnlocked && it.totalProblems > 0 }.map { it.slug }
            if (unlockedSlugs.isEmpty()) return@launch

            val randomTopicSlug = unlockedSlugs.random()
            val topicDetail = repository.getTopicProblems(randomTopicSlug).getOrNull() ?: return@launch
            val matchingProblems = topicDetail.problems.filter {
                difficulty == "any" || it.difficulty.equals(difficulty, ignoreCase = true)
            }
            if (matchingProblems.isEmpty()) {
                // Fallback to any problem
                val anyProblem = topicDetail.problems.randomOrNull() ?: return@launch
                loadProblem(anyProblem.slug, difficulty)
            } else {
                loadProblem(matchingProblems.random().slug, difficulty)
            }
        }
    }

    private fun loadProblem(slug: String, difficulty: String) {
        viewModelScope.launch {
            val result = repository.getProblem(slug)
            result.onFailure { if (it is SubscriptionRequiredException) _needsSubscription.value = true }
            result.onSuccess { problem ->
                val timeSeconds = when (problem.difficulty.uppercase()) {
                    "EASY" -> 15 * 60    // 15 min
                    "MEDIUM" -> 25 * 60  // 25 min
                    "HARD" -> 35 * 60    // 35 min
                    else -> 20 * 60
                }
                _state.value = InterviewState(
                    isStarted = true,
                    problem = problem,
                    timeRemaining = timeSeconds,
                    timeTotal = timeSeconds,
                    difficulty = difficulty
                )
                startTimer()
            }
        }
    }

    private fun startTimer() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (_state.value.timeRemaining > 0 && !_state.value.isFinished) {
                delay(1000)
                _state.value = _state.value.copy(timeRemaining = _state.value.timeRemaining - 1)
            }
            if (_state.value.timeRemaining <= 0) {
                _state.value = _state.value.copy(isFinished = true)
            }
        }
    }

    fun finish() {
        timerJob?.cancel()
        _state.value = _state.value.copy(isFinished = true)
    }

    fun showSolution() {
        _state.value = _state.value.copy(showSolution = true)
    }

    fun setLanguage(lang: String) {
        _state.value = _state.value.copy(selectedLang = lang)
    }

    fun reset() {
        timerJob?.cancel()
        _state.value = InterviewState()
    }

    fun resetSubscriptionGate() {
        _needsSubscription.value = false
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InterviewPrepScreen(
    onBack: () -> Unit,
    onNavigateToLesson: (String) -> Unit,
    viewModel: InterviewPrepViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val needsSubscription by viewModel.needsSubscription.collectAsState()

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
                title = { Text("Interview Prep", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = {
                        viewModel.reset()
                        onBack()
                    }) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") }
                },
                actions = {
                    if (state.isStarted && !state.isFinished) {
                        // Timer
                        val mins = state.timeRemaining / 60
                        val secs = state.timeRemaining % 60
                        val timerColor = when {
                            state.timeRemaining < 60 -> AlgoRed
                            state.timeRemaining < 300 -> AlgoOrange
                            else -> AlgoGreen
                        }
                        Text(
                            "%02d:%02d".format(mins, secs),
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 18.sp,
                            color = timerColor,
                            modifier = Modifier.padding(end = 16.dp)
                        )
                    }
                }
            )
        }
    ) { padding ->
        when {
            // ==================== DIFFICULTY SELECTION ====================
            !state.isStarted -> {
                Column(
                    modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("\uD83C\uDFAF", fontSize = 64.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Interview Mode", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.ExtraBold)
                    Text(
                        "Simulate a real coding interview.\nNo hints. Timed. Just you and the problem.",
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                    Spacer(modifier = Modifier.height(32.dp))

                    Text("Choose difficulty:", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(modifier = Modifier.height(16.dp))

                    listOf(
                        Triple("EASY", EasyColor, "15 minutes"),
                        Triple("MEDIUM", MediumColor, "25 minutes"),
                        Triple("HARD", HardColor, "35 minutes"),
                        Triple("any", AlgoPurple, "Random difficulty")
                    ).forEach { (diff, color, time) ->
                        Button(
                            onClick = { viewModel.startInterview(diff) },
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).height(56.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = color)
                        ) {
                            Text(
                                if (diff == "any") "RANDOM" else diff,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                            Spacer(modifier = Modifier.weight(1f))
                            Text(time, fontSize = 14.sp, color = Color.White.copy(alpha = 0.8f))
                        }
                    }
                }
            }

            // ==================== INTERVIEW IN PROGRESS ====================
            state.isStarted && !state.isFinished -> {
                val p = state.problem ?: return@Scaffold
                Column(
                    modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp)
                ) {
                    // Timer progress bar
                    LinearProgressIndicator(
                        progress = { state.timeRemaining.toFloat() / state.timeTotal.coerceAtLeast(1) },
                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                        color = when {
                            state.timeRemaining < 60 -> AlgoRed
                            state.timeRemaining < 300 -> AlgoOrange
                            else -> AlgoGreen
                        },
                        trackColor = Color.Gray.copy(alpha = 0.1f),
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    // Problem title + difficulty
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(p.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                        DifficultyBadge(p.difficulty)
                    }
                    Text(p.topic.name, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))

                    Spacer(modifier = Modifier.height(16.dp))

                    // Problem description (story only — no hints!)
                    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = AlgoBlue.copy(alpha = 0.08f))) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("\uD83D\uDCCB Problem", fontWeight = FontWeight.Bold, color = AlgoBlue)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(p.story, style = MaterialTheme.typography.bodyLarge)
                        }
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    // Finish button
                    Button(
                        onClick = { viewModel.finish() },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
                    ) {
                        Text("I'M DONE", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }

            // ==================== RESULTS ====================
            state.isFinished -> {
                val p = state.problem ?: return@Scaffold
                val timeUsed = state.timeTotal - state.timeRemaining
                val mins = timeUsed / 60
                val secs = timeUsed % 60

                Column(
                    modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(if (state.timeRemaining > 0) "\uD83C\uDF1F" else "\u23F0", fontSize = 56.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        if (state.timeRemaining > 0) "Completed!" else "Time's Up!",
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (state.timeRemaining > 0) AlgoGreen else AlgoRed
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // Stats card
                    Card(shape = RoundedCornerShape(20.dp)) {
                        Column(modifier = Modifier.padding(24.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(p.title, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                            DifficultyBadge(p.difficulty)
                            Spacer(modifier = Modifier.height(16.dp))
                            Row(horizontalArrangement = Arrangement.SpaceEvenly, modifier = Modifier.fillMaxWidth()) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("%02d:%02d".format(mins, secs), fontWeight = FontWeight.Bold, fontSize = 24.sp, color = AlgoBlue, fontFamily = FontFamily.Monospace)
                                    Text("Time Used", style = MaterialTheme.typography.bodySmall)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(p.pattern, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = AlgoOrange)
                                    Text("Pattern", style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Show solution button
                    if (!state.showSolution) {
                        OutlinedButton(
                            onClick = { viewModel.showSolution() },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Filled.Visibility, null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("View Solution", fontWeight = FontWeight.Bold)
                        }
                    } else {
                        // Language selector
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("python" to "Python", "java" to "Java", "cpp" to "C++").forEach { (key, label) ->
                                FilterChip(
                                    selected = state.selectedLang == key,
                                    onClick = { viewModel.setLanguage(key) },
                                    label = { Text(label) }
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        val solution = p.solutions[state.selectedLang]
                        if (solution != null) {
                            CodeBlock(code = solution.code, language = state.selectedLang)
                        }
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        OutlinedButton(
                            onClick = { onNavigateToLesson(p.slug) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        ) { Text("Study This") }

                        Button(
                            onClick = { viewModel.reset() },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
                        ) { Text("Try Another", fontWeight = FontWeight.Bold) }
                    }
                }
            }
        }
    }
}
