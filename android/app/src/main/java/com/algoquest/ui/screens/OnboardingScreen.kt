package com.algoquest.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.algoquest.data.auth.GoogleAuthHelper
import com.algoquest.data.repository.AlgoRepository
import com.algoquest.ui.components.*
import com.algoquest.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import kotlin.math.absoluteValue

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    private val repository: AlgoRepository,
    val googleAuthHelper: GoogleAuthHelper
) : ViewModel() {
    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()
    private val _isGoogleLoading = MutableStateFlow(false)
    val isGoogleLoading = _isGoogleLoading.asStateFlow()
    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()
    fun setError(message: String?) { _error.value = message }
    private val _registeredUsername = MutableStateFlow<String?>(null)
    val registeredUsername = _registeredUsername.asStateFlow()

    fun register(email: String, username: String, password: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            repository.register(email, username, password)
                .onSuccess { _registeredUsername.value = it.user.username; onSuccess() }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun googleSignIn(idToken: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isGoogleLoading.value = true
            _error.value = null
            repository.googleAuth(idToken)
                .onSuccess { _registeredUsername.value = it.user.username; onSuccess() }
                .onFailure { _error.value = it.message }
            _isGoogleLoading.value = false
        }
    }
}

@Composable
fun OnboardingScreen(
    onComplete: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: OnboardingViewModel = hiltViewModel()
) {
    val pagerState = rememberPagerState(pageCount = { 15 })
    val scope = rememberCoroutineScope()
    var experienceLevel by remember { mutableStateOf("") }
    var interviewGoal by remember { mutableStateOf("") }
    var dailyGoal by remember { mutableIntStateOf(3) }
    var demoSolved by remember { mutableStateOf(false) }
    var signedUp by remember { mutableStateOf(false) }
    val registeredUsername by viewModel.registeredUsername.collectAsState()

    fun next() { scope.launch { pagerState.animateScrollToPage(pagerState.currentPage + 1) } }
    fun goToPage(page: Int) { scope.launch { pagerState.animateScrollToPage(page) } }

    Box(Modifier.fillMaxSize()) {
        HorizontalPager(state = pagerState, userScrollEnabled = false, modifier = Modifier.fillMaxSize()) { page ->
            when (page) {
                0 -> AnimatedSplash { next() }
                1 -> PainPoint { next() }
                2 -> Promise { next() }
                3 -> ExpLevelEnhanced(experienceLevel) { experienceLevel = it; scope.launch { delay(500); next() } }
                4 -> GoalSelectEnhanced(interviewGoal) { interviewGoal = it; scope.launch { delay(500); next() } }
                5 -> InteractiveDemo(demoSolved) { demoSolved = true; scope.launch { delay(1500); next() } }
                6 -> AhaReveal { next() }
                7 -> BeforeAfter { next() }
                8 -> StatsAndProof { next() }
                9 -> TopicPreviewEnhanced { next() }
                10 -> DailyGoalEnhanced(dailyGoal) { dailyGoal = it; next() }
                11 -> GamificationPreview { next() }
                12 -> PersonalizedPath(experienceLevel, interviewGoal) { next() }
                13 -> SignUpPage(
                    viewModel = viewModel,
                    onSignUpSuccess = { signedUp = true; next() },
                    onNavigateToLogin = onNavigateToLogin
                )
                14 -> WelcomeCelebration(registeredUsername ?: "Champion", onComplete)
            }
        }

        // Page indicators (pages 1-12)
        if (pagerState.currentPage in 1..12) {
            Row(
                Modifier.align(Alignment.BottomCenter).padding(bottom = 32.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                repeat(15) { i ->
                    Box(
                        Modifier
                            .size(if (i == pagerState.currentPage) 20.dp else 6.dp, 6.dp)
                            .clip(CircleShape)
                            .background(
                                if (i == pagerState.currentPage) AlgoGreen
                                else if (i < pagerState.currentPage) AlgoGreen.copy(alpha = 0.4f)
                                else Color.Gray.copy(alpha = 0.2f)
                            )
                    )
                }
            }
        }
    }
}

// ==================== Page 0: Animated Splash ====================
@Composable
private fun AnimatedSplash(onNext: () -> Unit) {
    val logoAlpha = remember { Animatable(0f) }
    val logoScale = remember { Animatable(0.5f) }
    val titleAlpha = remember { Animatable(0f) }
    val subtitleAlpha = remember { Animatable(0f) }
    val buttonAlpha = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        delay(500)
        logoAlpha.animateTo(1f, tween(800))
        logoScale.animateTo(1f, spring(dampingRatio = 0.5f))
        delay(200)
        titleAlpha.animateTo(1f, tween(600))
        delay(200)
        subtitleAlpha.animateTo(1f, tween(600))
        delay(300)
        buttonAlpha.animateTo(1f, tween(500))
    }

    Box(Modifier.fillMaxSize()) {
        OnboardingBackground()

        Column(
            Modifier.fillMaxSize().padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                "\uD83E\uDDE0",
                fontSize = 96.sp,
                modifier = Modifier
                    .graphicsLayer {
                        alpha = logoAlpha.value
                        scaleX = logoScale.value
                        scaleY = logoScale.value
                    }
            )
            Spacer(Modifier.height(16.dp))
            Text(
                "AlgoQuest",
                fontSize = 46.sp,
                fontWeight = FontWeight.ExtraBold,
                color = AlgoGreen,
                modifier = Modifier.graphicsLayer { alpha = titleAlpha.value }
            )
            Spacer(Modifier.height(8.dp))
            Text(
                "Master DSA\nAce Your Interview",
                fontSize = 20.sp,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                lineHeight = 28.sp,
                modifier = Modifier.graphicsLayer { alpha = subtitleAlpha.value }
            )
            Spacer(Modifier.height(12.dp))
            Text(
                "The fun way to learn algorithms",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                modifier = Modifier.graphicsLayer { alpha = subtitleAlpha.value }
            )
            Spacer(Modifier.height(56.dp))
            Button(
                onClick = onNext,
                Modifier.fillMaxWidth().height(56.dp)
                    .graphicsLayer { alpha = buttonAlpha.value },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
            ) {
                Text("GET STARTED", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Spacer(Modifier.width(8.dp))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, null)
            }
        }
    }
}

