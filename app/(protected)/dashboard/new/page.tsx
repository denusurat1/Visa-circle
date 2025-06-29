'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { checkUserAccess } from '@/lib/authUtils'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const COUNTRIES = [
  'India',
  'Pakistan',
  'Nigeria',
  'Philippines',
  'China',
  'Brazil',
  'Mexico',
  'Canada',
  'United Kingdom',
  'Australia'
]

const VISA_TYPES = [
  'CR1 / IR1',
  'K1',
  'B1-B2',
  'F1',
  'H1B',
  'L1',
  'O1',
  'E1/E2',
  'TN',
  'Other'
]

const SERVICE_CENTERS = [
  'California',
  'Texas'
]

const MILESTONES = [
  'Applied',
  'Biometrics',
  'Interview Scheduled',
  'Approved',
  'Rejected',
  'Additional Documents Requested',
  'Case Transferred',
  'RFE Received',
  'RFE Responded',
  'Case Closed'
]

export default function NewUpdatePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  // Form states
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedVisaType, setSelectedVisaType] = useState('')
  const [selectedMilestone, setSelectedMilestone] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedCenter, setSelectedCenter] = useState('')
  const [note, setNote] = useState('')

  const router = useRouter()

  useEffect(() => {
    const initializePage = async () => {
      try {
        const currentUser = await checkUserAccess()
        setUser(currentUser)
        
        // Fetch user profile to pre-fill country and visa type
        await fetchUserProfile(currentUser.id)
      } catch (error) {
        console.error('Error initializing page:', error)
        router.push('/login')
      }
    }
    
    initializePage()
  }, [router])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setUserProfile(data)
        // Pre-fill country and visa type from profile
        if (data.country) {
          setSelectedCountry(data.country)
        }
        if (data.visa_type) {
          setSelectedVisaType(data.visa_type)
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !user.id) return

    if (!selectedCountry || !selectedVisaType || !selectedMilestone || !selectedDate || !selectedCenter) {
      alert('Please fill in all required fields.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('visa_updates').insert({
        user_id: user.id,
        country: selectedCountry,
        visa_type: selectedVisaType,
        center: selectedCenter,
        milestone: selectedMilestone,
        date_of_event: selectedDate,
        note: note.trim() || null,
      })

      if (error) {
        console.error('Error creating update:', error)
        alert('Error creating update. Please try again.')
        return
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating update:', error)
      alert('Error creating update. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Board</span>
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Share Your Visa Update</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country Route *
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                required
                disabled={!!userProfile?.country}
                className={`w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  userProfile?.country ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                }`}
              >
                {!selectedCountry && (
                  <option value="">Select country route</option>
                )}

                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {userProfile?.country && (
                <p className="text-sm text-gray-500 mt-1">
                  Pre-filled from your profile. Update your profile to change this.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visa Type *
              </label>
              <select
                value={selectedVisaType}
                onChange={(e) => setSelectedVisaType(e.target.value)}
                required
                disabled={!!userProfile?.visa_type}
                className={`w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  userProfile?.visa_type ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                }`}
              >
                {!selectedVisaType && (
                  <option value="">Select visa type</option>
                )}

                {VISA_TYPES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              {userProfile?.visa_type && (
                <p className="text-sm text-gray-500 mt-1">
                  Pre-filled from your profile. Update your profile to change this.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Center *
              </label>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                required
                className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select service center</option>
                {SERVICE_CENTERS.map((center) => (
                  <option key={center} value={center}>{center}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Milestone *
              </label>
              <select
                value={selectedMilestone}
                onChange={(e) => setSelectedMilestone(e.target.value)}
                required
                className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select milestone</option>
                {MILESTONES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Event *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Share any additional details about your visa journey..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? 'Creating Update...' : 'Create Update'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 