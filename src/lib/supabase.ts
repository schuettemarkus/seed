import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Allow the app to boot in demo mode without Supabase configured
const DEMO_MODE = !supabaseUrl || !supabaseAnonKey

export const supabase: SupabaseClient = DEMO_MODE
  ? createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })

export { DEMO_MODE }
