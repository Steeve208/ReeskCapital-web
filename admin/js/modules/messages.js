// =====================================================
// MESSAGES MODULE
// Internal communication and messaging system
// =====================================================

export async function render() {
  return `
    <div class="messages-module">
      <div class="messages-layout">
        <!-- Conversations Sidebar -->
        <aside class="conversations-sidebar">
          <div class="conversations-header">
            <h2>Messages</h2>
            <button class="btn-new-conversation" id="newConversationBtn" ${!hasPermission('messages.create') ? 'style="display:none;"' : ''}>
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="conversations-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search conversations..." id="conversationSearch">
          </div>
          <div class="conversations-list" id="conversationsList">
            <!-- Conversations will be loaded here -->
          </div>
        </aside>

        <!-- Chat Area -->
        <main class="chat-area">
          <div class="chat-empty" id="chatEmpty">
            <i class="fas fa-comments"></i>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the sidebar to start messaging</p>
          </div>

          <div class="chat-active" id="chatActive" style="display:none;">
            <!-- Chat Header -->
            <div class="chat-header">
              <div class="chat-header-left">
                <div class="chat-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div class="chat-info">
                  <h3 class="chat-title" id="chatTitle">Conversation</h3>
                  <span class="chat-status" id="chatStatus">Online</span>
                </div>
              </div>
              <div class="chat-header-right">
                <button class="chat-action-btn" title="Video Call">
                  <i class="fas fa-video"></i>
                </button>
                <button class="chat-action-btn" title="Voice Call">
                  <i class="fas fa-phone"></i>
                </button>
                <button class="chat-action-btn" title="More">
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
                <button class="input-action-btn" title="Attach File">
                  <i class="fas fa-paperclip"></i>
                </button>
                <button class="input-action-btn" title="Emoji">
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
  
  // Load conversations
  await loadConversations();
  
  // Setup event listeners
  setupMessagesEvents();
  
  console.log('✅ Messages module initialized');
}

// Load Conversations
async function loadConversations() {
  try {
    // TODO: Load from API
    const conversations = [
      {
        id: 1,
        name: 'Marketing Team',
        type: 'group',
        lastMessage: 'Let\'s schedule a meeting for tomorrow',
        lastMessageTime: '2 hours ago',
        unread: 3,
        avatar: null
      },
      {
        id: 2,
        name: 'John Doe',
        type: 'direct',
        lastMessage: 'The design looks great!',
        lastMessageTime: '5 hours ago',
        unread: 0,
        avatar: null
      },
      {
        id: 3,
        name: 'Design Team',
        type: 'group',
        lastMessage: 'Brand guidelines updated',
        lastMessageTime: '1 day ago',
        unread: 1,
        avatar: null
      }
    ];
    
    renderConversations(conversations);
  } catch (error) {
    console.error('Error loading conversations:', error);
    showToast('Error loading conversations', 'error');
  }
}

// Render Conversations
function renderConversations(conversations) {
  const container = document.getElementById('conversationsList');
  if (!container) return;
  
  container.innerHTML = '';
  
  conversations.forEach(conv => {
    const item = createConversationItem(conv);
    container.appendChild(item);
  });
}

// Create Conversation Item
function createConversationItem(conversation) {
  const item = document.createElement('div');
  item.className = 'conversation-item';
  item.setAttribute('data-conversation-id', conversation.id);
  
  item.innerHTML = `
    <div class="conversation-avatar">
      ${conversation.type === 'group' ? '<i class="fas fa-users"></i>' : '<i class="fas fa-user"></i>'}
    </div>
    <div class="conversation-content">
      <div class="conversation-header">
        <h4 class="conversation-name">${conversation.name}</h4>
        <span class="conversation-time">${conversation.lastMessageTime}</span>
      </div>
      <div class="conversation-footer">
        <p class="conversation-preview">${conversation.lastMessage}</p>
        ${conversation.unread > 0 ? `<span class="conversation-unread">${conversation.unread}</span>` : ''}
      </div>
    </div>
  `;
  
  item.addEventListener('click', () => {
    openConversation(conversation.id);
  });
  
  return item;
}

// Open Conversation
async function openConversation(conversationId) {
  // Update active state
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-conversation-id="${conversationId}"]`)?.classList.add('active');
  
  // Show chat area
  document.getElementById('chatEmpty')?.style.setProperty('display', 'none');
  document.getElementById('chatActive')?.style.setProperty('display', 'flex');
  
  // Load messages
  await loadMessages(conversationId);
}

