import {
  faChevronDown,
  faLock,
  faPencilAlt,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import ExerciseList from "./ExerciseList";

function CategoryCard({
  category,
  currentUser,
  isExpanded,
  onToggle,
  onEditCategory,
  onDeleteCategory,
  onCreateExercise,
  onEditExercise,
  onDeleteExercise,
}) {
  const exercises = category.Exercises || [];
  const isStandard = category.UserId === null;
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-700"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">{category.Name}</h3>
          {isStandard && (
            <span className="text-xs text-gray-400" title="Categoria Padrão">
              <FontAwesomeIcon icon={faLock} />
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCategory();
                }}
                className="text-white hover:text-white-300 cursor-pointer hover:text-gray-300"
                title="Editar Categoria"
              >
                <FontAwesomeIcon icon={faPencilAlt} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCategory();
                }}
                className="text-red-500 hover:text-red-400"
                title="Apagar Categoria"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
        
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`
              text-white text-sm 
              transform transition-transform duration-300
              ${isExpanded ? "rotate-180" : ""}
            `}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-700 space-y-3">
          <button
            onClick={onCreateExercise}
            className="w-full text-left text-sm text-[#B2E642] cursor-pointer hover:text-[#81ad22] py-1 "
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New Activity
          </button>

          {exercises.length === 0 ? (
            <p className="text-gray-400 text-center text-sm py-2">
              No activities in this category.
            </p>
          ) : (
            <ul className="space-y-2">
              {category.Exercises.map((exercise) => (
                <ExerciseList
                  key={exercise.Id}
                  exercise={exercise}
                  currentUser={currentUser}
                  onEdit={() => onEditExercise(exercise)}
                  onDelete={() => onDeleteExercise(exercise)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryCard;