// ==================== Page 1: Pain Point ====================
@Composable
private fun PainPoint(onNext: () -> Unit) {
    val painPoints = listOf(
        Triple("\uD83D\uDE29", "Stared at a LeetCode problem for 2 hours...", "no idea where to start"),
        Triple("\uD83D\uDCFA", "Watched a YouTube solution...", "forgot it next day"),
        Triple("\uD83D\uDE30", "Interview in 2 weeks...", "panicking about DSA")
    )
    var visibleCount by remember { mutableIntStateOf(0) }
    var showHope by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        delay(400)
        painPoints.forEachIndexed { i, _ ->
            delay(600)
            visibleCount = i + 1
        }
        delay(800)
        showHope = true
    }

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.04f)

        Column(
            Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(80.dp))
            Text("Sound familiar?", fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.Center)
            Spacer(Modifier.height(8.dp))
            Text("You're not alone", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            Spacer(Modifier.height(36.dp))

            painPoints.forEachIndexed { index, (emoji, title, sub) ->
                AnimatedVisibility(
                    visible = index < visibleCount,
                    enter = slideInVertically(tween(400)) { it / 2 } + fadeIn(tween(400))
                ) {
                    Card(
                        Modifier.fillMaxWidth().padding(vertical = 6.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = AlgoRed.copy(alpha = 0.06f)
                        )
                    ) {
                        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(emoji, fontSize = 36.sp)
                            Spacer(Modifier.width(14.dp))
                            Column(Modifier.weight(1f)) {
                                Text(title, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                                Text(sub, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(32.dp))

            AnimatedVisibility(
                visible = showHope,
                enter = fadeIn(tween(800)) + scaleIn(tween(800), initialScale = 0.8f)
            ) {
                Text(
                    "There's a better way \u2728",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = AlgoGreen,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(Modifier.weight(1f))

            AnimatedVisibility(visible = showHope, enter = fadeIn(tween(500))) {
                Button(
                    onClick = onNext,
                    Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
                ) { Text("SHOW ME", fontWeight = FontWeight.Bold) }
            }
            Spacer(Modifier.height(48.dp))
        }
    }
}

// ==================== Page 2: Promise ====================
@Composable
private fun Promise(onNext: () -> Unit) {
    val features = listOf(
        Triple("Wall of text", "Visual step-by-step stories", AlgoGreen),
        Triple("Memorize solutions", "Understand patterns", AlgoBlue),
        Triple("Boring grind", "Gamified progression", AlgoOrange)
    )
    var visibleCount by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) {
        features.forEachIndexed { i, _ ->
            delay(700)
            visibleCount = i + 1
        }
    }

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.04f)

        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(80.dp))
            Text("AlgoQuest is different", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.Center)
            Spacer(Modifier.height(40.dp))

            features.forEachIndexed { index, (old, new, color) ->
                AnimatedVisibility(
                    visible = index < visibleCount,
                    enter = slideInHorizontally(tween(500)) { -it / 2 } + fadeIn(tween(500))
                ) {
                    GlassCard(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                        glowColor = color
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(
                                    old,
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.35f),
                                    textDecoration = TextDecoration.LineThrough
                                )
                                Spacer(Modifier.height(4.dp))
                                Text(new, fontSize = 17.sp, fontWeight = FontWeight.Bold, color = color)
                            }
                            Icon(
                                Icons.Filled.CheckCircle,
                                null,
                                tint = color,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.weight(1f))
            Button(
                onClick = onNext,
                Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
            ) { Text("CONTINUE", fontWeight = FontWeight.Bold) }
            Spacer(Modifier.height(48.dp))
        }
    }
}

// ==================== Page 3: Experience Level (Enhanced) ====================
@Composable
private fun ExpLevelEnhanced(selected: String, onSelect: (String) -> Unit) {
    val opts = listOf(
        "beginner" to Triple("\uD83C\uDF31", "Complete Beginner", "New to DSA and coding interviews"),
        "intermediate" to Triple("\uD83C\uDF3F", "Know the Basics", "Familiar with arrays/loops, need patterns"),
        "advanced" to Triple("\uD83C\uDF33", "Interview-Ready", "Know DSA, want to sharpen skills")
    )

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.03f)

        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(60.dp))
            Text("What's your DSA level?", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.Center)
            Spacer(Modifier.height(8.dp))
            Text("We'll adjust difficulty for you", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            Spacer(Modifier.height(40.dp))

            opts.forEach { (key, info) ->
                val (emoji, title, desc) = info
                val isSel = selected == key
                val sc by animateFloatAsState(if (isSel) 1.03f else 1f, spring(dampingRatio = 0.5f), label = "e$key")

                GlassCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp)
                        .scale(sc)
                        .then(if (isSel) Modifier.border(2.5.dp, AlgoGreen, RoundedCornerShape(20.dp)) else Modifier)
                        .clickable { onSelect(key) },
                    glowColor = if (isSel) AlgoGreen else Color.White,
                    backgroundAlpha = if (isSel) 0.12f else 0.08f
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(emoji, fontSize = 36.sp)
                        Spacer(Modifier.width(16.dp))
                        Column(Modifier.weight(1f)) {
                            Text(title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text(desc, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        }
                        if (isSel) Icon(Icons.Filled.CheckCircle, null, tint = AlgoGreen, modifier = Modifier.size(24.dp))
                    }
                }
            }
        }
    }
}

// ==================== Page 4: Goal Selection (Enhanced) ====================
@Composable
private fun GoalSelectEnhanced(selected: String, onSelect: (String) -> Unit) {
    val goals = listOf(
        "faang" to ("\uD83C\uDFE2" to "FAANG / Big Tech Interview"),
        "startup" to ("\uD83D\uDE80" to "Startup Interviews"),
        "general" to ("\uD83D\uDCBB" to "General DSA Mastery"),
        "competitive" to ("\uD83C\uDFC6" to "Competitive Programming"),
        "learning" to ("\uD83D\uDCDA" to "Just Learning for Fun")
    )

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.03f)

        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(60.dp))
            Text("What's your goal?", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(8.dp))
            Text("We'll customize your experience", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            Spacer(Modifier.height(32.dp))

            goals.forEach { (key, info) ->
                val (emoji, label) = info
                val isSel = selected == key
                val sc by animateFloatAsState(if (isSel) 1.03f else 1f, spring(dampingRatio = 0.5f), label = "g$key")
                GlassCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 5.dp)
                        .scale(sc)
                        .then(if (isSel) Modifier.border(2.5.dp, AlgoGreen, RoundedCornerShape(20.dp)) else Modifier)
                        .clickable { onSelect(key) },
                    glowColor = if (isSel) AlgoGreen else Color.White,
                    backgroundAlpha = if (isSel) 0.12f else 0.08f
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(emoji, fontSize = 32.sp)
                        Spacer(Modifier.width(16.dp))
                        Text(label, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                        if (isSel) Icon(Icons.Filled.CheckCircle, null, tint = AlgoGreen)
                    }
                }
            }
        }
    }
}

// ==================== Page 5: Interactive Demo (AHA MOMENT) ====================
@Composable
private fun InteractiveDemo(solved: Boolean, onSolved: () -> Unit) {
    val numbers = listOf(2, 7, 11, 15)
    val target = 9
    var selected by remember { mutableStateOf(setOf<Int>()) }
    var isCorrect by remember { mutableStateOf(false) }
    var showWrongShake by remember { mutableStateOf(false) }
    val shakeOffset by animateFloatAsState(
        targetValue = if (showWrongShake) 10f else 0f,
        animationSpec = if (showWrongShake) spring(dampingRatio = 0.3f, stiffness = 1500f) else tween(0),
        label = "shake",
        finishedListener = { showWrongShake = false }
    )

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.04f)

        if (isCorrect) {
            ConfettiAnimation(isPlaying = true)
        }

        Column(
            Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(60.dp))

            val pulseTransition = rememberInfiniteTransition(label = "demo_pulse")
            val pulseScale by pulseTransition.animateFloat(
                1f, 1.05f,
                infiniteRepeatable(tween(1000), RepeatMode.Reverse),
                label = "demo_s"
            )

            Text(
                "Try it yourself!",
                fontSize = 28.sp,
                fontWeight = FontWeight.ExtraBold,
                modifier = Modifier.scale(if (!solved) pulseScale else 1f)
            )
            Spacer(Modifier.height(8.dp))
            Text("Tap two numbers that add up to $target", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))

            Spacer(Modifier.height(16.dp))

            // Problem card
            GlassCard(modifier = Modifier.fillMaxWidth(), glowColor = AlgoBlue) {
                Column {
                    Text("Two Sum", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = AlgoBlue)
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Given nums = [2, 7, 11, 15] and target = $target",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        "Find two numbers that add up to target",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            }

            Spacer(Modifier.height(32.dp))

            // Number cards
            Row(
                Modifier
                    .fillMaxWidth()
                    .offset(x = shakeOffset.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                numbers.forEach { num ->
                    val isSelected = num in selected
                    val numScale by animateFloatAsState(
                        if (isSelected) 1.1f else 1f,
                        spring(dampingRatio = 0.5f),
                        label = "ns$num"
                    )
                    val bgColor by animateColorAsState(
                        when {
                            isCorrect && isSelected -> AlgoGreen
                            isSelected -> AlgoBlue
                            else -> MaterialTheme.colorScheme.surface
                        },
                        tween(300),
                        label = "nc$num"
                    )

                    Card(
                        modifier = Modifier
                            .size(72.dp)
                            .scale(numScale)
                            .clickable(enabled = !isCorrect) {
                                if (isSelected) {
                                    selected = selected - num
                                } else if (selected.size < 2) {
                                    val newSelected = selected + num
                                    selected = newSelected
                                    if (newSelected.size == 2) {
                                        if (newSelected.sum() == target) {
                                            isCorrect = true
                                            onSolved()
                                        } else {
                                            showWrongShake = true
                                            selected = emptySet()
                                        }
                                    }
                                }
                            },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = bgColor),
                        elevation = CardDefaults.cardElevation(if (isSelected) 8.dp else 2.dp),
                        border = if (isSelected) BorderStroke(2.dp, if (isCorrect) AlgoGreen else AlgoBlue) else null
                    ) {
                        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text(
                                "$num",
                                fontSize = 28.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            AnimatedVisibility(
                visible = isCorrect,
                enter = scaleIn(spring(dampingRatio = 0.4f)) + fadeIn()
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("\uD83C\uDF89 That's it!", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = AlgoGreen)
                    Text("2 + 7 = 9", fontSize = 18.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    Spacer(Modifier.height(8.dp))
                    Text("Now let us show you HOW we teach it...", style = MaterialTheme.typography.bodyMedium, color = AlgoGreen)
                }
            }

            if (!isCorrect && selected.isEmpty()) {
                Spacer(Modifier.height(16.dp))
                Text(
                    "Hint: Look for a pair summing to $target",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f)
                )
            }
        }
    }
}

// ==================== Page 6: Aha Reveal ====================
@Composable
private fun AhaReveal(onNext: () -> Unit) {
    val steps = listOf(
        Triple("\uD83D\uDCD6", "Read the Story" to "Imagine you're at a market with a shopping list. You need to find two items whose prices add up to your budget...", AlgoGreen),
        Triple("\uD83E\uDDE9", "See the Pattern" to "Use a hash map! For each number, check if (target - number) exists. Store seen numbers as you go.", AlgoBlue),
        Triple("\uD83D\uDCBB", "Code It" to "def twoSum(nums, target):\n  seen = {}\n  for i, n in enumerate(nums):\n    if target - n in seen:\n      return [seen[target-n], i]\n    seen[n] = i", AlgoOrange),
        Triple("\u2753", "Quiz Yourself" to "What data structure makes Two Sum O(n)?\n  A) Array   B) Hash Map   C) Stack\n  Answer: B) Hash Map", AlgoPurple)
    )
    var visibleCount by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) {
        steps.forEachIndexed { i, _ ->
            delay(600)
            visibleCount = i + 1
        }
    }

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.04f)

        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(50.dp))
            Text("Here's how AlgoQuest\nteaches it", fontSize = 26.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.Center)
            Spacer(Modifier.height(24.dp))

            steps.forEachIndexed { index, (emoji, content, color) ->
                val (title, body) = content
                AnimatedVisibility(
                    visible = index < visibleCount,
                    enter = slideInVertically(tween(400)) { it / 3 } + fadeIn(tween(400))
                ) {
                    GlassCard(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        glowColor = color,
                        cornerRadius = 16.dp
                    ) {
                        Row(verticalAlignment = Alignment.Top) {
                            Text(emoji, fontSize = 24.sp)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = color)
                                Spacer(Modifier.height(4.dp))
                                if (title == "Code It" || title == "Quiz Yourself") {
                                    Text(
                                        body,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 11.sp,
                                        lineHeight = 16.sp,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                                    )
                                } else {
                                    Text(
                                        body,
                                        fontSize = 13.sp,
                                        lineHeight = 18.sp,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.weight(1f))
            Button(
                onClick = onNext,
                Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
            ) { Text("CONTINUE", fontWeight = FontWeight.Bold) }
            Spacer(Modifier.height(48.dp))
        }
    }
}

// ==================== Page 7: Before/After ====================
@Composable
private fun BeforeAfter(onNext: () -> Unit) {
    var dividerPosition by remember { mutableFloatStateOf(0.5f) }

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.03f)

        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(60.dp))
            Text("See the difference", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(8.dp))
            Text("Drag to compare", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            Spacer(Modifier.height(24.dp))

            Box(
                Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .pointerInput(Unit) {
                        detectDragGestures { change, dragAmount ->
                            change.consume()
                            val newPos = dividerPosition + dragAmount.x / size.width
                            dividerPosition = newPos.coerceIn(0.1f, 0.9f)
                        }
                    }
            ) {
                // Before side
                Box(
                    Modifier
                        .fillMaxHeight()
                        .fillMaxWidth(dividerPosition)
                        .background(Color(0xFF1E1E2E))
                        .padding(16.dp)
                ) {
                    Column {
                        Text("TRADITIONAL", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = AlgoRed.copy(alpha = 0.7f))
                        Spacer(Modifier.height(12.dp))
                        Text(
                            "Given an array of integers nums\nand an integer target, return\nindices of the two numbers such\nthat they add up to target.\n\nYou may assume that each input\nwould have exactly one solution,\nand you may not use the same\nelement twice.\n\nConstraints:\n2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            lineHeight = 16.sp,
                            color = Color.Gray
                        )
                    }
                }

                // After side
                Box(
                    Modifier
                        .fillMaxHeight()
                        .fillMaxWidth()
                        .padding(start = (dividerPosition * 100).dp.coerceAtMost(300.dp))
                        .background(MaterialTheme.colorScheme.surface)
                        .padding(16.dp)
                ) {
                    Column {
                        Text("ALGOQUEST", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = AlgoGreen)
                        Spacer(Modifier.height(12.dp))
                        Text("\uD83D\uDED2 The Shopping List", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "Imagine you're at a market with a shopping list. You need to find two items whose prices add up to your budget.",
                            fontSize = 13.sp, lineHeight = 18.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                        )
                        Spacer(Modifier.height(12.dp))
                        Text("\uD83E\uDDE9 Pattern: Hash Map Lookup", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = AlgoBlue)
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "As you walk through the store, write down each item's price. Before picking up a new item, check your list!",
                            fontSize = 12.sp, lineHeight = 17.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )
                        Spacer(Modifier.height(12.dp))
                        Text("\u2615 Simple: O(n) time, O(n) space", fontSize = 11.sp, color = AlgoGreen, fontWeight = FontWeight.Medium)
                    }
                }

                // Divider handle
                Box(
                    Modifier
                        .fillMaxHeight()
                        .width(4.dp)
                        .offset(x = (dividerPosition * 300).dp.coerceAtMost(300.dp))
                        .background(AlgoGreen)
                )
            }

            Spacer(Modifier.height(24.dp))
            Button(
                onClick = onNext,
                Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
            ) { Text("CONTINUE", fontWeight = FontWeight.Bold) }
            Spacer(Modifier.height(48.dp))
        }
    }
}

// ==================== Page 8: Stats & Social Proof ====================
@Composable
private fun StatsAndProof(onNext: () -> Unit) {
    var show by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { show = true }

    val problems by animateIntAsState(if (show) 150 else 0, tween(2000), label = "p")
    val topics by animateIntAsState(if (show) 18 else 0, tween(1800), label = "t")
    val langs by animateIntAsState(if (show) 3 else 0, tween(1500), label = "l")

    val testimonials = listOf(
        Triple("\"Solved 80% of my Google interview after AlgoQuest. Explanations are incredibly clear.\"", "Alex T.", "SWE @ Google"),
        Triple("\"Finally understand dynamic programming. The stories make it click!\"", "Sarah K.", "CS Student"),
        Triple("\"Went from zero LeetCode to Amazon offer in 8 weeks.\"", "Marcus L.", "SDE @ Amazon"),
        Triple("\"Better than any YouTube playlist. The gamification keeps me coming back.\"", "Priya R.", "Frontend Dev")
    )

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.04f)

        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Text("Join thousands of\ninterview champions", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.Center)
            Spacer(Modifier.height(32.dp))

            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                AnimatedStatItem("\uD83D\uDCDA", "$problems", "Problems", AlgoGreen)
                AnimatedStatItem("\uD83C\uDFAF", "$topics", "Topics", AlgoBlue)
                AnimatedStatItem("\uD83D\uDCBB", "$langs", "Languages", AlgoPurple)
            }

            Spacer(Modifier.height(28.dp))

            // Testimonial carousel
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(horizontal = 4.dp)
            ) {
                items(testimonials) { (quote, name, role) ->
                    GlassCard(
                        modifier = Modifier.width(280.dp),
                        glowColor = AlgoGreen
                    ) {
                        Column {
                            Text("\u2B50\u2B50\u2B50\u2B50\u2B50", fontSize = 14.sp)
                            Spacer(Modifier.height(8.dp))
                            Text(quote, fontSize = 13.sp, lineHeight = 18.sp, fontWeight = FontWeight.Medium)
                            Spacer(Modifier.height(8.dp))
                            Text("$name, $role", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        }
                    }
                }
            }

            Spacer(Modifier.weight(1f))
            Button(onClick = onNext, Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(14.dp), colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)) { Text("CONTINUE", fontWeight = FontWeight.Bold) }
            Spacer(Modifier.height(48.dp))
        }
    }
}

@Composable
private fun AnimatedStatItem(emoji: String, value: String, label: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(emoji, fontSize = 32.sp)
        Text(value, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = color)
        Text(label, style = MaterialTheme.typography.bodySmall)
    }
}

// ==================== Page 9: Topic Preview (Enhanced) ====================
@Composable
private fun TopicPreviewEnhanced(onNext: () -> Unit) {
    val mods = listOf(
        Triple("\uD83D\uDCE6", "Arrays & Hashing" to "The foundation — hash maps, sets, and frequency counting", AlgoGreen),
        Triple("\uD83C\uDF33", "Trees & Graphs" to "DFS, BFS, shortest paths — the most common interview topics", AlgoBlue),
        Triple("\uD83D\uDCDD", "Dynamic Programming" to "Break complex problems into simple subproblems", AlgoOrange),
        Triple("\uD83D\uDD0D", "Binary Search" to "Cut search space in half every step — O(log n) power", AlgoRed)
    )
    val pp = rememberPagerState(pageCount = { mods.size })

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.03f)

        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(60.dp))
            Text("What you'll master", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(8.dp))
            Text("Swipe to preview", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            Spacer(Modifier.height(24.dp))

            HorizontalPager(
                state = pp,
                Modifier.weight(1f),
                contentPadding = PaddingValues(horizontal = 40.dp),
                pageSpacing = 16.dp
            ) { page ->
                val pageOffset = ((pp.currentPage - page) + pp.currentPageOffsetFraction).absoluteValue

                Card(
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = mods[page].third.copy(alpha = 0.08f)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .fillMaxHeight(0.8f)
                        .graphicsLayer {
                            val scale = 1f - (pageOffset * 0.15f).coerceAtMost(0.15f)
                            scaleX = scale
                            scaleY = scale
                            rotationY = pageOffset * -8f
                            alpha = 1f - (pageOffset * 0.4f).coerceAtMost(0.4f)
                        }
                ) {
                    Column(
                        Modifier.padding(28.dp).fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(mods[page].first, fontSize = 64.sp)
                        Spacer(Modifier.height(20.dp))
                        Text(
                            mods[page].second.first,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = mods[page].third,
                            textAlign = TextAlign.Center
                        )
                        Spacer(Modifier.height(12.dp))
                        Text(
                            mods[page].second.second,
                            style = MaterialTheme.typography.bodyLarge,
                            textAlign = TextAlign.Center,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )
                    }
                }
            }

            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.padding(vertical = 16.dp)
            ) {
                repeat(mods.size) { i ->
                    Box(
                        Modifier
                            .size(if (i == pp.currentPage) 16.dp else 6.dp, 6.dp)
                            .clip(CircleShape)
                            .background(if (i == pp.currentPage) AlgoGreen else Color.Gray.copy(alpha = 0.2f))
                    )
                }
            }
            Button(onClick = onNext, Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(14.dp), colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)) { Text("CONTINUE", fontWeight = FontWeight.Bold) }
            Spacer(Modifier.height(48.dp))
        }
    }
}

// ==================== Page 10: Daily Goal (Enhanced) ====================
@Composable
private fun DailyGoalEnhanced(selected: Int, onSelect: (Int) -> Unit) {
    val goals = listOf(
        Triple(1, "\uD83D\uDEB6", "Casual" to "1 problem/day \u00B7 ~5 months to finish"),
        Triple(3, "\uD83C\uDFC3", "Regular" to "3 problems/day \u00B7 ~7 weeks to finish"),
        Triple(5, "\uD83D\uDD25", "Intense" to "5 problems/day \u00B7 ~1 month to finish")
    )
    var g by remember { mutableIntStateOf(selected) }

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.03f)

        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(60.dp))
            Text("Set your daily goal", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(8.dp))
            Text("Change anytime in settings", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            Spacer(Modifier.height(32.dp))

            goals.forEach { (count, emoji, label) ->
                val isSel = g == count
                val bc = when (count) { 1 -> EasyColor; 3 -> MediumColor; else -> HardColor }
                val sc by animateFloatAsState(if (isSel) 1.03f else 1f, spring(dampingRatio = 0.5f), label = "dg$count")

                GlassCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp)
                        .scale(sc)
                        .then(if (isSel) Modifier.border(2.5.dp, bc, RoundedCornerShape(20.dp)) else Modifier)
                        .clickable { g = count },
                    glowColor = if (isSel) bc else Color.White,
                    backgroundAlpha = if (isSel) 0.12f else 0.08f
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(emoji, fontSize = 36.sp)
                        Spacer(Modifier.width(16.dp))
                        Column(Modifier.weight(1f)) {
                            Text(label.first, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = if (isSel) bc else MaterialTheme.colorScheme.onSurface)
                            Text(label.second, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        }
                        if (isSel) Icon(Icons.Filled.CheckCircle, null, tint = bc, modifier = Modifier.size(24.dp))
                    }
                }
            }

            Spacer(Modifier.weight(1f))
            Button(onClick = { onSelect(g) }, Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(14.dp), colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)) { Text("CONTINUE", fontWeight = FontWeight.Bold) }
            Spacer(Modifier.height(48.dp))
        }
    }
}

// ==================== Page 11: Gamification Preview ====================
@Composable
private fun GamificationPreview(onNext: () -> Unit) {
    var showItems by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { delay(300); showItems = true }

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.04f)

        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(60.dp))
            Text("Your journey, gamified", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.Center)
            Spacer(Modifier.height(8.dp))
            Text("Stay motivated with rewards", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            Spacer(Modifier.height(32.dp))

            AnimatedVisibility(visible = showItems, enter = fadeIn(tween(400)) + slideInVertically(tween(400))) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Hearts demo
                    GlassCard(modifier = Modifier.fillMaxWidth(), glowColor = AlgoRed) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            HeartBar(hearts = 5)
                            Spacer(Modifier.width(16.dp))
                            Column {
                                Text("5 Lives Daily", fontWeight = FontWeight.Bold)
                                Text("Hearts refill over time", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                            }
                        }
                    }

                    // Streak demo
                    GlassCard(modifier = Modifier.fillMaxWidth(), glowColor = AlgoYellow) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            StreakCounter(streak = 7)
                            Spacer(Modifier.width(16.dp))
                            Column {
                                Text("Daily Streaks", fontWeight = FontWeight.Bold)
                                Text("Build consistency with streak bonuses", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                            }
                        }
                    }

                    // XP demo
                    GlassCard(modifier = Modifier.fillMaxWidth(), glowColor = AlgoOrange) {
                        Column {
                            Text("Level Up System", fontWeight = FontWeight.Bold)
                            Spacer(Modifier.height(8.dp))
                            XpProgressBar(currentXp = 75, xpForNextLevel = 100, level = 5)
                        }
                    }

                    // League demo
                    GlassCard(modifier = Modifier.fillMaxWidth(), glowColor = AlgoPurple) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("\uD83C\uDFC6", fontSize = 28.sp)
                            Spacer(Modifier.width(16.dp))
                            Column {
                                Text("Weekly Leagues", fontWeight = FontWeight.Bold)
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    listOf("\uD83E\uDD49 Bronze", "\uD83E\uDD48 Silver", "\uD83E\uDD47 Gold", "\uD83D\uDC8E Diamond").forEach {
                                        Text(it, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.weight(1f))
            Button(onClick = onNext, Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(14.dp), colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)) { Text("CONTINUE", fontWeight = FontWeight.Bold) }
            Spacer(Modifier.height(48.dp))
        }
    }
}

// ==================== Page 12: Personalized Path ====================
@Composable
private fun PersonalizedPath(experience: String, goal: String, onNext: () -> Unit) {
    val pathSteps = when {
        experience == "beginner" -> listOf(
            Triple("\uD83D\uDCE6", "Arrays & Hashing", "Build your foundation"),
            Triple("\uD83D\uDD17", "Two Pointers", "Learn sliding window patterns"),
            Triple("\uD83D\uDCDA", "Stack & Queue", "Master LIFO/FIFO structures"),
            Triple("\uD83C\uDF33", "Trees", "Conquer DFS & BFS"),
            Triple("\uD83D\uDCDD", "Dynamic Programming", "The final boss")
        )
        experience == "advanced" -> listOf(
            Triple("\uD83D\uDCDD", "Dynamic Programming", "Advanced patterns"),
            Triple("\uD83C\uDF10", "Graphs", "Complex traversals"),
            Triple("\uD83D\uDD0D", "Binary Search", "Advanced applications"),
            Triple("\uD83E\uDDE9", "Backtracking", "Generate all solutions"),
            Triple("\u26A1", "Greedy & Intervals", "Optimization problems")
        )
        else -> listOf(
            Triple("\uD83D\uDCE6", "Arrays & Hashing", "Solidify fundamentals"),
            Triple("\uD83D\uDD17", "Linked Lists", "Pointer manipulation"),
            Triple("\uD83C\uDF33", "Trees & Graphs", "Core interview topics"),
            Triple("\uD83D\uDCDD", "Dynamic Programming", "Pattern recognition"),
            Triple("\uD83C\uDFC6", "Interview Prep", "Timed practice mode")
        )
    }

    var visibleCount by remember { mutableIntStateOf(0) }
    LaunchedEffect(Unit) {
        pathSteps.forEachIndexed { i, _ ->
            delay(400)
            visibleCount = i + 1
        }
    }

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.04f)

        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(60.dp))
            Text("Your custom roadmap", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.Center)
            Spacer(Modifier.height(8.dp))
            Text(
                when (goal) {
                    "faang" -> "Optimized for Big Tech interviews"
                    "startup" -> "Focused on practical problem-solving"
                    "competitive" -> "Built for competitive mastery"
                    else -> "Designed for your learning journey"
                },
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
            )
            Spacer(Modifier.height(32.dp))

            pathSteps.forEachIndexed { index, (emoji, title, desc) ->
                AnimatedVisibility(
                    visible = index < visibleCount,
                    enter = slideInHorizontally(tween(400)) { -it / 3 } + fadeIn(tween(400))
                ) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Step indicator
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Box(
                                Modifier.size(40.dp).clip(CircleShape).background(AlgoGreen.copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(emoji, fontSize = 20.sp)
                            }
                            if (index < pathSteps.lastIndex) {
                                Box(
                                    Modifier.width(2.dp).height(24.dp)
                                        .background(AlgoGreen.copy(alpha = 0.2f))
                                )
                            }
                        }

                        Spacer(Modifier.width(16.dp))

                        GlassCard(
                            modifier = Modifier.weight(1f),
                            cornerRadius = 14.dp,
                            glowColor = AlgoGreen
                        ) {
                            Text(title, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text(desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        }
                    }
                }
            }

            Spacer(Modifier.weight(1f))
            Button(onClick = onNext, Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(14.dp), colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)) { Text("LET'S DO THIS!", fontWeight = FontWeight.Bold) }
            Spacer(Modifier.height(48.dp))
        }
    }
}

