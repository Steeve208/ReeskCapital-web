// =====================================================
// CHAT STORE (Supabase + Local fallback)
// =====================================================
const CHAT_STORAGE_KEY = 'admin_chat_store_v1';
const CHAT_TABLES = {
  channels: 'admin_chat_channels',
  messages: 'admin_chat_messages'
};

let forceLocal = false;

function getAdminChatClient() {
  if (forceLocal) return null;
  if (window.AdminAPI && typeof window.AdminAPI.getAdminClient === 'function') {
    return window.AdminAPI.getAdminClient();
  }
  return null;
}

function getLocalStore() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        channels: Array.isArray(parsed.channels) ? parsed.channels : [],
        messages: Array.isArray(parsed.messages) ? parsed.messages : []
      };
    }
  } catch (error) {
    console.warn('⚠️ Error leyendo chat store local:', error);
  }
  return { channels: [], messages: [] };
}

function saveLocalStore(store) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.warn('⚠️ Error guardando chat store local:', error);
  }
}

function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeChannel(channel) {
  return {
    id: channel.id,
    name: channel.name || 'General',
    description: channel.description || '',
    created_at: channel.created_at || new Date().toISOString(),
    created_by: channel.created_by || null,
    is_private: !!channel.is_private
  };
}

function normalizeMessage(message) {
  return {
    id: message.id,
    channel_id: message.channel_id,
    sender_id: message.sender_id,
    sender_name: message.sender_name || 'Admin',
    content: message.content || '',
    created_at: message.created_at || new Date().toISOString()
  };
}

function shouldFallback(error) {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  if (msg.includes('does not exist') || msg.includes('relation') || msg.includes('permission') || msg.includes('schema')) {
    return true;
  }
  return false;
}

async function ensureDefaultChannel(store) {
  if (store.channels.length === 0) {
    const channel = normalizeChannel({
      id: generateId('channel'),
      name: 'General',
      description: 'Canal general del equipo'
    });
    store.channels.push(channel);
    saveLocalStore(store);
  }
}

export async function loadChannels() {
  const client = getAdminChatClient();
  if (client) {
    const { data, error } = await client
      .from(CHAT_TABLES.channels)
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && Array.isArray(data)) {
      return data.map(normalizeChannel);
    }
    if (shouldFallback(error)) {
      forceLocal = true;
    }
  }
  const store = getLocalStore();
  await ensureDefaultChannel(store);
  return store.channels.map(normalizeChannel);
}

export async function createChannel({ name, description = '', is_private = false, created_by = null }) {
  const client = getAdminChatClient();
  if (client) {
    const { data, error } = await client
      .from(CHAT_TABLES.channels)
      .insert({
        name,
        description,
        is_private,
        created_by
      })
      .select('*')
      .single();
    if (!error && data) {
      return normalizeChannel(data);
    }
    if (shouldFallback(error)) {
      forceLocal = true;
    }
  }

  const store = getLocalStore();
  const channel = normalizeChannel({
    id: generateId('channel'),
    name,
    description,
    is_private,
    created_by
  });
  store.channels.push(channel);
  saveLocalStore(store);
  return channel;
}

export async function loadMessages(channelId, limit = 200) {
  const client = getAdminChatClient();
  if (client) {
    const { data, error } = await client
      .from(CHAT_TABLES.messages)
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (!error && Array.isArray(data)) {
      return data.map(normalizeMessage);
    }
    if (shouldFallback(error)) {
      forceLocal = true;
    }
  }
  const store = getLocalStore();
  return store.messages
    .filter((msg) => msg.channel_id === channelId)
    .map(normalizeMessage);
}

export async function sendMessage({ channelId, content, sender }) {
  const payload = {
    channel_id: channelId,
    sender_id: sender?.id || null,
    sender_name: sender?.name || sender?.email || 'Admin',
    content
  };

  const client = getAdminChatClient();
  if (client) {
    const { data, error } = await client
      .from(CHAT_TABLES.messages)
      .insert(payload)
      .select('*')
      .single();
    if (!error && data) {
      return normalizeMessage(data);
    }
    if (shouldFallback(error)) {
      forceLocal = true;
    }
  }

  const store = getLocalStore();
  const message = normalizeMessage({
    id: generateId('msg'),
    ...payload,
    created_at: new Date().toISOString()
  });
  store.messages.push(message);
  saveLocalStore(store);
  return message;
}

export function subscribeToChannel(channelId, onMessage) {
  const client = getAdminChatClient();
  if (!client || !client.channel) {
    return () => {};
  }
  const channel = client
    .channel(`admin-chat:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: CHAT_TABLES.messages,
        filter: `channel_id=eq.${channelId}`
      },
      (payload) => {
        if (payload?.new) {
          onMessage(normalizeMessage(payload.new));
        }
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('⚠️ Realtime chat error en canal', channelId);
      }
    });

  return () => {
    try {
      client.removeChannel(channel);
    } catch (error) {
      console.warn('⚠️ Error cerrando canal realtime:', error);
    }
  };
}
