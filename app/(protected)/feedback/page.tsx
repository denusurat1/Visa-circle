'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, ThumbsUp, ThumbsDown, UserIcon } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { FeedbackPostWithReactions, FeedbackReaction } from '@/lib/supabaseClient'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'

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

export default function FeedbackPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<FeedbackPostWithReactions[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [reactionLoadingId, setReactionLoadingId] = useState<string | null>(null)

  // Modal states
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedMilestone, setSelectedMilestone] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [comment, setComment] = useState('')

  const router = useRouter()

  useEffect(() => {
    const initializePage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)
        await fetchPosts(user)
      } catch (error) {
        console.error('Error initializing page:', error)
        router.push('/login')
      } finally {
        setInitialLoading(false)
      }
    }

    initializePage()
  }, [router])

  const fetchPosts = async (userArg: User) => {
    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('feedback_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('Error fetching posts:', postsError)
        return
      }

      // Fetch reactions for all posts
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('feedback_reactions')
        .select('*')

      if (reactionsError) {
        console.error('Error fetching reactions:', reactionsError)
        return
      }

      // Process posts with reactions
      const postsWithReactions = postsData.map((post) => {
        const postReactions = reactionsData.filter(r => r.post_id === post.id)
        const likes = postReactions.filter(r => r.reaction === 'like').length
        const dislikes = postReactions.filter(r => r.reaction === 'dislike').length
        const userReaction = postReactions.find(r => r.user_id === userArg.id)?.reaction || null

        return {
          ...post,
          reactions: {
            likes,
            dislikes,
            user_reaction: userReaction
          }
        }
      })

      // Sort by net score (likes - dislikes)
      postsWithReactions.sort((a, b) => {
        const scoreA = a.reactions.likes - a.reactions.dislikes
        const scoreB = b.reactions.likes - b.reactions.dislikes
        return scoreB - scoreA
      })

      setPosts(postsWithReactions)
    } catch (error) {
      console.error('Error in fetchPosts:', error)
    }
  }

  const handleReaction = async (postId: string, reactionType: 'like' | 'dislike') => {
    if (!user || !user.id) return

    setReactionLoadingId(postId)

    try {
      // Check for existing reaction
      const { data: existingReaction, error: checkError } = await supabase
        .from('feedback_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError

      if (existingReaction) {
        if (existingReaction.reaction === reactionType) {
          // Remove reaction if same type
          await supabase
            .from('feedback_reactions')
            .delete()
            .eq('id', existingReaction.id)
        } else {
          // Update reaction if different type
          await supabase
            .from('feedback_reactions')
            .update({ reaction: reactionType })
            .eq('id', existingReaction.id)
        }
      } else {
        // Add new reaction
        await supabase
          .from('feedback_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction: reactionType
          })
      }

      // Refresh posts to show updated counts
      await fetchPosts(user)
    } catch (error) {
      console.error('Error toggling reaction:', error)
    } finally {
      setReactionLoadingId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !user.id) return

    if (!selectedCountry || !selectedMilestone || !selectedDate) {
      alert('Please fill in all required fields.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('feedback_posts').insert({
        user_id: user.id,
        country: selectedCountry,
        milestone: selectedMilestone,
        date_of_event: selectedDate,
        note: comment.trim() || null,
      })

      if (error) {
        console.error('Error creating post:', error)
        alert('Error creating post. Please try again.')
        return
      }

      // Reset form
      setSelectedCountry('')
      setSelectedMilestone('')
      setSelectedDate('')
      setComment('')
      setShowMilestoneModal(false)
      
      // Refresh posts to show new post
      await fetchPosts(user)
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Error creating post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
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
        {/* Timeline Feed */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Feedback Feed</h2>
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Share Feedback</span>
            </button>
          </div>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No feedback posts yet. Be the first to share your feedback!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-primary-600" />
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
                    <span className="inline-block bg-gray-200 text-black text-sm px-3 py-1 rounded-full font-medium">
                      {post.milestone}
                    </span>
                    <span className="text-gray-600 ml-2">
                      on {new Date(post.date_of_event).toLocaleDateString()}
                    </span>
                  </div>

                  {post.note && (
                    <p className="text-gray-700 text-sm mb-3">{post.note}</p>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReaction(post.id, 'like')}
                      disabled={reactionLoadingId === post.id}
                      className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full border transition-colors ${
                        post.reactions.user_reaction === 'like'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-green-600 border-green-600 hover:bg-green-50'
                      } ${reactionLoadingId === post.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{post.reactions.likes}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(post.id, 'dislike')}
                      disabled={reactionLoadingId === post.id}
                      className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full border transition-colors ${
                        post.reactions.user_reaction === 'dislike'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                      } ${reactionLoadingId === post.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsDown className="h-3 w-3" />
                      <span>{post.reactions.dislikes}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal for Share Feedback */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Feedback</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Route *
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  required
                  className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select country route</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
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
                  Additional Comments
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Share your experience or any additional details..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Post Feedback'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
