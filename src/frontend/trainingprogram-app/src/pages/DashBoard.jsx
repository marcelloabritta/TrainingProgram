import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import PlanCard from "../components/PlanCard";
import EmptyState from "./../components/EmptyState";
import CreatePlanButton from "../components/CreatePlanButton";
import Header from "../components/Header";
import MobileFooter from "../components/MobileFooter";
import ConfirmationModel from "../components/ConfirmationModel";
import EditPlanModel from "../components/EditPlanModel";
import { usePlans } from "../hooks/usePlans";

function DashBoard({ session }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const { plans, loading, error, deletePlan, updatePlan } = usePlans(session);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState(null);
  
  const navigate = useNavigate();

  // 3. As funções de handle agora são simples "intermediários"
  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deletePlan(planToDelete.Id); // Chama a função do hook
    setIsDeleteModalOpen(false);
    setPlanToDelete(null);
  };

  const handleEditClick = (plan) => {
    setPlanToEdit(plan);
    setIsEditModalOpen(true);
  };

  const handleUpdatePlan = async (updatedData) => {
    await updatePlan(planToEdit.Id, updatedData);
    setIsEditModalOpen(false);
    setPlanToEdit(null);
  };

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
        <Header title="My Plans" />

        <main className="flex-grow p-6 ">
          {plans.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="flex flex-col gap-6  ">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.Id}
                    year={plan.Year}
                    teamName={plan.TeamName}
                    coachName={plan.CoachName}
                    weekCount={plan.Microcycles ? plan.Microcycles.length : 0}
                    onDeleteClick={() => handleDeleteClick(plan)}
                    onEditClick={() => handleEditClick(plan)}
                    onCardClick={() => navigate(`/dashboard/${plan.Id}`)}
                  />
                ))}
              </div>
              <CreatePlanButton />
            </>
          )}
        </main>

        <MobileFooter currentPath={currentPath} />
      </div>
      <ConfirmationModel
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the plan for the ${planToDelete?.Year} season? This action cannot be undone.`}
      />
      <EditPlanModel 
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      planData={planToEdit}
      onSave={handleUpdatePlan}
      />
    </div>
  );
}

export default DashBoard;
