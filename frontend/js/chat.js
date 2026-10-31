/**
 * Pulse Chat - Core Messaging, Search & Realtime Logic
 * Enhanced with WebSocket Realtime + Intelligent Background Sync (No Refresh Needed!)
 */

let activeConversationId = null;
let activePartner = null;
let conversationsCache = [];
let realtimeChannel = null;
let syncIntervalTimer = null;
let convsSyncIntervalTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Only initialize on main chat dashboard
  if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
    return;
  }

  // Load user profile first
  await loadCurrentUserProfile();

  // Load conversations list
  await loadConversations();

  // Setup UI event listeners
  setupChatEventListeners();

  // Setup Supabase Realtime subscription
  await setupRealtimeSubscription();

  // Start intelligent background sync (fallback for seamless live updates)
  startBackgroundSync();
});

/**
 * Setup Event Listeners
 */
function setupChatEventListeners() {
  // Mobile Back Button
  const backBtn = document.getElementById('backToConversationsBtn');
  const appContainer = document.getElementById('appContainer');
  if (backBtn && appContainer) {
    backBtn.addEventListener('click', () => {
      appContainer.classList.remove('chat-active');
      activeConversationId = null;
      document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
    });
  }

  // Send Message Form
  const sendForm = document.getElementById('sendMessageForm');
  const messageInput = document.getElementById('messageInput');
  if (sendForm && messageInput) {
    sendForm.addEventListener('submit', handleSendMessage);

    // Enter to submit without shift key
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
  }

  // Search/Filter Conversations in Sidebar
  const filterInput = document.getElementById('conversationFilterInput');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      filterConversationList(e.target.value.toLowerCase().trim());
    });
  }

  // User Search Modal
  setupUserSearchModal();

  // Empty state & welcome buttons
  const emptyNewChatBtn = document.getElementById('emptyStateNewChatBtn');
  const welcomeStartBtn = document.getElementById('welcomeStartChatBtn');
  const openSearchBtn = document.getElementById('openSearchModalBtn');
  const searchModal = document.getElementById('userSearchModal');

  const openSearch = () => {
    if (searchModal) {
      searchModal.classList.add('active');
      const input = document.getElementById('userSearchQueryInput');
      if (input) {
        input.value = '';
        input.focus();
        searchUsers('');
      }
    }
  };

  if (emptyNewChatBtn) emptyNewChatBtn.addEventListener('click', openSearch);
  if (welcomeStartBtn) welcomeStartBtn.addEventListener('click', openSearch);
  if (openSearchBtn) openSearchBtn.addEventListener('click', openSearch);

  // Instant sync on tab visibility change or window focus
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      if (activeConversationId) loadMessages(activeConversationId, false);
      loadConversations();
    }
  });

  window.addEventListener('focus', () => {
    if (activeConversationId) loadMessages(activeConversationId, false);
    loadConversations();
  });
}

/**
 * Setup User Search Modal
 */
function setupUserSearchModal() {
  const modal = document.getElementById('userSearchModal');
  const closeBtn = document.getElementById('closeSearchModalBtn');
  const searchInput = document.getElementById('userSearchQueryInput');

  if (!modal) return;

  const closeModal = () => modal.classList.remove('active');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchUsers(e.target.value.trim());
      }, 250);
    });
  }
}

/**
 * Search Users via Backend API
 */
