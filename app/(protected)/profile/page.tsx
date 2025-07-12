'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User as UserIcon, Save, Check, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { checkUserAccess } from '@/lib/authUtils'
import { UserProfile } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import Navbar from '@/app/(protected)/components/Navbar'

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

const EMBASSIES_BY_COUNTRY: Record<string, string[]> = {
  'India': ['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Hyderabad'],
  'Pakistan': ['Islamabad', 'Karachi', 'Lahore'],
  'Nigeria': ['Lagos', 'Abuja'],
  'Philippines': ['Manila', 'Cebu'],
  'China': ['Beijing', 'Shanghai', 'Guangzhou'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal'],
  'United Kingdom': ['London', 'Manchester', 'Edinburgh'],
  'Australia': ['Sydney', 'Melbourne', 'Perth']
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  
  // Form states
  const [visaType, setVisaType] = useState('')
  const [serviceCenter, setServiceCenter] = useState('')
  const [country, setCountry] = useState('')
  const [embassy, setEmbassy] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    const initialize = async () => {
      try {
        const currentUser = await checkUserAccess()
        setUser(currentUser)
        
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (userError) {
          console.error('Error fetching user data:', userError)
        } else {
          setUserData(userData)
        }

        // Fetch profile data
        await fetchProfile(currentUser.id)
      } catch (error) {
        console.error('Error initializing profile:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
  
    initialize()
  }, [router])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        setProfile(data)
        setVisaType(data.visa_type || '')
        setServiceCenter(data.service_center || '')
        setCountry(data.country || '')
        setEmbassy(data.embassy || '')
        setIsEditing(false) // Start in read-only mode if profile exists
      } else {
        setIsEditing(true) // Start in edit mode if no profile exists
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
    }
  }

  const handleSave = async () => {
    if (!user || !user.id) return

    setSaving(true)
    try {
      const profileData = {
        user_id: user.id,
        visa_type: visaType || null,
        service_center: serviceCenter || null,
        country: country || null,
        embassy: embassy || null,
        updated_at: new Date().toISOString()
      }

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert(profileData)

        if (error) throw error
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // Refresh profile data and switch to read-only mode
      await fetchProfile(user.id)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Reset form to saved values
    if (profile) {
      setVisaType(profile.visa_type || '')
      setServiceCenter(profile.service_center || '')
      setCountry(profile.country || '')
      setEmbassy(profile.embassy || '')
    } else {
      setVisaType('')
      setServiceCenter('')
      setCountry('')
      setEmbassy('')
    }
    setIsEditing(false)
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }

    setPasswordLoading(true)
    setPasswordError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setPasswordError(error.message)
      } else {
        setPasswordSuccess(true)
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordSuccess(false)
        }, 2000)
      }
    } catch (error) {
      setPasswordError('An error occurred. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry)
    setEmbassy('') // Reset embassy when country changes
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
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and visa details</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Profile updated successfully!</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 1: Account Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>Account Information</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={userData?.email || ''}
                  disabled
                  className="w-full border border-gray-300 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full border border-gray-300 bg-white text-gray-700 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  Change Password
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid User</label>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userData?.has_paid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userData?.has_paid ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Visa Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Visa Details</h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <Edit className="h-4 w-4" />
                  <span>{profile ? 'Edit' : 'Edit'}</span>
                </button>
              )}
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visa Type
                </label>
                <select
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    !isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select visa type</option>
                  {VISA_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  US Service Center
                </label>
                <select
                  value={serviceCenter}
                  onChange={(e) => setServiceCenter(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    !isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select service center</option>
                  {SERVICE_CENTERS.map((center) => (
                    <option key={center} value={center}>{center}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applicant&apos;s Country
                </label>
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    !isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consulate/Embassy
                </label>
                <select
                  value={embassy}
                  onChange={(e) => setEmbassy(e.target.value)}
                  disabled={!isEditing || !country}
                  className={`w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    !isEditing || !country ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select embassy</option>
                  {country && EMBASSIES_BY_COUNTRY[country]?.map((embassy) => (
                    <option key={embassy} value={embassy}>{embassy}</option>
                  ))}
                </select>
              </div>

              {isEditing && (
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            
            {passwordError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">Password updated successfully!</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 