import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not defined')
}

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

console.log('Supabase client initialized with URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface User {
  id: string
  email: string
  has_paid: boolean
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  country: string
  milestone: string
  date: string
  comment: string
  created_at: string
}

export interface Feedback {
  id: string
  user_id: string
  message: string
  created_at: string
} 