async function searchUsers(query) {
  const resultsContainer = document.getElementById('userSearchResults');
  if (!resultsContainer) return;

  try {
    resultsContainer.innerHTML = `
      <div style="display:flex; justify-content:center; padding: 20px;">
        <div class="spinner dark"></div>
      </div>
    `;

    const users = await api.get(`/users${query ? `?query=${encodeURIComponent(query)}` : ''}`);
    const currentUserId = currentUserProfile?.id;
    const filteredUsers = (users || []).filter(u => u.id !== currentUserId);

    if (filteredUsers.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 24px 0; font-size: 0.88rem;">
          ${query ? 'No matching users found' : 'No other users found'}
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = '';
    filteredUsers.forEach(user => {
      const item = document.createElement('div');
      item.className = 'user-search-item';
      
      const initial = (user.username || 'U').charAt(0).toUpperCase();
      const avatarHtml = user.avatar_url
        ? `<img src="${user.avatar_url}" alt="${user.username}">`
        : `<span>${initial}</span>`;

      item.innerHTML = `
        <div class="user-search-info">
          <div class="avatar-container sm">${avatarHtml}</div>
          <div class="user-search-meta">
            <span class="user-search-name">${escapeHtml(user.username || 'User')}</span>
            <span class="user-search-email">${escapeHtml(user.email || '')}</span>
          </div>
        </div>
        <button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem;">
          Message
        </button>
      `;

      item.querySelector('button').addEventListener('click', async () => {
        await startConversationWithUser(user);
        document.getElementById('userSearchModal')?.classList.remove('active');
      });

      resultsContainer.appendChild(item);
    });

  } catch (err) {
    console.error('Failed to search users:', err);
    resultsContainer.innerHTML = `
      <div style="text-align: center; color: var(--accent-danger); padding: 16px; font-size: 0.85rem;">
        Failed to load users: ${escapeHtml(err.message)}
      </div>
    `;
  }
}

/**
 * Start or Retrieve Conversation with User
 */
async function startConversationWithUser(user) {
  try {
    showToast(`Starting chat with ${user.username}...`, 'info', 1200);

    const conv = await api.post('/conversations', {
      recipient_id: user.id
    });

    if (conv && conv.id) {
      await loadConversations();
      await openConversation(conv.id, user);
    }
  } catch (err) {
    console.error('Error starting conversation:', err);
    showToast(err.message || 'Could not start conversation', 'error');
  }
}

/**
 * Load User Conversations List
 */
async function loadConversations() {
  const listEl = document.getElementById('conversationList');
  if (!listEl) return;

  try {
    const conversations = await api.get('/conversations');
    conversationsCache = conversations || [];
    renderConversationList(conversationsCache);

    // Auto-open paired conversation on load if no chat currently open
    if (!activeConversationId && conversationsCache.length > 0 && window.innerWidth > 768) {
      openConversation(conversationsCache[0].id, conversationsCache[0].partner);
    }
  } catch (err) {
    console.error('Failed to fetch conversations:', err);
  }
}

/**
 * Render Conversation Items in Sidebar
 */
function renderConversationList(conversations) {
  const listEl = document.getElementById('conversationList');
  if (!listEl) return;

  if (!conversations || conversations.length === 0) {
    listEl.innerHTML = `
      <li class="empty-list-state">
        <svg class="empty-list-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <div class="empty-list-title">Private Room Connected</div>
        <div class="empty-list-desc">Waiting for your partner to join with your invite code...</div>
      </li>
    `;
    return;
  }

  listEl.innerHTML = '';
  conversations.forEach(conv => {
    const item = document.createElement('li');
    item.className = `conversation-item ${conv.id === activeConversationId ? 'active' : ''}`;
    item.dataset.conversationId = conv.id;

    const partner = conv.partner || {};
    const displayName = partner.username || partner.email?.split('@')[0] || 'User';
    const avatarUrl = partner.avatar_url;
    const initial = displayName.charAt(0).toUpperCase();

    const avatarHtml = avatarUrl
      ? `<img src="${avatarUrl}" alt="${displayName}">`
      : `<span>${initial}</span>`;

    const lastMsg = conv.latest_message;
    const lastMsgText = lastMsg ? escapeHtml(lastMsg.content) : 'No messages yet';
    const lastMsgTime = lastMsg ? formatMessageTime(lastMsg.created_at) : '';
    const unreadCount = conv.unread_count || 0;

    item.innerHTML = `
      <div class="avatar-container">
        ${avatarHtml}
        <span class="online-dot"></span>
      </div>
      <div class="conversation-item-content">
        <div class="conversation-item-header">
          <span class="conversation-name">${escapeHtml(displayName)}</span>
          <span class="conversation-time">${lastMsgTime}</span>
        </div>
        <div class="conversation-item-footer">
          <span class="conversation-preview">${lastMsgText}</span>
          ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
        </div>
      </div>
    `;

    item.addEventListener('click', () => {
      openConversation(conv.id, partner);
    });

    listEl.appendChild(item);
  });
}

/**
 * Filter Conversation List Locally
 */
function filterConversationList(query) {
  if (!query) {
    renderConversationList(conversationsCache);
    return;
  }

  const filtered = conversationsCache.filter(conv => {
    const name = (conv.partner?.username || '').toLowerCase();
    const email = (conv.partner?.email || '').toLowerCase();
    const lastText = (conv.latest_message?.content || '').toLowerCase();
    return name.includes(query) || email.includes(query) || lastText.includes(query);
  });

  renderConversationList(filtered);
}

/**
 * Open Conversation
 */
async function openConversation(conversationId, partner) {
  activeConversationId = conversationId;
  activePartner = partner;

  // Toggle active class in sidebar items
  document.querySelectorAll('.conversation-item').forEach(el => {
    el.classList.toggle('active', el.dataset.conversationId === conversationId);
  });

  // Toggle mobile active view
  const appContainer = document.getElementById('appContainer');
  if (appContainer) {
    appContainer.classList.add('chat-active');
  }

  // Switch right pane from welcome to active view
  const welcomeState = document.getElementById('chatWelcomeState');
  const activeView = document.getElementById('activeChatView');
  if (welcomeState && activeView) {
    welcomeState.style.display = 'none';
    activeView.style.display = 'flex';
  }

  // Update header info
  const partnerNameEl = document.getElementById('activeChatPartnerName');
  const avatarContainer = document.getElementById('activeChatAvatar');
  const displayName = partner?.username || partner?.email?.split('@')[0] || 'User';

  if (partnerNameEl) partnerNameEl.innerText = displayName;
  if (avatarContainer) {
    if (partner?.avatar_url) {
      avatarContainer.innerHTML = `<img src="${partner.avatar_url}" alt="${displayName}">`;
    } else {
      avatarContainer.innerHTML = `<span>${displayName.charAt(0).toUpperCase()}</span>`;
    }
  }

  // Focus message input
  const messageInput = document.getElementById('messageInput');
  if (messageInput) messageInput.focus();

  // Load messages with initial spinner
  await loadMessages(conversationId, true);
}

/**
 * Load Messages for a Conversation (with smooth non-destructive diffing)
 */
async function loadMessages(conversationId, showSpinner = false) {
  const container = document.getElementById('messagesContainer');
  if (!container || activeConversationId !== conversationId) return;

  if (showSpinner) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; height: 100%;">
        <div class="spinner dark"></div>
      </div>
    `;
  }

  try {
    const messages = await api.get(`/messages/${conversationId}`);
    if (activeConversationId !== conversationId) return;

    renderMessages(messages || []);
  } catch (err) {
    console.error('Failed to load messages:', err);
    if (showSpinner) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--accent-danger); padding: 40px 20px;">
          Failed to load messages. Please try again.
        </div>
      `;
    }
  }
}

