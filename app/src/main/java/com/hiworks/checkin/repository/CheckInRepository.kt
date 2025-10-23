package com.hiworks.checkin.repository

import com.hiworks.checkin.network.HiworksApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class CheckInResult(
    val success: Boolean,
    val message: String,
    val startTime: String? = null
)

class CheckInRepository(private val debug: Boolean = false) {
    private var apiClient: HiworksApiClient? = null

    suspend fun performCheckIn(
        officeDomain: String,
        userId: String,
        password: String
    ): CheckInResult = withContext(Dispatchers.IO) {
        try {
            // Create new API client for this session
            apiClient = HiworksApiClient(debug)

            // Step 1: Login
            val loginResult = apiClient!!.login(officeDomain, userId, password)
            if (loginResult.isFailure) {
                return@withContext CheckInResult(
                    success = false,
                    message = "로그인 실패: ${loginResult.exceptionOrNull()?.message}"
                )
            }

            // Step 2: Get work info
            val workInfoResult = apiClient!!.getWorkInfo()
            if (workInfoResult.isFailure) {
                return@withContext CheckInResult(
                    success = false,
                    message = "근무 정보 조회 실패: ${workInfoResult.exceptionOrNull()?.message}"
                )
            }

            val workInfo = workInfoResult.getOrNull()?.data
            val enableStart = workInfo?.enableStart
            val startAt = workInfo?.startAt
            val workStatus = workInfo?.workStatus

            // Step 3: Check if already checked in
            if (enableStart == "N") {
                return@withContext CheckInResult(
                    success = true,
                    message = "이미 출근 체크를 완료했습니다.",
                    startTime = startAt
                )
            }

            if (enableStart != "Y") {
                return@withContext CheckInResult(
                    success = false,
                    message = "출근 체크를 할 수 없는 상태입니다.\n현재 상태: ${workStatus ?: "알 수 없음"}"
                )
            }

            // Step 4: Perform check-in
            val checkInResult = apiClient!!.checkIn()
            if (checkInResult.isFailure) {
                return@withContext CheckInResult(
                    success = false,
                    message = "출근 체크 실패: ${checkInResult.exceptionOrNull()?.message}"
                )
            }

            // Step 5: Verify check-in
            val updatedWorkInfoResult = apiClient!!.getWorkInfo()
            val updatedStartAt = updatedWorkInfoResult.getOrNull()?.data?.startAt

            CheckInResult(
                success = true,
                message = "출근 체크 완료!",
                startTime = updatedStartAt
            )
        } catch (e: Exception) {
            CheckInResult(
                success = false,
                message = "오류 발생: ${e.message}"
            )
        }
    }
}
