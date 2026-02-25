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
import { calcRealDuration, buildCategoryChartData } from "../utils/calcRealDuration";
import { format, addWeeks, subDays } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faChevronLeft, faChevronRight, faCalendarAlt, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";

const VIEW_MODES = {
  MONTHS: "MONTHS",
  WORKOUTS: "WORKOUTS",
  ACTIVITIES: "ACTIVITIES",
};

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
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Period Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
          .select("*, Microcycles(*)")
          .eq("UserId", user.id)
          .order("Year", { ascending: false });

        if (error) throw error;

        // Process plans to get full range
        const processedPlans = data.map(plan => {
          // Primary: Microcycle dates — always set when a plan is created
          const microDates = plan.Microcycles?.flatMap(m => [
            m.StartDate && new Date(m.StartDate + "T00:00:00"),
            m.EndDate && new Date(m.EndDate + "T23:59:59")
          ]).filter(d => d instanceof Date && !isNaN(d)) || [];

          // Secondary: StartDate + Duration from the Macrocycle record
          let calcStart = plan.StartDate ? new Date(plan.StartDate + "T00:00:00") : null;
          let calcEnd = null;
          if (calcStart && plan.Duration) {
            calcEnd = subDays(addWeeks(calcStart, plan.Duration), 1);
          }

          // Priority: Microcycles → StartDate+Duration → Year fallback
          const finalStart = microDates.length > 0
            ? new Date(Math.min(...microDates))
            : (calcStart || new Date(plan.Year, 0, 1));

          const finalEnd = microDates.length > 0
            ? new Date(Math.max(...microDates))
            : (calcEnd || new Date(plan.Year, 11, 31));

          return {
            ...plan,
            FullStartDate: format(finalStart, "yyyy-MM-dd"),
            FullEndDate: format(finalEnd, "yyyy-MM-dd")
          };
        });

        setPlans(processedPlans);

        if (processedPlans.length > 0) {
          const defaultPlan = processedPlans[0];
          setSelectedPlanId(defaultPlan.Id);
          // Set initial range to full plan
          setStartDate(defaultPlan.FullStartDate);
          setEndDate(defaultPlan.FullEndDate);
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

  // Period Filtering Logic
  const filteredSessions = sessions.filter((s) => {
    if (!startDate && !endDate) return true;
    const sessionDate = new Date(s.Date + "T00:00:00"); // Ensure local date
    if (startDate && sessionDate < new Date(startDate + "T00:00:00")) return false;
    if (endDate && sessionDate > new Date(endDate + "T23:59:59")) return false;
    return true;
  });

  const filteredActivities = planActivities.filter((a) =>
    filteredSessions.some((s) => s.Id === a.TrainingSessionId)
  );

  // Quick Filters
  const setLast30Days = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(now, "yyyy-MM-dd"));
  };

  const setLast90Days = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 89);
    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(now, "yyyy-MM-dd"));
  };

  // Helper to check active filter states
  const now = new Date();
  const last30Start = format(new Date(new Date().setDate(new Date().getDate() - 29)), "yyyy-MM-dd");
  const last30End = format(now, "yyyy-MM-dd");
  const last90Start = format(new Date(new Date().setDate(new Date().getDate() - 89)), "yyyy-MM-dd");
  const last90End = format(now, "yyyy-MM-dd");

  const currentPlan = plans.find(p => p.Id === selectedPlanId);
  const isLast30Active = startDate === last30Start && endDate === last30End;
  const isLast90Active = startDate === last90Start && endDate === last90End;
  const isFullPlanActive = currentPlan && startDate === currentPlan.FullStartDate && endDate === currentPlan.FullEndDate;

  const clearFilter = () => {
    const currentPlan = plans.find(p => p.Id === selectedPlanId);
    if (currentPlan && currentPlan.FullStartDate && currentPlan.FullEndDate) {
      setStartDate(currentPlan.FullStartDate);
      setEndDate(currentPlan.FullEndDate);
    } else if (currentPlan) {
      // Fallback if dates are missing in plan object
      setStartDate(currentPlan.FullStartDate || "");
      setEndDate(currentPlan.FullEndDate || "");
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

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
    const newPlanId = e.target.value;
    setSelectedPlanId(newPlanId);

    // Also update dates to full plan range of the new plan
    const newPlan = plans.find(p => p.Id === newPlanId);
    if (newPlan) {
      if (newPlan.FullStartDate) setStartDate(newPlan.FullStartDate);
      if (newPlan.FullEndDate) setEndDate(newPlan.FullEndDate);
    }

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

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const currentPlan = plans.find((p) => p.Id === selectedPlanId);
      const teamName = currentPlan?.TeamName || "Unknown Team";
      const year = currentPlan?.Year || "Unknown Year";
      const timestamp = format(new Date(), "dd/MM/yyyy HH:mm");

      // Filtered range text
      let periodText = "Full Macrocycle";
      if (startDate || endDate) {
        try {
          const startStr = startDate ? format(new Date(startDate + "T00:00:00"), "dd/MM/yyyy") : "...";
          const endStr = endDate ? format(new Date(endDate + "T00:00:00"), "dd/MM/yyyy") : "...";
          periodText = `${startStr} - ${endStr}`;
        } catch (e) {
          console.error("Error formatting dates for PDF:", e);
        }
      }

      // Header
      doc.setFontSize(24);
      doc.setTextColor(31, 41, 55);
      doc.text("TRAINING PROGRAM REPORT", 14, 22);

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Team: ${teamName}`, 14, 30);
      doc.text(`Macrocycle: ${year}`, 14, 36);
      doc.setTextColor(178, 230, 66); // Use a visible theme color (greenish)
      doc.setFont(undefined, 'bold');
      doc.text(`Period: ${periodText}`, 14, 42);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      doc.text(`Generated: ${timestamp}`, 14, 48);

      // 1. Overall Summary
      autoTable(doc, {
        startY: 55,
        head: [["Period Total Sessions", "Period Total Days", "Period Total Minutes"]],
        body: [[planTotalSessions, planUniqueDaysCount, `${planTotalDuration} min`]],
        theme: 'grid',
        headStyles: { fillColor: [178, 230, 66], textColor: [0, 0, 0], fontStyle: 'bold' },
      });

      // 2. Category Distribution
      doc.setFontSize(18);
      doc.setTextColor(31, 41, 55);
      doc.text("Category Distribution", 14, doc.lastAutoTable.finalY + 15);

      const catSummaryBody = planChartData.map(cat => [
        cat.name,
        `${cat.value} min`,
        planTotalDuration > 0 ? `${((cat.value / planTotalDuration) * 100).toFixed(1)}%` : "0%"
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 22,
        head: [["Category", "Total Duration", "Percentage"]],
        body: catSummaryBody,
        theme: 'striped',
        headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] },
      });

      // 3. Aggregate Data by Month
      const monthsData = {};
      const sortedFilteredSessions = [...filteredSessions].sort((a, b) => new Date(a.Date) - new Date(b.Date));

      sortedFilteredSessions.forEach(session => {
        if (!session.Date) return;
        const date = new Date(session.Date + "T00:00:00");
        if (isNaN(date.getTime())) return;

        const monthKey = format(date, "MMMM yyyy");
        const monthSort = date.getFullYear() * 12 + date.getMonth();
        if (!monthsData[monthKey]) {
          monthsData[monthKey] = { name: monthKey, sort: monthSort, sessionCount: 0, totalMinutes: 0, categories: {} };
        }
        monthsData[monthKey].sessionCount++;
        const sessionActivities = filteredActivities.filter(a => a.TrainingSessionId === session.Id);
        monthsData[monthKey].totalMinutes += calcRealDuration(sessionActivities);
        buildCategoryChartData(sessionActivities).forEach(cat => {
          if (!monthsData[monthKey].categories[cat.name]) monthsData[monthKey].categories[cat.name] = 0;
          monthsData[monthKey].categories[cat.name] += cat.value;
        });
      });

      const sortedMonths = Object.values(monthsData).sort((a, b) => a.sort - b.sort);
      const masterTableBody = sortedMonths.map(m => [
        m.name,
        m.sessionCount,
        `${m.totalMinutes} min`,
        Object.entries(m.categories).sort(([, a], [, b]) => b - a).map(([name, mins]) => `${name}: ${mins}min`).join('\n')
      ]);

      let currentY = doc.lastAutoTable.finalY;
      if (currentY > 200) {
        doc.addPage();
        currentY = 22;
      } else {
        currentY += 10;
      }

      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55);
      doc.text("Training Performance by Month", 14, currentY);

      autoTable(doc, {
        startY: currentY + 7,
        head: [["Month", "Sessions", "Total Time", "Category Breakdown (Duration)"]],
        body: masterTableBody,
        theme: 'grid',
        headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: { 3: { cellWidth: 'auto', fontSize: 9 } }
      });

      // 4. Exercise Performance Ranking
      const exerciseMinutes = {};
      filteredActivities.forEach(a => {
        const name = a.Exercise?.Name || "Activity";
        const variation = a.Variation || a.Exercise?.Combinations || "";
        const fullName = variation ? `${name} (${variation})` : name;
        if (!exerciseMinutes[fullName]) exerciseMinutes[fullName] = 0;
        exerciseMinutes[fullName] += (a.DurationMinutes || 0);
      });

      const rankedExercises = Object.entries(exerciseMinutes)
        .sort(([, a], [, b]) => b - a)
        .filter(([, mins]) => mins > 0)
        .map(([name, mins]) => [name, `${mins} min`]);

      let finalY = doc.lastAutoTable.finalY + 10;
      if (finalY > 240) {
        doc.addPage();
        finalY = 15;
      }

      doc.setFontSize(18);
      doc.setTextColor(31, 41, 55);
      doc.text("Exercise Volume Ranking", 14, finalY);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Total minutes per exercise within selected period.", 14, finalY + 5);

      autoTable(doc, {
        startY: finalY + 10,
        head: [["Exercise / Activity", "Total Accumulated Time"]],
        body: rankedExercises,
        theme: 'striped',
        headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] },
      });

      doc.save(`Training_Report_${teamName}_${periodText.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  // Prepare data for plan overview (filtered)
  const planChartData = buildCategoryChartData(filteredActivities);

  const planTotalSessions = filteredSessions.length;
  const planTotalDuration = calcRealDuration(filteredActivities);
  const planUniqueDaysCount = new Set(filteredSessions.map((s) => s.Date.split("T")[0]))
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
      {/* Plan Selector & Header */}
      <div className="flex flex-col gap-4 bg-[#1f2937] p-4 sm:p-5 rounded-xl border border-gray-700 shadow-lg">
        <div className="md:flex md:items-end justify-between gap-4">
          <div className="flex flex-col flex-1 gap-1.5 mb-4 md:mb-0">
            <label className="text-gray-400 font-bold text-sm uppercase tracking-widest ml-1">Plan:</label>
            <select
              value={selectedPlanId || ""}
              onChange={handlePlanChange}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 text-base font-bold focus:ring-2 focus:ring-[#B2E642] focus:border-transparent outline-none transition-all lg:text-lg"
            >
              {plans.map((plan) => (
                <option key={plan.Id} value={plan.Id}>
                  {plan.TeamName} ({plan.Year})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 h-full min-h-[50px]">
            {/* Desktop-only PDF button next to Select */}
            <button
              onClick={generatePDF}
              className="hidden sm:flex flex-1 sm:flex-none items-center justify-center gap-2 bg-[#B2E642] hover:bg-[#a1d13b] text-black font-bold h-[50px] px-8 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#B2E642]/10"
              title="Generate PDF Report"
            >
              <FontAwesomeIcon icon={faFilePdf} />
              <span className="text-base">Export PDF</span>
            </button>

            {/* Filter Toggle Button (Mobile Only) */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className={`sm:hidden flex-1 flex items-center justify-center gap-2 h-[50px] px-5 rounded-lg transition-all border ${showFiltersMobile
                ? "bg-[#B2E642] text-black border-[#B2E642]"
                : (startDate || endDate) && !isFullPlanActive
                  ? "bg-gray-800 text-[#B2E642] border-[#B2E642]"
                  : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"
                }`}
            >
              <FontAwesomeIcon icon={showFiltersMobile ? faTimes : faFilter} className={showFiltersMobile ? "text-black" : "text-[#B2E642]"} />
              <span className="text-base font-bold uppercase tracking-wider">Filters</span>
            </button>
          </div>
        </div>

        {/* Filters Section (Sheet on mobile, Grid on desktop) */}
        {!isMobile ? (
          <div className="pt-5 border-t border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
              {/* Start Date */}
              <div className="flex flex-col gap-2 group">
                <label className="text-gray-400 font-bold text-sm uppercase tracking-widest ml-1">Start Date:</label>
                <div
                  onClick={() => {
                    try { document.getElementById('start-date-input').showPicker(); }
                    catch (e) { document.getElementById('start-date-input').focus(); }
                  }}
                  className="relative flex items-center bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 cursor-pointer hover:border-[#B2E642]/50 transition-all group-focus-within:border-[#B2E642] group-focus-within:ring-2 group-focus-within:ring-[#B2E642]/20"
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-[#B2E642] mr-3 text-base opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-white text-base font-medium">
                    {startDate ? format(new Date(startDate + "T00:00:00"), "dd MMM yyyy") : "Select date"}
                  </span>
                  <input
                    id="start-date-input"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-2 group">
                <label className="text-gray-400 font-bold text-sm uppercase tracking-widest ml-1">End Date:</label>
                <div
                  onClick={() => {
                    try { document.getElementById('end-date-input').showPicker(); }
                    catch (e) { document.getElementById('end-date-input').focus(); }
                  }}
                  className="relative flex items-center bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 cursor-pointer hover:border-[#B2E642]/50 transition-all group-focus-within:border-[#B2E642] group-focus-within:ring-2 group-focus-within:ring-[#B2E642]/20"
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-[#B2E642] mr-3 text-base opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-white text-base font-medium">
                    {endDate ? format(new Date(endDate + "T00:00:00"), "dd MMM yyyy") : "Select date"}
                  </span>
                  <input
                    id="end-date-input"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 lg:col-span-2">
                <button
                  onClick={setLast30Days}
                  className={`flex-1 font-bold py-3.5 px-4 rounded-xl border transition-all active:scale-[0.97] ${isLast30Active
                    ? "bg-[#B2E642] text-black border-[#B2E642]"
                    : "bg-[#1e293b] hover:bg-[#334155] text-slate-300 border-slate-700"
                    }`}
                >
                  Last 30d
                </button>
                <button
                  onClick={setLast90Days}
                  className={`flex-1 font-bold py-3.5 px-4 rounded-xl border transition-all active:scale-[0.97] ${isLast90Active
                    ? "bg-[#B2E642] text-black border-[#B2E642]"
                    : "bg-[#1e293b] hover:bg-[#334155] text-slate-300 border-slate-700"
                    }`}
                >
                  Last 90d
                </button>
                <button
                  onClick={clearFilter}
                  className={`flex-1 font-bold py-3.5 px-4 rounded-xl border transition-all active:scale-[0.97] ${isFullPlanActive
                    ? "bg-[#B2E642] text-black border-[#B2E642]"
                    : "bg-[#1e293b] hover:bg-[#334155] text-slate-300 border-slate-700"
                    }`}
                  title="Reset to Full Plan"
                >
                  Full Plan
                </button>
              </div>
            </div>
          </div>
        ) : (
          showFiltersMobile && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFiltersMobile(false)}></div>
              <div className="relative bg-[#1f2937] w-full rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Filter Period</h3>
                  <button onClick={() => setShowFiltersMobile(false)} className="text-gray-400 h-10 w-10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-400 font-bold text-xs uppercase tracking-widest ml-1">Start Date</label>
                      <div
                        onClick={() => document.getElementById('start-date-input-mobile').showPicker()}
                        className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 flex items-center gap-3"
                      >
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-[#B2E642] text-lg" />
                        <span className="text-white text-base font-bold">
                          {startDate ? format(new Date(startDate + "T00:00:00"), "dd/MM/yy") : "Start"}
                        </span>
                        <input
                          id="start-date-input-mobile"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="absolute opacity-0 pointer-events-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-400 font-bold text-xs uppercase tracking-widest ml-1">End Date</label>
                      <div
                        onClick={() => document.getElementById('end-date-input-mobile').showPicker()}
                        className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 flex items-center gap-3"
                      >
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-[#B2E642] text-lg" />
                        <span className="text-white text-base font-bold">
                          {endDate ? format(new Date(endDate + "T00:00:00"), "dd/MM/yy") : "End"}
                        </span>
                        <input
                          id="end-date-input-mobile"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="absolute opacity-0 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={setLast30Days}
                      className={`py-4 rounded-xl text-xs font-bold border transition-all ${isLast30Active
                        ? "bg-[#B2E642] text-black border-[#B2E642]"
                        : "bg-[#1e293b] text-slate-300 border-slate-700"
                        }`}
                    >
                      Last 30d
                    </button>
                    <button
                      onClick={setLast90Days}
                      className={`py-4 rounded-xl text-xs font-bold border transition-all ${isLast90Active
                        ? "bg-[#B2E642] text-black border-[#B2E642]"
                        : "bg-[#1e293b] text-slate-300 border-slate-700"
                        }`}
                    >
                      Last 90d
                    </button>
                    <button
                      onClick={clearFilter}
                      className={`py-4 rounded-xl text-xs font-bold border transition-all ${isFullPlanActive
                        ? "bg-[#B2E642] text-black border-[#B2E642]"
                        : "bg-[#1e293b] text-slate-300 border-slate-700"
                        }`}
                    >
                      Full Plan
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-700/50">
                    <button
                      onClick={() => { generatePDF(); setShowFiltersMobile(false); }}
                      className="flex items-center justify-center gap-2 bg-[#B2E642] hover:bg-[#a1d13b] text-black font-bold py-4 rounded-xl shadow-md transform active:scale-[0.98]"
                    >
                      <FontAwesomeIcon icon={faFilePdf} />
                      <span className="text-base">Export PDF</span>
                    </button>
                    <button
                      onClick={() => setShowFiltersMobile(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transform active:scale-[0.98]"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Plan Overview</h3>
                <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-[#B2E642] text-xs" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    {isFullPlanActive ? "Full Plan: " : "Analyzing: "}
                    {startDate ? format(new Date(startDate + "T00:00:00"), "dd MMM yyyy") : "..."} - {endDate ? format(new Date(endDate + "T00:00:00"), "dd MMM yyyy") : "..."}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:flex lg:flex-col gap-3 sm:gap-4">
                  <div className="bg-[#111827] p-3 sm:p-4 rounded-xl border border-gray-700 col-span-2 lg:col-span-1">
                    <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider font-semibold mb-3">
                      Total Work
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#B2E642]">
                          {planTotalSessions}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">
                          Sessions
                        </p>
                      </div>
                      <div className="w-px h-8 bg-gray-700" />
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
                  <div className="bg-[#111827] p-3 sm:p-4 rounded-xl border border-gray-700 col-span-2 lg:col-span-1">
                    <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider font-semibold mb-1">
                      Total Duration
                    </p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#B2E642]">
                      {planTotalDuration} <span className="text-xs font-normal">min</span>
                    </p>
                  </div>
                </div>

                {/* PieChart */}
                <div className="h-[420px] sm:h-[450px] lg:h-[480px] w-full flex flex-col items-center">
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={planChartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={isMobile ? 65 : 80}
                        outerRadius={isMobile ? 90 : 120}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ percent, value }) =>
                          !isMobile
                            ? `${(percent * 100).toFixed(0)}% (${value}min)`
                            : ""
                        }
                        labelLine={false}
                        onClick={handleCategoryClick}
                        style={{
                          fontSize: "13px",
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
                      <Legend
                        wrapperStyle={{
                          paddingTop: "15px",
                          fontSize: isMobile ? "11px" : "12px",
                          width: "100%"
                        }}
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value) => {
                          const maxLength = isMobile ? 15 : 30;
                          const displayName =
                            value.length > maxLength
                              ? value.substring(0, maxLength) + "..."
                              : value;
                          return <span className="text-gray-400 font-medium">{displayName}</span>;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {!showCategoryModal && (
                    <p className="text-center text-gray-500 text-[10px] sm:text-xs mt-4 opacity-60 italic">
                      Click on a segment to view category details
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === VIEW_MODES.MONTHS && (
            <MonthView sessions={filteredSessions} onMonthClick={handleMonthClick} />
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
                const categoryActivities = filteredActivities.filter(
                  (a) => a.Category?.Name === modalCategoryData.name,
                );
                const categorySessions = filteredSessions.filter((session) =>
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
                    const categoryActivities = filteredActivities.filter(
                      (a) => a.Category?.Name === modalCategoryData.name,
                    );
                    const exerciseBreakdown = categoryActivities.reduce(
                      (acc, activity) => {
                        let exerciseName = activity.Exercise?.Name || "Unknown";
                        if (activity.Variation) {
                          exerciseName = `${exerciseName} (${activity.Variation})`;
                        } else if (activity.Exercise?.Combinations) {
                          exerciseName = `${exerciseName} (${activity.Exercise.Combinations})`;
                        }

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
                      .filter((a) => a.Variation || a.Exercise?.Combinations)
                      .map((a) => a.Variation || a.Exercise.Combinations),
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
