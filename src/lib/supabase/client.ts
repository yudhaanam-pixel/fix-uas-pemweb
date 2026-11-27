import { createBrowserClient } from '@supabase/ssr';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
);

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !isSupabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi. Periksa URL dan anon key Supabase.');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

