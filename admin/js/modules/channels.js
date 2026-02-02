// =====================================================
// CHANNELS MODULE
// Manage chat channels
// =====================================================
import { loadChannels, createChannel } from './chat-store.js';

const ChannelState = {
  channels: [],
  activeId: null,
  searchTerm: ''
};

export async function render() {
  return `
    <div class="channels-module">
      <div class="module-header">
        <div class="header-left">
          <h1 class="module-title">Channels</h1>
          <p class="module-subtitle">Create and manage team chat channels</p>
        </div>
        <div class="header-right">
          <button class="btn-primary" id="newChannelBtn" ${!hasPermission('channels.create') ? 'style="display:none;"' : ''}>
            <i class="fas fa-plus"></i>
            New Channel
          </button>
        </div>
      </div>

      <div class="channels-layout">
        <div class="channels-list-panel">
          <div class="channels-search">
            <i class="fas fa-search"></i>
            <input type="text" id="channelSearchInput" placeholder="Search channels...">
          </div>
          <div class="channels-list" id="channelsList">
            <!-- Channels list -->
          </div>
        </div>

        <div class="channels-detail-panel" id="channelDetailPanel">
          <div class="empty-state">
            <i class="fas fa-hashtag"></i>
            <h3>Select a channel</h3>
            <p>Pick a channel to see details or open it in chat.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function init() {
  console.log('🔎 Initializing Channels module...');
  await refreshChannels();
  setupEvents();
  console.log('✅ Channels module initialized');
}

async function refreshChannels() {
  try {
    ChannelState.channels = await loadChannels();
    renderChannels(ChannelState.channels);
  } catch (error) {
    console.error('Error loading channels:', error);
    showToast('Error loading channels', 'error');
  }
}

function renderChannels(channels) {
  const container = document.getElementById('channelsList');
  if (!container) return;
  container.innerHTML = '';

  const filtered = channels.filter((channel) =>
    channel.name.toLowerCase().includes(ChannelState.searchTerm.toLowerCase())
  );

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state small">
        <i class="fas fa-comments"></i>
        <h3>No channels found</h3>
        <p>Create a new channel to start.</p>
      </div>
    `;
    return;
  }

  filtered.forEach((channel) => {
    const item = document.createElement('div');
    item.className = 'channel-item';
    item.dataset.channelId = channel.id;
    item.innerHTML = `
      <div class="channel-icon">
        <i class="fas fa-hashtag"></i>
      </div>
      <div class="channel-info">
        <div class="channel-name"># ${escapeHtml(channel.name)}</div>
        <div class="channel-desc">${escapeHtml(channel.description || 'Sin descripción')}</div>
      </div>
      <button class="channel-open-btn" title="Open in chat">
        <i class="fas fa-arrow-right"></i>
      </button>
    `;

    item.addEventListener('click', (event) => {
      if (event.target.closest('.channel-open-btn')) {
        openInChat(channel.id);
        return;
      }
      selectChannel(channel.id);
    });

    container.appendChild(item);
  });
}

function selectChannel(channelId) {
  ChannelState.activeId = channelId;
  document.querySelectorAll('.channel-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.channelId === channelId);
  });

  const channel = ChannelState.channels.find((ch) => ch.id === channelId);
  if (!channel) return;

  const detailPanel = document.getElementById('channelDetailPanel');
  if (!detailPanel) return;

  detailPanel.innerHTML = `
    <div class="channel-detail">
      <div class="channel-detail-header">
        <div>
          <h2># ${escapeHtml(channel.name)}</h2>
          <p>${escapeHtml(channel.description || 'Sin descripción')}</p>
        </div>
        <button class="btn-secondary" id="openChannelInChatBtn">
          <i class="fas fa-comments"></i>
          Open in Chat
        </button>
      </div>
      <div class="channel-detail-meta">
        <div class="meta-item"><span>Created</span><strong>${formatDate(channel.created_at)}</strong></div>
        <div class="meta-item"><span>Visibility</span><strong>${channel.is_private ? 'Private' : 'Public'}</strong></div>
      </div>
    </div>
  `;

  document.getElementById('openChannelInChatBtn')?.addEventListener('click', () => {
    openInChat(channel.id);
  });
}

function setupEvents() {
  const newChannelBtn = document.getElementById('newChannelBtn');
  if (newChannelBtn) {
    newChannelBtn.addEventListener('click', async () => {
      const name = window.prompt('Nombre del canal');
      if (!name || !name.trim()) return;
      const description = window.prompt('Descripción (opcional)') || '';

      try {
        const channel = await createChannel({
          name: name.trim(),
          description: description.trim(),
          created_by: AdminState.currentUser?.id || null
        });
        ChannelState.channels.push(channel);
        renderChannels(ChannelState.channels);
        selectChannel(channel.id);
        showToast('Canal creado', 'success');
      } catch (error) {
        console.error('Error creating channel:', error);
        showToast('Error creating channel', 'error');
      }
    });
  }

  const searchInput = document.getElementById('channelSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      ChannelState.searchTerm = e.target.value || '';
      renderChannels(ChannelState.channels);
    });
  }
}

function openInChat(channelId) {
  localStorage.setItem('adminActiveChannel', channelId);
  if (typeof window.loadModule === 'function') {
    window.loadModule('messages');
  }
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('en-US');
  } catch (error) {
    return '-';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}
