/**
 * Supabase Client Initialization and Helpers
 */

let supabaseClient = null;

function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.error('Supabase JS SDK not loaded');
    return null;
  }

  try {
    supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    // Auto-sync realtime auth token whenever auth state changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        supabaseClient.realtime.setAuth(session.access_token);
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
 * Get current authenticated user session and guarantee Realtime auth
 */
async function getSupabaseSession() {
  if (!supabaseClient) return null;
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  if (session?.access_token) {
    try {
      supabaseClient.realtime.setAuth(session.access_token);
    } catch (e) {
      // ignore
    }
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
