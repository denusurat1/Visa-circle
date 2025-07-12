'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Globe, CheckCircle, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function SuccessPage() {
  const [countdown, setCountdown] = useState(30)
  const [paymentStatus, setPaymentStatus] = useState<string>('checking')
  const [manualCheckLoading, setManualCheckLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const searchParams = useSearchParams()
  const success: string | null = searchParams?.get('success') ?? null
  const userId: string | null = searchParams?.get('userId') ?? null  


  const router = useRouter()
  

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        console.log('🔄 Success Page: Checking payment status...')
    
        if (!userId) {
          console.error('❌ Success Page: No userId found in URL')
          setPaymentStatus('error')
          return
        }
    
        console.log('✅ Success Page: Found userId in URL:', userId)
    
        let hasPaid = false
        let retryCount = 0
        const maxRetries = 10
    
        while (!hasPaid && retryCount < maxRetries) {
          console.log(`🔄 Success Page: Checking payment status (attempt ${retryCount + 1}/${maxRetries})...`)
    
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('has_paid, created_at, updated_at')
            .eq('id', userId)
            .single()
    
          if (userError) {
            console.error('❌ Success Page: Error checking user:', userError)
          } else if (userData?.has_paid) {
            console.log('✅ Success Page: Payment confirmed!')
            hasPaid = true
            setPaymentStatus('confirmed')
            setDebugInfo({
              userId,
              hasPaid: userData.has_paid,
              createdAt: userData.created_at,
              updatedAt: userData.updated_at
            })
            break
          } else {
            console.log('⚠️ Success Page: Payment not yet confirmed, retrying...')
            setPaymentStatus('waiting')
            setDebugInfo({
              userId,
              hasPaid: userData?.has_paid || false,
              createdAt: userData?.created_at,
              updatedAt: userData?.updated_at
            })
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

  const handleManualCheck = async () => {
    setManualCheckLoading(true)
    try {
      console.log('🔄 Success Page: Manual payment status check...')
          if (!userId) {
            console.error('❌ Manual Check: No userId in URL')
            return
          }
      
          const response = await fetch('/api/test-webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          })
      

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Success Page: Manual check result:', data)
        setDebugInfo(data)
        
        if (data.hasPaid) {
          setPaymentStatus('confirmed')
        } else {
          setPaymentStatus('failed')
        }
      } else {
        console.error('❌ Success Page: Manual check failed:', response.status)
      }
    } catch (error) {
      console.error('❌ Success Page: Manual check error:', error)
    } finally {
      setManualCheckLoading(false)
    }
  }

  const handleTestWebhook = async () => {
    setManualCheckLoading(true)
    try {
      console.log('🔄 Success Page: Testing webhook...')
      
      if (!userId) {
        console.error('❌ Manual Check: No userId in URL')
        return
      }

      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Success Page: Webhook test result:', data)
        alert(`Webhook test completed. Check console for details. Status: ${data.status}`)
        
        // Re-check payment status after webhook test
        setTimeout(() => {
          handleManualCheck()
        }, 2000)
      } else {
        console.error('❌ Success Page: Webhook test failed:', response.status)
        const errorData = await response.json()
        alert(`Webhook test failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error('❌ Success Page: Webhook test error:', error)
      alert('Webhook test error: ' + error)
    } finally {
      setManualCheckLoading(false)
    }
  }

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
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Payment verification failed.</span>
              </div>
            )}
            {paymentStatus === 'error' && (
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Error verifying payment.</span>
              </div>
            )}
          </div>

          {/* Manual Check Button */}
          {paymentStatus === 'failed' && (
            <div className="mb-6 space-y-2">
              <button
                onClick={handleManualCheck}
                disabled={manualCheckLoading}
                className="w-full btn-secondary flex items-center justify-center space-x-2 py-2"
              >
                {manualCheckLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Check Payment Status Manually</span>
              </button>
              
              <button
                onClick={handleTestWebhook}
                disabled={manualCheckLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
              >
                {manualCheckLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Test Webhook (Debug)</span>
              </button>
            </div>
          )}

          {/* Debug Info 
          {debugInfo && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Info:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>User ID: {debugInfo.userId}</div>
                <div>Has Paid: {debugInfo.hasPaid ? 'Yes' : 'No'}</div>
                <div>Created: {debugInfo.createdAt}</div>
                <div>Updated: {debugInfo.updatedAt}</div>
              </div>
            </div>
          )}*/}

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