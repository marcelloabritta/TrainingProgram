import React, { useEffect, useState } from "react";
import InputField from "../ui/InputField";
import PrimaryButton from "../ui/PrimaryButton";
import FeedbackMessage from "./../ui/FeedbackMessage";
import { supabase } from "../../config/supabaseClient";

function CreateActivityModal({
  isOpen,
  onClose,
  onActivityCreate,
  sessionId,
  activityToEdit,
  onActivityUpdate,
}) {
  const [exerciseId, setExerciseId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [format, setFormat] = useState("Drill");
  const [duration, setDuration] = useState(15);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);

  const isEditMode = activityToEdit !== null;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoadingCategories(true);
      setExercises([]);

      const fetchCategories = async () => {
        try {
          const { data, error } = await supabase
            .from("Categories")
            .select("Id, Name")
            .order("Name");
          if (error) throw error;
          setCategories(data || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();

      if (isEditMode) {
        setFormat(activityToEdit.Format);
        setCategoryId(activityToEdit.CategoryId || "");
        setDuration(activityToEdit.DurationMinutes);
      } else {
        setFormat("Drill");
        setCategoryId("");
        setExerciseId("");
        setDuration(15);
      }
    }
  }, [isOpen, activityToEdit, isEditMode]);

  useEffect(() => {
    // Se a categoria for limpa, limpe os exercícios
    if (!categoryId) {
      setExercises([]);
      setExerciseId("");
      return;
    }

    const fetchExercises = async () => {
      setLoadingExercises(true);
      setExercises([]);
      try {
        const { data, error } = await supabase
          .from("Exercises")
          .select("Id, Name")
          .eq("CategoryId", categoryId)
          .order("Name");

        if (error) throw error;
        setExercises(data || []);

        // Re-seleciona o exercício certo no modo de edição
        if (isEditMode && activityToEdit.CategoryId === categoryId) {
          setExerciseId(activityToEdit.ExerciseId);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingExercises(false);
      }
    };
    fetchExercises();
  }, [categoryId, isEditMode, activityToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!duration || parseInt(duration) <= 0) {
      setError("The duration must be a positive number.");
      return;
    }
    if (!exerciseId || !categoryId) {
      setError("Please select a category and an exercise.");
      return;
    }

    const activityData = {
      Format: format,
      DurationMinutes: parseInt(duration),
      CategoryId: categoryId,
      ExerciseId: exerciseId,
    };

    if (isEditMode) {
      onActivityUpdate(activityToEdit.Id, activityData);
    } else {
      activityData.TrainingSessionId = sessionId;
      onActivityCreate(activityData);
    }
  };

  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1f2937] text-white rounded-lg shadow-xl p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditMode ? "Edit Activity" : "Add New Activity"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 text-2xl hover:text-white cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={loadingCategories}
              className="w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#B2E642]"
            >
              <option value="">{loadingCategories ? "Loading..." : "Select a category"}</option>
              {categories.map(cat => (
                <option key={cat.Id} value={cat.Id}>{cat.Name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="exercise" className="block text-sm font-medium text-gray-400 mb-1">
              Activity
            </label>
            <select
              id="exercise"
              value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
              required
              disabled={loadingExercises || !categoryId}
              className={`w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#B2E642] ${!categoryId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">{loadingExercises ? "Loading..." : "Select an exercise"}</option>
              {exercises.map(ex => (
                <option key={ex.Id} value={ex.Id}>{ex.Name}</option>
              ))}
            </select>
          </div>

          <div>
          </div>

          <div>
            <InputField
              label="Duration (minutes)"
              type="number"
              value={duration}
              className="p-2 bg-[#303E52] mb-5"
              labelClassName="text-sm font-medium text-gray-400 mb-1"
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <FeedbackMessage message={error} />
          <PrimaryButton className="font-bold py-2" type="submit">
            {isEditMode ? "Save Changes" : "Save Activity"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}

export default CreateActivityModal;