/**
 * Render Message List with Non-Flicker Diffing
 */
function renderMessages(messages) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  // Check if user was already near bottom before updating
  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 160;

  if (messages.length === 0) {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color: var(--text-muted); text-align: center;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-bottom: 8px;">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <p style="font-size: 0.9rem;">No messages here yet. Say hello!</p>
      </div>
    `;
    return;
  }

  // If container has empty message placeholder or spinner, clear it
  if (container.querySelector('.spinner') || container.innerText.includes('No messages here yet')) {
    container.innerHTML = '';
  }

  const currentUserId = currentUserProfile?.id;
  let hasNewMessages = false;

  messages.forEach(msg => {
    let existingRow = container.querySelector(`[data-message-id="${msg.id}"]`);

    if (!existingRow) {
      hasNewMessages = true;
      const isOutgoing = msg.sender_id === currentUserId;
      const bubble = createMessageBubble(msg, isOutgoing);
      container.appendChild(bubble);
    } else {
      // Update read status indicator if changed
      if (msg.sender_id === currentUserId && msg.is_read) {
        const meta = existingRow.querySelector('.message-meta');
        if (meta && !meta.querySelector('.read-status-icon.double-check')) {
          meta.innerHTML = `
            <span>${formatMessageClock(msg.created_at)}</span>
            <svg class="read-status-icon double-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 6 9 17 4 12"></polyline><polyline points="22 10 13 21 8 16"></polyline></svg>
          `;
        }
      }
    }
  });

  // Only auto-scroll down if user was already near bottom or new messages were added
  if (hasNewMessages && isNearBottom) {
    scrollToBottom();
  }
}

/**
 * Create DOM Element for Single Message Bubble
 */
function createMessageBubble(msg, isOutgoing) {
  const row = document.createElement('div');
  row.className = `message-row ${isOutgoing ? 'outgoing' : 'incoming'}`;
  row.dataset.messageId = msg.id;

  const timeFormatted = formatMessageClock(msg.created_at);
  const readStatusIcon = isOutgoing
    ? (msg.is_read
        ? `<svg class="read-status-icon double-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 6 9 17 4 12"></polyline><polyline points="22 10 13 21 8 16"></polyline></svg>`
        : `<svg class="read-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
    : '';

  row.innerHTML = `
    <div class="message-bubble">
      ${escapeHtml(msg.content)}
    </div>
    <div class="message-meta">
      <span>${timeFormatted}</span>
      ${readStatusIcon}
    </div>
  `;

  return row;
}

