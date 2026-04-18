package com.algoquest.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowBack
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
import com.algoquest.data.model.WeeklyLeaderboard
import com.algoquest.data.repository.AlgoRepository
import com.algoquest.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LeaderboardViewModel @Inject constructor(
    private val repository: AlgoRepository
) : ViewModel() {
    private val _leaderboard = MutableStateFlow<WeeklyLeaderboard?>(null)
    val leaderboard = _leaderboard.asStateFlow()

    init {
        viewModelScope.launch {
            repository.getWeeklyLeaderboard().onSuccess { _leaderboard.value = it }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeaderboardScreen(
    onBack: () -> Unit,
    viewModel: LeaderboardViewModel = hiltViewModel()
) {
    val data by viewModel.leaderboard.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Leaderboard", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") } }
            )
        }
    ) { padding ->
        data?.let { lb ->
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = AlgoGold.copy(alpha = 0.1f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("\uD83C\uDFC6", fontSize = 36.sp)
                            Text("${lb.league} League", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = AlgoGold)
                            lb.myRank?.let { Text("Your rank: #$it", style = MaterialTheme.typography.bodyMedium) }
                        }
                    }
                }

                itemsIndexed(lb.leaderboard) { _, entry ->
                    val medalEmoji = when (entry.rank) { 1 -> "\uD83E\uDD47"; 2 -> "\uD83E\uDD48"; 3 -> "\uD83E\uDD49"; else -> null }

                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (entry.isMe) AlgoGreen.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surface
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                medalEmoji ?: "#${entry.rank}",
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.width(40.dp),
                                fontSize = if (medalEmoji != null) 20.sp else 14.sp
                            )
                            Box(
                                modifier = Modifier.size(36.dp).clip(CircleShape)
                                    .background(if (entry.isMe) AlgoGreen else AlgoBlue.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    entry.username.first().uppercase(),
                                    fontWeight = FontWeight.Bold,
                                    color = if (entry.isMe) Color.White else AlgoBlue
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    entry.username + if (entry.isMe) " (You)" else "",
                                    fontWeight = if (entry.isMe) FontWeight.Bold else FontWeight.Normal
                                )
                                Text("Level ${entry.level}", style = MaterialTheme.typography.bodySmall)
                            }
                            Text(
                                "${entry.weeklyXp ?: entry.xp ?: 0} XP",
                                fontWeight = FontWeight.Bold,
                                color = AlgoOrange
                            )
                        }
                    }
                }
            }
        } ?: Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = AlgoGreen)
        }
    }
}
