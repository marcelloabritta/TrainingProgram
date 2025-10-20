import { format } from "date-fns";
import React from "react";
import SessionList from "./SessionList";

function DaySchedule({
  date,
  trainings,
  planId,
  onCreateSession,
  onMarkAsRestDay,
}) {
  const restDaySession = trainings.find((session) => session.IsRestDay);

  // Crie uma lista apenas com os treinos reais (que NÃO são de descanso)
  const actualTrainings = trainings.filter((session) => !session.IsRestDay);

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#1f2937] rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-white">{format(date, "EEEE, M/d")}</h2>
        <button 
          onClick={() => onCreateSession(date)} 
          className="text-[#B2E642] font-semibold text-sm hover:text-green-300"
        >
          + Add Session
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {/* 2. AGORA, A LÓGICA DE RENDERIZAÇÃO É MUITO MAIS CLARA E SEGURA */}

        {/* Se encontramos um 'Rest Day', mostre-o. */}
        {restDaySession && (
          <div className="text-center bg-gray-800 text-green-400 rounded-lg p-4 font-semibold">
            <p>Rest Day</p>
          </div>
        )}


        {actualTrainings.length > 0 &&
          actualTrainings.map((session) => (
            <SessionList key={session.Id} session={session} planId={planId} />
          ))}


        {trainings.length === 0 && (
          <div className="text-center border-2 border-dashed border-gray-600 text-gray-500 rounded-lg p-4 flex justify-center items-center gap-4">
            <button
              onClick={() => onMarkAsRestDay(date)}
              className="text-gray-400 font-semibold text-sm hover:text-white"
            >
              Mark as Rest Day
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DaySchedule;
