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
            Toast.makeText(this, "Pantalla del chat limpiada.", Toast.LENGTH_SHORT).show()
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
        binding.userNameText.text = "userName : ${session.displayName}"
        binding.userIdText.text = "Id : ${session.id}"
        binding.linkText.text = "Enlace psicológico: ${sessionStorage.linkPercentage(session)}%"
        val planLabel = if (session.isPremium) "premium" else "free"
        binding.statusText.text = "Estado: estable ($planLabel)"
        binding.legendText.text = "Free: conversación, APIs, memoria básica, personalidad y visual.\nPremium: M/A, proyectos, memoria extendida, archivos, fiscal y respaldo de memoria en la nube."

        binding.editProfileButton.setOnClickListener {
            Toast.makeText(this, "La edición de foto queda preparada para una siguiente iteración.", Toast.LENGTH_SHORT).show()
        }

        binding.signOutButton.setOnClickListener {
            val options = GoogleSignInOptions.Builder(
                GoogleSignInOptions.DEFAULT_SIGN_IN
            ).requestEmail().build()
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
        updateWidgetScene(
            AvatarWidgetScene(
                title = "Clip lectura",
                subtitle = "Ventana al mundo del avatar",
                temperature = "21°C"
            )
        )

        binding.chipLectura.setOnClickListener {
            updateWidgetScene(AvatarWidgetScene("Clip lectura", "Calma y foco", "21°C"))
        }
        binding.chipMusica.setOnClickListener {
            updateWidgetScene(AvatarWidgetScene("Clip música", "Escucha activa", "23°C"))
        }
        binding.chipAtenta.setOnClickListener {
            updateWidgetScene(AvatarWidgetScene("Clip atento", "Presencia y observación", "20°C"))
        }
    }

    private fun updateWidgetScene(scene: AvatarWidgetScene) {
        val clock = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        binding.widgetSceneText.text = scene.title
        binding.widgetFooterText.text = "$clock · ${scene.temperature}"
    }

    private fun setupVideo() {
        player = ExoPlayer.Builder(this).build().also { exoPlayer ->
            binding.playerView.player = exoPlayer
            val mediaItem = MediaItem.fromUri(
                Uri.parse("android.resource://$packageName/${R.raw.joi_texting}")
            )
            exoPlayer.setMediaItem(mediaItem)
            exoPlayer.repeatMode = ExoPlayer.REPEAT_MODE_ALL
            exoPlayer.volume = 0f
            exoPlayer.prepare()
            exoPlayer.playWhenReady = true
        }
    }

    private fun seedConversation() {
        if (fullConversation.isNotEmpty()) return
        fullConversation += ChatMessage("Sincronización completa. Estoy lista para acompañarte.", true)
        fullConversation += ChatMessage("Aprendo de tus interacciones y me ajusto automáticamente.", true)
        visibleConversation += fullConversation
        renderConversation()
    }

    private fun sendMessage() {
        val content = binding.messageInput.text?.toString()?.trim().orEmpty()
        if (content.isEmpty()) return

        val userMessage = ChatMessage(content, false)
        val joiReply = ChatMessage(
            "Lo registro en mi contexto y ajusto el vínculo con vos de forma automática.",
            true
        )

        fullConversation += userMessage
        fullConversation += joiReply
        visibleConversation += userMessage
        visibleConversation += joiReply
        binding.messageInput.text?.clear()
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
            .setTitle("Premium JOI")
            .setMessage(
                "Cuando quieras usar M/A, JOI explica el plan premium y habilita el cobro por Mercado Pago. El acceso premium dura 30 días y no se renueva automáticamente."
            )
            .setPositiveButton("Abrir Mercado Pago") { _, _ ->
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(BuildConfig.MERCADO_PAGO_URL)))
            }
            .setNegativeButton("Cerrar", null)
            .show()
    }
}
