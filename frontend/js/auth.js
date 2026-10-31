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
 * Handle Login
 */
async function handleLogin(e) {
  e.preventDefault();
  const alertEl = document.getElementById('authAlert');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showAlert(alertEl, 'Please enter both email and password', 'error');
    return;
  }

  try {
    setLoadingState(submitBtn, true, 'Logging In...');
    showAlert(alertEl, '', '');

    // Authenticate with Supabase Auth
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error('No session returned. Please check your credentials.');
    }

    // Success
    showAlert(alertEl, 'Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);

  } catch (err) {
    console.error('Login error:', err);
    showAlert(alertEl, err.message || 'Invalid email or password', 'error');
  } finally {
    setLoadingState(submitBtn, false, 'Log In');
  }
}

/**
 * Handle Registration
 */
async function handleRegister(e) {
  e.preventDefault();
  const alertEl = document.getElementById('authAlert');
  const submitBtn = document.getElementById('regSubmitBtn');
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (password !== confirmPassword) {
    showAlert(alertEl, 'Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showAlert(alertEl, 'Password must be at least 6 characters long', 'error');
    return;
  }

  try {
    setLoadingState(submitBtn, true, 'Creating Account...');
    showAlert(alertEl, '', '');

    // Register via backend API (bypasses Supabase default SMTP email rate limit with instant confirmation)
    let regSuccess = false;
    try {
      const regRes = await api.post('/auth/register', {
        email,
        password,
        username
      });
      if (regRes) regSuccess = true;
    } catch (apiErr) {
      // Fallback directly to Supabase client if backend is unreachable
      console.warn('Backend register failed, trying client signUp:', apiErr);
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) throw error;
      regSuccess = true;
    }

    if (regSuccess) {
      // Auto-login to establish session immediately
      const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (!loginErr && loginData?.session) {
        showAlert(alertEl, 'Account created! Redirecting to chat...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 600);
      } else {
        showAlert(alertEl, 'Account created successfully! Please log in.', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);
      }
    }

  } catch (err) {
    console.error('Registration error:', err);
    showAlert(alertEl, err.message || 'Failed to create account', 'error');
  } finally {
    setLoadingState(submitBtn, false, 'Create Account');
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
