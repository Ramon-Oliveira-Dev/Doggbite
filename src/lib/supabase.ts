import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lxqnjwyjcvgkdzeioqjl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cW5qd3lqY3Zna2R6ZWlvcWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzIwNTIsImV4cCI6MjA5MTA0ODA1Mn0.caWqM0sDs_CtWFaItNgbHK8pOv1sBazFaVu4YtzWAQ4';

// Resilient fetch wrapper that catches unhandled network failures (e.g. host unreachable, offline mode)
// and returns a structured 503 response so that Supabase calls resolve gracefully
// with error objects handled by local storage / IndexedDB offline fallbacks
const resilientFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        message: err?.message || 'Network unavailable / offline',
        details: 'Failed to connect to Supabase server. Operating in local offline mode.',
        hint: 'Local storage fallback active',
        code: 'NETWORK_OFFLINE'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    fetch: resilientFetch
  }
});

