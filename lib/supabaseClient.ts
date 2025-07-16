// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Asegúrate de que tu .env.local contiene estas dos vars EXACTAMENTE:
const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
