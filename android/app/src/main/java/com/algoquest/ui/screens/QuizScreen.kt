package com.algoquest.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import com.algoquest.ui.components.ConfettiAnimation
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
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
import com.algoquest.ui.components.*
import com.algoquest.ui.theme.*
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialog
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialogOptions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class QuizState(
    val currentQuestion: Int = 0,
    val score: Int = 0,
    val mistakes: Int = 0,
    val selectedAnswer: Int? = null,
    val showResult: Boolean = false,
    val isCorrect: Boolean = false,
    val quizComplete: Boolean = false,
    val submitResult: SubmitResponse? = null
)

@HiltViewModel
class QuizViewModel @Inject constructor(
    private val repository: AlgoRepository,
    val subscriptionManager: SubscriptionManager,
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    private val slug: String = savedStateHandle["slug"] ?: ""
    private val _problem = MutableStateFlow<Problem?>(null)
    val problem = _problem.asStateFlow()
    private val _state = MutableStateFlow(QuizState())
    val state = _state.asStateFlow()
    private val _hearts = MutableStateFlow(5)
    val hearts = _hearts.asStateFlow()
    private val _needsSubscription = MutableStateFlow(false)
    val needsSubscription = _needsSubscription.asStateFlow()

    init {
        viewModelScope.launch {
            repository.getProblem(slug)
                .onSuccess { _problem.value = it }
                .onFailure { if (it is SubscriptionRequiredException) _needsSubscription.value = true }
            repository.getProfile().onSuccess { _hearts.value = it.hearts }
        }
    }

    fun retryLoad() {
        viewModelScope.launch {
            _needsSubscription.value = false
            repository.getProblem(slug)
                .onSuccess { _problem.value = it }
                .onFailure { if (it is SubscriptionRequiredException) _needsSubscription.value = true }
        }
    }

    fun selectAnswer(index: Int) {
        val quiz = _problem.value?.quiz ?: return
        val question = quiz[_state.value.currentQuestion]
        val correct = index == question.correct

        _state.value = _state.value.copy(
            selectedAnswer = index,
            showResult = true,
            isCorrect = correct,
            score = if (correct) _state.value.score + 1 else _state.value.score,
            mistakes = if (!correct) _state.value.mistakes + 1 else _state.value.mistakes
        )

        if (!correct) {
            viewModelScope.launch {
                repository.useHeart().onSuccess { _hearts.value = it.hearts }
            }
        }
    }

    fun nextQuestion() {
        val quiz = _problem.value?.quiz ?: return
        val nextIdx = _state.value.currentQuestion + 1

        if (nextIdx >= quiz.size) {
            // Quiz complete - submit progress
            _state.value = _state.value.copy(quizComplete = true)
            submitProgress()
        } else {
            _state.value = _state.value.copy(
                currentQuestion = nextIdx,
                selectedAnswer = null,
                showResult = false,
                isCorrect = false
            )
        }
    }

    private fun submitProgress() {
        viewModelScope.launch {
            val p = _problem.value ?: return@launch
            val perfect = _state.value.mistakes == 0
            val totalQuestions = p.quiz.size.coerceAtLeast(1)
            val scorePercent = (_state.value.score * 100) / totalQuestions
            repository.submitProgress(p.id, 4, scorePercent, perfect)
                .onSuccess { _state.value = _state.value.copy(submitResult = it) }
        }
    }

    fun hasHearts(): Boolean = _hearts.value > 0
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuizScreen(
    onComplete: () -> Unit,
    onBack: () -> Unit,
    viewModel: QuizViewModel = hiltViewModel()
) {
    val problem by viewModel.problem.collectAsState()
    val state by viewModel.state.collectAsState()
    val hearts by viewModel.hearts.collectAsState()
    val needsSubscription by viewModel.needsSubscription.collectAsState()

    if (needsSubscription) {
        PaywallDialog(
            PaywallDialogOptions.Builder()
                .setDismissRequest {
                    viewModel.subscriptionManager.refreshSubscriptionStatus()
                    viewModel.retryLoad()
                }
                .build()
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Quiz", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.Close, "Close") } },
                actions = { HeartBar(hearts = hearts) }
            )
        }
    ) { padding ->
        problem?.let { p ->
            if (state.quizComplete) {
                // ==================== COMPLETION SCREEN ====================
                CompletionScreen(
                    state = state,
                    problemTitle = p.title,
                    totalQuestions = p.quiz.size,
                    onContinue = onComplete
                )
            } else if (hearts <= 0 && !state.showResult) {
                // ==================== OUT OF HEARTS ====================
                Column(
                    modifier = Modifier.fillMaxSize().padding(padding).padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("\uD83D\uDC94", fontSize = 64.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Out of Hearts!", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = AlgoRed)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Hearts refill 1 every 30 minutes.\nReview completed lessons for free practice!", textAlign = TextAlign.Center, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(onClick = onBack, shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)) {
                        Text("Go Back", fontWeight = FontWeight.Bold)
                    }
                }
            } else if (p.quiz.isNotEmpty()) {
                val question = p.quiz[state.currentQuestion]

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(16.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    // Progress bar
                    LinearProgressIndicator(
                        progress = { (state.currentQuestion + 1).toFloat() / p.quiz.size },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = AlgoGreen,
                        trackColor = AlgoGreen.copy(alpha = 0.1f),
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        "Question ${state.currentQuestion + 1} of ${p.quiz.size}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // Question
                    Text(
                        question.question,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // Multiple choice options
                    if (question.type == "multiple_choice" && question.options != null) {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            question.options.forEachIndexed { index, option ->
                                val isSelected = state.selectedAnswer == index
                                val isCorrectOption = index == question.correct
                                val showingResult = state.showResult

                                val bgColor = when {
                                    showingResult && isCorrectOption -> AlgoGreen.copy(alpha = 0.15f)
                                    showingResult && isSelected && !state.isCorrect -> AlgoRed.copy(alpha = 0.15f)
                                    isSelected -> AlgoBlue.copy(alpha = 0.1f)
                                    else -> MaterialTheme.colorScheme.surface
                                }

                                val borderColor = when {
                                    showingResult && isCorrectOption -> AlgoGreen
                                    showingResult && isSelected && !state.isCorrect -> AlgoRed
                                    isSelected -> AlgoBlue
                                    else -> MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                                }

                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable(enabled = !showingResult) {
                                            viewModel.selectAnswer(index)
                                        }
                                        .border(2.dp, borderColor, RoundedCornerShape(12.dp)),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = bgColor)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(16.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        // Option letter
                                        Box(
                                            modifier = Modifier
                                                .size(32.dp)
                                                .clip(CircleShape)
                                                .background(borderColor.copy(alpha = 0.2f)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                ('A' + index).toString(),
                                                fontWeight = FontWeight.Bold,
                                                color = borderColor
                                            )
                                        }
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Text(
                                            option,
                                            style = MaterialTheme.typography.bodyLarge,
                                            modifier = Modifier.weight(1f)
                                        )
                                        if (showingResult && isCorrectOption) {
                                            Icon(Icons.Filled.CheckCircle, null, tint = AlgoGreen)
                                        }
                                        if (showingResult && isSelected && !state.isCorrect) {
                                            Icon(Icons.Filled.Cancel, null, tint = AlgoRed)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Fill in the blank
                    if (question.type == "fill_blank") {
                        var answer by remember { mutableStateOf("") }
                        OutlinedTextField(
                            value = answer,
                            onValueChange = { answer = it },
                            label = { Text("Your answer") },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {
                                val correct = answer.trim().equals(question.answer?.trim(), ignoreCase = true)
                                viewModel.selectAnswer(if (correct) (question.correct ?: 0) else -1)
                            },
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen),
                            enabled = answer.isNotBlank() && !state.showResult
                        ) { Text("Submit", fontWeight = FontWeight.Bold) }
                    }

                    // Code ordering — show as numbered steps to arrange
                    if (question.type == "code_order" && question.options != null) {
                        val steps = remember { mutableStateListOf(*question.options.toTypedArray()) }
                        var submitted by remember { mutableStateOf(false) }

                        Text(
                            "Tap items to reorder them:",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            steps.forEachIndexed { index, step ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable(enabled = !submitted && index < steps.size - 1) {
                                            // Swap with next item
                                            val temp = steps[index]
                                            steps[index] = steps[index + 1]
                                            steps[index + 1] = temp
                                        },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = CardDefaults.cardColors(containerColor = AlgoBlue.copy(alpha = 0.08f))
                                ) {
                                    Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Box(
                                            modifier = Modifier.size(28.dp).clip(CircleShape).background(AlgoBlue.copy(alpha = 0.2f)),
                                            contentAlignment = Alignment.Center
                                        ) { Text("${index + 1}", fontWeight = FontWeight.Bold, color = AlgoBlue, fontSize = 12.sp) }
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Text(step, style = MaterialTheme.typography.bodyMedium)
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        if (!submitted) {
                            Button(
                                onClick = {
                                    submitted = true
                                    val correctOrder = question.correctOrder?.map { question.options[it] }
                                    val isCorrect = steps.toList() == correctOrder
                                    viewModel.selectAnswer(if (isCorrect) (question.correct ?: 0) else -1)
                                },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
                            ) { Text("Check Order", fontWeight = FontWeight.Bold) }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Result feedback + next button
                    AnimatedVisibility(visible = state.showResult) {
                        Column {
                            Card(
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (state.isCorrect) AlgoGreen.copy(alpha = 0.1f)
                                    else AlgoRed.copy(alpha = 0.1f)
                                )
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        if (state.isCorrect) "\u2705 Correct!" else "\u274C Incorrect",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 18.sp,
                                        color = if (state.isCorrect) AlgoGreen else AlgoRed
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(question.explanation, style = MaterialTheme.typography.bodyMedium)
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Button(
                                onClick = { viewModel.nextQuestion() },
                                modifier = Modifier.fillMaxWidth().height(52.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
                            ) {
                                Text("CONTINUE", fontWeight = FontWeight.Bold, fontSize = 16.sp)
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

@Composable
private fun CompletionScreen(
    state: QuizState,
    problemTitle: String,
    totalQuestions: Int,
    onContinue: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        // Confetti overlay for perfect score
        ConfettiAnimation(isPlaying = state.mistakes == 0)

        Column(
            modifier = Modifier.fillMaxSize().padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Celebration emoji
            Text(
                if (state.mistakes == 0) "\uD83C\uDF89" else "\uD83C\uDF1F",
                fontSize = 64.sp
            )
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            if (state.mistakes == 0) "PERFECT!" else "Well Done!",
            style = MaterialTheme.typography.displayLarge,
            fontWeight = FontWeight.ExtraBold,
            color = if (state.mistakes == 0) AlgoGold else AlgoGreen
        )

        Text(
            problemTitle,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Stats
        Card(
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("${state.score}/$totalQuestions", fontWeight = FontWeight.Bold, fontSize = 24.sp, color = AlgoGreen)
                        Text("Correct", style = MaterialTheme.typography.bodySmall)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("+${state.submitResult?.xpEarned ?: 0}", fontWeight = FontWeight.Bold, fontSize = 24.sp, color = AlgoOrange)
                        Text("XP Earned", style = MaterialTheme.typography.bodySmall)
                    }
                }

                state.submitResult?.let { result ->
                    Spacer(modifier = Modifier.height(16.dp))

                    if (result.leveledUp) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = AlgoGold.copy(alpha = 0.15f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                "\uD83C\uDF1F LEVEL UP! You're now ${result.levelTitle}!",
                                modifier = Modifier.padding(12.dp),
                                fontWeight = FontWeight.Bold,
                                color = AlgoGold,
                                textAlign = TextAlign.Center
                            )
                        }
                    }

                    if (result.streakBonus > 0) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = AlgoYellow.copy(alpha = 0.15f),
                            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                        ) {
                            Text(
                                "\uD83D\uDD25 ${result.streak}-day streak! +${result.streakBonus} bonus XP",
                                modifier = Modifier.padding(12.dp),
                                fontWeight = FontWeight.Bold,
                                color = AlgoYellow,
                                textAlign = TextAlign.Center
                            )
                        }
                    }

                    result.unlockedProblem?.let { unlocked ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = AlgoBlue.copy(alpha = 0.15f),
                            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                        ) {
                            Text(
                                "\uD83D\uDD13 Unlocked: ${unlocked.title}",
                                modifier = Modifier.padding(12.dp),
                                fontWeight = FontWeight.Bold,
                                color = AlgoBlue,
                                textAlign = TextAlign.Center
                            )
                        }
                    }

                    result.newAchievements.forEach { achievement ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = AlgoPurple.copy(alpha = 0.15f),
                            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                        ) {
                            Text(
                                "${achievement.icon} ${achievement.name}: ${achievement.description}",
                                modifier = Modifier.padding(12.dp),
                                fontWeight = FontWeight.Bold,
                                color = AlgoPurple,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = onContinue,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
        ) {
            Text("CONTINUE", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
        }
    }
}
