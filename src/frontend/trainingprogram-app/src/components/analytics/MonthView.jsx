import React, { useRef } from "react";
import { format, parseISO, startOfMonth } from "date-fns";

function MonthView({ sessions, onMonthClick }) {
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  // Group sessions by month
  const sessionsByMonth = sessions.reduce((acc, session) => {
    const date = parseISO(session.Date);
    const monthKey = format(startOfMonth(date), "yyyy-MM");

    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthDate: startOfMonth(date),
        count: 0,
        sessions: [],
        uniqueDays: new Set(),
        label: format(startOfMonth(date), "MMM yyyy"),
        month: format(startOfMonth(date), "MMMM"),
        year: format(startOfMonth(date), "yyyy"),
      };
    }

    acc[monthKey].count++;
    acc[monthKey].sessions.push(session);
    acc[monthKey].uniqueDays.add(session.Date.split("T")[0]);
    return acc;
  }, {});

  // Sort months ascending (oldest to newest)
  const monthCards = Object.values(sessionsByMonth).sort(
    (a, b) => a.monthDate - b.monthDate,
  );

  const handleMouseDown = (e) => {
    isDraggingRef.current = false;
    startXRef.current = e.pageX || e.touches?.[0]?.pageX || 0;
  };

  const handleMouseMove = (e) => {
    const currentX = e.pageX || e.touches?.[0]?.pageX || 0;
    if (Math.abs(currentX - startXRef.current) > 5) {
      isDraggingRef.current = true;
    }
  };

  const handleCardClick = (monthData) => {
    // Only trigger click if not dragging
    if (!isDraggingRef.current) {
      onMonthClick(monthData.monthDate, monthData.sessions);
    }
    isDraggingRef.current = false;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 ml-1">Monthly Overview</h2>

      {monthCards.length === 0 ? (
        <div className="text-center text-gray-400 p-10 bg-[#1f2937] rounded-xl border border-dashed border-gray-600">
          No works found for this plan.
        </div>
      ) : (
        <>
          {/* Mobile: Swipeable container | Desktop: Grid */}
          <div
            className="md:hidden overflow-x-auto overflow-y-hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitScrollbar: { display: "none" },
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
          >
            <div className="flex gap-3 sm:gap-4 snap-x snap-mandatory pb-2">
              {monthCards.map((monthData, index) => (
                <div
                  key={index}
                  onClick={() => handleCardClick(monthData)}
                  className="flex-shrink-0 w-72 bg-gradient-to-br from-[#1f2937] to-[#111827] p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-gray-700 hover:border-[#B2E642] transition-all cursor-pointer snap-start group shadow-lg hover:shadow-[#B2E642]/20 select-none"
                >
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#B2E642] transition-colors">
                        {monthData.month}
                      </h3>
                      <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {monthData.year}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-6xl font-bold text-[#B2E642]">
                        {monthData.count}
                      </span>
                      <span className="text-gray-400 text-base">sessions</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-[#B2E642]">
                        {monthData.uniqueDays.size}
                      </span>
                      <span className="text-gray-400 text-sm">days</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400 text-sm mt-3 pt-3 border-t border-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 group-hover:text-[#B2E642] transition-colors"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="group-hover:text-white transition-colors">
                        Tap to view details
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {monthCards.map((monthData, index) => (
              <div
                key={index}
                onClick={() =>
                  onMonthClick(monthData.monthDate, monthData.sessions)
                }
                className="bg-gradient-to-br from-[#1f2937] to-[#111827] p-6 rounded-xl border-2 border-gray-700 hover:border-[#B2E642] transition-all cursor-pointer group shadow-lg hover:shadow-[#B2E642]/20"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#B2E642] transition-colors">
                      {monthData.month}
                    </h3>
                    <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {monthData.year}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-6xl font-bold text-[#B2E642]">
                      {monthData.count}
                    </span>
                    <span className="text-gray-400 text-base">sessions</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-[#B2E642]">
                      {monthData.uniqueDays.size}
                    </span>
                    <span className="text-gray-400 text-sm">days</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 text-sm mt-3 pt-3 border-t border-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 group-hover:text-[#B2E642] transition-colors"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="group-hover:text-white transition-colors">
                      Click to view details
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Swipe hint - only on mobile */}
          <p className="md:hidden text-center text-gray-500 text-sm mt-2">
            ← Swipe to see all months →
          </p>
        </>
      )}
    </div>
  );
}

export default MonthView;
