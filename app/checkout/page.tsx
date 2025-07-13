'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Globe, Shield, CheckCircle, AlertTriangle, X, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [environment, setEnvironment] = useState<string>('')
  const router = useRouter()
  const [accessCode, setAccessCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleAccessCode = async () => {
    setCodeError('')
    setCodeLoading(true)
  
    try {
      if (!accessCode.trim()) {
        setCodeError('Please enter an access code')
        return
      }
  
      if (accessCode !== 'FIRST100') {
        setCodeError('Invalid access code')
        return
      }
  
      const { error } = await supabase
        .from('users')
        .update({ has_paid: true })
        .eq('id', user.id)
  
      if (error) {
        console.error('❌ Failed to update user has_paid:', error)
        setCodeError('Failed to activate premium access. Please try again.')
        return
      }
  
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      setCodeError('Unexpected error. Please try again.')
    } finally {
      setCodeLoading(false)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('🔄 CheckoutPage: Starting user authentication check...')
        console.log('🔄 CheckoutPage: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('🔄 CheckoutPage: Supabase client initialized:', !!supabase)
        
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
        
        // Check if user has already paid
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('has_paid')
          .eq('id', user.id)
          .single()

        if (userError) {
          console.error('❌ CheckoutPage: Error checking user access:', userError)
          setError('Failed to check payment status')
          router.push('/login')
          return
        }

        if (userData?.has_paid) {
          console.log('✅ CheckoutPage: User already paid, redirecting to dashboard')
          router.push('/dashboard')
          return
        }

        console.log('✅ CheckoutPage: User needs payment, setting user state')
        setUser(user)
      } catch (error) {
        console.error('❌ CheckoutPage: Unexpected error in getUser:', error)
        setError('Unexpected error occurred')
      }
    }
    getUser()
  }, [router])

  const handleCheckout = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('🔄 CheckoutPage: Starting checkout process...')
      console.log('🔄 CheckoutPage: User ID:', user?.id)
      console.log('🔄 CheckoutPage: Current URL:', window.location.href)
      console.log('🔄 CheckoutPage: Base URL from env:', process.env.NEXT_PUBLIC_BASE_URL)
      
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
      console.log('🔄 CheckoutPage: Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ CheckoutPage: API error response:', errorData)
        
        // Provide more specific error messages
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
      
      // Store environment info for debugging
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Visa Circle</span>
            </Link>
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
            Your $1/month subscription keeps the community verified and ad-free.
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
                  <h3 className="font-medium text-gray-900">Premium Access</h3>
                  <p className="text-gray-600">Feed with the latest information</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-primary-600">$1.00<span className="text-sm text-gray-600 mt-2">
                /month
              </span></span>
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
            <div className="mt-6 text-center space-y-2">
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-500">
                  <span 
                    onClick={() => setShowModal(true)}
                    className="text-primary-600 hover:text-primary-500 cursor-pointer underline"
                  >
                    FREE Lifetime Access
                  </span>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="border rounded px-3 py-2 text-sm text-gray-900 w-full"
                />
                <button
                  onClick={handleAccessCode}
                  disabled={codeLoading}
                  className="btn-secondary"
                >
                  {codeLoading ? 'Verifying…' : 'Apply'}
                </button>
              </div>
              {codeError && <p className="text-sm text-red-600 mt-1">{codeError}</p>}
            </div>

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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Claim Your Free Premium Access</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
                <li className="line-through">Sign up as a User</li>
                <li className="line-through">Confirm your Email Address</li>
                <li>Forward email from USCIS or CEAC.gov — Validate your current status</li>
                <li>Receive Confirmation and Free Access Code</li>
                <li>Use Access code for Premium Access</li>
              </ol>
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign Up
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 