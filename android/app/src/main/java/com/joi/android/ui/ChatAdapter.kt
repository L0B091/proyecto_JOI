package com.joi.android.ui

import android.view.Gravity
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.joi.android.R
import com.joi.android.data.ChatMessage
import com.joi.android.databinding.ItemChatMessageBinding

class ChatAdapter : RecyclerView.Adapter<ChatAdapter.ChatViewHolder>() {
    private val items = mutableListOf<ChatMessage>()

    fun submitList(messages: List<ChatMessage>) {
        items.clear()
        items.addAll(messages)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatViewHolder {
        val binding = ItemChatMessageBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ChatViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ChatViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    class ChatViewHolder(
        private val binding: ItemChatMessageBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        fun bind(message: ChatMessage) {
            binding.messageText.text = message.text
            val layoutParams = binding.messageText.layoutParams as FrameLayout.LayoutParams
            if (message.fromJoi) {
                layoutParams.gravity = Gravity.START
                binding.messageText.background = ContextCompat.getDrawable(
                    binding.root.context,
                    R.drawable.bg_message_joi
                )
            } else {
                layoutParams.gravity = Gravity.END
                binding.messageText.background = ContextCompat.getDrawable(
                    binding.root.context,
                    R.drawable.bg_message_user
                )
            }
            binding.messageText.layoutParams = layoutParams
        }
    }
}
