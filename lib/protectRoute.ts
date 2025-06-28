import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function checkUserAccess(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('has_paid')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error checking user access:', error)
      return false
    }

    return data?.has_paid || false
  } catch (error) {
    console.error('Error checking user access:', error)
    return false
  }
}

export async function requirePaidAccess(userId: string) {
  const hasAccess = await checkUserAccess(userId)
  if (!hasAccess) {
    redirect('/checkout')
  }
} 