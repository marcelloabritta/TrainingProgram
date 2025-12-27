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
  const [combinations, setCombinations] = useState("");
  const [isCombined, setIsCombined] = useState(false);

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
        setCombinations(exerciseToEdit.Combinations || "");
        setIsCombined(Boolean(exerciseToEdit.Combinations));
      } else {
        setName("");
        setCategoryId(preselectedCategoryId || "");
        setCombinations("");
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

    if (!name || !categoryId) {
      setError("Please fill in the name and category.");
      return;
    }

    const exerciseData = {
      Name: name,
      CategoryId: categoryId,
      Combinations: isCombined ? combinations : null,
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
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
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
              This is a Combined/Complex Activity
            </label>
          </div>

          {isCombined && (
            <div>
              <InputField
                label="Combinations / Internal details"
                type="text"
                placeholder="Ex: Technics + Speed"
                value={combinations}
                className="p-2 bg-[#303E52] mb-5"
                labelClassName="text-sm font-medium text-gray-400 mb-1"
                onChange={(e) => setCombinations(e.target.value)}
              />
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
