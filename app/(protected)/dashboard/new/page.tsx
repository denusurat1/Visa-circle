'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, LogOut, ArrowLeft, Check } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { checkUserAccess } from '@/lib/authUtils'
import Link from 'next/link'

const COUNTRIES = [
  'India → US',
  'India → Canada',
  'India → UK',
  'India → Australia',
  'Pakistan → US',
  'Pakistan → Canada',
  'Pakistan → UK',
  'Nigeria → US',
  'Nigeria → Canada',
  'Philippines → US',
  'Philippines → Canada',
  'China → US',
  'China → Canada',
  'Brazil → US',
  'Brazil → Canada',
]

const VISA_TYPES = [
  'Student Visa',
  'Work Visa',
  'Tourist Visa',
  'Business Visa',
  'Family Visa',
  'Permanent Residence',
  'Citizenship',
]

const MILESTONES = [
  'Applied',
  'Biometrics',
  'Interview Scheduled',
  'Approved',
  'Rejected',
  'Additional Documents Requested',
]

export default function NewUpdatePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Form states
  const [country, setCountry] = useState('')
  const [center, setCenter] = useState('')
  const [visaType, setVisaType] = useState('')
  const [milestone, setMilestone] = useState('')
  const [dateOfEvent, setDateOfEvent] = useState('')
  const [note, setNote] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    const initializePage = async () => {
      try {
        const currentUser = await checkUserAccess()
        setUser(currentUser)
        // Set default date to today
        setDateOfEvent(new Date().toISOString().split('T')[0])
      } catch (error) {
        console.error('Error initializing page:', error)
      } finally {
        setLoading(false)
      }
    }
    initializePage()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!country || !center || !visaType || !milestone || !dateOfEvent) {
      alert('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('visa_updates')
        .insert({
          user_id: user.id,
          country,
          center,
          visa_type: visaType,
          milestone,
          date_of_event: dateOfEvent,
          note: note.trim() || null,
        })

      if (error) throw error

      setShowSuccess(true)
      
      // Reset form
      setCountry('')
      setCenter('')
      setVisaType('')
      setMilestone('')
      setDateOfEvent(new Date().toISOString().split('T')[0])
      setNote('')

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error creating update:', error)
      alert('Error creating update. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
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
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

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

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Share Your Visa Milestone</h1>

          {showSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Update created successfully!</span>
              </div>
              <p className="text-green-700 text-sm mt-1">Redirecting to the board...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Route <span className="text-red-500">*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Country Route</option>
                  {COUNTRIES.map((countryOption) => (
                    <option key={countryOption} value={countryOption}>{countryOption}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visa Center <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                  required
                  placeholder="e.g., Mumbai, Delhi, Chennai"
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visa Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                  required
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Visa Type</option>
                  {VISA_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Event <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateOfEvent}
                  onChange={(e) => setDateOfEvent(e.target.value)}
                  required
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Milestone <span className="text-red-500">*</span>
              </label>
              <select
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select milestone</option>
                  {MILESTONES.map((milestone) => (
                    <option key={milestone} value={milestone}>
                      {milestone}
                    </option>
                  ))}
                </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Share any additional details, tips, or experiences..."
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Share Update'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 