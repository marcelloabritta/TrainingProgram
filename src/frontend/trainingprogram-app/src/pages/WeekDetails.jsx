import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useHeader } from "../context/HeaderContext";
import { supabase } from "../config/supabaseClient";
import { eachDayOfInterval, isSameDay } from "date-fns";
import DaySchedule from "../components/plan/DaySchedule";
import CreateSessionModal from "../components/modals/CreateSessionModal";

function WeekDetails({ session }) {
  const { setTitle, setShowBackButton } = useHeader();
  const { planId, weekNumber } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [week, setWeek] = useState(null);
  const [scheduledDays, setScheduledDays] = useState([]);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] =
    useState(false);
  const [selectedDateForSession, setSelectedDateForSession] = useState(null);
  const navigate = useNavigate();

  const handleOpenCreateSessionModal = (date) => {
    setSelectedDateForSession(date);
    setIsCreateSessionModalOpen(true);
  };
  const handleCloseCreateSessionModal = () =>
    setIsCreateSessionModalOpen(false);

  useEffect(() => {
    const fetchWeekDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("Microcycles")
          .select("*, TrainingSessions(*, Activities(*))")
          .eq("MacrocycleId", planId)
          .eq("WeekNumber", weekNumber)
          .single();
        if (error) throw error;

        setWeek(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWeekDetails();
  }, [planId, weekNumber]);

  useEffect(() => {
    if (week) {
      setTitle(`Week ${week.WeekNumber}`);
      setShowBackButton(true);
    }

    if (week) {
      const startDate = new Date(week.StartDate);
      const endDate = new Date(week.EndDate);

      const daysArray = eachDayOfInterval({ start: startDate, end: endDate });

      const finalStructure = daysArray.map((day) => {
        const trainingsForThisDay = week.TrainingSessions.filter((training) => {
          const trainingDate = new Date(training.Date);

          return isSameDay(day, trainingDate);
        });
        return {
          date: day,
          trainings: trainingsForThisDay,
        };
      });
      setScheduledDays(finalStructure);
    }
    return () => {
      setShowBackButton(false); // <-- DESLIGA O BOTÃO
    };
  }, [week, setTitle, setShowBackButton]);

  const handleAddTraining = async (period) => {
    if (!selectedDateForSession) return;

    try {
      const newSessionData = {
        Date: selectedDateForSession,
        Period: period,
        MicrocycleId: week?.Id,
        UserId: session?.user?.id,
      };

      const { data, error } = await supabase
        .from('TrainingSessions')
        .insert(newSessionData)
        .select('*, Activities(*)')
        .single();

      if (error) throw error;

      if (data) {
        setWeek(currentWeek => ({
          ...currentWeek,
          TrainingSessions: [...currentWeek.TrainingSessions, data]
        }));
        handleCloseCreateSessionModal();
        navigate(`/plan/${planId}/session/${data.Id}`);
      }
    } catch (err) {
      console.error("Error creating session:", err);
      setError(err.message);
    }
  };

  const handleMarkAsRestDay = async (sessionDate) => {
    const newRestDayData = {
      Date: sessionDate,
      MicrocycleId: week?.Id,
      UserId: session?.user?.id,
      IsRestDay: true,
    };

    const { data, error } = await supabase
      .from("TrainingSessions")
      .insert(newRestDayData)
      .select("*, Activities(*)")
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setWeek((currentWeek) => ({
        ...currentWeek,
        TrainingSessions: [...currentWeek.TrainingSessions, data],
      }));
    }
  };

  const handleRemoveRestDay = async (sessionId) => {
    const { error } = await supabase
      .from("TrainingSessions")
      .delete()
      .eq("Id", sessionId);

    if (error) {
      setError(error.message);
    } else {
      setWeek((currentWeek) => ({
        ...currentWeek,
        TrainingSessions: currentWeek.TrainingSessions.filter(
          (s) => s.Id !== sessionId
        ),
      }));
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const { error } = await supabase
      .from("TrainingSessions")
      .delete()
      .eq("Id", sessionId);

    if (error) {
      setError(error.message);
    } else {
      setWeek((currentWeek) => ({
        ...currentWeek,
        TrainingSessions: currentWeek.TrainingSessions.filter(
          (s) => s.Id !== sessionId
        ),
      }));
    }
  };

  if (loading)
    return <p className="text-white p-6 text-center">Loading week...</p>;
  if (error) return <p className="text-red-600 p-6 text-center">{error}</p>;

  return (
    <div className="flex flex-col gap-4">
      {scheduledDays.map((dayData) => {
        const isWeekPlanned = week.TrainingSessions.length > 0;

        const microcycleId = week?.Id;
        const userId = session?.user?.id;
        return (
          <DaySchedule
            key={dayData.date.toISOString()}
            date={dayData.date}
            trainings={dayData.trainings}
            planId={planId}
            isWeekPlanned={isWeekPlanned}
            userId={userId}
            microcycleId={microcycleId}
            onCreateSession={handleOpenCreateSessionModal}
            onMarkAsRestDay={handleMarkAsRestDay}
            onRemoveRestDay={handleRemoveRestDay}
            onDeleteSession={handleDeleteSession}
          />
        );
      })}

      <CreateSessionModal
        isOpen={isCreateSessionModalOpen}
        onClose={handleCloseCreateSessionModal}
        onCreate={handleAddTraining}
      />
    </div>
  );
}

export default WeekDetails;
