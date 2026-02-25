import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "../../config/supabaseClient";
import { calcRealDuration, buildCategoryChartData } from "../../utils/calcRealDuration";

const COLORS = [
  "#B2E642", // Lime
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#a855f7", // Purple
  "#84cc16"  // Grass
];

function WorkoutView({ sessions, monthDate, onBack, onWorkoutClick }) {
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [modalExerciseData, setModalExerciseData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Fetch activities for all sessions in this month
  useEffect(() => {
    const fetchActivities = async () => {
      if (!sessions || sessions.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const sessionIds = sessions.map((s) => s.Id);

        const { data, error } = await supabase
          .from("Activities")
          .select("*, Category:Categories(Name), Exercise:Exercises(Name, Combinations)")
          .in("TrainingSessionId", sessionIds);

        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [sessions]);

  // Sort sessions by date ascending
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.Date) - new Date(b.Date),
  );

  // Prepare data for Period PieChart (exclude sessions without a Period or with no activities)
  const periodData = sessions.reduce((acc, session) => {
    if (!session.Period) return acc; // skip sessions with no period set

    // Check if this session has any activities
    const hasActivities = activities.some(a => a.TrainingSessionId === session.Id);
    if (!hasActivities) return acc;

    const existing = acc.find((item) => item.name === session.Period);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: session.Period, value: 1 });
    }
    return acc;
  }, []);

  // Prepare data for Category PieChart (from activities)
  const categoryData = buildCategoryChartData(activities);

  // Calculate total duration
  const totalDuration = calcRealDuration(activities);

  // Filter data for selected category
  const categoryActivities = activities;

  const categorySessions = sessions;

  const categoryTotalDuration = calcRealDuration(categoryActivities);

  // Prepare data for Category PieChart (filtered or all)
  const displayCategoryData = categoryData;

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [dayModalSessions, setDayModalSessions] = useState([]);
  const [selectedDayDate, setSelectedDayDate] = useState(null);

  // Category click state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalName, setCategoryModalName] = useState("");
  const [categoryModalSessions, setCategoryModalSessions] = useState([]);

  const handleDayClick = (date, daySessions) => {
    if (daySessions.length === 1) {
      // Optional: If you want to skip modal for single session, uncomment below.
      // However, user asked "queria q seja possivel ver todos" and "diga se foi quando foi o peridoo".
      // Showing the modal always provides better context about the period even for 1 session.
      // onWorkoutClick(daySessions[0]);
      // return;
    }

    if (daySessions.length > 0) {
      setSelectedDayDate(date);
      setDayModalSessions(daySessions);
      setDayModalOpen(true);
    }
  };

  const closeDayModal = () => {
    setDayModalOpen(false);
    setDayModalSessions([]);
    setSelectedDayDate(null);
  };

  const handleCategoryClick = (data) => {
    if (!data || !data.name) return;
    // Find sessions that have at least one activity in this category
    const sessionsWithCategory = sessions.filter((s) =>
      activities.some(
        (a) => a.TrainingSessionId === s.Id && a.Category?.Name === data.name
      )
    );
    setCategoryModalName(data.name);
    setCategoryModalSessions(sessionsWithCategory);
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setCategoryModalName("");
    setCategoryModalSessions([]);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Months
        </button>
        <h2 className="text-2xl font-bold text-white">
          Works in {format(monthDate, "MMMM yyyy")}
        </h2>
      </div>

      {loading && (
        <div className="text-center text-[#B2E642]">Loading details...</div>
      )}

      {!loading && (
        <>
          {/* Month Overview - show when no category is selected or after category details */}
          <div className="bg-[#1f2937] p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Month Overview
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Stats */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="bg-[#111827] p-3 sm:p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2 sm:mb-3">
                    Total Work
                  </p>
                  <div className="grid grid-cols-1 sm:flex sm:flex-row sm:items-center gap-2 sm:gap-3 sm:gap-6">
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#B2E642]">
                        {sessions.length}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">
                        Sessions
                      </p>
                    </div>
                    <div className="hidden sm:block h-6 sm:h-8 w-[1px] bg-gray-700"></div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#B2E642]">
                        {
                          new Set(sessions.map((s) => s.Date.split("T")[0]))
                            .size
                        }
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">
                        Days
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#111827] p-3 sm:p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1 sm:mb-2">
                    Total Duration
                  </p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#B2E642]">
                    {totalDuration} min
                  </p>
                </div>
              </div>

              {/* PieChart */}
              <div className="h-80 sm:h-80 lg:h-96 min-h-[320px] sm:min-h-[320px] lg:min-h-[384px] overflow-visible">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={320}
                >
                  <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      onClick={handleCategoryClick}
                      label={({ percent, value }) =>
                        !isMobile && percent > 0.05
                          ? `${(percent * 100).toFixed(0)}% (${value} min)`
                          : ""
                      }
                      labelLine={false}
                      style={{ fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderColor: "#374151",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    {/* Legend */}
                    <Legend
                      wrapperStyle={{
                        paddingTop: "20px",
                      }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-gray-400 text-sm mt-2">
                Click on a segment to view sessions by category
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Timeline */}
            <div className="bg-[#111827] p-4 sm:p-6 rounded-xl border border-gray-800 shadow-inner">
              <h3 className="text-lg font-bold text-white mb-6 text-center uppercase tracking-widest text-[#B2E642]">
                Training Days
              </h3>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-[10px] font-bold text-gray-500 uppercase">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const year = monthDate.getFullYear();
                  const month = monthDate.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const daysInMonth = lastDay.getDate();

                  // Calculate offset for Monday-start (getDay() returns 0 for Sunday)
                  let startOffset = firstDay.getDay() - 1;
                  if (startOffset === -1) startOffset = 6; // Sunday becomes 6

                  const dayCells = [];

                  // Empty cells for offset
                  for (let i = 0; i < startOffset; i++) {
                    dayCells.push(<div key={`offset-${i}`} className="aspect-square" />);
                  }

                  // Actual days
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dayDate = new Date(year, month, day);
                    const daySessions = sortedSessions.filter(
                      (s) => new Date(s.Date).getDate() === day,
                    );

                    const daySessionsWithActivities = daySessions.filter(s =>
                      activities.some(a => a.TrainingSessionId === s.Id)
                    );

                    const hasWorkout = daySessionsWithActivities.length > 0;

                    dayCells.push(
                      <div
                        key={day}
                        onClick={() =>
                          hasWorkout &&
                          handleDayClick(dayDate, daySessionsWithActivities)
                        }
                        className={`
                        aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all duration-300 border
                        ${hasWorkout
                            ? "bg-gradient-to-br from-[#B2E642] to-[#91c035] text-gray-900 cursor-pointer border-[#B2E642] hover:scale-110 hover:shadow-[0_0_15px_rgba(178,230,66,0.3)] font-bold"
                            : "bg-gray-800/50 text-gray-500 border-gray-700/50"
                          }
                      `}
                      >
                        <span className={`${hasWorkout ? "text-sm" : "text-xs"} font-mono`}>{day}</span>
                        {hasWorkout && (
                          <div className="flex gap-0.5 mt-1">
                            {daySessionsWithActivities.slice(0, 3).map((_, idx) => (
                              <div key={idx} className="w-1.5 h-1.5 rounded-full bg-gray-900 border border-gray-900/20" />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return dayCells;
                })()}
              </div>
              <p className="text-center text-gray-500 text-[10px] mt-6 italic opacity-70">
                Days highlighted in green indicate completed sessions. Tap a day to view details.
              </p>
            </div>

            {/* Period Distribution Pie Chart */}
            <div className="bg-[#111827] p-3 sm:p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-white mb-2">
                Sessions by Period
              </h3>
              <div className="w-full h-64 min-h-[256px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={300}
                  minHeight={256}
                >
                  <PieChart>
                    <Pie
                      data={periodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ percent, value }) =>
                        !isMobile && percent > 0.05
                          ? `${(percent * 100).toFixed(0)}% (${value})`
                          : ""
                      }
                      labelLine={false}
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                    >
                      {periodData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderColor: "#374151",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    {/* Legend */}
                    <Legend
                      wrapperStyle={{
                        paddingTop: "10px",
                      }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Category Sessions Modal */}
      {categoryModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeCategoryModal}
        >
          <div
            className="bg-[#1f2937] rounded-xl border border-gray-700 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {categoryModalName}
                </h2>
                <button
                  onClick={closeCategoryModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {categoryModalSessions.length === 0 ? (
                  <p className="text-gray-400 text-center">No sessions found.</p>
                ) : (
                  categoryModalSessions
                    .slice()
                    .sort((a, b) => new Date(a.Date) - new Date(b.Date))
                    .map((session) => {
                      const sessionActivities = activities.filter(
                        (a) => a.TrainingSessionId === session.Id && a.Category?.Name === categoryModalName
                      );
                      const totalMins = sessionActivities.reduce((sum, a) => sum + (a.DurationMinutes || 0), 0);
                      const dateLabel = new Date(session.Date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                      return (
                        <div
                          key={session.Id}
                          onClick={() => {
                            closeCategoryModal();
                            onWorkoutClick(session);
                          }}
                          className="bg-[#111827] p-4 rounded-lg border border-gray-700 hover:border-[#B2E642] cursor-pointer transition-all group"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col w-full">
                              <span className="text-[#B2E642] font-semibold text-lg">
                                {dateLabel} - {session.Period || "No Period"}
                              </span>
                              <div className="mt-2 space-y-1">
                                {sessionActivities.slice(0, 3).map((a) => (
                                  <div key={a.Id} className="text-gray-300 text-sm flex justify-between">
                                    <span>{a.Exercise?.Name || "Unknown Activity"}</span>
                                    <span className="text-gray-500 text-xs">{a.DurationMinutes}m</span>
                                  </div>
                                ))}
                                {sessionActivities.length > 3 && (
                                  <div className="text-gray-500 text-xs italic">...and more</div>
                                )}
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-gray-500 text-xs">{totalMins} min total</span>
                                <span className="text-gray-500 text-xs">Tap to view details →</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Details Modal */}
      {dayModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeDayModal}
        >
          <div
            className="bg-[#1f2937] rounded-xl border border-gray-700 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {selectedDayDate && format(selectedDayDate, "dd MMMM yyyy")}
                </h2>
                <button
                  onClick={closeDayModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {dayModalSessions.map((session) => (
                  <div
                    key={session.Id}
                    onClick={() => {
                      onWorkoutClick(session);
                      closeDayModal();
                    }}
                    className="bg-[#111827] p-4 rounded-lg border border-gray-700 hover:border-[#B2E642] cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col w-full"> {/* Added w-full */}
                        <span className="text-[#B2E642] font-semibold text-lg">
                          {session.Period || "No Period"}
                        </span>

                        {/* Show activities preview/summary for the session if available in component state or passed down? 
                            The current implementation only passes session object which might not have activities embedded yet 
                            OR it relies on `activities` state which is for the whole month.
                            The `dayModalSessions` contains session objects.
                            Let's check if we can filter `activities` by `session.Id` since we have `activities` state in this component.
                         */}

                        <div className="mt-2 space-y-1">
                          {activities
                            .filter(a => a.TrainingSessionId === session.Id)
                            .slice(0, 3) // Preview first 3
                            .map(a => (
                              <div key={a.Id} className="text-gray-300 text-sm flex justify-between">
                                <span>
                                  {a.Exercise?.Name || "Unkown Activity"}
                                  {a.Variation ? <span className="text-gray-500 text-xs ml-1">({a.Variation})</span> :
                                    (a.Exercise?.Combinations && !a.Variation ? <span className="text-gray-500 text-xs ml-1">({a.Exercise.Combinations})</span> : "")}
                                </span>
                                <span className="text-gray-500 text-xs">{a.DurationMinutes}m</span>
                              </div>
                            ))
                          }
                          {activities.filter(a => a.TrainingSessionId === session.Id).length > 3 && (
                            <div className="text-gray-500 text-xs italic">...and more</div>
                          )}
                        </div>

                        <span className="text-gray-500 text-xs mt-2 text-right">
                          Tap to view full details
                        </span>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 group-hover:text-[#B2E642] transition-colors ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutView;
