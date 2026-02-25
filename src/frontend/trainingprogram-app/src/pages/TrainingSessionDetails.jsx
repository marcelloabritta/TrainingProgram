import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import { format } from "date-fns";
import { useHeader } from "../context/HeaderContext";
import ActivityList from "../components/plan/ActivityList";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CreateActivityModal from "../components/modals/CreateActivityModal";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import { calcRealDuration } from "../utils/calcRealDuration";

function TrainingSessionDetails() {
  const { setTitle, setShowBackButton } = useHeader();
  const { sessionId } = useParams();

  const [trainingSession, setTrainingSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [activityToEdit, setActivityToEdit] = useState(null);

  const openCreateModal = () => setIsCreateModalOpen(true);

  const openDeleteModal = (activity) => {
    setActivityToDelete(activity); // Guarda a atividade que foi clicada
    setIsDeleteModalOpen(true); // Abre o modal
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false); // Fecha o modal
    setActivityToDelete(null); // Limpa a memória
  };

  const openEditModal = (activity) => {
    setActivityToEdit(activity);
    openCreateModal();
  };


  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setActivityToEdit(null);
  };

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("TrainingSessions")
          .select("*, Activities(*, Category:Categories (Name), Exercise:Exercises (Name, Combinations), CombinedGroupId)")
          .eq("Id", sessionId)
          .single();

        if (error) throw error;
        setTrainingSession(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessionDetails();
  }, [sessionId]);

  useEffect(() => {
    if (trainingSession) {
      const formattedDate = format(new Date(trainingSession.Date), "MMMM d");

      setTitle(`Training - ${formattedDate}`);
      setShowBackButton(true);
    }
    return () => {
      setShowBackButton(false);
    };
  }, [trainingSession, setTitle, setShowBackButton]);

  if (loading)
    return <p className="text-white p-6 text-center">Loading week...</p>;
  if (error) return <p className="text-red-600 p-6 text-center">{error}</p>;

  const totalDuration = calcRealDuration(trainingSession?.Activities || []);

  const handleCreateActivity = async (newActivityData) => {
    try {
      let finalActivityData = { ...newActivityData };
      const combinedWithIds = newActivityData._combinedWithIds || [];
      const isCombined = newActivityData._isCombined;

      // Remove internal helper fields before sending to Supabase
      delete finalActivityData._combinedWithIds;
      delete finalActivityData._isCombined;

      if (isCombined && combinedWithIds.length > 0) {
        // 1. Find if any peer already has a CombinedGroupId
        const existingGroupedPeer = trainingSession.Activities.find(
          (a) => combinedWithIds.includes(a.Id) && a.CombinedGroupId
        );

        let groupId = existingGroupedPeer?.CombinedGroupId;

        if (!groupId) {
          // 2. No existing group among peers, create a new one
          groupId = crypto.randomUUID();

          // 3. Update peers with this new group ID
          const { error: updatePeersError } = await supabase
            .from("Activities")
            .update({ CombinedGroupId: groupId })
            .in("Id", combinedWithIds);

          if (updatePeersError) throw updatePeersError;

          // 4. Update local state for peers
          setTrainingSession((current) => ({
            ...current,
            Activities: current.Activities.map((a) =>
              combinedWithIds.includes(a.Id)
                ? { ...a, CombinedGroupId: groupId }
                : a
            ),
          }));
        }

        finalActivityData.CombinedGroupId = groupId;
      }

      const { data, error: insertError } = await supabase
        .from("Activities")
        .insert(finalActivityData)
        .select("*, Category:Categories (Name), Exercise:Exercises (Name, Combinations), CombinedGroupId")
        .single();

      if (insertError) throw insertError;

      if (data) {
        setTrainingSession((currentTrainingSession) => ({
          ...currentTrainingSession,
          Activities: [...currentTrainingSession.Activities, data],
        }));
        closeCreateModal();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return; // Segurança

    try {
      const { error } = await supabase
        .from("Activities")
        .delete()
        .eq("Id", activityToDelete.Id);

      if (error) throw error;

      setTrainingSession((currentSession) => ({
        ...currentSession,
        Activities: currentSession.Activities.filter(
          (act) => act.Id !== activityToDelete.Id
        ),
      }));

      closeDeleteModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateActivity = async (activityId, updatedData) => {
    try {
      // Create a copy and remove internal helper fields before sending to Supabase
      const finalData = { ...updatedData };
      delete finalData._combinedWithIds;
      delete finalData._isCombined;

      // 1. Fale com o Supabase para ATUALIZAR
      const { data, error } = await supabase
        .from('Activities')
        .update(finalData)
        .eq('Id', activityId) // Onde o ID bate
        .select('*, Category:Categories (Name), Exercise:Exercises (Name)')
        .single();

      if (error) throw error;

      if (data) {
        // 2. ATUALIZE A TELA (lógica de "substituição")
        setTrainingSession(currentSession => ({
          ...currentSession,
          // Crie um novo array: se o ID bater, use o 'data' novo, senão, mantenha o antigo
          Activities: currentSession.Activities.map(
            act => act.Id === activityId ? data : act
          )
        }));
        closeCreateModal(); // Fecha o modal após o sucesso
      }
    } catch (err) {
      setError(`Error updating activity: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="font-medium text-gray-400 text-xl text-center mt-[-20px]">
        {trainingSession.Period} -{" "}
        <span className="text-[#B2E642]">{totalDuration} min</span>
      </h1>

      <div className="flex flex-col gap-2">
        <button
          onClick={openCreateModal}
          className="fixed bottom-30 right-6 md:bottom-8 md:right-8 
                 flex items-center justify-center 
                 w-16 h-16 bg-[#B2E642] rounded-full text-[#111827] 
                 shadow-lg hover:bg-[#81ad22] transition-all duration-300 transform hover:scale-110"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xl" />
        </button>

        {trainingSession && trainingSession.Activities.length > 0 ? (
          <div className="flex flex-col gap-3">
            {trainingSession.Activities.map((activity) => {
              // Build list of peer activities in same combined group
              const peers = activity.CombinedGroupId
                ? trainingSession.Activities.filter(
                  (a) =>
                    a.CombinedGroupId === activity.CombinedGroupId &&
                    a.Id !== activity.Id
                )
                : [];
              return (
                <ActivityList
                  key={activity.Id}
                  activity={activity}
                  combinedWith={peers}
                  onDelete={() => openDeleteModal(activity)}
                  onEdit={() => openEditModal(activity)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center bg-[#1f2937] border-2 border-dashed border-gray-600 text-gray-400 rounded-lg p-8">
            <p className="font-semibold">No activities added yet.</p>
            <p className="text-sm mt-1">
              Click the '+' button to add the first one.
            </p>
          </div>
        )}
      </div>

      <CreateActivityModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onActivityCreate={handleCreateActivity}
        onActivityUpdate={handleUpdateActivity}
        activityToEdit={activityToEdit}
        sessionId={sessionId}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteActivity}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${activityToDelete?.Name}"? This action cannot be undone.`}
      />
    </div>
  );
}

export default TrainingSessionDetails;
