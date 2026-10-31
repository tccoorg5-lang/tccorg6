/**
 * Pulse Chat - Frontend Configuration
 */
const CONFIG = {
  // Supabase credentials - can be injected via window.ENV or updated directly
  SUPABASE_URL: window.ENV?.SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_REF.supabase.co',
  SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
  
  // Backend API Base URL
  // In development and production (Render), backend serves the frontend from same origin
  API_BASE_URL: window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? `${window.location.origin}/api`
    : '/api',

  // Local storage keys
  STORAGE_KEYS: {
    THEME: 'pulse_theme',
    SESSION: 'pulse_session'
  }
};
