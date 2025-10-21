import React, { useEffect, useState } from "react";
import InputField from "../ui/InputField";
import PrimaryButton from "../ui/PrimaryButton";
import FeedbackMessage from './../ui/FeedbackMessage';

function CreateActivityModal({ isOpen, onClose, onActivityCreate, sessionId, activityToEdit, onActivityUpdate}) {

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Technical");
  const [format, setFormat] = useState("Drill");
  const [duration, setDuration] = useState(15);
  const [error, setError] = useState(null);

  const isEditMode = activityToEdit !== null;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setName(activityToEdit.Name);
        setCategory(activityToEdit.Category);
        setFormat(activityToEdit.Format);
        setDuration(activityToEdit.DurationMinutes);
      } else {
        setName("");
        setCategory("Technical");
        setFormat("Drill");
        setDuration(15);
      }
      setError(null);
    }
  }, [isOpen, activityToEdit, isEditMode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("O nome da atividade não pode estar vazio.");
      return;
    }
    if (!duration || parseInt(duration) <= 0) {
      setError("A duração deve ser um número positivo.");
      return;
    }

    const activityData = {
      Name: name,
      Category: category,
      Format: format,
      DurationMinutes: parseInt(duration),
    };

    if (isEditMode) {
      onActivityUpdate(activityToEdit.Id, activityData);
    } else {
      activityData.TrainingSessionId = sessionId;
      onActivityCreate(activityData);
    }
  };
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
          <h2 className="text-xl font-bold">{isEditMode ? "Edit Activity" : "Create New Activity"}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 text-2xl hover:text-white cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <InputField
              label="Activity Name"
              type="text"
              value={name}
              className="p-2 bg-[#303E52]"
              labelClassName="text-sm font-medium text-gray-400 mb-1"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#B2E642]"
            >
              <option value="Technical">Technical</option>
              <option value="Tactical">Tactical</option>
              <option value="Physical">Physical</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="format"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Format
            </label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              required
              className="w-full bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#B2E642]"
            >
              <option value="WarmUp">WarmUp</option>
              <option value="Drill">Drill</option>
              <option value="Scrimmage">Scrimmage</option>
              <option value="FriendlyGame">Friendly Game</option>
              <option value="OfficialGame">Official Game</option>
              <option value="Meeting">Meeting</option>
            </select>
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
            {isEditMode ? "Save Changes" : "Create Activity"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}

export default CreateActivityModal;
