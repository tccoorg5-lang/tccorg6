/**
 * Pulse Chat - Frontend Configuration
 */
const CONFIG = {
  // Supabase credentials - safely populated from environment
  SUPABASE_URL: window.ENV?.SUPABASE_URL || 'https://leffduchegcebgfhyyyn.supabase.co',
  SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZmZkdWNoZWdjZWJnZmh5eXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNzE1NjcsImV4cCI6MjEwODk0NzU2N30.oC5oXnwF78rcxZrmdv-IVVRBUXsg-xobOi8bLA0Fl6g',
  
  // Backend API Base URL
  API_BASE_URL: window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? `${window.location.origin}/api`
    : '/api',

  // Local storage keys
  STORAGE_KEYS: {
    THEME: 'pulse_theme',
    SESSION: 'pulse_session'
  }
};
