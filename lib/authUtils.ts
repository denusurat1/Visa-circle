import { supabase } from './supabaseClient'
import { redirect } from 'next/navigation'

export async function checkUserAccess() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Check if user has paid access
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('has_paid')
    .eq('id', user.id)
    .single()

  if (userError) {
    console.error('Error checking user access:', userError)
    redirect('/login')
  }

  if (!userData?.has_paid) {
    redirect('/checkout')
  }

  return user
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
} 