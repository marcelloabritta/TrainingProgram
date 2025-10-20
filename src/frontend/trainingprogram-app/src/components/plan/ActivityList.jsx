import { faBullseye,  faClipboardList, faDumbbell, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'

const getIconForActivityCategory = (category) => {
  switch (category) {
    case 'Physical':
      return faDumbbell; 
    case 'Tactical':
      return faClipboardList; 
    case 'Technical':
      return faBullseye; 
    default:
      return faBullseye; 
  }
};

function ActivityList({activity, onDelete}) {
    if(!activity) return null
  return (
    <div className="flex items-center justify-between shadow-lg rounded-2xl p-6 w-full transition-all duration-300 bg-[#1f2937] text-white ">
        <div className="flex items-center  gap-4">
            <FontAwesomeIcon icon={getIconForActivityCategory(activity.Category)} className="text-gray-400 text-lg"/>
            <div className="flex-col">
            <p>{activity.Name}</p>
            <p className="text-[#B2E642]">{activity.DurationMinutes} min</p>

            </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
            <button 
          onClick={onDelete} 
          className="text-red-500 hover:text-red-400"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        </div>
    </div>
  )
}

export default ActivityList
