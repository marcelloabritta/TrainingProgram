import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import React from 'react'
import { Link } from 'react-router-dom';

function WeekCard({ week, planId}) {
    const totalMinutes = week.TrainingSessions
    ? week.TrainingSessions.reduce((sum, session) => sum + session.TotalMinutes, 0)
    : 0;

    const startDateFormatted = format(new Date(week.StartDate), 'MMM d', { locale: enUS });
    const endDateFormatted = format(new Date(week.EndDate), 'MMM d', { locale: enUS });
    
  return (
<Link 
      to={`/plan/${planId}/week/${week.WeekNumber}`} // <-- A NOVA URL
      className="bg-gray-800 rounded-lg p-3 shadow-inner flex justify-between items-center hover:bg-gray-700 transition-colors duration-200"
    >
      <div className="flex flex-col">
        <h4 className="font-bold text-white">Week {week.WeekNumber}</h4>
        <p className="text-xs text-gray-400">{startDateFormatted} - {endDateFormatted}</p>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-semibold text-sm text-white">{totalMinutes} min</p>
        <span className="text-gray-500">&gt;</span>
      </div>
    </Link>
  )
}

export default WeekCard
