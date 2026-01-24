import React, { useEffect, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import FeedbackMessage from "../ui/FeedbackMessage";
import InputField from "../ui/InputField";
import PrimaryButton from "../ui/PrimaryButton";
import CreateCategoryModal from "./CreateCategoryModal";

function CreateExerciseModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  exerciseToEdit,
  preselectedCategoryId,
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isCombined, setIsCombined] = useState(false);
  const [variations, setVariations] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [exercisesInCategory, setExercisesInCategory] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [selectedExerciseToAdd, setSelectedExerciseToAdd] = useState("");
  const [combinationBuffer, setCombinationBuffer] = useState([]);

  const isEditMode = Boolean(exerciseToEdit);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      // 1. Preenche os campos
      if (isEditMode) {
        setName(exerciseToEdit.Name || "");
        setCategoryId(exerciseToEdit.CategoryId || "");
        // Check if it has Variations (array) or legacy Combinations (string)
        if (exerciseToEdit.Variations && Array.isArray(exerciseToEdit.Variations)) {
          setVariations(exerciseToEdit.Variations);
          setIsCombined(true);
        } else if (exerciseToEdit.Combinations) {
          // Migration for legacy single string combination
          setVariations([exerciseToEdit.Combinations]);
          setIsCombined(true);
        } else {
          setVariations([]);
          setIsCombined(false);
        }
      } else {
        setName("");
        setCategoryId(preselectedCategoryId || "");
        setVariations([]);
        setIsCombined(false);
      }

      const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
          const { data, error } = await supabase
            .from("Categories")
            .select("Id, Name")
            .order("Name");

          if (error) throw error;

          if (data) {
            setCategories(data || []);
          }
        } catch (err) {
          console.error(err.message);
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [isOpen, preselectedCategoryId, exerciseToEdit, isEditMode]);

  useEffect(() => {
    if (isOpen && categoryId && isCombined) {
      const fetchExercises = async () => {
        setLoadingExercises(true);
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) throw authError;
          const userId = user.id;

          const { data, error } = await supabase
            .from("Exercises")
            .select("Id, Name")
            .eq("CategoryId", categoryId)
            .or(`UserId.is.null,UserId.eq.${userId}`)
            .order("Name");

          if (error) throw error;

          // Filter out the current exercise if in edit mode
          const filtered = isEditMode
            ? data.filter(ex => ex.Id !== exerciseToEdit.Id)
            : data;

          setExercisesInCategory(filtered || []);
        } catch (err) {
          console.error("Error fetching exercises:", err.message);
        } finally {
          setLoadingExercises(false);
        }
      };
      fetchExercises();
    } else {
      setExercisesInCategory([]);
      setSelectedExerciseToAdd("");
    }
  }, [isOpen, categoryId, isCombined, isEditMode, exerciseToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // If combined, ensure there is at least one variation? Or just warn?
    // Let's allow creating without variations but maybe show a warning or just save empty []

    if (!name || !categoryId) {
      setError("Please fill in the name and category.");
      return;
    }

    if (isCombined && variations.length === 0) {
      setError("Please add at least one variation for a combined activity.");
      return;
    }

    const exerciseData = {
      Name: name,
      CategoryId: categoryId,
      Combinations: isCombined ? (variations.length > 0 ? variations[0] : "Combined") : null, // Keep legacy field populated just in case for now, or null? User asked for options. Let's put text description or null.
      // Ideally we only use Variations now. But to stay safe let's put "Combined" or the first variation in the old field if it's required by constraints.
      // Actually, let's assume we can just use Variations.
      Variations: isCombined ? variations : null
    };

    try {
      if (isEditMode) {
        await onUpdate(exerciseToEdit.Id, exerciseData);
      } else {
        await onCreate(exerciseData);
      }
    } catch (err) {
      setError(err.message);
    }
  };



  const handleAddExerciseAsVariation = (e) => {
    e.preventDefault();
    if (selectedExerciseToAdd) {
      const ex = exercisesInCategory.find(ex => ex.Id === selectedExerciseToAdd);
      if (ex && !combinationBuffer.includes(ex.Name)) {
        setCombinationBuffer([...combinationBuffer, ex.Name]);
        setSelectedExerciseToAdd("");
      }
    }
  };

  const handleRemoveFromBuffer = (indexToRemove) => {
    setCombinationBuffer(combinationBuffer.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCombineAndAdd = (e) => {
    e.preventDefault();
    if (combinationBuffer.length > 0) {
      const combinedName = combinationBuffer.join(" + ");
      if (!variations.includes(combinedName)) {
        setVariations([...variations, combinedName]);
      }
      setCombinationBuffer([]);
    }
  };

  const handleRemoveVariation = (indexToRemove) => {
    setVariations(variations.filter((_, index) => index !== indexToRemove));
  };

  const handleCategoryCreated = (newCategory) => {
    if (newCategory) {
      setCategories((currentCategories) =>
        [...currentCategories, newCategory].sort((a, b) =>
          a.Name.localeCompare(b.Name)
        )
      );

      setCategoryId(newCategory.Id);

      setIsCategoryModalOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          {isEditMode ? "Edit Activity" : "New Activity"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputField
              label="Name"
              type="text"
              value={name}
              className="p-2 bg-[#303E52] mb-5"
              labelClassName="text-sm font-medium text-gray-400 mb-1"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Toggle for Combinations */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="isCombined"
              checked={isCombined}
              onChange={(e) => setIsCombined(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[#B2E642] focus:ring-[#B2E642]"
            />
            <label htmlFor="isCombined" className="text-sm font-medium text-gray-400 cursor-pointer">
              This is a Combined Activity
            </label>
          </div>

          {isCombined && (
            <div className="bg-gray-750 p-3 rounded-md border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-2">Build Combination from Existing Exercises</label>

              {exercisesInCategory.length > 0 ? (
                <div className="flex gap-2 mb-3">
                  <select
                    value={selectedExerciseToAdd}
                    onChange={(e) => setSelectedExerciseToAdd(e.target.value)}
                    className="flex-1 p-2 bg-[#303E52] text-white rounded border border-gray-600 focus:border-[#B2E642] outline-none"
                  >
                    <option value="">Select existing exercise...</option>
                    {exercisesInCategory.map((ex) => (
                      <option key={ex.Id} value={ex.Id}>
                        {ex.Name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddExerciseAsVariation}
                    disabled={!selectedExerciseToAdd}
                    className="bg-[#303E52] text-[#B2E642] border border-[#B2E642] font-bold px-3 py-2 rounded hover:bg-[#3d4d63] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add to List
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic mb-4">No other exercises found in this category.</p>
              )}

              {/* Combination Buffer Display */}
              {combinationBuffer.length > 0 && (
                <div className="bg-[#1f2937] p-2 rounded border border-dashed border-[#B2E642] mb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {combinationBuffer.map((item, idx) => (
                      <span key={idx} className="bg-[#303E52] text-xs text-[#B2E642] px-2 py-1 rounded flex items-center gap-1 border border-gray-600">
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromBuffer(idx)}
                          className="hover:text-red-400 font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCombineAndAdd}
                    className="w-full bg-[#B2E642] text-gray-900 text-xs font-bold py-1.5 rounded hover:bg-[#a3d43d] transition-all"
                  >
                    {combinationBuffer.length === 1 ? "Add Single Activity" : `Combine as "${combinationBuffer.join(' + ')}"`}
                  </button>
                </div>
              )}

              {variations.length > 0 ? (
                <ul className="space-y-2 mb-2">
                  {variations.map((v, idx) => (
                    <li key={idx} className="flexjustify-between items-center bg-[#1f2937] px-3 py-2 rounded border border-gray-600">
                      <span className="text-white flex-1">{v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariation(idx)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 italic">No variations added yet.</p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#B2E642] text-white"
              disabled={loadingCategories || isEditMode}
              required
            >
              <option value="" className="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select a Category"}
              </option>

              {categories.map((cat) => (
                <option key={cat.Id} value={cat.Id}>
                  {cat.Name}
                </option>
              ))}
            </select>
          </div>
          {!isEditMode && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-sm text-[#B2E642] hover:text-[#81ad22]"
              >
                + New Category
              </button>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <FeedbackMessage message={error} />
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <PrimaryButton className="font-bold py-2" type="submit">
              {isEditMode ? "Save Changes" : "Create"}
            </PrimaryButton>
          </div>
        </form>
      </div >
      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </div >
  );
}

export default CreateExerciseModal;
