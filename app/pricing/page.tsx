'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Globe, X, Users, Clock, Shield } from 'lucide-react'
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
    <div className="min-h-screen bg-white flex flex-col">
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
              Lifetime Premium Access
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
              href="/login?mode=signup"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join for $1/month
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why choose Visa Circle?
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of applicants tracking their visa journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Real updates from people going through the same process as you
              </p>
            </div>
            
            <div className="card text-center">
              <Clock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant notifications about visa processing times and milestones
              </p>
            </div>
            
            <div className="card text-center">
              <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Community</h3>
              <p className="text-gray-600">
                One-time payment ensures a trusted, ad-free environment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Claim Your Free Premium Access
              </h3>

              <div className="flex justify-between items-center mb-8 px-4">
                {/* Step 1 */}
                <div className="flex flex-col items-center w-1/3">
                  <Globe className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-800">Sign Up</span>
                </div>

                <ArrowRight className="h-4 w-4 text-gray-300" />

                {/* Step 2 */}
                <div className="flex flex-col items-center w-1/3">
                  <Shield className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-800 text-center">Verify</span>
                </div>

                <ArrowRight className="h-4 w-4 text-gray-300" />

                {/* Step 3 */}
                <div className="flex flex-col items-center w-1/3">
                  <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-800 text-center">Lifetime Access</span>
                </div>
              </div>

              <Link
                href="/login?mode=signup"
                className="flex justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mb-3"
              >
                Sign Up
                <ArrowRight className="h-6.5 w-4 ml-2" />
              </Link>

              <p className="text-center text-sm text-gray-500">
                If you have any questions, email us at{' '}
                <a
                  href="mailto:visacircle1@gmail.com"
                  className="text-primary-600 hover:text-primary-500"
                >
                  support@visacircle.com
                </a>
              </p>
            </div>
          </div>
        )}

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Globe className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold">Visa Circle</span>
            </div>
            <p className="text-gray-400">
              © 2025 Visa Circle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>


    </div>
  )
}
