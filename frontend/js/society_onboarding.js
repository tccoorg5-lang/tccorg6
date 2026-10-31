/**
 * Private Society Platform — Onboarding & Society Authentication
 */

document.addEventListener('DOMContentLoaded', async () => {
  setupPasswordToggles();

  const isLoginPage = !!document.getElementById('societyLoginForm');
  const isRegisterPage = !!document.getElementById('inductionForm');

  // Check if session exists on login page only (never auto-redirect away from registration)
  if (isLoginPage) {
    const session = await getSupabaseSession();
    if (session && session.access_token) {
      try {
        const myProfile = await api.get('/members/me');
        if (myProfile && myProfile.society_role) {
          if (myProfile.society_role === 'founder') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
          return;
        }
      } catch (e) {
        // Stale or invalid session: clear it completely so no bounce happens
        console.warn('Session verification failed on login page, clearing stale session.');
        localStorage.removeItem(CONFIG.STORAGE_KEYS.SESSION);
        if (supabaseClient) {
          try { await supabaseClient.auth.signOut(); } catch (_) {}
        }
      }
    }
  }

  // Bind Login Handler
  if (isLoginPage) {
    const loginForm = document.getElementById('societyLoginForm');
    loginForm.addEventListener('submit', handleSocietyLogin);
  }

  // Bind Registration & Token Verification Handlers
  if (isRegisterPage) {
    const tokenInput = document.getElementById('tokenInput');
    const verifyBtn = document.getElementById('verifyTokenBtn');
    const form = document.getElementById('inductionForm');

    if (verifyBtn && tokenInput) {
      verifyBtn.addEventListener('click', () => verifyToken(tokenInput.value.trim()));
      tokenInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          verifyToken(tokenInput.value.trim());
        }
      });
    }

    if (form) {
      form.addEventListener('submit', handleSocietyRedeem);
    }
  }
});

/**
 * Pre-Verify Invitation Token
 */
async function verifyToken(token) {
  const alertEl = document.getElementById('authAlert');
  const banner = document.getElementById('verifiedBanner');
  const bannerCodename = document.getElementById('bannerCodename');
  const bannerRank = document.getElementById('bannerRank');
  const emailInput = document.getElementById('emailInput');

  if (!token) {
    showAlert(alertEl, 'Please enter a valid invitation token', 'error');
    return;
  }

  try {
    showAlert(alertEl, '', '');
    const res = await api.post('/invitations/verify', { token });

    if (res && res.valid) {
      banner.classList.add('active');
      if (bannerCodename) bannerCodename.innerText = res.assigned_codename || 'MEMBER';
      if (bannerRank) bannerRank.innerText = res.assigned_rank || 'Initiate';
      if (emailInput && res.masked_email) {
        emailInput.placeholder = `Matches assigned recipient (${res.masked_email})`;
      }
      showToast('Token verified. Proceed with confirmation.', 'info');
    } else {
      banner.classList.remove('active');
      showAlert(alertEl, res.message || 'Invalid or expired invitation token', 'error');
    }
  } catch (err) {
    console.error('Verify error:', err);
    banner.classList.remove('active');
    showAlert(alertEl, err.message || 'Token verification failed', 'error');
  }
}

/**
 * Handle Society Registration & Induction
 */
async function handleSocietyRedeem(e) {
  e.preventDefault();
  const alertEl = document.getElementById('authAlert');
  const submitBtn = document.getElementById('redeemSubmitBtn');
  const token = document.getElementById('tokenInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;

  if (!token) {
    showAlert(alertEl, 'Please enter your invitation token', 'error');
    return;
  }
  if (!email) {
    showAlert(alertEl, 'Please enter your intended email address', 'error');
    return;
  }
  if (password.length < 6) {
    showAlert(alertEl, 'Password must be at least 6 characters', 'error');
    return;
  }

  try {
    setLoadingState(submitBtn, true, 'Validating Credentials...');
    showAlert(alertEl, '', '');

    const res = await api.post('/invitations/redeem', {
      token,
      email,
      password
    });

    if (!res || !res.access_token) {
      throw new Error(res?.detail || 'Induction failed');
    }

    // Set Supabase session
    if (supabaseClient) {
      try {
        await supabaseClient.auth.setSession({
          access_token: res.access_token,
          refresh_token: res.access_token
        });
        supabaseClient.realtime.setAuth(res.access_token);
      } catch (se) {
        console.warn('Session set notice:', se);
      }
    }
    localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION, JSON.stringify(res));

    showAlert(alertEl, 'Induction Approved. Entering Society Vault...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);

  } catch (err) {
    console.error('Induction error:', err);
    showAlert(alertEl, err.message || 'Redemption failed. Check your token and email.', 'error');
  } finally {
    setLoadingState(submitBtn, false, 'Claim Codename & Enter');
  }
}

/**
 * Handle Society Member Login
 */
async function handleSocietyLogin(e) {
  e.preventDefault();
  const alertEl = document.getElementById('authAlert');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!identifier || !password) {
    showAlert(alertEl, 'Please enter your codename/email and password', 'error');
    return;
  }

  try {
    setLoadingState(submitBtn, true, 'Accessing Vault...');
    showAlert(alertEl, '', '');

    const res = await api.post('/auth/login', {
      username: identifier,
      password: password
    });

    if (!res || !res.access_token) {
      throw new Error('Invalid credentials');
    }

    if (supabaseClient) {
      try {
        await supabaseClient.auth.setSession({
          access_token: res.access_token,
          refresh_token: res.access_token
        });
        supabaseClient.realtime.setAuth(res.access_token);
      } catch (se) {
        console.warn('Session set notice:', se);
      }
    }
    localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION, JSON.stringify(res));

    showAlert(alertEl, 'Access Granted. Entering Vault...', 'success');

    // Route based on role
    setTimeout(async () => {
      try {
        const myProfile = await api.get('/members/me');
        if (myProfile?.society_role === 'founder') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'index.html';
        }
      } catch (e) {
        window.location.href = 'index.html';
      }
    }, 500);

  } catch (err) {
    console.error('Login error:', err);
    showAlert(alertEl, err.message || 'Access Denied: Invalid credentials', 'error');
  } finally {
    setLoadingState(submitBtn, false, 'Enter Society Vault');
  }
}

/**
 * Helper: Alert banner
 */
function showAlert(el, msg, type = 'error') {
  if (!el) return;
  if (!msg) {
    el.style.display = 'none';
    el.className = 'auth-alert';
    el.innerText = '';
    return;
  }
  el.className = `auth-alert ${type}`;
  el.style.display = 'flex';
  el.innerText = msg;
}

/**
 * Helper: Button loading state
 */
function setLoadingState(btn, loading, defaultText = 'Submit') {
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn.innerHTML = `<div class="spinner"></div><span>${defaultText}</span>`;
  } else {
    btn.innerHTML = `<span>${defaultText}</span>`;
  }
}

/**
 * Helper: Password visibility toggle
 */
function setupPasswordToggles() {
  const toggleBtn = document.getElementById('togglePasswordBtn');
  const input = document.getElementById('loginPassword');
  if (!toggleBtn || !input) return;

  toggleBtn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const openIcon = document.getElementById('eyeIconOpen');
    const closedIcon = document.getElementById('eyeIconClosed');
    if (openIcon && closedIcon) {
      openIcon.style.display = isPassword ? 'none' : 'block';
      closedIcon.style.display = isPassword ? 'block' : 'none';
    }
  });
}
