import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import PlanCard from "../components/plan/PlanCard";
import EmptyState from "./../components/ui/EmptyState";
import CreatePlanButton from "../components/ui/CreatePlanButton";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import EditPlanModal from "../components/modals/EditPlanModal";
import { usePlans } from "../hooks/usePlans";
import { format } from "date-fns";
import { useHeader } from "../context/HeaderContext";


function DashBoard({ session }) {
  const { plans, loading, error, deletePlan, updatePlan } = usePlans(session);
  const { setTitle } = useHeader();

  useEffect(() => {
    setTitle("My Plans");
  }, [setTitle]);

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
    if(!planToEdit) return;

    const user = session?.user;

    const dataForSupabase = {
      TeamName: updatedData.TeamName,
      CoachName: updatedData.CoachName,
      Year: updatedData.StartDate.getFullYear(),
      StartDate: format(updatedData.StartDate, 'yyyy-MM-dd'),
      Duration: updatedData.Duration,
      UserId: user.id
    }
    await updatePlan(planToEdit.Id, dataForSupabase);
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
    <>
    {/* O conteúdo que antes estava dentro de <main> */}
    {plans.length === 0 ? (
      <EmptyState />
    ) : (
      <>
        <div className="flex flex-col gap-6">
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

    <ConfirmationModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={handleConfirmDelete}
      title="Confirm Deletion"
      message={`Are you sure you want to delete the plan for the ${planToDelete?.Year} season? This action cannot be undone.`}
    />
    <EditPlanModal 
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      planData={planToEdit}
      onSave={handleUpdatePlan}
    />
  </>
  );
}

export default DashBoard;
