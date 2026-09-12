package com.joi.android.notifications

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.joi.android.MainActivity
import com.joi.android.R
import com.joi.android.net.AlarmDispatchStage

class JoiNotificationCoordinator(private val context: Context) {
    private val haptics = JoiHaptics(context)

    fun showMessageNotification(userId: String, title: String, message: String, vibration: Boolean = true) {
        JoiNotificationChannels.ensure(context)
        if (vibration) haptics.vibrateMessage()
        NotificationManagerCompat.from(context).notify(
            ("message-$userId-$title-$message").hashCode(),
            NotificationCompat.Builder(context, JoiNotificationChannels.CHANNEL_MESSAGES)
                .setSmallIcon(R.drawable.ic_joi_notification)
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setContentIntent(mainPendingIntent(userId, null, 0, "message", title, message))
                .applyPreOConfig(false)
                .build()
        )
    }

    fun showAlarmNotification(userId: String, alarmId: String, stage: AlarmDispatchStage) {
        JoiNotificationChannels.ensure(context)
        if (stage.notificationType == "alarm") {
            haptics.vibrateAlarm()
        } else {
            haptics.vibrateMessage()
        }

        NotificationManagerCompat.from(context).notify(
            notificationId(alarmId, stage.stage),
            NotificationCompat.Builder(
                context,
                if (stage.notificationType == "alarm") JoiNotificationChannels.CHANNEL_ALARMS else JoiNotificationChannels.CHANNEL_MESSAGES
            )
                .setSmallIcon(R.drawable.ic_joi_notification)
                .setContentTitle(stage.title)
                .setContentText(stage.message)
                .setPriority(
                    if (stage.notificationType == "alarm") NotificationCompat.PRIORITY_MAX
                    else NotificationCompat.PRIORITY_HIGH
                )
                .setCategory(
                    if (stage.notificationType == "alarm") NotificationCompat.CATEGORY_ALARM
                    else NotificationCompat.CATEGORY_MESSAGE
                )
                .setAutoCancel(true)
                .setContentIntent(
                    mainPendingIntent(
                        userId = userId,
                        alarmId = alarmId,
                        stage = stage.stage,
                        eventType = "alarm",
                        title = stage.title,
                        message = stage.message
                    )
                )
                .applyPreOConfig(stage.notificationType == "alarm")
                .build()
        )
    }

    fun cancelAlarmNotifications(alarmId: String) {
        val manager = NotificationManagerCompat.from(context)
        (1..3).forEach { stage ->
            manager.cancel(notificationId(alarmId, stage))
        }
    }

    private fun NotificationCompat.Builder.applyPreOConfig(alarm: Boolean): NotificationCompat.Builder {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            setSound(
                JoiNotificationChannels.soundUri(
                    context,
                    if (alarm) R.raw.joi_alarm_alert else R.raw.joi_message_bubble
                )
            )
            setVibrate(
                if (alarm) longArrayOf(0, 300, 150, 500, 150, 700)
                else longArrayOf(0, 120, 70, 120)
            )
        }
        return this
    }

    private fun mainPendingIntent(
        userId: String,
        alarmId: String?,
        stage: Int,
        eventType: String,
        title: String,
        message: String
    ): PendingIntent {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(EXTRA_USER_ID, userId)
            putExtra(EXTRA_ALARM_ID, alarmId)
            putExtra(EXTRA_STAGE, stage)
            putExtra(EXTRA_EVENT_TYPE, eventType)
            putExtra(EXTRA_TITLE, title)
            putExtra(EXTRA_MESSAGE, message)
        }
        return PendingIntent.getActivity(
            context,
            ("$userId-$alarmId-$stage-$eventType").hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    companion object {
        const val EXTRA_USER_ID = "joi_user_id"
        const val EXTRA_ALARM_ID = "joi_alarm_id"
        const val EXTRA_STAGE = "joi_alarm_stage"
        const val EXTRA_EVENT_TYPE = "joi_event_type"
        const val EXTRA_TITLE = "joi_event_title"
        const val EXTRA_MESSAGE = "joi_event_message"

        fun notificationId(alarmId: String, stage: Int): Int =
            "alarm-$alarmId-$stage".hashCode()
    }
}
