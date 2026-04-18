package com.algoquest.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.algoquest.data.model.SearchResult
import com.algoquest.data.repository.AlgoRepository
import com.algoquest.ui.components.DifficultyBadge
import com.algoquest.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val repository: AlgoRepository
) : ViewModel() {
    private val _results = MutableStateFlow<List<SearchResult>>(emptyList())
    val results = _results.asStateFlow()
    private val _isSearching = MutableStateFlow(false)
    val isSearching = _isSearching.asStateFlow()
    private val _query = MutableStateFlow("")
    val query = _query.asStateFlow()
    private var searchJob: Job? = null

    fun search(q: String) {
        _query.value = q
        searchJob?.cancel()
        if (q.length < 2) {
            _results.value = emptyList()
            return
        }
        searchJob = viewModelScope.launch {
            delay(300) // debounce
            _isSearching.value = true
            repository.searchProblems(q)
                .onSuccess { _results.value = it }
                .onFailure { _results.value = emptyList() }
            _isSearching.value = false
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    onNavigateToLesson: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: SearchViewModel = hiltViewModel()
) {
    val results by viewModel.results.collectAsState()
    val isSearching by viewModel.isSearching.collectAsState()
    val query by viewModel.query.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Search Problems", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 16.dp)) {
            // Search bar
            OutlinedTextField(
                value = query,
                onValueChange = { viewModel.search(it) },
                placeholder = { Text("Search by name, pattern, or topic...") },
                leadingIcon = { Icon(Icons.Filled.Search, null) },
                trailingIcon = {
                    if (query.isNotEmpty()) {
                        IconButton(onClick = { viewModel.search("") }) {
                            Icon(Icons.Filled.Clear, "Clear")
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
            )

            if (isSearching) {
                Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = AlgoGreen, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                }
            }

            if (query.length >= 2 && results.isEmpty() && !isSearching) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("\uD83D\uDD0D", fontSize = 40.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("No problems found for \"$query\"", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                }
            }

            if (query.isEmpty()) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("\uD83D\uDCA1", fontSize = 40.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Search 150 NeetCode problems", fontWeight = FontWeight.Bold)
                    Text("Try: \"two sum\", \"binary search\", \"DFS\"",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                }
            }

            LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                items(results) { result ->
                    val topicColor = try {
                        Color(android.graphics.Color.parseColor(result.topic.color))
                    } catch (e: Exception) { AlgoGreen }

                    Card(
                        modifier = Modifier.fillMaxWidth().clickable { onNavigateToLesson(result.slug) },
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(result.title, fontWeight = FontWeight.SemiBold)
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        result.topic.name,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = topicColor,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        " · ${result.pattern}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                    )
                                }
                            }
                            DifficultyBadge(result.difficulty)
                        }
                    }
                }
            }
        }
    }
}
