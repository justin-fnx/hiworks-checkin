package com.hiworks.checkin.data

import android.content.Context
import android.content.SharedPreferences

class AppPreferences(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREF_NAME = "hiworks_checkin_prefs"
        private const val KEY_OFFICE_DOMAIN = "office_domain"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_PASSWORD = "password"
        private const val KEY_DEBUG = "debug"
    }

    var officeDomain: String
        get() = prefs.getString(KEY_OFFICE_DOMAIN, "") ?: ""
        set(value) = prefs.edit().putString(KEY_OFFICE_DOMAIN, value).apply()

    var userId: String
        get() = prefs.getString(KEY_USER_ID, "") ?: ""
        set(value) = prefs.edit().putString(KEY_USER_ID, value).apply()

    var password: String
        get() = prefs.getString(KEY_PASSWORD, "") ?: ""
        set(value) = prefs.edit().putString(KEY_PASSWORD, value).apply()

    var debug: Boolean
        get() = prefs.getBoolean(KEY_DEBUG, false)
        set(value) = prefs.edit().putBoolean(KEY_DEBUG, value).apply()

    fun isConfigured(): Boolean {
        return officeDomain.isNotEmpty() && userId.isNotEmpty() && password.isNotEmpty()
    }
}
