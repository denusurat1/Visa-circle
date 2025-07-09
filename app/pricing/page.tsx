'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Globe } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

const features = [
  'Enter your US Visa information',
  'Have it verified with key email forwards and VISA details',
  'See all verified users’ latest information through a Feed',
  'Provide feedback to support new features',
]

export default function PricingPage() {
  const [userCount, setUserCount] = useState<number | null>(null)

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
              <Link href="/login" className="btn-primary">
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
              🎉 Limited Time: First 100 Users
            </h2>
            <p className="text-gray-700 mb-4">Free — Unlimited Access</p>
            <ul className="space-y-2 mb-6">
              {features.map((feature) => (
                <li key={feature} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Sign Up Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>

          {/* Right panel: Paid plan */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-blue-700 mb-2">
              🚀 Post-100 Users
            </h2>
            <p className="text-gray-700 mb-4">$1 / month (next 1000 users)</p>
            <ul className="space-y-2 mb-6">
              {features.map((feature) => (
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
    </div>
  )
}