// Load Messages
async function loadMessages(conversationId) {
  try {
    // TODO: Load from API
    const messages = [
      {
        id: 1,
        sender: 'John Doe',
        senderId: 2,
        content: 'Hey team, let\'s discuss the new campaign',
        timestamp: '2024-03-10T10:30:00',
        isOwn: false
      },
      {
        id: 2,
        sender: 'You',
        senderId: 1,
        content: 'Sounds good! When are you available?',
        timestamp: '2024-03-10T10:32:00',
        isOwn: true
      },
      {
        id: 3,
        sender: 'John Doe',
        senderId: 2,
        content: 'Let\'s schedule a meeting for tomorrow',
        timestamp: '2024-03-10T10:35:00',
        isOwn: false
      }
    ];
    
    renderMessages(messages);
  } catch (error) {
    console.error('Error loading messages:', error);
    showToast('Error loading messages', 'error');
  }
}

// Render Messages
function renderMessages(messages) {
  const container = document.getElementById('messagesList');
  if (!container) return;
  
  container.innerHTML = '';
  
  messages.forEach(message => {
    const messageEl = createMessageElement(message);
    container.appendChild(messageEl);
  });
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// Create Message Element
function createMessageElement(message) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${message.isOwn ? 'message-own' : 'message-other'}`;
  
  messageEl.innerHTML = `
    <div class="message-avatar">
      <i class="fas fa-user"></i>
    </div>
    <div class="message-content">
      ${!message.isOwn ? `<div class="message-sender">${message.sender}</div>` : ''}
      <div class="message-bubble">
        <p>${message.content}</p>
        <span class="message-time">${formatMessageTime(message.timestamp)}</span>
      </div>
    </div>
  `;
  
  return messageEl;
}

// Format Message Time
function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Setup Messages Events
function setupMessagesEvents() {
  // New conversation button
  const newConvBtn = document.getElementById('newConversationBtn');
  if (newConvBtn) {
    newConvBtn.addEventListener('click', () => {
      showNewConversationModal();
    });
  }
  
  // Send message
  const sendBtn = document.getElementById('sendMessageBtn');
  const messageInput = document.getElementById('messageInput');
  
  if (sendBtn && messageInput) {
    sendBtn.addEventListener('click', () => {
      sendMessage();
    });
    
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    });
  }
  
  // Search conversations
  const searchInput = document.getElementById('conversationSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterConversations(e.target.value);
    });
  }
}

// Send Message
function sendMessage() {
  const input = document.getElementById('messageInput');
  if (!input || !input.value.trim()) return;
  
  const content = input.value.trim();
  
  // TODO: Send via API
  console.log('Sending message:', content);
  
  // Add to UI temporarily
  const messagesList = document.getElementById('messagesList');
  if (messagesList) {
    const messageEl = createMessageElement({
      id: Date.now(),
      sender: 'You',
      senderId: AdminState.currentUser?.id,
      content: content,
      timestamp: new Date().toISOString(),
      isOwn: true
    });
    messagesList.appendChild(messageEl);
    messagesList.scrollTop = messagesList.scrollHeight;
  }
  
  input.value = '';
  input.style.height = 'auto';
  
  showToast('Message sent', 'success');
}

// Filter Conversations
function filterConversations(searchTerm) {
  // TODO: Filter conversations
  console.log('Search:', searchTerm);
}

// Show New Conversation Modal
function showNewConversationModal() {
  showToast('New conversation - Coming soon', 'info');
  // TODO: Open modal to start new conversation
}

