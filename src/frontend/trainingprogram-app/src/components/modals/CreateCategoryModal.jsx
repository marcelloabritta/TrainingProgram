import React, { useState } from "react";
import InputField from "../ui/InputField";
import PrimaryButton from "../ui/PrimaryButton";
import { supabase } from "../../config/supabaseClient";
import FeedbackMessage from "../ui/FeedbackMessage";

function CreateCategoryModal({ isOpen, onClose, onCategoryCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError("Please enter a name.");
      return;
    }

    setIsSaving(true);
    let newCategory = null;

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Usuário não autenticado.");
      }


      const { data, error: insertError } = await supabase
        .from("Categories")
        .insert({
          Name: name,
          UserId: user.id 
        })
        .select() 
        .single();
      
      if (insertError) throw insertError;
      newCategory = data;

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
      if (newCategory) {
        onCategoryCreated(newCategory); 
        setName(""); 
    }
  }
};

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex justify-center items-center p-4">

      <div className="bg-[#1f2937] text-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-white mb-4">New Category</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Name of Category"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 bg-[#303E52]"
            labelClassName="text-sm font-medium text-gray-400 mb-1"
          />
          
          {error && <FeedbackMessage message={error} type="error" />}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <PrimaryButton
              type="submit" 
              className="font-bold py-2"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCategoryModal;
