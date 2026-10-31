/**
 * Pulse Chat - Authentication & Route Guard Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  setupThemeToggle();
  setupPasswordToggles();

  const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');
  const isLoginPage = window.location.pathname.includes('login.html');
  const isRegisterPage = window.location.pathname.includes('register.html');

  // Check current session
  const session = await getSupabaseSession();

  if (session && isAuthPage) {
    // User already authenticated, redirect to main chat
    window.location.href = 'index.html';
    return;
  }

  if (!session && !isAuthPage) {
    // Protected route: Redirect unauthenticated user to login
    window.location.href = 'login.html';
    return;
  }

  // Bind Login Form
  if (isLoginPage) {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
  }

  // Bind Register Form
  if (isRegisterPage) {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
    }
  }

  // Bind Logout Button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

/**
 * Handle Login (Clean Username + Password)
 */
async function handleLogin(e) {
  e.preventDefault();
  const alertEl = document.getElementById('authAlert');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showAlert(alertEl, 'Please enter your username and password', 'error');
    return;
  }

  try {
    setLoadingState(submitBtn, true, 'Logging In...');
    showAlert(alertEl, '', '');

    // Call backend API login endpoint
    const res = await api.post('/auth/login', { username, password });
    if (!res || !res.access_token) {
      throw new Error('Login failed. Please check your username and password.');
    }

    // Set Supabase session in client
    if (supabaseClient) {
      try {
        await supabaseClient.auth.setSession({
          access_token: res.access_token,
          refresh_token: res.access_token
        });
        supabaseClient.realtime.setAuth(res.access_token);
      } catch (se) {
        console.warn('Set session notice:', se);
      }
    }
    localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION, JSON.stringify(res));

    showAlert(alertEl, 'Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);

  } catch (err) {
    console.error('Login error:', err);
    showAlert(alertEl, err.message || 'Invalid username or password', 'error');
  } finally {
    setLoadingState(submitBtn, false, 'Log In');
  }
}

/**
 * Handle Registration via Invite Code
 */
async function handleRegister(e) {
  e.preventDefault();
  const alertEl = document.getElementById('authAlert');
  const submitBtn = document.getElementById('regSubmitBtn');
  const inviteCode = document.getElementById('regInviteCode').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!inviteCode) {
    showAlert(alertEl, 'Please enter an invite code', 'error');
    return;
  }
  if (!username) {
    showAlert(alertEl, 'Please choose a username', 'error');
    return;
  }
  if (password.length < 6) {
    showAlert(alertEl, 'Password must be at least 6 characters long', 'error');
    return;
  }

  try {
    setLoadingState(submitBtn, true, 'Verifying Invite & Joining...');
    showAlert(alertEl, '', '');

    // Call backend invite registration
    const res = await api.post('/auth/register', {
      invite_code: inviteCode,
      username: username,
      password: password
    });

    if (!res || !res.access_token) {
      throw new Error('Registration failed');
    }

    if (supabaseClient) {
      try {
        await supabaseClient.auth.setSession({
          access_token: res.access_token,
          refresh_token: res.access_token
        });
        supabaseClient.realtime.setAuth(res.access_token);
      } catch (se) {
        console.warn('Set session notice:', se);
      }
    }
    localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION, JSON.stringify(res));

    showAlert(alertEl, 'Invite verified! Connected to private chat...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);

  } catch (err) {
    console.error('Registration error:', err);
    showAlert(alertEl, err.message || 'Failed to join with invite code', 'error');
  } finally {
    setLoadingState(submitBtn, false, 'Join Private Chat');
  }
}

/**
 * Handle Logout
 */
async function handleLogout() {
  try {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SESSION);
    window.location.href = 'login.html';
  } catch (err) {
    console.error('Logout error:', err);
    window.location.href = 'login.html';
  }
}

/**
 * Helper: Show alert banner
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
 * Helper: Toggle button loading state
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
 * Password Visibility Toggles
 */
function setupPasswordToggles() {
  const toggleBtns = document.querySelectorAll('.password-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      const openIcon = btn.querySelector('#eyeIconOpen') || btn.querySelector('svg');
      const closedIcon = btn.querySelector('#eyeIconClosed');
      if (closedIcon) {
        openIcon.style.display = isPassword ? 'none' : 'block';
        closedIcon.style.display = isPassword ? 'block' : 'none';
      }
    });
  });
}

/**
 * Theme Toggle (Light / Dark)
 */
function setupThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) return;

  const sunIcon = document.getElementById('themeIconSun');
  const moonIcon = document.getElementById('themeIconMoon');

  function updateIcons(theme) {
    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
    }
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateIcons(currentTheme);

  toggleBtn.addEventListener('click', () => {
    const active = document.documentElement.getAttribute('data-theme');
    const newTheme = active === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
    updateIcons(newTheme);
  });
}
