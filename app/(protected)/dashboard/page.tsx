'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Filter } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { checkUserAccess } from '@/lib/authUtils'
import { VisaUpdateWithReactions } from '@/lib/supabaseClient'
import Link from 'next/link'
import VisaUpdateCard from './components/VisaUpdateCard'
import Navbar from '@/app/(protected)/components/Navbar'

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
  'B1-B2',
  'CR1 / IR1'
]

export default function BoardPage() {
  const [user, setUser] = useState<any>(null)
  const [updates, setUpdates] = useState<VisaUpdateWithReactions[]>([])
  const [loading, setLoading] = useState(true)
  const [reactionLoading, setReactionLoading] = useState<string | null>(null)
  const [accessCheckLoading, setAccessCheckLoading] = useState(true)

  // Filters
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedVisaType, setSelectedVisaType] = useState('')
  const [selectedMilestone, setSelectedMilestone] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const initializePage = async () => {
      try {
        console.log('🔄 Dashboard: Starting initialization...')
        
        // First, get the current user
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !currentUser) {
          console.error('❌ Dashboard: Authentication error:', authError)
          router.push('/login')
          return
        }

        console.log('✅ Dashboard: User authenticated:', currentUser.id)
        setUser(currentUser)

        // Check payment status with retry logic
        let hasPaid = false
        let retryCount = 0
        const maxRetries = 5

        while (!hasPaid && retryCount < maxRetries) {
          console.log(`🔄 Dashboard: Checking payment status (attempt ${retryCount + 1}/${maxRetries})...`)
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('has_paid')
            .eq('id', currentUser.id)
            .single()

          if (userError) {
            console.error('❌ Dashboard: Error checking user access:', userError)
            if (retryCount === maxRetries - 1) {
              router.push('/login')
              return
            }
          } else if (userData?.has_paid) {
            console.log('✅ Dashboard: User has paid access')
            hasPaid = true
            break
          } else {
            console.log('⚠️ Dashboard: User has not paid yet, retrying...')
            if (retryCount === maxRetries - 1) {
              console.log('❌ Dashboard: Max retries reached, redirecting to checkout')
              router.push('/checkout')
              return
            }
            // Wait 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
          
          retryCount++
        }

        if (hasPaid) {
          console.log('✅ Dashboard: Payment confirmed, fetching updates...')
        await fetchUpdates(currentUser)
        }
      } catch (error) {
        console.error('❌ Dashboard: Error initializing page:', error)
        router.push('/login')
      } finally {
        setLoading(false)
        setAccessCheckLoading(false)
      }
    }
    
    initializePage()
  }, [])

  const fetchUpdates = async (currentUser: any) => {
    try {
      // Step 1: Fetch visa updates (keep the working part)
      let query = supabase
        .from('visa_updates')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (selectedCountry) {
        query = query.eq('country', selectedCountry)
      }
      if (selectedVisaType) {
        query = query.eq('visa_type', selectedVisaType)
      }
      if (selectedMilestone) {
        query = query.ilike('milestone', `%${selectedMilestone}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching updates:', error)
        return
      }

      if (!data) {
        console.error('No data returned from fetch')
        return
      }

      // Step 2: Fetch reactions separately to avoid breaking the main fetch
      const updateIds = data.map((update: any) => update.id)
      
      let reactionsData: any[] = []
      if (updateIds.length > 0) {
        try {
          const { data: reactions, error: reactionsError } = await supabase
            .from('update_reactions')
            .select('*')
            .in('update_id', updateIds)

          if (!reactionsError && reactions) {
            reactionsData = reactions
          }
        } catch (reactionsErr) {
          console.log('Reactions table not available yet, continuing without reactions')
        }
      }

      // Step 3: Process and combine the data
      const processedUpdates = data.map((update: any) => {
        const updateReactions = reactionsData.filter((r: any) => r.update_id === update.id)
        const likes = updateReactions.filter((r: any) => r.type === 'like').length
        const dislikes = updateReactions.filter((r: any) => r.type === 'dislike').length
        const userReaction = updateReactions.find((r: any) => r.user_id === currentUser?.id)?.type || null

        return {
          ...update,
          reactions: {
            likes,
            dislikes,
            user_reaction: userReaction
          }
        }
      })

      setUpdates(processedUpdates)
    } catch (error) {
      console.error('Error in fetchUpdates:', error)
    }
  }

  const handleReaction = async (updateId: string) => {
    if (!user) return
  
    setReactionLoading(updateId)
  
    try {
      // Check for existing reaction
      const { data: existingReaction, error } = await supabase
        .from('update_reactions')
        .select('*')
        .eq('update_id', updateId)
        .eq('user_id', user.id)
        .single()
  
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing reaction:', error)
        return
      }
  
      if (existingReaction) {
        // Remove like if already exists
        await supabase
          .from('update_reactions')
          .delete()
          .eq('id', existingReaction.id)
      } else {
        // Add new like
        await supabase
          .from('update_reactions')
          .insert({
            update_id: updateId,
            user_id: user.id,
            type: 'like'
          })
      }
  
      // Refresh updates to reflect new counts
      await fetchUpdates(user)
    } catch (err) {
      console.error('Error toggling reaction:', err)
    } finally {
      setReactionLoading(null)
    }
  }
  
  const clearFilters = () => {
    setSelectedCountry('')
    setSelectedVisaType('')
    setSelectedMilestone('')
  }

  const applyFilters = () => {
    fetchUpdates(user)
    setShowFilters(false)
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
      <Navbar showNewUpdate={true} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Visa Milestone Board</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-primary-600 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Updates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2"
                >
                  <option value="">All Countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {/* Visa Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type</label>
                <select
                  value={selectedVisaType}
                  onChange={(e) => setSelectedVisaType(e.target.value)}
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2"
                >
                  <option value="">All Types</option>
                  {VISA_TYPES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              {/* Milestone Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Milestone</label>
                <input
                  type="text"
                  value={selectedMilestone}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
                  placeholder="Search milestones..."
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={applyFilters}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Updates List */}
        <div className="space-y-6">
          {updates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No visa updates found.</p>
              <Link
                href="/dashboard/new"
                className="inline-block mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Share Your First Update
              </Link>
            </div>
          ) : (
            updates.map((update) => (
              <VisaUpdateCard
                key={update.id}
                update={update}
                onReaction={handleReaction}
                reactionLoading={reactionLoading}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
