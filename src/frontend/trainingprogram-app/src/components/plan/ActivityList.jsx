import {
  faBars,
  faClipboardList,
  faDumbbell,
  faFlask,
  faPencilAlt,
  faTrash,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const getIconForActivityCategory = (category) => {
  switch (category) {
    case "Physical":
      return faDumbbell;
    case "Tactical":
      return faClipboardList;
    case "Technical":
      return faFlask;
    default:
      return faBars;
  }
};

function ActivityList({ activity, onDelete, onEdit, combinedWith = [] }) {
  if (!activity) return null;

  const categoryName = activity.Category ? activity.Category.Name : null;
  const exerciseName = activity.Exercise
    ? activity.Exercise.Name
    : "Unnamed activity";

  const isCombined = !!activity.CombinedGroupId;

  return (
    <div
      className={`flex items-center justify-between shadow-lg rounded-2xl p-6 w-full transition-all duration-300 text-white ${isCombined
        ? "bg-[#1a2535] border border-[#B2E642]/30"
        : "bg-[#1f2937]"
        }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {isCombined ? (
          <FontAwesomeIcon
            icon={faLink}
            className="text-[#B2E642] text-lg flex-shrink-0"
          />
        ) : (
          <FontAwesomeIcon
            icon={getIconForActivityCategory(categoryName)}
            className="text-gray-400 text-lg flex-shrink-0"
          />
        )}
        <div className="flex flex-col min-w-0">
          <p className="text-sm text-gray-400">{categoryName}</p>
          <p className="font-semibold">
            {exerciseName}
            <span className="text-[#B2E642]"> ({activity.DurationMinutes} min)</span>
          </p>
          {(activity.Variation || activity.Exercise?.Combinations) && (
            <p className="text-xs text-gray-500 italic mt-0.5">
              {activity.Variation || activity.Exercise.Combinations}
            </p>
          )}
          {isCombined && combinedWith.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] bg-[#B2E642]/15 text-[#B2E642] rounded px-1.5 py-0.5 font-semibold tracking-wide">
                COMBINED
              </span>
              <span className="text-xs text-gray-500">
                with: {combinedWith.map((a) => a.Exercise?.Name || "?").join(" + ")}
              </span>
            </div>
          )}
          {isCombined && combinedWith.length === 0 && (
            <div className="mt-1">
              <span className="text-[10px] bg-[#B2E642]/15 text-[#B2E642] rounded px-1.5 py-0.5 font-semibold tracking-wide">
                COMBINED
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-gray-400 ml-2 flex-shrink-0">
        <button onClick={onEdit} className="text-gray-400 hover:text-white">
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
        <button onClick={onDelete} className="text-red-500 hover:text-red-400">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
}

export default ActivityList;