/**
 * Handle Sending a Message
 */
async function handleSendMessage(e) {
  e.preventDefault();
  if (!activeConversationId) return;

  const input = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendMessageBtn');
  const content = input.value.trim();

  if (!content) return;

  // Clear input immediately for responsive typing feel
  input.value = '';

  try {
    if (sendBtn) sendBtn.disabled = true;

    const newMsg = await api.post('/messages', {
      conversation_id: activeConversationId,
      content: content
    });

    if (newMsg) {
      appendIncomingOrOutgoingMessage(newMsg);
      scrollToBottom();
      await loadConversations();
    }
  } catch (err) {
    console.error('Failed to send message:', err);
    showToast(err.message || 'Failed to send message', 'error');
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    input.focus();
  }
}

/**
 * Append Message to View
 */
function appendIncomingOrOutgoingMessage(msg) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  // Remove empty state message if present
  if (container.querySelector('.spinner') || container.innerText.includes('No messages here yet')) {
    container.innerHTML = '';
  }

  // Avoid duplicates
  if (container.querySelector(`[data-message-id="${msg.id}"]`)) {
    return;
  }

  const isOutgoing = msg.sender_id === currentUserProfile?.id;
  const bubble = createMessageBubble(msg, isOutgoing);
  container.appendChild(bubble);
  scrollToBottom();
}

/**
 * Setup Realtime Subscriptions via Supabase SDK
 */
async function setupRealtimeSubscription() {
  if (!supabaseClient) {
    console.warn('Supabase client not ready for realtime subscription');
    return;
  }

  try {
    const session = await getSupabaseSession();
    if (session?.access_token) {
      await supabaseClient.realtime.setAuth(session.access_token);
    }

    if (realtimeChannel) {
      supabaseClient.removeChannel(realtimeChannel);
    }

    realtimeChannel = supabaseClient
      .channel('pulse_chat_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new;
            if (!newMsg) return;

            // If message belongs to active conversation
            if (newMsg.conversation_id === activeConversationId) {
              appendIncomingOrOutgoingMessage(newMsg);

              // Mark message as read if incoming
              if (newMsg.sender_id !== currentUserProfile?.id) {
                api.put(`/messages/${newMsg.id}/read`).catch(() => {});
              }
            }

            // Refresh conversation previews & ordering in sidebar
            await loadConversations();
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new;
            if (updatedMsg && updatedMsg.conversation_id === activeConversationId) {
              const el = document.querySelector(`[data-message-id="${updatedMsg.id}"]`);
              if (el && updatedMsg.is_read) {
                const meta = el.querySelector('.message-meta');
                if (meta && el.classList.contains('outgoing')) {
                  meta.innerHTML = `
                    <span>${formatMessageClock(updatedMsg.created_at)}</span>
                    <svg class="read-status-icon double-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 6 9 17 4 12"></polyline><polyline points="22 10 13 21 8 16"></polyline></svg>
                  `;
                }
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        async () => {
          await loadConversations();
        }
      )
      .subscribe((status, err) => {
        console.log('Supabase Realtime subscription status:', status, err || '');
      });
  } catch (e) {
    console.warn('Realtime subscription init warning:', e);
  }
}

/**
 * Intelligent Background Sync - Guarantees Real-time Updates Even If WebSocket Drops
 */
function startBackgroundSync() {
  if (syncIntervalTimer) clearInterval(syncIntervalTimer);
  if (convsSyncIntervalTimer) clearInterval(convsSyncIntervalTimer);

  // Poll active chat every 2.0s silently
  syncIntervalTimer = setInterval(async () => {
    if (activeConversationId && !document.hidden) {
      await loadMessages(activeConversationId, false);
    }
  }, 2000);

  // Poll conversations list in sidebar every 4.0s
  convsSyncIntervalTimer = setInterval(async () => {
    if (!document.hidden) {
      await loadConversations();
    }
  }, 4000);
}

/**
 * Scroll to bottom of message list
 */
function scrollToBottom() {
  const container = document.getElementById('messagesContainer');
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }
}

/**
 * Format Helpers
 */
function formatMessageTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = new Date();
  
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatMessageClock(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
