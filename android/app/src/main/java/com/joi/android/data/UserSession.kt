package com.joi.android.data

data class UserSession(
    val displayName: String,
    val email: String,
    val id: String,
    val premiumUntilMillis: Long = 0L,
    val usageMinutes: Long = 0L
) {
    val isPremium: Boolean
        get() = premiumUntilMillis > System.currentTimeMillis()
}
