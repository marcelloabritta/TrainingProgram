import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/ui/InputField";
import PrimaryButton from "../components/ui/PrimaryButton";
import { supabase } from "../config/supabaseClient";
import FeedbackMessage from "../components/ui/FeedbackMessage";
import { DatePicker } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { add, endOfWeek, format, startOfWeek } from "date-fns";
import Header from "../components/layout/Header";
import { useHeader } from "../context/HeaderContext";


function CreatePlan({ session }) {
  const { setTitle } = useHeader();

  useEffect(() => {
    setTitle("Create a Plan");
  }, [setTitle]);

  const [startDate, setStartDate] = useState(new Date());
  const [duration, setDuration] = useState(52);
  const [teamName, setTeamName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();


  const handleCreatePlan = async (e) => {
    e.preventDefault();
    const user = session?.user;

    if (!user) return;

    const microcyclesToCreate = [];

    const firstWeekStartDate = startDate;

    for (let i = 0; i < duration; i++) {
      const currentweekStartDate = add(firstWeekStartDate, { weeks: i });

      const weekStart = startOfWeek(currentweekStartDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentweekStartDate, { weekStartsOn: 1 });

      const newWeek = {
        WeekNumber: i + 1,
        StartDate: format(weekStart, 'yyyy-MM-dd'),
        EndDate: format(weekEnd, 'yyyy-MM-dd'),
        UserId: user.id

      };
      microcyclesToCreate.push(newWeek);
    }

    const newPlan = {
      Year: startDate.getFullYear(),
      TeamName: teamName,
      CoachName: coachName,
      UserId: user.id,
      Duration: duration,
      StartDate: format(startDate, 'yyyy-MM-dd'),
    };

    const { error } = await supabase
      .rpc('create_plan_with_weeks', {
        plan_data: newPlan,
        weeks_data: microcyclesToCreate
      });

    if (error) {
      console.error("Error from Supabase function:", error);
      setIsError(true);
      setMessage("Failed to create plan. Please try again.")
    } else {
      setIsError(false);
      setMessage("Plan created successfully! Redirecting...");
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500); // Wait 1.5 seconds
    }
  };

  return (
    <form onSubmit={handleCreatePlan}>
      <InputField
        label="Team Name"
        type="text"
        placeholder="Team Name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        className="p-3 bg-[#303E52] mb-5"
        labelClassName="text-1xl"
      />

      <InputField
        label="Coach Name"
        type="text"
        placeholder="Coach Name"
        value={coachName}
        onChange={(e) => setCoachName(e.target.value)}
        className="p-3 bg-[#303E52] mb-5"
        labelClassName="text-1xl"
      />

      <InputField
        label="Duration (weeks)"
        type="number"
        placeholder="Ex: 52"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="p-3 bg-[#303E52] mb-5"
        labelClassName="text-1xl"
      />

      <div className="flex flex-col gap-2">
        <label className="font-medium text-white text-1xl">Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="w-full p-3 mb-7 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-[#B2E642] focus:outline-none"
          dateFormat="MM/dd/yyyy"
        />
      </div>

      <FeedbackMessage message={message} isError={isError} />

      <PrimaryButton className="w-full p-4 text-2xl">
        Create Plan
      </PrimaryButton>
    </form>
  );
}

export default CreatePlan;
