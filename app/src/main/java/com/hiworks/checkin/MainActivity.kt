package com.hiworks.checkin

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.hiworks.checkin.data.AppPreferences
import com.hiworks.checkin.repository.CheckInRepository
import com.hiworks.checkin.ui.theme.HiworksCheckinTheme
import com.hiworks.checkin.viewmodel.CheckInState
import com.hiworks.checkin.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val preferences = AppPreferences(this)
        val repository = CheckInRepository(preferences.debug)
        val shouldAutoCheckIn = intent?.action == "com.hiworks.checkin.ACTION_CHECK_IN"

        setContent {
            HiworksCheckinTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen(
                        preferences = preferences,
                        repository = repository,
                        shouldAutoCheckIn = shouldAutoCheckIn,
                        onSettingsClick = {
                            startActivity(Intent(this, SettingsActivity::class.java))
                        }
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (intent.action == "com.hiworks.checkin.ACTION_CHECK_IN") {
            recreate()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    preferences: AppPreferences,
    repository: CheckInRepository,
    shouldAutoCheckIn: Boolean = false,
    onSettingsClick: () -> Unit
) {
    val viewModel: MainViewModel = viewModel(
        factory = object : androidx.lifecycle.ViewModelProvider.Factory {
            override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(preferences, repository) as T
            }
        }
    )

    val checkInState by viewModel.checkInState.collectAsState()
    var showDialog by remember { mutableStateOf(false) }
    var dialogMessage by remember { mutableStateOf("") }
    var dialogTitle by remember { mutableStateOf("") }

    // Auto check-in when triggered by shortcut
    LaunchedEffect(shouldAutoCheckIn) {
        if (shouldAutoCheckIn && viewModel.isConfigured()) {
            viewModel.performCheckIn()
        }
    }

    LaunchedEffect(checkInState) {
        when (val state = checkInState) {
            is CheckInState.Success -> {
                dialogTitle = if (state.result.success) "성공" else "알림"
                dialogMessage = buildString {
                    append(state.result.message)
                    if (state.result.startTime != null && state.result.startTime != "0000-00-00 00:00:00") {
                        append("\n\n출근 시간: ${state.result.startTime}")
                    }
                }
                showDialog = true
            }
            is CheckInState.Error -> {
                dialogTitle = "오류"
                dialogMessage = state.message
                showDialog = true
            }
            else -> {}
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("하이웍스 출근체크") },
                actions = {
                    IconButton(onClick = onSettingsClick) {
                        Text("⚙️", style = MaterialTheme.typography.headlineSmall)
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                Text(
                    text = "출근체크",
                    style = MaterialTheme.typography.headlineMedium
                )

                if (!viewModel.isConfigured()) {
                    Text(
                        text = "설정을 먼저 완료해주세요",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.error
                    )
                    Button(
                        onClick = onSettingsClick,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                    ) {
                        Text("설정하기", style = MaterialTheme.typography.titleMedium)
                    }
                } else {
                    Button(
                        onClick = { viewModel.performCheckIn() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        enabled = checkInState !is CheckInState.Loading
                    ) {
                        if (checkInState is CheckInState.Loading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = MaterialTheme.colorScheme.onPrimary
                            )
                        } else {
                            Text("출근체크", style = MaterialTheme.typography.titleMedium)
                        }
                    }

                    OutlinedButton(
                        onClick = onSettingsClick,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                    ) {
                        Text("설정", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }
    }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = {
                showDialog = false
                viewModel.resetState()
            },
            title = { Text(dialogTitle) },
            text = { Text(dialogMessage) },
            confirmButton = {
                TextButton(
                    onClick = {
                        showDialog = false
                        viewModel.resetState()
                    }
                ) {
                    Text("확인")
                }
            }
        )
    }
}
