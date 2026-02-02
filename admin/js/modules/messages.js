// =====================================================
// MESSAGES MODULE
// Internal communication and messaging system (Supabase + Realtime)
// =====================================================
import {
  loadChannels,
  createChannel,
  loadMessages,
  sendMessage as sendChatMessage,
  subscribeToChannel
} from './chat-store.js';

const ChatState = {
  channels: [],
  activeChannelId: null,
  unsubscribe: null,
  searchTerm: ''
};

export async function render() {
  return `
    <div class="messages-module">
      <div class="messages-layout">
        <!-- Conversations Sidebar -->
        <aside class="conversations-sidebar">
          <div class="conversations-header">
            <h2>Team Chat</h2>
            <button class="btn-new-conversation" id="newConversationBtn" ${!hasPermission('messages.create') ? 'style="display:none;"' : ''}>
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="conversations-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search channels..." id="conversationSearch">
          </div>
          <div class="conversations-list" id="conversationsList">
            <!-- Channels will be loaded here -->
          </div>
        </aside>

        <!-- Chat Area -->
        <main class="chat-area">
          <div class="chat-empty" id="chatEmpty">
            <i class="fas fa-comments"></i>
            <h3>Select a channel</h3>
            <p>Choose a channel from the sidebar to start chatting</p>
          </div>

          <div class="chat-active" id="chatActive" style="display:none;">
            <!-- Chat Header -->
            <div class="chat-header">
              <div class="chat-header-left">
                <div class="chat-avatar">
                  <i class="fas fa-hashtag"></i>
                </div>
                <div class="chat-info">
                  <h3 class="chat-title" id="chatTitle">Channel</h3>
                  <span class="chat-status" id="chatStatus">Active</span>
                </div>
              </div>
              <div class="chat-header-right">
                <button class="chat-action-btn" id="startVideoCallBtn" title="Video Call">
                  <i class="fas fa-video"></i>
                </button>
                <button class="chat-action-btn" id="startVoiceCallBtn" title="Voice Call (coming soon)">
                  <i class="fas fa-phone"></i>
                </button>
                <button class="chat-action-btn" id="moreChatActionsBtn" title="More">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
              </div>
            </div>

            <!-- Messages -->
            <div class="messages-container" id="messagesContainer">
              <div class="messages-list" id="messagesList">
                <!-- Messages will be loaded here -->
              </div>
            </div>

            <!-- Message Input -->
            <div class="message-input-area">
              <div class="input-actions">
                <button class="input-action-btn" title="Attach File (coming soon)">
                  <i class="fas fa-paperclip"></i>
                </button>
                <button class="input-action-btn" title="Emoji (coming soon)">
                  <i class="fas fa-smile"></i>
                </button>
              </div>
              <textarea 
                class="message-input" 
                id="messageInput" 
                placeholder="Type a message..."
                rows="1"
              ></textarea>
              <button class="btn-send-message" id="sendMessageBtn" ${!hasPermission('messages.create') ? 'style="display:none;"' : ''}>
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  `;
}

export async function init() {
  console.log('💬 Initializing Messages module...');
  await refreshChannels();
  setupMessagesEvents();
  console.log('✅ Messages module initialized');
}

async function refreshChannels() {
  try {
    ChatState.channels = await loadChannels();
    renderConversations(ChatState.channels);

    const savedChannel = localStorage.getItem('adminActiveChannel');
    const channelToOpen = savedChannel || (ChatState.channels[0] && ChatState.channels[0].id);
    if (channelToOpen) {
      await openConversation(channelToOpen);
    }
  } catch (error) {
    console.error('Error loading channels:', error);
    showToast('Error loading chat channels', 'error');
  }
}

function renderConversations(channels) {
  const container = document.getElementById('conversationsList');
  if (!container) return;

  container.innerHTML = '';

  if (!channels.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comments"></i>
        <h3>No channels yet</h3>
        <p>Create the first channel to start chatting.</p>
      </div>
    `;
    return;
  }

  channels
    .filter((channel) => channel.name.toLowerCase().includes(ChatState.searchTerm.toLowerCase()))
    .forEach((channel) => {
      const item = createConversationItem(channel);
      container.appendChild(item);
    });
}

function createConversationItem(channel) {
  const item = document.createElement('div');
  item.className = 'conversation-item';
  item.setAttribute('data-conversation-id', channel.id);
  item.innerHTML = `
    <div class="conversation-avatar">
      <i class="fas fa-hashtag"></i>
    </div>
    <div class="conversation-content">
      <div class="conversation-header">
        <h4 class="conversation-name">${channel.name}</h4>
        <span class="conversation-time"></span>
      </div>
      <div class="conversation-footer">
        <p class="conversation-preview">${channel.description || 'Sin descripción'}</p>
      </div>
    </div>
  `;

  item.addEventListener('click', () => {
    openConversation(channel.id);
  });

  return item;
}

async function openConversation(channelId) {
  ChatState.activeChannelId = channelId;
  localStorage.setItem('adminActiveChannel', channelId);

  document.querySelectorAll('.conversation-item').forEach((item) => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-conversation-id="${channelId}"]`)?.classList.add('active');

  document.getElementById('chatEmpty')?.style.setProperty('display', 'none');
  document.getElementById('chatActive')?.style.setProperty('display', 'flex');

  const channel = ChatState.channels.find((ch) => ch.id === channelId);
  if (channel) {
    document.getElementById('chatTitle').textContent = `# ${channel.name}`;
  }

  await loadMessagesForChannel(channelId);

  if (ChatState.unsubscribe) {
    ChatState.unsubscribe();
  }
  ChatState.unsubscribe = subscribeToChannel(channelId, (message) => {
    appendMessage(message);
  });
}

