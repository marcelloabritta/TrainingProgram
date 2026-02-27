import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faTrash } from '@fortawesome/free-solid-svg-icons';

function SessionList({ session, planId, onDeleteSession }) {

  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const handleConfirmDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteSession(session.Id);
  };

  const handleCancelDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(false);
  };

  if (confirmDelete) {
    return (
      <div className="flex flex-col gap-2 shadow-lg rounded-2xl p-4 w-full bg-red-900/40 border border-red-500/50 text-white">
        <p className="text-sm text-red-300 font-semibold">Delete "{sessionTitle}"?</p>
        <p className="text-xs text-red-400/80">All activities inside this session will be permanently deleted.</p>
        <div className="flex gap-2 justify-end mt-1">
          <button
            onClick={handleCancelDelete}
            className="px-3 py-1 text-xs rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center shadow-lg rounded-2xl w-full bg-[#1f2937] transition-colors duration-200">
      <Link
        to={`/plan/${planId}/session/${session.Id}`}
        className="flex items-center justify-between flex-1 p-5 text-white"
      >
        <p className="font-semibold text-white">{sessionTitle}</p>
        <div className="flex items-center gap-3 text-gray-400">
          <p className="text-sm text-[#B2E642]">{totalDuration} min</p>
          <FontAwesomeIcon icon={faChevronRight} />
        </div>
      </Link>
      {onDeleteSession && (
        <button
          onClick={handleDeleteClick}
          className="flex items-center justify-center w-12 h-12 mr-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 active:bg-red-400/20 transition-colors"
          title="Delete session"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </div>
  );
}

export default SessionList;