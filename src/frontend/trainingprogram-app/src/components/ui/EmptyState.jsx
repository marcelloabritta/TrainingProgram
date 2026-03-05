import { faFolderPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Link } from 'react-router-dom'

function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 m-auto">
      <FontAwesomeIcon icon={faFolderPlus} className="text-5xl text-gray-600 mb-4" />
      <h2 className="text-xl font-bold text-white">Your journey begins</h2>
      <p className="text-gray-400 mt-2 mb-6 max-w-xs">
        You don't have any training plans yet. Create your first one to get started!
      </p>
      <button
        onClick={onCreateClick}
        className="bg-[#B2E642] text-[#111827] font-bold py-2 px-6 rounded-lg hover:bg-[#81ad22] transition-colors duration-300 active:scale-95"
      >
        Create First Plan
      </button>
    </div>
  )
}

export default EmptyState
