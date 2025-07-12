'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Globe, Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [environment, setEnvironment] = useState<string>('')
  const [paymentCheckStatus, setPaymentCheckStatus] = useState<'checking' | 'confirmed' | 'needs-payment' | 'error'>('checking')
  const [paymentCheckAttempts, setPaymentCheckAttempts] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('🔄 CheckoutPage: Starting user authentication check...')
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('❌ CheckoutPage: Auth error:', authError)
          setError('Authentication failed')
          router.push('/login')
          return
        }
        
        if (!user) {
          console.log('⚠️ CheckoutPage: No user found, redirecting to login')
          router.push('/login')
          return
        }
        
        console.log('✅ CheckoutPage: User authenticated:', user.id)
        setUser(user)
        
        // Start payment status polling
        await checkPaymentStatus(user.id)
        
      } catch (error) {
        console.error('❌ CheckoutPage: Unexpected error in getUser:', error)
        setError('Unexpected error occurred')
        setPaymentCheckStatus('error')
      }
    }
    getUser()
  }, [router])

  const checkPaymentStatus = async (userId: string) => {
    console.log('🔄 CheckoutPage: Starting payment status check...')
    setPaymentCheckStatus('checking')
    setPaymentCheckAttempts(0)
    
    const maxAttempts = 5 // Poll for 10 seconds (5 attempts × 2 seconds)
    let attempts = 0
    
    const pollPaymentStatus = async () => {
      try {
        attempts++
        setPaymentCheckAttempts(attempts)
        console.log(`🔄 CheckoutPage: Payment status check attempt ${attempts}/${maxAttempts}`)
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('has_paid, updated_at')
          .eq('id', userId)
          .single()

        if (userError) {
          console.error('❌ CheckoutPage: Error checking user access:', userError)
          setPaymentCheckStatus('error')
          setError('Failed to check payment status')
          return
        }

        console.log('✅ CheckoutPage: Payment status check result:', {
          hasPaid: userData?.has_paid,
          updatedAt: userData?.updated_at,
          attempt: attempts
        })

        if (userData?.has_paid) {
          console.log('✅ CheckoutPage: Payment confirmed, redirecting to dashboard')
          setPaymentCheckStatus('confirmed')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
          return
        }

        // If not paid and we haven't reached max attempts, continue polling
        if (attempts < maxAttempts) {
          console.log(`⏳ CheckoutPage: Payment not confirmed, retrying in 2 seconds... (${attempts}/${maxAttempts})`)
          setTimeout(pollPaymentStatus, 2000)
        } else {
          console.log('⚠️ CheckoutPage: Payment not confirmed after all attempts, showing checkout form')
          setPaymentCheckStatus('needs-payment')
        }
        
      } catch (error) {
        console.error('❌ CheckoutPage: Error in payment status polling:', error)
        setPaymentCheckStatus('error')
        setError('Error checking payment status')
      }
    }
    
    // Start polling
    pollPaymentStatus()
  }

  const handleCheckout = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('🔄 CheckoutPage: Starting checkout process...')
      console.log(' CheckoutPage: User ID:', user?.id)
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      })

      console.log('🔄 CheckoutPage: Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ CheckoutPage: API error response:', errorData)
        
        if (errorData.error?.includes('environment variables')) {
          throw new Error('Server configuration issue. Please contact support.')
        } else if (errorData.error?.includes('User ID')) {
          throw new Error('Authentication error. Please log in again.')
        } else {
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to create checkout session`)
        }
      }

      const data = await response.json()
      console.log('✅ CheckoutPage: Checkout session created successfully:', data)
      
      if (data.environment) {
        setEnvironment(data.environment)
        console.log('✅ CheckoutPage: Stripe environment:', data.environment)
      }
      
      if (data.url) {
        console.log('🔄 CheckoutPage: Redirecting to Stripe:', data.url)
        window.location.href = data.url
      } else {
        console.error('❌ CheckoutPage: No checkout URL in response')
        throw new Error('No checkout URL received from server')
      }
    } catch (error: any) {
      console.error('❌ CheckoutPage: Checkout error:', error)
      setError(error.message || 'Failed to create checkout session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking payment status
  if (paymentCheckStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900 mb-2">
            Checking payment status...
          </div>
          <div className="text-sm text-gray-600">
            {paymentCheckAttempts > 0 && `Attempt ${paymentCheckAttempts}/5`}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (paymentCheckStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            Error
          </div>
          <div className="text-gray-600 text-sm mb-4">
            {error || 'Failed to check payment status'}
          </div>
          <button
            onClick={() => user && checkPaymentStatus(user.id)}
            className="btn-secondary flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    )
  }

  // Show loading state while user is being set
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show checkout form (only when payment status is 'needs-payment')
  if (paymentCheckStatus !== 'needs-payment') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Visa Circle</span>
            </div>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Back to home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Your Registration
          </h1>
          <p className="text-lg text-gray-600">
            Your one-time $0.50 payment helps keep this community verified and ad-free.
          </p>
        </div>

        {/* Environment Indicator */}
        {environment && (
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              environment === 'test' 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {environment === 'test' ? (
                <AlertTriangle className="h-4 w-4 mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              {environment === 'test' ? 'Test Mode' : 'Live Mode'}
            </div>
          </div>
        )}

        <div className="card">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                What you&apos;ll get:
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Access to Visa Circle Dashboard</h3>
                  <p className="text-gray-600">Track and share visa milestones with the community</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Real-time Updates</h3>
                  <p className="text-gray-600">Get insights from verified community members</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Ad-free Experience</h3>
                  <p className="text-gray-600">Clean, distraction-free interface</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Lifetime Access</h3>
                  <p className="text-gray-600">One-time payment, no recurring fees</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-primary-600">$0.50</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Secure payment processed by Stripe
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="font-medium">Error</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Proceed to Secure Checkout'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                By proceeding, you agree to our{' '}
                <Link href="/" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Questions? Contact us at{' '}
            <a href="mailto:support@visacircle.com" className="text-primary-600 hover:text-primary-500">
              support@visacircle.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
