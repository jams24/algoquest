package com.algoquest.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.algoquest.data.model.Problem
import com.algoquest.data.model.SubscriptionRequiredException
import com.algoquest.data.repository.AlgoRepository
import com.algoquest.data.subscription.SubscriptionManager
import com.algoquest.ui.components.*
import com.algoquest.ui.theme.*
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialog
import com.revenuecat.purchases.ui.revenuecatui.PaywallDialogOptions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LessonViewModel @Inject constructor(
    private val repository: AlgoRepository,
    val subscriptionManager: SubscriptionManager,
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    private val slug: String = savedStateHandle["slug"] ?: ""
    private val _problem = MutableStateFlow<Problem?>(null)
    val problem = _problem.asStateFlow()
    private val _currentStage = MutableStateFlow(1) // 1=Learn, 2=Understand
    val currentStage = _currentStage.asStateFlow()
    private val _selectedLang = MutableStateFlow("python")
    val selectedLang = _selectedLang.asStateFlow()
    private val _isError = MutableStateFlow(false)
    val isError = _isError.asStateFlow()
    private val _needsSubscription = MutableStateFlow(false)
    val needsSubscription = _needsSubscription.asStateFlow()
    private val _currentVisualStep = MutableStateFlow(0)
    val currentVisualStep = _currentVisualStep.asStateFlow()
    private val _highlightedCodeLine = MutableStateFlow<Int?>(null)
    val highlightedCodeLine = _highlightedCodeLine.asStateFlow()
    private val _showHint = MutableStateFlow(0) // 0 = no hint, 1-3 = hint level
    val showHint = _showHint.asStateFlow()

    init {
        loadProblem()
        // Load user's preferred language
        viewModelScope.launch {
            repository.getProfile().onSuccess { _selectedLang.value = it.preferredLang }
        }
    }

    fun loadProblem() {
        viewModelScope.launch {
            _isError.value = false
            _needsSubscription.value = false
            repository.getProblem(slug)
                .onSuccess { _problem.value = it }
                .onFailure { error ->
                    if (error is SubscriptionRequiredException) _needsSubscription.value = true
                    else _isError.value = true
                }
        }
    }

    fun nextVisualStep() {
        val max = _problem.value?.visualSteps?.size ?: 0
        if (_currentVisualStep.value < max - 1) _currentVisualStep.value++
    }

    fun prevVisualStep() {
        if (_currentVisualStep.value > 0) _currentVisualStep.value--
    }

    fun setLanguage(lang: String) { _selectedLang.value = lang }

    fun highlightLine(line: Int?) { _highlightedCodeLine.value = line }

    fun advanceStage() { if (_currentStage.value < 2) _currentStage.value++ }

    fun goBackStage() { if (_currentStage.value > 1) _currentStage.value-- }

    fun showNextHint() {
        val max = _problem.value?.hints?.size ?: 0
        if (_showHint.value < max) _showHint.value++
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LessonScreen(
    onNavigateToQuiz: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: LessonViewModel = hiltViewModel()
) {
    val problem by viewModel.problem.collectAsState()
    val currentStage by viewModel.currentStage.collectAsState()
    val selectedLang by viewModel.selectedLang.collectAsState()
    val currentStep by viewModel.currentVisualStep.collectAsState()
    val highlightedLine by viewModel.highlightedCodeLine.collectAsState()
    val hintLevel by viewModel.showHint.collectAsState()
    val isError by viewModel.isError.collectAsState()
    val needsSubscription by viewModel.needsSubscription.collectAsState()

    if (needsSubscription) {
        PaywallDialog(
            PaywallDialogOptions.Builder()
                .setDismissRequest {
                    viewModel.subscriptionManager.refreshSubscriptionStatus()
                    viewModel.loadProblem()
                }
                .build()
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(problem?.title ?: "Loading...", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(
                            when (currentStage) { 1 -> "Stage 1: Learn"; 2 -> "Stage 2: Understand"; else -> "Stage $currentStage" },
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") } },
                actions = {
                    problem?.let { DifficultyBadge(it.difficulty) }
                    Spacer(modifier = Modifier.width(8.dp))
                }
            )
        },
        bottomBar = {
            Surface(shadowElevation = 8.dp) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (currentStage > 1) {
                        OutlinedButton(
                            onClick = { viewModel.goBackStage() },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        ) { Text("Back") }
                    }
                    Button(
                        onClick = {
                            if (currentStage < 2) viewModel.advanceStage()
                            else problem?.slug?.let { onNavigateToQuiz(it) }
                        },
                        modifier = Modifier.weight(if (currentStage > 1) 1f else 2f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
                    ) {
                        Text(
                            if (currentStage < 2) "CONTINUE" else "START QUIZ",
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, null, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    ) { padding ->
        problem?.let { p ->
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Stage progress indicator
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("Learn", "Understand", "Practice", "Master").forEachIndexed { i, name ->
                            val stageNum = i + 1
                            val isActive = stageNum == currentStage
                            val isDone = stageNum < currentStage

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(4.dp)
                                    .clip(RoundedCornerShape(2.dp))
                                    .background(
                                        when {
                                            isDone -> AlgoGreen
                                            isActive -> AlgoGreen.copy(alpha = 0.5f)
                                            else -> Color.Gray.copy(alpha = 0.2f)
                                        }
                                    )
                            )
                        }
                    }
                }

                when (currentStage) {
                    // ==================== STAGE 1: LEARN ====================
                    1 -> {
                        // Story
                        item {
                            Card(
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = AlgoBlue.copy(alpha = 0.08f))
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text("\uD83D\uDCD6", fontSize = 24.sp)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("The Story", fontWeight = FontWeight.Bold, color = AlgoBlue, fontSize = 18.sp)
                                    }
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Text(p.story, style = MaterialTheme.typography.bodyLarge, lineHeight = 24.sp)
                                }
                            }
                        }

                        // Visual walkthrough
                        item {
                            Card(shape = RoundedCornerShape(16.dp)) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text("\uD83D\uDC41\uFE0F Visual Walkthrough", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                                    Spacer(modifier = Modifier.height(12.dp))

                                    // Step indicator
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.Center,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        p.visualSteps.forEachIndexed { i, _ ->
                                            Box(
                                                modifier = Modifier
                                                    .size(if (i == currentStep) 10.dp else 6.dp)
                                                    .clip(CircleShape)
                                                    .background(if (i == currentStep) AlgoGreen else Color.Gray.copy(alpha = 0.3f))
                                            )
                                            if (i < p.visualSteps.size - 1) Spacer(modifier = Modifier.width(6.dp))
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(16.dp))

                                    // Current step
                                    val step = p.visualSteps[currentStep]
                                    AnimatedContent(targetState = currentStep, label = "step") { _ ->
                                        Column {
                                            Text(
                                                "Step ${step.step}",
                                                fontWeight = FontWeight.Bold,
                                                color = AlgoGreen,
                                                fontSize = 14.sp
                                            )
                                            Text(step.description, style = MaterialTheme.typography.bodyLarge)
                                            Spacer(modifier = Modifier.height(8.dp))
                                            // Diagram
                                            Surface(
                                                shape = RoundedCornerShape(8.dp),
                                                color = Color(0xFF1E1E2E)
                                            ) {
                                                Text(
                                                    step.diagram,
                                                    modifier = Modifier.padding(12.dp),
                                                    color = Color(0xFFCDD6F4),
                                                    fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                                                    fontSize = 13.sp
                                                )
                                            }
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(12.dp))

                                    // Navigation
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        TextButton(
                                            onClick = { viewModel.prevVisualStep() },
                                            enabled = currentStep > 0
                                        ) {
                                            Icon(Icons.AutoMirrored.Filled.ArrowBack, null, modifier = Modifier.size(16.dp))
                                            Text(" Previous")
                                        }
                                        TextButton(
                                            onClick = { viewModel.nextVisualStep() },
                                            enabled = currentStep < p.visualSteps.size - 1
                                        ) {
                                            Text("Next ")
                                            Icon(Icons.AutoMirrored.Filled.ArrowForward, null, modifier = Modifier.size(16.dp))
                                        }
                                    }
                                }
                            }
                        }

                        // Pattern + Memory Trick
                        item {
                            Card(
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = AlgoOrange.copy(alpha = 0.08f))
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text("\uD83E\uDDE9 Pattern: ${p.pattern}", fontWeight = FontWeight.Bold, color = AlgoOrange, fontSize = 16.sp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(p.patternExplanation, style = MaterialTheme.typography.bodyLarge)
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Surface(
                                        shape = RoundedCornerShape(12.dp),
                                        color = AlgoYellow.copy(alpha = 0.12f)
                                    ) {
                                        Row(modifier = Modifier.padding(12.dp)) {
                                            Text("\uD83D\uDCA1", fontSize = 20.sp)
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Column {
                                                Text("Memory Trick", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                                Text(p.memoryTrick, style = MaterialTheme.typography.bodyMedium)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // ==================== STAGE 2: UNDERSTAND (Code) ====================
                    2 -> {
                        // Language selector
                        item {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                listOf("python" to "Python", "java" to "Java", "cpp" to "C++").forEach { (key, label) ->
                                    FilterChip(
                                        selected = selectedLang == key,
                                        onClick = { viewModel.setLanguage(key) },
                                        label = { Text(label, fontWeight = FontWeight.SemiBold) },
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = AlgoGreen.copy(alpha = 0.2f)
                                        )
                                    )
                                }
                            }
                        }

                        // Code block
                        item {
                            val solution = p.solutions[selectedLang]
                            if (solution != null) {
                                CodeBlock(
                                    code = solution.code,
                                    language = selectedLang,
                                    lineExplanations = solution.lineExplanations,
                                    highlightedLine = highlightedLine
                                )
                            }
                        }

                        // Line-by-line explanations
                        item {
                            val solution = p.solutions[selectedLang]
                            if (solution != null) {
                                Card(shape = RoundedCornerShape(16.dp)) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Text(
                                            "\uD83D\uDD0D Line-by-Line Explanation",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 16.sp
                                        )
                                        Text(
                                            "Tap any line to highlight it in the code above",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                        )
                                        Spacer(modifier = Modifier.height(12.dp))

                                        solution.lineExplanations.forEachIndexed { index, explanation ->
                                            if (explanation.isNotBlank()) {
                                                Surface(
                                                    modifier = Modifier
                                                        .fillMaxWidth()
                                                        .clickable { viewModel.highlightLine(index) },
                                                    shape = RoundedCornerShape(8.dp),
                                                    color = if (highlightedLine == index) AlgoGreen.copy(alpha = 0.1f)
                                                    else Color.Transparent
                                                ) {
                                                    Row(
                                                        modifier = Modifier.padding(8.dp),
                                                        verticalAlignment = Alignment.Top
                                                    ) {
                                                        Text(
                                                            "L${index + 1}",
                                                            fontWeight = FontWeight.Bold,
                                                            fontSize = 11.sp,
                                                            color = AlgoGreen,
                                                            modifier = Modifier.width(28.dp)
                                                        )
                                                        Text(
                                                            explanation,
                                                            style = MaterialTheme.typography.bodyMedium
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Complexity
                        item {
                            Card(
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = AlgoPurple.copy(alpha = 0.08f))
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text("\u23F1\uFE0F Complexity", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                                        Column {
                                            Text("Time", fontWeight = FontWeight.Bold, color = AlgoPurple, fontSize = 12.sp)
                                            Text(p.complexity.time, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                                        }
                                        Column {
                                            Text("Space", fontWeight = FontWeight.Bold, color = AlgoBlue, fontSize = 12.sp)
                                            Text(p.complexity.space, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(p.complexity.simpleExplanation, style = MaterialTheme.typography.bodyMedium)
                                }
                            }
                        }

                        // Common mistakes
                        item {
                            Card(
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = AlgoRed.copy(alpha = 0.08f))
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text("\u26A0\uFE0F Common Mistakes", fontWeight = FontWeight.Bold, color = AlgoRed, fontSize = 16.sp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    p.commonMistakes.forEach { mistake ->
                                        Row(modifier = Modifier.padding(vertical = 4.dp)) {
                                            Text("\u274C", fontSize = 14.sp)
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(mistake, style = MaterialTheme.typography.bodyMedium)
                                        }
                                    }
                                }
                            }
                        }

                        // Hints
                        item {
                            Card(shape = RoundedCornerShape(16.dp)) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text("\uD83D\uDCA1 Hints", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                        Spacer(modifier = Modifier.weight(1f))
                                        if (hintLevel < p.hints.size) {
                                            TextButton(onClick = { viewModel.showNextHint() }) {
                                                Text("Show hint ${hintLevel + 1}/${p.hints.size}")
                                            }
                                        }
                                    }
                                    p.hints.take(hintLevel).forEachIndexed { i, hint ->
                                        Surface(
                                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                            shape = RoundedCornerShape(8.dp),
                                            color = AlgoYellow.copy(alpha = 0.1f)
                                        ) {
                                            Text(
                                                "Hint ${i + 1}: $hint",
                                                modifier = Modifier.padding(10.dp),
                                                style = MaterialTheme.typography.bodyMedium
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } ?: if (isError) {
            com.algoquest.ui.components.ErrorState(
                message = "Couldn't load this problem. Check your connection.",
                onRetry = { viewModel.loadProblem() }
            )
        } else {
            com.algoquest.ui.components.LoadingState()
        }
    }
}
