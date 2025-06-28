'use client'

import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { VisaUpdateWithReactions } from '@/lib/supabaseClient'

interface VisaUpdateCardProps {
  update: VisaUpdateWithReactions
  onReaction: (updateId: string, reactionType: 'like') => void
  reactionLoading: string | null
}

export default function VisaUpdateCard({ update, onReaction, reactionLoading }: VisaUpdateCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{update.milestone}</h3>
          <p className="text-sm text-gray-600">
            {update.country} • {update.center} • {update.visa_type}
          </p>
        </div>
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Date of Event:</span> {new Date(update.date_of_event).toLocaleDateString()}
        </p>
        {update.note && (
          <p className="text-sm text-gray-700 mt-2">{update.note}</p>
        )}
      </div>

      {/* Reactions */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onReaction(update.id, 'like')}
          disabled={reactionLoading === update.id}
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
            update.reactions.user_reaction === 'like'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{update.reactions.likes}</span>
        </button>
      </div>
    </div>
  )
} 