/**
 * Pulse Chat - User Profile & Settings Management
 */

let currentUserProfile = null;

document.addEventListener('DOMContentLoaded', () => {
  // Only bind if on main chat page
  if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
    return;
  }

  setupProfileModal();
});

/**
 * Load current user profile from backend
 */
async function loadCurrentUserProfile() {
  try {
    const session = await getSupabaseSession();
    if (!session) return null;

    // Call backend API /api/auth/me or /api/users/{user_id}
    const profile = await api.get('/auth/me');
    if (profile) {
      currentUserProfile = profile;
      updateProfileUI(profile);
      return profile;
    }
  } catch (err) {
    console.error('Failed to load user profile:', err);
    // Fallback: load directly from Supabase DB if backend endpoint has temporary issue
    if (supabaseClient) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        const { data: prof } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (prof) {
          currentUserProfile = prof;
          updateProfileUI(prof);
          return prof;
        }
      }
    }
  }
  return null;
}

/**
 * Update UI elements representing the user's profile
 */
function updateProfileUI(profile) {
  if (!profile) return;

  const displayName = profile.username || profile.email?.split('@')[0] || 'User';
  const avatarUrl = profile.avatar_url;

  // Sidebar header
  const nameEl = document.getElementById('currentUserName');
  const avatarContainer = document.getElementById('currentUserAvatar');
  const avatarText = document.getElementById('currentUserAvatarText');

  if (nameEl) nameEl.innerText = displayName;
  if (avatarContainer && avatarText) {
    if (avatarUrl) {
      avatarContainer.innerHTML = `<img src="${avatarUrl}" alt="${displayName}">`;
    } else {
      avatarContainer.innerHTML = `<span>${displayName.charAt(0).toUpperCase()}</span>`;
    }
  }

  // Profile Modal fields
  const modalAvatar = document.getElementById('profileModalAvatar');
  const usernameInput = document.getElementById('profileUsernameInput');
  const emailInput = document.getElementById('profileEmailInput');

  if (usernameInput) usernameInput.value = displayName;
  if (emailInput) emailInput.value = profile.email || '';
  if (modalAvatar) {
    if (avatarUrl) {
      modalAvatar.innerHTML = `<img src="${avatarUrl}" alt="${displayName}">`;
    } else {
      modalAvatar.innerHTML = `<span>${displayName.charAt(0).toUpperCase()}</span>`;
    }
  }
}

/**
 * Setup Profile Modal and Avatar Upload
 */
function setupProfileModal() {
  const modal = document.getElementById('profileModal');
  const openBtn = document.getElementById('openProfileBtn');
  const badgeBtn = document.getElementById('currentUserBadge');
  const closeBtn = document.getElementById('closeProfileModalBtn');
  const cancelBtn = document.getElementById('cancelProfileBtn');
  const form = document.getElementById('profileForm');
  const avatarWrapper = document.getElementById('profileAvatarWrapper');
  const fileInput = document.getElementById('avatarFileInput');
  const saveBtn = document.getElementById('saveProfileBtn');

  if (!modal) return;

  const openModal = () => {
    if (currentUserProfile) updateProfileUI(currentUserProfile);
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (badgeBtn) badgeBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close when clicking backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Avatar file input trigger
  if (avatarWrapper && fileInput) {
    avatarWrapper.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }

      await handleAvatarUpload(file);
    });
  }

  // Profile form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('profileUsernameInput');
      const newUsername = usernameInput.value.trim();

      if (!newUsername || newUsername.length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        return;
      }

      try {
        setLoadingState(saveBtn, true, 'Saving...');
        const updated = await api.put('/users/profile', {
          username: newUsername,
          avatar_url: currentUserProfile?.avatar_url || ''
        });

        if (updated) {
          currentUserProfile = updated;
          updateProfileUI(updated);
          showToast('Profile updated successfully!', 'success');
          closeModal();
        }
      } catch (err) {
        console.error('Update profile error:', err);
        showToast(err.message || 'Failed to update profile', 'error');
      } finally {
        setLoadingState(saveBtn, false, 'Save Changes');
      }
    });
  }
}

/**
 * Upload Avatar to Supabase Storage Bucket
 */
async function handleAvatarUpload(file) {
  try {
    const session = await getSupabaseSession();
    if (!session || !supabaseClient) {
      showToast('Authentication required for upload', 'error');
      return;
    }

    showToast('Uploading avatar...', 'info', 2000);
    const userId = session.user.id;
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;

    const { data, error } = await supabaseClient.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Save avatar_url via backend
    const updated = await api.put('/users/profile', {
      username: currentUserProfile?.username,
      avatar_url: publicUrl
    });

    currentUserProfile = updated || { ...currentUserProfile, avatar_url: publicUrl };
    updateProfileUI(currentUserProfile);
    showToast('Avatar updated successfully!', 'success');

  } catch (err) {
    console.error('Avatar upload failed:', err);
    showToast(`Upload failed: ${err.message}`, 'error');
  }
}
