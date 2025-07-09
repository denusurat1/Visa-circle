'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading')
  const hasProcessed = useRef(false)
  const isRedirecting = useRef(false)

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current || isRedirecting.current) return
    hasProcessed.current = true

    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback process...')
        
        // Create Supabase client
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        // Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href)
        
        if (exchangeError) {
          console.error('Auth callback error:', exchangeError.message)
          setStatus('error')
          setTimeout(() => {
            if (!isRedirecting.current) {
              isRedirecting.current = true
              router.push('/login')
            }
          }, 2000)
          return
        }

        console.log('Code exchanged successfully, getting session...')

        // Wait a moment for the session to be properly set in cookies
        await new Promise(resolve => setTimeout(resolve, 500))

        // Get the current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session?.user) {
          console.error('Session error:', sessionError?.message || 'No session found')
          setStatus('error')
          setTimeout(() => {
            if (!isRedirecting.current) {
              isRedirecting.current = true
              router.push('/login')
            }
          }, 2000)
          return
        }

        console.log('Session found, checking user data...')

        // Check user's payment status
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('has_paid')
          .eq('id', session.user.id)
          .single()

        if (userDataError) {
          console.log('User data not found, creating user record...')
          // If user record doesn't exist, create it
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              has_paid: false,
            })

          if (insertError) {
            console.error('User creation error:', insertError.message)
            setStatus('error')
            setTimeout(() => {
              if (!isRedirecting.current) {
                isRedirecting.current = true
                router.push('/login')
              }
            }, 2000)
            return
          }
          
          console.log('User record created, redirecting to checkout...')
          setStatus('success')
          // Use replace to prevent back button issues
          setTimeout(() => {
            if (!isRedirecting.current) {
              isRedirecting.current = true
              router.replace('/checkout')
            }
          }, 1000)
          return
        }

        console.log('User data found, redirecting based on payment status...')
        setStatus('success')
        
        // Redirect based on payment status using replace
        setTimeout(() => {
          if (!isRedirecting.current) {
            isRedirecting.current = true
            if (userData?.has_paid) {
              router.replace('/dashboard')
            } else {
              router.replace('/checkout')
            }
          }
        }, 1000)

      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setStatus('error')
        setTimeout(() => {
          if (!isRedirecting.current) {
            isRedirecting.current = true
            router.push('/login')
          }
        }, 2000)
      }
    }

    handleAuthCallback()
  }, [router])

  // Show error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            Authentication Error
          </div>
          <div className="text-gray-600 text-sm">
            Redirecting to login...
          </div>
        </div>
      </div>
    )
  }

  // Show success state (briefly before redirect)
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-600 text-lg font-medium mb-2">
            Login Successful!
          </div>
          <div className="text-gray-600 text-sm">
            Redirecting...
          </div>
        </div>
      </div>
    )
  }

  // Show loading state (default)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <div className="text-lg font-medium text-gray-900 mb-2">
          Completing login...
        </div>
        <div className="text-sm text-gray-600">
          Please wait while we set up your account
        </div>
      </div>
    </div>
  )
}
