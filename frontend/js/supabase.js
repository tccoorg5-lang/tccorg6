/**
 * Supabase Client Initialization and Helpers
 */

let supabaseClient = null;

function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.error('Supabase JS SDK not loaded');
    return null;
  }

  if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_REF')) {
    console.warn('Supabase URL is not yet configured. Please set your credentials.');
  }

  try {
    supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    return supabaseClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Initialize immediately
initSupabase();

/**
 * Get current authenticated user session
 */
async function getSupabaseSession() {
  if (!supabaseClient) return null;
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}

/**
 * Get access token for FastAPI backend authorization
 */
async function getAuthToken() {
  const session = await getSupabaseSession();
  return session ? session.access_token : null;
}
