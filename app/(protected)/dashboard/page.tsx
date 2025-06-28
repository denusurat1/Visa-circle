'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, LogOut, Plus, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { formatDistanceToNow } from 'date-fns'

interface Post {
  id: string
  user_id: string
  country: string
  milestone: string
  date: string
  comment: string
  created_at: string
}

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

const MILESTONES = [
  'Applied',
  'Biometrics',
  'Interview Scheduled',
  'Approved',
  'Rejected',
  'Additional Documents Requested',
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedMilestone, setSelectedMilestone] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      // Check if user has paid access
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error checking user access:', userError)
        router.push('/login')
        return
      }

      if (!userData?.has_paid) {
        router.push('/checkout')
        return
      }

      setUser(user)
      await fetchPosts()
    }
    getUser()
  }, [router])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCountry || !selectedMilestone || !selectedDate) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          country: selectedCountry,
          milestone: selectedMilestone,
          date: selectedDate,
          comment: comment.trim(),
        })

      if (error) throw error

      // Reset form
      setSelectedCountry('')
      setSelectedMilestone('')
      setSelectedDate('')
      setComment('')

      // Refresh posts
      await fetchPosts()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackMessage.trim()) return

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          message: feedbackMessage.trim(),
        })

      if (error) throw error

      setFeedbackMessage('')
      setShowFeedbackModal(false)
      alert('Thank you for your feedback!')
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  if (!user) {
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Submission Form */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Share Your Visa Milestone</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Route
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select country route</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Milestone
                </label>
                <select
                  value={selectedMilestone}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
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
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Share any additional details about your visa journey..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Share Milestone'}
            </button>
          </form>
        </div>

        {/* Timeline Feed */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Community Updates</h2>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Suggest a feature</span>
            </button>
          </div>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No posts yet. Be the first to share your milestone!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {post.user_id.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        User from {post.country.split(' → ')[0]}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full font-medium">
                      {post.milestone}
                    </span>
                    <span className="text-gray-600 ml-2">
                      on {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {post.comment && (
                    <p className="text-gray-700 text-sm">{post.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggest a Feature</h3>
            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={4}
                className="input-field resize-none mb-4"
                placeholder="Tell us what features you'd like to see..."
                required
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 