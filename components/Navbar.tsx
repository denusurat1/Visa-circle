'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, LogOut, User as UserIcon, Plus, Phone, Newspaper } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface NavbarProps {
  showNewUpdate?: boolean
  showProfile?: boolean
  showFeedback?: boolean
  showDashboard?: boolean
}

export default function Navbar({ 
  showNewUpdate = false, 
  showProfile = true, 
  showFeedback = true, 
  showDashboard = true 
}: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Visa Circle</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {showNewUpdate && (
              <Link 
                href="/dashboard/new" 
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Update</span>
              </Link>
            )}
            
            {showDashboard && (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
              >
                <Newspaper className="h-4 w-4" />
                <span>Feed</span>
              </Link>
            )}
            

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary-600" />
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {showProfile && (
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setShowDropdown(false)}
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  )}
                  
                  {showFeedback && (
                    <Link
                      href="/feedback"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Phone className="h-4 w-4" />
                      <span>Feedback</span>
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-200 my-1"></div>
                  
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      handleLogout()
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-600 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  )
} 