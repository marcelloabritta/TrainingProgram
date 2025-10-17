import { faCalendar, faPen, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function PlanCard({ year, teamName, coachName, weekCount, onEditClick, onDeleteClick, onCardClick }) {
  return (
    <div className="shadow-lg rounded-2xl p-6  w-full hover:bg-[#111827] transition-colors duration-200 cursor-pointer" onClick={onCardClick}>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
        <div className="flex flex-col ">
          <h1 className="text-white font-semibold text-xl">{year} season</h1>
          <p className="text-[#8DA0B9] text-sm">{teamName}</p>
        </div>
        <div className="flex gap-4 text-gray-400">
          <FontAwesomeIcon 
          icon={faPen} 
          className="cursor-pointer hover:text-white transition-colors"
          onClick={(e) => {e.stopPropagation(); onEditClick();}} />
          <FontAwesomeIcon 
          icon={faTrash}
          className="cursor-pointer hover:text-red-500 transition-colors"
          onClick={(e) => {e.stopPropagation(); onDeleteClick();}}  />
        </div>

        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faCalendar} className="text-[#8DA0B9] e"/>
            <p className="text-[#8DA0B9] ml-1">{weekCount} Weeks</p>
          </div>
          <div className="flex items-center">
          <FontAwesomeIcon className="text-[#8DA0B9]" icon={faUser} /> 
          <p className="text-[#8DA0B9] ml-1">{coachName}</p>

          </div>
        </div>
      </div>

    </div>
  );
}

export default PlanCard;
