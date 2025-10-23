package com.hiworks.checkin.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hiworks.checkin.data.AppPreferences
import com.hiworks.checkin.repository.CheckInRepository
import com.hiworks.checkin.repository.CheckInResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class CheckInState {
    object Idle : CheckInState()
    object Loading : CheckInState()
    data class Success(val result: CheckInResult) : CheckInState()
    data class Error(val message: String) : CheckInState()
}

class MainViewModel(
    private val preferences: AppPreferences,
    private val repository: CheckInRepository
) : ViewModel() {

    private val _checkInState = MutableStateFlow<CheckInState>(CheckInState.Idle)
    val checkInState: StateFlow<CheckInState> = _checkInState.asStateFlow()

    fun isConfigured(): Boolean {
        return preferences.isConfigured()
    }

    fun performCheckIn() {
        viewModelScope.launch {
            try {
                _checkInState.value = CheckInState.Loading

                val result = repository.performCheckIn(
                    officeDomain = preferences.officeDomain,
                    userId = preferences.userId,
                    password = preferences.password
                )

                _checkInState.value = CheckInState.Success(result)
            } catch (e: Exception) {
                _checkInState.value = CheckInState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun resetState() {
        _checkInState.value = CheckInState.Idle
    }
}
