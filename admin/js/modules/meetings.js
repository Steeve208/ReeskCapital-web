// =====================================================
// MEETINGS MODULE
// Virtual meetings (Jitsi integration + local schedule)
// =====================================================
const MEETING_STORAGE_KEY = 'admin_meetings_v1';

const MeetingState = {
  meetings: [],
  activeId: null
};

export async function render() {
  return `
    <div class="meetings-module">
      <div class="module-header">
        <div class="header-left">
          <h1 class="module-title">Meetings</h1>
          <p class="module-subtitle">Start or schedule virtual meetings</p>
        </div>
        <div class="header-right">
          <button class="btn-secondary" id="startInstantMeetingBtn">
            <i class="fas fa-video"></i>
            Instant Meeting
          </button>
          <button class="btn-primary" id="newMeetingBtn" ${!hasPermission('meetings.create') ? 'style="display:none;"' : ''}>
            <i class="fas fa-plus"></i>
            New Meeting
          </button>
        </div>
      </div>

      <div class="meetings-layout">
        <div class="meetings-list-panel">
          <div class="meetings-list-header">
            <h3>Upcoming & Active</h3>
          </div>
          <div class="meetings-list" id="meetingsList">
            <!-- Meeting cards -->
          </div>
        </div>

        <div class="meetings-detail-panel" id="meetingDetailPanel">
          <div class="empty-state">
            <i class="fas fa-video"></i>
            <h3>Select a meeting</h3>
            <p>Pick a meeting to see details or join.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function init() {
  console.log('📹 Initializing Meetings module...');
  MeetingState.meetings = loadMeetings();
  renderMeetings(MeetingState.meetings);
  setupEvents();
  console.log('✅ Meetings module initialized');
}

function loadMeetings() {
  try {
    const raw = localStorage.getItem(MEETING_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.warn('⚠️ Error leyendo reuniones locales:', error);
  }
  return [];
}

function saveMeetings() {
  try {
    localStorage.setItem(MEETING_STORAGE_KEY, JSON.stringify(MeetingState.meetings));
  } catch (error) {
    console.warn('⚠️ Error guardando reuniones locales:', error);
  }
}

function renderMeetings(meetings) {
  const container = document.getElementById('meetingsList');
  if (!container) return;
  container.innerHTML = '';

  if (!meetings.length) {
    container.innerHTML = `
      <div class="empty-state small">
        <i class="fas fa-video"></i>
        <h3>No meetings yet</h3>
        <p>Create your first meeting.</p>
      </div>
    `;
    return;
  }

  meetings
    .sort((a, b) => new Date(b.startTime || b.createdAt) - new Date(a.startTime || a.createdAt))
    .forEach((meeting) => {
      const item = document.createElement('div');
      item.className = 'meeting-card';
      item.dataset.meetingId = meeting.id;
      item.innerHTML = `
        <div class="meeting-card-header">
          <div>
            <h4>${escapeHtml(meeting.title)}</h4>
            <span>${formatDate(meeting.startTime || meeting.createdAt)}</span>
          </div>
          <span class="meeting-status ${meeting.status}">${meeting.status}</span>
        </div>
        <div class="meeting-card-footer">
          <span class="meeting-room">Room: ${escapeHtml(meeting.room)}</span>
          <button class="btn-secondary join-meeting-btn">
            <i class="fas fa-sign-in-alt"></i>
            Join
          </button>
        </div>
      `;

      item.addEventListener('click', (event) => {
        if (event.target.closest('.join-meeting-btn')) {
          joinMeeting(meeting.id);
          return;
        }
        selectMeeting(meeting.id);
      });

      container.appendChild(item);
    });
}

function selectMeeting(meetingId) {
  MeetingState.activeId = meetingId;
  document.querySelectorAll('.meeting-card').forEach((item) => {
    item.classList.toggle('active', item.dataset.meetingId === meetingId);
  });

  const meeting = MeetingState.meetings.find((m) => m.id === meetingId);
  if (!meeting) return;

  const detailPanel = document.getElementById('meetingDetailPanel');
  if (!detailPanel) return;

  detailPanel.innerHTML = `
    <div class="meeting-detail">
      <div class="meeting-detail-header">
        <div>
          <h2>${escapeHtml(meeting.title)}</h2>
          <p>${formatDate(meeting.startTime || meeting.createdAt)}</p>
        </div>
        <div class="meeting-detail-actions">
          <button class="btn-secondary" id="joinMeetingBtn">
            <i class="fas fa-sign-in-alt"></i>
            Join
          </button>
          <button class="btn-primary" id="openMeetingTabBtn">
            <i class="fas fa-external-link-alt"></i>
            Open in New Tab
          </button>
        </div>
      </div>
      <div class="meeting-detail-meta">
        <div class="meta-item"><span>Room</span><strong>${escapeHtml(meeting.room)}</strong></div>
        <div class="meta-item"><span>Status</span><strong>${meeting.status}</strong></div>
      </div>
      <div class="meeting-embed">
        <iframe id="meetingIframe" src="" allow="camera; microphone; fullscreen; display-capture"></iframe>
      </div>
    </div>
  `;

  document.getElementById('joinMeetingBtn')?.addEventListener('click', () => {
    joinMeeting(meeting.id);
  });
  document.getElementById('openMeetingTabBtn')?.addEventListener('click', () => {
    openMeetingTab(meeting);
  });
}

function setupEvents() {
  const newMeetingBtn = document.getElementById('newMeetingBtn');
  if (newMeetingBtn) {
    newMeetingBtn.addEventListener('click', () => {
      createMeeting();
    });
  }

  const instantBtn = document.getElementById('startInstantMeetingBtn');
  if (instantBtn) {
    instantBtn.addEventListener('click', () => {
      createMeeting({ instant: true });
    });
  }
}

function createMeeting(options = {}) {
  const titleInput = options.instant ? '' : window.prompt('Título de la reunión');
  const title = (titleInput && titleInput.trim()) || 'Instant Meeting';
  const startInput = options.instant ? '' : window.prompt('Fecha/hora (opcional, ej: 2026-02-01 14:30)');
  const room = buildRoomName(title);

  const meeting = {
    id: generateId('meeting'),
    title,
    room,
    startTime: startInput ? new Date(startInput).toISOString() : null,
    createdAt: new Date().toISOString(),
    status: options.instant ? 'active' : 'scheduled'
  };

  MeetingState.meetings.push(meeting);
  saveMeetings();
  renderMeetings(MeetingState.meetings);
  selectMeeting(meeting.id);
  joinMeeting(meeting.id);
}

function joinMeeting(meetingId) {
  const meeting = MeetingState.meetings.find((m) => m.id === meetingId);
  if (!meeting) return;

  meeting.status = 'active';
  saveMeetings();
  renderMeetings(MeetingState.meetings);

  const iframe = document.getElementById('meetingIframe');
  if (iframe) {
    iframe.src = `https://meet.jit.si/${encodeURIComponent(meeting.room)}`;
  } else {
    openMeetingTab(meeting);
  }
}

function openMeetingTab(meeting) {
  const url = `https://meet.jit.si/${encodeURIComponent(meeting.room)}`;
  window.open(url, '_blank', 'noopener');
}

function buildRoomName(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `rsc-${slug || 'meeting'}-${Date.now()}`;
}

function generateId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  try {
    return new Date(value).toLocaleString('en-US');
  } catch (error) {
    return 'Sin fecha';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}
