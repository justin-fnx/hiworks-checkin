package com.hiworks.checkin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.hiworks.checkin.data.AppPreferences
import com.hiworks.checkin.ui.theme.HiworksCheckinTheme

class SettingsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val preferences = AppPreferences(this)

        setContent {
            HiworksCheckinTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SettingsScreen(
                        preferences = preferences,
                        onBackClick = { finish() }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    preferences: AppPreferences,
    onBackClick: () -> Unit
) {
    var officeDomain by remember { mutableStateOf(preferences.officeDomain) }
    var userId by remember { mutableStateOf(preferences.userId) }
    var password by remember { mutableStateOf(preferences.password) }
    var debug by remember { mutableStateOf(preferences.debug) }
    var passwordVisible by remember { mutableStateOf(false) }
    var showSaveDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("설정") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Text("←", style = MaterialTheme.typography.headlineSmall)
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "하이웍스 계정 정보",
                style = MaterialTheme.typography.titleLarge
            )

            OutlinedTextField(
                value = officeDomain,
                onValueChange = { officeDomain = it },
                label = { Text("Office Domain") },
                placeholder = { Text("예: yourcompany") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            OutlinedTextField(
                value = userId,
                onValueChange = { userId = it },
                label = { Text("User ID") },
                placeholder = { Text("이메일의 @ 앞부분") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Text(if (passwordVisible) "👁️" else "👁️‍🗨️")
                    }
                }
            )

            Divider(modifier = Modifier.padding(vertical = 8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "디버그 모드",
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.align(androidx.compose.ui.Alignment.CenterVertically)
                )
                Switch(
                    checked = debug,
                    onCheckedChange = { debug = it }
                )
            }

            Text(
                text = "디버그 모드를 활성화하면 자세한 로그가 출력됩니다.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    preferences.officeDomain = officeDomain
                    preferences.userId = userId
                    preferences.password = password
                    preferences.debug = debug
                    showSaveDialog = true
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                enabled = officeDomain.isNotEmpty() && userId.isNotEmpty() && password.isNotEmpty()
            ) {
                Text("저장", style = MaterialTheme.typography.titleMedium)
            }

            OutlinedButton(
                onClick = onBackClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
            ) {
                Text("취소", style = MaterialTheme.typography.titleMedium)
            }

            Spacer(modifier = Modifier.height(16.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "ℹ️ 도움말",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = "• Office Domain: 회사의 하이웍스 도메인을 입력하세요\n" +
                                "• User ID: 이메일 주소의 @ 앞부분만 입력하세요\n" +
                                "• Password: 하이웍스 로그인 비밀번호를 입력하세요",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }

    if (showSaveDialog) {
        AlertDialog(
            onDismissRequest = {
                showSaveDialog = false
                onBackClick()
            },
            title = { Text("저장 완료") },
            text = { Text("설정이 저장되었습니다.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showSaveDialog = false
                        onBackClick()
                    }
                ) {
                    Text("확인")
                }
            }
        )
    }
}