async function loadMessagesForChannel(channelId) {
  try {
    const messages = await loadMessages(channelId);
    renderMessages(messages);
  } catch (error) {
    console.error('Error loading messages:', error);
    showToast('Error loading messages', 'error');
  }
}

function renderMessages(messages) {
  const container = document.getElementById('messagesList');
  if (!container) return;
  container.innerHTML = '';
  messages.forEach((message) => {
    const messageEl = createMessageElement(message);
    container.appendChild(messageEl);
  });
  container.scrollTop = container.scrollHeight;
}

function appendMessage(message) {
  const container = document.getElementById('messagesList');
  if (!container) return;

  if (message.id && container.querySelector(`[data-message-id="${message.id}"]`)) {
    return;
  }

  const messageEl = createMessageElement(message);
  container.appendChild(messageEl);
  container.scrollTop = container.scrollHeight;
}

function createMessageElement(message) {
  const isOwn = String(message.sender_id) === String(AdminState.currentUser?.id) ||
    message.sender_name === AdminState.currentUser?.name;
  const messageEl = document.createElement('div');
  messageEl.className = `message ${isOwn ? 'message-own' : 'message-other'}`;
  if (message.id) messageEl.dataset.messageId = message.id;

  messageEl.innerHTML = `
    <div class="message-avatar">
      <i class="fas fa-user"></i>
    </div>
    <div class="message-content">
      ${!isOwn ? `<div class="message-sender">${message.sender_name || 'Admin'}</div>` : ''}
      <div class="message-bubble">
        <p>${escapeHtml(message.content)}</p>
        <span class="message-time">${formatMessageTime(message.created_at)}</span>
      </div>
    </div>
  `;

  return messageEl;
}

function setupMessagesEvents() {
  const newConvBtn = document.getElementById('newConversationBtn');
  if (newConvBtn) {
    newConvBtn.addEventListener('click', () => {
      showNewConversationModal();
    });
  }

  const sendBtn = document.getElementById('sendMessageBtn');
  const messageInput = document.getElementById('messageInput');
  if (sendBtn && messageInput) {
    sendBtn.addEventListener('click', () => {
      handleSendMessage();
    });
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    });
  }

  const searchInput = document.getElementById('conversationSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      ChatState.searchTerm = e.target.value || '';
      renderConversations(ChatState.channels);
    });
  }

  const videoBtn = document.getElementById('startVideoCallBtn');
  if (videoBtn) {
    videoBtn.addEventListener('click', () => {
      startVideoCall();
    });
  }
  const voiceBtn = document.getElementById('startVoiceCallBtn');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      showToast('Voice calls coming soon', 'info');
    });
  }
}

async function handleSendMessage() {
  const input = document.getElementById('messageInput');
  if (!input || !input.value.trim()) return;
  if (!ChatState.activeChannelId) {
    showToast('Select a channel first', 'warning');
    return;
  }

  const content = input.value.trim();
  input.value = '';
  input.style.height = 'auto';

  try {
    const message = await sendChatMessage({
      channelId: ChatState.activeChannelId,
      content,
      sender: AdminState.currentUser
    });
    appendMessage(message);
  } catch (error) {
    console.error('Error sending message:', error);
    showToast('Error sending message', 'error');
  }
}

async function showNewConversationModal() {
  const name = window.prompt('Nombre del nuevo canal');
  if (!name || !name.trim()) return;
  const description = window.prompt('Descripción (opcional)') || '';

  try {
    const channel = await createChannel({
      name: name.trim(),
      description: description.trim(),
      created_by: AdminState.currentUser?.id || null
    });
    ChatState.channels.push(channel);
    renderConversations(ChatState.channels);
    await openConversation(channel.id);
    showToast('Canal creado', 'success');
  } catch (error) {
    console.error('Error creating channel:', error);
    showToast('Error creating channel', 'error');
  }
}

function startVideoCall() {
  if (!ChatState.activeChannelId) {
    showToast('Select a channel first', 'warning');
    return;
  }
  const roomName = `rsc-${ChatState.activeChannelId}`;
  const url = `https://meet.jit.si/${encodeURIComponent(roomName)}`;
  window.open(url, '_blank', 'noopener');
}

function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}
