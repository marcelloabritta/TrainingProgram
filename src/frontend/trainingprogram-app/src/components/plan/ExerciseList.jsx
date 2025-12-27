import { faLock, faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function ExerciseList({ exercise, currentUser, onEdit, onDelete }) {
  if (!exercise) return null;
  const isOwner = exercise.UserId === currentUser?.id;
  const isStandard = exercise.UserId === null;
  return (
    <li className="border border-gray-600 p-3 rounded-lg shadow-md flex justify-between items-center">

      <div>
        <h3 className="text-lg font-semibold text-white">
          {exercise.Name}
        </h3>
        {exercise.Combinations && (
          <p className="text-sm text-gray-400 italic">
            {exercise.Combinations}
          </p>
        )}
      </div>


      <div className="space-x-3">
        {isStandard && (
          <span className="text-xs text-gray-400" title="Atividade Padrão">
            <FontAwesomeIcon icon={faLock} />
          </span>
        )}
        {isOwner && (
          <>
            <button
              onClick={onEdit}
              className="text-white hover:text-white-300 text-sm cursor-pointer"
              title="Edit Activity"
            >
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-400 text-sm cursor-pointer"
              title="Delete Activity"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default ExerciseList;
