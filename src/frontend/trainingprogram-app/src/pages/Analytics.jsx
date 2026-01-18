import React, { useEffect, useState } from "react";
import { useHeader } from "../context/HeaderContext";
import { supabase } from "../config/supabaseClient";
import MonthView from "../components/analytics/MonthView";
import WorkoutView from "../components/analytics/WorkoutView";
import ActivityView from "../components/analytics/ActivityView";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const VIEW_MODES = {
  MONTHS: "MONTHS",
  WORKOUTS: "WORKOUTS",
  ACTIVITIES: "ACTIVITIES",
};

const COLORS = ["#B2E642", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6"];

function Analytics({ session }) {
  const { setTitle } = useHeader();
  const [viewMode, setViewMode] = useState(VIEW_MODES.MONTHS);

  // Data State
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [planActivities, setPlanActivities] = useState([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [modalCategoryData, setModalCategoryData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Drill-down State
  const [selectedMonthDate, setSelectedMonthDate] = useState(null);
  const [selectedMonthSessions, setSelectedMonthSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    setTitle("Analytics");
  }, [setTitle]);

  // 1. Fetch Plans (Macrocycles)
  useEffect(() => {
    const fetchPlans = async () => {
      const user = session?.user;
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("Macrocycles")
          .select("Id, TeamName, Year")
          .eq("UserId", user.id)
          .order("Year", { ascending: false });

        if (error) throw error;
        setPlans(data);

        if (data.length > 0) {
          setSelectedPlanId(data[0].Id);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Could not load plans.");
      }
    };

    fetchPlans();
  }, [session]);

  // 2. Fetch Sessions and Activities for Selected Plan
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPlanId) {
        setSessions([]);
        setPlanActivities([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("TrainingSessions")
          .select("Id, Date, Period, Microcycles!inner(MacrocycleId)")
          .eq("Microcycles.MacrocycleId", selectedPlanId);

        if (error) throw error;
        setSessions(data);

        // Fetch all activities for this plan
        if (data.length > 0) {
          const sessionIds = data.map((s) => s.Id);
          const { data: activitiesData, error: activitiesError } =
            await supabase
              .from("Activities")
              .select(
                "*, Category:Categories(Name), Exercise:Exercises(Name, Combinations)",
              )
              .in("TrainingSessionId", sessionIds);

          if (activitiesError) throw activitiesError;
          setPlanActivities(activitiesData || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPlanId]);

  const handleMonthClick = (monthDate, monthSessions) => {
    setSelectedMonthDate(monthDate);
    setSelectedMonthSessions(monthSessions);
    setViewMode(VIEW_MODES.WORKOUTS);
  };

  const handleWorkoutClick = (session) => {
    setSelectedSession(session);
    setViewMode(VIEW_MODES.ACTIVITIES);
  };

  const handleBackToMonths = () => {
    setViewMode(VIEW_MODES.MONTHS);
    setSelectedMonthDate(null);
    setSelectedMonthSessions([]);
  };

  const handleBackToWorkouts = () => {
    setViewMode(VIEW_MODES.WORKOUTS);
    setSelectedSession(null);
  };

  const handlePlanChange = (e) => {
    setSelectedPlanId(e.target.value);
    setViewMode(VIEW_MODES.MONTHS);
    setSelectedMonthDate(null);
    setSelectedMonthSessions([]);
  };

  const handleCategoryClick = (data) => {
    if (data && data.name) {
      setModalCategoryData(data);
      setShowCategoryModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowCategoryModal(false);
    setModalCategoryData(null);
  };

  // Prepare data for plan overview (unfiltered)
  const planChartData = planActivities.reduce((acc, activity) => {
    const name = activity.Category?.Name || "Unknown";

    const existing = acc.find((item) => item.name === name);
    if (existing) {
      existing.value += activity.DurationMinutes;
    } else {
      acc.push({ name: name, value: activity.DurationMinutes });
    }
    return acc;
  }, []);

  const planTotalSessions = sessions.length;
  const planTotalDuration = planActivities.reduce(
    (sum, activity) => sum + (activity.DurationMinutes || 0),
    0,
  );
  const planUniqueDaysCount = new Set(sessions.map((s) => s.Date.split("T")[0]))
    .size;

  if (
    loading &&
    viewMode === VIEW_MODES.MONTHS &&
    !selectedPlanId &&
    plans.length === 0
  ) {
    if (plans.length === 0 && !loading)
      return (
        <div className="text-center text-white p-10">
          No plans found. Create a plan first.
        </div>
      );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 pb-20 flex flex-col gap-4 sm:gap-6">
      {/* Plan Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#1f2937] p-4 rounded-xl border border-gray-700">
        <label className="text-white font-semibold text-sm">Plan:</label>
        <select
          value={selectedPlanId || ""}
          onChange={handlePlanChange}
          className="w-full sm:flex-1 sm:min-w-[300px] bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#B2E642] focus:border-transparent outline-none"
        >
          {plans.map((plan) => (
            <option key={plan.Id} value={plan.Id}>
              {plan.TeamName} ({plan.Year})
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center text-[#B2E642]">Loading data...</div>
      )}
      {error && <div className="text-center text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          {/* Plan Overview */}
          {viewMode === VIEW_MODES.MONTHS && planChartData.length > 0 && (
            <div className="bg-[#1f2937] p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-700">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-xl font-bold text-white">Plan Overview</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Stats */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="bg-[#111827] p-3 sm:p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2 sm:mb-3">
                      Total Work
                    </p>
                    <div className="grid grid-cols-1 sm:flex sm:flex-row sm:items-center gap-2 sm:gap-3 sm:gap-6">
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#B2E642]">
                          {planTotalSessions}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">
                          Sessions
                        </p>
                      </div>
                      <div className="hidden sm:block h-6 sm:h-8 w-[1px] bg-gray-700"></div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#B2E642]">
                          {planUniqueDaysCount}
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
                      {planTotalDuration} min
                    </p>
                  </div>
                </div>

                {/* PieChart */}
                <div className="h-72 sm:h-80 lg:h-96 min-h-[288px] sm:min-h-[320px] lg:min-h-[384px]">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={300}
                    minHeight={288}
                  >
                    <PieChart>
                      <Pie
                        data={planChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value, percent }) =>
                          !isMobile
                            ? `${(percent * 100).toFixed(0)}% (${value} min)`
                            : ""
                        }
                        labelLine={false}
                        onClick={handleCategoryClick}
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        {planChartData.map((entry, index) => (
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
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value, name) => [
                          isMobile
                            ? `${value} min (${((value / planTotalDuration) * 100).toFixed(1)}%)`
                            : `${value} min`,
                          name,
                        ]}
                      />
                      {/* Legend */}
                      <Legend
                        wrapperStyle={{
                          paddingTop: "20px",
                        }}
                        iconType="circle"
                        formatter={(value, entry) => {
                          // Quebrar nomes longos
                          const maxLength = isMobile ? 15 : 25;
                          const displayName =
                            value.length > maxLength
                              ? value.substring(0, maxLength) + "..."
                              : value;
                          return displayName;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {!showCategoryModal && (
                    <p className="text-center text-gray-400 text-sm mt-2">
                      Click on a segment to view category details
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === VIEW_MODES.MONTHS && (
            <MonthView sessions={sessions} onMonthClick={handleMonthClick} />
          )}

          {viewMode === VIEW_MODES.WORKOUTS && (
            <WorkoutView
              sessions={selectedMonthSessions}
              monthDate={selectedMonthDate}
              onBack={handleBackToMonths}
              onWorkoutClick={handleWorkoutClick}
            />
          )}

          {viewMode === VIEW_MODES.ACTIVITIES && (
            <ActivityView
              session={selectedSession}
              onBack={handleBackToWorkouts}
            />
          )}
        </>
      )}

      {/* Category Details Modal */}
      {showCategoryModal && modalCategoryData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1f2937] rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {modalCategoryData.name} Details
                </h2>
                <button
                  onClick={handleCloseModal}
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

              {/* Category Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Total Duration</p>
                  <p className="text-3xl font-bold text-[#B2E642]">
                    {modalCategoryData.value} min
                  </p>
                </div>
                <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Percentage</p>
                  <p className="text-3xl font-bold text-[#B2E642]">
                    {planChartData.length > 0
                      ? (
                          (modalCategoryData.value /
                            planChartData.reduce(
                              (sum, item) => sum + item.value,
                              0,
                            )) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>

              {/* Additional Stats */}
              {(() => {
                const categoryActivities = planActivities.filter(
                  (a) => a.Category?.Name === modalCategoryData.name,
                );
                const categorySessions = sessions.filter((session) =>
                  categoryActivities.some(
                    (activity) => activity.TrainingSessionId === session.Id,
                  ),
                );
                const uniqueDays = new Set(
                  categorySessions.map((s) => s.Date.split("T")[0]),
                ).size;
                const avgPerSession =
                  categorySessions.length > 0
                    ? (
                        modalCategoryData.value / categorySessions.length
                      ).toFixed(1)
                    : 0;
                const avgPerDay =
                  uniqueDays > 0
                    ? (modalCategoryData.value / uniqueDays).toFixed(1)
                    : 0;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#111827] p-3 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-xs mb-1">Sessions</p>
                      <p className="text-xl font-bold text-[#B2E642]">
                        {categorySessions.length}
                      </p>
                    </div>
                    <div className="bg-[#111827] p-3 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-xs mb-1">Avg/Session</p>
                      <p className="text-xl font-bold text-[#B2E642]">
                        {avgPerSession} min
                      </p>
                    </div>
                    <div className="bg-[#111827] p-3 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-xs mb-1">Avg/Day</p>
                      <p className="text-xl font-bold text-[#B2E642]">
                        {avgPerDay} min
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Detailed Breakdown */}
              <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Breakdown by Exercise
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const categoryActivities = planActivities.filter(
                      (a) => a.Category?.Name === modalCategoryData.name,
                    );
                    const exerciseBreakdown = categoryActivities.reduce(
                      (acc, activity) => {
                        const exerciseName =
                          activity.Exercise?.Name || "Unknown";
                        if (!acc[exerciseName]) {
                          acc[exerciseName] = 0;
                        }
                        acc[exerciseName] += activity.DurationMinutes;
                        return acc;
                      },
                      {},
                    );

                    return Object.entries(exerciseBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([exercise, duration]) => (
                        <div
                          key={exercise}
                          className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
                        >
                          <span className="text-gray-300">{exercise}</span>
                          <span className="text-[#B2E642] font-semibold">
                            {duration} min
                          </span>
                        </div>
                      ));
                  })()}
                </div>
              </div>

              {/* Monthly Distribution */}
              <div className="bg-[#111827] p-4 rounded-lg border border-gray-700 mt-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Monthly Distribution
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const categoryActivities = planActivities.filter(
                      (a) => a.Category?.Name === modalCategoryData.name,
                    );

                    // Group by month
                    const monthlyData = categoryActivities.reduce(
                      (acc, activity) => {
                        // Find the session to get the date
                        const session = sessions.find(
                          (s) => s.Id === activity.TrainingSessionId,
                        );
                        if (!session) return acc;

                        const date = new Date(session.Date);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                        const monthName = date.toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        });

                        if (!acc[monthKey]) {
                          acc[monthKey] = {
                            name: monthName,
                            value: 0,
                            sessions: 0,
                          };
                        }
                        acc[monthKey].value += activity.DurationMinutes;
                        acc[monthKey].sessions += 1;
                        return acc;
                      },
                      {},
                    );

                    const monthlyArray = Object.values(monthlyData).sort(
                      (a, b) => a.name.localeCompare(b.name),
                    );

                    // Calculate trend
                    const totalMonths = monthlyArray.length;
                    const firstHalf = monthlyArray.slice(
                      0,
                      Math.ceil(totalMonths / 2),
                    );
                    const secondHalf = monthlyArray.slice(
                      Math.ceil(totalMonths / 2),
                    );

                    const firstHalfAvg =
                      firstHalf.length > 0
                        ? firstHalf.reduce(
                            (sum, month) => sum + month.value,
                            0,
                          ) / firstHalf.length
                        : 0;
                    const secondHalfAvg =
                      secondHalf.length > 0
                        ? secondHalf.reduce(
                            (sum, month) => sum + month.value,
                            0,
                          ) / secondHalf.length
                        : 0;

                    const trend =
                      secondHalfAvg > firstHalfAvg
                        ? "📈 Increasing"
                        : secondHalfAvg < firstHalfAvg
                          ? "📉 Decreasing"
                          : "➡️ Stable";

                    return (
                      <>
                        <div className="text-center mb-4">
                          <span className="text-sm text-gray-400">Trend: </span>
                          <span className="text-[#B2E642] font-semibold">
                            {trend}
                          </span>
                        </div>
                        {monthlyArray.map((month) => (
                          <div
                            key={month.name}
                            className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
                          >
                            <div className="flex flex-col">
                              <span className="text-gray-300 font-medium">
                                {month.name}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {month.sessions} session
                                {month.sessions !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <span className="text-[#B2E642] font-semibold">
                              {month.value} min
                            </span>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
              {(() => {
                const categoryActivities = planActivities.filter(
                  (a) => a.Category?.Name === modalCategoryData.name,
                );
                const combinations = Array.from(
                  new Set(
                    categoryActivities
                      .filter((a) => a.Exercise?.Combinations)
                      .map((a) => a.Exercise.Combinations),
                  ),
                );

                if (combinations.length > 0) {
                  return (
                    <div className="bg-[#111827] p-4 rounded-lg border border-gray-700 mt-4">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Training Combinations
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {combinations.map((combo, index) => (
                          <div
                            key={index}
                            className="bg-gray-800 p-3 rounded border border-gray-600"
                          >
                            <p className="text-gray-300 italic">{combo}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
