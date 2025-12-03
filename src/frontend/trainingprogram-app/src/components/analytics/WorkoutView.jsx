import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { supabase } from '../../config/supabaseClient';

const COLORS = ['#B2E642', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];

function WorkoutView({ sessions, monthDate, onBack, onWorkoutClick }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

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
                const sessionIds = sessions.map(s => s.Id);

                const { data, error } = await supabase
                    .from("Activities")
                    .select("*, Category:Categories(Name)")
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

    // Sort sessions by date ascending for the chart
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.Date) - new Date(b.Date));

    // Prepare data for BarChart
    const barChartData = sortedSessions.map(session => {
        return {
            ...session,
            day: format(parseISO(session.Date), 'd'),
            fullDate: format(parseISO(session.Date), 'MMM d'),
            value: 1 // Just to show a bar
        };
    });

    // Prepare data for Period PieChart
    const periodData = sessions.reduce((acc, session) => {
        const period = session.Period || "Unknown";
        const existing = acc.find(item => item.name === period);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: period, value: 1 });
        }
        return acc;
    }, []);

    // Prepare data for Category PieChart (from activities)
    const categoryData = activities.reduce((acc, activity) => {
        const categoryName = activity.Category ? activity.Category.Name : "Unknown";
        const existing = acc.find(item => item.name === categoryName);
        if (existing) {
            existing.value += activity.DurationMinutes;
        } else {
            acc.push({ name: categoryName, value: activity.DurationMinutes });
        }
        return acc;
    }, []);

    // Calculate total duration
    const totalDuration = activities.reduce((sum, activity) => sum + (activity.DurationMinutes || 0), 0);

    const handleClick = (data) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            onWorkoutClick(data.activePayload[0].payload);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-[#1f2937] p-3 border border-gray-700 rounded shadow-lg">
                    <p className="text-white font-semibold">{data.fullDate}</p>
                    <p className="text-[#B2E642]">{data.Period}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onBack}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Months
                </button>
                <h2 className="text-2xl font-bold text-white">
                    Workouts in {format(monthDate, 'MMMM yyyy')}
                </h2>
            </div>

            {loading && <div className="text-center text-[#B2E642]">Loading details...</div>}

            {!loading && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
                            <h3 className="text-gray-400 text-sm mb-2">Total Workouts</h3>
                            <p className="text-4xl font-bold text-[#B2E642]">{sessions.length}</p>
                        </div>
                        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
                            <h3 className="text-gray-400 text-sm mb-2">Total Duration</h3>
                            <p className="text-4xl font-bold text-[#B2E642]">{totalDuration} min</p>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Timeline Bar Chart */}
                        <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 h-[50vh]">
                            <h3 className="text-lg font-semibold text-white mb-2 text-center">Timeline</h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={barChartData} onClick={handleClick} cursor="pointer">
                                    <XAxis
                                        dataKey="day"
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af' }}
                                        tickLine={{ stroke: '#4b5563' }}
                                        label={{ value: 'Day', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                                    />
                                    <YAxis hide={true} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(178, 230, 66, 0.1)' }} />
                                    <Bar dataKey="value" fill="#B2E642" radius={[4, 4, 0, 0]}>
                                        {barChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill="#B2E642" className="hover:opacity-80 transition-opacity cursor-pointer" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <p className="text-center text-gray-500 text-sm mt-2">Click on a bar to view details</p>
                        </div>

                        {/* Period Distribution Pie Chart */}
                        <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 h-[60vh] flex flex-col items-center justify-center">
                            <h3 className="text-lg font-semibold text-white mb-2">Sessions by Period</h3>
                            <ResponsiveContainer width="100%" height="90%">
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
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {periodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '10px' }}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Category Distribution Pie Chart */}
                        {categoryData.length > 0 && (
                            <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 h-[60vh] flex flex-col items-center justify-center lg:col-span-2">
                                <h3 className="text-lg font-semibold text-white mb-2">Duration by Category</h3>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
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
                                            wrapperStyle={{ paddingTop: '10px' }}
                                            iconType="circle"
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default WorkoutView;
