package com.joi.android.net

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import com.joi.android.BuildConfig
import com.joi.android.data.LocalJoiMemory
import com.joi.android.data.UserSession
import org.json.JSONObject
import java.io.BufferedReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

data class BackendAuthResult(
    val token: String,
    val userId: String,
    val displayName: String,
    val photoUrl: String?,
    val emailVerified: Boolean
)

data class BackendChatResult(
    val reply: String,
    val tone: String?,
    val rhythm: String?,
    val microExpression: String?,
    val premiumUntilMillis: Long?
)

data class PremiumStatusResult(
    val active: Boolean,
    val premiumUntilMillis: Long,
    val backupMaterial: String?
)

class JoiBackendClient {
    val googleWebClientId: String = BuildConfig.GOOGLE_WEB_CLIENT_ID.trim()
    private val baseUrl: String = BuildConfig.BACKEND_BASE_URL.trim().trimEnd('/')

    fun isConfigured(): Boolean = baseUrl.isNotEmpty()

    fun isOnline(context: Context): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    fun authenticateWithGoogle(idToken: String): BackendAuthResult {
        val json = request(
            method = "POST",
            path = "/api/auth/google",
            body = JSONObject().put("idToken", idToken)
        )
        val data = json.optJSONObject("data") ?: json
        val profile = data.optJSONObject("profile") ?: JSONObject()
        return BackendAuthResult(
            token = data.getString("token"),
            userId = profile.optString("userId", data.optString("userId")),
            displayName = profile.optString("displayName", "Usuario"),
            photoUrl = profile.optString("photoUrl").ifBlank { null },
            emailVerified = profile.optBoolean("emailVerified", false)
        )
    }

    fun sendChat(session: UserSession, memory: LocalJoiMemory, message: String): BackendChatResult {
        val json = request(
            method = "POST",
            path = "/chat",
            authToken = session.authToken,
            body = JSONObject().apply {
                put("mensaje", message)
                put("userId", session.id)
                put("contexto", JSONObject().apply {
                    put("clienteOficial", "android_nativo")
                    put("memoriaLocal", memory.toBackendContext())
                })
            }
        )

        return BackendChatResult(
            reply = json.optString("respuesta", "JOI recibió el mensaje, pero no devolvió texto."),
            tone = json.optJSONObject("expresion")?.optString("tono"),
            rhythm = json.optJSONObject("expresion")?.optString("ritmo"),
            microExpression = json.optJSONObject("expresion")?.optString("microexpresion"),
            premiumUntilMillis = parseIsoMillis(json.optJSONObject("premium")?.optString("premiumHasta"))
        )
    }

    fun fetchPremiumStatus(session: UserSession): PremiumStatusResult {
        val json = request(
            method = "GET",
            path = "/api/premium/${session.id}",
            authToken = session.authToken
        )
        val data = json.optJSONObject("data") ?: json
        return PremiumStatusResult(
            active = data.optBoolean("premiumActivo", false),
            premiumUntilMillis = parseIsoMillis(data.optString("premiumHasta")) ?: 0L,
            backupMaterial = data.optString("backupMaterial").ifBlank { null }
        )
    }

    fun fetchBackupMaterial(session: UserSession): String {
        val json = request(
            method = "GET",
            path = "/api/premium/${session.id}/backup/materials",
            authToken = session.authToken
        )
        return json.optJSONObject("data")?.optString("backupMaterial")
            ?.takeIf { it.isNotBlank() }
            ?: throw IllegalStateException("Material de respaldo no disponible")
    }

    fun uploadEncryptedBackup(session: UserSession, encryptedBackup: JSONObject) {
        request(
            method = "PUT",
            path = "/api/premium/${session.id}/backup",
            authToken = session.authToken,
            body = JSONObject().put("backup", encryptedBackup)
        )
    }

    fun downloadEncryptedBackup(session: UserSession): JSONObject? {
        val json = request(
            method = "GET",
            path = "/api/premium/${session.id}/backup",
            authToken = session.authToken
        )
        return json.optJSONObject("data")?.optJSONObject("backup")
    }

    private fun request(
        method: String,
        path: String,
        authToken: String? = null,
        body: JSONObject? = null
    ): JSONObject {
        check(isConfigured()) { "BACKEND_BASE_URL no configurada." }
        val connection = (URL("$baseUrl$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 10_000
            readTimeout = 20_000
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
            if (!authToken.isNullOrBlank()) {
                setRequestProperty("Authorization", "Bearer ".plus(authToken))
            }
            doInput = true
            if (body != null) {
                doOutput = true
            }
        }

        if (body != null) {
            OutputStreamWriter(connection.outputStream).use { writer ->
                writer.write(body.toString())
            }
        }

        val responseCode = connection.responseCode
        val stream = if (responseCode in 200..299) connection.inputStream else connection.errorStream
        val responseText = stream?.bufferedReader()?.use(BufferedReader::readText).orEmpty()
        val responseJson = responseText.takeIf { it.isNotBlank() }?.let(::JSONObject) ?: JSONObject()

        if (responseCode !in 200..299) {
            throw IllegalStateException(responseJson.optString("error").ifBlank {
                "Error HTTP $responseCode"
            })
        }
        return responseJson
    }

    private fun parseIsoMillis(rawValue: String?): Long? {
        if (rawValue.isNullOrBlank()) return null
        val patterns = listOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            "yyyy-MM-dd'T'HH:mm:ssX"
        )
        patterns.forEach { pattern ->
            try {
                return SimpleDateFormat(pattern, Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }.parse(rawValue)?.time
            } catch (_: ParseException) {
            }
        }
        return null
    }
}
