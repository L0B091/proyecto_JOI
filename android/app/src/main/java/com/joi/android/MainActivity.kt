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
import com.joi.android.data.SessionStorage
import com.joi.android.data.UserSession
import com.joi.android.databinding.ActivityMainBinding
import com.joi.android.ui.ChatAdapter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionStorage: SessionStorage
    private lateinit var chatAdapter: ChatAdapter
    private val fullConversation = mutableListOf<ChatMessage>()
    private val visibleConversation = mutableListOf<ChatMessage>()
    private var player: ExoPlayer? = null
    private var sessionStartedAt: Long = 0L

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

        setupToolbar()
        setupChat()
        setupBitacora(session)
        setupWidget()
        setupVideo()
        seedConversation()
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
            append("[JOI] AUTO-SYNC ACTIVO\n")
            append("[MEMORIA] APRENDIZAJE ADAPTATIVO HABILITADO\n")
            append("[USUARIO] SESIÓN VINCULADA A ${session.email.uppercase(Locale.getDefault())}\n")
            append("[SISTEMA] CANAL VISUAL Y CHAT DISPONIBLES")
        }

        binding.editProfileButton.setOnClickListener {
            Toast.makeText(this, "EDICIÓN DE PERFIL RESERVADA", Toast.LENGTH_SHORT).show()
        }

        binding.signOutButton.setOnClickListener {
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
        visibleConversation += fullConversation
        renderConversation()
    }

    private fun sendMessage() {
        val content = binding.messageInput.text?.toString()?.trim().orEmpty()
        if (content.isEmpty()) return

        val visibleUserText = content.uppercase(Locale.getDefault())
        val userMessage = ChatMessage(visibleUserText, false)
        val joiReply = ChatMessage(
            "REGISTRO TU MENSAJE EN EL ORQUESTADOR Y ACTUALIZO MI ESTADO DE INTERACCIÓN.",
            true
        )

        fullConversation += userMessage
        fullConversation += joiReply
        visibleConversation += userMessage
        visibleConversation += joiReply
        binding.messageInput.text?.clear()
        binding.avatarStateText.text = "STATE // TALKING"
        renderConversation()
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
        AlertDialog.Builder(this)
            .setTitle("PREMIUM JOI")
            .setMessage("MODO PREMIUM HABILITA M/A, MEMORIA EXTENDIDA, GESTIÓN DE ARCHIVOS Y RESPALDO DE MEMORIA COMPLETA DURANTE 30 DÍAS.")
            .setPositiveButton("ABRIR MERCADO PAGO") { _, _ ->
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(BuildConfig.MERCADO_PAGO_URL)))
            }
            .setNegativeButton("CERRAR", null)
            .show()
    }
}
