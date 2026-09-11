package com.joi.android.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.Locale

data class LocalConversationEntry(
    val role: String,
    val text: String,
    val timestamp: Long
)

data class LocalMemoryNote(
    val category: String,
    val text: String,
    val importance: Int,
    val timestamp: Long
)

data class LocalAssetMemory(
    val name: String,
    val summary: String,
    val timestamp: Long
)

data class LocalJoiMemory(
    val version: Int = 1,
    val userId: String,
    val conversation: MutableList<LocalConversationEntry> = mutableListOf(),
    val shortTermFocus: String = "general",
    val shortTermIntent: String = "acompanar",
    val persistentMemories: MutableList<LocalMemoryNote> = mutableListOf(),
    val importantMemories: MutableList<LocalMemoryNote> = mutableListOf(),
    val codeMemories: MutableList<LocalAssetMemory> = mutableListOf(),
    val fiscalMemories: MutableList<LocalAssetMemory> = mutableListOf(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    fun withUpdatedTimestamp() = copy(updatedAt = System.currentTimeMillis())

    fun toJson(): JSONObject = JSONObject().apply {
        put("version", version)
        put("userId", userId)
        put("shortTermFocus", shortTermFocus)
        put("shortTermIntent", shortTermIntent)
        put("updatedAt", updatedAt)
        put("conversation", JSONArray().apply {
            conversation.forEach { entry ->
                put(JSONObject().apply {
                    put("role", entry.role)
                    put("text", entry.text)
                    put("timestamp", entry.timestamp)
                })
            }
        })
        put("persistentMemories", Companion.notesToJson(persistentMemories))
        put("importantMemories", Companion.notesToJson(importantMemories))
        put("codeMemories", Companion.assetsToJson(codeMemories))
        put("fiscalMemories", Companion.assetsToJson(fiscalMemories))
    }

    fun toBackendContext(): JSONObject = JSONObject().apply {
        put("source", "android_local_primary")
        put("version", version)
        put("shortTermFocus", shortTermFocus)
        put("shortTermIntent", shortTermIntent)
        put("updatedAt", updatedAt)
        put("recentConversation", JSONArray().apply {
            conversation.takeLast(20).forEach { entry ->
                put(JSONObject().apply {
                    put("role", entry.role)
                    put("text", entry.text)
                    put("timestamp", entry.timestamp)
                })
            }
        })
        put("persistentMemories", Companion.notesToJson(persistentMemories.takeLast(12)))
        put("importantMemories", Companion.notesToJson(importantMemories.takeLast(8)))
        put("codeMemories", Companion.assetsToJson(codeMemories.takeLast(8)))
        put("fiscalMemories", Companion.assetsToJson(fiscalMemories.takeLast(8)))
    }

    companion object {
        fun fromJson(json: JSONObject): LocalJoiMemory {
            return LocalJoiMemory(
                version = json.optInt("version", 1),
                userId = json.optString("userId"),
                conversation = jsonArrayToConversation(json.optJSONArray("conversation")),
                shortTermFocus = json.optString("shortTermFocus", "general"),
                shortTermIntent = json.optString("shortTermIntent", "acompanar"),
                persistentMemories = jsonArrayToNotes(json.optJSONArray("persistentMemories")),
                importantMemories = jsonArrayToNotes(json.optJSONArray("importantMemories")),
                codeMemories = jsonArrayToAssets(json.optJSONArray("codeMemories")),
                fiscalMemories = jsonArrayToAssets(json.optJSONArray("fiscalMemories")),
                updatedAt = json.optLong("updatedAt", System.currentTimeMillis())
            )
        }

        private fun notesToJson(notes: List<LocalMemoryNote>): JSONArray = JSONArray().apply {
            notes.forEach { note ->
                put(JSONObject().apply {
                    put("category", note.category)
                    put("text", note.text)
                    put("importance", note.importance)
                    put("timestamp", note.timestamp)
                })
            }
        }

        private fun assetsToJson(assets: List<LocalAssetMemory>): JSONArray = JSONArray().apply {
            assets.forEach { asset ->
                put(JSONObject().apply {
                    put("name", asset.name)
                    put("summary", asset.summary)
                    put("timestamp", asset.timestamp)
                })
            }
        }

        private fun jsonArrayToConversation(array: JSONArray?): MutableList<LocalConversationEntry> {
            val result = mutableListOf<LocalConversationEntry>()
            if (array == null) return result
            for (index in 0 until array.length()) {
                val item = array.optJSONObject(index) ?: continue
                result += LocalConversationEntry(
                    role = item.optString("role", "user"),
                    text = item.optString("text", ""),
                    timestamp = item.optLong("timestamp", System.currentTimeMillis())
                )
            }
            return result
        }

        private fun jsonArrayToNotes(array: JSONArray?): MutableList<LocalMemoryNote> {
            val result = mutableListOf<LocalMemoryNote>()
            if (array == null) return result
            for (index in 0 until array.length()) {
                val item = array.optJSONObject(index) ?: continue
                result += LocalMemoryNote(
                    category = item.optString("category", "general"),
                    text = item.optString("text", ""),
                    importance = item.optInt("importance", 1),
                    timestamp = item.optLong("timestamp", System.currentTimeMillis())
                )
            }
            return result
        }

        private fun jsonArrayToAssets(array: JSONArray?): MutableList<LocalAssetMemory> {
            val result = mutableListOf<LocalAssetMemory>()
            if (array == null) return result
            for (index in 0 until array.length()) {
                val item = array.optJSONObject(index) ?: continue
                result += LocalAssetMemory(
                    name = item.optString("name", ""),
                    summary = item.optString("summary", ""),
                    timestamp = item.optLong("timestamp", System.currentTimeMillis())
                )
            }
            return result
        }
    }
}

class LocalMemoryStore(context: Context) {
    private val root = File(context.filesDir, "joi_memory").apply { mkdirs() }

    fun load(userId: String): LocalJoiMemory {
        val file = memoryFile(userId)
        if (!file.exists()) {
            return LocalJoiMemory(userId = userId)
        }
        return runCatching {
            LocalJoiMemory.fromJson(JSONObject(file.readText()))
        }.getOrElse {
            LocalJoiMemory(userId = userId)
        }
    }

    fun save(memory: LocalJoiMemory) {
        memoryFile(memory.userId).writeText(memory.withUpdatedTimestamp().toJson().toString())
    }

    fun replace(memory: LocalJoiMemory) = save(memory)

    fun migrateUserMemory(fromUserId: String, toUserId: String) {
        if (fromUserId == toUserId) return
        val fromFile = memoryFile(fromUserId)
        if (!fromFile.exists()) return
        if (!isEffectivelyEmpty(toUserId)) return
        val sourceMemory = load(fromUserId)
        save(sourceMemory.copy(userId = toUserId))
        fromFile.delete()
    }

    fun isEffectivelyEmpty(userId: String): Boolean {
        val memory = load(userId)
        return memory.conversation.isEmpty() &&
            memory.persistentMemories.isEmpty() &&
            memory.importantMemories.isEmpty() &&
            memory.codeMemories.isEmpty() &&
            memory.fiscalMemories.isEmpty()
    }

    fun appendUserMessage(userId: String, rawText: String) {
        val memory = load(userId)
        val text = rawText.trim()
        if (text.isEmpty()) return
        val updated = memory.copy(
            conversation = (memory.conversation + LocalConversationEntry("user", text, System.currentTimeMillis()))
                .takeLast(200)
                .toMutableList(),
            shortTermFocus = inferFocus(text),
            shortTermIntent = inferIntent(text),
            persistentMemories = mergeNotes(
                memory.persistentMemories,
                extractPersistentNote(text)
            ),
            importantMemories = mergeNotes(
                memory.importantMemories,
                extractImportantNote(text)
            )
        )
        save(updated)
    }

    fun appendAssistantMessage(userId: String, rawText: String) {
        val memory = load(userId)
        val text = rawText.trim()
        if (text.isEmpty()) return
        val updated = memory.copy(
            conversation = (memory.conversation + LocalConversationEntry("assistant", text, System.currentTimeMillis()))
                .takeLast(200)
                .toMutableList()
        )
        save(updated)
    }

    private fun memoryFile(userId: String): File {
        val safeUserId = userId.lowercase(Locale.US).replace(Regex("[^a-z0-9._-]"), "_")
        return File(root, "$safeUserId.json")
    }

    private fun inferFocus(text: String): String {
        val normalized = text.lowercase(Locale.US)
        return when {
            "código" in normalized || "codigo" in normalized || "program" in normalized -> "codigo"
            "factura" in normalized || "impuesto" in normalized || "fiscal" in normalized -> "fiscal"
            "agenda" in normalized || "alarma" in normalized || "record" in normalized -> "organizacion"
            "premium" in normalized || "pago" in normalized -> "premium"
            else -> "general"
        }
    }

    private fun inferIntent(text: String): String {
        val normalized = text.lowercase(Locale.US)
        return when {
            normalized.contains("?") || normalized.startsWith("qué") || normalized.startsWith("como") -> "resolver"
            "recuerda" in normalized || "acuérdate" in normalized || "anota" in normalized -> "recordar"
            else -> "acompanar"
        }
    }

    private fun extractPersistentNote(text: String): LocalMemoryNote? {
        val normalized = text.lowercase(Locale.US)
        val shouldPersist = listOf(
            "me gusta",
            "prefiero",
            "trabajo",
            "estoy construyendo",
            "proyecto",
            "mi empresa",
            "mi horario"
        ).any { normalized.contains(it) }
        if (!shouldPersist) return null
        return LocalMemoryNote(
            category = inferFocus(text),
            text = text.trim(),
            importance = 2,
            timestamp = System.currentTimeMillis()
        )
    }

    private fun extractImportantNote(text: String): LocalMemoryNote? {
        val normalized = text.lowercase(Locale.US)
        val shouldPersist = listOf(
            "recuérd",
            "importante",
            "no olvides",
            "mi nombre es",
            "cumpleaños",
            "google"
        ).any { normalized.contains(it) }
        if (!shouldPersist) return null
        return LocalMemoryNote(
            category = "importante",
            text = text.trim(),
            importance = 3,
            timestamp = System.currentTimeMillis()
        )
    }

    private fun mergeNotes(existing: MutableList<LocalMemoryNote>, candidate: LocalMemoryNote?): MutableList<LocalMemoryNote> {
        if (candidate == null) return existing
        val deduped = existing.filterNot { it.text.equals(candidate.text, ignoreCase = true) }
        return (deduped + candidate).takeLast(64).toMutableList()
    }
}
