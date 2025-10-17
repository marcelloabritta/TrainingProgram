import React, { useEffect, useState } from "react";
import {  useParams } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import MonthCard from "../components/MonthCard";
import { addMonths, differenceInCalendarMonths, format } from "date-fns";
import { enUS } from 'date-fns/locale';

function PlanDetails() {
  const { planId } = useParams();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedMonths, setGroupedMonths] = useState([]);


  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("Macrocycles")
          .select(
            `
                                                    *,
                                                    Microcycles(*,
                                                    TrainingSessions(*)
                                                    )
                                                    `
          )
          .eq("Id", planId)
          .single();
        if (error) throw error;
        setPlan(data);
      } catch (err) {
        setError(err.message || "Could not fetch the plan details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlanDetails();
  }, [planId]);

  useEffect(() => {
    if(plan && plan.Microcycles && plan.Microcycles.length > 0) {
        const sortedWeeks = [...plan.Microcycles].sort((a, b) => a.WeekNumber - b.WeekNumber);
        const planStartDate = new Date(sortedWeeks[0].StartDate);

        const groups = sortedWeeks.reduce((acc, week) => {
            const monthIndex = differenceInCalendarMonths(new Date(week.StartDate), planStartDate);

            if(!acc[monthIndex]) {
                acc[monthIndex] = [];
            }
            acc[monthIndex].push(week);
            return acc;
        }, {});

        const monthArray = Object.keys(groups).map(index => {
            const monthIndex = parseInt(index);
            const monthName = format(addMonths(planStartDate, monthIndex), 'MMMM yyyy', { locale: enUS});

            return {
                name: monthName,
                weeks: groups[index]
            };
        });
        setGroupedMonths(monthArray);
    }
  }, [plan]);

  if (loading || !plan)
    return <p className="text-white p-6 text-center">Loading  your plan...</p>;
  if (error) return <p className="text-red-600 p-6 text-center">{error}</p>
  if (!plan)
    return <p className="text-yellow-400 p-6 text-center">Plan not found.</p>;

  return (
    <>
    
    <div className="text-center mb-6"> 
      <h1 className="text-[#8DA0B9] font-medium text-xl">
        {plan.TeamName}
      </h1>
    </div>

    
    <div className="flex flex-col gap-6">
      {groupedMonths.map(month => (
        <MonthCard
          key={month.name}
          monthName={month.name}
          weeks={month.weeks}
        />
      ))}
    </div>
  </>
  );
}

export default PlanDetails;
