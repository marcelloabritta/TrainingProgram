import { faChevronDown, faLock, faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function ExerciseList({ exercise, currentUser, onEdit, onDelete }) {
  const [showAllVariations, setShowAllVariations] = React.useState(false);
  if (!exercise) return null;
  const isOwner = exercise.UserId === currentUser?.id;
  const isStandard = exercise.UserId === null;

  const variations = exercise.Variations || [];
  const hasMultipleVariations = variations.length > 2;
  const visibleVariations = showAllVariations ? variations : variations.slice(0, 2);

  return (
    <li className="border border-gray-600 p-3 rounded-lg shadow-md flex justify-between items-start gap-4">

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-white truncate">
          {exercise.Name}
        </h3>

        {(variations.length > 0 || exercise.Combinations) && (
          <div className="mt-2 border-l border-gray-700 pl-3">
            {variations.length > 0 ? (
              <>
                <button
                  onClick={() => setShowAllVariations(!showAllVariations)}
                  className="text-[11px] text-[#B2E642] hover:bg-[#B2E642]/10 px-2 py-1 rounded border border-[#B2E642]/30 transition-colors font-medium flex items-center gap-2"
                >
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[10px] transform transition-transform ${showAllVariations ? 'rotate-180' : ''}`}
                  />
                  {showAllVariations ? "Hide Variations" : `View ${variations.length} Combinations`}
                </button>

                {showAllVariations && (
                  <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {variations.map((v, i) => (
                      <p key={i} className="text-[11px] text-gray-500 leading-tight">
                        • {v}
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-[11px] text-gray-500 leading-tight italic">
                {exercise.Combinations}
              </p>
            )}
          </div>
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
