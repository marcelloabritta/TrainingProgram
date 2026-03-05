import React, { useEffect, useState } from 'react'
import InputField from '../ui/InputField';
import PrimaryButton from '../ui/PrimaryButton';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const renderCustomHeader = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => {
  const years = [];
  for (let i = 1990; i <= new Date().getFullYear() + 10; i++) {
    years.push(i);
  }
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="custom-datepicker-header">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="custom-header-button"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      <div className="custom-header-selectors">
        <select
          value={months[date.getMonth()]}
          onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
          className="custom-header-select"
        >
          {months.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={date.getFullYear()}
          onChange={({ target: { value } }) => changeYear(parseInt(value))}
          className="custom-header-select"
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="custom-header-button"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

function EditPlanModal({ isOpen, onClose, planData, onSave }) {
  const [startDate, setStartDate] = useState(new Date());
  const [duration, setDuration] = useState(52);
  const [teamName, setTeamName] = useState('');
  const [coachName, setCoachName] = useState('');

  useEffect(() => {
    if (planData) {
      setTeamName(planData.TeamName);
      setCoachName(planData.CoachName);
      setStartDate(new Date(planData.StartDate));
      setDuration(planData.Duration);
    }
  }, [planData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      Year: startDate.getFullYear(),
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] p-4">
      <div className="bg-[#111827] border border-gray-700/50 backdrop-blur-xl w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/30">
          <h2 className="text-xl font-bold text-white">Edit Plan</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <InputField
            label="Team Name"
            type="text"
            value={teamName}
            className="p-3 bg-gray-800/50 border-gray-700 focus:border-[#B2E642] text-sm"
            labelClassName="text-gray-400 text-xs font-bold uppercase tracking-widest"
            onChange={(e) => setTeamName(e.target.value)}
          />
          <InputField
            label="Coach Name"
            type="text"
            value={coachName}
            className="p-3 bg-gray-800/50 border-gray-700 focus:border-[#B2E642] text-sm"
            labelClassName="text-gray-400 text-xs font-bold uppercase tracking-widest"
            onChange={(e) => setCoachName(e.target.value)}
          />
          <InputField
            label="Duration Weeks"
            type="number"
            value={duration}
            className="p-3 bg-gray-800/50 border-gray-700 focus:border-[#B2E642] text-sm"
            labelClassName="text-gray-400 text-xs font-bold uppercase tracking-widest"
            onChange={(e) => setDuration(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-xs font-bold uppercase tracking-widest ml-1">Start Date</label>
            <div className="relative group">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-10 py-3 text-white text-sm font-medium focus:border-[#B2E642] outline-none transition-all cursor-pointer"
                dateFormat="dd/MM/yyyy"
                renderCustomHeader={renderCustomHeader}
                portalId="root"
              />
              <FontAwesomeIcon
                icon={faTimes} // Replaced faCalendarAlt for a second to verify icons later, but I'll use faTimes for the close button above and stick to consistent icons
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B2E642] text-sm pointer-events-none hidden" // Hiding icon if it feels cluttered
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-all active:scale-95"
            >
              Cancel
            </button>
            <PrimaryButton className="flex-1 py-3" type="submit">Save</PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPlanModal
