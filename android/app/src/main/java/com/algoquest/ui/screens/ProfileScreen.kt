package com.algoquest.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.algoquest.data.model.ProgressStats
import com.algoquest.data.model.UserProfile
import com.algoquest.data.repository.AlgoRepository
import com.algoquest.ui.components.*
import com.algoquest.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val repository: AlgoRepository
) : ViewModel() {
    private val _profile = MutableStateFlow<UserProfile?>(null)
    val profile = _profile.asStateFlow()
    private val _stats = MutableStateFlow<ProgressStats?>(null)
    val stats = _stats.asStateFlow()

    init {
        viewModelScope.launch {
            repository.getProfile().onSuccess { _profile.value = it }
            repository.getStats().onSuccess { _stats.value = it }
        }
    }

    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            repository.logout()
            onDone()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onNavigateToAchievements: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onBack: () -> Unit,
    onLogout: () -> Unit = {},
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val profile by viewModel.profile.collectAsState()
    val stats by viewModel.stats.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") } },
                actions = {
                    IconButton(onClick = onNavigateToSettings) { Icon(Icons.Filled.Settings, "Settings") }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Profile header
            item {
                Card(shape = RoundedCornerShape(20.dp)) {
                    Column(
                        modifier = Modifier.padding(24.dp).fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier.size(80.dp).clip(CircleShape).background(AlgoGreen),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                profile?.username?.firstOrNull()?.uppercase() ?: "?",
                                fontSize = 36.sp, fontWeight = FontWeight.Bold, color = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(profile?.username ?: "", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                        stats?.let {
                            Text(it.levelTitle, color = AlgoOrange, fontWeight = FontWeight.SemiBold)
                        }
                        Spacer(modifier = Modifier.height(16.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            ProfileStat("\uD83D\uDD25", "${profile?.streak ?: 0}", "Streak")
                            ProfileStat("\u2B50", "${profile?.xp ?: 0}", "Total XP")
                            ProfileStat("\uD83C\uDFC5", "${stats?.completedProblems ?: 0}", "Solved")
                            ProfileStat("\uD83C\uDFC6", profile?.league ?: "BRONZE", "League")
                        }
                    }
                }
            }

            // Topic progress
            item {
                Card(shape = RoundedCornerShape(16.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Topic Progress", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        stats?.topics?.forEach { topic ->
                            val progress = if (topic.total > 0) topic.completed.toFloat() / topic.total else 0f
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(topic.name, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                                Text(
                                    "${topic.completed}/${topic.total}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                LinearProgressIndicator(
                                    progress = { progress },
                                    modifier = Modifier.width(80.dp).height(6.dp).clip(RoundedCornerShape(3.dp)),
                                    color = AlgoGreen,
                                    trackColor = AlgoGreen.copy(alpha = 0.1f),
                                )
                            }
                        }
                    }
                }
            }

            // Achievements button
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    onClick = onNavigateToAchievements
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("\uD83C\uDFC5", fontSize = 28.sp)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Achievements", fontWeight = FontWeight.Bold)
                            Text("View all badges", style = MaterialTheme.typography.bodySmall)
                        }
                        Icon(Icons.Filled.ChevronRight, null)
                    }
                }
            }

            // Logout button
            item {
                var showConfirm by remember { mutableStateOf(false) }

                OutlinedButton(
                    onClick = { showConfirm = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = AlgoRed)
                ) {
                    Icon(Icons.Filled.ExitToApp, null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Log Out", fontWeight = FontWeight.Bold)
                }

                if (showConfirm) {
                    AlertDialog(
                        onDismissRequest = { showConfirm = false },
                        title = { Text("Log Out?") },
                        text = { Text("Your progress is saved. You can log back in anytime.") },
                        confirmButton = {
                            TextButton(onClick = { viewModel.logout { onLogout() } }) {
                                Text("Log Out", color = AlgoRed)
                            }
                        },
                        dismissButton = {
                            TextButton(onClick = { showConfirm = false }) { Text("Cancel") }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun ProfileStat(emoji: String, value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(emoji, fontSize = 20.sp)
        Text(value, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
    }
}
