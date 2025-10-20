import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ActivityList from './ActivityList';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

function SessionList({ session, planId }) {


  const getSessionTitle = () => {

    if (session.Period) {
      return `${session.Period} Session`;
    }

    if (session.Activities && session.Activities.length > 0) {
      return `${session.Activities[0].Category} Training`;
    }

    return "Empty Session";
  };

  const sessionTitle = getSessionTitle();
  const totalDuration = session.Activities?.reduce((sum, act) => sum + act.DurationMinutes, 0) || 0;


  if (session.IsRestDay) {
    return (
      <div className="text-center bg-gray-800 text-green-400 rounded-lg p-4 font-semibold">
        <p>Rest Day</p>
      </div>
    );
  }


  return (
    <Link 
      to={`/plan/${planId}/session/${session.Id}`}
      className="flex items-center justify-betweenflex justify-between shadow-lg rounded-2xl p-6 w-full bg-[#1f2937] text-white hover:bg-gray-700 transition-colors duration-200"
    >

      <p className="font-semibold text-white">{sessionTitle}</p>
      

      <div className="flex items-center gap-3 text-gray-400">
        <p className="text-sm text-[#B2E642]">{totalDuration} min</p>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>
    </Link>
  );
}

export default SessionList;