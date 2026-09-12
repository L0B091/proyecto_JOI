package com.joi.android.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.joi.android.data.SessionStorage

class JoiBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (Intent.ACTION_BOOT_COMPLETED == intent.action || Intent.ACTION_MY_PACKAGE_REPLACED == intent.action) {
            JoiNotificationChannels.ensure(context)
            JoiAlarmScheduler(context).rescheduleStoredAlarms()
            val session = SessionStorage(context).loadUser()
            if (session != null && JoiInitiativeStore(context).isEnabled(session.id)) {
                JoiInitiativeScheduler(context).ensureScheduled()
            }
        }
    }
}
