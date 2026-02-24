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
  existingActivities = [], // for choosing which to combine with
}) {
  const [exerciseId, setExerciseId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [format, setFormat] = useState("Drill");
  const [duration, setDuration] = useState(15);
  const [error, setError] = useState(null);

  // Variation
  const [selectedVariation, setSelectedVariation] = useState("");
  const [availableVariations, setAvailableVariations] = useState([]);

  const [categories, setCategories] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Combined activity state
  const [isCombined, setIsCombined] = useState(false);
  const [combinedWithIds, setCombinedWithIds] = useState([]); // IDs of activities to combine with

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
        setIsCombined(!!activityToEdit.CombinedGroupId);
        setCombinedWithIds([]);
      } else {
        setFormat("Drill");
        setCategoryId("");
        setExerciseId("");
        setDuration(15);
        setSelectedVariation("");
        setAvailableVariations([]);
        setIsCombined(false);
        setCombinedWithIds([]);
      }
    }
  }, [isOpen, activityToEdit, isEditMode]);

  useEffect(() => {
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
          .select("Id, Name, Combinations, Variations")
          .eq("CategoryId", categoryId)
          .or(`UserId.is.null,UserId.eq.${userId}`)
          .order("Name");

        if (error) throw error;
        setExercises(data || []);

        if (isEditMode && activityToEdit.CategoryId === categoryId) {
          setExerciseId(activityToEdit.ExerciseId);
          if (activityToEdit.Variation) {
            setSelectedVariation(activityToEdit.Variation);
          } else {
            setSelectedVariation("");
          }
          const selectedEx = data.find(ex => ex.Id === activityToEdit.ExerciseId);
          if (selectedEx) {
            if (selectedEx.Variations && Array.isArray(selectedEx.Variations)) {
              setAvailableVariations(selectedEx.Variations);
            } else if (selectedEx.Combinations) {
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

  const handleExerciseChange = (newExerciseId) => {
    setExerciseId(newExerciseId);
    const selectedEx = exercises.find(ex => ex.Id === newExerciseId);
    setSelectedVariation("");

    if (selectedEx) {
      if (selectedEx.Variations && Array.isArray(selectedEx.Variations) && selectedEx.Variations.length > 0) {
        setAvailableVariations(selectedEx.Variations);
      } else if (selectedEx.Combinations) {
        setAvailableVariations([selectedEx.Combinations]);
      } else {
        setAvailableVariations([]);
      }
    } else {
      setAvailableVariations([]);
    }
  };

  const toggleCombineWith = (activityId) => {
    setCombinedWithIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
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
    if (availableVariations.length > 0 && !selectedVariation) {
      setError("Please select a variation for this activity.");
      return;
    }
    if (isCombined && combinedWithIds.length === 0 && !isEditMode) {
      setError("Select at least one activity to combine with.");
      return;
    }

    const activityData = {
      Format: format,
      DurationMinutes: parseInt(duration),
      CategoryId: categoryId,
      ExerciseId: exerciseId,
      Variation: selectedVariation || null,
      // CombinedGroupId is handled by parent for new activities
      _combinedWithIds: isCombined ? combinedWithIds : [],
      _isCombined: isCombined,
    };

    if (isEditMode) {
      onActivityUpdate(activityToEdit.Id, activityData);
    } else {
      activityData.TrainingSessionId = sessionId;
      onActivityCreate(activityData);
    }
  };

  // Eligible activities to combine with (exclude current edit target)
  const eligibleToCombine = existingActivities.filter(
    (a) => !isEditMode || a.Id !== activityToEdit?.Id
  );

  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1f2937] text-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
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
              className={`w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#B2E642] ${!categoryId ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="">{loadingExercises ? "Loading..." : "Select an activity"}</option>
              {exercises.map(ex => (
                <option key={ex.Id} value={ex.Id}>{ex.Name}</option>
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
                  <option key={idx} value={v}>{v}</option>
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

          {/* Combined Activity Toggle */}
          {!isEditMode && eligibleToCombine.length > 0 && (
            <div className="bg-[#111827] rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">🔗 Combined training</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Done simultaneously with another activity
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCombined(!isCombined);
                    setCombinedWithIds([]);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isCombined ? "bg-[#B2E642]" : "bg-gray-600"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isCombined ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>

              {isCombined && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2 font-medium">
                    Select which activities were done at the same time:
                  </p>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                    {eligibleToCombine.map((a) => {
                      const name = a.Exercise?.Name || "Unknown";
                      const checked = combinedWithIds.includes(a.Id);
                      return (
                        <label
                          key={a.Id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${checked
                              ? "bg-[#B2E642]/10 border border-[#B2E642]/40"
                              : "bg-gray-800 border border-gray-700 hover:border-gray-500"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCombineWith(a.Id)}
                            className="accent-[#B2E642] w-4 h-4"
                          />
                          <span className="text-sm text-white">{name}</span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {a.DurationMinutes}m
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

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
