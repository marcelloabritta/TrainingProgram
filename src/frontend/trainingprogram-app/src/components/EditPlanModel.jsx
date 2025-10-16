import React, { useEffect, useState } from 'react'
import InputField from './InputField';
import PrimaryButton from './PrimaryButton';

function EditPlanModel({isOpen, onClose, planData, onSave}) {
  const [year, setYear] = useState('');
  const [teamName, setTeamName] = useState('');
  const [coachName, setCoachName] = useState('');

  useEffect(() => {
    if (planData) {
      setYear(planData.Year);
      setTeamName(planData.TeamName);
      setCoachName(planData.CoachName);
    }
  }, [planData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      Year: year,
      TeamName: teamName,
      CoachName: coachName,
    };
    onSave(updatedData); 
  };

  if (!isOpen) {
    return null;
  }

  return (
            <div className="fixed inset-0 bg-[#1F2937]/90  flex justify-center items-center z-50">
          <div className="bg-[#111827] text-white rounded-lg p-8 shadow-lg w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6">Edit Plan</h2>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <InputField
                  label="Season Year"
                  type="number"
                  value={year}
                  className="p-3 bg-[#303E52] mb-5"
                  onChange={(e) => setYear(e.target.value)}
                />
                <InputField
                  label="Team Name"
                  type="text"
                  value={teamName}
                  className="p-3 bg-[#303E52] mb-5"
                  onChange={(e) => setTeamName(e.target.value)}
                />
                <InputField
                  label="Coach Name"
                  type="text"
                  value={coachName}
                  className="p-3 bg-[#303E52] mb-5"
                  onChange={(e) => setCoachName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button" 
                  onClick={onClose}
                  className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit">Save Changes</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
  )
}

export default EditPlanModel
