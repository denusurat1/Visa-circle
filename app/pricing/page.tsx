'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Globe, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

const features_free = [
  'Premium Feature Access',
  'See all verified users’ latest information through a Feed',
  'Provide feedback to support new features',
]

const features_premium = [
  'Premium Feature Access',
  'See all verified users’ latest information through a Feed',
  'Provide feedback to support new features',
]

export default function PricingPage() {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchUserCount = async () => {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error fetching user count:', error)
        return
      }

      setUserCount(count ?? 0)
    }

    fetchUserCount()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Visa Circle</span>
            </Link>
            <div className="flex space-x-4">
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/login?mode=signup" className="btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Panels */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 space-y-6">
        {/* Current Users Panel */}
        {userCount !== null && (
          <div className="bg-white border rounded-xl shadow-sm p-4 w-full max-w-5xl text-center">
            <p className="text-lg text-gray-800 font-medium">
              🚀 Current User Count: <span className="font-bold">{userCount}</span> of 100 free slots claimed!
            </p>
          </div>
        )}

        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left panel: Free offer */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-green-700 mb-2">
              Verified Users - Free Premium Access
            </h2>
            <p className="text-gray-700 mb-4">Free Access for verified 100 users</p>
            <ul className="space-y-2 mb-6">
              {features_free.map((feature) => (
                <li key={feature} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Claim Free Access Code
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>

          {/* Right panel: Paid plan */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-blue-700 mb-2">
              Premium User
            </h2>
            <p className="text-gray-700 mb-4">$1 / month (next 1000 users)</p>
            <ul className="space-y-2 mb-6">
              {features_premium.map((feature) => (
                <li key={feature} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join for $1/month
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">How to Claim Your Free Premium Access</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
              <li>Sign up as a User</li>
              <li>Confirm your Email Address</li>
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
  )
}