// ==================== Page 13: Sign Up ====================
@Composable
private fun SignUpPage(
    viewModel: OnboardingViewModel,
    onSignUpSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val isLoading by viewModel.isLoading.collectAsState()
    val isGoogleLoading by viewModel.isGoogleLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.04f)

        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(50.dp))
            Text("\uD83E\uDDE0", fontSize = 48.sp)
            Spacer(Modifier.height(8.dp))
            Text("Join AlgoQuest", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
            Text("Create your free account", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            Spacer(Modifier.height(28.dp))

            // Google Sign-In (primary)
            GoogleSignInButton(
                onClick = {
                    scope.launch {
                        viewModel.googleAuthHelper.signIn(context)
                            .onSuccess { idToken ->
                                viewModel.googleSignIn(idToken, onSignUpSuccess)
                            }
                            .onFailure { e ->
                                if (e.message != "Sign-in cancelled") {
                                    viewModel.setError(e.message)
                                }
                            }
                    }
                },
                isLoading = isGoogleLoading,
                text = "Continue with Google"
            )

            Spacer(Modifier.height(20.dp))
            OrDivider()
            Spacer(Modifier.height(20.dp))

            OutlinedTextField(
                value = username, onValueChange = { username = it },
                label = { Text("Username") },
                leadingIcon = { Icon(Icons.Filled.Person, null) },
                singleLine = true, shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(10.dp))
            OutlinedTextField(
                value = email, onValueChange = { email = it },
                label = { Text("Email") },
                leadingIcon = { Icon(Icons.Filled.Email, null) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                singleLine = true, shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(10.dp))
            OutlinedTextField(
                value = password, onValueChange = { password = it },
                label = { Text("Password (6+ characters)") },
                leadingIcon = { Icon(Icons.Filled.Lock, null) },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                singleLine = true, shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            )

            AnimatedVisibility(visible = error != null) {
                Text(error ?: "", color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp), style = MaterialTheme.typography.bodySmall)
            }

            Spacer(Modifier.height(20.dp))
            Button(
                onClick = { viewModel.register(email, username, password, onSignUpSuccess) },
                Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen),
                enabled = !isLoading && !isGoogleLoading && email.isNotBlank() && username.isNotBlank() && password.length >= 6
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(24.dp), Color.White, strokeWidth = 2.dp)
                else Text("CREATE ACCOUNT", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
            Spacer(Modifier.height(12.dp))
            TextButton(onClick = onNavigateToLogin) {
                Text("Already have an account? Log in")
            }
            Spacer(Modifier.height(8.dp))
            Text("Free for 7 days, then \$9.99/month", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f))
            Spacer(Modifier.height(32.dp))
        }
    }
}

// ==================== Page 14: Welcome Celebration ====================
@Composable
private fun WelcomeCelebration(username: String, onComplete: () -> Unit) {
    val p = rememberInfiniteTransition(label = "cta")
    val s by p.animateFloat(1f, 1.03f, infiniteRepeatable(tween(1500), RepeatMode.Reverse), label = "s")
    val titleAlpha = remember { Animatable(0f) }
    val contentAlpha = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        delay(500)
        titleAlpha.animateTo(1f, tween(800))
        delay(300)
        contentAlpha.animateTo(1f, tween(600))
    }

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground(alpha = 0.06f)
        ConfettiAnimation(isPlaying = true)

        Column(
            Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                "\uD83C\uDF89", fontSize = 72.sp,
                modifier = Modifier.graphicsLayer { alpha = titleAlpha.value; scaleX = titleAlpha.value; scaleY = titleAlpha.value }
            )
            Spacer(Modifier.height(16.dp))
            Text(
                "Welcome, $username!",
                fontSize = 32.sp,
                fontWeight = FontWeight.ExtraBold,
                color = AlgoGreen,
                textAlign = TextAlign.Center,
                modifier = Modifier.graphicsLayer { alpha = titleAlpha.value }
            )
            Spacer(Modifier.height(12.dp))
            Text(
                "Your personalized DSA path awaits",
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                modifier = Modifier.graphicsLayer { alpha = titleAlpha.value }
            )

            Spacer(Modifier.height(28.dp))

            GlassCard(
                modifier = Modifier.graphicsLayer { alpha = contentAlpha.value },
                glowColor = AlgoGreen
            ) {
                Text("Your 7-Day Free Trial:", fontWeight = FontWeight.Bold, color = AlgoGreen, fontSize = 16.sp)
                Spacer(Modifier.height(12.dp))
                listOf(
                    "\u2705 All 150 NeetCode problems",
                    "\u2705 Python, Java, C++ solutions",
                    "\u2705 Story-based explanations",
                    "\u2705 Interactive quizzes",
                    "\u2705 Interview Prep Mode",
                    "\u2705 No credit card required"
                ).forEach {
                    Text(it, Modifier.padding(vertical = 3.dp), fontSize = 14.sp)
                }
            }

            Spacer(Modifier.height(32.dp))

            Button(
                onClick = onComplete,
                Modifier.fillMaxWidth().height(60.dp).scale(s),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AlgoGreen)
            ) {
                Text("LET'S GO! \uD83D\uDE80", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
            }
        }
    }
}
