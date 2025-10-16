import React, { useState } from "react";
import Header from "../components/Header";
import MobileFooter from "../components/MobileFooter";
import { useLocation, useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { supabase } from "../config/supabaseClient";
import FeedbackMessage from "../components/FeedbackMessage";

function CreatePlan({ session }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const [year, setYear] = useState("");
  const [teamName, setTeamName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  

  const handleCreatePlan = async (e) => {
    e.preventDefault();

    const user = session?.user;

    if (!user) return;

    const newPlan = {
      Year: year,
      TeamName: teamName,
      CoachName: coachName,
      UserId: user.id,
    };

    const { error } = await supabase
                            .from("Macrocycles")
                            .insert([newPlan]);

    if(error) {
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
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="hidden md:block">
        <SideBar />
      </div>
      <div className="flex flex-col flex-grow">
        <Header title="Create a Plan" />
        <main className="flex-grow p-6">
          <form onSubmit={handleCreatePlan}>
            <InputField
              label="Year"
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="p-3 bg-[#303E52] mb-5"
              labelClassName="text-1xl"
            />
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
            <FeedbackMessage message={message} isError={isError} />
            <PrimaryButton className="w-full p-4 text-2xl">
              Create Plan
            </PrimaryButton>
          </form>
        </main>
        <MobileFooter currentPath={currentPath} />
      </div>
    </div>
  );
}

export default CreatePlan;
