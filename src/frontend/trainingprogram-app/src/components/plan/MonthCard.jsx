import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import WeekCard from "./WeekCard";

function MonthCard({ monthName, weeks, planId}) {
  const [expanded, setExpanded] = useState(false);

const totalMinutesInMonth = weeks.reduce((monthSum, week) => {
    const weekTotal = week.TrainingSessions.reduce((weekSum, session) => {
      const sessionTotal = session.Activities?.reduce((activitySum, activity) =>
        activitySum + activity.DurationMinutes, 0) || 0;
      
      return weekSum + sessionTotal;
    }, 0);

    return monthSum + weekTotal;
  }, 0);

  return (
    <div className="shadow-lg rounded-2xl p-6 w-full transition-all duration-300 bg-[#1f2937] text-white">
      <div
        className="flex justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <h2>{monthName}</h2>
        <div className="flex items-center gap-4">
          <p className="font-semibold text-[#B2E642]">
            {totalMinutesInMonth} min
          </p>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`cursor-pointer transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>
      {expanded && (
        <div className="p-4 border-t border-gray-700 flex flex-col gap-3">
          {weeks
            .sort((a, b) => a.WeekNumber - b.WeekNumber)
            .map((week) => (
              <WeekCard key={week.Id} week={week} planId={planId}/>
            ))}
        </div>
      )}
    </div>
  );
}

export default MonthCard;
