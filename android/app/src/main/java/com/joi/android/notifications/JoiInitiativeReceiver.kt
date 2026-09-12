package com.joi.android.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import kotlin.concurrent.thread

class JoiInitiativeReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_DISMISSED) return
        val userId = intent.getStringExtra(JoiNotificationCoordinator.EXTRA_USER_ID)
        val id = intent.getStringExtra(JoiNotificationCoordinator.EXTRA_INITIATIVE_ID)
        if (userId.isNullOrBlank() || id.isNullOrBlank()) {
            Log.w("JoiInitiative", "Notificacion descartada sin identificador")
            return
        }
        val pending = goAsync()
        thread {
            try {
                JoiInitiativeStore(context).dismissed(userId, id)
            } catch (error: Exception) {
                Log.e("JoiInitiative", "No se pudo registrar descarte: ${error.javaClass.simpleName}")
            } finally {
                pending.finish()
            }
        }
    }

    companion object {
        const val ACTION_DISMISSED = "com.joi.android.INITIATIVE_DISMISSED"
    }
}
