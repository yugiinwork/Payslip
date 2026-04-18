import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Verifies the connection to Supabase by attempting a simple select.
 * @returns {Promise<boolean>}
 */
export const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('employees').select('count', { count: 'exact', head: true });
    return !error;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
};
