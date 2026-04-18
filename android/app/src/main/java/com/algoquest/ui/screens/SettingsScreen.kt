package com.algoquest.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.algoquest.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBack: () -> Unit) {
    var selectedLang by remember { mutableStateOf("python") }
    var dailyGoal by remember { mutableIntStateOf(3) }
    var darkMode by remember { mutableStateOf(false) }
    var notifications by remember { mutableStateOf(true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") } }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Preferred Language
            item {
                Card(shape = RoundedCornerShape(16.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Preferred Language", fontWeight = FontWeight.Bold)
                        Text("Code solutions will show this language first", style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("python" to "Python", "java" to "Java", "cpp" to "C++").forEach { (key, label) ->
                                FilterChip(
                                    selected = selectedLang == key,
                                    onClick = { selectedLang = key },
                                    label = { Text(label) },
                                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = AlgoGreen.copy(alpha = 0.2f))
                                )
                            }
                        }
                    }
                }
            }

            // Daily Goal
            item {
                Card(shape = RoundedCornerShape(16.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Daily Goal", fontWeight = FontWeight.Bold)
                        Text("How many problems per day?", style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(1 to "Casual", 3 to "Regular", 5 to "Serious").forEach { (count, label) ->
                                FilterChip(
                                    selected = dailyGoal == count,
                                    onClick = { dailyGoal = count },
                                    label = { Text("$label ($count/day)") },
                                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = AlgoOrange.copy(alpha = 0.2f))
                                )
                            }
                        }
                    }
                }
            }

            // Notifications
            item {
                Card(shape = RoundedCornerShape(16.dp)) {
                    Row(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Streak Reminders", fontWeight = FontWeight.Bold)
                            Text("Get notified to keep your streak alive", style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        }
                        Switch(checked = notifications, onCheckedChange = { notifications = it },
                            colors = SwitchDefaults.colors(checkedTrackColor = AlgoGreen))
                    }
                }
            }

            // Dark Mode
            item {
                Card(shape = RoundedCornerShape(16.dp)) {
                    Row(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Dark Mode", fontWeight = FontWeight.Bold)
                            Text("Easier on the eyes at night", style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        }
                        Switch(checked = darkMode, onCheckedChange = { darkMode = it },
                            colors = SwitchDefaults.colors(checkedTrackColor = AlgoPurple))
                    }
                }
            }

            // App info
            item {
                Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.5f))) {
                    Column(modifier = Modifier.padding(16.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83E\uDDE0", style = MaterialTheme.typography.headlineLarge)
                        Text("AlgoQuest v1.0.0", fontWeight = FontWeight.Bold)
                        Text("Master DSA, One Quest at a Time", style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    }
                }
            }
        }
    }
}
