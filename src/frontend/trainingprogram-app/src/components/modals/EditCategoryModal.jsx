import React, { useEffect, useState } from 'react'
import { supabase } from '../../config/supabaseClient';
import PrimaryButton from './../ui/PrimaryButton';
import FeedbackMessage from '../ui/FeedbackMessage';
import InputField from '../ui/InputField';

function EditCategoryModal({isOpen, onClose, onCategoryUpdated, categoryToEdit}) {
    const [name, setName] = useState("");
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if(categoryToEdit) {
            setName(categoryToEdit.Name);
            setError(null);
        }
    }, [categoryToEdit]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if(!name) {
            setError("Please enter a name. ");
            return;
        }

        if(name == categoryToEdit.Name) {
            onClose()
            return;
        }
        
        setIsSaving(true);


        try {
            const {data, error: updateError} = await supabase
                                                    .from("Categories")
                                                    .update({Name: name})
                                                    .eq("Id", categoryToEdit.Id)
                                                    .select()
                                                    .single();
            
            if(updateError) throw updateError;
            
            if(data) {
                onCategoryUpdated(data);
            } 
    } catch(err) {
        setError(err.message);
    } finally {
        setIsSaving(false);
    }
};

if(!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#1F2937]/90  flex justify-center items-center z-50">
      <div className="bg-[#111827] text-white rounded-lg p-8 shadow-lg w-full max-w-sm">
        <h3 className="text-lg font-bold text-white mb-4">Edit Category</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Name of category"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 bg-[#303E52]"
            labelClassName="text-sm font-medium text-gray-400 mb-1"
          />
          
          {error && <FeedbackMessage message={error} />}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <PrimaryButton
              type="submit" 
              className="font-bold py-2"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCategoryModal
