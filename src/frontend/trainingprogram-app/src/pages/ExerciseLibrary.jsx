import React, { useEffect, useState } from "react";
import { useHeader } from "../context/HeaderContext";
import { supabase } from "../config/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import CreateExerciseModal from "../components/modals/CreateExerciseModal";
import CategoryCard from "../components/plan/CategoryCard";
import CreateCategoryModal from "../components/modals/CreateCategoryModal";
import EditCategoryModal from "../components/modals/EditCategoryModal";
import ConfirmationModal from './../components/modals/ConfirmationModal';

function ExerciseLibrary() {
  const { setTitle, setShowBackButton } = useHeader();

  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null)

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);

  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [exerciseToEdit, setExerciseToEdit] = useState(null);
  const [isDeleteExerciseModalOpen, setIsDeleteExerciseModalOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);

  const [preselectedCategoryId, setPreselectedCategoryId] = useState(null);


  const openCreateCategoryModal = () => setIsCategoryModalOpen(true);
  const closeCreateCategoryModal = () => setIsCategoryModalOpen(false);

  const openCreateExerciseModal = (categoryId) => {
    setPreselectedCategoryId(categoryId);
    setExerciseToEdit(null);
    setIsExerciseModalOpen(true);
  };

  const openEditExerciseModal = (exercise) => {
    setPreselectedCategoryId(null); // Não precisamos disso aqui
    setExerciseToEdit(exercise); // Define QUEM vamos editar
    setIsExerciseModalOpen(true); // Abre o MESMO modal
  };

  const closeCreateExerciseModal = () => {
    setIsExerciseModalOpen(false);
    setPreselectedCategoryId(null);
    setExerciseToEdit(null);
  };

  const openDeleteExerciseModal = (exercise) => {
    setExerciseToDelete(exercise);
    setIsDeleteExerciseModalOpen(true);
  };
  const closeDeleteExerciseModal = () => {
    setExerciseToDelete(null);
    setIsDeleteExerciseModalOpen(false);
  };

  const openEditCategoryModal = (category) => {
    setCategoryToEdit(category);
    setIsEditCategoryModalOpen(true);
  };

  const closeEditCategoryModal = () => {
    setCategoryToEdit(null);
    setIsEditCategoryModalOpen(false);
  };

  const openDeleteCategoryModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryModalOpen(true);
  };

  const closeDeleteCategoryModal = () => {
    setCategoryToDelete(null);
    setIsDeleteCategoryModalOpen(false);
  };

  useEffect(() => {
    setTitle("Library");
    setShowBackButton(true);

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        setCurrentUser(user);

        const { data, error } = await supabase
          .from("Categories")
          .select(`
            *,
            Exercises ( * ) 
          `)
          .or(`UserId.is.null,UserId.eq.${user.id}`)
          .order("Name", { ascending: true });

        if (error) throw error;
        if (data) {
          setCategoriesData(data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => setShowBackButton(false);
  }, [setTitle, setShowBackButton]);

  const handleCreateCategory = (newCategory) => {
    setCategoriesData(current => [...current, newCategory].sort((a, b) => a.Name.localeCompare(b.Name)));
    closeCreateCategoryModal();
  };

  const handleCreateExercise = async (newExerciseData) => {
    try {

      const dataToInsert = {
        ...newExerciseData,
        UserId: currentUser.id
      };

      const { data, error } = await supabase
        .from("Exercises")
        .insert(dataToInsert)
        .select("*, Category:Categories ( Name )")
        .single();
      if (error) throw error;

      const newExercise = data;

      if (newExercise) {
        setCategoriesData(currentCategories => {
          return currentCategories.map(category => {
            if (category.Id === newExercise.CategoryId) {
              return {
                ...category,
                Exercises: [...category.Exercises, newExercise]
              };
            }

            return category;
          });
        });

        // 3. Fecha o modal
        closeCreateExerciseModal();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateExercise = async (exerciseId, updatedData) => {
    try {
      const { data: updatedExercise, error } = await supabase
        .from("Exercises")
        .update(updatedData)
        .eq("Id", exerciseId)
        .select()
        .single();

      if (error) throw error;

      if (updatedExercise) {
        setCategoriesData(currentCategories =>
          currentCategories.map(category => {
            if (category.Id === updatedExercise.CategoryId) {
              return {
                ...category,
                Exercises: category.Exercises.map(ex =>
                  ex.Id === updatedExercise.Id ? updatedExercise : ex
                )
              };
            }
            return category;
          })
        );
        closeCreateExerciseModal();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete) return;
    try {
      const { error } = await supabase
        .from("Exercises")
        .delete()
        .eq("Id", exerciseToDelete.Id);

      if (error) throw error;

      setCategoriesData(currentCategories =>
        currentCategories.map(category => {
          if (category.Id === exerciseToDelete.CategoryId) {
            return {
              ...category,
              Exercises: category.Exercises.filter(ex =>
                ex.Id !== exerciseToDelete.Id
              )
            };
          }
          return category;
        })
      );
      closeDeleteExerciseModal();

    } catch (err) {
      setError(err.message);
    }
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategoriesData(current =>
      current.map(cat =>
        cat.Id === updatedCategory.Id ? updatedCategory : cat
      )
    );
    closeEditCategoryModal(); // Fecha o modal
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const { error } = await supabase
        .from("Categories")
        .delete()
        .eq("Id", categoryToDelete.Id);

      if (error) throw error;

      setCategoriesData(current =>
        current.filter(cat => cat.Id !== categoryToDelete.Id)
      );
      closeDeleteCategoryModal();

    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleCategory = (categoryId) => {
    setExpandedCategoryId(currentId =>
      currentId === categoryId ? null : categoryId
    );
  };

  if (loading) return <p className="text-white p-6 text-center">Loading...</p>;
  if (error) return <p className="text-red-600 p-6 text-center">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={openCreateCategoryModal}
        className="fixed bottom-30 right-6 md:bottom-8 md:right-8 
                         flex items-center justify-center 
                         w-16 h-16 bg-[#B2E642] rounded-full text-[#111827] 
                         shadow-lg hover:bg-[#81ad22] transition-all duration-300 transform hover:scale-110"
      >
        <FontAwesomeIcon icon={faPlus} className="text-xl" />
      </button>

      <div className="space-y-4">

        {categoriesData && categoriesData.length > 0 ? (
          // ---- Parte VERDADEIRA (se a lista NÃO está vazia) ----
          categoriesData.map((category) => (
            <CategoryCard
              key={category.Id}
              category={category}
              currentUser={currentUser}
              isExpanded={expandedCategoryId === category.Id}
              onToggle={() => handleToggleCategory(category.Id)}
              onEditCategory={() => openEditCategoryModal(category)}
              onDeleteCategory={() => openDeleteCategoryModal(category)}
              onCreateExercise={() => openCreateExerciseModal(category.Id)}
              onEditExercise={(exercise) => openEditExerciseModal(exercise)}
              onDeleteExercise={(exercise) => openDeleteExerciseModal(exercise)}
            />
          ))
        ) : (
          <div className="text-center bg-[#1f2937] border-2 border-dashed border-gray-600 text-gray-400 rounded-lg p-8">
            <p className="font-semibold">No categories added yet.</p>
            <p className="text-sm mt-1">
              Click the '+' button to add the first one.
            </p>
          </div>
        )}
      </div>

      {isExerciseModalOpen && (
        <CreateExerciseModal
          isOpen={isExerciseModalOpen}
          onClose={closeCreateExerciseModal}
          onCreate={handleCreateExercise}
          onUpdate={handleUpdateExercise}
          exerciseToEdit={exerciseToEdit}
          preselectedCategoryId={preselectedCategoryId}
        />
      )}
      {isDeleteExerciseModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteExerciseModalOpen}
          onClose={closeDeleteExerciseModal}
          onConfirm={confirmDeleteExercise}
          title="Delete Activity"
          message={`Are you sure you want to delete the activity "${exerciseToDelete?.Name}"? This will also remove it from all training plans where it is used. This action cannot be undone`}
        />
      )}

      {isCategoryModalOpen && (
        <CreateCategoryModal
          isOpen={isCategoryModalOpen}
          onClose={closeCreateCategoryModal}
          onCategoryCreated={handleCreateCategory}
        />
      )}


      {isEditCategoryModalOpen && (
        <EditCategoryModal
          isOpen={isEditCategoryModalOpen}
          onClose={closeEditCategoryModal}
          onCategoryUpdated={handleCategoryUpdated}
          categoryToEdit={categoryToEdit}
        />
      )}

      {isDeleteCategoryModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteCategoryModalOpen}
          onClose={closeDeleteCategoryModal}
          onConfirm={confirmDeleteCategory}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${categoryToDelete?.Name}"? All exercises inside it, and all related activities in your training plans, will be permanently deleted. This action cannot be undone.`}
        />
      )}
    </div>
  );
}

export default ExerciseLibrary;
