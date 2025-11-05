import {
  faBars,
  faClipboardList,
  faDumbbell,
  faFlask,
  faPencilAlt,
  faTrash,
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

function ActivityList({ activity, onDelete, onEdit }) {
  if (!activity) return null;

  const categoryName = activity.Category ? activity.Category.Name : null;

  const exerciseName = activity.Exercise
    ? activity.Exercise.Name
    : "Unnamed activity";

  return (
    <div className="flex items-center justify-between shadow-lg rounded-2xl p-6 w-full transition-all duration-300 bg-[#1f2937] text-white ">
      <div className="flex items-center  gap-4">
        <FontAwesomeIcon
          icon={getIconForActivityCategory(categoryName)}
          className="text-gray-400 text-lg"
        />
        <div className="flex-col">
          <p>{categoryName}</p>
          <p >{exerciseName}<span className="text-[#B2E642]"> ({activity.DurationMinutes} min)</span></p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-gray-400">
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
