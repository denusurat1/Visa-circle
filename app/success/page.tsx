'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Globe, CheckCircle, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function SuccessPage() {
  const [countdown, setCountdown] = useState(30)
  const [paymentStatus, setPaymentStatus] = useState<string>('checking')
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        console.log('🔄 Success Page: Checking payment status...')
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.error('❌ Success Page: User not authenticated')
          setPaymentStatus('error')
          return
        }

        console.log('✅ Success Page: User authenticated:', user.id)

        // Check payment status with retry logic
        let hasPaid = false
        let retryCount = 0
        const maxRetries = 10

        while (!hasPaid && retryCount < maxRetries) {
          console.log(`🔄 Success Page: Checking payment status (attempt ${retryCount + 1}/${maxRetries})...`)
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('has_paid')
            .eq('id', user.id)
            .single()

          if (userError) {
            console.error('❌ Success Page: Error checking user access:', userError)
          } else if (userData?.has_paid) {
            console.log('✅ Success Page: Payment confirmed!')
            hasPaid = true
            setPaymentStatus('confirmed')
            break
          } else {
            console.log('⚠️ Success Page: Payment not yet confirmed, retrying...')
            setPaymentStatus('waiting')
            // Wait 3 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 3000))
          }
          
          retryCount++
        }

        if (!hasPaid) {
          console.log('❌ Success Page: Payment not confirmed after max retries')
          setPaymentStatus('failed')
        }

      } catch (error) {
        console.error('❌ Success Page: Error checking payment status:', error)
        setPaymentStatus('error')
      }
    }

    if (success === 'true') {
      checkPaymentStatus()
    }
  }, [success])

  useEffect(() => {
    if (success === 'true' && paymentStatus === 'confirmed') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push('/dashboard')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [success, paymentStatus, router])

  if (success !== 'true') {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6">
        <div className="card text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Welcome to Visa Circle. Your account has been activated.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800 text-sm">
              You now have premium access to the Visa Circle advance features.
            </p>
          </div>

          {/* Payment Status Indicator */}
          <div className="mb-6">
            {paymentStatus === 'checking' && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Verifying payment...</span>
              </div>
            )}
            {paymentStatus === 'waiting' && (
              <div className="flex items-center justify-center space-x-2 text-yellow-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-sm">Waiting for payment confirmation...</span>
              </div>
            )}
            {paymentStatus === 'confirmed' && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Payment confirmed!</span>
              </div>
            )}
            {paymentStatus === 'failed' && (
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <span className="text-sm">Payment verification failed. Please contact support.</span>
              </div>
            )}
            {paymentStatus === 'error' && (
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <span className="text-sm">Error verifying payment. Please try again.</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="w-full btn-primary flex items-center justify-center space-x-2"
              onClick={(e) => {
                if (paymentStatus !== 'confirmed') {
                  e.preventDefault()
                  alert('Please wait for payment confirmation before proceeding.')
                }
              }}
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            {paymentStatus === 'confirmed' && (
              <p className="text-sm text-gray-500">
                Redirecting automatically in {countdown} seconds...
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
} 