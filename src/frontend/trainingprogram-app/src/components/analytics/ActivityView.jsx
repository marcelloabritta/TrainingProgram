import React, { useEffect, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { format, parseISO } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell,
  faClipboardList,
  faFlask,
  faBars,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { generateDayPDF } from "../../utils/generateDayPDF";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { buildCategoryChartData } from "../../utils/calcRealDuration";

const getIconForActivityCategory = (category) => {
  switch (category) {
    case "Physical":
      return faDumbbell;
    case "Tactical":
      return faClipboardList;
    case "Technical":
      return faFlask;
    default:
      return faBars;
  }
};

const COLORS = ["#B2E642", "#3b82f6", "#ef4444", "#f59e0b"];

function ActivityView({ session, onBack, teamName }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("Activities")
          .select(
            "*, Category:Categories (Name), Exercise:Exercises (Name, Combinations)",
          )
          .eq("TrainingSessionId", session.Id);

        if (error) throw error;
        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchActivities();
    }
  }, [session]);

  const handleEditStart = (activity) => {
    setEditingId(activity.Id);
    setEditValue(activity.Observations || "");
  };

  const handleSave = async (id) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("Activities")
        .update({ Observations: editValue })
        .eq("Id", id);

      if (error) throw error;

      setActivities(prev => prev.map(a => a.Id === id ? { ...a, Observations: editValue } : a));
      setEditingId(null);
    } catch (err) {
      alert("Error saving observation: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Prepare data for PieChart
  const pieData = buildCategoryChartData(activities);

  if (loading)
    return (
      <div className="text-center text-white p-10">Loading activities...</div>
    );
  if (error)
    return <div className="text-center text-red-500 p-10">{error}</div>;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 w-fit flex-shrink-0 group"
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
            <span className="whitespace-nowrap">Back to Analytics</span>
          </button>
          
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {format(parseISO(session.Date), "EEEE, d MMM")} - {session.Period}
          </h2>
        </div>
        
        <button
          onClick={() => generateDayPDF(parseISO(session.Date), [{ ...session, Activities: activities }], teamName)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#B2E642] hover:bg-[#a1d13b] text-black font-bold py-3 md:py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95"
        >
          <FontAwesomeIcon icon={faFilePdf} />
          <span className="text-sm uppercase tracking-wider">Create Report</span>
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center text-gray-400 p-10 bg-[#1f2937] rounded-xl border border-dashed border-gray-600">
          No activities recorded for this session.
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <div className="bg-[#1f2937] p-4 sm:p-6 lg:p-8 rounded-xl border border-gray-800 w-full flex flex-col">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 text-center">
              Duration by Category
            </h3>
            <div className="h-64 sm:h-72 lg:h-80 min-h-[256px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 50 : 60}
                    outerRadius={isMobile ? 70 : 80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={isMobile ? false : ({ percent, value }) =>
                      percent > 0.05
                        ? `${(percent * 100).toFixed(0)}% (${value} min)`
                        : ""
                    }
                    labelLine={!isMobile}
                  >
                    {pieData.map((entry, index) => (
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
                    formatter={(value, name) => [
                      `${value} min (${pieData.length > 0 ? ((value / pieData.reduce((s, d) => s + d.value, 0)) * 100).toFixed(1) : 0}%)`,
                      name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "8px" }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* List Section */}
          <div className="grid grid-cols-1 gap-3">
            {activities.map((activity) => {
              const categoryName = activity.Category
                ? activity.Category.Name
                : "Unknown";
              const exerciseName = activity.Exercise
                ? activity.Exercise.Name
                : "Unnamed activity";
              
              const isEditing = editingId === activity.Id;

              return (
                <div
                  key={activity.Id}
                  className="flex flex-col gap-3 bg-[#1f2937] p-4 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-[#B2E642]">
                      <FontAwesomeIcon
                        icon={getIconForActivityCategory(categoryName)}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white line-clamp-1">
                        {exerciseName}
                      </h3>
                      {(activity.Variation || activity.Exercise?.Combinations) && (
                        <p className="text-xs text-gray-500 italic mb-1">
                          {activity.Variation || activity.Exercise.Combinations}
                        </p>
                      )}
                      <p className="text-gray-400 text-sm">
                        {categoryName} •{" "}
                        <span className="text-[#B2E642]">
                          {activity.DurationMinutes} min
                        </span>
                      </p>
                    </div>

                    {!isEditing && (
                      <button 
                        onClick={() => handleEditStart(activity)}
                        className="text-xs text-[#B2E642]/60 hover:text-[#B2E642] font-bold uppercase tracking-wider underline decoration-dotted underline-offset-4"
                      >
                        {activity.Observations ? "Edit Observation" : "Add Observation"}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex flex-col gap-2 mt-2">
                      <textarea
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Type observations here..."
                        className="w-full bg-black/30 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:border-[#B2E642] outline-none min-h-[80px]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={saving}
                          className="px-4 py-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={() => handleSave(activity.Id)}
                          disabled={saving}
                          className="px-4 py-1.5 text-xs font-bold bg-[#B2E642] text-black rounded-lg hover:bg-[#a1d13b] transition-all disabled:opacity-50"
                        >
                          {saving ? "SAVING..." : "SAVE OBSERVATION"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    activity.Observations && (
                      <div className="mt-1 p-3 bg-black/20 rounded-lg border-l-4 border-[#B2E642] text-sm text-gray-300 italic">
                        <span className="text-gray-500 font-bold block text-[10px] uppercase tracking-widest mb-1">Observations</span>
                        {activity.Observations}
                      </div>
                    )
                  )}

                  {activity.CombinedGroupId && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] bg-[#B2E642]/15 text-[#B2E642] rounded px-1.5 py-0.5 font-semibold tracking-wide">
                        COMBINED
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ActivityView;
