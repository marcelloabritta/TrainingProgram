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

  // New state for variation
  const [selectedVariation, setSelectedVariation] = useState("");
  const [availableVariations, setAvailableVariations] = useState([]);

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
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) throw authError;
          const userId = user.id;

          const { data, error } = await supabase
            .from("Categories")
            .select("Id, Name")
            .or(`UserId.is.null,UserId.eq.${userId}`)
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
        // Note: setting exerciseId and variation happens after exercises load or if we pass it directly
        // But we rely on category change effect to load exercises.
      } else {
        setFormat("Drill");
        setCategoryId("");
        setExerciseId("");
        setDuration(15);
        setSelectedVariation("");
        setAvailableVariations([]);
      }
    }
  }, [isOpen, activityToEdit, isEditMode]);

  useEffect(() => {
    // Se a categoria for limpa, limpe os exercícios
    if (!categoryId) {
      setExercises([]);
      setExerciseId("");
      setSelectedVariation("");
      setAvailableVariations([]);
      return;
    }

    const fetchExercises = async () => {
      setLoadingExercises(true);
      setExercises([]);
      // Don't reset exerciseId immediately if editing, we want to match it
      if (!isEditMode) {
        setExerciseId("");
        setSelectedVariation("");
        setAvailableVariations([]);
      }

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const userId = user.id;

        const { data, error } = await supabase
          .from("Exercises")
          .select("Id, Name, Combinations, Variations") // Fetch Variations
          .eq("CategoryId", categoryId)
          .or(`UserId.is.null,UserId.eq.${userId}`)
          .order("Name");

        if (error) throw error;
        setExercises(data || []);

        // Re-seleciona o exercício certo no modo de edição
        if (isEditMode && activityToEdit.CategoryId === categoryId) {
          setExerciseId(activityToEdit.ExerciseId);
          // Set variation if exists
          if (activityToEdit.Variation) {
            setSelectedVariation(activityToEdit.Variation);
          } else {
            setSelectedVariation("");
          }

          // Also set available variations for the selected exercise
          const selectedEx = data.find(ex => ex.Id === activityToEdit.ExerciseId);
          if (selectedEx) {
            if (selectedEx.Variations && Array.isArray(selectedEx.Variations)) {
              setAvailableVariations(selectedEx.Variations);
            } else if (selectedEx.Combinations) {
              // Fallback for legacy
              setAvailableVariations([selectedEx.Combinations]);
            } else {
              setAvailableVariations([]);
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingExercises(false);
      }
    };
    fetchExercises();
  }, [categoryId, isEditMode, activityToEdit]);

  // When exercise changes, update available variations
  const handleExerciseChange = (newExerciseId) => {
    setExerciseId(newExerciseId);
    const selectedEx = exercises.find(ex => ex.Id === newExerciseId);
    setSelectedVariation(""); // Reset selection

    if (selectedEx) {
      if (selectedEx.Variations && Array.isArray(selectedEx.Variations) && selectedEx.Variations.length > 0) {
        setAvailableVariations(selectedEx.Variations);
        // Auto-select first one? Maybe not, force user to choose.
      } else if (selectedEx.Combinations) {
        setAvailableVariations([selectedEx.Combinations]);
      } else {
        setAvailableVariations([]);
      }
    } else {
      setAvailableVariations([]);
    }
  };

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

    // Validate variation if available
    if (availableVariations.length > 0 && !selectedVariation) {
      setError("Please select a variation for this activity.");
      return;
    }

    const activityData = {
      Format: format,
      DurationMinutes: parseInt(duration),
      CategoryId: categoryId,
      ExerciseId: exerciseId,
      Variation: selectedVariation || null // Add variation to payload
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
              onChange={(e) => handleExerciseChange(e.target.value)}
              required
              disabled={loadingExercises || !categoryId}
              className={`w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#B2E642] ${!categoryId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">{loadingExercises ? "Loading..." : "Select an activity"}</option>
              {exercises.map(ex => (
                <option key={ex.Id} value={ex.Id}>
                  {ex.Name}{((ex.Variations && ex.Variations.length > 0) || ex.Combinations) ? ' (Combined)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Variation Selector */}
          {availableVariations.length > 0 && (
            <div className="bg-gray-800 p-3 rounded border border-gray-600">
              <label htmlFor="variation" className="block text-sm font-medium text-[#B2E642] mb-1">
                Select Variation / Option
              </label>
              <select
                id="variation"
                value={selectedVariation}
                onChange={(e) => setSelectedVariation(e.target.value)}
                required
                className="w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#B2E642]"
              >
                <option value="">Select a variation</option>
                {availableVariations.map((v, idx) => (
                  <option key={idx} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )}

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
