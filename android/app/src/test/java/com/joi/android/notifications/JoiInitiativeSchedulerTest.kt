package com.joi.android.notifications

import androidx.work.Configuration
import androidx.work.WorkInfo
import androidx.work.WorkManager
import androidx.work.testing.SynchronousExecutor
import androidx.work.testing.WorkManagerTestInitHelper
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE, sdk = [28])
class JoiInitiativeSchedulerTest {
    private lateinit var workManager: WorkManager
    private lateinit var scheduler: JoiInitiativeScheduler

    @Before fun setup() {
        val context = RuntimeEnvironment.getApplication()
        WorkManagerTestInitHelper.initializeTestWorkManager(
            context, Configuration.Builder().setExecutor(SynchronousExecutor()).build()
        )
        workManager = WorkManager.getInstance(context)
        scheduler = JoiInitiativeScheduler(context)
    }

    @Test fun repeatedStartupAndInteractionsDoNotDuplicateSchedules() {
        scheduler.ensureScheduled()
        val first = workManager.getWorkInfosForUniqueWork(JoiInitiativeScheduler.PERIODIC_WORK).get().single().id
        repeat(4) {
            scheduler.ensureScheduled()
            scheduler.afterInteraction()
        }
        val periodic = workManager.getWorkInfosForUniqueWork(JoiInitiativeScheduler.PERIODIC_WORK).get()
        assertEquals(listOf(first), periodic.map { it.id })
        assertEquals(1, workManager.getWorkInfosForUniqueWork(JoiInitiativeScheduler.EVENT_WORK).get().size)
    }

    @Test fun cancellingInitiativesCancelsBothWorkTypes() {
        scheduler.ensureScheduled()
        scheduler.afterInteraction()
        scheduler.cancel()
        for (name in listOf(JoiInitiativeScheduler.PERIODIC_WORK, JoiInitiativeScheduler.EVENT_WORK)) {
            assertTrue(workManager.getWorkInfosForUniqueWork(name).get().all { it.state == WorkInfo.State.CANCELLED })
        }
    }
}
