package com.joi.android.data

import android.content.Context
import android.util.Base64
import java.nio.charset.StandardCharsets
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties

data class EncryptedLocalPayload(
    val ivBase64: String,
    val payloadBase64: String
)

class LocalVault(context: Context) {
    private val alias = "${context.packageName}.memory.local"
    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }

    fun encrypt(plainText: String): EncryptedLocalPayload {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateSecretKey())
        val encrypted = cipher.doFinal(plainText.toByteArray(StandardCharsets.UTF_8))
        return EncryptedLocalPayload(
            ivBase64 = Base64.encodeToString(cipher.iv, Base64.NO_WRAP),
            payloadBase64 = Base64.encodeToString(encrypted, Base64.NO_WRAP)
        )
    }

    fun decrypt(ivBase64: String, payloadBase64: String): String? {
        return runCatching {
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(
                Cipher.DECRYPT_MODE,
                getOrCreateSecretKey(),
                GCMParameterSpec(128, Base64.decode(ivBase64, Base64.NO_WRAP))
            )
            val plainBytes = cipher.doFinal(Base64.decode(payloadBase64, Base64.NO_WRAP))
            String(plainBytes, StandardCharsets.UTF_8)
        }.getOrNull()
    }

    private fun getOrCreateSecretKey(): SecretKey {
        (keyStore.getKey(alias, null) as? SecretKey)?.let { return it }
        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        val spec = KeyGenParameterSpec.Builder(
            alias,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .build()
        keyGenerator.init(spec)
        return keyGenerator.generateKey()
    }

    companion object {
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
    }
}
