'use client'

import { ThumbsUp, UserIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { VisaUpdateWithReactions } from '@/lib/supabaseClient'

interface VisaUpdateCardProps {
  update: VisaUpdateWithReactions
  onReaction: (updateId: string, reactionType: 'like') => void
  reactionLoading: string | null
}

export default function VisaUpdateCard({
  update,
  onReaction,
  reactionLoading,
}: VisaUpdateCardProps) {
  const userInitials = update.user_id?.slice(0, 2).toUpperCase() || 'VC'

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      {/* Header: user circle + meta info */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
          <UserIcon className="h-4 w-4 text-primary-600" />
          </div>
          <div className="text-sm text-gray-600">
            <p>
              From <span className="font-medium">{update.country}</span> •{' '}
              <span className="inline-block bg-primary-600 text-white text-sm px-3 py-1 rounded-full font-medium">{update.visa_type}</span>
            </p>
            <p className="text-xs text-gray-500">Service Center: {update.center}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
        </span>
      </div>

      {/* Milestone badge and event date */}
      <div className="mb-2">
        <span className="inline-block bg-gray-200 text-black text-sm px-3 py-1 rounded-full font-medium">
          {update.milestone}
        </span>
        <span className="text-sm text-gray-600 ml-2">
          on {new Date(update.date_of_event).toLocaleDateString()}
        </span>
      </div>

      {/* Optional note */}
      {update.note && (
        <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">{update.note}</p>
      )}

      {/* Reaction bar */}
      <div className="flex space-x-2">
        <button
          onClick={() => onReaction(update.id, 'like')}
          disabled={reactionLoading === update.id}
          className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full border transition-colors ${
            (update.reactions?.user_reaction || null) === 'like'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-green-600 border-green-600 hover:bg-green-50'
          } ${reactionLoading === update.id ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{update.reactions.likes}</span>
        </button>
      </div>
    </div>
  )
}
