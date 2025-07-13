import { supabase } from './supabaseClient'
import { redirect } from 'next/navigation'


// Current Checking for Paid Pages
export async function checkPaidUser(router?: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    if (router) {
      router.push('/login')
      return null
    }
    redirect('/login')
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('has_paid')
    .eq('id', user.id)
    .single()

  if (userError) {
    console.error('Error checking user access:', userError)
    if (router) {
      router.push('/login')
      return null
    }
    redirect('/login')
  }

  if (!userData?.has_paid) {
    if (router) {
      router.replace('/checkout?reason=premium')
      return null
    }
    redirect('/checkout?reason=premium')
  }

  return user
}


export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
} 

// Functions for checking if user is logged in
export async function checkLoggedIn() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  return user
}
