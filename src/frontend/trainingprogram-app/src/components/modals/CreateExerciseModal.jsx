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
  const [newVariation, setNewVariation] = useState("");

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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
        setNewVariation("");
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

  const handleAddVariation = (e) => {
    e.preventDefault(); // Prevent form submission
    if (newVariation.trim()) {
      if (!variations.includes(newVariation.trim())) {
        setVariations([...variations, newVariation.trim()]);
        setNewVariation("");
      }
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
              This is a Combined/Complex Activity (Variations)
            </label>
          </div>

          {isCombined && (
            <div className="bg-gray-750 p-3 rounded-md border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-2">Variations / Options</label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newVariation}
                  onChange={(e) => setNewVariation(e.target.value)}
                  placeholder="Ex: Variation 1"
                  className="flex-1 p-2 bg-[#303E52] text-white rounded border border-gray-600 focus:border-[#B2E642] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddVariation}
                  className="bg-[#B2E642] text-gray-900 font-bold px-3 py-2 rounded hover:bg-[#a3d43d]"
                >
                  Add
                </button>
              </div>

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
      </div>
      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
}

export default CreateExerciseModal;
