package com.joi.android

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.SystemClock
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.joi.android.data.AvatarWidgetScene
import com.joi.android.data.ChatMessage
import com.joi.android.data.LocalMemoryStore
import com.joi.android.data.PremiumBackupCrypto
import com.joi.android.data.SessionStorage
import com.joi.android.data.UserSession
import com.joi.android.databinding.ActivityMainBinding
import com.joi.android.net.JoiBackendClient
import com.joi.android.ui.ChatAdapter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionStorage: SessionStorage
    private lateinit var localMemoryStore: LocalMemoryStore
    private lateinit var chatAdapter: ChatAdapter
    private val fullConversation = mutableListOf<ChatMessage>()
    private val visibleConversation = mutableListOf<ChatMessage>()
    private val backendClient = JoiBackendClient()
    private val premiumBackupCrypto = PremiumBackupCrypto()
    private var player: ExoPlayer? = null
    private var sessionStartedAt: Long = 0L
    private lateinit var currentSession: UserSession
    private var startedFromEmptyLocalMemory: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionStorage = SessionStorage(this)
        val session = sessionStorage.loadUser()
        if (session == null) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }
        currentSession = session

        setupToolbar()
        setupChat()
        localMemoryStore = LocalMemoryStore(this)
        startedFromEmptyLocalMemory = localMemoryStore.isEffectivelyEmpty(currentSession.id)
        setupBitacora(currentSession)
        setupWidget()
        setupVideo()
        hydrateConversation()
        syncPremiumState()
    }

    override fun onResume() {
        super.onResume()
        sessionStartedAt = SystemClock.elapsedRealtime()
        player?.playWhenReady = true
    }

    override fun onPause() {
        super.onPause()
        if (sessionStartedAt > 0L) {
            val elapsedMinutes = ((SystemClock.elapsedRealtime() - sessionStartedAt) / 60000L).coerceAtLeast(0L)
            if (elapsedMinutes > 0L) {
                sessionStorage.addUsageMinutes(elapsedMinutes)
            }
        }
        player?.playWhenReady = false
    }

    override fun onDestroy() {
        player?.release()
        player = null
        super.onDestroy()
    }

    private fun setupToolbar() {
        binding.bitacoraButton.setOnClickListener {
            binding.drawerLayout.openDrawer(GravityCompat.START)
        }
        binding.clearChatButton.setOnClickListener {
            visibleConversation.clear()
            fullConversation.clear()
            chatAdapter.submitList(visibleConversation.toList())
            binding.avatarStateText.text = "STATE // STANDBY"
            Toast.makeText(this, "PANTALLA LIMPIA", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupChat() {
        chatAdapter = ChatAdapter()
        binding.chatRecyclerView.layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = true
        }
        binding.chatRecyclerView.adapter = chatAdapter
        binding.sendButton.setOnClickListener { sendMessage() }
    }

    private fun setupBitacora(session: UserSession) {
        binding.userNameText.text = "USERNAME // ${session.displayName.uppercase(Locale.getDefault())}"
        binding.userIdText.text = "ID // ${session.id.uppercase(Locale.getDefault())}"
        binding.linkText.text = "ENLACE PSICOLÓGICO // ${sessionStorage.linkPercentage(session)}%"
        val planLabel = if (session.isPremium) "ESTABLE (PREMIUM)" else "ESTABLE (FREE)"
        binding.statusText.text = "ESTADO // $planLabel"
        binding.legendText.text = buildString {
            append(if (backendClient.isConfigured()) "[JOI] ${getString(R.string.bitacora_sync_wait)}\n" else "[JOI] MODO LOCAL PRIMARIO\n")
            append("[MEMORIA] MEMORIA LOCAL MULTICAPA ACTIVA\n")
            append("[USUARIO] SESIÓN VINCULADA A ${session.email.uppercase(Locale.getDefault())}\n")
            append("[SISTEMA] VIDEO LOCAL, CHAT Y BITÁCORA DISPONIBLES")
        }

        binding.editProfileButton.setOnClickListener {
            Toast.makeText(this, "EDICIÓN DE PERFIL RESERVADA", Toast.LENGTH_SHORT).show()
        }

        binding.signOutButton.setOnClickListener {
            val shouldBackup =
                currentSession.isPremium &&
                    !currentSession.authToken.isNullOrBlank() &&
                    backendClient.isConfigured() &&
                    backendClient.isOnline(this)

            if (shouldBackup) {
                performPremiumBackup { completeSignOut() }
            } else {
                completeSignOut()
            }
        }

        binding.premiumButton.setOnClickListener {
            showPremiumDialog()
        }
    }

    private fun setupWidget() {
        updateWidgetScene(AvatarWidgetScene("CLIP LECTURA", "VENTANA AL MUNDO DEL AVATAR", "21°C"))

        binding.chipLectura.setOnClickListener {
            updateWidgetScene(AvatarWidgetScene("CLIP LECTURA", "CALMA Y FOCO", "21°C"))
            binding.avatarStateText.text = "STATE // THINKING"
        }
        binding.chipMusica.setOnClickListener {
            updateWidgetScene(AvatarWidgetScene("CLIP MÚSICA", "AUDIO Y PRESENCIA", "23°C"))
            binding.avatarStateText.text = "STATE // HAPPY"
        }
        binding.chipAtenta.setOnClickListener {
            updateWidgetScene(AvatarWidgetScene("CLIP ATENCIÓN", "ESCUCHA ACTIVA", "20°C"))
            binding.avatarStateText.text = "STATE // LISTENING"
        }
        binding.audioPrimaryButton.setOnClickListener {
            Toast.makeText(this, "AUDIO // ACTIVE", Toast.LENGTH_SHORT).show()
        }
        binding.audioMoreButton.setOnClickListener {
            binding.drawerLayout.openDrawer(GravityCompat.START)
        }
        binding.audioMuteButton.setOnClickListener {
            Toast.makeText(this, "AUDIO // MUTE", Toast.LENGTH_SHORT).show()
        }
    }

    private fun updateWidgetScene(scene: AvatarWidgetScene) {
        val clock = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        binding.widgetSceneText.text = scene.title
        binding.widgetFooterText.text = "$clock // ${scene.temperature}"
    }

    private fun setupVideo() {
        player = ExoPlayer.Builder(this).build().also { exoPlayer ->
            binding.playerView.player = exoPlayer
            val mediaItem = MediaItem.fromUri(Uri.parse("android.resource://$packageName/${R.raw.joi_texting}"))
            exoPlayer.setMediaItem(mediaItem)
            exoPlayer.repeatMode = ExoPlayer.REPEAT_MODE_ALL
            exoPlayer.volume = 0f
            exoPlayer.prepare()
            exoPlayer.playWhenReady = true
        }
    }

    private fun seedConversation() {
        if (fullConversation.isNotEmpty()) return
        fullConversation += ChatMessage("SINCRONIZACIÓN COMPLETA. ESTOY LISTA PARA CUSTODIAR TU JORNADA.", true)
        fullConversation += ChatMessage("APRENDO DE TUS INTERACCIONES Y AJUSTO MI CONTEXTO AUTOMÁTICAMENTE.", true)
        localMemoryStore.appendAssistantMessage(currentSession.id, "Sincronización completa. Estoy lista para custodiar tu jornada.")
        localMemoryStore.appendAssistantMessage(currentSession.id, "Aprendo de tus interacciones y ajusto mi contexto automáticamente.")
        visibleConversation += fullConversation
        renderConversation()
    }

    private fun hydrateConversation() {
        val memory = localMemoryStore.load(currentSession.id)
        if (memory.conversation.isEmpty()) {
            seedConversation()
            return
        }

        fullConversation.clear()
        visibleConversation.clear()
        memory.conversation.forEach { entry ->
            val text = if (entry.role == "user") {
                entry.text.uppercase(Locale.getDefault())
            } else {
                entry.text
            }
            val isJoi = entry.role != "user"
            val message = ChatMessage(text, isJoi)
            fullConversation += message
            visibleConversation += message
        }
        binding.avatarStateText.text = "STATE // ${memory.shortTermFocus.uppercase(Locale.getDefault())}"
        renderConversation()
    }

    private fun sendMessage() {
        val content = binding.messageInput.text?.toString()?.trim().orEmpty()
        if (content.isEmpty()) return

        val visibleUserText = content.uppercase(Locale.getDefault())
        val userMessage = ChatMessage(visibleUserText, false)
        fullConversation += userMessage
        visibleConversation += userMessage
        localMemoryStore.appendUserMessage(currentSession.id, content)
        binding.messageInput.text?.clear()
        binding.avatarStateText.text = "STATE // SYNCING"
        renderConversation()
        dispatchChat(content)
    }

    private fun renderConversation() {
        chatAdapter.submitList(visibleConversation.toList())
        binding.chatRecyclerView.post {
            if (chatAdapter.itemCount > 0) {
                binding.chatRecyclerView.scrollToPosition(chatAdapter.itemCount - 1)
            }
        }
    }

    private fun showPremiumDialog() {
        val builder = AlertDialog.Builder(this)
            .setTitle("PREMIUM JOI")
            .setMessage("MODO PREMIUM HABILITA M/A, MEMORIA EXTENDIDA, GESTIÓN DE ARCHIVOS Y RESPALDO DE MEMORIA COMPLETA DURANTE 30 DÍAS.")

        if (currentSession.isPremium && !currentSession.authToken.isNullOrBlank()) {
            builder
                .setPositiveButton(getString(R.string.premium_backup)) { _, _ ->
                    performPremiumBackup()
                }
                .setNeutralButton(getString(R.string.premium_restore)) { _, _ ->
                    restorePremiumBackup()
                }
                .setNegativeButton("CERRAR", null)
        } else {
            builder
                .setPositiveButton("ABRIR MERCADO PAGO") { _, _ ->
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(BuildConfig.MERCADO_PAGO_URL)))
                }
                .setNegativeButton("CERRAR", null)
        }

        builder.show()
    }

    private fun dispatchChat(content: String) {
        if (!backendClient.isConfigured() || !backendClient.isOnline(this)) {
            appendAssistantReply(getString(R.string.offline_memory_notice), "OFFLINE", "LOCAL")
            return
        }

        val memorySnapshot = localMemoryStore.load(currentSession.id)
        binding.sendButton.isEnabled = false
        thread {
            runCatching {
                backendClient.sendChat(currentSession, memorySnapshot, content)
            }.onSuccess { result ->
                runOnUiThread {
                    binding.sendButton.isEnabled = true
                    val state = result.tone?.uppercase(Locale.getDefault()) ?: "ONLINE"
                    val detail = result.microExpression?.uppercase(Locale.getDefault()) ?: "SYNC"
                    appendAssistantReply(result.reply, state, detail)
                    startedFromEmptyLocalMemory = false
                    result.premiumUntilMillis?.let { premiumUntil ->
                        updateCurrentSession(currentSession.copy(premiumUntilMillis = premiumUntil))
                    }
                }
            }.onFailure {
                runOnUiThread {
                    binding.sendButton.isEnabled = true
                    appendAssistantReply(getString(R.string.offline_memory_notice), "OFFLINE", "LOCAL")
                }
            }
        }
    }

    private fun appendAssistantReply(reply: String, state: String, detail: String) {
        val joiReply = ChatMessage(reply, true)
        fullConversation += joiReply
        visibleConversation += joiReply
        localMemoryStore.appendAssistantMessage(currentSession.id, reply)
        binding.avatarStateText.text = "STATE // $state"
        binding.videoCaption.text = "AVATAR // LOCAL CLIP // $detail"
        renderConversation()
    }

    private fun syncPremiumState() {
        if (currentSession.authToken.isNullOrBlank() || !backendClient.isConfigured() || !backendClient.isOnline(this)) {
            return
        }

        thread {
            runCatching {
                backendClient.fetchPremiumStatus(currentSession)
            }.onSuccess { premium ->
                val updatedSession = currentSession.copy(
                    premiumUntilMillis = if (premium.active) premium.premiumUntilMillis else 0L
                )
                runOnUiThread {
                    updateCurrentSession(updatedSession)
                    if (updatedSession.isPremium && startedFromEmptyLocalMemory) {
                        restorePremiumBackup(silent = true)
                    }
                }
            }
        }
    }

    private fun updateCurrentSession(session: UserSession) {
        currentSession = session
        sessionStorage.saveUser(session)
        setupBitacora(session)
    }

    private fun completeSignOut() {
        val options = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .build()
        GoogleSignIn.getClient(this, options)
            .signOut()
            .addOnCompleteListener {
                sessionStorage.clear()
                startActivity(Intent(this, LoginActivity::class.java))
                finish()
            }
    }

    private fun performPremiumBackup(onComplete: (() -> Unit)? = null) {
        if (currentSession.authToken.isNullOrBlank() || !backendClient.isConfigured() || !backendClient.isOnline(this)) {
            Toast.makeText(this, getString(R.string.premium_backup_failed), Toast.LENGTH_SHORT).show()
            onComplete?.invoke()
            return
        }

        thread {
            runCatching {
                val memory = localMemoryStore.load(currentSession.id)
                val encrypted = premiumBackupCrypto.encrypt(currentSession, memory)
                backendClient.uploadEncryptedBackup(currentSession, encrypted)
            }.onSuccess {
                runOnUiThread {
                    Toast.makeText(this, getString(R.string.premium_backup_done), Toast.LENGTH_SHORT).show()
                    onComplete?.invoke()
                }
            }.onFailure {
                runOnUiThread {
                    Toast.makeText(this, getString(R.string.premium_backup_failed), Toast.LENGTH_SHORT).show()
                    onComplete?.invoke()
                }
            }
        }
    }

    private fun restorePremiumBackup(silent: Boolean = false) {
        if (currentSession.authToken.isNullOrBlank() || !backendClient.isConfigured() || !backendClient.isOnline(this)) {
            if (!silent) {
                Toast.makeText(this, getString(R.string.premium_restore_failed), Toast.LENGTH_SHORT).show()
            }
            return
        }

        thread {
            runCatching {
                val payload = backendClient.downloadEncryptedBackup(currentSession)
                payload?.let { premiumBackupCrypto.decrypt(currentSession, it) }
            }.onSuccess { memory ->
                runOnUiThread {
                    when {
                        memory == null && !silent -> {
                            Toast.makeText(this, getString(R.string.premium_restore_empty), Toast.LENGTH_SHORT).show()
                        }
                        memory != null -> {
                            localMemoryStore.replace(memory.copy(userId = currentSession.id))
                            startedFromEmptyLocalMemory = false
                            hydrateConversation()
                            if (!silent) {
                                Toast.makeText(this, getString(R.string.premium_restore_done), Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                }
            }.onFailure {
                if (!silent) {
                    runOnUiThread {
                        Toast.makeText(this, getString(R.string.premium_restore_failed), Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }
}
