import React, { useEffect, useState } from 'react';
import { useHeader } from '../context/HeaderContext';
import { supabase } from '../config/supabaseClient';
import MonthView from '../components/analytics/MonthView';
import WorkoutView from '../components/analytics/WorkoutView';
import ActivityView from '../components/analytics/ActivityView';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const VIEW_MODES = {
    MONTHS: 'MONTHS',
    WORKOUTS: 'WORKOUTS',
    ACTIVITIES: 'ACTIVITIES'
};

const COLORS = ['#B2E642', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];

function Analytics({ session }) {
    const { setTitle } = useHeader();
    const [viewMode, setViewMode] = useState(VIEW_MODES.MONTHS);

    // Data State
    const [plans, setPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [planActivities, setPlanActivities] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Drill-down State
    const [selectedMonthDate, setSelectedMonthDate] = useState(null);
    const [selectedMonthSessions, setSelectedMonthSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        setTitle('Analytics');
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
                    .order('Year', { ascending: false });

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
                    const sessionIds = data.map(s => s.Id);
                    const { data: activitiesData, error: activitiesError } = await supabase
                        .from("Activities")
                        .select("*, Category:Categories(Name), Exercise:Exercises(Name, Combinations)")
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
        setSelectedCategory(null);
    };

    const handleCategoryClick = (data) => {
        if (!selectedCategory) {
            setSelectedCategory(data.name);
        }
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
    };

    // Prepare data for overview PieChart
    const filteredActivities = selectedCategory
        ? planActivities.filter(a => a.Category?.Name === selectedCategory)
        : planActivities;

    const chartData = filteredActivities.reduce((acc, activity) => {
        let name = selectedCategory
            ? (activity.Exercise?.Name || "Unknown")
            : (activity.Category?.Name || "Unknown");

        // If it's a combined/game system item, include its specific combination in the name for uniqueness in the chart
        if (selectedCategory && activity.Exercise?.Combinations) {
            name = `${name} (${activity.Exercise.Combinations})`;
        }

        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.value += activity.DurationMinutes;
        } else {
            acc.push({ name: name, value: activity.DurationMinutes });
        }
        return acc;
    }, []);

    const totalSessions = selectedCategory
        ? new Set(filteredActivities.map(a => a.TrainingSessionId)).size
        : sessions.length;

    const totalDuration = filteredActivities.reduce((sum, activity) => sum + (activity.DurationMinutes || 0), 0);

    const uniqueDaysCount = selectedCategory
        ? new Set(filteredActivities.map(a => {
            const session = sessions.find(s => s.Id === a.TrainingSessionId);
            return session ? session.Date.split('T')[0] : null;
        }).filter(Boolean)).size
        : new Set(sessions.map(s => s.Date.split('T')[0])).size;

    if (loading && viewMode === VIEW_MODES.MONTHS && !selectedPlanId && plans.length === 0) {
        if (plans.length === 0 && !loading) return <div className="text-center text-white p-10">No plans found. Create a plan first.</div>;
    }

    return (
        <div className="container mx-auto p-4 pb-20 flex flex-col gap-6">
            {/* Plan Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#1f2937] p-4 rounded-xl border border-gray-700">
                <label className="text-white font-semibold text-sm">Plan:</label>
                <select
                    value={selectedPlanId || ''}
                    onChange={handlePlanChange}
                    className="w-full sm:flex-1 sm:min-w-[300px] bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#B2E642] focus:border-transparent outline-none"
                >
                    {plans.map(plan => (
                        <option key={plan.Id} value={plan.Id}>
                            {plan.TeamName} ({plan.Year})
                        </option>
                    ))}
                </select>
            </div>

            {loading && <div className="text-center text-[#B2E642]">Loading data...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            {!loading && !error && (
                <>
                    {/* Plan Overview - only show on MONTHS view */}
                    {viewMode === VIEW_MODES.MONTHS && chartData.length > 0 && (
                        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">
                                    {selectedCategory ? `Plan Overview: ${selectedCategory}` : "Plan Overview"}
                                </h3>
                                {selectedCategory && (
                                    <button
                                        onClick={handleBackToCategories}
                                        className="text-sm text-[#B2E642] hover:underline flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                        Back to Overview
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Stats */}
                                <div className="flex flex-col gap-4">
                                    <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                                        <p className="text-gray-400 text-sm mb-2">Total Work</p>
                                        <div className="flex items-center gap-6 mt-1">
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-4xl font-bold text-[#B2E642]">{totalSessions}</p>
                                                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Sessions</p>
                                            </div>
                                            <div className="h-8 w-[1px] bg-gray-700"></div>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-4xl font-bold text-[#B2E642]">{uniqueDaysCount}</p>
                                                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Days</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                                        <p className="text-gray-400 text-sm mb-1">Total Duration</p>
                                        <p className="text-4xl font-bold text-[#B2E642]">{totalDuration} min</p>
                                    </div>
                                </div>

                                {/* PieChart */}
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                                onClick={handleCategoryClick}
                                                style={{ fontSize: '14px', fontWeight: 'bold', cursor: selectedCategory ? 'default' : 'pointer' }}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend
                                                wrapperStyle={{ paddingTop: '20px' }}
                                                iconType="circle"
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Active Combinations List (only in drill-down) */}
                            {selectedCategory && filteredActivities.some(a => a.Exercise?.Combinations) && (
                                <div className="mt-8 border-t border-gray-700 pt-6">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                        Combinations in this Plan
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Array.from(new Set(filteredActivities
                                            .filter(a => a.Exercise?.Combinations)
                                            .map(a => JSON.stringify({
                                                ex: a.Exercise.Name,
                                                comb: a.Exercise.Combinations
                                            }))
                                        )).map(itemJson => {
                                            const item = JSON.parse(itemJson);
                                            return (
                                                <div key={itemJson} className="bg-[#111827] p-3 rounded-lg border border-gray-800">
                                                    <p className="text-[#B2E642] text-xs font-bold uppercase">{item.ex}</p>
                                                    <p className="text-white text-sm mt-1 italic">{item.comb}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === VIEW_MODES.MONTHS && (
                        <MonthView
                            sessions={sessions}
                            onMonthClick={handleMonthClick}
                        />
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
        </div>
    );
}

export default Analytics;
