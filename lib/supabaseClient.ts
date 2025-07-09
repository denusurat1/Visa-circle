import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only validate and create client if environment variables are available
// This prevents build-time errors when env vars are not set
let supabase: any = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
} else {
  // Create a mock client for build time
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ eq: async () => ({ data: null, error: null }) }),
      delete: async () => ({ eq: async () => ({ data: null, error: null }) })
    })
  }
}

export { supabase }

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

// New types for the bulletin board system
export interface VisaUpdate {
  id: string
  user_id: string
  country: string
  center: string
  visa_type: string
  milestone: string
  date_of_event: string
  note?: string
  created_at: string
}

export interface UpdateReaction {
  id: string
  update_id: string
  user_id: string
  type: 'like' | 'dislike'
  created_at: string
}

export interface VisaUpdateWithReactions extends VisaUpdate {
  reactions: {
    likes: number
    dislikes: number
    user_reaction?: 'like' | 'dislike'
  }
}

// Feedback system types
export interface FeedbackPost {
  id: string
  user_id: string
  field: string
  milestone: string
  date_of_event: string
  comment?: string
  created_at: string
}

export interface FeedbackReaction {
  id: string
  post_id: string
  user_id: string
  reaction: 'like' | 'dislike'
  created_at: string
}

export interface FeedbackPostWithReactions extends FeedbackPost {
  user?: { country: string }
  reactions: {
    likes: number
    dislikes: number
    user_reaction: 'like' | 'dislike' | null
  }
}

// Profile system types
export interface UserProfile {
  user_id: string
  visa_type?: string
  service_center?: string
  country?: string
  embassy?: string
  updated_at?: string
} 

