package com.hiworks.checkin.network

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

// API Response Models
data class LoginRequest(
    val id: String,
    val password: String,
    @SerializedName("ip_security_level")
    val ipSecurityLevel: String = "1"
)

data class WorkInfoResponse(
    val data: WorkInfo?
)

data class WorkInfo(
    @SerializedName("enable_start")
    val enableStart: String?,
    @SerializedName("work_status")
    val workStatus: String?,
    @SerializedName("start_at")
    val startAt: String?
)

data class CheckInRequest(
    val data: CheckInData
)

data class CheckInData(
    val type: String // "1": 출근, "2": 퇴근
)

data class CheckInResponse(
    val errors: ErrorInfo? = null
)

data class ErrorInfo(
    val message: String?
)

class HiworksApiClient(private val debug: Boolean = false) {
    private val cookieJar = SimpleCookieJar()
    private val gson = Gson()

    private val client: OkHttpClient by lazy {
        val builder = OkHttpClient.Builder()
            .cookieJar(cookieJar)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)

        if (debug) {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            builder.addInterceptor(loggingInterceptor)
        }

        builder.build()
    }

    private fun log(step: String, message: String) {
        if (debug) {
            println("[$step]: $message")
        }
    }

    suspend fun login(officeDomain: String, userId: String, password: String): Result<String> {
        return try {
            log("로그인", "로그인 시작...")

            cookieJar.clear()

            val loginUrl = "https://auth-api.office.hiworks.com/office-web/login"
            val loginRequest = LoginRequest(
                id = "$userId@$officeDomain",
                password = password
            )
            val requestBody = gson.toJson(loginRequest)
                .toRequestBody("application/json".toMediaType())

            val request = Request.Builder()
                .url(loginUrl)
                .post(requestBody)
                .addHeader("Accept", "application/json")
                .addHeader("Origin", "https://login.office.hiworks.com")
                .addHeader("Referer", "https://login.office.hiworks.com/")
                .addHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""

            if (response.code != 200) {
                log("로그인", "실패: ${response.code} - $responseBody")
                return Result.failure(Exception("로그인 실패: ${response.code} - $responseBody"))
            }

            log("로그인", "로그인 성공!")
            Result.success(responseBody)
        } catch (e: Exception) {
            log("오류", e.message ?: "Unknown error")
            Result.failure(e)
        }
    }

    suspend fun getWorkInfo(): Result<WorkInfoResponse> {
        return try {
            log("근무 정보", "현재 근무 정보 조회 중...")

            val workInfoUrl = "https://hr-timecheck-api.office.hiworks.com/v4/web/user-work-info"

            val request = Request.Builder()
                .url(workInfoUrl)
                .get()
                .addHeader("Accept", "application/json, text/plain, */*")
                .addHeader("Origin", "https://hr-work.office.hiworks.com")
                .addHeader("Referer", "https://hr-work.office.hiworks.com/")
                .addHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""

            if (response.code != 200) {
                log("근무 정보", "조회 실패: ${response.code} - $responseBody")
                return Result.failure(Exception("근무 정보 조회 실패: ${response.code}"))
            }

            val workInfoResponse = gson.fromJson(responseBody, WorkInfoResponse::class.java)
            log("근무 정보", "조회 성공 - enable_start: ${workInfoResponse.data?.enableStart}")

            Result.success(workInfoResponse)
        } catch (e: Exception) {
            log("오류", e.message ?: "Unknown error")
            Result.failure(e)
        }
    }

    suspend fun checkIn(): Result<String> {
        return try {
            log("출근 체크", "출근 체크 시작...")

            val checkInUrl = "https://hr-timecheck-api.office.hiworks.com/v4/web/time-record"
            val checkInRequest = CheckInRequest(
                data = CheckInData(type = "1")
            )
            val requestBody = gson.toJson(checkInRequest)
                .toRequestBody("application/json".toMediaType())

            val request = Request.Builder()
                .url(checkInUrl)
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json, text/plain, */*")
                .addHeader("Origin", "https://hr-work.office.hiworks.com")
                .addHeader("Referer", "https://hr-work.office.hiworks.com/")
                .addHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""

            if (response.code / 100 != 2) {
                val errorResponse = try {
                    gson.fromJson(responseBody, CheckInResponse::class.java)
                } catch (e: Exception) {
                    null
                }
                val errorMessage = errorResponse?.errors?.message ?: responseBody
                log("출근 체크", "실패: ${response.code} - $errorMessage")
                return Result.failure(Exception("출근 체크 실패: ${response.code} - $errorMessage"))
            }

            log("출근 체크", "출근 체크 성공!")
            Result.success(responseBody)
        } catch (e: Exception) {
            log("오류", e.message ?: "Unknown error")
            Result.failure(e)
        }
    }
}
