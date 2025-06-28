'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Globe, CheckCircle, ArrowRight } from 'lucide-react'

export default function SuccessPage() {
  const [countdown, setCountdown] = useState(30)
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  useEffect(() => {
    if (success === 'true') {
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
  }, [success, router])

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
              You now have lifetime access to the Visa Circle dashboard and community features.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <p className="text-sm text-gray-500">
              Redirecting automatically in {countdown} seconds...
            </p>
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