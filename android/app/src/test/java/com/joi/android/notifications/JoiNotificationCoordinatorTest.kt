package com.joi.android.notifications

import android.Manifest
import android.app.Application
import android.app.NotificationManager
import android.content.Context
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [33])
class JoiNotificationCoordinatorTest {
    private lateinit var context: Application
    private lateinit var coordinator: JoiNotificationCoordinator

    @Before fun setup() {
        context = RuntimeEnvironment.getApplication()
        coordinator = JoiNotificationCoordinator(context)
        shadowOf(context).grantPermissions(Manifest.permission.POST_NOTIFICATIONS)
    }

    private fun initiative(id: String) = JSONObject().put("id", id).put("mensaje", "Mensaje $id")

    @Test fun deniedPermissionDoesNotPostOrCrash() {
        shadowOf(context).denyPermissions(Manifest.permission.POST_NOTIFICATIONS)
        assertFalse(coordinator.showInitiativeNotification("u", initiative("a")))
        assertFalse(coordinator.canShowMessages())
    }

    @Test fun eachInitiativeKeepsItsOwnPendingIntentAndRepostsReplace() {
        assertTrue(coordinator.showInitiativeNotification("u", initiative("a")))
        assertTrue(coordinator.showInitiativeNotification("u", initiative("b")))
        assertTrue(coordinator.showInitiativeNotification("u", initiative("a")))
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notifications = shadowOf(manager).allNotifications
        assertEquals(2, notifications.size)
        val ids = notifications.map {
            shadowOf(it.contentIntent).savedIntent.getStringExtra(JoiNotificationCoordinator.EXTRA_INITIATIVE_ID)
        }.toSet()
        assertEquals(setOf("a", "b"), ids)
        coordinator.cancelInitiative("u", "a")
        assertEquals(1, shadowOf(manager).allNotifications.size)
    }
}
