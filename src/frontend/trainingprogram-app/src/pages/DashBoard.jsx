import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom";
import SideBar from "../components/SideBar";
import PlanCard from "../components/PlanCard";
import { supabase } from "../config/supabaseClient";
import EmptyState from "./../components/EmptyState";
import CreatePlanButton from "../components/CreatePlanButton";
import Header from "../components/Header";
import MobileFooter from "../components/MobileFooter";

function DashBoard({ session }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = session?.user;
    const fetchPlans = async () => {
      try {

        const { data, error } = await supabase
          .from("Macrocycles")
          .select("*, Microcycles(*)")
          .eq("UserId", user.id);

        if (error) {
          throw error;
        }
        setPlans(data);
      } catch (err) {
        setError("Could not fetch the plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) {
    return <p className="text-white text-center p-10">Loading your plans...</p>;
  }
  if (error) {
    return <p className="text-red-500 text-center p-10">{error}</p>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="hidden md:block">
        <SideBar />
      </div>

      <div className="flex flex-col flex-grow">
        <Header title="My Plans"/>

        <main className="flex-grow p-6">
          {plans.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="flex flex-col gap-6 ">
                {plans.map((plan) => (
                  <Link to={`/dashboard/${plan.Id}`} key={plan.Id}>
                    <PlanCard
                      year={plan.Year}
                      teamName={plan.TeamName}
                      coachName={plan.CoachName}
                      weekCount={plan.Microcycles ? plan.Microcycles.length : 0}
                    />
                  </Link>
                ))}
              </div>
              <CreatePlanButton />
            </>
          )}
        </main>

        <MobileFooter currentPath={currentPath}/>
      </div>
    </div>
  );
}

export default DashBoard;
