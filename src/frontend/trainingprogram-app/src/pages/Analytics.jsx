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
                        .select("*, Category:Categories(Name)")
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

    // Prepare data for overview PieChart
    const categoryData = planActivities.reduce((acc, activity) => {
        const categoryName = activity.Category ? activity.Category.Name : "Unknown";
        const existing = acc.find(item => item.name === categoryName);
        if (existing) {
            existing.value += activity.DurationMinutes;
        } else {
            acc.push({ name: categoryName, value: activity.DurationMinutes });
        }
        return acc;
    }, []);

    const totalDuration = planActivities.reduce((sum, activity) => sum + (activity.DurationMinutes || 0), 0);

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
                    {viewMode === VIEW_MODES.MONTHS && categoryData.length > 0 && (
                        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4">Plan Overview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Stats */}
                                <div className="flex flex-col gap-4">
                                    <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                                        <p className="text-gray-400 text-sm mb-1">Total Workouts</p>
                                        <p className="text-4xl font-bold text-[#B2E642]">{sessions.length}</p>
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
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                                style={{ fontSize: '14px', fontWeight: 'bold', fill: '#fff' }}
                                            >
                                                {categoryData.map((entry, index) => (
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
