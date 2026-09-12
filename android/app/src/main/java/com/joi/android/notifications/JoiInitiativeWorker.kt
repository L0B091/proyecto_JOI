package com.joi.android.notifications

import android.content.Context
import android.util.Log
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.ProcessLifecycleOwner
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.joi.android.data.LocalMemoryStore
import com.joi.android.data.SessionStorage
import com.joi.android.net.JoiBackendClient
import java.util.concurrent.locks.ReentrantLock
import org.json.JSONArray
import org.json.JSONObject

class JoiInitiativeWorker(context: Context, parameters: WorkerParameters) : Worker(context, parameters) {
    override fun doWork(): Result {
        if (!evaluationLock.tryLock()) return Result.success()
        try {
            val sessionStorage = SessionStorage(applicationContext)
            val session = sessionStorage.loadUser() ?: return Result.success()
            val store = JoiInitiativeStore(applicationContext)
            val coordinator = JoiNotificationCoordinator(applicationContext)
            store.expire(session.id).forEach { coordinator.cancelInitiative(session.id, it) }
            if (!store.isEnabled(session.id)) return wait(store, session.id, "deshabilitadas")
            if (inForeground()) return wait(store, session.id, "en_primer_plano")
            if (!coordinator.canShowMessages()) return wait(store, session.id, "notificaciones_denegadas")

            val backend = JoiBackendClient()
            if (!backend.isConfigured()) return wait(store, session.id, "backend_no_configurado")
            if (!backend.isOnline(applicationContext)) return wait(store, session.id, "sin_red")

            val requestState = store.snapshot(session.id)
            val alarmEvents = JSONArray()
            JoiAlarmStore(applicationContext).listForUser(session.id).filter { it.state == "ACTIVE" }.forEach { alarm ->
                alarmEvents.put(JSONObject().apply {
                    put("id", alarm.id)
                    put("referenciaEvento", alarm.id)
                    put("categoria", "ALARMA")
                    put("motivo", "Alarma explicitamente programada")
                    put("timestamp", alarm.triggerAtMillis)
                    put("expiresAt", alarm.triggerAtMillis + (alarm.dispatchPlan.maxOfOrNull { it.offsetFromAlarmMs } ?: 0L) + 60_000)
                    put("fuente", "android_alarm_manager")
                    put("contexto", JSONObject().put("programadoPorUsuario", true).put("evidencia", alarm.message))
                })
            }
            val decision = backend.evaluateInitiative(
                session, LocalMemoryStore(applicationContext).load(session.id), requestState, alarmEvents
            )
            decision.optJSONObject("perfilRitmo")?.let { store.mergeProfile(session.id, it) }

            if (decision.getString("decision") == "ESPERAR") {
                return wait(store, session.id, decision.getString("motivoEspera"))
            }
            check(decision.getString("decision") == "INICIAR") { "Decision de iniciativa invalida" }
            val initiative = decision.getJSONObject("iniciativa")
            JoiInitiativeStore.validateInitiative(initiative)

            // Explicit alarms already have an exact native schedule and must not be delivered twice.
            if (initiative.getString("categoria") == "ALARMA") {
                return wait(store, session.id, "alarma_gestionada_por_scheduler_nativo")
            }
            if (isStopped || sessionStorage.loadUser()?.id != session.id) return Result.success()
            if (inForeground() || !store.isEnabled(session.id) || !coordinator.canShowMessages()) {
                return wait(store, session.id, "disponibilidad_cambio")
            }
            val currentState = store.snapshot(session.id)
            if (currentState.optLong("ultimaInteraccion") != requestState.optLong("ultimaInteraccion") ||
                currentState.optJSONObject("perfilRitmo")?.optJSONObject("configurado")?.toString() !=
                requestState.optJSONObject("perfilRitmo")?.optJSONObject("configurado")?.toString()
            ) {
                return wait(store, session.id, "contexto_cambio")
            }
            if (initiative.getLong("expiresAt") <= System.currentTimeMillis()) {
                return wait(store, session.id, "iniciativa_vencida")
            }

            val id = initiative.getString("id")
            val existing = store.find(session.id, id)
            if (existing != null && (!existing.isNull("entregada") || existing.optString("estado") != "ENVIADA")) {
                return wait(store, session.id, "duplicada")
            }
            if (!store.reserve(session.id, initiative) && existing == null) {
                return wait(store, session.id, "duplicada_archivada")
            }
            if (coordinator.showInitiativeNotification(session.id, initiative)) {
                store.delivered(session.id, id)
                store.recordDecision(session.id, "INICIAR")
            } else {
                store.cancelled(session.id, id)
                store.recordDecision(session.id, "notificacion_no_entregada")
            }
            return Result.success()
        } catch (error: Exception) {
            Log.e(TAG, "Fallo de iniciativa: ${error.javaClass.simpleName}")
            return if (!isStopped && runAttemptCount < 2) Result.retry() else Result.failure()
        } finally {
            evaluationLock.unlock()
        }
    }

    private fun wait(store: JoiInitiativeStore, userId: String, reason: String): Result {
        store.recordDecision(userId, reason)
        return Result.success()
    }

    private fun inForeground(): Boolean =
        ProcessLifecycleOwner.get().lifecycle.currentState.isAtLeast(Lifecycle.State.STARTED)

    companion object {
        private const val TAG = "JoiInitiative"
        private val evaluationLock = ReentrantLock()
    }
}
