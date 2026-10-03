import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file (see .env at the project root).',
  )
}

// Shared by both the public site and the /admin dashboard — same project,
// same anon key. What each side can actually read/write is enforced by RLS
// (see supabase/public_read_policies.sql for the public side, and the
// dashboard's own policies for the authenticated/admin side), not by
// anything in this file.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
