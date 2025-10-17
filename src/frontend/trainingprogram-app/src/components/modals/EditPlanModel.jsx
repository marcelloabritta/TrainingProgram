import React, { useEffect, useState } from 'react'
import InputField from '../InputField';
import PrimaryButton from '../ui/PrimaryButton';
import { newDate } from '../../../node_modules/react-datepicker/src/date_utils';
import DatePicker from 'react-datepicker';

function EditPlanModel({isOpen, onClose, planData, onSave}) {
  const [startDate, setStartDate] = useState(newDate());
  const [duration, setDuration] = useState(52);
  const [teamName, setTeamName] = useState('');
  const [coachName, setCoachName] = useState('');

  useEffect(() => {
    if (planData) {
      setTeamName(planData.TeamName);
      setCoachName(planData.CoachName);
      setStartDate(newDate(planData.StartDate));
      setDuration(planData.Duration);
    }
  }, [planData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      Year: startDate.getFullYear,
      TeamName: teamName,
      CoachName: coachName,
      StartDate: startDate,
      Duration: duration,
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
                <InputField
                label="Duration Weeks"
                type= "number"
                value={duration}
                className="p-3 bg-[#303E52] mb-5"
                onChange={(e) => setDuration(e.target.value)}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium text-white">Start Date</label>
                  <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-[#B2E642] focus:outline-none"
                  dateFormat="dd/MM/yyyy"
                  />
                </div>
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
