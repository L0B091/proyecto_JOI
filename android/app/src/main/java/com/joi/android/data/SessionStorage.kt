package com.joi.android.data

import android.content.Context
import android.content.SharedPreferences
import kotlin.math.min

class SessionStorage(context: Context) {
    private val preferences: SharedPreferences =
        context.getSharedPreferences("joi_session", Context.MODE_PRIVATE)

    fun saveUser(session: UserSession) {
        preferences.edit()
            .putString(KEY_NAME, session.displayName)
            .putString(KEY_EMAIL, session.email)
            .putString(KEY_ID, session.id)
            .putString(KEY_AUTH_TOKEN, session.authToken)
            .putString(KEY_PHOTO_URL, session.photoUrl)
            .putBoolean(KEY_EMAIL_VERIFIED, session.emailVerified)
            .putLong(KEY_PREMIUM_UNTIL, session.premiumUntilMillis)
            .putLong(KEY_USAGE_MINUTES, session.usageMinutes)
            .apply()
    }

    fun loadUser(): UserSession? {
        val id = preferences.getString(KEY_ID, null) ?: return null
        return UserSession(
            displayName = preferences.getString(KEY_NAME, "Usuario") ?: "Usuario",
            email = preferences.getString(KEY_EMAIL, "") ?: "",
            id = id,
            authToken = preferences.getString(KEY_AUTH_TOKEN, null),
            photoUrl = preferences.getString(KEY_PHOTO_URL, null),
            emailVerified = preferences.getBoolean(KEY_EMAIL_VERIFIED, false),
            premiumUntilMillis = preferences.getLong(KEY_PREMIUM_UNTIL, 0L),
            usageMinutes = preferences.getLong(KEY_USAGE_MINUTES, 0L)
        )
    }

    fun clear() {
        preferences.edit().clear().apply()
    }

    fun addUsageMinutes(minutes: Long) {
        val current = preferences.getLong(KEY_USAGE_MINUTES, 0L)
        preferences.edit().putLong(KEY_USAGE_MINUTES, current + minutes).apply()
    }

    fun linkPercentage(session: UserSession): Int {
        val hours = session.usageMinutes / 60.0
        return min(99, (44 + hours * 2).toInt())
    }

    companion object {
        private const val KEY_NAME = "name"
        private const val KEY_EMAIL = "email"
        private const val KEY_ID = "id"
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_PHOTO_URL = "photo_url"
        private const val KEY_EMAIL_VERIFIED = "email_verified"
        private const val KEY_PREMIUM_UNTIL = "premium_until"
        private const val KEY_USAGE_MINUTES = "usage_minutes"
    }
}
