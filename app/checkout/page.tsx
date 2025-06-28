'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Globe, Shield, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      // Check if user has already paid
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error checking user access:', userError)
        router.push('/login')
        return
      }

      if (userData?.has_paid) {
        router.push('/dashboard')
        return
      }

      setUser(user)
    }
    getUser()
  }, [router])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
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
            Your one-time $1 payment helps keep this community verified and ad-free.
          </p>
        </div>

        <div className="card">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                What you'll get:
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
                <span className="text-2xl font-bold text-primary-600">$1.00</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Secure payment processed by Stripe
              </p>
            </div>

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